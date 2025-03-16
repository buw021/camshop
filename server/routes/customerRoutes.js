const express = require("express");

const router = express.Router();
const {
  getUsers,
  getUserDetails,
  getCartDetails,
  getWishlistDetails,
  getOrderDetails,
} = require("../controllers/Customers");

router.get("/get-users", getUsers);
router.get("/get-user-details", getUserDetails);
router.post("/get-cart-details", getCartDetails);
router.post("/get-wishlist-details", getWishlistDetails);
router.get("/get-order-details", getOrderDetails);

module.exports = router;
