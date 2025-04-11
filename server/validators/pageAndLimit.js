const { query } = require("express-validator");

exports.validatePageAndLimit = [
  query("currentPage")
    .optional() // Make it optional; default can be set in the controller
    .isInt({ min: 1 }) // Ensure it's a positive integer
    .withMessage("Current page must be a positive integer"),

  // Validate and sanitize `limit`
  query("limit")
    .optional() // Make it optional; default can be set in the controller
    .isInt({ min: 1 }) // Ensure it's a positive integer
    .withMessage("Limit must be a positive integer"),
];
