import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getIplLiveStats, submitPrediction, triggerScoreBlast, getUpcomingMatches, syncMatchesNow, getLiveTicker, getIplDetails, getIplSquads, getPythonScrape, getIplPointsTable, getIplStats, getIplSchedule, syncExternalData } from "../controllers/ipl.controller.js";

const router = express.Router();

router.get("/live-stats", protectRoute, getIplLiveStats);
router.post("/sync-external", syncExternalData);
router.get("/upcoming", protectRoute, getUpcomingMatches);
router.get("/ticker", protectRoute, getLiveTicker);
router.get("/details", protectRoute, getIplDetails);
router.get("/squads", protectRoute, getIplSquads);
router.get("/table", protectRoute, getIplPointsTable);
router.get("/stats", protectRoute, getIplStats);
router.get("/schedule", protectRoute, getIplSchedule);
router.get("/sync", protectRoute, syncMatchesNow);
router.post("/predict", protectRoute, submitPrediction);
router.post("/blast", protectRoute, triggerScoreBlast); 
router.get("/python-scrape", protectRoute, getPythonScrape);

export default router;
