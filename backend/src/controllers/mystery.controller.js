const Level = require("../models/Level");
const PrizePool = require("../models/PrizePool");
const { meetsValueRule } = require("../utils/mysteryRules");

// Public: levels with their prizes and odds. costPrice is never exposed.
exports.getLevels = async (req, res) => {
  const levels = await Level.find({ isActive: true }).sort({ sortOrder: 1, price: 1 }).lean();
  const pool = await PrizePool.find({ level: { $in: levels.map((l) => l._id) } })
    .populate("product", "title images price stock isActive")
    .lean();

  const result = levels.map((level) => {
    // only prizes that can actually be won right now
    const entries = pool.filter(
      (p) =>
        String(p.level) === String(level._id) &&
        p.product &&
        p.product.isActive &&
        p.product.stock > 0 &&
        meetsValueRule(level, p.product)
    );
    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);

    const prizes = entries
      .map((e) => ({
        productId: e.product._id,
        title: e.product.title,
        image: e.product.images?.[0] || "",
        value: e.product.price,
        chance: totalWeight ? Number(((e.weight / totalWeight) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.chance - a.chance);

    return {
      _id: level._id,
      name: level.name,
      tagline: level.tagline,
      price: level.price,
      productsCount: level.productsCount,
      prizes,
    };
  });

  res.json({ levels: result });
};