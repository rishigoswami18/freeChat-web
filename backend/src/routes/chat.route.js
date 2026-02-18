import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getStreamToken,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

// existing route (NO CHANGE)
router.get("/token", protectRoute, getStreamToken);

// NEW route → emotion-aware message sending
router.post("/send", protectRoute, sendMessage);

export default router;
