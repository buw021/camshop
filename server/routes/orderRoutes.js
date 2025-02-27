const express = require("express");

const router = express.Router();

const { createCheckoutSession, createNewCheckOutSession } = require("../controllers/Checkout");
const { getOrderStatus } = require("../controllers/Order");

router.post("/create-checkout-session", createCheckoutSession);
router.get("/get-order-status", getOrderStatus);
router.post("/create-new-checkout-session", createNewCheckOutSession);
module.exports = router;
