const express = require("express");

const router = express.Router();

const {
  createCheckoutSession,
  createNewCheckOutSession,
} = require("../controllers/Checkout");
const {
  getOrderStatus,
  orderCancelRefund,
  getUserOrders,

} = require("../controllers/Order");
const { createCheckoutSessionLimiter } = require("../middleware/rateLimit");

router.post(
  "/create-checkout-session",
  createCheckoutSessionLimiter,
  createCheckoutSession
);
router.get("/get-order-status", getOrderStatus);
router.get("/get-my-orders", getUserOrders);
router.post(
  "/create-new-checkout-session",
  createCheckoutSessionLimiter,
  createNewCheckOutSession
);
router.post("/order-cancel-refund", orderCancelRefund);

module.exports = router;
