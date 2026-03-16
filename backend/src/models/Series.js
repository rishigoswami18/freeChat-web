import mongoose from "mongoose";

const SeriesSchema = new mongoose.Schema({
    seriesName: { type: String, required: true },
    externalId: { type: String, unique: true, required: true },
    priority: { type: Number, default: 0 }, // 100 for IPL, 90 for World Cup, etc.
    isActive: { type: Boolean, default: true },
    sportType: { type: String, default: "cricket" }
}, { timestamps: true });

const Series = mongoose.model("Series", SeriesSchema);
export default Series;
