const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const NEXT = {
  pending_payment: ["cancelled"],
  paid: ["ordered", "cancelled"],
  ordered: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
const STATUSES = Object.keys(NEXT);

exports.adminGetOrders = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const filter = {};
  if (STATUSES.includes(req.query.status)) filter.status = req.query.status;

  const [orders, total, counts] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email phone")
      .lean(),
    Order.countDocuments(filter),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const withCost = orders.map((o) => ({
    ...o,
    cost: o.items.reduce((s, i) => s + (i.costPrice || 0) * i.qty, 0),
  }));

  res.json({
    orders: withCost,
    total,
    page,
    pages: Math.ceil(total / limit),
    statusCounts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
  });
};

exports.adminUpdateOrder = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid order id" });

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const { status } = req.body;
  const trackingId =
    typeof req.body.trackingId === "string" ? req.body.trackingId.trim().slice(0, 60) : undefined;
  const update = {};

  if (status && status !== order.status) {
    if (!NEXT[order.status]?.includes(status)) {
      return res
        .status(400)
        .json({ message: `Can't move an order from "${order.status}" to "${status}"` });
    }
    update.status = status;
    if (status === "shipped") {
      if (!(trackingId || order.trackingId)) {
        return res.status(400).json({ message: "Tracking ID is required to mark as shipped" });
      }
      update.shippedAt = new Date();
    }
    if (status === "delivered") update.deliveredAt = new Date();
  }

  if (trackingId !== undefined) {
    const finalStatus = update.status || order.status;
    if (trackingId && !["ordered", "shipped", "delivered"].includes(finalStatus)) {
      return res.status(400).json({ message: "Tracking ID can be added after the order is placed" });
    }
    update.trackingId = trackingId;
  }

  if (!Object.keys(update).length) return res.json(order);

  // only update if status is still what we read, avoids two admin tabs clashing
  const updated = await Order.findOneAndUpdate({ _id: id, status: order.status }, update, {
    returnDocument: "after",
  }).populate("user", "name email phone");
  if (!updated) return res.status(409).json({ message: "Order changed meanwhile. Refresh and retry." });

  if (update.status === "cancelled") {
    await Promise.all(
      order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } }))
    );
  }

  const o = updated.toObject();
  o.cost = o.items.reduce((s, i) => s + (i.costPrice || 0) * i.qty, 0);
  res.json(o);
};