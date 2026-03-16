import mongoose from "mongoose";
import dotenv from "dotenv";
import Match from "./src/models/Match.js";
import iplRewardEngine from "./src/services/iplRewardEngine.js";
import http from "http";
import express from "express";

dotenv.config();

const forceLiveMatch = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("✅ Database connected for seeding.");

        // Clear existing matches to avoid confusion (or just add this one)
        // await Match.deleteMany({});

        const liveMatchData = {
            matchName: "CSK vs MI",
            startTime: new Date(),
            status: "live",
            isPredictionsEnabled: true,
            venue: "Wankhede Stadium, Mumbai",
            team1: { name: "CSK", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CHH/Logos/Round/CSKround.png" },
            team2: { name: "MI", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MUM/Logos/Round/MIround.png" },
            currentScore: "184/4 (18.2)"
        };

        const match = await Match.findOneAndUpdate(
            { matchName: "CSK vs MI" },
            liveMatchData,
            { upsert: true, new: true }
        );

        console.log(`🔥 Match forced to LIVE: ${match.matchName} (${match._id})`);

        // We need to trigger a score blast manually because the automation system might be polling a real API that has no data.
        // We'll simulate the blast here. Since we don't have a running server instance easily, 
        // we'll just let the backend's automation system pick it up OR if it's already running, 
        // it might fetch 0/0. 
        
        // Actually, I can use the iplRewardEngine if I initialize it, but it needs a server.
        // Instead, I'll just print instructions or let the user know I've updated the DB.
        // The frontend fetches matches via API, so it will see the Live status now.

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

forceLiveMatch();
