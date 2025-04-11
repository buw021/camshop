const express = require("express");

const router = express.Router();

const {
  getShippingOptions,
  updateShippingOptions,
  addShippingOption,
  getShippingOptionsA,
} = require("../controllers/shippingOptions");
const {
  verifyAdminToken,
  verifyUserToken,
} = require("../middleware/authMiddleware");

const { validateRequest } = require("../middleware/validateRequest");
const {
  validateTotalOrderCost,
  validateUpdateShippingOption,
  validateNewShippingOption,
} = require("../validators/shippingValidator");
router.get(
  "/get-sf-options",
  verifyUserToken,
  validateTotalOrderCost,
  validateRequest,
  getShippingOptions
);
router.post(
  "/update-sf-option",
  verifyAdminToken,
  validateUpdateShippingOption,
  validateRequest,
  updateShippingOptions
);
router.post(
  "/add-sf-option",
  verifyAdminToken,
  validateNewShippingOption,
  validateRequest,
  addShippingOption
);
router.get("/get-sf-optionsA", verifyAdminToken, getShippingOptionsA);

module.exports = router;
