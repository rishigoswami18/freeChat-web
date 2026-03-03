import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { broadcastSystemNotification, clearAdminChats } from "../controllers/notification.controller.js";

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

export default router;
