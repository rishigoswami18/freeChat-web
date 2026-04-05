import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { playCoinFlip, playDiceRoll } from "../controllers/minigame.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/coin-flip", playCoinFlip);
router.post("/dice-roll", playDiceRoll);

export default router;
