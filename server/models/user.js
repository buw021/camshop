const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new Schema({
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
});

const orderItemSchema = new Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  customOrderId: {
    type: String,
    required: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const cartItemSchema = new Schema({
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
  quantity: { type: Number, required: true, min: 1 },
});

const userAddress = new Schema({
  firstName: String,
  lastName: String,
  phoneNo: String,
  address: String,
  city: String,
  state: String,
  zip: Number,
  country: String,
  default: Boolean,
});

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstname: {
      type: String,
      default: "",
    },
    lastname: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phoneNo: {
      type: String,
      default: "",
    },
    address: {
      type: [userAddress],
      default: [],
    },
    cart: {
      type: [cartItemSchema],
      default: [],
    },
    wishlist: {
      type: [wishlistSchema],
      default: [],
    },
    orders: {
      type: [orderItemSchema],
      default: [],
    },
    sessionCount: {
      type: Number,
      default: 0,
    },
    lastSessionCreatedAt: {
      type: Date,
      default: null,
    },
    reivews: {
      type: [],
      default: [],
    },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    confirmed: { type: Boolean, default: false },
  },

  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
