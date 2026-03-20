/**
 * RealtimeAvatar Service
 * Handles sessions for HeyGen / D-ID and OpenAI Realtime
 */
import axios from "axios";

class RealtimeAvatarService {
  /**
   * Initialize a HeyGen Interactive Avatar session
   */
  async createHeyGenSession() {
    try {
      const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
      if (!HEYGEN_API_KEY || HEYGEN_API_KEY === "3caed934835545b98ab5d4520478df81") { // Use key if in env
         // confirmed key from user
      }

      console.log("🧬 [HeyGen] Initializing new streaming session...");

      const response = await axios.post(
        "https://api.heygen.com/v1/streaming.new",
        {
          version: "v2",
          avatar_name: "Eric_720p", // You can change this to any HeyGen avatar ID
          quality: "medium",
        },
        {
          headers: {
            "x-api-key": HEYGEN_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const session = response.data.data;
      console.log(`✅ [HeyGen] Session created: ${session.session_id}`);

      // Start the stream immediately after creation
      await axios.post(
        "https://api.heygen.com/v1/streaming.start",
        {
          session_id: session.session_id,
          sdp: session.sdp,
        },
        {
          headers: { "x-api-key": HEYGEN_API_KEY },
        }
      );

      return {
        status: "success",
        sessionId: session.session_id,
        sdp: session.sdp,
        ice_servers: session.ice_servers,
      };
    } catch (error) {
      console.error("❌ [HeyGen] Session Error:", error?.response?.data || error.message);
      return { 
        status: "error", 
        message: "HeyGen subscription might be low or key invalid. Using local avatar.",
      };
    }
  }

  /**
   * Finalize the WebRTC handshake
   */
  async startStreaming(sessionId, sdp) {
    try {
      const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
      await axios.post(
        "https://api.heygen.com/v1/streaming.start",
        { session_id: sessionId, sdp },
        { headers: { "x-api-key": HEYGEN_API_KEY } }
      );
      return { status: "success" };
    } catch (error) {
      console.error("❌ [HeyGen] Start Error:", error?.response?.data || error.message);
      return { status: "error" };
    }
  }

  /**
   * Send text to the avatar to speak it
   */
  async speak(sessionId, text) {
    try {
      const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
      await axios.post(
        "https://api.heygen.com/v1/streaming.task",
        { session_id: sessionId, text },
        { headers: { "x-api-key": HEYGEN_API_KEY } }
      );
      return { status: "success" };
    } catch (error) {
      console.error("❌ [HeyGen] Task Error:", error?.response?.data || error.message);
      return { status: "error" };
    }
  }

  /**
   * Analyze user emotion and match context
   */
  async senseEmotion(imageBase64) {
    try {
      const { ChatEngine } = await import("./chatEngine.js");
      const prompt = `
        You are the 'Eyes' of a cricket expert AI. 
        Analyze the user's emotion/expression in this screenshot.
        Also check if they are looking at a TV screen/match.
        Return ONLY a JSON: { "emotion": "happy|sad|excited|bored|focused", "insight": "Short observation" }
      `;

      const analysisRaw = await ChatEngine.getResponse(prompt, "match_analyst", [], imageBase64);
      
      try {
        const cleaned = analysisRaw.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
      } catch {
        return { emotion: "neutral", insight: analysisRaw.slice(0, 50) };
      }
    } catch (err) {
      return { emotion: "neutral", insight: "Analysis offline" };
    }
  }
}

export default new RealtimeAvatarService();
