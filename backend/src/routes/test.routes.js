import express from "express";
import { getSystemLatency } from "../controllers/test.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Hidden
router.get("/latency-report", protectRoute, getSystemLatency);

export default router;
