// routes/notifications.routes.js
import express from "express";
import { clearAllNotifications, deleteNotification, getUserNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notification.controllers.js";


const router = express.Router();

router.get("/:userId", getUserNotifications);
router.patch("/:notificationId/user/:userId/read", markNotificationRead);
router.patch("/:userId/read-all", markAllNotificationsRead);
router.delete("/:notificationId/user/:userId", deleteNotification);
router.delete("/:userId/clear-all", clearAllNotifications);

export default router;