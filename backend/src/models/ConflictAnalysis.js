import mongoose from "mongoose";

const conflictAnalysisSchema = new mongoose.Schema({
    channelId: {
        type: String,
        required: true,
        index: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    summary: {
        type: String,
        required: true
    },
    rootCause: String,
    suggestions: [String],
    tensionLevel: {
        type: Number, // 1-10
        default: 1
    },
    analyzedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const ConflictAnalysis = mongoose.model("ConflictAnalysis", conflictAnalysisSchema);

export default ConflictAnalysis;
