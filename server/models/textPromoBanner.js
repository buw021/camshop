const mongoose = require("mongoose");
const { Schema } = mongoose;

const textBanners = new Schema({
  text: [
    {
      text: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        default: true,
      },
      /*    startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: false,
        default: null,
      }, */
    },
  ],
});
textBanners.pre("save", async function (next) {
  const TextBanner = mongoose.model("TextBanner");

  // Only run if any text item is being set to active
  if (this.text && this.text.some((item) => item.active)) {
    // Set all other banners' text items to inactive
    await TextBanner.updateMany(
      { _id: { $ne: this._id } },
      { $set: { "text.$[].active": false } }
    );
  }

  next();
});
const TextBanner = mongoose.model("TextBanner", textBanners);

module.exports = TextBanner;
