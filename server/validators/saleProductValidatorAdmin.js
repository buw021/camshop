const { body, query } = require("express-validator");
const { validatePageAndLimit } = require("./pageAndLimit");
exports.validateGetSaleList = [
  query("status").isBoolean().withMessage("Invalid status"),
  query("search")
    .optional()
    .customSanitizer((value) => value.toString())
    .trim()
    .escape(),
  ...validatePageAndLimit,
];

exports.validateSale = [
  // Validate and sanitize startDate
  body("SaleList.startDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("startDate must be a valid ISO8601 date or null"),

  // Validate and sanitize endDate
  body("SaleList.endDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("endDate must be a valid ISO8601 date or null"),

  // Validate discountType
  body("SaleList.discountType")
    .optional({ nullable: true })
    .isIn(["percentage", "fixed", null])
    .withMessage('discountType must be "percentage", "fixed", or null'),

  // Validate discount
  body("SaleList.discount")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("discount must be a number greater than or equal to 0"),

  // Validate selectedProducts as an array
  body("SaleList.selectedProducts")
    .isArray({ min: 1 })
    .withMessage("selectedProducts must be a non-empty array"),

  // Validate each item in selectedProducts
  body("SaleList.selectedProducts.*.productId")
    .exists()
    .withMessage("Product ID is required")
    .isString()
    .withMessage("Product ID must be a string")
    .trim()
    .escape(),

  body("SaleList.selectedProducts.*.name")
    .exists()
    .withMessage("Product name is required")
    .isString()
    .withMessage("Product name must be a string")
    .trim()
    .escape(),

  body("SaleList.selectedProducts.*.category")
    .exists()
    .withMessage("Product category is required")
    .isString()
    .withMessage("Product category must be a string")
    .trim()
    .escape(),

  body("SaleList.selectedProducts.*.variantId")
    .exists()
    .withMessage("Variant ID is required")
    .isString()
    .withMessage("Variant ID must be a string")
    .trim()
    .escape(),

  body("SaleList.selectedProducts.*.variantName")
    .exists()
    .withMessage("Variant name is required")
    .isString()
    .withMessage("Variant name must be a string")
    .trim()
    .escape(),

  body("SaleList.selectedProducts.*.variantColor")
    .exists()
    .withMessage("Variant color is required")
    .isString()
    .withMessage("Variant color must be a string")
    .trim()
    .escape(),

  body("SaleList.selectedProducts.*.variantPrice")
    .exists()
    .withMessage("Variant price is required")
    .isFloat({ min: 0 })
    .withMessage("Variant price must be a number greater than or equal to 0"),
];

exports.validateSaleID = [
  body("id").isMongoId().withMessage("Invalid sale ID format"),
];

exports.validateNewSaleData = [
  body("_id").isMongoId().withMessage("Invalid sale ID format"),
  body("value").isFloat({ min: 0 }).withMessage("Invalid value"),
  body("newSalePrice")
    .isFloat({ min: 0 })
    .withMessage("Invalid new sale price"),
  body("discountType")
    .isIn(["percentage", "fixed"])
    .withMessage('discountType must be "percentage" or "fixed"'),
  body("duration.startDate")
    .isISO8601()
    .withMessage("Invalid start date format"),
  body("duration.endDate").isISO8601().withMessage("Invalid end date format"),
];
