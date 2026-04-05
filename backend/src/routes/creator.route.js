import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getCreatorStats, 
    getEliteFans, 
    getCreatorActivities, 
    getCreatorAnalytics 
} from "../controllers/creator.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/stats", getCreatorStats);
router.get("/elite-fans", getEliteFans);
router.get("/activities", getCreatorActivities);
router.get("/analytics", getCreatorAnalytics);

export default router;
