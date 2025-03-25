const express = require("express");

const router = express.Router();

const {
  getOrdersAdmin,
  updateOrderStatus,
  fetchOrder,
} = require("../controllers/AdminOrder");

router.get("/admin-get-orders", getOrdersAdmin);
router.get("/fetch-order-data", fetchOrder);
router.post("/update-order-status", updateOrderStatus);

module.exports = router;
