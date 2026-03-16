import requests
from bs4 import BeautifulSoup
import json
import sys
import random
import re

def get_random_ua():
    uas = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"
    ]
    return random.choice(uas)

def get_headers():
    return {
        "User-Agent": get_random_ua(),
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/"
    }

def scrape_cricbuzz_live(match_query):
    """
    Scrapes live scores from Cricbuzz.
    Cricbuzz 2026 uses Tailwind-style classes. Match blocks are <a> tags
    with class 'block mb-3' inside series containers.
    """
    url = "https://www.cricbuzz.com/cricket-match/live-scores"
    try:
        response = requests.get(url, headers=get_headers(), timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # New Cricbuzz structure: match cards are <a class="block mb-3"> 
        match_cards = soup.find_all('a', class_=lambda c: c and 'block' in c and 'mb-3' in c)
        
        if not match_cards:
            # Fallback: try old structure
            match_cards = soup.find_all('div', class_='cb-mtch-lst')
        
        if not match_cards:
            return {"status": "error", "message": "No match cards found on page"}

        for card in match_cards:
            card_text = card.get_text(separator=" ", strip=True).lower()
            
            is_match = False
            if not match_query:
                is_match = True
            else:
                search_teams = re.split(r'vs|v|-', match_query.lower())
                search_teams = [t.strip() for t in search_teams if len(t.strip()) > 1]
                if all(team in card_text for team in search_teams):
                    is_match = True

            if is_match:
                full_text = card.get_text(separator=" ", strip=True)
                
                # Extract score: look for patterns like "305 & 27-0" or "136-8 (20)" or "140-3 (16.3)"
                score_pattern = re.compile(r'(\d+(?:\s*&\s*\d+(?:-\d+)?)?(?:-\d+)?)\s*\((\d+(?:\.\d+)?)\)')
                score_matches = score_pattern.findall(full_text)
                
                # Also try slash notation: "27/0 (7.1)"
                if not score_matches:
                    score_pattern2 = re.compile(r'(\d+(?:\s*&\s*\d+(?:/\d+)?)?(?:/\d+)?)\s*\((\d+(?:\.\d+)?)\)')
                    score_matches = score_pattern2.findall(full_text)
                
                score = score_matches[0][0].strip() if score_matches else "0/0"
                overs = score_matches[0][1] if score_matches else "0.0"
                
                # Extract match status from the text
                status_text = ""
                important_status = ""
                text_lower = full_text.lower()
                
                if "won by" in text_lower:
                    status_match = re.search(r'(.*won by.*)', full_text, re.I)
                    status_text = status_match.group(1).strip() if status_match else "Completed"
                    important_status = "COMPLETED"
                elif "stumps" in text_lower:
                    status_match = re.search(r'(.*stumps.*)', full_text, re.I)
                    status_text = status_match.group(1).strip() if status_match else "Stumps"
                    important_status = "STUMPS"
                elif "lunch" in text_lower:
                    important_status = "LUNCH"
                    status_text = "Lunch Break"
                elif "tea" in text_lower:
                    important_status = "TEA"
                    status_text = "Tea Break"
                elif "innings break" in text_lower:
                    important_status = "INN BREAK"
                    status_text = "Innings Break"
                elif "opt to" in text_lower:
                    status_text = "Toss"
                    important_status = "TOSS"
                elif "need" in text_lower:
                    need_match = re.search(r'(.*need\s+\d+\s+run.*)', full_text, re.I)
                    status_text = need_match.group(1).strip() if need_match else "In Progress"
                elif "lead by" in text_lower:
                    lead_match = re.search(r'(.*lead by.*)', full_text, re.I)
                    status_text = lead_match.group(1).strip() if lead_match else "In Progress"
                elif "trail by" in text_lower:
                    trail_match = re.search(r'(.*trail by.*)', full_text, re.I)
                    status_text = trail_match.group(1).strip() if trail_match else "In Progress"
                
                # Day info
                day_match = re.search(r'Day\s*(\d+)', full_text, re.I)
                if day_match and not important_status:
                    important_status = f"DAY {day_match.group(1)}"

                # Try to extract team names from card 
                # Usually "TeamA ABBR score TeamB ABBR score"
                teams_text = full_text.split(score)[0].strip() if score != "0/0" else ""

                return {
                    "status": "success",
                    "match": (match_query or "Live Match").upper(),
                    "score": score,
                    "overs": overs,
                    "info": status_text or "Live",
                    "important_status": important_status,
                    "source": "BondBeyond Live Engine"
                }
        return {"status": "error", "message": "Match not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def scrape_ipl_points_table():
    # Updated to IPL 2026 Series ID: 9241
    series_id = "9241"
    url = f"https://www.cricbuzz.com/cricket-series/{series_id}/indian-premier-league-2026/points-table"
    try:
        response = requests.get(url, headers=get_headers(), timeout=15)
        soup = BeautifulSoup(response.content, 'html.parser')
        table = soup.find('table', class_='table cb-scl-mb-0') or \
                soup.find('table', class_='table') or \
                soup.find('table')
        
        if not table: 
            return {"status": "error", "message": "Points table not found on page"}
        
        rows = table.find_all('tr')
        if not rows: return {"status": "error", "message": "No rows found in table"}
        
        # Determine header row and start from next
        start_idx = 1
        if "PTS" not in rows[0].text.upper():
            start_idx = 0 # No header row?
            
        data = []
        for row in rows[start_idx:]:
            cols = row.find_all('td')
            if len(cols) < 8: continue
            team_data = {
                "team": cols[0].text.strip(),
                "played": cols[1].text.strip(),
                "won": cols[2].text.strip(),
                "lost": cols[3].text.strip(),
                "nrr": cols[7].text.strip(),
                "pts": cols[5].text.strip()
            }
            data.append(team_data)
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def scrape_ipl_stats(stat_type="runs"):
    # stat_type: "runs" or "wickets"
    series_id = "9241" # IPL 2026
    if stat_type == "runs":
        url = f"https://www.cricbuzz.com/cricket-series/{series_id}/indian-premier-league-2026/stats#/top-run-scorers"
    else:
        url = f"https://www.cricbuzz.com/cricket-series/{series_id}/indian-premier-league-2026/stats#/top-wicket-takers"
    
    try:
        response = requests.get(url, headers=get_headers(), timeout=15)
        soup = BeautifulSoup(response.content, 'html.parser')
        table = soup.find('table', class_='table')
        if not table: return {"status": "error", "message": f"{stat_type} stats table not found"}
        
        rows = table.find_all('tr')[1:11] # Top 10
        data = []
        for row in rows:
            cols = row.find_all('td')
            if len(cols) < 2: continue
            player_name = cols[0].text.strip()
            value = cols[2].text.strip() if len(cols) > 2 else cols[1].text.strip()
            data.append({
                "player": player_name,
                "value": value
            })
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    task = sys.argv[1] if len(sys.argv) > 1 else "live"
    param = sys.argv[2] if len(sys.argv) > 2 else ""
    
    if task == "live":
        print(json.dumps(scrape_cricbuzz_live(param)))
    elif task == "table":
        print(json.dumps(scrape_ipl_points_table()))
    elif task == "stats":
        print(json.dumps(scrape_ipl_stats(param)))
    else:
        print(json.dumps({"status": "error", "message": "Unknown task"}))