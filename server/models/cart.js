const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product.variants", // Adjusted to match the embedded variant schema in Product
    required: true,
  },
  name: String,
  variantName: String,
  variantColor: String,
  variantImg: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
