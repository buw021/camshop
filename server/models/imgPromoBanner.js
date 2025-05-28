const mongoose = require("mongoose");
const { Schema } = mongoose;

const imgBanner = new Schema({
  banners: [
    {
      filepath: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

// Middleware to ensure only one banner is active

const ImgBanner = mongoose.model("ImgBanner", imgBanner);

module.exports = ImgBanner;
