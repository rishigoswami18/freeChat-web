import mongoose from "mongoose";
import "dotenv/config";
import SupportMessage from "./src/models/SupportMessage.js";

const checkMessages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const latest = await SupportMessage.findOne().sort({ createdAt: -1 });
        if (latest) {
            console.log("Latest Support Message:");
            console.log("From:", latest.fullName);
            console.log("Email:", latest.email);
            console.log("Date:", latest.createdAt);
            console.log("Message:", latest.message);
        } else {
            console.log("No support messages found in the database.");
        }
    } catch (error) {
        console.error("Database connection error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkMessages();
