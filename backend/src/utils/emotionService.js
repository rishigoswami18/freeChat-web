import axios from "axios";

const HF_TOKEN = process.env.HF_TOKEN;
const HUGGINGFACE_API_URL = "https://router.huggingface.co/hf-inference/models/michellejieli/emotion_text_classifier";

// ========== LOCAL KEYWORD-BASED FALLBACK ==========
// This ensures emotion detection ALWAYS works, even without Hugging Face API
const emotionKeywords = {
  joy: [
    "happy", "glad", "excited", "awesome", "amazing", "great", "wonderful", "fantastic",
    "joy", "delighted", "cheerful", "thrilled", "yay", "haha", "lol", "lmao", "rofl",
    "nice", "good", "best", "love it", "perfect", "brilliant", "excellent", "superb",
    "khush", "maza", "badhiya", "shandar", "zabardast", "mast", "accha", "sahi"
  ],
  love: [
    "love", "heart", "adore", "darling", "sweetheart", "babe", "baby", "miss you",
    "crush", "beautiful", "gorgeous", "handsome", "cute", "kiss", "hug", "romantic",
    "pyaar", "mohabbat", "ishq", "dil", "jaanu", "jaan", "😘", "❤️", "💕", "💖", "😍"
  ],
  sadness: [
    "sad", "cry", "depressed", "lonely", "heartbroken", "miss", "sorry", "unhappy",
    "pain", "hurt", "tears", "broken", "lost", "alone", "suffering", "grief",
    "dukh", "rona", "udaas", "tanha", "😢", "😭", "💔"
  ],
  anger: [
    "angry", "mad", "furious", "hate", "annoyed", "frustrated", "rage", "pissed",
    "stupid", "idiot", "shut up", "damn", "hell", "disgusted", "irritated",
    "gussa", "naraz", "pagal", "bakwas", "😡", "🤬"
  ],
  fear: [
    "scared", "afraid", "terrified", "horror", "nightmare", "panic", "anxious",
    "nervous", "worried", "creepy", "spooky", "danger", "threat", "frightened",
    "darr", "bhoot", "😨", "😰", "😱"
  ],
  surprise: [
    "wow", "omg", "oh my god", "what", "really", "seriously", "no way", "unbelievable",
    "incredible", "shocked", "unexpected", "surprise", "damn", "whoa",
    "kya", "sach", "arey", "😲", "😮", "🤯"
  ]
};

function localEmotionDetect(text) {
  if (!text) return "neutral";
  const lower = text.toLowerCase().trim();

  let bestEmotion = "neutral";
  let bestScore = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEmotion = emotion;
    }
  }

  return bestEmotion;
}

// ========== MAIN DETECTION FUNCTION ==========
export const detectEmotion = async (text) => {
  if (!text || text.trim().length === 0) return "neutral";

  // Try Hugging Face API first (if token exists)
  if (HF_TOKEN) {
    try {
      const response = await axios.post(
        HUGGINGFACE_API_URL,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          timeout: 5000
        }
      );

      if (Array.isArray(response.data) && response.data[0]?.length > 0) {
        const results = response.data[0];
        const sorted = results.sort((a, b) => b.score - a.score);
        const detectedLabel = sorted[0].label.toLowerCase();

        const mapping = {
          joy: "joy", love: "love", sadness: "sadness",
          anger: "anger", fear: "fear", surprise: "surprise"
        };

        if (mapping[detectedLabel]) {
          return mapping[detectedLabel];
        }
      }
    } catch (error) {
      console.warn(`HF API failed [${error.response?.status || 'network'}], using local fallback`);
    }
  }

  // FALLBACK: Local keyword-based detection (always works, no API needed)
  return localEmotionDetect(text);
};