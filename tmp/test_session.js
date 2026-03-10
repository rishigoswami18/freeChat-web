import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../backend/.env') });

const GameSessionSchema = new mongoose.Schema({
    participants: [mongoose.Schema.Types.Mixed],
    gameType: String,
    state: mongoose.Schema.Types.Mixed,
    status: String,
    turnCount: Number
}, { timestamps: true });

const GameSession = mongoose.model("GameSession", GameSessionSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const session = await GameSession.findOne({ gameType: "tic_tac_toe" }).sort({ updatedAt: -1 });
        if (!session) {
            console.log("No TTT session found");
            return;
        }

        console.log("Session ID:", session._id);
        console.log("Status:", session.status);
        console.log("Participants:", JSON.stringify(session.participants, null, 2));
        console.log("State:", JSON.stringify(session.state, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
