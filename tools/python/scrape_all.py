import requests
from bs4 import BeautifulSoup
import json
import time
import urllib.parse
import os

# --- Configuration ---
BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"
OUTPUT_PATH = "frontend/src/syllabus/syllabus.json"

def save_incremental(courses):
    """Saves and deduplicates current results to file."""
    dedup = {}
    if os.path.exists(OUTPUT_PATH):
        try:
            with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                existing = json.load(f)
                for c in existing:
                    dedup[c["id"]] = c
        except Exception:
            pass

    for c in courses:
        dedup[c["id"]] = c
    
    unique_list = list(dedup.values())
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(unique_list, f, ensure_ascii=False, indent=2)
    print(f"  [INCREMENTAL] Total unique courses: {len(unique_list)}")

def scrape_faculty(session, code, name):
    search_url = f"{BASE_URL}Search?Code={code}"
    print(f"\n--- Scraping Faculty: {name} (Code={code}) ---")
    
    # Initial GET to establish session
    res = session.get(search_url)
    res.raise_for_status()
    soup_result = BeautifulSoup(res.text, "html.parser")
    
    all_faculty_courses = []
    start_no = 0
    page = 1
    
    while True:
        print(f"Scraping {name}: Page {page} (StartNo: {start_no})...")
        
        # 1. Collect all hidden fields from the current page
        payload = {}
        for tag in soup_result.find_all("input", type="hidden"):
            name_attr = tag.get("name")
            if name_attr:
                payload[name_attr] = tag.get("value", "")
        
        # 2. Update StartNo and other critical fields
        payload["StartNo"] = str(start_no)
        payload["Bukyoku"] = code
        payload["Mode"] = "1"
        payload["Nendo"] = "2026"
        
        # 3. Choose the button to click
        if page == 1:
            payload["BtKENSAKU"] = "　検　索　"
        else:
            payload["BtNEXT"] = "Next"
            # Ensure BtKENSAKU is NOT in the payload when clicking Next
            if "BtKENSAKU" in payload:
                del payload["BtKENSAKU"]

        # 4. POST the request
        response = session.post(search_url, data=payload)
        response.encoding = 'utf-8'
        soup_result = BeautifulSoup(response.text, "html.parser")
        
        table = soup_result.select_one("table.IchiranTable")
        if not table:
            print(f"  IchiranTable not found. Stopping.")
            break

        rows = table.find_all("tr")
        if len(rows) <= 1:
            print(f"  No rows found. Stopping.")
            break

        page_courses = []
        for row in rows[1:]:
            tds = row.find_all("td")
            if len(tds) < 6: continue
            
            title_tag = tds[3].find("a")
            if not title_tag: continue
            
            course_id = tds[2].get_text(strip=True)
            if not course_id: continue
            
            course = {
                "id": course_id,
                "title": title_tag.get_text(strip=True),
                "instructor": tds[4].get_text(strip=True),
                "slot": tds[5].get_text(strip=True),
                "url": urllib.parse.urljoin(BASE_URL, title_tag["href"])
            }
            page_courses.append(course)
            all_faculty_courses.append(course)

        print(f"  Extracted {len(page_courses)} courses.")
        save_incremental(page_courses)

        # Circuit Breaker for runaway searches
        if len(all_faculty_courses) > 15000:
            print("  [WARNING] Circuit breaker triggered (15k+). Stopping.")
            break

        # 5. Check if NEXT button exists for the next iteration
        # Look for any element with name 'BtNEXT' in the results
        next_button = soup_result.find(attrs={"name": "BtNEXT"})
        if not next_button:
            print("  No 'Next' button (BtNEXT) found. End of search.")
            break
            
        start_no += 100
        page += 1
        time.sleep(1.5)

    return all_faculty_courses

def main():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": BASE_URL
    })

    # Faculty of Science
    scrape_faculty(session, "S", "理学部")
    
    # General Education
    scrape_faculty(session, "G", "共通教育")

if __name__ == "__main__":
    main()
