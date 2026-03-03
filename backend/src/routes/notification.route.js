import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { broadcastSystemNotification } from "../controllers/notification.controller.js";

const router = express.Router();

/**
 * @route POST /api/notifications/broadcast
 * @desc  Send a system-wide notification to all users
 * @access Private (Admin only)
 */
router.post("/broadcast", protectRoute, broadcastSystemNotification);

export default router;
