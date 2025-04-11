const express = require("express");
const { verifyAdminToken } = require("../middleware/authMiddleware");
const {
  validateGetOrdersAdmin,
  validateFetchOrderAdmin,
  validateUpdateOrderStatusAdmin,
} = require("../validators/orderValidatorAdmin");
const { validateRequest } = require("../middleware/validateRequest");
const router = express.Router();

const {
  getOrdersAdmin,
  updateOrderStatus,
  fetchOrder,
} = require("../controllers/AdminOrder");

router.get(
  "/admin-get-orders",
  verifyAdminToken,
  validateGetOrdersAdmin,
  validateRequest,
  getOrdersAdmin
);
router.get(
  "/fetch-order-data",
  verifyAdminToken,
  validateFetchOrderAdmin,
  validateRequest,
  fetchOrder
);
router.post(
  "/update-order-status",
  verifyAdminToken,
  validateUpdateOrderStatusAdmin,
  validateRequest,
  updateOrderStatus
);

module.exports = router;
