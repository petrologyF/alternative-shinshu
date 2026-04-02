import requests
from bs4 import BeautifulSoup
import json
import time
import urllib.parse
import os

# --- Configuration ---
BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"

def scrape_faculty(session, code, name):
    search_url = f"{BASE_URL}Search?Code={code}"
    print(f"\n--- Scraping Faculty: {name} (Code={code}) ---")
    
    # 1. Get initial form to establish session and tokens
    res = session.get(search_url)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")
    form = soup.find("form")
    
    if not form:
        print(f"Error: Form not found for {name}.")
        return []

    # Pagination logic
    all_courses = []
    start_no = 0
    page = 1
    
    while True:
        print(f"Scraping {name}: Page {page} (StartNo: {start_no})...")
        
        # Build payload explicitly for Departmental Search
        # We use the hidden fields found in the departmental form
        payload = [
            ("Pos", ""),
            ("Mode", "1"),
            ("StartNo", str(start_no)),
            ("Bukyoku", code),
            ("Nendo", "2026"),
            ("Meisyou", ""),
            ("Kyouin", ""),
            ("KyouinKana", ""),
            ("Keikaku", ""),
            ("Taisyou", ""),
            ("CodeStart", ""),
            ("CodeJyouken", "0"),
            ("BtKENSAKU", "\u3000\u691c\u3000\u7d22\u3000")
        ]
        
        # POST Search
        response = session.post(search_url, data=payload)
        response.encoding = 'utf-8'
        
        soup_result = BeautifulSoup(response.text, "html.parser")
        table = soup_result.select_one("table.IchiranTable")
        
        if not table:
            print(f"Error: IchiranTable not found at page {page}.")
            break

        rows = table.find_all("tr")
        # header + result rows
        if len(rows) <= 1:
            print(f"No result rows found at page {page}.")
            break

        course_count_on_page = 0
        for row in rows[1:]:
            tds = row.find_all("td")
            if len(tds) < 6: continue
            
            title_tag = tds[3].find("a")
            if not title_tag: continue
            
            course_id = tds[2].get_text(strip=True)
            # Skip if ID is empty (shouldn't happen in real search)
            if not course_id: continue
            
            all_courses.append({
                "id": course_id,
                "title": title_tag.get_text(strip=True),
                "instructor": tds[4].get_text(strip=True),
                "slot": tds[5].get_text(strip=True),
                "url": urllib.parse.urljoin(BASE_URL, title_tag["href"])
            })
            course_count_on_page += 1

        print(f"  Extracted {course_count_on_page} courses.")

        # Circuit Breaker for Science (Code=S)
        if code == "S" and len(all_courses) > 500:
            print("  [WARNING] Circuit breaker triggered! Too many courses for Science. Stopping.")
            break

        # Check for pagination (BtNEXT)
        # In the departmental view, the pagination buttons are at the bottom
        next_button = soup_result.find("input", attrs={"name": "BtNEXT"})
        if not next_button:
            print("  No 'Next' button available. End of search.")
            break
            
        start_no += 100
        page += 1
        time.sleep(1.5)

    return all_courses

def main():
    session = requests.Session()
    # Mask as a real browser
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Referer": BASE_URL
    })

    # Faculty of Science
    science_courses = scrape_faculty(session, "S", "理学部")
    # General Education
    ge_courses = scrape_faculty(session, "G", "共通教育")

    # Merge and deduplicate
    dedup = {}
    for c in science_courses + ge_courses:
        dedup[c["id"]] = c
    
    unique_list = list(dedup.values())
    
    output_path = "frontend/src/syllabus/syllabus.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(unique_list, f, ensure_ascii=False, indent=2)
    
    print(f"\n--- SUCCESS ---")
    print(f"Science: {len(science_courses)}")
    print(f"General: {len(ge_courses)}")
    print(f"Final Count(Merged): {len(unique_list)}")
    print(f"Data saved to {output_path}")

if __name__ == "__main__":
    main()
