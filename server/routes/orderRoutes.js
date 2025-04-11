const express = require("express");
const { verifyUserToken, } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  createCheckoutSession,
  createNewCheckOutSession,
} = require("../controllers/Checkout");
const {
  getOrderStatus,
  orderCancelRefund,
  getUserOrders,
  orderReceived,
} = require("../controllers/Order");
const { createCheckoutSessionLimiter } = require("../middleware/rateLimit");
const {
  validateCheckout,
  validateCheckoutForNewSession,
  validateOrderId,
  validateOrderStatus,
  validateCancelRefundOrder,
  validateOrderReceived,
} = require("../validators/checkoutValidator");
const { validateRequest } = require("../middleware/validateRequest");

router.post(
  "/create-checkout-session",
  verifyUserToken,
  createCheckoutSessionLimiter,
  validateCheckout,
  validateRequest,
  createCheckoutSession
);
router.get(
  "/get-order-status",
  verifyUserToken,
  validateOrderId,
  validateRequest,
  getOrderStatus
);

router.get(
  "/get-my-orders",
  verifyUserToken,
  validateOrderStatus,
  validateRequest,
  getUserOrders
);

router.post(
  "/create-new-checkout-session",
  verifyUserToken,
  createCheckoutSessionLimiter,
  validateCheckoutForNewSession,
  validateRequest,
  createNewCheckOutSession
);
router.post(
  "/order-cancel-refund",
  verifyUserToken,
  validateCancelRefundOrder,
  validateRequest,
  orderCancelRefund
);

router.post(
  "/order-received",
  verifyUserToken,
  validateOrderReceived,
  validateRequest,
  orderReceived
);

module.exports = router;
