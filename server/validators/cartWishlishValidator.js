const { body, query } = require("express-validator");

exports.validateCart = [
  body("cart")
    .isArray({ min: 1 })
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
