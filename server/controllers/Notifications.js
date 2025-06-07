const Notification = require("../models/notification");

const getNotifications = async (req, res) => {
  const { type = "all", page = 1, limit = 10 } = req.query;

  const query = type === "all" ? {} : { status: type };

  try {
    const notifications = await Notification.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
      {
        $addFields: {
          formattedDate: {
            $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
          },
        },
      },
    ]);

    const total = await Notification.countDocuments(query);
    res.status(200).json({
      notifications,
      total,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ status: "unread" });
    res.status(200).json(unreadCount);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

const updateToRead = async (req, res) => {
  const { id } = req.body;

  try {
    const notification = await Notification.findByIdAndUpdate(id, {
      status: "read",
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification updated", notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

module.exports = { getNotifications, getUnreadCount, updateToRead };
