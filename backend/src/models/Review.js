const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, trim: true, maxlength: 1000, default: "" },
    videoUrl: { type: String, trim: true, default: "" },
    pointsGiven: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// one review per product per order
reviewSchema.index(
  { order: 1, product: 1 },
  { unique: true, partialFilterExpression: { order: { $exists: true } } }
);

module.exports = mongoose.model("Review", reviewSchema);