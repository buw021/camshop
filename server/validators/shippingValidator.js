const { body, query } = require("express-validator");

exports.validateTotalOrderCost = [
  query("totalOrderCost")
    .exists()
    .withMessage("Total order cost is required.")
    .isNumeric()
    .withMessage("Total order cost must be a number.")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Total order cost must be a positive number.");
      }
      return true;
    }),
];

exports.validateNewShippingOption = [
  body("newShippingOption.shippingType")
    .exists()
    .withMessage("Shipping type is required.")
    .isString()
    .withMessage("Shipping type must be a string."),
  body("newShippingOption.shippingCost")
    .exists()
    .withMessage("Shipping cost is required.")
    .isNumeric()
    .withMessage("Shipping cost must be a number.")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Shipping cost must be a positive number.");
      }
      return true;
    }),
  body("newShippingOption.shippingLabel")
    .exists()
    .withMessage("Shipping type is required.")
    .isString()
    .withMessage("Shipping type must be a string."),
  body("newShippingOption.shippingTime")
    .exists()
    .withMessage("Shipping time is required.")
    .isString()
    .withMessage("Shipping time must be a string."),
];

exports.validateUpdateShippingOption = [
  body("editShippingOption._id")
    .isMongoId()
    .withMessage("Invalid shipping option ID."),
  body("editShippingOption.shippingType")
    .exists()
    .withMessage("Shipping type is required.")
    .isString()
    .withMessage("Shipping type must be a string."),
  body("editShippingOption.shippingCost")
    .exists()
    .withMessage("Shipping cost is required.")
    .isNumeric()
    .withMessage("Shipping cost must be a number.")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Shipping cost must be a positive number.");
      }
      return true;
    }),
  body("editShippingOption.shippingLabel")
    .exists()
    .withMessage("Shipping type is required.")
    .isString()
    .withMessage("Shipping type must be a string."),
  body("editShippingOption.shippingTime")
    .exists()
    .withMessage("Shipping time is required.")
    .isString()
    .withMessage("Shipping time must be a string."),
];
