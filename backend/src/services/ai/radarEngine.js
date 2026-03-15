import { getAIResponse } from "../../lib/gemini.js";
import EmpathyRadar from "../../models/EmpathyRadar.js";
import { streamClient } from "../../lib/stream.js";

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

      const transcript = messages
        .map(m => `${m.user.name}: ${m.text}`)
        .join("\n");

      const prompt = `
        Analyze this chat transcript for a "Billion-Dollar" relationship app. 
        Your goal is Predictive Ghosting Prevention (PGP).
        
        Transcript:
        ${transcript}
        
        Provide a JSON response with:
        1. "score": (0-100) representing relationship health.
        2. "label": One of ["Romantic", "Tense", "Playful", "Neutral", "Ghosting Risk"]. 
        3. "unsaidFear": What is the user (ID: ${userId}) likely feeling but not saying?
        4. "actionableAdvice": One specific, high-impact action the user can take to deepen the bond or prevent ghosting.
      `;

      const aiResponse = await getAIResponse(prompt, [], "doctor");
      
      // Clean up AI response (remove markdown code blocks if any)
      const cleanedJson = aiResponse.replace(/```json|```/g, "").trim();
      let analysis;
      try {
        analysis = JSON.parse(cleanedJson);
      } catch (e) {
        console.error("AI JSON Parse Error in RadarEngine:", e.message);
        return null;
      }

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

      return radar;

    } catch (error) {
      console.error("RadarEngine Pulse Check Failure:", error.message);
      return null;
    }
  }
};
