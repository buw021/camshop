const express = require("express");

const router = express.Router();

const { stripeWebhookHandler, createCheckoutSession } = require("../controllers/Checkout");

router.post("/create-checkout-session", createCheckoutSession);
router.post("/checkout-stripe-webhook", express.raw({ type: '*/*' }), stripeWebhookHandler);

module.exports = router;
