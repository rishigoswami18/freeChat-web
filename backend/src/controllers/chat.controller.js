import { detectEmotion } from "../utils/emotionService.js";

import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }
    const emotion = await detectEmotion(text);
    res.status(200).json({ text, emotion });
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
