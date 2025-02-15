const express = require("express");

const router = express.Router();

const {
  getShippingOptions,
  updateShippingOptions,
  addShippingOption,
  getShippingOptionsA,
} = require("../controllers/shippingOptions");

router.get("/get-sf-options", getShippingOptions);
router.post("/update-sf-option", updateShippingOptions);
router.post("/add-sf-option", addShippingOption);
router.get("/get-sf-optionsA", getShippingOptionsA);

module.exports = router;
