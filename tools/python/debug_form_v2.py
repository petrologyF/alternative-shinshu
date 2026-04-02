import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj/"
SEARCH_URL = urljoin(BASE_URL, "Search?Code=S")

def debug_form_v2():
    session = requests.Session()
    response = session.get(SEARCH_URL)
    soup = BeautifulSoup(response.text, "html.parser")
    form = soup.find("form")
    if not form:
        print("Form not found")
        return

    # Check all elements that can have a name
    for tag in form.find_all(True): # All tags
        name = tag.get("name")
        if name:
            type_ = tag.get("type", tag.name)
            val = tag.get("value", "")
            print(f"Field: name={name}, type={type_}, value={val}")

if __name__ == "__main__":
    debug_form_v2()
