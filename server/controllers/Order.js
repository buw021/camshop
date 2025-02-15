const Order = require("../models/orders");

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
