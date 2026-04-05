import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import Progress from "../models/Progress.js";
import Goal from "../models/Goal.js";
import Validation from "../models/Validation.js";
import FocusSession from "../models/FocusSession.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", async (req, res) => {
    try {
        const { goalId, note, evidenceText, evidenceLink, evidenceImageKey } = req.body;
        const goal = await Goal.findById(goalId);
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        if (goal.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

        const dayNumber = Math.floor((new Date() - goal.startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Fetch focus sessions for today
        const midnight = new Date();
        midnight.setHours(0, 0, 0, 0);
        
        const focusSessions = await FocusSession.find({
            userId: req.user._id,
            startTime: { $gte: midnight },
            status: "completed"
        });

        const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
        const focusIds = focusSessions.map(s => s._id);

        const progress = await Progress.findOneAndUpdate(
            { goalId, dayNumber },
            { 
                $setOnInsert: {
                    userId: req.user._id,
                    goalId, dayNumber, note, evidenceText, evidenceLink, evidenceImageKey,
                    focusSessionIds: focusIds,
                    totalFocusMinutes,
                    meetsMinFocusRequirement: totalFocusMinutes >= (goal.minDailyFocusMinutes || 0),
                    validationStatus: goal.requiresValidation ? "pending" : "auto_approved"
                }
            },
            { upsert: true, new: true, runValidators: true }
        );

        if (!progress.isNew && progress.dayNumber === dayNumber) {
            return res.status(409).json({ message: "Progress already submitted for today" });
        }

        if (progress.validationStatus === "auto_approved") {
            await progress.updateGoalCounters(true);
        }

        res.status(201).json(progress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/validate-queue", async (req, res) => {
    try {
        const alreadyValidated = await Validation.find({ validatorId: req.user._id }).distinct("progressId");
        
        const queue = await Progress.find({
            userId: { $ne: req.user._id },
            validationStatus: "pending",
            _id: { $nin: alreadyValidated }
        })
        .populate("goalId", "title evidenceType")
        .populate("userId", "fullName")
        .sort({ createdAt: 1 })
        .limit(10);
        
        res.json(queue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/:id/validate", async (req, res) => {
    try {
        const progress = await Progress.findById(req.params.id).populate("goalId");
        if (!progress) return res.status(404).json({ message: "Progress not found" });
        if (progress.userId.toString() === req.user._id.toString()) return res.status(403).json({ message: "Can't self-validate" });
        if (progress.validationStatus !== "pending") return res.status(400).json({ message: "Already finalised" });

        const { decision, reason } = req.body;
        
        await Validation.create({
            progressId: progress._id,
            goalId: progress.goalId._id,
            validatorId: req.user._id,
            decision, reason
        });

        if (decision === "approve") progress.approveCount += 1;
        else progress.rejectCount += 1;
        await progress.save();

        const finalisedStatus = await progress.resolveValidation(
            progress.goalId.validationQuorum || 3, 
            progress.goalId.validationThreshold || 0.67
        );

        if (finalisedStatus) {
            await Validation.settleValidators(progress._id, finalisedStatus);
        }

        res.json({ finalisedStatus });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: "Double-vote detected" });
        res.status(500).json({ message: err.message });
    }
});

export default router;
