const { body, query } = require("express-validator");
const { buildAddressValidation } = require("./addressValidator");

exports.validateCheckout = [
  // Validate and sanitize cart items
  body("cart")
    .isArray({ min: 1 })
    .withMessage("Cart must contain at least one item"),
  body("cart.*.productId").isMongoId().withMessage("Invalid product ID"),
  body("cart.*.variantId")
    .isMongoId()
    .optional() // Allow optional variantId
    .withMessage("Invalid variant ID"),
  body("cart.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  // Validate and sanitize address
  ...buildAddressValidation("address"),
  // Validate shipping option
  body("shippingOption")
    .notEmpty()
    .withMessage("Shipping option is required")
    .withMessage("Invalid shipping option"),

  // Validate and sanitize promo code (optional)
  body("promoCodeInput")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 20 })
    .withMessage("Promo code must be less than 20 characters"),

  // Validate user email
  body("userEmail")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
];

exports.validateCheckoutForNewSession = [
  body("orderId")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Custom order ID is required"),
];

exports.validateOrderId = [query("orderId").trim().escape()];

exports.validateOrderStatus = [query("orderStatus").trim().escape()];

exports.validateCancelRefundOrder = [
  body("orderId").trim().escape(),
  body("action")
    .trim()
    .escape()
    .isIn(["cancel", "confirm", "refund"])
    .withMessage("Invalid action value"),
];

exports.validateOrderReceived = [body("orderId").trim().escape()];
