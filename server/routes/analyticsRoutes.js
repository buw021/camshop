const express = require("express");
const { verifyAdminToken } = require("../middleware/authMiddleware");
const { getAnalytics } = require("../controllers/Analytics");
const router = express.Router();

router.get("/analytics", getAnalytics);

module.exports = router;
