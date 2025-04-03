const express = require("express");

const router = express.Router();
const {
  getUserCart,
  saveUserCart,
  getUserFavs,
  saveUserFavs,
  addToFavs,
  addToCart,
  addAllToCart,
} = require("../controllers/userCartWishlist");
const {
  addProduct,
  getProducts,
  getProduct,
  getVariants,
  updateProduct,
  archiveProducts,
  getFullProduct,
} = require("../controllers/Product");

//Admin
router.post("/add-product", addProduct);
router.post("/save-cart", saveUserCart);
router.post("/add-to-cart", addToCart);
router.post("/update-product", updateProduct);
router.post("/archive-products", archiveProducts);
router.get("/get-products", getProducts);
router.get("/getFullProduct", getFullProduct);

//Store
router.post("/save-wishlist", saveUserFavs);
router.post("/add-to-wishlist", addToFavs);
router.post("/add-all-to-cart", addAllToCart);
router.get("/product/:details", getProduct);
router.get("/get-variants", getVariants);

//User
router.get("/user-cart", getUserCart);
router.get("/user-wishlist", getUserFavs);

module.exports = router;
