import axios from "axios";

const HF_TOKEN = process.env.HF_TOKEN;
const HUGGINGFACE_API_URL = "https://router.huggingface.co/hf-inference/models/michellejieli/emotion_text_classifier";

// ========== LOCAL KEYWORD-BASED FALLBACK ==========
// This ensures emotion detection ALWAYS works, even without Hugging Face API
// Supports: English, Hindi (Devanagari), and Hinglish (Romanized Hindi)
const emotionKeywords = {
  joy: [
    // English
    "happy", "glad", "excited", "awesome", "amazing", "great", "wonderful", "fantastic",
    "joy", "delighted", "cheerful", "thrilled", "yay", "haha", "lol", "lmao", "rofl",
    "nice", "good", "best", "love it", "perfect", "brilliant", "excellent", "superb",
    "blessed", "grateful", "celebrate", "congrats", "congratulations", "winning", "won",
    // Hindi (Devanagari)
    "खुश", "खुशी", "मज़ा", "बहुत अच्छा", "शानदार", "ज़बरदस्त", "मस्त", "बढ़िया",
    "वाह", "जीत", "धन्यवाद", "शुक्रिया", "आनंद", "हर्ष", "प्रसन्न", "उत्साह",
    // Hinglish (Romanized Hindi)
    "khush", "khushi", "maza", "mazaa", "badhiya", "shandar", "zabardast", "mast",
    "accha", "achha", "sahi", "shandaar", "badiya", "kamaal", "jeet", "bohot accha",
    "bahut accha", "dhamaal", "balle balle", "wahh", "waah", "yaar maza aaya",
    "😄", "😊", "🎉", "😁", "🥳", "✨"
  ],
  love: [
    // English
    "love", "heart", "adore", "darling", "sweetheart", "babe", "baby", "miss you",
    "crush", "beautiful", "gorgeous", "handsome", "cute", "kiss", "hug", "romantic",
    "soulmate", "forever", "marry", "beloved", "affection", "caring",
    // Hindi (Devanagari)
    "प्यार", "मोहब्बत", "इश्क़", "दिल", "जान", "जानू", "चाहत", "प्रेम",
    "सुंदर", "खूबसूरत", "प्यारा", "प्यारी", "दिलरुबा", "माशूक", "महबूब",
    "चुम्मा", "गले लगा", "याद आती है",
    // Hinglish
    "pyaar", "pyar", "mohabbat", "ishq", "ishk", "dil", "jaanu", "jaan",
    "chahat", "prem", "sundar", "khoobsurat", "pyaara", "pyaari", "dilruba",
    "mashook", "mehboob", "chumma", "gale laga", "yaad aati hai", "i love u",
    "luv u", "luv you", "tumse pyaar", "tujhse pyar", "dil se",
    "😘", "❤️", "💕", "💖", "😍", "🥰", "💗", "💞", "💓", "😻"
  ],
  sadness: [
    // English
    "sad", "cry", "depressed", "lonely", "heartbroken", "miss", "sorry", "unhappy",
    "pain", "hurt", "tears", "broken", "lost", "alone", "suffering", "grief",
    "miserable", "hopeless", "helpless", "disappointed", "regret", "sorrow",
    // Hindi (Devanagari)
    "दुख", "दुखी", "रोना", "उदास", "तन्हा", "अकेला", "अकेली", "दर्द",
    "तकलीफ", "पीड़ा", "आंसू", "टूटा", "टूटी", "बिछड़", "ग़म", "गम",
    "मायूस", "निराश", "बेबस", "लाचार",
    // Hinglish
    "dukh", "dukhi", "rona", "ro raha", "ro rahi", "udaas", "udas", "tanha",
    "akela", "akeli", "dard", "takleef", "taklif", "peeda", "aansu", "aansuon",
    "toota", "tooti", "gam", "gham", "mayus", "nirash", "bebas", "laachaar",
    "bahut bura", "bohot bura", "dil toota", "dil tut gaya", "koi nahi hai",
    "😢", "😭", "💔", "😞", "😥", "🥺"
  ],
  anger: [
    // English
    "angry", "mad", "furious", "hate", "annoyed", "frustrated", "rage", "pissed",
    "stupid", "idiot", "shut up", "damn", "hell", "disgusted", "irritated",
    "terrible", "worst", "horrible", "trash", "rubbish", "useless",
    // Hindi (Devanagari)
    "गुस्सा", "नाराज़", "नाराज", "पागल", "बकवास", "चिढ़", "क्रोध", "गाली",
    "बेवकूफ", "मूर्ख", "कमीना", "कमीनी", "हरामी", "साला", "चुप",
    "नफरत", "घृणा", "जलन", "बदतमीज़",
    // Hinglish
    "gussa", "naraz", "naraaz", "pagal", "bakwas", "chidh", "krodh", "gaali",
    "bewakoof", "bewkoof", "murkh", "kameena", "kameeni", "harami", "saala",
    "chup", "chup kar", "nafrat", "ghrina", "jalan", "badtameez",
    "kutta", "kutti", "gadha", "ullu", "tatti", "band kar",
    "😡", "🤬", "😤", "💢"
  ],
  fear: [
    // English
    "scared", "afraid", "terrified", "horror", "nightmare", "panic", "anxious",
    "nervous", "worried", "creepy", "spooky", "danger", "threat", "frightened",
    "phobia", "dread", "shiver", "tremble",
    // Hindi (Devanagari)
    "डर", "डरा", "डरी", "भूत", "भयानक", "खतरा", "खौफ", "घबराहट",
    "चिंता", "परेशान", "फिक्र", "हॉरर", "डरावना", "डरावनी", "भय",
    // Hinglish
    "darr", "dar", "dara", "dari", "bhoot", "bhayanak", "khatra", "khauf",
    "ghabrahat", "chinta", "pareshan", "fikr", "fikar", "horror", "daravna",
    "daravni", "bhay", "dar lag raha", "darr lagta hai", "gabhra gaya",
    "😨", "😰", "😱", "🫣", "😟"
  ],
  surprise: [
    // English
    "wow", "omg", "oh my god", "what", "really", "seriously", "no way", "unbelievable",
    "incredible", "shocked", "unexpected", "surprise", "whoa", "insane", "crazy",
    // Hindi (Devanagari)
    "क्या", "सच", "अरे", "ओह", "हैरान", "हैरानी", "चौंक", "अचानक",
    "अविश्वसनीय", "यकीन नहीं", "सच में", "ये कैसे",
    // Hinglish
    "kya", "sach", "sachme", "sach me", "arey", "aree", "are", "ohh",
    "hairan", "hairani", "chaunk", "achanak", "yakeen nahi", "yaqeen nahi",
    "kya baat", "kya baat hai", "sach mein", "ye kaise", "matlab", "pagal hai kya",
    "😲", "😮", "🤯", "😳", "🫢"
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
