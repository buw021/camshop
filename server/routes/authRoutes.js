const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
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

//admin
// Public route (no middleware here)
router.post("/admin_login", loginAdmin);

// Protected routes (middleware applied)
router.post("/logout-admin", verifyAdminToken, logout);
router.get("/get-useradmin", verifyAdminToken, getUserAdmin);

//user
// Public route (no middleware here)
router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 8 })],
  loginUser
);

// Protected routes (middleware applied)
router.post("/logout", verifyUserToken, logout);
router.get("/get-user", verifyUserToken, getUser);

//Register and Email checker
router.post("/register", registerUser);
router.get("/check-email", checkEmail);

module.exports = router;
