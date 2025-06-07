const express = require("express");
const { verifyAdminToken } = require("../middleware/authMiddleware");
const {
  getNotifications,
  getUnreadCount,
  updateToRead,
} = require("../controllers/Notifications");
const router = express.Router();

router.get("/get-notifications", getNotifications);
router.get("/get-unreadCount", getUnreadCount);

router.post("/update-notification", updateToRead);
module.exports = router;
