import AppRelease from "../models/AppRelease.js";
import cloudinary from "../lib/cloudinary.js";
import { Readable } from "stream";

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

        if (!apkFile) {
            return res.status(400).json({ message: "Direct APK file upload is required" });
        }

        const uploadRes = await cloudinary.uploader.upload(apkFile, {
            resource_type: "raw",
            folder: "apk_releases",
            public_id: `BondBeyond_v${versionName.replace(/\./g, '_')}_${Date.now()}`,
            format: "apk"
        });

        const newRelease = new AppRelease({
            versionCode,
            versionName,
            apkUrl: uploadRes.secure_url,
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

export const downloadRelease = async (req, res) => {
    try {
        const { id } = req.params;
        const release = id === "latest"
            ? await AppRelease.findOne({ isActive: true }).sort({ versionCode: -1 })
            : await AppRelease.findById(id);

        if (!release) return res.status(404).json({ message: "Release not found" });

        // Improve download stability by using Cloudinary's dedicated download flags.
        // We inject 'fl_attachment' into the URL to force the browser to save it rather than view it.
        const originalUrl = release.apkUrl;
        const attachmentUrl = originalUrl.replace("/upload/", `/upload/fl_attachment:BondBeyond_v${release.versionName.replace(/\./g, '_')}/`);

        res.redirect(attachmentUrl);
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Transmission failure" });
    }
};
