const { body, query } = require("express-validator");

exports.validateCart = [
  body("cart")
    .isArray({ min: 0 })
    .withMessage("Cart must be a non-empty array"),
  body("cart.*.productId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("cart.*.variantId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("cart.*.quantity")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),
];

exports.validateWishlist = [
  body("favs")
    .isArray({ min: 0 })
    .withMessage("Cart must be a non-empty array"),
  body("favs.*.productId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("favs.*.variantId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
];

exports.validateAddtoCart = [
  body("cartItem.productId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("cartItem.variantId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
];

exports.validatetoWishlist = [
  body("item.productId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("item.variantId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
];

exports.validateCheckItem = [
  query("productId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  query("variantId")
    .isMongoId()
    .withMessage("Variant ID must be a valid MongoDB ObjectId"),
  query("quantity")
    .isInt({ gte: 0 })
    .withMessage("Quantity must be a positive integer"),
];
