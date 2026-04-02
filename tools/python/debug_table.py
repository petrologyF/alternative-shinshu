import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"
SEARCH_URL = urljoin(BASE_URL, "Search?Code=S")

def debug_table():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Referer": SEARCH_URL
    })
    
    # 1. Get tokens
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
    
    # 2. Search
    res = session.post(SEARCH_URL, data=payload)
    soup = BeautifulSoup(res.text, "html.parser")
    table = soup.select_one("table.IchiranTable")
    if not table:
        print("Table not found")
        return
    
    rows = table.find_all("tr")
    print(f"Number of rows found: {len(rows)}")
    for i, row in enumerate(rows[:5]):
        tds = row.find_all(["td", "th"])
        print(f"Row {i} has {len(tds)} columns")
        for j, td in enumerate(tds):
            print(f"  Col {j}: {td.get_text(strip=True)}")

if __name__ == "__main__":
    debug_table()
