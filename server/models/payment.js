// models/Payment.ts or Payment.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    stripePaymentId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

    amount: Number,
    totalAmount: Number,
    shippingCost: Number,
    currency: String,
    paymentStatus: String, // succeeded, failed, etc.
    paymentMethod: String,
    shippingMethod: String,
    created: { type: Date, default: Date.now },

    receiptUrl: String,
    email: String,
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
