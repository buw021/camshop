const express = require("express");
const {
  upload,
  uploadImg,
  deleteUpImg,
  deleteOldImg,
} = require("../controllers/uploadImg");

const {
  imgBannerUpload,
  uploadImgBanners,
  deleteUpImgBanners,
  deleteOldImgBanners,
} = require("../controllers/ImgBanner");

const router = express.Router();

router.post("/upload", upload.any(), uploadImg);
router.post("/delete-uploaded-files", deleteUpImg);
router.post("/delete-old-image", deleteOldImg);

router.post("/upload-img-banners", imgBannerUpload.any(), uploadImgBanners);
router.post("/delete-uploaded-img-banners", deleteUpImgBanners);
router.post("/delete-old-img-banners", deleteOldImgBanners);
module.exports = router;
