const { body, query } = require("express-validator");
const { validatePageAndLimit } = require("./pageAndLimit");

exports.validatePromoCode = [
  // Validate and sanitize `code`
  body("code")
    .exists({ checkFalsy: true })
    .withMessage("Promo code is required")
    .isString()
    .trim()
    .escape()
    .withMessage("Promo code must be a string"),

  // Validate and sanitize `description`
  body("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required")
    .isString()
    .trim()
    .escape()
    .withMessage("Description must be a string"),

  // Validate `type` as one of the allowed enum values
  body("type")
    .exists({ checkFalsy: true })
    .withMessage("Type is required")
    .isIn(["percentage", "fixed"])
    .withMessage("Type must be one of: percentage, fixed"),

  // Validate `value`
  body("value")
    .exists({ checkFalsy: true })
    .withMessage("Value is required")
    .isFloat({ min: 0 })
    .withMessage("Value must be a number greater than or equal to 0"),

  // Validate `startDate` as a valid date
  body("startDate")
    .exists({ checkFalsy: true })
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  // Validate `endDate` as an optional valid date
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),

  // Validate `minimumOrderValue` as a number (optional, default 0)
  body("minimumOrderValue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Minimum order value must be a number greater than or equal to 0"
    ),

  // Validate `usageLimit` as an optional number
  body("usageLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Usage limit must be a positive integer"),

  // Validate `usageCount` (should default to 0, but can be validated if present)
  body("usageCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Usage count must be a non-negative integer"),

  // Validate `keywords` as an optional array of strings
  body("keywords")
    .optional()
    .isArray()
    .withMessage("Keywords must be an array")
    .custom((keywords) => {
      keywords.forEach((keyword) => {
        if (typeof keyword !== "string") {
          throw new Error("Each keyword must be a string");
        }
      });
      return true; // Validation passed
    }),
];

exports.validateGetPromos = [
  query("type")
    .isIn(["active", "inacitive"])
    .withMessage("Type must be  active or inacitive"),
  query("search")
    .optional()
    .customSanitizer((value) => value.toString())
    .trim()
    .escape(),
  ...validatePageAndLimit,
];

exports.validateApplyCode = [
  body("code")
    .exists({ checkFalsy: true })
    .withMessage("Promo code is required")
    .isString()
    .trim()
    .escape()
    .withMessage("Promo code must be a string"),
  body("cartIDs")
    .isArray({ min: 1 })
    .withMessage("Cart must be a non-empty array"),
  body("cartIDs.*.productId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("cartIDs.*.variantId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("cartIDs.*.quantity")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),
];
