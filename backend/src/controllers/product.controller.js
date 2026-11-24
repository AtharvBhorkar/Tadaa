const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Order = require("../models/Order");
const User = require("../models/User");
const PointsLedger = require("../models/PointsLedger");

const REVIEW_POINTS = 10;
const MIN_REVIEW_CHARS = 10;

const PUBLIC_FIELDS = "-costPrice -deodapLink";

exports.getProducts = async (req, res) => {
  const { category, q, page = 1, limit = 12, minPrice, maxPrice, sort, badge, deals } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };
  if (badge) filter.badge = badge;
  if (deals === "true") filter.$expr = { $gt: ["$mrp", "$price"] };

  const min = Number(minPrice);
  const max = Number(maxPrice);
  if ((minPrice && Number.isFinite(min)) || (maxPrice && Number.isFinite(max))) {
    filter.price = {};
    if (minPrice && Number.isFinite(min)) filter.price.$gte = min;
    if (maxPrice && Number.isFinite(max)) filter.price.$lte = max;
  }

  const sortMap = {
    popular: { ratingCount: -1, createdAt: -1 },
    new: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    rating: { rating: -1, ratingCount: -1 },
  };

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(parseInt(limit) || 12, 50);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .select(PUBLIC_FIELDS)
      .sort(sortMap[sort] || sortMap.popular)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
};

exports.getProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).select(PUBLIC_FIELDS);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// used by the cart: fresh price/stock for a list of product ids
exports.getProductsByIds = async (req, res) => {
  const ids = String(req.query.ids || "")
    .split(",")
    .filter((id) => mongoose.isValidObjectId(id))
    .slice(0, 50);
  if (!ids.length) return res.json({ items: [] });
  const items = await Product.find({ _id: { $in: ids } }).select(PUBLIC_FIELDS);
  res.json({ items });
};

exports.getProductReviews = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  const pageNum = Math.max(parseInt(req.query.page) || 1, 1);
  const limitNum = Math.min(parseInt(req.query.limit) || 5, 20);
  const productId = new mongoose.Types.ObjectId(id);

  const [docs, total, stats] = await Promise.all([
    Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("user", "name")
      .lean(),
    Review.countDocuments({ product: productId }),
    Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
  ]);

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  stats.forEach((s) => {
    breakdown[s._id] = s.count;
    sum += s._id * s.count;
  });

  // show only first name + last initial publicly
  const maskName = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return parts[0] || "Customer";
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const items = docs.map((r) => ({
    _id: r._id,
    name: maskName(r.user?.name),
    rating: r.rating,
    text: r.text,
    videoUrl: r.videoUrl,
    createdAt: r.createdAt,
  }));

  res.json({
    items,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    summary: {
      count: total,
      average: total ? Number((sum / total).toFixed(1)) : 0,
      breakdown,
    },
  });
};

exports.createReview = async (req, res) => {
  const { id } = req.params;
  const { orderId } = req.body;
  const rating = Number(req.body.rating);
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(orderId)) {
    return res.status(400).json({ message: "Invalid request" });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Please select a rating from 1 to 5" });
  }
  if (text.length < MIN_REVIEW_CHARS) {
    return res
      .status(400)
      .json({ message: `Please write at least ${MIN_REVIEW_CHARS} characters in your review` });
  }
  if (text.length > 1000) {
    return res.status(400).json({ message: "Review is too long (max 1000 characters)" });
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id, status: "delivered" });
  if (!order) {
    return res.status(400).json({ message: "You can review only delivered orders" });
  }
  if (!order.items.some((i) => String(i.product) === String(id))) {
    return res.status(400).json({ message: "This product is not in that order" });
  }

  let review;
  try {
    review = await Review.create({
      user: req.user._id,
      product: id,
      order: order._id,
      rating,
      text,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already reviewed this item" });
    }
    throw err;
  }

  // points only once per order (unique index on the ledger guards against double clicks)
  let pointsEarned = 0;
  try {
    await PointsLedger.create({
      user: req.user._id,
      change: REVIEW_POINTS,
      reason: "review",
      order: order._id,
    });
    await User.updateOne({ _id: req.user._id }, { $inc: { pointsBalance: REVIEW_POINTS } });
    await Review.updateOne({ _id: review._id }, { pointsGiven: REVIEW_POINTS });
    pointsEarned = REVIEW_POINTS;
  } catch (err) {
    if (err.code !== 11000) throw err;
  }

  // refresh the product's average rating
  const agg = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(id) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (agg[0]) {
    await Product.updateOne(
      { _id: id },
      { rating: Number(agg[0].avg.toFixed(1)), ratingCount: agg[0].count }
    );
  }

  res.status(201).json({ ok: true, pointsEarned });
};

// ---------- admin ----------
exports.adminGetProducts = async (req, res) => {
  const items = await Product.find().sort({ createdAt: -1 });
  res.json({ items, total: items.length });
};

exports.createProduct = async (req, res) => {
  const { title, price } = req.body;
  if (!title || price === undefined) {
    return res.status(400).json({ message: "Title and price are required" });
  }
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// soft delete: product hide hota hai, purane orders ka data safe rehta hai
exports.deleteProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product hidden", id: product._id });
};

// hard delete: permanently hataata hai. Order me use hua ho to rok deta hai
exports.hardDeleteProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  // Order model me items.product (ya productId) ho to is check se delete block hoga
  try {
    const Order = require("../models/Order");
    if (Order.schema && Object.keys(Order.schema.paths).length > 2) {
      const used = await Order.exists({
        $or: [{ "items.product": req.params.id }, { "items.productId": req.params.id }],
      });
      if (used) {
        return res
          .status(409)
          .json({ message: "This product is used in an order. Hide it instead of deleting." });
      }
    }
  } catch {
    // Order model abhi khali hai, skip
  }

  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted", id: product._id });
};