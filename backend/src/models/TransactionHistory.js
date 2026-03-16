import mongoose from "mongoose";

const TransactionHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ["WIN", "LOSS", "PURCHASE", "BONUS", "REFUND"],
        required: true
    },
    matchId: {
        type: String,
        default: "GLOBAL" // Tracks which IPL match this was for
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["SUCCESS", "FAILED", "PENDING"],
        default: "SUCCESS"
    },
    referenceId: {
        type: String, // Prediction ID or Order ID
        index: true
    }
}, { timestamps: true });

// Compounded index for fast history retrieval
TransactionHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("TransactionHistory", TransactionHistorySchema);
