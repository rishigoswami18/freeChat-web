import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import os from "os";

// Configuration
cloudinary.config({
    cloud_name: "dqvu0bjyp",
    api_key: "552911498626345",
    api_secret: "kWaJ7D-yZYz35UpcG1gLzzEEdr8",
});

async function testUpload() {
    console.log("Starting test upload...");
    const tempFilePath = path.join(os.tmpdir(), `test_apk_${Date.now()}.apk`);

    // Create a 15MB file to test the limit
    const size = 15 * 1024 * 1024;
    const buffer = Buffer.alloc(size, 'A');
    fs.writeFileSync(tempFilePath, buffer);
    console.log(`Created test file: ${tempFilePath} (${size} bytes)`);

    try {
        console.log("Attempting upload_large with resource_type: video...");
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(tempFilePath, {
                resource_type: "video",
                folder: "test_folder",
                chunk_size: 6000000
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
        console.log("SUCCESS!", result.secure_url);
    } catch (error) {
        console.error("FAILED!", error);
    } finally {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
}

testUpload();
