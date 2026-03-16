const mongoose = require('mongoose');
require('dotenv').config();

// Since match is exported as an ES Module in a project that might be using ESM
// we'll try to find it dynamically or assume the standard path
const Match = require('./src/models/Match');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // Handle both CommonJS and ESM-style imports depending on how the project is built
        const MatchModel = Match.default || Match;
        
        const liveMatches = await MatchModel.find({ status: 'live' });
        console.log("LIVE MATCHES IN DB:");
        liveMatches.forEach(m => {
            console.log(`- Match: ${m.matchName} | Tier: ${m.tier} | Status: ${m.status}`);
        });

        const goldMatches = await MatchModel.find({ tier: 'gold' });
        console.log("\nGOLD TIER MATCHES:");
        goldMatches.forEach(m => {
          console.log(`- Match: ${m.matchName} | Status: ${m.status}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
