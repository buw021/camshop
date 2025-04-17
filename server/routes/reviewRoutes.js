const express = require("express");
const router = express.Router();

const {
  reviewProduct,
  updateReview,
  getUserReview,
} = require("../controllers/Review");
const { verifyUserToken } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  validateReview,
  validateUpdateReview,
} = require("../validators/reviewValidator");

router.get("/get-user-reviews", verifyUserToken, getUserReview);

router.post(
  "/submit-review",
  verifyUserToken,
  validateReview,
  validateRequest,
  reviewProduct
);

router.post(
  "/update-review",
  verifyUserToken,
  validateUpdateReview,
  validateRequest,
  updateReview
);

module.exports = router;
