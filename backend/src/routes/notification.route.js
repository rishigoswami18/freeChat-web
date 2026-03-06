import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { broadcastSystemNotification, clearAdminChats, notifyPendingActions, notifyLiveStreamStart } from "../controllers/notification.controller.js";

const router = express.Router();

/**
 * @route POST /api/notifications/broadcast
 * @desc  Send a system-wide notification to all users
 * @access Private (Admin only)
 */
router.post("/broadcast", protectRoute, broadcastSystemNotification);

/**
 * @route POST /api/notifications/clear-chats
 * @desc  Hide all admin chats to clear clutter
 * @access Private (Admin only)
 */
router.post("/clear-chats", protectRoute, clearAdminChats);

/**
 * @route POST /api/notifications/sweep-pending
 * @desc  Notify users with unread messages AND pending friend requests
 * @access Private (Admin only)
 */
router.post("/sweep-pending", protectRoute, notifyPendingActions);

/**
 * @route POST /api/notifications/notify-live
 * @desc  Notify friends that you have started a live stream
 * @access Private (Logged in users)
 */
router.post("/notify-live", protectRoute, notifyLiveStreamStart);

export default router;
