# freeChat Machine Learning Service

A microservice for freeChat that provides emotion detection and real-time translation using FastAPI.

## 🚀 Key Features

- **Emotion Detection**: Predicts message sentiment using a pre-trained Scikit-learn model.
- **Real-time Translation**: Integrated Google Translator for multi-language support.
- **Scalability**: Lightweight FastAPI server designed for quick API responses.

## 🛠️ Setup

1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment**:
   Ensure you have `model.pkl` and `vectorizer.pkl` in the root of the `ml_service` directory.

3. **Development/Run**:
   ```bash
   uvicorn app:app --reload
   ```

## 🧱 APIs

- `GET /health`: Basic health check.
- `POST /predict_emotion`: Sends text, returns predicted emotion.
- `POST /translate`: Sends text and target language, returns translated content.
