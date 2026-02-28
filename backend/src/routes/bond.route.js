import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateMood, getDailyInsight } from "../controllers/bond.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/insight", getDailyInsight);
router.put("/mood", updateMood);

export default router;
