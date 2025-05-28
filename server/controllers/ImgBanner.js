const multer = require("multer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../helpers/cloudinary");
const ImgBanner = require("../models/imgPromoBanner");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "/camshop/banners",
      public_id: `${Date.now()}`,
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

const imgBannerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadImgBanners = async (req, res) => {
  try {
    const fileGroups = req.files.map((file) => file.path); // file.path is the Cloudinary URL

    const savedPaths = [];
    const failedPaths = [];

    // Find the existing ImgBanner document or create a new one
    let imgBannerDoc = await ImgBanner.findOne();
    if (!imgBannerDoc) {
      imgBannerDoc = new ImgBanner({ banners: [] });
    }

    for (const file of fileGroups) {
      try {
        imgBannerDoc.banners.push({ filepath: file, active: false });
        savedPaths.push(file);
      } catch (err) {
        console.error(`Failed to add file: ${file}`, err);
        failedPaths.push(file);
      }
    }

    await imgBannerDoc.save();

    res.json({
      success: failedPaths.length === 0,
      saved: savedPaths,
      failed: failedPaths,
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res
      .status(500)
      .json({ success: false, error: "Cloudinary upload failed." });
  }
};

const deleteUpImgBanners = async (req, res) => {
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

const deleteOldImgBanners = async (urls) => {
  try {
    const publicIds = urls
      .map((url) => {
        // Extract the public_id from the Cloudinary URL (after /upload/ and before the file extension)
        const match = url.filepath.match(
          /\/upload\/(?:v\d+\/)?([^\.]+)\.(jpg|jpeg|png|gif|webp)$/i
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

const getImgBanners = async (req, res) => {
  try {
    const imgBanners = await ImgBanner.find();

    res.json(imgBanners[0].banners);
  } catch (error) {
    console.error("Error fetching image banners:", error);
    res.status(500).json({ error: "Failed to fetch image banners." });
  }
};

const updateBanners = async (req, res) => {
  const { images, tbDeleted } = req.body;

  try {
    // Find the ImgBanner document
    const imgBannerDoc = await ImgBanner.findOne();
    if (!imgBannerDoc) {
      return res.status(404).json({ error: "No banners found to update." });
    }

    // Update the banners order if updatedOrder is provided

    if (tbDeleted.length > 0) {
      deleteOldImgBanners(tbDeleted);
      const deleted = await deleteOldImgBanners(tbDeleted);
      if (!deleted) {
        return res
          .status(500)
          .json({ error: "Failed to delete one or more images." });
      }
    }

    if (Array.isArray(images)) {
      imgBannerDoc.banners = images;
      await imgBannerDoc.save();
    }

    res.json({ success: "success!" });
  } catch (error) {
    console.error("Error updating image banners:", error);
    res.status(500).json({ error: "Failed to update image banners." });
  }
};

const getActiveImgBanners = async (req, res) => {
  try {
    const imgBanners = await ImgBanner.find();

    res.json(imgBanners[0].banners);
  } catch (error) {
    console.error("Error fetching active image banners:", error);
    res.status(500).json({ error: "Failed to fetch active image banners." });
  }
};

const changeImgBannerStatus = async (req, res) => {
  const { id, status } = req.params;
  try {
    await ImgBanner.findByIdAndUpdate(id, { active: status });
    res.json({ success: true });
  } catch (error) {
    console.error("Error changing the status of image banner:", error);
    res
      .status(500)
      .json({ error: "Failed to set change image banner status." });
  }
};

module.exports = {
  imgBannerUpload,
  uploadImgBanners,
  deleteUpImgBanners,
  deleteOldImgBanners,
  getImgBanners,
  getActiveImgBanners,
  changeImgBannerStatus,
  updateBanners,
};
