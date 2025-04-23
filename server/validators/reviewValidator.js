const { body, query } = require("express-validator");

exports.validateReview = [
  body("reviews").isArray().withMessage("Reviews must be an array"),
  body("reviews.*.productId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("reviews.*.variantId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("reviews.*.rate")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("reviews.*.subject")
    .optional()
    .isString()
    .withMessage("Subject must be a string")
    .isLength({ max: 100 })
    .withMessage("message must be less than 100 characters"),
  body("reviews.*.message")
    .optional()
    .isString()
    .withMessage("message must be a string")
    .isLength({ max: 5000 })
    .withMessage("message must be less than 5000 characters"),
  body("orderId")
    .isMongoId()
    .withMessage("Order ID must be a valid MongoDB ObjectId"),
];

exports.validateUpdateReview = [
  body("reviewId")
    .isMongoId()
    .withMessage("Review ID must be a valid MongoDB ObjectId"),
  body("ratingData.rate")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("ratingData.subject")
    .optional()
    .isString()
    .withMessage("Subject must be a string")
    .isLength({ max: 100 })
    .withMessage("message must be less than 100 characters"),
  body("ratingData.message")
    .optional()
    .isString()
    .withMessage("message must be a string")
    .isLength({ max: 5000 })
    .withMessage("message must be less than 5000 characters"),
];
/*  const { productId, filter, sort, currentPage, limit } = req.query; */

exports.validateGetPoductReviews = [
  query("productId")
  .isMongoId()
  .withMessage("Product ID must be a valid MongoDB ObjectId"),
  query("filter")
    .optional()
    .isIn(["all", "1", "2", "3", "4", "5"])
    .withMessage("Filter must be 'all' or a rating between 1 and 5"),
query("sort")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort must be 'asc' or 'desc'"),
  query("currentPage")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Current page must be an integer greater than 0"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be an integer greater than 0"),
];