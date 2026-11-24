const router = require("express").Router();
const protect = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const {
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
} = require("../controllers/product.controller");

router.use(protect, isAdmin);

router.get("/products", adminGetProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.delete("/products/:id/permanent", hardDeleteProduct);

const mystery = require("../controllers/adminMystery.controller");

router.get("/mystery/levels", mystery.adminGetLevels);
router.post("/mystery/levels", mystery.createLevel);
router.put("/mystery/levels/:id", mystery.updateLevel);
router.post("/mystery/pool", mystery.addPrize);
router.put("/mystery/pool/:id", mystery.updatePrize);
router.delete("/mystery/pool/:id", mystery.deletePrize);

module.exports = router;