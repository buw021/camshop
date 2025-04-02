const express = require("express");
const {
  upload,
  uploadImg,
  deleteUpImg,
  deleteOldImg,
} = require("../controllers/uploadImg");

const router = express.Router();

router.post("/upload", upload.any(), uploadImg);
router.post("/delete-uploaded-files", deleteUpImg);
router.post("/delete-old-image", deleteOldImg);

module.exports = router;
