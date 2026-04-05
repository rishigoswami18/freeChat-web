import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { 
        type: String, 
        enum: ["health", "learning", "finance", "productivity", "other"], 
        required: true 
    },
    durationDays: { type: Number, required: true, min: 1 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    stakeAmountUnits: { type: Number, required: true, min: 100 }, // In paise
    status: { 
        type: String, 
        enum: ["active", "in_review", "completed", "failed", "cancelled"], 
        default: "active",
        index: true
    },
    completedDays: { type: Number, default: 0 },
    missedDays: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    completionThreshold: { type: Number, default: 0.8 }, // 80%
    requiresValidation: { type: Boolean, default: true },
    validationQuorum: { type: Number, default: 3 },
    validationThreshold: { type: Number, default: 0.67 }, // 67%
    evidenceType: { type: String, enum: ["photo", "text", "link", "any"], default: "any" },
    rewardBps: { type: Number, default: 1000 }, // 10%
    penaltyBps: { type: Number, default: 10000 }, // 100%
    stakeTxId: { type: mongoose.Schema.Types.ObjectId, ref: "TransactionHistory" },
    rewardTxId: { type: mongoose.Schema.Types.ObjectId, ref: "TransactionHistory" },
    penaltyTxId: { type: mongoose.Schema.Types.ObjectId, ref: "TransactionHistory" },
    minDailyFocusMinutes: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

GoalSchema.virtual("progressPct").get(function() {
    return Math.round((this.completedDays / this.durationDays) * 100);
});

GoalSchema.virtual("stakeAmount").get(function() {
    return (this.stakeAmountUnits / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
    });
});

GoalSchema.virtual("daysRemaining").get(function() {
    const remaining = Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
});

GoalSchema.statics.isEligibleForCompletion = function(goal) {
    const thresholdMet = (goal.completedDays / goal.durationDays) >= goal.completionThreshold;
    const timeEnded = new Date() >= goal.endDate;
    return thresholdMet && timeEnded;
};

GoalSchema.statics.computeRewardUnits = function(goal) {
    return Math.floor(goal.stakeAmountUnits + (goal.stakeAmountUnits * goal.rewardBps / 10000));
};

GoalSchema.statics.computePenaltyUnits = function(goal) {
    return Math.floor(goal.stakeAmountUnits * goal.penaltyBps / 10000);
};

export default mongoose.model("Goal", GoalSchema);
