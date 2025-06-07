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
    required: false,
    default: null,
  },
  minimumOrderValue: {
    type: Number,
    default: 0,
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

const promoCodeUsedSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  promoCodeUsed: [
    {
      code: {
        type: String,
        required: true,
      },
    },
  ],
});

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
const PromoCodeUsed = mongoose.model("PromoCodeUsed", promoCodeUsedSchema);

//Module Export
module.exports = { PromoCode, PromoCodeUsed };
