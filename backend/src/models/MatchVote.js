import mongoose from "mongoose";

const MatchVoteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    matchId: { type: String, required: true },
    team: { type: String, required: true }, // e.g. "RCB" or "CSK"
}, { timestamps: true });

// Ensure one vote per user per match
MatchVoteSchema.index({ userId: 1, matchId: 1 }, { unique: true });

const MatchVote = mongoose.model("MatchVote", MatchVoteSchema);
export default MatchVote;
