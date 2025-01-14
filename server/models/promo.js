const mongoose = require("mongoose");
const { Schema } = mongoose;
const promoCodeSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["percentage", "fixed"],
  },
  value: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  keywords: {
    type: [String],
    default: null,
  },
});

const promoCodeUsage = new Schema({
  code: {
    type: String,
    required: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
});

const promoCodeUsageSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  promoCodeUsage: [promoCodeUsage],
});

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
const PromoCodeUsage = mongoose.model("PromoCodeUsage", promoCodeUsageSchema);

//Module Export
module.exports = { PromoCode, PromoCodeUsage };
