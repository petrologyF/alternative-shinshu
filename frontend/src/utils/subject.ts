import syllabusData from "@/syllabus/syllabus.json";
import {
  createTimeslotTable,
  type TimeslotTable,
  timeslotTableToBits,
} from "./timetable";

export interface ScrapedSubject {
  id: string;
  title: string;
  instructor: string;
  slot: string;
  url: string;
}

const facultyColorMap: Record<string, string> = {
  H: "#8C0023", // 人文学部
  E: "#FF3FCC", // 教育学部
  L: "#FF7F0C", // 経済学部
  S: "#26BFFF", // 理学部
  M: "#19FFB2", // 医学部
  T: "#7399FF", // 工学部
  A: "#73FF0D", // 農学部
  F: "#0099FF", // 繊維学部
  G: "#8CFF26", // 全学教育機構
  Q: "#8CFF26", // 全学教育機構
  R: "#8CFF26", // 全学教育機構
};

const facultyNameMap: Record<string, string> = {
  H: "人文学部",
  E: "教育学部",
  L: "経法学部",
  S: "理学部",
  M: "医学部",
  T: "工学部",
  A: "農学部",
  F: "繊維学部",
  G: "全学教育機構",
  Q: "全学教育機構",
  R: "全学教育機構",
};



// 現在の年度
export const CURRENT_YEAR = 2026;



const allSeasons = ["前期", "夏", "後期", "冬"] as const;

export const normalSeasons = ["前期", "後期"] as const;

export const classMethods = ["対面", "オンライン", "ハイブリッド"] as const;



export type AllSeason = (typeof allSeasons)[number];

export type NormalSeason = (typeof normalSeasons)[number];



export type ClassMethod = (typeof classMethods)[number];






export class Subject {

  private _code: string;

  private _name: string;

  private _credit: number;

  private _termCodes: number[][] = [];

  private _timeslotTables: TimeslotTable[] = [];

  // timeslotTables のビット列（重複判定などに使用）
  private _timeslotTableBits = 0n;

  year: string;

  termStr: string;

  timeslotStr: string;

  room: string;

  person: string;

  abstract: string;

  note: string;

  classMethods: ClassMethod[];

  concentration = false;

  negotiable = false;

  asneeded = false;

  nt = false;



  constructor(data: ScrapedSubject) {
    this._code = data.id;
    this._name = data.title;
    this._credit = 2; // デフォルト単位数 (信州大学の多くは2単位)
    this.year = "1-4";
    this.termStr = "通年"; // TODO: シラバスからターム情報を抽出
    this.timeslotStr = data.slot;
    this.room = "";
    this.person = data.instructor;
    this.abstract = "";
    this.note = "";
    this._syllabusHref = data.url;

    this._termCodes = [[0, 1, 2, 3, 4, 5]]; // デフォルトで全ターム

    // 時限のパース
    this._timeslotTables.push(createTimeslotTable(this.timeslotStr));
    
    // 特殊フラグの設定
    this.concentration = this.timeslotStr.includes("集");
    this.negotiable = this.timeslotStr.includes("不定");
    this.asneeded = this.timeslotStr.includes("随時");

    for (const table of this._timeslotTables) {
      this._timeslotTableBits |= timeslotTableToBits(table);
    }

    this.classMethods = [];
  }



  get code() {

    return this._code;

  }



  get name() {

    return this._name;

  }



  get credit() {

    return this._credit;

  }



  get termCodes() {

    return this._termCodes;

  }



  get timeslotTables() {

    return this._timeslotTables;

  }



  get timeslotTableBits() {

    return this._timeslotTableBits;

  }



  get syllabusHref() {
    return this._syllabusHref || `https://campus-3.shinshu-u.ac.jp/syllabusj/Display?NENDO=${CURRENT_YEAR}&CODE=${this.code}`;
  }
  private _syllabusHref: string;

  get facultyColor() {
    const prefix = this._code.charAt(0).toUpperCase();
    return facultyColorMap[prefix] || "#006633"; // デフォルトはスクールカラー(DIC389)
  }

  get facultyName() {
    const prefix = this._code.charAt(0).toUpperCase();
    return facultyNameMap[prefix] || "信州大学";
  }



}



export const kdb = (() => {
  const subjectMap: { [key: string]: Subject } = {};
  const subjectCodeList: string[] = [];
  const allSubjects = syllabusData as ScrapedSubject[];

  for (const data of allSubjects) {
     const subject = new Subject(data);
     subjectMap[subject.code] = subject;
     subjectCodeList.push(subject.code);
  }

  return {
    subjectMap,
    subjectCodeList,
    updated: new Date().toISOString(),
  };
})();



// 一度に表示する件数

export const ONCE_COUNT = 50;



// 初期表示する科目

export const initialSubjects = kdb.subjectCodeList

  .slice(0, ONCE_COUNT)

  .map((code) => kdb.subjectMap[code]);



// UTF-8 BOM付きで CSV ファイルに出力
export const outputSubjectsToCSV = (

  subjects: Subject[],

  a: HTMLAnchorElement | null,

) => {

  const escaped = /,|\r?\n|\r|"/;

  const e = /"/g;



  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

  const rows = [

    [

      "科目コード",

      "科目名",

      "単位数",

      "年度",

      "ターム",

      "時限",

      "担当教員",

      "授業方法",

      "概要",

      "備考",

    ],

  ];

  for (const subject of subjects) {

    rows.push([

      subject.code,

      subject.name,

      subject.credit.toFixed(1),

      subject.year,

      subject.termStr,

      subject.timeslotStr,

      subject.person,

      subject.classMethods.join(","),

      subject.abstract,

      subject.note,

    ]);

  }



  // カンマなどでエスケープ
  const csvRows: string[] = [];

  for (const row of rows) {

    csvRows.push(

      row

        .map((field) =>

          escaped.test(field) ? `"${field.replace(e, '""')}"` : field,

        )

        .join(",")

        .replace('\n",', '",'),

    );

  }



  // kdb_YYYYMMDDhhmmdd.csv

  const dateString = (() => {

    const date = new Date();

    const Y = date.getFullYear();

    const M = `${date.getMonth() + 1}`.padStart(2, "0");

    const D = `${date.getDate()}`.padStart(2, "0");

    const h = `${date.getHours()}`.padStart(2, "0");

    const m = `${date.getMinutes()}`.padStart(2, "0");

    const d = `${date.getSeconds()}`.padStart(2, "0");

    return Y + M + D + h + m + d;

  })();

  const filename = `kdb_${dateString}.csv`;



  // Blob の作成
  const blob = new Blob([bom, csvRows.join("\n")], { type: "text/csv" });

  if (a) {

    a.download = filename;

    a.href = window.URL.createObjectURL(blob);

  }

};

