import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import MatchAutomationSystem from './src/services/MatchAutomationSystem.js';

async function run() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI is not defined in .env');
        
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        await MatchAutomationSystem.syncIplMatches();
        console.log('Sync complete');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
