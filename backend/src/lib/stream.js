import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

let streamClient = null;

if (!apiKey || !apiSecret) {
  console.error("❌ Stream API key or Secret is missing in environment variables!");
} else {
  try {
    streamClient = StreamChat.getInstance(apiKey, apiSecret);
    console.log("✅ Stream Client initialized");
  } catch (err) {
    console.error("❌ Failed to initialize Stream Client:", err.message);
  }
}

export const upsertStreamUser = async (userData) => {
  if (!streamClient) {
    console.warn("⚠️ Skipping Stream User Upsert: Client not initialized");
    return userData;
  }
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const generateStreamToken = (userId) => {
  if (!streamClient) {
    console.warn("⚠️ Cannot generate Stream Token: Client not initialized");
    return null;
  }
  try {
    const userIdStr = userId.toString();
    console.log("Stream token requested for user:", userIdStr);
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};