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

const { verifyUserToken } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  buildAddressValidation,
  validateAddressId,
} = require("../validators/addressValidator");
const { validateUserData } = require("../validators/userDataValidator");

router.post(
  "/save-new-address",
  verifyUserToken,
  buildAddressValidation("newAddress"),
  validateRequest,
  saveNewAddress
);
router.post(
  "/delete-address",
  verifyUserToken,
  validateAddressId,
  validateRequest,
  deleteAddress
);
router.post(
  "/set-address-default",
  verifyUserToken,
  validateAddressId,
  validateRequest,
  setDefaultAddress
);
router.post(
  "/update-address",
  verifyUserToken,
  validateAddressId,
  validateRequest,
  updateAddress
);
router.post(
  "/update-profile",
  verifyUserToken,
  validateUserData,
  validateRequest,
  updateProfile
);
router.get("/get-user-data", verifyUserToken, getUserData);
router.get("/get-address", verifyUserToken, getUserAddress);

module.exports = router;
