const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
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
    name: {
      type: String,
      required: true,
    },
    variantName: {
      type: String,
      default: null,
    },
    variantColor: {
      type: String,
      default: null,
    },
    variantImg: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    salePrice: {
      type: Number,
      default: null,
    },
    discountedPrice: {
      type: Number,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

const orderSchema = new Schema(
  {
    _id: {
      type: String, // Define _id as a string to use custom values
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingCost: { type: Number, required: true },
    shippingOption: {
      type: String,
      required: true,
      enum: ["free", "standard", "express"],
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "card",
    },
    promoCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    originalTotalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["ordered", "paid", "pending", "shipped", "delivered", "cancelled"],
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    trackingNo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
