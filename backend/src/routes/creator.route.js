import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getCreatorStats, 
    getCreatorBonds, 
    getEliteFans,
    createBond
} from "../controllers/creator.controller.js";

const router = express.Router();

router.get("/stats", protectRoute, getCreatorStats);
router.get("/bonds", protectRoute, getCreatorBonds);
router.get("/elite-fans", protectRoute, getEliteFans);
router.post("/bonds", protectRoute, createBond);

export default router;
