const mongoose = require("mongoose");
const Level = require("../models/Level");
const PrizePool = require("../models/PrizePool");
const Product = require("../models/Product");
const {
  GATEWAY_PCT,
  PACKING_COST,
  CLAIMS_PCT,
  minPrizeValue,
  meetsValueRule,
} = require("../utils/mysteryRules");

const buildView = (level, entries) => {
  const rows = entries
    .filter((e) => e.product)
    .map((e) => ({
      _id: e._id,
      productId: e.product._id,
      title: e.product.title,
      image: e.product.images?.[0] || "",
      price: e.product.price,
      costPrice: e.product.costPrice || 0,
      stock: e.product.stock,
      weight: e.weight,
      meetsRule: meetsValueRule(level, e.product),
      live: e.product.isActive && e.product.stock > 0 && meetsValueRule(level, e.product),
    }));

  const liveRows = rows.filter((r) => r.live);
  const totalWeight = liveRows.reduce((s, r) => s + r.weight, 0);
  rows.forEach((r) => {
    r.chance = r.live && totalWeight ? Number(((r.weight / totalWeight) * 100).toFixed(1)) : 0;
  });

  // expected cost of one box = productsCount * average cost weighted by chance
  const avgCost = liveRows.reduce(
    (s, r) => s + (totalWeight ? (r.weight / totalWeight) * r.costPrice : 0),
    0
  );
  const expectedCost = avgCost * level.productsCount;
  const worstCost = liveRows
    .map((r) => r.costPrice)
    .sort((a, b) => b - a)
    .slice(0, level.productsCount)
    .reduce((s, c) => s + c, 0);

  const gateway = level.price * GATEWAY_PCT;
  const claims = level.price * CLAIMS_PCT;
  const netMargin = level.price - expectedCost - gateway - PACKING_COST - claims;

  const warnings = [];
  if (liveRows.length < level.productsCount)
    warnings.push(`Need at least ${level.productsCount} live prizes in the pool (now ${liveRows.length}).`);
  if (liveRows.some((r) => !r.costPrice))
    warnings.push("Some live prizes have no cost price, so margin is not accurate.");
  if (rows.some((r) => !r.meetsRule))
    warnings.push("Some prizes are below the minimum value and are hidden from odds.");
  if (netMargin < 0) warnings.push("Expected margin is negative for this level.");

  return {
    _id: level._id,
    name: level.name,
    tagline: level.tagline,
    price: level.price,
    productsCount: level.productsCount,
    isActive: level.isActive,
    minPrizeValue: minPrizeValue(level),
    prizes: rows,
    stats: {
      expectedCost: Math.round(expectedCost),
      worstCost,
      fees: Math.round(gateway + PACKING_COST + claims),
      netMargin: Math.round(netMargin),
      marginPct: level.price ? Number(((netMargin / level.price) * 100).toFixed(1)) : 0,
    },
    warnings,
  };
};

exports.adminGetLevels = async (req, res) => {
  const levels = await Level.find().sort({ sortOrder: 1, price: 1 }).lean();
  const pool = await PrizePool.find()
    .populate("product", "title images price costPrice stock isActive")
    .lean();
  res.json({
    levels: levels.map((l) =>
      buildView(l, pool.filter((p) => String(p.level) === String(l._id)))
    ),
  });
};

exports.createLevel = async (req, res) => {
  const { name, price, productsCount, tagline, sortOrder } = req.body;
  if (!name || !(Number(price) > 0) || !(Number(productsCount) >= 1)) {
    return res.status(400).json({ message: "Name, price and products count are required" });
  }
  const level = await Level.create({ name, price, productsCount, tagline, sortOrder });
  res.status(201).json(level);
};

exports.updateLevel = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid level id" });
  }
  const allowed = ["name", "tagline", "price", "productsCount", "sortOrder", "isActive"];
  const update = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) update[k] = req.body[k];
  });
  const level = await Level.findByIdAndUpdate(req.params.id, update, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!level) return res.status(404).json({ message: "Level not found" });
  res.json(level);
};

exports.addPrize = async (req, res) => {
  const { levelId, productId } = req.body;
  const weight = Number(req.body.weight);
  if (!mongoose.isValidObjectId(levelId) || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid level or product id" });
  }
  if (!(weight > 0)) return res.status(400).json({ message: "Weight must be greater than 0" });

  const [level, product] = await Promise.all([Level.findById(levelId), Product.findById(productId)]);
  if (!level || !product) return res.status(404).json({ message: "Level or product not found" });

  if (!meetsValueRule(level, product)) {
    return res.status(400).json({
      message: `Prize price must be at least ₹${minPrizeValue(level)} for this level, so every box is worth what the user paid.`,
    });
  }

  const entry = await PrizePool.findOneAndUpdate(
    { level: levelId, product: productId },
    { weight },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  res.status(201).json(entry);
};

exports.updatePrize = async (req, res) => {
  const weight = Number(req.body.weight);
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (!(weight > 0)) return res.status(400).json({ message: "Weight must be greater than 0" });
  const entry = await PrizePool.findByIdAndUpdate(
    req.params.id,
    { weight },
    { returnDocument: "after" }
  );
  if (!entry) return res.status(404).json({ message: "Pool entry not found" });
  res.json(entry);
};

exports.deletePrize = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  const entry = await PrizePool.findByIdAndDelete(req.params.id);
  if (!entry) return res.status(404).json({ message: "Pool entry not found" });
  res.json({ message: "Removed from pool", id: entry._id });
};