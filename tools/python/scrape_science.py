import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urljoin
import os

# Base URL for Shinshu University Syllabus System
BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"
SEARCH_URL = urljoin(BASE_URL, "Search?Code=S")

def get_form_payload(session):
    """Fetch the initial search page and extract all form fields."""
    response = session.get(SEARCH_URL)
    # Ensure correct encoding (essential for full-width Japanese characters)
    response.encoding = response.apparent_encoding
    soup = BeautifulSoup(response.text, "html.parser")
    form = soup.find("form")
    if not form:
        return []

    payload = []
    # Find all elements that can contribute to form submission
    for tag in form.find_all(["input", "select", "button"]):
        name = tag.get("name")
        if not name: continue
        
        # Avoid including BtKENSAKU twice if we add it manually later
        if name == "BtKENSAKU":
            continue
            
        type_ = tag.get("type", "").lower()
        val = tag.get("value", "")
        
        if tag.name == "select":
            # For select, take the first option if none selected?
            # Usually only one option is 'selected'
            selected = tag.find("option", selected=True)
            if selected:
                val = selected.get("value", "")
            else:
                options = tag.find_all("option")
                if options:
                    val = options[0].get("value", "")
        
        payload.append((name, val))
    return payload

def scrape_science_courses(limit=10):
    session = requests.Session()
    # Add a more browser-like header
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Referer": SEARCH_URL
    })

    # 1. Prepare Payload
    payload = get_form_payload(session)
    
    # Update Nendo and ensure BtKENSAKU is present
    final_payload = []
    has_kensaku = False
    for k, v in payload:
        if k == "Nendo":
            final_payload.append((k, "2026"))
        else:
            final_payload.append((k, v))
            
    # Add the search button field manually to ensure correct full-width spaces
    # \u3000 is full-width space
    KENSAKU_BUTTON = "\u3000\u691c\u3000\u7d22\u3000" # 　検　索　
    final_payload.append(("BtKENSAKU", KENSAKU_BUTTON))

    # 2. Execute Search
    response = session.post(SEARCH_URL, data=final_payload)
    response.encoding = response.apparent_encoding
    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.select_one("table.IchiranTable") 
    
    if not table:
        print("Error: IchiranTable not found.")
        # Debugging: Print first 500 chars of response
        # print(response.text[:500])
        return

    # 3. Parse List and Fetch Details
    courses = []
    rows = table.find_all("tr")[1:] # Skip header
    
    for row in rows[:limit]:
        tds = row.find_all("td")
        if len(tds) < 4: continue
        
        title_tag = tds[3].find("a")
        detail_url = urljoin(BASE_URL, title_tag["href"])
        
        # Fetch Detail Page
        time.sleep(1.5) # Compliance with rate limiting
        detail_res = session.get(detail_url)
        detail_soup = BeautifulSoup(detail_res.text, "html.parser")
        
        # Simple extraction logic (expand based on LABEL_MAP)
        course_data = {
            "id": tds[2].get_text(strip=True),
            "title": title_tag.get_text(strip=True),
            "instructor": tds[4].get_text(strip=True),
            "slot": tds[5].get_text(strip=True),
            "room": tds[7].get_text(strip=True),
            "url": detail_url
        }
        courses.append(course_data)
        print(f"Fetched: {course_data['title']}")

    # 4. Save to JSON
    output_path = "frontend/src/syllabus/syllabus.json"
    
    # Ensure directory exists (though it should)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
    print(f"Successfully saved {len(courses)} courses to {output_path}")

if __name__ == "__main__":
    scrape_science_courses(10)
