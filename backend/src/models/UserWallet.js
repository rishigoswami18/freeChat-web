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
    gems: {
        type: Number,
        default: 0
    },
    lastRewardClaimDate: {
        type: Date,
        default: null
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Automatically calculate totalBalance before each save
UserWalletSchema.pre('save', function(next) {
    this.totalBalance = (this.winnings || 0) + (this.bonusBalance || 0) + (this.frozenBalance || 0);
    this.lastUpdated = new Date();
    next();
});

// For findOneAndUpdate, we need a separate way or just ensure totalBalance isn't relied on for critical logic
// or use a post-find middleware. For now, display logic should just sum the fields on frontend.

export default mongoose.model("UserWallet", UserWalletSchema);
