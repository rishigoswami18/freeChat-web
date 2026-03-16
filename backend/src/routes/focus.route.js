import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { startFocusSession, getFocusStatus, endFocusSession } from "../controllers/focus.controller.js";

const router = express.Router();

/**
 * AI Career Focus Mode Routes
 * Protected by Global Auth Middleware
 */

router.get("/status", protectRoute, getFocusStatus);
router.post("/start", protectRoute, startFocusSession);
router.post("/end", protectRoute, endFocusSession);

export default router;
