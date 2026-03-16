import app from './src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import supertest from 'supertest';

dotenv.config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const request = supertest(app);
        
        // We need a user to bypass protectRoute
        // Or we can just temporarily remove protectRoute for this test
        console.log("Calling /api/ipl/schedule...");
        const res = await request.get('/api/ipl/schedule');
        
        console.log("Status:", res.status);
        console.log("Body Keys:", Object.keys(res.body));
        if (res.body.upcoming) {
            console.log("Upcoming Count:", res.body.upcoming.length);
            res.body.upcoming.forEach(m => console.log(`- ${m.matchName} (${m.status})`));
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
