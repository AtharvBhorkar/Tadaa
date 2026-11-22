const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0, default: 0 },
    images: [{ type: String }],
    category: { type: String, trim: true, default: "General" },
    stock: { type: Number, default: 0, min: 0 },
    deodapLink: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);