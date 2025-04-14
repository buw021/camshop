const express = require("express");
const router = express.Router();
const {
  getUserCart,
  saveUserCart,
  getUserFavs,
  addToFavs,
  addToCart,
  addAllToCart,
  checkItem,
  addAllToCartLocal,
  saveUserFavs,
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
const {
  validateAddProduct,
  validateUpdateProduct,
  validateArchiveProducts,
  validateGetProducts,
  validateProductId,
} = require("../validators/productValidator");
const {
  validateCart,
  validateAddtoCart,
  validatetoWishlist,
  validateCheckItem,
  validateWishlist,
} = require("../validators/cartWishlishValidator");
const { validateRequest } = require("../middleware/validateRequest");
const {
  verifyUserToken,
  verifyAdminToken,
} = require("../middleware/authMiddleware");
//Admin
router.post(
  "/add-product",
  verifyAdminToken,
  validateAddProduct,
  validateRequest,
  addProduct
);

router.post(
  "/update-product",
  verifyAdminToken,
  validateUpdateProduct,
  validateRequest,
  updateProduct
);

router.post(
  "/archive-products",
  verifyAdminToken,
  validateArchiveProducts,
  validateRequest,
  archiveProducts
);

router.get(
  "/get-products",
  verifyAdminToken,
  validateGetProducts,
  validateRequest,
  getProducts
);

router.get(
  "/getFullProduct",
  verifyAdminToken,
  validateProductId,
  validateRequest,
  getFullProduct
);

//(User) Store Functions
router.post(
  "/save-cart",
  verifyUserToken,
  validateCart,
  validateRequest,
  saveUserCart
);
router.post(
  "/add-to-cart",
  verifyUserToken,
  validateAddtoCart,
  validateRequest,
  addToCart
);
router.post(
  "/save-favs",
  verifyUserToken,
  validateWishlist,
  validateRequest,
  saveUserFavs
);
router.post(
  "/add-to-wishlist",
  verifyUserToken,
  validatetoWishlist,
  validateRequest,
  addToFavs
);

router.post("/add-all-to-cart", verifyUserToken, addAllToCart);
router.post("/add-all-to-cart-local", addAllToCartLocal);
//Store
router.get("/product/:details", getProduct);
router.get("/get-variants", getVariants);

//User
router.get("/user-cart", getUserCart);
router.get("/user-wishlist", getUserFavs);
router.get("/checkItemStocks", validateCheckItem, validateRequest, checkItem);

module.exports = router;
