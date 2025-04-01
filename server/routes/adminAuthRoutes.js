const express = require("express");
const router = express.Router();
const { verifyAdminToken } = require("../middleware/authMiddleware");
const {
  logout,
  loginAdmin,
  getUserAdmin,
} = require("../controllers/authController");

// Public route (no middleware here)
router.post("/admin_login", loginAdmin);

// Protected routes (middleware applied)
router.post("/logout-admin", verifyAdminToken, logout);
router.get("/get-useradmin", verifyAdminToken, getUserAdmin);

module.exports = router;
