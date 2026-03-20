import mongoose from "mongoose";

const SquadSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
    players: [{
        id: String,
        name: String,
        team: String,
        role: String,
        credits: Number,
        points: Number,
        logo: String
    }],
    captainId: { type: String, required: true },
    viceCaptainId: { type: String, required: true },
    wagerAmount: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ["upcoming", "live", "completed"], 
        default: "upcoming" 
    },
    totalPoints: { type: Number, default: 0 },
    rank: { type: Number },
    prizeWon: { type: Number, default: 0 }
}, { timestamps: true });

const Squad = mongoose.model("Squad", SquadSchema);
export default Squad;
