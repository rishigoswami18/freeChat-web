import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import Match from './src/models/Match.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const match = await Match.findOne({ matchName: /RCB vs SRH/i });
  if (match) {
    match.currentScore = '137/5 (14.3)';
    match.importantStatus = 'Royal Challengers Bengaluru opt to bowl';
    
    // Ensure the teams match what's in the text and they are ordered 
    // such that the batting team comes according to logic in ipl.controller.js.
    // wait, in ipl.controller.js:
    // battingTeam: match.team1.name
    // So Team 1 should be the batting team (SRH).
    match.team1 = { 
        name: "Sunrisers Hyderabad", 
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad.svg/1200px-Sunrisers_Hyderabad.svg.png" 
    };
    match.team2 = { 
        name: "Royal Challengers Bengaluru", 
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bangalore_2020.svg/1200px-Royal_Challengers_Bangalore_2020.svg.png" 
    };
    match.status = 'live';

    await match.save();
    console.log("Updated match with Cricbuzz exact mock data.");
  } else {
    console.log("Match not found to update.");
  }
  process.exit(0);
}
run();
