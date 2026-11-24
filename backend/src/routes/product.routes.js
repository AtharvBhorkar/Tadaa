const router = require("express").Router();
const {
  getProducts,
  getProduct,
  getProductReviews,
  getProductsByIds,
} = require("../controllers/product.controller");

router.get("/", getProducts);
router.get("/by-ids", getProductsByIds);
router.get("/:id", getProduct);
router.get("/:id/reviews", getProductReviews);

module.exports = router;