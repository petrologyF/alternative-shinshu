# Alternative Shinshu University Syllabus

[![CSV scheduled update](https://github.com/petrologyF/alternative-shinshu/actions/workflows/update-syllabus.yml/badge.svg)](https://github.com/petrologyF/alternative-shinshu/actions/workflows/update-syllabus.yml)

信州大学のシラバス検索・時間割作成システムの非公式代替サイトです。  
An unofficial alternative website for the Shinshu University syllabus search and timetable creation system.

<https://petrologyF.github.io/alternative-shinshu/>

本サイトは、信州大学の公式なシステムではありません。  
This site is not an official system of Shinshu University.

## 開発

`/csv` 配下に過去の科目データの CSV ファイルが含まれるため、clone/pull に時間を要する場合があります。スパースチェックアウト等を活用することをおすすめします。

```bash
# /csv を除外
git clone --depth 1 --filter=blob:none --no-checkout https://github.com/petrologyF/alternative-shinshu.git
cd alternative-shinshu
git sparse-checkout init --cone
git sparse-checkout set ":!csv"
git checkout
```

詳細な開発手順については、以下の README.md を参照してください。

- `/frontend`：フロントエンド
- `/tools`：科目データの取得、管理用スクリプト

## ライセンス

This application is released under the MPL License, see [LICENSE](https://github.com/petrologyF/alternative-shinshu/blob/main/LICENSE).
