const express = require("express");

const router = express.Router();

const { createCheckoutSession } = require("../controllers/Checkout");
const { getOrderStatus } = require("../controllers/Order");

router.post("/create-checkout-session", createCheckoutSession);
router.get("/get-order-status", getOrderStatus);
module.exports = router;
