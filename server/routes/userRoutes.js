const express = require("express");
const {
  getUserData,
  updateAddress,
  getUserAddress,
  saveNewAddress,
  deleteAddress,
  setDefaultAddress,
  updateProfile,
  changePassword,
} = require("../controllers/userData");

const router = express.Router();

router.post("/save-new-address", saveNewAddress);
router.post("/delete-address", deleteAddress);
router.post("/set-address-default", setDefaultAddress);
router.post("/update-address", updateAddress);
router.post("/update-profile", updateProfile);
router.get("/get-user-data", getUserData);
router.get("/get-address", getUserAddress);

module.exports = router;
