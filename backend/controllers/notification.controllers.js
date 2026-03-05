import client from "../prisma.js";

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await client.notification.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    });

    const total = await client.notification.count({ where: { user_id: userId } });
    const unreadCount = await client.notification.count({
      where: { user_id: userId, isRead: false }
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

// Mark a single notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId, userId } = req.params;

    const notification = await client.notification.findFirst({
      where: { id: notificationId, user_id: userId }
    });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    await client.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error updating notification" });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await client.notification.updateMany({
      where: { user_id: userId, isRead: false },
      data: { isRead: true }
    });

    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error updating notifications" });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId, userId } = req.params;

    const notification = await client.notification.findFirst({
      where: { id: notificationId, user_id: userId }
    });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    await client.notification.delete({ where: { id: notificationId } });

    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error deleting notification" });
  }
};

// Delete all notifications for a user
export const clearAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    await client.notification.deleteMany({ where: { user_id: userId } });

    return res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error clearing notifications" });
  }
};