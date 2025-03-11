const Order = require("../models/orders");
const User = require("../models/user");
const Stripe = require("stripe");
const STRIPE = new Stripe(process.env.STRIPE_SK);
const { getUser } = require("../helpers/getUser");

const getUserOrders = async (req, res) => {
  const { usertoken } = req.cookies;
  const { orderStatus } = req.query;
  try {
    const id = await getUser(usertoken);
    let statusFilter = { $ne: "cancelled" };

    if (orderStatus === "past") {
      statusFilter = { $in: ["delivered", "refunded"] };
    } else if (orderStatus === "current") {
      statusFilter = {
        $in: [
          "ordered",
          "shipped",
          "refund on process",
          "refund requested",
          "processed",
        ],
      };
    } else if (orderStatus === "pending") {
      statusFilter = { $in: ["pending"] };
    }

    const orders = await Order.find({
      userId: id,
      status: statusFilter,
    })
      .sort({ createdAt: -1 })
      .select(
        "-shippingAddress -sessionId -sessionUrl -userEmail -updatedAt -__v -userId"
      );
    /* "ordered",
        "paid",
        "pending",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "processed",
        "refund on process",
        "payment failed", */
    // Return the populated orders directly

    return res.json(orders);
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
      if (["ordered", "pending"].includes(populatedOrder.status)) {
        if (populatedOrder.status === "pending" && populatedOrder.sessionId) {
          try {
            const session = await STRIPE.checkout.sessions.retrieve(
              populatedOrder.sessionId
            );
            if (session.status !== "expired") {
              await STRIPE.checkout.sessions.expire(populatedOrder.sessionId);
            }
          } catch (error) {
            if (error.code !== "resource_missing") {
              throw error;
            }
            console.log("Session already expired or not found.");
          }
        }
        populatedOrder.status =
          populatedOrder.status === "ordered"
            ? "refund requested"
            : "cancelled";
        await populatedOrder.save();
        return res.json({
          message: `Order cancelled successfully. ${
            populatedOrder.status === "refund requested"
              ? "Refund request is started."
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
        populatedOrder.status = "refund requested";
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

const orderReceived = async (req, res) => {
  const { usertoken } = req.cookies;
  const { orderId } = req.body;

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

    if (populatedOrder.status !== "shipped") {
      return res.status(400).json({ error: "order is not shipped yet." });
    }

    populatedOrder.status = "delivered";
    await populatedOrder.save();

    res.json({ message: "Order received successfully" });
  } catch (error) {}
};

//Admin

const getOrdersAdmin = async (req, res) => {
  const {
    sort,
    status,
    paymentStatus,
    fulfillment,
    dateStart,
    dateEnd,
    cancelled,
  } = req.query;
  try {
    let orderQuery = {};
    if (status) {
      orderQuery.status = status;
    }
    if (paymentStatus) {
      orderQuery.paymentStatus = paymentStatus === "paid" ? true : false;
    }
    if (fulfillment) {
      orderQuery.fulfilled = fulfillment === "fulfilled" ? true : false;
    }
    if (dateStart && dateEnd) {
      orderQuery.createdAt = {
        $gte: new Date(dateStart),
        $lt: new Date(dateEnd),
      };
    }
    if (!cancelled) {
      orderQuery.status = { $ne: "cancelled" };
    }
    const orders = await Order.find(orderQuery).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};

module.exports = {
  getOrderStatus,
  getUserOrders,
  getOrders,
  updateOrderStatus,
  orderCancelRefund,
  getOrdersAdmin,
  orderReceived,
};
