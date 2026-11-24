const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { SHIPPING_FEE, MAX_QTY, MAX_LINES, validateAddress } = require("../utils/orderRules");
const { DEV_FAKE_PAYMENT } = require("../config/env");

const HIDE_COST = "-items.costPrice";

const publicOrder = (order) => {
  const o = order.toObject ? order.toObject() : order;
  o.items.forEach((i) => delete i.costPrice);
  return o;
};

const restoreStock = (items) =>
  Promise.all(items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));

exports.getConfig = (req, res) => {
  res.json({ shippingFee: SHIPPING_FEE, devPayment: DEV_FAKE_PAYMENT });
};

exports.createOrder = async (req, res) => {
  const { items, address } = req.body;

  if (!Array.isArray(items) || !items.length || items.length > MAX_LINES) {
    return res.status(400).json({ message: "Your cart is empty or invalid" });
  }

  // merge duplicate lines and validate every item
  const wanted = new Map();
  for (const it of items) {
    const qty = Number(it?.qty);
    if (!mongoose.isValidObjectId(it?.productId) || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return res.status(400).json({ message: "Invalid cart item" });
    }
    const key = String(it.productId);
    wanted.set(key, Math.min(MAX_QTY, (wanted.get(key) || 0) + qty));
  }

  const { value: addr, error } = validateAddress(address);
  if (error) return res.status(400).json({ message: error });

  // price and availability always come from the database, never from the client
  const products = await Product.find({ _id: { $in: [...wanted.keys()] }, isActive: true });
  if (products.length !== wanted.size) {
    return res
      .status(400)
      .json({ message: "Some items are no longer available. Please review your cart." });
  }

  // reserve stock atomically, roll back if any item is short
  const reserved = [];
  for (const p of products) {
    const qty = wanted.get(String(p._id));
    const r = await Product.updateOne({ _id: p._id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
    if (r.modifiedCount !== 1) {
      await restoreStock(reserved);
      return res.status(409).json({ message: `Not enough stock for "${p.title}"` });
    }
    reserved.push({ product: p._id, qty });
  }

  const lines = products.map((p) => ({
    product: p._id,
    title: p.title,
    image: p.images?.[0] || "",
    price: p.price,
    costPrice: p.costPrice || 0,
    qty: wanted.get(String(p._id)),
  }));
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  try {
    const order = await Order.create({
      user: req.user._id,
      items: lines,
      address: addr,
      subtotal,
      shipping: SHIPPING_FEE,
      total: subtotal + SHIPPING_FEE,
    });
    res.status(201).json(publicOrder(order));
  } catch (err) {
    await restoreStock(reserved);
    throw err;
  }
};

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).select(HIDE_COST);
  res.json({ orders });
};

exports.getOrder = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid order id" });
  }
  const order = await Order.findById(req.params.id);
  const isAdmin = req.user.role === "admin";
  if (!order || (!isAdmin && String(order.user) !== String(req.user._id))) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.json(isAdmin ? order : publicOrder(order));
};

// user can cancel only while payment is pending; stock goes back
exports.cancelOrder = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid order id" });
  }
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, status: "pending_payment" },
    { status: "cancelled" },
    { returnDocument: "after" }
  );
  if (!order) {
    return res.status(400).json({ message: "This order can't be cancelled" });
  }
  await restoreStock(order.items);
  res.json(publicOrder(order));
};

// LOCAL TESTING ONLY (needs DEV_FAKE_PAYMENT=true). Replaced by the payment webhook later.
exports.devPay = async (req, res) => {
  if (!DEV_FAKE_PAYMENT) return res.status(404).json({ message: "Not found" });
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid order id" });
  }
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, status: "pending_payment" },
    { status: "paid", paymentId: `DEV-${Date.now()}`, paidAt: new Date() },
    { returnDocument: "after" }
  );
  if (!order) return res.status(400).json({ message: "This order can't be paid" });
  res.json(publicOrder(order));
};