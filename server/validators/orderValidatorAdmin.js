const { body, query } = require("express-validator");

const { validatePageAndLimit } = require("./pageAndLimit");

const validateOrderFilterAdmin = [
  query("status")
    .optional()
    .trim()
    .escape()
    .isIn([
      "ordered",
      "pending",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
      "processed",
      "return",
      "refund requested",
      "refund on process",
      "payment failed",
    ])
    .withMessage("Invalid order status"),
  query("paymentStatus")
    .optional()
    .trim()
    .escape()
    .isIn(["paid", "unpaid", ""])
    .withMessage("Invalid payment status"),
  query("fulfillmetntStatus")
    .optional()
    .trim()
    .escape()
    .isIn(["fulfilled", "unfulfilled", ""])
    .withMessage("Invalid fulfillment status"),
  query("dateStart")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateStart"),
  query("dateEnd")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateEnd"),
  query("searchQuery")
    .optional()
    .customSanitizer((value) => value.toString())
    .trim()
    .escape(),
];

exports.validateGetOrdersAdmin = [
  ...validateOrderFilterAdmin,
  ...validatePageAndLimit,
];

exports.validateFetchOrderAdmin = [
  ...validateOrderFilterAdmin,
  query("orderId").isMongoId().withMessage("Invalid order ID"),
];

exports.validateUpdateOrderStatusAdmin = [
  body("orderId").isMongoId().withMessage("Invalid order ID"),
  body("status")
    .trim()
    .escape()
    .isIn([
      "ordered",
      "pending",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
      "processed",
      "return",
      "refund requested",
      "refund on process",
      "payment failed",
      "fulfill",
      "cancel",
      "updateTracking",
      "refunding",
      "",
    ])
    .withMessage("Invalid order status"),
  body("trackingNo").optional().trim().escape(),
  body("trackingLink").optional().trim().escape(),
];
