import mongoose from "mongoose";
import dotenv from "dotenv";
import Match from "./src/models/Match.js";

dotenv.config();

const setRcbSrhActive = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("✅ Database connected.");

        // 1. Finish all other matches
        await Match.updateMany(
            { matchName: { $ne: "RCB vs SRH" } },
            { status: "finished" }
        );
        console.log("🏳️ Other matches set to finished.");

        // 2. Ensure RCB vs SRH is live with a recent start time
        const match = await Match.findOneAndUpdate(
            { matchName: "RCB vs SRH" },
            { 
                status: "live", 
                startTime: new Date(),
                isPredictionsEnabled: true,
                currentScore: "214/3 (17.4)",
                team1: { 
                    name: "RCB", 
                    logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Round/RCBround.png" 
                },
                team2: { 
                    name: "SRH", 
                    logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/Round/SRHround.png" 
                }
            },
            { upsert: true, new: true }
        );

        console.log(`🚀 RCB vs SRH is now the PRIMARY LIVE match!`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

setRcbSrhActive();
