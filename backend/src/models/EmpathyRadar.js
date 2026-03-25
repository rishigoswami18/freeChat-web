import mongoose from "mongoose";

const empathyRadarSchema = new mongoose.Schema(
  {
    channelId: { 
      type: String, 
      required: true, 
      index: true 
    },
    participants: [
      { 
        type: String, 
        ref: "User" 
      }
    ],
    currentVibe: {
      score: { type: Number, default: 50 }, // 0 (Toxic/Ghosting) to 100 (Deep Connection)
      label: { 
        type: String, 
        enum: ["Romantic", "Tense", "Playful", "Neutral", "Ghosting Risk"], 
        default: "Neutral" 
      }
    },
    insights: [
      {
        userId: { type: String, ref: "User" },
        emotionDetected: String,
        unsaidFear: String,
        actionableAdvice: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    lastPulse: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// TTL index to automatically prune old radar data after 30 days
empathyRadarSchema.index({ lastPulse: 1 }, { expireAfterSeconds: 2592000 });

const EmpathyRadar = mongoose.model("EmpathyRadar", empathyRadarSchema);

export default EmpathyRadar;
