const { body, query } = require("express-validator");

exports.validateUserData = [
  body("profile.firstName")
    .trim()
    .escape()
    .isAlpha("en-US", { ignore: " " })
    .withMessage("profile.firstName must contain only letters"),
  body("profile.lastName")
    .trim()
    .escape()
    .isAlpha("en-US", { ignore: " " })
    .withMessage("profile.lastName must contain only letters"),
  body("profile.phoneNo")
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("profile.phoneNo has an invalid format"),
];
