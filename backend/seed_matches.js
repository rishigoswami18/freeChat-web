import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './src/models/Match.js';

dotenv.config();

const dummyMatches = [
    {
        matchName: "CSK vs MI",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
        status: "scheduled",
        venue: "Wankhede Stadium, Mumbai",
        team1: { name: "CSK" },
        team2: { name: "MI" }
    },
    {
        matchName: "RCB vs KKR",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
        status: "scheduled",
        venue: "M. Chinnaswamy Stadium, Bengaluru",
        team1: { name: "RCB" },
        team2: { name: "KKR" }
    },
    {
        matchName: "GT vs LSG",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 48), // day after tomorrow
        status: "scheduled",
        venue: "Narendra Modi Stadium, Ahmedabad",
        team1: { name: "GT" },
        team2: { name: "LSG" }
    }
];

async function seedMatches() {
    await mongoose.connect(process.env.MONGO_URI);
    await Match.deleteMany({ status: "scheduled" });
    await Match.insertMany(dummyMatches);
    console.log('Successfully seeded dummy matches.');
    process.exit(0);
}

seedMatches();
