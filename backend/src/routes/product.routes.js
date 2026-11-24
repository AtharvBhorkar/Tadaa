const router = require("express").Router();
const protect = require("../middleware/auth");
const {
  createReview,
  getProducts,
  getProduct,
  getProductReviews,
  getProductsByIds,
} = require("../controllers/product.controller");

router.get("/", getProducts);
router.get("/by-ids", getProductsByIds);
router.get("/:id", getProduct);
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", protect, createReview);

module.exports = router;