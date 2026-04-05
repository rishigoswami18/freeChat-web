import mongoose from "mongoose";

const ValidationSchema = new mongoose.Schema({
    progressId: { type: mongoose.Schema.Types.ObjectId, ref: "Progress", required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true, index: true },
    validatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    decision: { type: String, enum: ["approve", "reject"], required: true },
    reason: { type: String, trim: true },
    agreedWithConsensus: { type: Boolean, default: null },
    rewardUnits: { type: Number, default: 0 },
    penaltyUnits: { type: Number, default: 0 }
}, { timestamps: true });

ValidationSchema.index({ progressId: 1, validatorId: 1 }, { unique: true });

ValidationSchema.statics.settleValidators = async function(progressId, finalStatus) {
    const UserWallet = mongoose.model("UserWallet");
    const validations = await this.find({ progressId });
    const rewardBps = 10; // ₹0.10 in paise
    const penaltyBps = 5; // ₹0.05 in paise

    for (const validation of validations) {
        const agreed = (validation.decision === "approve" && finalStatus === "approved") || 
                       (validation.decision === "reject" && finalStatus === "rejected");
        
        validation.agreedWithConsensus = agreed;
        validation.rewardUnits = agreed ? rewardBps : 0;
        validation.penaltyUnits = agreed ? 0 : penaltyBps;
        await validation.save();

        if (agreed) {
            await UserWallet.findOneAndUpdate(
                { userId: validation.validatorId },
                { $inc: { winnings: rewardBps, totalBalance: rewardBps } }
            );
        } else {
            await UserWallet.findOneAndUpdate(
                { userId: validation.validatorId },
                { $inc: { winnings: -penaltyBps, totalBalance: -penaltyBps } }
            );
        }
    }
};

export default mongoose.model("Validation", ValidationSchema);
