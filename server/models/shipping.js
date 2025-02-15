const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShippingSchema = new Schema({
  shippingType: {
    type: String,
    required: true,
    default: null,
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingLabel: {
    type: String,
    required: true,
    default: null,
  },
  shippingTime: {
    type: String,
    required: true,
    default: null,
  },
});

const Shipping = mongoose.model("Shipping", ShippingSchema);

module.exports = Shipping;
