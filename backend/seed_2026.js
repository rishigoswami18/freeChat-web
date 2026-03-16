import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './src/models/Match.js';

dotenv.config();

const ipl2026Matches = [
    {
        externalId: "ipl-2026-01",
        matchName: "RCB vs SRH",
        startTime: new Date("2026-03-28T14:00:00Z"), // 7:30 PM IST
        status: "scheduled",
        venue: "M. Chinnaswamy Stadium, Bengaluru",
        team1: { name: "Royal Challengers Bengaluru", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/LogoLight/RCB.png" },
        team2: { name: "Sunrisers Hyderabad", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/LogoLight/SRH.png" }
    },
    {
        externalId: "ipl-2026-02",
        matchName: "CSK vs MI",
        startTime: new Date("2026-03-29T14:00:00Z"),
        status: "scheduled",
        venue: "MA Chidambaram Stadium, Chennai",
        team1: { name: "Chennai Super Kings", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CHH/Logos/LogoLight/CSK.png" },
        team2: { name: "Mumbai Indians", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MI/Logos/LogoLight/MI.png" }
    },
    {
        externalId: "ipl-2026-03",
        matchName: "KKR vs GT",
        startTime: new Date("2026-03-30T14:00:00Z"),
        status: "scheduled",
        venue: "Eden Gardens, Kolkata",
        team1: { name: "Kolkata Knight Riders", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/KKR/Logos/LogoLight/KKR.png" },
        team2: { name: "Gujarat Titans", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/GT/Logos/LogoLight/GT.png" }
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        
        // Remove old 2025 data to clean up
        await Match.deleteMany({ startTime: { $lt: new Date("2026-01-01") } });
        console.log("Cleared old matches");

        for (const match of ipl2026Matches) {
            await Match.findOneAndUpdate(
                { externalId: match.externalId },
                match,
                { upsert: true, new: true }
            );
        }
        console.log("Seeded IPL 2026 initial matches");
        process.exit(0);
    } catch (error) {
        console.error("Seed failed:", error);
        process.exit(1);
    }
}

seed();
