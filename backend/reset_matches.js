import mongoose from "mongoose";
import dotenv from "dotenv";
import Match from "./src/models/Match.js";

dotenv.config();

const resetMatches = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        await Match.updateMany({}, { status: "scheduled" });
        console.log("✅ All matches set to scheduled.");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetMatches();
