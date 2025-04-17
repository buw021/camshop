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
    deliveryDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const orderSchema = new Schema(
  {
    customOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    sessionUrl: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
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
      firstName: String,
      lastName: String,
      phoneNo: String,
      address: String,
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
    fulfilled: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
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
      enum: [
        "ordered",
        "pending",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "processed",
        "return",
        "refund requested",
        "refund on process",
        "payment failed",
      ],
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
    trackingLink: {
      type: String,
      default: null,
    },
    receiptLink: {
      type: String,
      default: null,
    },
    review: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
