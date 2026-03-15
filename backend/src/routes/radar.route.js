import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getRadarPulse, triggerManualPulse } from "../controllers/radar.controller.js";

const router = express.Router();

router.get("/:channelId", protectRoute, getRadarPulse);
router.post("/trigger", protectRoute, triggerManualPulse);

export default router;
