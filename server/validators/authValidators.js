const { body, query } = require("express-validator");

exports.loginValidation = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

exports.registerValidation = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password Must be at least 8 chars")
    .matches(/[A-Z]/)
    .withMessage("Password Must have at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password Must have at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password Must have at least one special character"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  body("firstname")
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage("First name can only contain letters, spaces, or hyphens"),
  body("lastname")
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Last name can only contain letters, spaces, hyphens, or apostrophes"
    ),
];

exports.emailValidation = [
  query("email").isEmail().withMessage("Invalid email format"),
];
