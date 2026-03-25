import { getAIResponse } from "../../lib/gemini.js";
import EmpathyRadar from "../../models/EmpathyRadar.js";
import User from "../../models/User.js";
import { streamClient } from "../../lib/stream.js";
import { SafetyHandler } from "../ai/safetyHandler.js";

/**
 * RadarEngine — Predictive Ghosting Prevention (PGP) & Pulse Analysis
 * Analyzes conversation dynamics to detect emotional distance before ghosting occurs.
 */
export const RadarEngine = {
  /**
   * Performs an Empathy Pulse check on a specific channel.
   * Typically called every 5-10 messages or on user request.
   */
  performPulseCheck: async (channelId, userId) => {
    try {
      if (!streamClient) throw new Error("Stream client not initialized");

      const channel = streamClient.channel("messaging", channelId);
      const queryRes = await channel.query({ messages: { limit: 20 } });
      const messages = queryRes.messages || [];

      if (messages.length < 3) return null; // Not enough context

      const transcript = SafetyHandler.scrubForAnalysis(
        messages
          .map(m => `${m.user?.name || "User"}: ${m.text || ""}`)
          .join("\n")
      );

      console.log(`[Radar] Analyzing ${messages.length} messages for channel ${channelId}`);

      const isSpecialAiId = userId.startsWith("ai-");
      let user = null;
      if (!isSpecialAiId) {
        user = await User.findById(userId).select("fullName aiPartnerName");
      }
      const clientName = user?.fullName || "User";
      const partnerName = user?.aiPartnerName || "Companion";

      const prompt = `
        ACT AS A SENIOR RELATIONSHIP PSYCHOLOGIST AND DATA ANALYST.
        Analyze the following chat transcript to detect emotional distance, vibe, and ghosting risk.
        The conversation is between ${clientName} (User) and ${partnerName} (AI Companion).
        
        Transcript:
        ${transcript}
        
        Return ONLY a JSON object in this EXACT format:
        {
          "score": number (0-100),
          "label": "Romantic" | "Tense" | "Playful" | "Neutral" | "Ghosting Risk",
          "unsaidFear": "short prediction of hidden emotions",
          "actionableAdvice": "one specific high-impact sentence to improve the bond"
        }
      `;

      const aiResponse = await getAIResponse(prompt, [], "personal_coach", partnerName, clientName);
      console.log(`[Radar] AI Raw Response:`, aiResponse);
      
      // Clean up AI response (remove markdown code blocks if any)
      const cleanedJson = aiResponse.replace(/```json|```/g, "").trim();
      
      // Safety Check: If getAIResponse returned a string fallback instead of JSON
      if (aiResponse.includes("AI Gateway") || aiResponse.includes("moment") || !cleanedJson.startsWith("{")) {
        console.warn(`[Radar] Skipping analysis for ${channelId}: AI returned non-JSON fallback.`);
        return null;
      }

      let analysis;
      try {
        analysis = JSON.parse(cleanedJson);
      } catch (e) {
        console.error(`[Radar] AI Analysis Failed for ${channelId}:`, e.message);
        return null;
      }

      console.log(`[Radar] Updating database for channel: ${channelId}...`);

      // Update or Create Radar record
      const radar = await EmpathyRadar.findOneAndUpdate(
        { channelId },
        {
          $set: { 
            currentVibe: { score: analysis.score, label: analysis.label },
            lastPulse: new Date()
          },
          $push: {
            insights: {
              $each: [{
                userId,
                emotionDetected: analysis.label,
                unsaidFear: analysis.unsaidFear,
                actionableAdvice: analysis.actionableAdvice
              }],
              $slice: -10 // Keep only last 10 insights
            }
          }
        },
        { upsert: true, new: true }
      );

      console.log(`[Radar] Database update successful for ${channelId}. Score: ${analysis.score}`);
      return radar;

    } catch (error) {
      console.error("RadarEngine Pulse Check Failure:", error.message);
      return null;
    }
  }
};
