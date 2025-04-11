const { body, query } = require("express-validator");
const { validatePageAndLimit } = require("./pageAndLimit");

exports.validateGetUsers = [
  query("searchQuery")
    .optional() // Make it optional
    .customSanitizer((value) => value.toString())
    .trim()
    .escape(),

  ...validatePageAndLimit,
];

exports.validateGetUserDetails = [
  query("customerID")
    .isMongoId()
    .withMessage("Customer ID must be a valid MongoDB ObjectId"),
];

exports.validateCartDetails = [
  body("cartIDs")
    .isArray() // Ensure it's an array with at least one item
    .withMessage("ids must be a non-empty array"),

  // Validate each element in the "ids" array as a valid MongoDB ObjectId
  body("cartIDs.*")
    .isMongoId()
    .withMessage("Each ID in the ids array must be a valid MongoDB ObjectId"),

  ...validatePageAndLimit,
];

exports.validateWishlistDetails = [
  body("wishlistIDs")
    .isArray() // Ensure it's an array with at least one item
    .withMessage("ids must be a non-empty array"),

  // Validate each element in the "ids" array as a valid MongoDB ObjectId
  body("wishlistIDs.*")
    .isMongoId()
    .withMessage("Each ID in the ids array must be a valid MongoDB ObjectId"),

  ...validatePageAndLimit,
];

exports.validateOrderId = [
  body("orderId")
    .trim()
    .escape()
    .isMongoId()
    .withMessage("Order ID must be a valid MongoDB ObjectId"),
];
