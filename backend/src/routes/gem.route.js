import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendGift, getWalletBalance, createGemOrder, verifyGemPayment } from "../controllers/gem.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/balance", getWalletBalance);
router.post("/send", sendGift);
router.post("/create-order", createGemOrder);
router.post("/verify-payment", verifyGemPayment);

export default router;
