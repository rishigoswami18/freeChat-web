import AppRelease from "../models/AppRelease.js";
import cloudinary from "../lib/cloudinary.js";

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
        const { versionCode, versionName, apkUrl, releaseNotes, isUpdateRequired } = req.body;

        let finalApkUrl = apkUrl;

        // If a file was uploaded via Buffer/Selection (Admin might send a base64 or similar)
        // But for simplicity in a "raw" uploader, we'll allow either a direct URL or a file upload.
        // If the admin sends 'apkFile' as base64:
        if (req.body.apkFile) {
            const uploadRes = await cloudinary.uploader.upload(req.body.apkFile, {
                resource_type: "raw",
                folder: "apk_releases",
                public_id: `BondBeyond_v${versionName}_${Date.now()}`,
                format: "apk"
            });
            finalApkUrl = uploadRes.secure_url;
        }

        const newRelease = new AppRelease({
            versionCode,
            versionName,
            apkUrl: finalApkUrl,
            releaseNotes,
            isUpdateRequired
        });

        await newRelease.save();
        res.status(201).json(newRelease);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        await AppRelease.findByIdAndDelete(id);
        res.status(200).json({ message: "Release deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
