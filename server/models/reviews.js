const mongoose = require("mongoose");
const { Schema } = mongoose;

const Reviews = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product.variants",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  title: {
    type: String,

    default: "",
  },
  message: {
    type: String,

    default: "",
  },
  edit: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const Review = mongoose.model("Reviews", Reviews);
module.exports = Review;
