const express = require("express");

const router = express.Router();
const {
  registerUser,
  checkEmail,
  loginUser,
  getUser,
  getUserCart,
  saveUserCart,
  getUserFavs,
  saveUserFavs,
  addToFavs,
  addToCart,
  addAllToCart,
} = require("../controllers/authController");
const {
  upload,
  uploadImg,
  deleteUpImg,
  deleteOldImg,
} = require("../controllers/uploadImg");
const {
  addProduct,
  getProducts,
  getProduct,
  getVariants,
  updateProduct,
  archiveProducts,
  getArchivedProducts,
  getFullProduct,
} = require("../controllers/Product");
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

const {
  search,
  suggest,
  adminProductSearch,
} = require("../controllers/search");
const { getFilters } = require("../controllers/Filter");

router.post("/register", registerUser);
router.get("/check-email", checkEmail);

router.post("/upload", upload.any(), uploadImg);
router.post("/delete-uploaded-files", deleteUpImg);
router.post("/delete-old-image", deleteOldImg);

router.post("/add-product", addProduct);
router.post("/save-cart", saveUserCart);
router.post("/add-to-cart", addToCart);
router.post("/update-product", updateProduct);
router.post("/archive-products", archiveProducts);

router.post("/save-wishlist", saveUserFavs);
router.post("/add-to-wishlist", addToFavs);
router.post("/add-all-to-cart", addAllToCart);
router.post("/save-new-address", saveNewAddress);
router.post("/delete-address", deleteAddress);
router.post("/set-address-default", setDefaultAddress);
router.post("/update-address", updateAddress);
router.post("/update-profile", updateProfile);
router.post("/change-password", changePassword);

router.get("/get-products", getProducts);
router.get("/getFullProduct", getFullProduct);

router.get("/getFilters", getFilters);

router.get("/product/:details", getProduct);
router.get("/get-variants", getVariants);
router.get("/user-cart", getUserCart);
router.get("/user-wishlist", getUserFavs);
router.get("/get-user-data", getUserData);
router.get("/get-address", getUserAddress);
router.get("/search", search);
router.get("/suggest", suggest);
router.get("/search-products", adminProductSearch);
router.use;

module.exports = router;
