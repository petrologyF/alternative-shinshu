"""信州大学シラバス CSV を JSON ファイルに変換する。"""

import argparse
import csv
import datetime
import json
import re
from typing import Any, Dict, List, Optional

class ShinshuCSVtoJSON:
    """信州大学シラバス CSV を JSON ファイルに変換するクラス。"""

    def __init__(self, csvpath: str) -> None:
        self.csvpath = csvpath
        now = datetime.datetime.now()
        self.date_str = now.strftime("%Y/%m/%d")

    def extract_field(self, text: str, label: str) -> str:
        """【ラベル】で囲まれた項目を抽出する。"""
        # セクション区切り --- を含めた正規表現
        pattern = rf"【{label}】\s*\-+\s*(.*?)\s*(?=\-+\s*【|$)"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            # 次のセクションの開始 --- を除去
            content = match.group(1).strip()
            # 末尾のハイフンを掃除
            content = re.sub(r"\-+$", "", content).strip()
            return content
        return ""

    def map_term(self, shinshu_term: str) -> str:
        """信州大学の講義期間をフロントエンドが解釈可能な形式に変換する。
        前期 -> 春ABC
        後期 -> 秋ABC
        通年 -> 春ABC 秋ABC
        """
        if "通年" in shinshu_term:
            return "春ABC 秋ABC"
        elif "前期" in shinshu_term:
            return "春ABC"
        elif "後期" in shinshu_term:
            return "秋ABC"
        return shinshu_term

    def map_schedule(self, shinshu_schedule: str) -> str:
        """信州大学の曜日・時限をフロントエンドが解釈可能な形式に変換する。
        例: '月４ 月５' -> '月4,5'
        """
        # 全角数字を半角に変換
        zen = "１２３４５６７８９０"
        han = "1234567890"
        table = str.maketrans(zen, han)
        s = shinshu_schedule.translate(table)
        
        # '月4 月5' -> '月4,5'
        # 曜日ごとにまとめる
        days = ["月", "火", "水", "木", "金", "土", "日"]
        result = []
        for day in days:
            periods = re.findall(rf"{day}(\d)", s)
            if periods:
                result.append(f"{day}{','.join(periods)}")
        
        if not result:
            # 集中講義等の場合
            return shinshu_schedule
            
        return " ".join(result)

    def convert(self) -> List[List[str]]:
        subjects = []
        with open(self.csvpath, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                raw_text = row.get("raw_text", "")
                if not raw_text:
                    continue

                code = self.extract_field(raw_text, "登録コード") or row.get("code", "")
                name = self.extract_field(raw_text, "授業科目") or row.get("title", "")
                method = self.extract_field(raw_text, "授業形態") or "対面"
                credit = self.extract_field(raw_text, "単位数")
                grade = self.extract_field(raw_text, "対象学生")
                term = self.map_term(self.extract_field(raw_text, "講義期間"))
                schedule = self.map_schedule(self.extract_field(raw_text, "曜日・時限"))
                room = self.extract_field(raw_text, "講義室")
                person = self.extract_field(raw_text, "担当教員")
                abstract = self.extract_field(raw_text, "授業の概要").replace("\n", " ")
                note = self.extract_field(raw_text, "備考").replace("\n", " ")

                # 11列のリストを作成
                subjects.append([
                    code,    # 0. 科目番号
                    name,    # 1. 科目名
                    method,  # 2. 授業方法
                    credit,  # 3. 単位数
                    grade,   # 4. 標準履修年次
                    term,    # 5. 実施学期
                    schedule,# 6. 曜時限
                    room,    # 7. 教室
                    person,  # 8. 担当教員
                    abstract,# 9. 授業概要
                    note     # 10. 備考
                ])

        return subjects

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("csv", help="an input csv file")
    parser.add_argument("output_dir", help="the output directory")
    args = parser.parse_args()

    converter = ShinshuCSVtoJSON(args.csv)
    subjects = converter.convert()

    # 出力
    output = {
        "updated": converter.date_str,
        "subject": subjects
    }
    
    os.makedirs(args.output_dir, exist_ok=True)
    with open(f"{args.output_dir}/kdb.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent="  ", ensure_ascii=False)
    
    # とりあえず grad も同じ内容で出しておく
    with open(f"{args.output_dir}/kdb-grad.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent="  ", ensure_ascii=False)

    print(f"Converted {len(subjects)} subjects to JSON.")

if __name__ == "__main__":
    import os
    main()
