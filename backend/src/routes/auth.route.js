import express from "express";
import { login, logout, onboard, signup, googleLogin, googleLoginWithAccessToken, requestOTP, forgotPassword, resetPassword } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/request-otp", requestOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleLogin);
router.post("/google-token", googleLoginWithAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/onboarding", protectRoute, onboard);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;