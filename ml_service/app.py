from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import logging
from deep_translator import GoogleTranslator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import os

# Load your trained model and vectorizer
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "model.pkl")
vectorizer_path = os.path.join(BASE_DIR, "vectorizer.pkl")

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

class TranslationInput(BaseModel):
    text: str
    target_lang: str = "en"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def home():
    return {"message": "Emotion Detection & Translation API is running!"}

@app.post("/predict_emotion")
def predict_emotion(input: TextInput):
    logger.info(f"Predicting emotion for: {input.text[:50]}")
    X = vectorizer.transform([input.text])
    label = model.predict(X)[0]
    logger.info(f"Predicted: {label}")
    return {"emotion": label}

@app.post("/translate")
def translate_text(input: TranslationInput):
    logger.info(f"Translating text to {input.target_lang}: {input.text[:50]}")
    try:
        translated = GoogleTranslator(source='auto', target=input.target_lang).translate(input.text)
        return {"translated_text": translated}
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return {"error": str(e)}, 500
