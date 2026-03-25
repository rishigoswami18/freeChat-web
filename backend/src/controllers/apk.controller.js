import AppRelease from "../models/AppRelease.js";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// APKs are stored in /backend/uploads/apk/
const APK_DIR = path.join(__dirname, "..", "..", "uploads", "apk");

// Ensure the directory exists on startup
if (!fs.existsSync(APK_DIR)) {
    fs.mkdirSync(APK_DIR, { recursive: true });
}

export const getLatestRelease = async (req, res) => {
    try {
        const release = await AppRelease.findOne({ isActive: true }).sort({ versionCode: -1 });
        res.status(200).json(release);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllReleases = async (req, res) => {
    try {
        const releases = await AppRelease.find().sort({ versionCode: -1 });
        res.status(200).json(releases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createRelease = async (req, res) => {
    try {
        const { versionCode, versionName, apkFile, releaseNotes, isUpdateRequired } = req.body;

        if (!versionName) {
            return res.status(400).json({ message: "Version name is required" });
        }

        if (!apkFile) {
            return res.status(400).json({ message: "APK file is required" });
        }

        const base64Data = apkFile.split(",")[1];
        if (!base64Data) {
            return res.status(400).json({ message: "Invalid APK file format" });
        }

        const buffer = Buffer.from(base64Data, "base64");
        const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
        console.log(`📦 Saving APK locally: ${sizeMB}MB`);

        // Save APK to local filesystem
        const fileName = `Zyro_v${versionName.replace(/\./g, "_")}_${Date.now()}.apk`;
        const filePath = path.join(APK_DIR, fileName);
        fs.writeFileSync(filePath, buffer);

        // Build a public URL — the backend serves /uploads/apk/ as static files
        const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5001}`;
        const apkUrl = `${baseUrl}/uploads/apk/${fileName}`;

        console.log(`✅ APK saved: ${apkUrl}`);

        const newRelease = new AppRelease({
            versionCode,
            versionName,
            apkUrl,
            releaseNotes,
            isUpdateRequired
        });

        await newRelease.save();
        res.status(201).json(newRelease);
    } catch (error) {
        console.error("createRelease Error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const updateRelease = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRelease = await AppRelease.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedRelease);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRelease = async (req, res) => {
    try {
        const { id } = req.params;
        const release = await AppRelease.findById(id);
        if (release) {
            // Also delete the local file if it exists
            try {
                const fileName = path.basename(release.apkUrl);
                const filePath = path.join(APK_DIR, fileName);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (_) { }
        }
        await AppRelease.findByIdAndDelete(id);
        res.status(200).json({ message: "Release deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const downloadRelease = async (req, res) => {
    try {
        const { id } = req.params;
        const release = id === "latest"
            ? await AppRelease.findOne({ isActive: true }).sort({ versionCode: -1 })
            : await AppRelease.findById(id);

        if (!release) return res.status(404).json({ message: "Release not found" });

        // Increment download count
        try {
            release.downloadCount = (release.downloadCount || 0) + 1;
            await release.save();
        } catch (err) {
            console.error("Failed to increment download count:", err);
        }

        const vName = release.versionName || "1_0_0";
        const filename = `Zyro_v${vName.replace(/\./g, "_")}.apk`;
        const localFileName = path.basename(release.apkUrl);
        const localFilePath = path.join(APK_DIR, localFileName);

        // If APK is stored locally, stream it directly
        if (fs.existsSync(localFilePath)) {
            res.setHeader("Content-Type", "application/vnd.android.package-archive");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", fs.statSync(localFilePath).size);
            res.setHeader("Cache-Control", "no-cache");
            fs.createReadStream(localFilePath).pipe(res);
        } else {
            // Fallback: proxy from external URL (e.g. old Cloudinary releases)
            const response = await fetch(release.apkUrl);
            if (!response.ok) throw new Error("Failed to fetch APK from storage");
            res.setHeader("Content-Type", "application/vnd.android.package-archive");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", response.headers.get("content-length"));
            res.setHeader("Cache-Control", "no-cache");
            const stream = Readable.fromWeb(response.body);
            stream.pipe(res);
        }
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Transmission failure" });
    }
};

export const getAppStats = async (req, res) => {
    try {
        const apkData = await AppRelease.aggregate([
            { $group: { _id: null, total: { $sum: "$downloadCount" } } }
        ]);
        const totalDownloads = apkData.length > 0 ? apkData[0].total : 0;
        res.status(200).json({ totalDownloads });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
