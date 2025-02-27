const Order = require("../models/orders");
const User = require("../models/user");
const { getUser } = require("../helpers/getUser");
const getUserOrders = async (req, res) => {
  const { usertoken } = req.cookies;
  try {
    const user = await User.findById(usertoken).populate({
      path: "orders.orderId",
      model: "Order",
      options: { sort: { createdAt: -1 } },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return the populated orders directly
    return res.json(user.orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch user orders." });
  }
};

const getOrderStatus = async (req, res) => {
  const { usertoken } = req.cookies;
  const { orderId } = req.query;
  try {
    const userId = await getUser(usertoken);

    if (!userId) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = await User.findById(userId).populate({
      path: "orders._id",
      model: "Order",
      match: { archive: false },
      select: "status customOrderId",
    });

    const order = user.orders.find(
      (order) => order.customOrderId.toString() === orderId
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const populatedOrder = await Order.findById(order.orderId).select(
      "-__v -updatedAt -userId"
    );

    if (!populatedOrder) {
      return res.status(404).json({ error: "Order not found." });
    }

    return res.json(populatedOrder);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch user orders." });
  }
};

const getOrders = async (req, res) => {
  const { sort } = req.query;
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId, status, trackingNo } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (status) {
      if (status === "shipped" && !trackingNo) {
        return res
          .status(400)
          .json({ error: "Tracking number is required for shipped orders." });
      }
      order.status = status;
    }

    if (trackingNo) {
      order.trackingNo = trackingNo;
    }

    if (order.isModified()) {
      await order.save();
    }
    res.json({ message: "Order status updated successfully." });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status." });
  }
};

const orderCancelRefund = async (req, res) => {
  const { usertoken } = req.cookies;
  const { orderId, action } = req.body;
  if (action !== "cancel" && action !== "refund") {
    return res.status(400).json({ error: "Invalid action." });
  }

  if (!usertoken) {
    return res.status(401).json({ error: "Unauthorized: Missing token." });
  }
  if (!orderId) {
    return res.status(400).json({ error: "Missing order ID." });
  }
  try {
    const userId = await getUser(usertoken);

    if (!userId) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = await User.findById(userId).populate({
      path: "orders._id",
      model: "Order",
      match: { archive: false },
      select: "status customOrderId",
    });

    const order = user.orders.find(
      (order) => order.customOrderId.toString() === orderId
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const populatedOrder = await Order.findById(order.orderId).select(
      "-__v -updatedAt -userId"
    );

    if (!populatedOrder) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (action === "cancel") {
      if (["paid", "pending"].includes(populatedOrder.status)) {
        populatedOrder.status =
          populatedOrder.status === "paid" ? "refund on process" : "cancelled";
        await populatedOrder.save();
        return res.json({
          message: `Order cancelled successfully. ${
            populatedOrder.status === "refund on process"
              ? "Refund on process"
              : ""
          }`,
        });
      }

      if (populatedOrder.status === "shipped") {
        return res.status(400).json({
          error: "Cannot cancel order after it has been shipped.",
        });
      }
    } else {
      if (populatedOrder.status === "delivered") {
        populatedOrder.status = "refund on process";
        await populatedOrder.save();
        return res.json({
          message: "Request for refund is started.",
        });
      }
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Failed to cancel order." });
  }
};

module.exports = {
  getOrderStatus,
  getUserOrders,
  getOrders,
  updateOrderStatus,
};
