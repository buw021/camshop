const express = require("express");

const router = express.Router();

const { stripeWebhookHandler } = require("../controllers/Checkout");

router.post(
  "/checkout-stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

module.exports = router;
