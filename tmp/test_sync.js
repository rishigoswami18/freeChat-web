import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

const SYNC_URL = 'http://localhost:5001/api/ipl/sync-external';
const SECRET = process.env.SYNC_EXTERNAL_SECRET || 'bondbeyond_automation_2026';

// Minimal Match Schema for testing
const MatchSchema = new mongoose.Schema({
    matchName: String,
    currentScore: String,
    status: String
});
const Match = mongoose.model('Match', MatchSchema);

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Find a match to test
        const match = await Match.findOne({ status: { $in: ['live', 'scheduled'] } });
        if (!match) {
            console.error('No live or scheduled match found for testing');
            process.exit(1);
        }

        console.log(`Testing with match: ${match.matchName} (ID: ${match._id})`);
        const oldScore = match.currentScore;
        const testScore = "999/9 (99.9)";

        // 2. Send Sync Request
        console.log('Sending sync request...');
        const response = await fetch(SYNC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret_key: SECRET,
                matchId: match._id,
                matchData: {
                    score: testScore,
                    status: 'live'
                }
            })
        });

        const result = await response.json();
        console.log('Response:', result);

        if (!response.ok) {
            console.error('Sync request failed');
            process.exit(1);
        }

        // 3. Verify in DB
        const updatedMatch = await Match.findById(match._id);
        console.log(`Old Score: ${oldScore}`);
        console.log(`New Score (DB): ${updatedMatch.currentScore}`);

        if (updatedMatch.currentScore === testScore) {
            console.log('TEST PASSED: Match synced successfully! ✅');
        } else {
            console.error('TEST FAILED: Data mismatch in DB ❌');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error during test:', error);
        process.exit(1);
    }
}

runTest();
