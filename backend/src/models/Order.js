const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true }, // price at the time of order
    costPrice: { type: Number, default: 0 }, // admin only, never sent to customers
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["shop", "mystery"], default: "shop" },
    items: { type: [itemSchema], required: true },
    address: {
      name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending_payment", "paid", "ordered", "shipped", "delivered", "cancelled"],
      default: "pending_payment",
      index: true,
    },
    paymentId: { type: String, default: "" },
    paidAt: Date,
    trackingId: { type: String, default: "" },
    shippedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);