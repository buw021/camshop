const { query } = require("express-validator");

exports.validateQuery = [
  query("query")
    .optional()
    .customSanitizer((value) => value.toString())
    .trim()
    .escape(),
];

exports.validateProductSearchAdmin = [
  query("search")
    .optional()
    .customSanitizer((value) => value.toString())
    .trim()
    .escape(),
  query("command").isBoolean().withMessage("Invalid command"),
];
