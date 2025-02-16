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
      unique: true,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    password: String,
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
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
