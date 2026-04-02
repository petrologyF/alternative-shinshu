"""信州大学のシラバスデータを CSV ファイルとしてダウンロードする。"""

import argparse
import datetime
import os
import time
from typing import List, Dict, Any

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

class ShinshuDownloader:
    """信州大学のシラバスデータを取得するクラス。"""

    BASE_URL = "https://campus-3.shinshu-u.ac.jp/syllabusj"
    
    # 部局コードの定義
    FACULTIES = {
        "L": "人文学部",
        "E": "教育学部",
        "J": "経法学部",
        "S": "理学部",
        "M": "医学部",
        "T": "工学部",
        "A": "農学部",
        "X": "繊維学部",
        "G": "全学教育機構",
    }

    def __init__(self, year: int = 2026) -> None:
        self.year = str(year)
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (compatible; ShinshuSyllabusBot/1.0; +https://github.com/Make-IT-TSUKUBA/alternative-shinshu)"
        })

    def fetch_course_links(self, faculty_code: str) -> List[Dict[str, str]]:
        """指定された部局の検索結果から科目リンクを取得する。"""
        search_url = f"{self.BASE_URL}/Search?Code={faculty_code}"
        
        # 1. まず GET で初期ページを取得し、cookie を確立する
        print(f"Establishing session for {self.FACULTIES.get(faculty_code, faculty_code)}...")
        self.session.get(search_url, timeout=30)
        
        # 2. 検索実行。ブラウザでキャプチャした生の POST ボディをベースに構築
        # Note: フィールドの順序や重複、全角スペースを含むボタン名が重要なため、生の文字列を使用
        raw_body = (
            f"Pos=&Mode=1&StartNo=0&Bukyoku={faculty_code}&Nendo={self.year}"
            "&_KikZenki=on&_KikKouki=on&_KikTsuunen=on"
            "&_WeekMon=on&_WeekTue=on&_WeekWed=on&_WeekThu=on&_WeekFri=on&_WeekSat=on&_WeekOth=on"
            "&_Jigen1=on&_Jigen2=on&_Jigen3=on&_Jigen4=on&_Jigen5=on&_Jigen6=on&_Jigen7=on&_JigenO=on"
            "&Meisyou=&Kyouin=&KyouinKana=&Keikaku=&Taisyou=&CodeStart=&CodeJyouken=0"
            "&_KaihouShimin=on&_KaihouDaigaku=on&_InKyoutsuu=on&_Cometency=on"
            "&_ThemeFlag%5B2%5D=on&_ThemeFlag%5B3%5D=on&_ThemeFlag%5B4%5D=on&_ThemeFlag%5B5%5D=on&_ThemeFlag%5B6%5D=on&_ThemeFlag%5B7%5D=on&_ThemeFlag%5B8%5D=on"
            "&_MindFlag%5B2%5D=on&_MindFlag%5B3%5D=on&_MindFlag%5B4%5D=on"
            "&_SEProgram=on&_SEProgram=on&_SEProgram=on&_SEProgram=on&_SEProgram=on&_SEProgram=on&_SEProgram=on&_SEProgram=on&_SEProgram=on&_SEProgram=on"
            "&BtKENSAKU=%E3%80%80%E6%A4%9C%E3%80%80%E7%B4%A2%E3%80%80"
        )

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "https://campus-3.shinshu-u.ac.jp",
            "Referer": search_url,
        }
        
        print(f"Searching...")
        response = self.session.post(search_url, data=raw_body, headers=headers, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        links = []
        
        # 検索結果テーブルの行をループ (通常 2行目以降がデータ)
        # 授業名リンク (Display) と テキストファイルリンク (Text) を探す
        for row in soup.find_all("tr")[1:]:
            cells = row.find_all("td")
            if len(cells) < 9:
                continue
            
            # 授業名セル (4列目)
            course_cell = cells[3]
            a_display = course_cell.find("a", href=True)
            
            # リンクの取得
            if a_display:
                title = a_display.get_text(strip=True)
                code = cells[2].get_text(strip=True)
                
                # テキストファイルリンク (9列目)
                download_cell = cells[8]
                a_text = download_cell.find("a", href=True)
                
                if a_text:
                    url = urljoin(self.BASE_URL + "/", a_text["href"])
                    links.append({
                        "title": title,
                        "code": code,
                        "url": url,
                        "faculty": self.FACULTIES.get(faculty_code, faculty_code)
                    })
        
        print(f"Found {len(links)} courses.")
        return links

    def fetch_detail(self, url: str) -> Dict[str, Any]:
        """詳細情報(テキスト形式)を取得する。"""
        time.sleep(1.0)
        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        
        # テキスト形式のレスポンスをそのまま格納
        return {
            "url": url,
            "raw_text": response.text
        }

    def download_all_to_csv(self, filename: str) -> None:
        """全学部のデータを取得してCSV形式で保存する。
        注: 筑波版のCSV形式に合わせる必要があるため、ここでは一旦ヘッダーのみ作成し、
        実際のパースロジックは用途に合わせて拡張する。
        """
        import csv
        
        all_courses = []
        for code in self.FACULTIES:
            try:
                links = self.fetch_course_links(code)
                # 今回はサンプルとして、最初の3件のみ詳細を取得する（負荷軽減のため）
                # 実運用では全件必要
                for link in links[:3]:
                    detail = self.fetch_detail(link["url"])
                    detail["title"] = link["title"]
                    detail["faculty"] = link["faculty"]
                    all_courses.append(detail)
            except Exception as e:
                print(f"Failed to fetch {code}: {e}")

        if not all_courses:
            print("No courses found.")
            return

        # CSV書き出し
        fieldnames = ["faculty", "code", "title", "url", "raw_text"]
        with open(filename, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(all_courses)
        
        print(f"Saved to {filename}")

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output_dir", help="the output directory")
    args = parser.parse_args()

    date = datetime.datetime.now()
    filename = os.path.join(args.output_dir, f"shinshu-{date.strftime('%Y%m%d')}.csv")

    os.makedirs(args.output_dir, exist_ok=True)
    
    downloader = ShinshuDownloader()
    downloader.download_all_to_csv(filename)

if __name__ == "__main__":
    main()
