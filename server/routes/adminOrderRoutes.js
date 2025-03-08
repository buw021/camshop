const express = require("express");

const router = express.Router();

const { getOrdersAdmin, updateOrderStatus } = require("../controllers/AdminOrder");

router.get("/admin-get-orders", getOrdersAdmin);
router.post("/update-order-status", updateOrderStatus);

module.exports = router;