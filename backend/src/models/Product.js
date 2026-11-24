const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0, default: 0 },
    mrp: { type: Number, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    badge: { type: String, enum: ["", "new", "best", "rare"], default: "" },
    images: {
      type: [String],
      validate: [(arr) => arr.length <= 5, "A product can have at most 5 images"],
    },
    category: { type: String, trim: true, default: "General" },
    stock: { type: Number, default: 0, min: 0 },
    deodapLink: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);