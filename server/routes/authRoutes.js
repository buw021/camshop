const express = require("express");
const router = express.Router();
const {
  verifyAdminToken,
  verifyUserToken,
} = require("../middleware/authMiddleware");
const {
  logout,
  loginAdmin,
  getUserAdmin,
  loginUser,
  getUser,
  registerUser,
  checkEmail,
} = require("../controllers/authAndRegister");
const {
  loginValidation,
  registerValidation,
  emailValidation,
  adminLoginValidation,
} = require("../validators/authValidators");
const { validateRequest } = require("../middleware/validateRequest");
const { emailRateLimiter } = require("../middleware/rateLimit");
//admin
// Public route (no middleware here)
router.post("/admin_login", adminLoginValidation, validateRequest, loginAdmin);

// Protected routes (middleware applied)
router.post("/logout-admin", verifyAdminToken, logout);
router.get("/get-useradmin", verifyAdminToken, getUserAdmin);

//user
// Public route (no middleware here)
router.post("/login", loginValidation, validateRequest, loginUser);

// Protected routes (middleware applied)
router.post("/logout", verifyUserToken, logout);
router.get("/get-user", verifyUserToken, getUser);

//Register and Email checker
router.post("/register", registerValidation, validateRequest, registerUser);
router.get(
  "/check-email",
  emailRateLimiter,
  emailValidation,
  validateRequest,
  checkEmail
);

module.exports = router;
