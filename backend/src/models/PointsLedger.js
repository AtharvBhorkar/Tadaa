const mongoose = require("mongoose");

const pointsLedgerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    change: { type: Number, required: true }, // + earned, - spent
    reason: { type: String, required: true }, // "review", "redeem", ...
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

// points for a review are given only once per order
pointsLedgerSchema.index(
  { order: 1, reason: 1 },
  { unique: true, partialFilterExpression: { reason: "review" } }
);

module.exports = mongoose.model("PointsLedger", pointsLedgerSchema);