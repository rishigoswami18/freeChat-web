import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getLeaderboard, getOrganizations } from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get("/", protectRoute, getLeaderboard);
router.get("/organizations", protectRoute, getOrganizations);

export default router;
