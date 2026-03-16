import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
    matchName: { type: String, required: true }, // e.g., "CSK vs MI"
    externalId: { type: String, unique: true, sparse: true },
    startTime: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ["scheduled", "live", "completed", "cancelled"], 
        default: "scheduled" 
    },
    isPredictionsEnabled: { type: Boolean, default: false },
    venue: { type: String },
    team1: {
        name: String,
        logo: String
    },
    team2: {
        name: String,
        logo: String
    },
    currentScore: { type: String, default: "0/0 (0.0)" },
    isBallInQueue: { type: Boolean, default: false }
}, { timestamps: true });

const Match = mongoose.model("Match", MatchSchema);
export default Match;
