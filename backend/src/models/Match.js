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
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: "Series" },
    externalSeriesId: { type: String },
    tier: { 
        type: String, 
        enum: ["gold", "silver", "bronze"], 
        default: "bronze" 
    },
    entryFee: { type: Number, default: 10 },
    prizePool: { type: Number, default: 0 },
    participantsCount: { type: Number, default: 0 },
    currentScore: { type: String, default: "0/0 (0.0)" },
    importantStatus: { type: String },
    isBallInQueue: { type: Boolean, default: false }
}, { timestamps: true });

MatchSchema.index({ status: 1, startTime: 1 });
MatchSchema.index({ seriesId: 1, startTime: 1 });

const Match = mongoose.model("Match", MatchSchema);
export default Match;
