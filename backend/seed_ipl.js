import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './src/models/Match.js';
import Series from './src/models/Series.js';

dotenv.config();

const teamLogos = {
  "Chennai Super Kings": "https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png",
  "Delhi Capitals": "https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png",
  "Gujarat Titans": "https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png",
  "Kolkata Knight Riders": "https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png",
  "Lucknow Super Giants": "https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png",
  "Mumbai Indians": "https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png",
  "Punjab Kings": "https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png",
  "Rajasthan Royals": "https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png",
  "Royal Challengers Bengaluru": "https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png",
  "Sunrisers Hyderabad": "https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png"
};

const iplMatches = [
  { matchName: "RCB vs SRH", team1: "Royal Challengers Bengaluru", team2: "Sunrisers Hyderabad", startTime: "2026-03-28T14:00:00Z", venue: "M. Chinnaswamy Stadium, Bengaluru" },
  { matchName: "MI vs KKR", team1: "Mumbai Indians", team2: "Kolkata Knight Riders", startTime: "2026-03-29T14:00:00Z", venue: "Wankhede Stadium, Mumbai" },
  { matchName: "RR vs CSK", team1: "Rajasthan Royals", team2: "Chennai Super Kings", startTime: "2026-03-30T14:00:00Z", venue: "Sawai Mansingh Stadium, Jaipur" },
  { matchName: "PBKS vs GT", team1: "Punjab Kings", team2: "Gujarat Titans", startTime: "2026-03-31T14:00:00Z", venue: "PCA Stadium, Mohali" },
  { matchName: "LSG vs DC", team1: "Lucknow Super Giants", team2: "Delhi Capitals", startTime: "2026-04-01T14:00:00Z", venue: "Ekana Stadium, Lucknow" },
  { matchName: "KKR vs SRH", team1: "Kolkata Knight Riders", team2: "Sunrisers Hyderabad", startTime: "2026-04-02T14:00:00Z", venue: "Eden Gardens, Kolkata" },
  { matchName: "CSK vs MI", team1: "Chennai Super Kings", team2: "Mumbai Indians", startTime: "2026-04-03T14:00:00Z", venue: "MA Chidambaram Stadium, Chennai" },
  { matchName: "GT vs RR", team1: "Gujarat Titans", team2: "Rajasthan Royals", startTime: "2026-04-04T10:00:00Z", venue: "Narendra Modi Stadium, Ahmedabad" },
  { matchName: "DC vs RCB", team1: "Delhi Capitals", team2: "Royal Challengers Bengaluru", startTime: "2026-04-04T14:00:00Z", venue: "Arun Jaitley Stadium, Delhi" },
  { matchName: "SRH vs PBKS", team1: "Sunrisers Hyderabad", team2: "Punjab Kings", startTime: "2026-04-05T14:00:00Z", venue: "Rajiv Gandhi Stadium, Hyderabad" },
  { matchName: "MI vs RCB", team1: "Mumbai Indians", team2: "Royal Challengers Bengaluru", startTime: "2026-04-06T14:00:00Z", venue: "Wankhede Stadium, Mumbai" },
  { matchName: "KKR vs CSK", team1: "Kolkata Knight Riders", team2: "Chennai Super Kings", startTime: "2026-04-07T14:00:00Z", venue: "Eden Gardens, Kolkata" },
  { matchName: "LSG vs GT", team1: "Lucknow Super Giants", team2: "Gujarat Titans", startTime: "2026-04-08T14:00:00Z", venue: "Ekana Stadium, Lucknow" },
  { matchName: "RR vs DC", team1: "Rajasthan Royals", team2: "Delhi Capitals", startTime: "2026-04-09T14:00:00Z", venue: "Sawai Mansingh Stadium, Jaipur" },
  { matchName: "PBKS vs MI", team1: "Punjab Kings", team2: "Mumbai Indians", startTime: "2026-04-10T14:00:00Z", venue: "PCA Stadium, Mohali" },
  { matchName: "SRH vs RCB", team1: "Sunrisers Hyderabad", team2: "Royal Challengers Bengaluru", startTime: "2026-04-11T14:00:00Z", venue: "Rajiv Gandhi Stadium, Hyderabad" },
  { matchName: "GT vs CSK", team1: "Gujarat Titans", team2: "Chennai Super Kings", startTime: "2026-04-12T10:00:00Z", venue: "Narendra Modi Stadium, Ahmedabad" },
  { matchName: "KKR vs MI", team1: "Kolkata Knight Riders", team2: "Mumbai Indians", startTime: "2026-04-12T14:00:00Z", venue: "Eden Gardens, Kolkata" },
  { matchName: "DC vs LSG", team1: "Delhi Capitals", team2: "Lucknow Super Giants", startTime: "2026-04-13T14:00:00Z", venue: "Arun Jaitley Stadium, Delhi" },
  { matchName: "RCB vs RR", team1: "Royal Challengers Bengaluru", team2: "Rajasthan Royals", startTime: "2026-04-14T14:00:00Z", venue: "M. Chinnaswamy Stadium, Bengaluru" }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing pre-season gold matches to avoid duplicates/confusion
    const isPreSeason = new Date() < new Date('2026-03-28T00:00:00Z');
    if (isPreSeason) {
        await Match.deleteMany({ tier: "gold", status: "scheduled" });
        console.log("Cleared old pre-season gold matches.");
    }

    let series = await Series.findOne({ seriesName: /IPL/i });
    if (!series) {
      series = new Series({
        seriesName: "IPL 2026",
        externalId: "9241",
        priority: 100,
        isActive: true
      });
      await series.save();
    }

    for (const mData of iplMatches) {
      await Match.findOneAndUpdate(
        { matchName: mData.matchName, startTime: new Date(mData.startTime) },
        {
          ...mData,
          team1: { name: mData.team1, logo: teamLogos[mData.team1] || "" },
          team2: { name: mData.team2, logo: teamLogos[mData.team2] || "" },
          seriesId: series._id,
          tier: "gold",
          entryFee: 100,
          status: "scheduled"
        },
        { upsert: true, new: true }
      );
    }

    console.log("Exact schedule seed data injected successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
