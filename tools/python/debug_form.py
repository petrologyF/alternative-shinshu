import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"
SEARCH_URL = urljoin(BASE_URL, "Search?Code=S")

def debug_form():
    session = requests.Session()
    response = session.get(SEARCH_URL)
    soup = BeautifulSoup(response.text, "html.parser")
    form = soup.find("form")
    if not form:
        print("Form not found")
        return

    print(f"Form action: {form.get('action')}")
    print(f"Form method: {form.get('method')}")
    
    for tag in form.find_all(["input", "select"]):
        name = tag.get("name")
        type_ = tag.get("type", tag.name)
        val = tag.get("value", "")
        print(f"Field: name={name}, type={type_}, value={val}")

if __name__ == "__main__":
    debug_form()
