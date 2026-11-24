const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    tagline: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 1 },
    productsCount: { type: Number, required: true, min: 1, default: 1 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Level", levelSchema);