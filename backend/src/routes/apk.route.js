import express from "express";
import { getLatestRelease, getAllReleases, createRelease, updateRelease, deleteRelease, downloadRelease, getAppStats } from "../controllers/apk.controller.js";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/latest", getLatestRelease);
router.get("/download/:id", downloadRelease);
router.get("/stats", getAppStats);

// Admin routes
router.get("/all", protectRoute, isAdmin, getAllReleases);
router.post("/", protectRoute, isAdmin, createRelease);
router.put("/:id", protectRoute, isAdmin, updateRelease);
router.delete("/:id", protectRoute, isAdmin, deleteRelease);

export default router;
