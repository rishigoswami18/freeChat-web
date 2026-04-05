import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGoal, getUserGoals } from "../controllers/goal.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createGoal);
router.get("/user", getUserGoals);

export default router;
