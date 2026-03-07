import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const appReleaseSchema = new mongoose.Schema({
    versionCode: { type: Number, required: true },
    versionName: { type: String, required: true },
    apkUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const AppRelease = mongoose.model("AppRelease", appReleaseSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const releases = await AppRelease.find().sort({ createdAt: -1 }).limit(5);
        console.log(JSON.stringify(releases, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
