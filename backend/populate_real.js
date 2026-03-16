import mongoose from 'mongoose';
import Match from './src/models/Match.js';
import dotenv from 'dotenv';
dotenv.config();

async function populateRealMatches() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const realMatches = [
        {
            matchName: "Victoria vs South Australia",
            externalId: "vic-v-sa-2026-live",
            startTime: new Date(),
            status: "live",
            venue: "Melbourne Cricket Ground",
            team1: { name: "Victoria", logo: "" },
            team2: { name: "South Australia", logo: "" },
            currentScore: "295/9 (88.4)",
            tier: "silver",
            entryFee: 50
        },
        {
            matchName: "ACT-W vs WA-W",
            externalId: "act-v-wa-w-2026-live",
            startTime: new Date(),
            status: "live",
            venue: "Manuka Oval, Canberra",
            team1: { name: "ACT-W", logo: "" },
            team2: { name: "WA-W", logo: "" },
            currentScore: "167/6 (41.0)",
            tier: "bronze",
            entryFee: 10
        },
        {
            matchName: "NZ-W vs SA-W",
            externalId: "nz-v-sa-w-2026-upcoming",
            startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days away
            status: "scheduled",
            venue: "Seddon Park, Hamilton",
            team1: { name: "New Zealand Women", logo: "" },
            team2: { name: "South Africa Women", logo: "" },
            tier: "silver",
            entryFee: 25
        }
    ];

    for (const m of realMatches) {
        await Match.findOneAndUpdate(
            { externalId: m.externalId },
            m,
            { upsert: true, new: true }
        );
    }

    console.log("Populated 2 live matches and 1 upcoming match (5 days away) for verification.");
    await mongoose.disconnect();
}

populateRealMatches();
