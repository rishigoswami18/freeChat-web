import mongoose from "mongoose";

const UserWalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },
    winnings: {
        type: Number,
        default: 0, // Coins won via skilled predictions (Withdrawable)
        min: 0
    },
    bonusBalance: {
        type: Number,
        default: 100, // Welcome/Referral bonus (Non-withdrawable)
        min: 0
    },
    frozenBalance: {
        type: Number,
        default: 0
    },
    totalBalance: {
        type: Number,
        default: 100 // Pre-calculated sum for display speed
    },
    tier: {
        type: String,
        enum: ["bronze", "silver", "gold"],
        default: "bronze"
    },
    currency: {
        type: String,
        default: "BC" 
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Optimistic lock check (optional for high traffic but recommended)
UserWalletSchema.index({ userId: 1, winnings: 1 });
UserWalletSchema.index({ userId: 1, totalBalance: 1 });

export default mongoose.model("UserWallet", UserWalletSchema);
