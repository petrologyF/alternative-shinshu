import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"
SEARCH_URL = urljoin(BASE_URL, "Search?Code=S")

def debug_table_v2():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    })
    
    # 1. GET initial page
    res = session.get(SEARCH_URL)
    soup = BeautifulSoup(res.text, "html.parser")
    print(f"Initial Page Title: {soup.title.string.strip() if soup.title else 'None'}")
    
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
    # Try posting to Search WITHOUT the query param if it's currently on Search?Code=S
    post_url = SEARCH_URL
    res = session.post(post_url, data=payload)
    soup = BeautifulSoup(res.text, "html.parser")
    print(f"POST Result Page Title: {soup.title.string.strip() if soup.title else 'None'}")
    
    table = soup.select_one("table.IchiranTable")
    if not table:
        print("Table not found")
        # Print snippet of body
        print(soup.body.get_text()[:200].replace("\n", " "))
        return
    
    print("Table found!")

if __name__ == "__main__":
    debug_table_v2()
