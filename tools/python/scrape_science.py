import requests
from bs4 import BeautifulSoup
import json
import time
import urllib.parse
import os

# --- Configuration ---
BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"
SEARCH_URL = urllib.parse.urljoin(BASE_URL, "Search?Code=S")

def scrape_science_courses(limit=10):
    session = requests.Session()
    # Updated User-Agent to match browser findings
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/437.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": SEARCH_URL
    })

    # 1. Get initial form tokens and hidden fields
    print(f"Fetching initial form from {SEARCH_URL}...")
    res = session.get(SEARCH_URL)
    soup = BeautifulSoup(res.text, "html.parser")
    form = soup.find("form")
    
    if not form:
        print("Error: Form not found.")
        return

    fields = []
    # Collect non-checkbox fields
    for tag in form.find_all(["input", "select"]):
        name = tag.get("name")
        if not name or name == "BtKENSAKU":
            continue
        
        # Handle select
        if tag.name == "select":
            selected = tag.find("option", selected=True) or tag.find("option")
            val = selected.get("value", "") if selected else ""
            fields.append((name, val))
            continue
            
        # Handle checkbox (we handle them separately to match browser behavior)
        if tag.get("type") == "checkbox":
            continue
            
        val = tag.get("value", "")
        fields.append((name, val))

    # 2. Add auxiliary "_" fields for every checkbox found in the form
    # This enables the "Broad Search" behavior observed in the browser
    for tag in form.find_all("input", type="checkbox"):
        name = tag.get("name")
        if name:
            # We only send the '_' prefixed field with 'on' for broad search
            fields.append(("_" + name, "on"))

    # 3. Explicitly set Nendo to 2026 and clear search terms
    final_payload = []
    for k, v in fields:
        if k == "Nendo":
            final_payload.append((k, "2026"))
        elif k == "Meisyou":
            final_payload.append((k, ""))
        else:
            final_payload.append((k, v))

    # 4. Add Search Button (full-width spaces)
    # The browser uses URL-encoded %E3%80%80%E6%A4%9C%E3%80%80%E7%B4%A2%E3%80%80 which IS UTF-8
    final_payload.append(('BtKENSAKU', '\u3000\u691c\u3000\u7d22\u3000'))

    # 5. POST Search (Requests encodes as UTF-8 by default if not specified)
    print(f"Sending POST request to {SEARCH_URL}...")
    response = session.post(SEARCH_URL, data=final_payload)
    response.encoding = 'utf-8' # Force UTF-8 as observed in browser
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Length: {len(response.text)} bytes")

    # 4. Result Parsing
    soup_result = BeautifulSoup(response.text, "html.parser")
    table = soup_result.select_one("table.IchiranTable")
    
    if not table:
        print(f"Error: IchiranTable not found.")
        # Save debug response
        with open("debug_response.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        print("Debug response saved to debug_response.html")
        return

    rows = table.find_all("tr")
    print(f"Total rows found (including header): {len(rows)}")
    
    if len(rows) <= 1:
        print("Error: No search results found (only header row exists).")
        # Save debug response
        with open("debug_response.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        return

    courses = []
    # Skip header row
    for row in rows[1:limit+1]:
        tds = row.find_all("td")
        if len(tds) < 6: continue
        
        title_tag = tds[3].find("a")
        if not title_tag: continue
        
        courses.append({
            "id": tds[2].get_text(strip=True),
            "title": title_tag.get_text(strip=True),
            "instructor": tds[4].get_text(strip=True),
            "slot": tds[5].get_text(strip=True),
            "url": urllib.parse.urljoin(BASE_URL, title_tag["href"])
        })

    # 5. Save to JSON
    output_path = "frontend/src/syllabus/syllabus.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
    
    print(f"Success! Extracted {len(courses)} courses to {output_path}.")

if __name__ == "__main__":
    scrape_science_courses(10)
