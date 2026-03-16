import requests
import re
from bs4 import BeautifulSoup

r = requests.get('https://www.cricbuzz.com/cricket-match/live-scores', 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
soup = BeautifulSoup(r.content, 'html.parser')

# Find all <a> tags that link to /live-cricket-scores/ - these contain match scores
score_links = soup.find_all('a', href=re.compile(r'/live-cricket-scores/'))
print(f"Found {len(score_links)} score links\n")

for i, link in enumerate(score_links[:8]):
    text = link.get_text(separator=" | ", strip=True)
    href = link.get('href', '')
    classes = link.get('class', [])
    print(f"LINK {i}: CLASS={classes}")
    print(f"  HREF: {href}")
    print(f"  TEXT: {text[:300]}")
    print()
