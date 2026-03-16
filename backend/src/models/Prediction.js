import mongoose from "mongoose";

const PredictionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    matchId: { type: String, required: true },
    ballId: { type: String }, // e.g., "15.4" or unique ball hash
    predictionValue: { type: String, required: true }, // e.g., "6", "WICKET", "DOT"
    wagerAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ["pending", "won", "lost", "refunded"], 
        default: "pending" 
    },
    multiplier: { type: Number, default: 2 },
    resolvedAt: { type: Date },
    ipAddress: { type: String }
}, { timestamps: true });

const Prediction = mongoose.model("Prediction", PredictionSchema);
export default Prediction;
