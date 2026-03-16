import requests
import json

try:
    # Need to get a token first, but let's try to see if it's protected
    # Actually, I can check the database directly again with a proper ESM script
    r = requests.get('http://localhost:5001/api/ipl/schedule', timeout=5)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(json.dumps(data, indent=2))
    else:
        print(r.text)
except Exception as e:
    print(f"Error: {e}")
