import express from "express";
import { submitSupportMessage } from "../controllers/support.controller.js";

const router = express.Router();

router.post("/", submitSupportMessage);

export default router;
