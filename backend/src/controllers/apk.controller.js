import AppRelease from "../models/AppRelease.js";
import cloudinary from "../lib/cloudinary.js";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import os from "os";

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

        // Handle large files by writing to a temporary file and using upload_large
        // This bypasses Cloudinary's 10MB limit for single-request "raw" uploads
        const base64Data = apkFile.split(",")[1];
        if (!base64Data) {
            return res.status(400).json({ message: "Invalid APK file format" });
        }

        const buffer = Buffer.from(base64Data, "base64");
        const tempFilePath = path.join(os.tmpdir(), `temp_apk_${Date.now()}.apk`);
        fs.writeFileSync(tempFilePath, buffer);

        let uploadRes;
        try {
            console.log("Initiating Cloudinary upload_large for APK with resource_type: auto");
            uploadRes = await cloudinary.uploader.upload_large(tempFilePath, {
                resource_type: "auto",
                folder: "apk_releases",
                public_id: `BondBeyond_v${versionName.replace(/\./g, '_')}_${Date.now()}`,
                chunk_size: 6000000
            });
            console.log("Cloudinary upload_large Success Result:", uploadRes);
        } catch (uploadError) {
            console.error("Cloudinary upload_large Exception:", uploadError);
            // Return the specific error from Cloudinary to the frontend
            return res.status(500).json({
                message: "Cloudinary Transmission Failed",
                error: uploadError.message || "Unknown Cloudinary Error",
                details: uploadError
            });
        } finally {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }

        if (!uploadRes || !uploadRes.secure_url) {
            return res.status(500).json({ message: "Upload finished but secure_url is missing", response: uploadRes });
        }

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
        console.error("Final createRelease Error:", error);
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

        // Direct streaming from the server is the MOST reliable way to ensure correct headers.
        // This ensures every phone sees it as a real Android Installer (.apk) file.
        const response = await fetch(release.apkUrl);
        if (!response.ok) throw new Error("Failed to fetch binary from storage");

        const filename = `BondBeyond_v${release.versionName.replace(/\./g, '_')}.apk`;

        res.setHeader("Content-Type", "application/vnd.android.package-archive");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", response.headers.get("content-length"));
        res.setHeader("Cache-Control", "no-cache");

        const stream = Readable.fromWeb(response.body);
        stream.pipe(res);
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Transmission failure" });
    }
};
