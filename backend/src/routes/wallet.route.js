import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { requestWithdrawal } from "../controllers/wallet.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/withdraw", requestWithdrawal);

export default router;
