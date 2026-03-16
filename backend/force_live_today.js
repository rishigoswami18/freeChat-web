import mongoose from "mongoose";
import dotenv from "dotenv";
import Match from "./src/models/Match.js";

dotenv.config();

const forceCurrentLiveMatch = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("✅ Database connected.");

        // 1. Set a match to LIVE right now (March 16)
        const liveMatchData = {
            matchName: "CSK vs MI",
            startTime: new Date(), // Now
            status: "live",
            isPredictionsEnabled: true,
            venue: "Wankhede Stadium, Mumbai",
            team1: { 
                name: "CSK", 
                logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CHH/Logos/Round/CSKround.png" 
            },
            team2: { 
                name: "MI", 
                logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MI/Logos/Round/MIround.png" 
            },
            currentScore: "184/4 (18.2)"
        };

        const match = await Match.findOneAndUpdate(
            { matchName: "CSK vs MI" },
            liveMatchData,
            { upsert: true, new: true }
        );

        console.log(`🔥 CSK vs MI forced to LIVE for TODAY (${new Date().toLocaleDateString()})`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

forceCurrentLiveMatch();
