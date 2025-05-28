const express = require("express");
const router = express.Router();
const { verifyAdminToken } = require("../middleware/authMiddleware");
const {
  getImgBanners,
  updateBanners,
  getActiveImgBanners,
} = require("../controllers/ImgBanner");
const { addTextBanners, getTextBanners } = require("../controllers/TextBanner");

router.get("/get-active-banners", verifyAdminToken, getActiveImgBanners);
router.get("/get-banners", verifyAdminToken, getImgBanners);

router.get("/get-text-banners", verifyAdminToken, getTextBanners);

router.post("/update-banners", verifyAdminToken, updateBanners);

router.post("/save-text-banner", verifyAdminToken, addTextBanners);

module.exports = router;
