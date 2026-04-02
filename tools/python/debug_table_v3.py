import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"
SEARCH_URL = urljoin(BASE_URL, "Search?Code=S")

def debug_table_v3():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    })
    
    # 1. GET initial page
    res = session.get(SEARCH_URL)
    soup = BeautifulSoup(res.text, "html.parser")
    
    form = soup.find("form")
    payload = []
    for tag in form.find_all(["input", "select", "button"]):
        name = tag.get("name")
        if not name or name == "BtKENSAKU": continue
        payload.append((name, tag.get("value", "")))
    
    # Force Nendo 2026
    payload = [(k, "2026" if k == "Nendo" else v) for k, v in payload]
    payload.append(("BtKENSAKU", "\u3000\u691c\u3000\u7d22\u3000"))
    
    # 2. POST to search
    res = session.post(SEARCH_URL, data=payload)
    soup = BeautifulSoup(res.text, "html.parser")
    
    # Print the WHOLE title and some indicators
    print(f"Title: {soup.title.string.strip() if soup.title else 'No Title'}")
    
    table = soup.select_one("table.IchiranTable")
    if table:
        print("IchiranTable FOUND!")
        rows = table.find_all("tr")
        print(f"Number of rows: {len(rows)}")
    else:
        print("IchiranTable NOT found")
        # Check if there are ANY tables
        tables = soup.find_all("table")
        print(f"Found {len(tables)} tables")
        for i, t in enumerate(tables):
            print(f"Table {i} class: {t.get('class')}")

if __name__ == "__main__":
    debug_table_v3()
