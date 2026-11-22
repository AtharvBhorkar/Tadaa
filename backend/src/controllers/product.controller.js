const mongoose = require("mongoose");
const Product = require("../models/Product");

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