import requests, urllib.parse
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"
SEARCH_URL = urljoin(BASE_URL, "Search?Code=S")

s = requests.Session()
s.headers.update({"User-Agent": "Mozilla/5.0", "Referer": SEARCH_URL})

payload = [
    ("Pos", ""),
    ("Mode", "1"),
    ("StartNo", "0"),
    ("Bukyoku", "S"),
    ("Nendo", "2025"),
    ("BtKENSAKU", "\u3000\u691c\u3000\u7d22\u3000"),
]

encoded = urllib.parse.urlencode(payload, encoding='shift_jis')
headers = {"Content-Type": "application/x-www-form-urlencoded; charset=Shift_JIS"}
resp = s.post(SEARCH_URL, data=encoded.encode('shift_jis'), headers=headers)
resp.encoding = resp.apparent_encoding
print('Status:', resp.status_code)
print('Has IchiranTable:', 'IchiranTable' in resp.text)
print('Snippet:', resp.text[:500])
