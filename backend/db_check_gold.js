const mongoose = require('mongoose');
require('dotenv').config();

const MatchSchema = new mongoose.Schema({
    matchName: String,
    externalId: String,
    startTime: Date,
    status: String,
    tier: String,
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: "Series" },
});

const Match = mongoose.model("Match", MatchSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Match.countDocuments({ tier: 'gold' });
        console.log(`Gold matches count: ${count}`);
        
        if (count > 0) {
            const matches = await Match.find({ tier: 'gold' }).limit(10);
            matches.forEach(m => console.log(`${m.matchName} - ${m.startTime}`));
        } else {
            console.log("No gold matches found.");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
