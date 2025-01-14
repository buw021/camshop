const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const sanitize = require("sanitize-filename");
const fs = require("fs");
const { type } = require("os");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter,
});

const uploadImg = async (req, res) => {
  try {
    const fileGroups = req.files.reduce((groups, file) => {
      const sanitizedFilename = sanitize(file.filename);
      const idx = file.fieldname.replace("variant", "");
      if (!groups[idx]) {
        groups[idx] = [];
      }
      groups[idx].push(sanitizedFilename);
      return groups;
    }, {});
    res.json({ filePaths: fileGroups, success: true });
  } catch (error) {
    res.status(500).json({ error: "File upload failed." });
  }
};

const deleteUpImg = async (req, res) => {
  const { filePaths } = req.body;
  console.log(filePaths);
    try {
    // Iterate over each key in the filePaths object
    Object.keys(filePaths).forEach((key) => {
      const files = filePaths[key];
      // Iterate over each file in the array associated with the key
      files.forEach((file) => {
        const fullPath = path.join(__dirname, "..", "uploads", file);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ success: false, error: "Failed to delete files." });
  } 
};

const deleteOldImg = async (req, res) => {
  const { url } = req.body;
  try {
    url.forEach((file) => {
      const fullPath = path.join(__dirname, "..", "uploads", file);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ success: false, error: "Failed to delete files." });
  }
};

module.exports = { upload, uploadImg, deleteUpImg, deleteOldImg };
