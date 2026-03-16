import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getIplLiveStats, 
    submitPrediction, 
    triggerScoreBlast, 
    getUpcomingMatches, 
    syncMatchesNow,
    getLiveTicker,
    getIplDetails
} from "../controllers/ipl.controller.js";

const router = express.Router();

/**
 * High-Velocity Sports Arena Routes
 * (Now supporting multiple series & automated tiers)
 */
router.get("/live", protectRoute, getIplLiveStats);
router.get("/fixtures", protectRoute, getUpcomingMatches);
router.get("/ticker", protectRoute, getLiveTicker);
router.get("/details", protectRoute, getIplDetails);
router.get("/sync-fixtures", protectRoute, syncMatchesNow);
router.post("/predict", protectRoute, submitPrediction);
router.post("/broadcast", protectRoute, triggerScoreBlast);

export default router;
