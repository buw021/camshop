
const { body } = require("express-validator");

const buildAddressValidation = (prefix) => [
  body(`${prefix}.firstName`)
    .trim()
    .escape()
    .isAlpha("en-US", { ignore: " " })
    .withMessage(`${prefix}.firstName must contain only letters`),
  body(`${prefix}.lastName`)
    .trim()
    .escape()
    .isAlpha("en-US", { ignore: " " })
    .withMessage(`${prefix}.lastName must contain only letters`),
  body(`${prefix}.phoneNo`)
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage(`${prefix}.phoneNo has an invalid format`),
  body(`${prefix}.address`)
    .trim()
    .notEmpty()
    .withMessage(`${prefix}.address is required`),
  body(`${prefix}.city`)
    .trim()
    .escape()
    .isAlpha("en-US", { ignore: " " })
    .withMessage(`${prefix}.city must contain only letters`),
  body(`${prefix}.state`)
    .trim()
    .escape()
    .isAlpha("en-US", { ignore: " " })
    .withMessage(`${prefix}.state must contain only letters`),
  body(`${prefix}.zip`).isInt().withMessage(`${prefix}.zip must be a number`),
  body(`${prefix}.country`)
    .trim()
    .escape()
    .isAlpha("en-US", { ignore: " " })
    .withMessage(`${prefix}.country must contain only letters`),
];

const validateAddressId = () => [
  body("addressId")
    .isMongoId()
    .withMessage("addressId must be a valid MongoDB ObjectId"),
];

module.exports = { buildAddressValidation, validateAddressId };
