import requests
import json

phrases = [
    "Love you",
    "love you",
    "Love you ",
    " Love you",
    "I love you",
    "hiii",
    "i am depressed"
]

for text in phrases:
    try:
        response = requests.post(
            "http://localhost:8001/predict_emotion",
            json={"text": text},
            timeout=5
        )
        print(f"'{text}' -> {response.json().get('emotion')}")
    except Exception as e:
        print(f"'{text}' -> Error: {e}")
