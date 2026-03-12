import mongoose from "mongoose";

const appReleaseSchema = new mongoose.Schema({
    versionCode: {
        type: Number,
        required: true,
        unique: true
    },
    versionName: {
        type: String,
        required: true
    },
    apkUrl: {
        type: String,
        required: true
    },
    releaseNotes: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isUpdateRequired: {
        type: Boolean,
        default: false
    },
    downloadCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const AppRelease = mongoose.model("AppRelease", appReleaseSchema);

export default AppRelease;
