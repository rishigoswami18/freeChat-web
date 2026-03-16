import express from "express";
import { enableTestMatch, getSystemLatency } from "../controllers/test.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Hidden Test Mode routes
router.post("/enable-match/:matchId", protectRoute, enableTestMatch);
router.get("/latency-report", protectRoute, getSystemLatency);

export default router;
