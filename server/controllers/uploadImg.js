
const multer = require("multer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../helpers/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const idx = file.fieldname.replace("variant", "");
    return {
      folder: "/camshop/products",
      public_id: `${idx}-${Date.now()}`,
      transformation: [{ width: 800, crop: "scale" }],
    };
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
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadImg = async (req, res) => {
  try {
    const fileGroups = {};

    for (const file of req.files) {
      const idx = file.fieldname.replace("variant", "");

      if (!fileGroups[idx]) {
        fileGroups[idx] = [];
      }

      fileGroups[idx].push(file.path); // file.path is the Cloudinary URL
    }

    res.json({ filePaths: fileGroups, success: true });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res
      .status(500)
      .json({ success: false, error: "Cloudinary upload failed." });
  }
};

const deleteUpImg = async (req, res) => {
  const { filePaths } = req.body;
  try {
    // filePaths structure: { "0": [{ url, public_id }, ...], "1": [...], ... }
    const deletionPromises = [];

    Object.values(filePaths).forEach((files) => {
      files.forEach(({ public_id }) => {
        if (public_id) {
          deletionPromises.push(cloudinary.uploader.destroy(public_id));
        }
      });
    });

    await Promise.all(deletionPromises);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting Cloudinary files:", error);
    res.status(500).json({ success: false, error: "Failed to delete images." });
  }
};

const deleteOldImg = async (urls) => {
  try {
    const publicIds = urls
      .map((url) => {
        // Find the segment AFTER /upload/
        const match = url.match(
          /\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp)$/i
        );
        return match ? match[1] : null;
      })
      .filter(Boolean);

    await Promise.all(
      publicIds.map((id) =>
        cloudinary.uploader.destroy(id, { resource_type: "image" })
      )
    );

    return true;
  } catch (error) {
    console.error("Error deleting Cloudinary images:", error);
    return false;
  }
};

/* const uploadImg = async (req, res) => {
  try {
    const fileGroups = {};
    const processedFiles = new Set();

    for (const file of req.files) {
      const sanitizedFilename = sanitize(file.filename);
      const idx = file.fieldname.replace("variant", "");

      if (!fileGroups[idx]) {
        fileGroups[idx] = [];
      }

      const inputPath = path.join(
        __dirname,
        "..",
        "uploads/products",
        sanitizedFilename
      );
      const tempOutputPath = path.join(
        __dirname,
        "..",
        "uploads/products",
        `temp-${sanitizedFilename}`
      );

      // Skip processing if the file has already been processed
      if (!processedFiles.has(sanitizedFilename)) {
        // Resize image using Sharp and save it as a temporary file
        await sharp(inputPath)
          .resize({ width: 800 }) // Adjust width as needed
          .toFile(tempOutputPath);

        // Replace the original file with the resized one
        fs.renameSync(tempOutputPath, inputPath);

        processedFiles.add(sanitizedFilename);
      }

      fileGroups[idx].push(sanitizedFilename);
    }

    res.json({ filePaths: fileGroups, success: true });
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "File upload failed." });
  }
}; */

/* const deleteUpImg = async (req, res) => {
  const { filePaths } = req.body;
  try {
    // Iterate over each key in the filePaths object
    Object.keys(filePaths).forEach((key) => {
      const files = filePaths[key];
      // Iterate over each file in the array associated with the key
      files.forEach((file) => {
        const fullPath = path.join(__dirname, "..", "uploads/products", file);
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
}; */

/* const deleteOldImg = async (req, res) => {
  const { url } = req.body;
  try {
    url.forEach((file) => {
      const fullPath = path.join(__dirname, "..", "uploads/products", file);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ success: false, error: "Failed to delete files." });
  }
}; */

module.exports = { upload, uploadImg, deleteUpImg, deleteOldImg };
