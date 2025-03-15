const express = require("express");

const router = express.Router();
const {
  getUsers,
  getUserDetails,
  getCartDetails,
  getWishlistDetails,
} = require("../controllers/Customers");

router.get("/get-users", getUsers);
router.get("/get-user-details", getUserDetails);
router.post("/get-cart-details", getCartDetails);
router.post("/get-wishlist-details", getWishlistDetails);

module.exports = router;
