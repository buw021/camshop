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
} = require("../controllers/authController");

//admin
// Public route (no middleware here)
router.post("/admin_login", loginAdmin);

// Protected routes (middleware applied)
router.post("/logout-admin", verifyAdminToken, logout);
router.get("/get-useradmin", verifyAdminToken, getUserAdmin);

//user
// Public route (no middleware here)
router.post("/login", loginUser);

// Protected routes (middleware applied)
router.post("/logout", verifyUserToken, logout);
router.get("/get-user", verifyUserToken, getUser);

module.exports = router;
