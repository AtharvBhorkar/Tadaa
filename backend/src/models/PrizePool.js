const mongoose = require("mongoose");

const prizePoolSchema = new mongoose.Schema(
  {
    level: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    // relative weight: chance = weight / sum of weights in that level
    weight: { type: Number, required: true, min: 0.01 },
  },
  { timestamps: true }
);

prizePoolSchema.index({ level: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("PrizePool", prizePoolSchema);