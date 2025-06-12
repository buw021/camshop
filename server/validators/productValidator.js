const { body, query } = require("express-validator");
const { validatePageAndLimit } = require("./pageAndLimit");

const validateSpecifications = [
  // Validate that `specifications` is an object
  body("product.specifications")
    .isObject()
    .withMessage("Specifications must be an object"),

  // Validate each key-value pair in the `specifications` object
  body("product.specifications").custom((specifications) => {
    Object.entries(specifications).forEach(([key, value]) => {
      if (typeof key !== "string" || !key.trim()) {
        throw new Error("Each specification key must be a non-empty string");
      }
      if (typeof value !== "string" || !value.trim()) {
        throw new Error("Each specification value must be a non-empty string");
      }
    });
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
    .trim(),

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
        if (variant.variantName && typeof variant.variantName !== "string") {
          throw new Error("Variant name must be a valid string");
        }
        if (variant.variantColor && typeof variant.variantColor !== "string") {
          throw new Error("Variant color must be a valid string");
        }
        const price = Number(variant.variantPrice);
        if (isNaN(price) || price <= 0) {
          throw new Error("Variant price must be a valid positive number");
        }
        const stocks = Number(variant.variantStocks);
        if (isNaN(stocks) || stocks <= 0) {
          throw new Error("Variant stocks must be a valid positive number");
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
    body(fieldName)
      .optional()
      .custom((images) => {
        if (!images) return true;
        // Accept both array of strings and object with arrays of strings
        if (Array.isArray(images)) {
          // Should be an array of strings
          images.forEach((img) => {
            if (typeof img !== "string") {
              throw new Error(`${fieldName} must be an array of strings`);
            }
          });
          return true;
        }
        if (typeof images === "object") {
          Object.keys(images).forEach((key) => {
            const imageArray = images[key];
            if (!Array.isArray(imageArray)) {
              throw new Error(
                `Each value in ${fieldName} must be an array of strings`
              );
            }
            imageArray.forEach((img) => {
              if (typeof img !== "string") {
                throw new Error(
                  `Each item in the ${fieldName}[${key}] array must be a string`
                );
              }
            });
          });
          return true;
        }
        throw new Error(
          `${fieldName} must be an array of strings or an object with arrays of strings`
        );
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
  query("filters.category")
    .optional()
    .isArray()
    .withMessage("Filters must be an array"),

  query("archive").isBoolean().withMessage("Command must be a boolean"),
  query("search")
    .optional()
    .customSanitizer((value) => value.toString())
    .trim()
    .escape(),

  ...validatePageAndLimit,
];

exports.validateProductId = [
  query("id").isMongoId().withMessage("Invalid product ID format"),
];
