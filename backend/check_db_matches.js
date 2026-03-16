import mongoose from 'mongoose';
import Match from './src/models/Match.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkMatches() {
    await mongoose.connect(process.env.MONGO_URI);
    const matches = await Match.find({});
    console.log(`Total matches in DB: ${matches.length}`);
    matches.forEach(m => {
        console.log(`- ${m.matchName} | Status: ${m.status} | ID: ${m.externalId || 'DUMMY'} | Start: ${m.startTime}`);
    });
    await mongoose.disconnect();
}

checkMatches();
