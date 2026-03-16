import mongoose from "mongoose";
import dotenv from "dotenv";
import Match from "./src/models/Match.js";

dotenv.config();

const forceLiveRcbSrh = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("✅ Database connected.");

        const liveMatchData = {
            matchName: "RCB vs SRH",
            startTime: new Date(),
            status: "live",
            isPredictionsEnabled: true,
            venue: "M. Chinnaswamy Stadium, Bengaluru",
            team1: { 
                name: "RCB", 
                logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Round/RCBround.png" 
            },
            team2: { 
                name: "SRH", 
                logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/Round/SRHround.png" 
            },
            currentScore: "214/3 (17.4)"
        };

        const match = await Match.findOneAndUpdate(
            { matchName: "RCB vs SRH" },
            liveMatchData,
            { upsert: true, new: true }
        );

        console.log(`🔥 Match forced to LIVE: ${match.matchName}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

forceLiveRcbSrh();
