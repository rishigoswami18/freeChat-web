import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getIplLiveStats, 
    submitPrediction, 
    triggerScoreBlast, 
    getUpcomingMatches, 
    syncMatchesNow 
} from "../controllers/ipl.controller.js";

const router = express.Router();

router.get("/live", protectRoute, getIplLiveStats);
router.get("/fixtures", protectRoute, getUpcomingMatches);
router.get("/sync-fixtures", protectRoute, syncMatchesNow);
router.post("/predict", protectRoute, submitPrediction);
router.post("/broadcast", protectRoute, triggerScoreBlast);

export default router;
