import mongoose from "mongoose";
import dotenv from "dotenv";
import Match from "./src/models/Match.js";

dotenv.config();

const seedIplSchedule = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("✅ Database connected.");

        // Clear existing matches for a clean schedule
        await Match.deleteMany({});
        console.log("🗑️ Existing matches cleared.");

        const matches = [
            {
                matchName: "CSK vs RCB",
                startTime: new Date("2026-03-29T14:00:00Z"),
                status: "scheduled",
                venue: "M. A. Chidambaram Stadium, Chennai",
                team1: { name: "CSK", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CHH/Logos/Round/CSKround.png" },
                team2: { name: "RCB", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Round/RCBround.png" }
            },
            {
                matchName: "MI vs GT",
                startTime: new Date("2026-03-30T14:00:00Z"),
                status: "scheduled",
                venue: "Wankhede Stadium, Mumbai",
                team1: { name: "MI", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MI/Logos/Round/MIround.png" },
                team2: { name: "GT", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/GT/Logos/Round/GTround.png" }
            },
            {
                matchName: "DC vs PBKS",
                startTime: new Date("2026-03-31T14:00:00Z"),
                status: "scheduled",
                venue: "Arun Jaitley Stadium, Delhi",
                team1: { name: "DC", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/DC/Logos/Round/DCround.png" },
                team2: { name: "PBKS", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/PBKS/Logos/Round/PBKSround.png" }
            },
            {
                matchName: "LSG vs KKR",
                startTime: new Date("2026-04-01T14:00:00Z"),
                status: "scheduled",
                venue: "Ekana Cricket Stadium, Lucknow",
                team1: { name: "LSG", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/LSG/Logos/Round/LSGround.png" },
                team2: { name: "KKR", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/KKR/Logos/Round/KKRround.png" }
            },
            {
                matchName: "RR vs SRH",
                startTime: new Date("2026-04-02T14:00:00Z"),
                status: "scheduled",
                venue: "Sawai Mansingh Stadium, Jaipur",
                team1: { name: "RR", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Round/RRround.png" },
                team2: { name: "SRH", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/Round/SRHround.png" }
            }
        ];

        for (const matchData of matches) {
            await Match.findOneAndUpdate(
                { matchName: matchData.matchName },
                matchData,
                { upsert: true, new: true }
            );
            console.log(`✅ Seeded: ${matchData.matchName}`);
        }

        console.log("🚀 Full Schedule Seeded!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedIplSchedule();
