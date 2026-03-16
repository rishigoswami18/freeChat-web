import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './src/models/Match.js';

dotenv.config();

async function checkMatches() {
    await mongoose.connect(process.env.MONGO_URI);
    const matches = await Match.find({});
    console.log('Current Matches in DB:', JSON.stringify(matches, null, 2));
    process.exit(0);
}

checkMatches();
