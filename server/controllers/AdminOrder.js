const Order = require("../models/orders");
const Stripe = require("stripe");
const STRIPE = new Stripe(process.env.STRIPE_SK);

const updateOrderStatus = async (req, res) => {
  const { orderId, action, trackingNo, trackingLink } = req.body;

  try {
    let message = "";
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    switch (action) {
      case "fulfill":
        order.fulfilled = true;
        order.status = "processed";
        message = "Order fulfilled successfully.";
        break;
      case "cancel":
        if (order.status === "shipped" || order.status === "delivered") {
          return res.status(400).json({
            error: "Cannot cancel an order that has been shipped or delivered.",
          });
        }
        order.status = "cancelled";
        message = "Order has been cancelled.";
        break;
      case "shipped":
        order.status = "shipped";
        message = "Update order status to shipped.";
        break;
      case "delivered":
        order.status = "delivered";
        message = "Order has been delivered.";
        break;
      case "refund":
        order.status = "refund on process";
        message = "Refund process initiated.";
        break;
      case "updateTracking":
        message = "Tracking number updated.";
      default:
        return res.status(400).json({ error: "Invalid action." });
    }

    if (trackingNo && trackingLink) {
      order.trackingNo = trackingNo;
      order.trackingLink = trackingLink;
    }

    if (order.isModified()) {
      await order.save();
    }

    res.json({ message: message, order: order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status." });
  }
};

const getOrdersAdmin = async (req, res) => {
  const {
    status,
    paymentStatus,
    fulfillmentStatus,
    dateStart,
    dateEnd,
    searchQuery,
    currentPage,
    limit,
  } = req.query;

  try {
    let orderQuery = {};
    if (status) {
      const statusArray = Array.isArray(status) ? status : status.split(",");
      orderQuery.status = { $in: statusArray };
    } else {
      orderQuery.status = { $ne: "cancelled" };
    }
    if (paymentStatus) {
      orderQuery.paymentStatus = paymentStatus === "paid" ? true : false;
    }
    if (fulfillmentStatus) {
      orderQuery.fulfilled = fulfillmentStatus === "fulfilled" ? true : false;
    }
    if (dateStart && dateEnd) {
      orderQuery.createdAt = {
        $gte: new Date(new Date(dateStart).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(dateEnd).setHours(23, 59, 59, 999)),
      };
    }
    if (searchQuery) {
      orderQuery = {
        $or: [
          { customOrderId: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
          { name: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const orders = await Order.find(orderQuery)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};

module.exports = {
  updateOrderStatus,
  getOrdersAdmin,
};
