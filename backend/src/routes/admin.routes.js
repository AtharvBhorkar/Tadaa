const router = require("express").Router();
const protect = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const {
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

router.use(protect, isAdmin);

router.get("/products", adminGetProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;