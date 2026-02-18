from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load your trained model and vectorizer
model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict_emotion")
def predict_emotion(input: TextInput):
    logger.info(f"Predicting emotion for: {input.text[:50]}")
    X = vectorizer.transform([input.text])
    label = model.predict(X)[0]
    logger.info(f"Predicted: {label}")
    return {"emotion": label}
