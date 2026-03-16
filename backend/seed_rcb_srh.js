import mongoose from "mongoose";
import dotenv from "dotenv";
import Match from "./src/models/Match.js";

dotenv.config();

const seedRcbSrh = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("✅ Database connected.");

        // We'll set the start time to March 28, 2026
        const startTime = new Date("2026-03-28T14:00:00Z"); // 7:30 PM IST

        const matchData = {
            matchName: "RCB vs SRH",
            startTime: startTime,
            status: "scheduled",
            isPredictionsEnabled: false,
            venue: "M. Chinnaswamy Stadium, Bengaluru",
            team1: { 
                name: "RCB", 
                logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Round/RCBround.png" 
            },
            team2: { 
                name: "SRH", 
                logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/Round/SRHround.png" 
            },
            currentScore: "0/0 (0.0)"
        };

        const match = await Match.findOneAndUpdate(
            { matchName: "RCB vs SRH" },
            matchData,
            { upsert: true, new: true }
        );

        console.log(`✅ [MatchSeeder] RCB vs SRH added for March 28th!`);
        console.log(`📅 Start Time: ${match.startTime}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedRcbSrh();
