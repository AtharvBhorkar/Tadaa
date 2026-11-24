const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const protect = require("../middleware/auth");
const {
  getConfig,
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  devPay,
} = require("../controllers/order.controller");

// stock is reserved on create, so limit spam
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many orders, try again later" },
});

router.get("/config", getConfig);

router.use(protect);
router.post("/", createLimiter, createOrder);
router.get("/mine", getMyOrders);
router.get("/:id", getOrder);
router.post("/:id/cancel", cancelOrder);
router.post("/:id/dev-pay", devPay);

module.exports = router;