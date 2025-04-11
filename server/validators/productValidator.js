const { body, query } = require("express-validator");
const { validatePageAndLimit } = require("./pageAndLimit");

const validateSpecifications = [
  // Validate that `specifications` is an array
  body("product.specifications")
    .isArray({ min: 1 })
    .withMessage("Specifications must be a non-empty array"),

  // Validate each element in the `specifications` array
  body("product.specifications.*").custom((spec) => {
    // Ensure each element is an object with one key-value pair
    if (
      typeof spec !== "object" ||
      spec === null ||
      Array.isArray(spec) ||
      Object.keys(spec).length !== 1
    ) {
      throw new Error(
        "Each specification must be an object with exactly one key-value pair"
      );
    }
    // Ensure the key and value are both valid
    const key = Object.keys(spec)[0];
    const value = spec[key];
    if (!key || typeof key !== "string" || !value) {
      throw new Error("Each key-value pair must have a valid key and value");
    }
    return true; // Validation passed
  }),
];

// Validation for Product
const validateProduct = [
  // Validate and sanitize `name`
  body("_id").optional().isMongoId().withMessage("Invalid ID").trim().escape(),

  body("product.name")
    .exists({ checkFalsy: true })
    .withMessage("Product name is required")
    .trim()
    .escape(),

  // Validate and sanitize `category`
  body("product.category")
    .exists({ checkFalsy: true })
    .withMessage("Category is required")
    .trim()
    .escape(),

  // Validate and sanitize `subCategory` (optional)
  body("product.subCategory").optional().trim().escape(),

  // Validate and sanitize `brand`
  body("product.brand")
    .exists({ checkFalsy: true })
    .withMessage("Brand is required")
    .trim()
    .escape(),

  // Validate and sanitize `description`
  body("product.description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required")
    .trim()
    .escape(),

  // Validate `tags` as an array of strings
  body("product.tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings")
    .custom((tags) => {
      tags.forEach((tag) => {
        if (typeof tag !== "string") {
          throw new Error("Each tag must be a string");
        }
      });
      return true;
    }),

  // Validate `specifications` as a Map (key-value pairs)
  ...validateSpecifications,

  // Validate `variants` as an array matching variantSchema
  body("product.variants")
    .isArray()
    .withMessage("Variants must be an array")
    .custom((variants) => {
      variants.forEach((variant) => {
        if (!variant.variantName || typeof variant.variantName !== "string") {
          throw new Error("Variant name must be a valid string");
        }
        if (variant.variantColor && typeof variant.variantColor !== "string") {
          throw new Error("Variant color must be a valid string");
        }
        if (!variant.variantPrice || typeof variant.variantPrice !== "number") {
          throw new Error("Variant price must be a number");
        }
        if (
          !variant.variantStocks ||
          typeof variant.variantStocks !== "number"
        ) {
          throw new Error("Variant stocks must be a number");
        }
        if (variant.variantImgs && !Array.isArray(variant.variantImgs)) {
          throw new Error("Variant images must be an array of strings");
        }
      });
      return true;
    }),
];

const validateImgs = (fieldName) => {
  return [
    body(fieldName) // Use the dynamic field name here
      .isArray()
      .withMessage(`${fieldName} must be an array of strings`)
      .custom((images) => {
        images.forEach((image) => {
          if (typeof image !== "string") {
            throw new Error(
              `Each item in the ${fieldName} array must be a string`
            );
          }
        });
        return true; // Validation passed
      }),
  ];
};

exports.validateAddProduct = [...validateProduct, ...validateImgs("fileImgs")];
exports.validateUpdateProduct = [
  ...validateProduct,
  ...validateImgs("fileImgs"),
  ...validateImgs("oldImagetodelete"),
];

exports.validateArchiveProducts = [
  body("productIds")
    .isArray({ min: 1 })
    .withMessage("Product IDs must be a non-empty array"),
  body("productIds.*").isMongoId().withMessage("Invalid product ID format"),
  body("command").isBoolean().withMessage("Command must be a boolean"),
];

exports.validateGetProducts = [
  query("filters").optional().isArray().withMessage("Filters must be an array"),
  query("filters.*")
    .isIn([
      "category",
      "subCategory",
      "brand",
      "tags",
      "specifications",
      "variants",
    ])
    .withMessage(
      "Each filter must be one of: category, subCategory, brand, tags, specifications, variants"
    ),
  query("archive").isBoolean().withMessage("Command must be a boolean"),
  query("search")
    .optional()
    .customSanitizer((value) => value.toString())
    .trim()
    .escape(),

  ...validatePageAndLimit,
];

exports.validateProductId = [
  body("id").isMongoId().withMessage("Invalid product ID format"),
];
