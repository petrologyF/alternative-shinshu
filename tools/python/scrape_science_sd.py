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

def scrape_detail(session, url):
    """Fetches and parses the detail page for a single course."""
    try:
        res = session.get(url)
        res.encoding = 'utf-8'
        soup = BeautifulSoup(res.text, "html.parser")
        
        def get_val(label):
            target = soup.find("td", string=lambda s: label in s if s else False)
            if target:
                next_td = target.find_next_sibling("td")
                return next_td.get_text(strip=True) if next_td else ""
            return ""

        # Lesson Plan (回ごとの内容) extraction
        lesson_plan = []
        plan_table = soup.find("td", string=lambda s: "(4)授業計画" in s if s else False)
        if plan_table:
            content_td = plan_table.find_next_sibling("td")
            if content_td:
                sub_table = content_td.find("table")
                if sub_table:
                    for row in sub_table.find_all("tr")[1:]: # Skip header
                        cols = row.find_all("td")
                        if len(cols) >= 2:
                            lesson_plan.append({
                                "session": cols[0].get_text(strip=True),
                                "content": cols[1].get_text(strip=True)
                            })
                else:
                    text = content_td.get_text(separator="\n", strip=True)
                    lesson_plan.append({"session": "1-15", "content": text})

        return {
            "classroom": get_val("講義室"),
            "credits_detail": get_val("単位数"),
            "target_student": get_val("対象学生"),
            "format": get_val("授業形態"),
            "overview": get_val("(2)授業の概要"),
            "evaluation": get_val("(5)成績評価の方法"),
            "textbook": get_val("【教科書】"),
            "lesson_plan": lesson_plan
        }
    except Exception as e:
        print(f"  [ERROR] Detail fetch failed for {url}: {e}")
        return {}

def scrape_science_sd(session):
    faculty_code = "S" # 理学部
    code_start = "SD" # Target Prefix
    search_url = f"{BASE_URL}Search?Code={faculty_code}"
    print(f"\n--- Scraping Faculty of Science for codes starting with '{code_start}' ---")
    
    # Initial GET to establish session
    res = session.get(search_url)
    res.raise_for_status()
    soup_result = BeautifulSoup(res.text, "html.parser")
    
    all_courses = []
    start_no = 0
    page = 1
    
    while True:
        print(f"Scraping List Page {page} (StartNo: {start_no})...")
        
        payload = {}
        for tag in soup_result.find_all("input", type="hidden"):
            name_attr = tag.get("name")
            if name_attr:
                payload[name_attr] = tag.get("value", "")
        
        payload["StartNo"] = str(start_no)
        payload["Bukyoku"] = faculty_code
        payload["CodeStart"] = code_start
        payload["CodeJyouken"] = "0" # Starts with
        payload["Mode"] = "1"
        payload["Nendo"] = "2026"
        
        if page == 1:
            payload["BtKENSAKU"] = "　検　索　"
        else:
            payload["BtNEXT"] = "Next"
            if "BtKENSAKU" in payload:
                del payload["BtKENSAKU"]

        response = session.post(search_url, data=payload)
        response.encoding = 'utf-8'
        soup_result = BeautifulSoup(response.text, "html.parser")
        
        table = soup_result.select_one("table.IchiranTable")
        if not table:
            print(f"  IchiranTable not found. Stopping.")
            break

        rows = table.find_all("tr")
        if len(rows) <= 1:
            print(f"  No more rows found. Stopping.")
            break

        page_courses = []
        for row in rows[1:]:
            tds = row.find_all("td")
            if len(tds) < 6: continue
            
            title_tag = tds[3].find("a")
            if not title_tag: continue
            
            course_id = tds[2].get_text(strip=True)
            if not course_id: continue
            
            detail_url = urllib.parse.urljoin(BASE_URL, title_tag["href"])
            print(f"    Fetching {course_id}...")
            
            # Fetch Deep Details
            details = scrape_detail(session, detail_url)
            time.sleep(1.0) # Be fair
            
            period_raw = tds[1].get_text(strip=True)
            period = "通年"
            if "前期" in period_raw:
                period = "前期"
            elif "後期" in period_raw:
                period = "後期"
            
            course = {
                "id": course_id,
                "title": title_tag.get_text(strip=True),
                "instructor": tds[4].get_text(strip=True),
                "slot": tds[5].get_text(strip=True),
                "period": period,
                "url": detail_url,
                **details
            }
            page_courses.append(course)
            all_courses.append(course)

        save_incremental(page_courses)

        next_button = soup_result.find(attrs={"name": "BtNEXT"})
        if not next_button:
            print("  No 'Next' button found. End of search.")
            break
            
        start_no += 100
        page += 1
        time.sleep(1.0)

    return all_courses

def main():
    # Ensure starting with an empty file as per user request
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump([], f)
        
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": BASE_URL
    })

    scrape_science_sd(session)

if __name__ == "__main__":
    main()
