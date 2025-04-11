const express = require("express");
const { verifyAdminToken } = require("../middleware/authMiddleware");

const router = express.Router();
const {
  getUsers,
  getUserDetails,
  getCartDetails,
  getWishlistDetails,
  getOrderDetails,
} = require("../controllers/Customers");
const {
  validateGetUsers,
  validateGetUserDetails,
  validateCartDetails,
  validateWishlistDetails,
  validateOrderId,
} = require("../validators/customerValidatorsAdmin");
const { validateRequest } = require("../middleware/validateRequest");

router.get("/get-users", verifyAdminToken, validateGetUsers, getUsers);
router.get(
  "/get-user-details",
  verifyAdminToken,
  validateGetUserDetails,
  getUserDetails
);
router.post(
  "/get-cart-details",
  verifyAdminToken,
  validateCartDetails,
  getCartDetails
);
router.post(
  "/get-wishlist-details",
  verifyAdminToken,
  validateWishlistDetails,
  getWishlistDetails
);
router.get(
  "/get-order-details",
  verifyAdminToken,
  validateOrderId,
  getOrderDetails
);

module.exports = router;
