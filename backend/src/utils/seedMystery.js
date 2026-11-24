// DEV ONLY: creates 3 placeholder levels and fills each pool with existing products.
// Prices and weights are test values, not final.
require("../config/env");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Level = require("../models/Level");
const PrizePool = require("../models/PrizePool");
const Product = require("../models/Product");

const LEVELS = [
  { name: "Level 1", tagline: "Starter", price: 149, productsCount: 1, sortOrder: 1 },
  { name: "Level 2", tagline: "Popular", price: 249, productsCount: 2, sortOrder: 2 },
  { name: "Level 3", tagline: "Premium", price: 399, productsCount: 2, sortOrder: 3 },
];

(async () => {
  await connectDB();
  const products = await Product.find({ isActive: true, stock: { $gt: 0 } });

  for (const data of LEVELS) {
    const level = await Level.findOneAndUpdate({ name: data.name }, data, {
      upsert: true,
      returnDocument: "after",
    });
    for (const p of products) {
      await PrizePool.updateOne(
        { level: level._id, product: p._id },
        { $setOnInsert: { weight: Math.max(1, Math.round(1000 / (p.price || 1))) } },
        { upsert: true }
      );
    }
    console.log(`${level.name}: ${products.length} prizes in pool`);
  }

  await mongoose.disconnect();
  process.exit(0);
})();