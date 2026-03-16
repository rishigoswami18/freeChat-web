import mongoose from "mongoose";

const WithdrawalRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    upiId: { type: String, required: true, trim: true },
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected", "completed"], 
        default: "pending" 
    },
    adminNotes: { type: String },
    ipAddress: { type: String },
    deviceFingerprint: { type: String },
    processedAt: { type: Date }
}, { timestamps: true });

const WithdrawalRequest = mongoose.model("WithdrawalRequest", WithdrawalRequestSchema);
export default WithdrawalRequest;
