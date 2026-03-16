import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getIplLiveStats, submitPrediction, triggerScoreBlast, getUpcomingMatches, syncMatchesNow } from "../controllers/ipl.controller.js";

const router = express.Router();

router.get("/live-stats", protectRoute, getIplLiveStats);
router.get("/upcoming", protectRoute, getUpcomingMatches);
router.get("/sync", protectRoute, syncMatchesNow);
router.post("/predict", protectRoute, submitPrediction);
router.post("/blast", protectRoute, triggerScoreBlast); // For demo/admin purposes

export default router;
