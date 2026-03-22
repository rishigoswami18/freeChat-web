import dotenv from "dotenv";
dotenv.config();
import { getAIResponse } from "./backend/src/lib/gemini.js";

async function testAI() {
  console.log("Testing AI Response...");
  try {
    const response = await getAIResponse("Hi Lia, how are you?", [], "girlfriend", "Lia", "User");
    console.log("AI Response:", response);
  } catch (err) {
    console.error("AI Error:", err);
  }
}

testAI();
