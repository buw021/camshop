const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    customOrderId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
