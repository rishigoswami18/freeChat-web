import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema({
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dayNumber: { type: Number, required: true },
    note: { type: String, trim: true },
    evidenceText: { type: String, trim: true },
    evidenceImageKey: { type: String }, // S3 Key reference
    evidenceLink: { type: String, trim: true },
    validationStatus: { 
        type: String, 
        enum: ["pending", "approved", "rejected", "auto_approved"], 
        default: "pending",
        index: true
    },
    approveCount: { type: Number, default: 0 },
    rejectCount: { type: Number, default: 0 },
    finalisedAt: { type: Date },
    focusSessionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "FocusSession" }],
    totalFocusMinutes: { type: Number, default: 0 },
    meetsMinFocusRequirement: { type: Boolean, default: false },
    streakAtSubmission: { type: Number, default: 0 },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, trim: true }
}, { timestamps: true });

ProgressSchema.index({ goalId: 1, dayNumber: 1 }, { unique: true });

ProgressSchema.methods.updateGoalCounters = async function(approved) {
    const Goal = mongoose.model("Goal");
    const goal = await Goal.findById(this.goalId);
    if (!goal) return;

    if (approved) {
        goal.completedDays += 1;
        goal.currentStreak += 1;
        if (goal.currentStreak > goal.longestStreak) {
            goal.longestStreak = goal.currentStreak;
        }
    } else {
        goal.missedDays += 1;
        goal.currentStreak = 0;
        
        // Auto-fail check
        const maxPossibleCompletion = (goal.durationDays - goal.missedDays) / goal.durationDays;
        if (maxPossibleCompletion < goal.completionThreshold) {
            goal.status = "failed";
        }
    }
    await goal.save();
};

ProgressSchema.methods.resolveValidation = async function(quorum, threshold) {
    if (this.validationStatus !== "pending") return;

    const totalVotes = this.approveCount + this.rejectCount;
    if (totalVotes < quorum) return;

    const approvalPct = this.approveCount / totalVotes;
    const finalApproved = approvalPct >= threshold;
    this.validationStatus = finalApproved ? "approved" : "rejected";
    this.finalisedAt = new Date();
    await this.save();

    await this.updateGoalCounters(finalApproved);
    return this.validationStatus;
};

export default mongoose.model("Progress", ProgressSchema);
