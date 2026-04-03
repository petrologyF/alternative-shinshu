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
  classroom?: string;
  credits_detail?: string;
  target_student?: string;
  format?: string;
  overview?: string;
  evaluation?: string;
  textbook?: string;
  lesson_plan?: Array<{ session: string; content: string }>;
}

export const facultyColorMap: Record<string, string> = {
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

export const facultyNameMap: Record<string, string> = {
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

const allSeasons = ["前期", "後期", "通年"] as const;
export const normalSeasons = ["前期", "後期", "通年"] as const;
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
  private _timeslotTableBits = 0n;

  year: string;
  termStr: string;
  timeslotStr: string;
  room: string;
  person: string;
  abstract: string;
  note: string;
  classMethods: ClassMethod[];
  
  // Shinshu-optimized fields
  openingDepartment: string;
  campus: string;
  category: string;
  isLottery: boolean;

  // New Detailed Fields
  targetStudent: string;
  format: string;
  evaluation: string;
  textbook: string;
  lessonPlan: Array<{ session: string; content: string }>;

  concentration = false;
  negotiable = false;
  asneeded = false;
  nt = false;

  constructor(data: ScrapedSubject) {
    this._code = data.id;
    this._name = data.title;
    
    // Use scraped credits if available, fallback to 2
    this._credit = data.credits_detail ? parseFloat(data.credits_detail) : 2;
    if (isNaN(this._credit)) this._credit = 2;

    this.year = data.target_student || "1-4";
    this.timeslotStr = data.slot;
    
    // Shinshu Term Mapping (Simplified)
    if (this.timeslotStr.includes("前期")) this.termStr = "前期";
    else if (this.timeslotStr.includes("後期")) this.termStr = "後期";
    else this.termStr = "通年";

    this.room = data.classroom || "";
    this.person = data.instructor;
    this.abstract = data.overview || "";
    this.note = ""; 
    this._syllabusHref = data.url;

    this.targetStudent = data.target_student || "";
    this.format = data.format || "";
    this.evaluation = data.evaluation || "";
    this.textbook = data.textbook || "";
    this.lessonPlan = data.lesson_plan || [];

    // Shinshu Mapping
    const prefix = this._code.charAt(0).toUpperCase();
    this.openingDepartment = facultyNameMap[prefix] || "信州大学";
    
    const homeCampuses: Record<string, string> = {
      H: "松本", E: "長野", L: "松本", S: "松本", M: "松本",
      T: "長野", A: "南箕輪", F: "上田", G: "松本", Q: "松本", R: "松本"
    };
    
    this.campus = this.year.includes("1") ? "松本" : (homeCampuses[prefix] || "松本");

    this.category = "";
    if (prefix === "G" || prefix === "Q" || prefix === "R") {
      const subCategory = this._code.substring(1, 3);
      if (subCategory === "0A") this.category = "学術リテラシー";
      else if (subCategory === "0B") this.category = "現代社会の諸課題";
      else this.category = "共通教育";
    } else {
      this.category = this.openingDepartment;
    }

    this.isLottery = this.note.includes("抽選") || this._name.includes("(抽選)");

    this._termCodes = [[0, 1, 2, 3, 4, 5]]; 
    this._timeslotTables.push(createTimeslotTable(this.timeslotStr));
    
    this.concentration = this.timeslotStr.includes("集");
    this.negotiable = this.timeslotStr.includes("不定");
    this.asneeded = this.timeslotStr.includes("随時");

    for (const table of this._timeslotTables) {
      this._timeslotTableBits |= timeslotTableToBits(table);
    }

    this.classMethods = [];
    if (this._name.includes("対面")) this.classMethods.push("対面");
    if (this._name.includes("オンライン")) this.classMethods.push("オンライン");
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

  get displayName() {
    // Remove campus info like [松本], [長野], etc. from the title
    return this._name.replace(/\[[^\]]+\]/g, "").trim();
  }

  get facultyColor() {
    const prefix = this._code.charAt(0).toUpperCase();
    return facultyColorMap[prefix] || "#004831"; // Official Shinshu Green
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

export const ONCE_COUNT = 50;

export const initialSubjects = kdb.subjectCodeList
  .slice(0, ONCE_COUNT)
  .map((code) => kdb.subjectMap[code]);

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

  const csv = csvRows.join("\n");
  const dateString = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const filename = `shinshu_syllabus_${dateString}.csv`;

  if (a) {
    const blob = new Blob([bom, csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
  }
};
