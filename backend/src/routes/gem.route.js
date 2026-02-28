import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendGift, getWalletBalance, purchaseGems } from "../controllers/gem.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/balance", getWalletBalance);
router.post("/send", sendGift);
router.post("/purchase", purchaseGems);

export default router;
