import kdbData from "@/kdb/kdb.json";

import kdbGradData from "@/kdb/kdb-grad.json";

import type { KdbData } from "../kdb/kdb";

import {

  createTimeslotTable,

  type TimeslotTable,

  timeslotTableToBits,

} from "./timetable";



// 霑ｴ・ｾ陜ｨ・ｨ邵ｺ・ｮ隴鯉ｽ･闔牙･ﾂｰ郢ｧ迚呻ｽｹ・ｴ陟趣ｽｦ郢ｧ雋槫徐陟募干笘・ｹｧ蜿･・ｰ・ｴ陷ｷ蛹ｻﾂ竏ｵ謔ｴ陷茨ｽｬ鬮｢荵昴・郢ｧ・ｷ郢晢ｽｩ郢晁・縺帷ｹｧ雋樒崟霎｣・ｧ邵ｺ蜉ｱ窶ｻ邵ｺ蜉ｱ竏ｪ邵ｺ繝ｻ蠎・妙・ｽ隲､・ｧ邵ｺ蠕娯旺郢ｧ荵昶螺郢ｧ竏堋竏ｵ辟碑恪霈斐定濤・ｴ陟趣ｽｦ郢ｧ蜻亥ｳｩ隴・ｽｰ邵ｺ蜷ｶ・狗ｸｲ繝ｻ// 郢ｧ・ｷ郢晢ｽｩ郢晁・縺帷ｸｺ・ｯ雎井ｸｻ・ｹ・ｴ 4 隴帑ｺ包ｽｸ鬆第ｵ∫ｸｺ・ｫ隴厄ｽｴ隴・ｽｰ邵ｺ霈費ｽ檎ｹｧ荵敖繝ｻexport const CURRENT_YEAR = 2026;



const allSeasons = ["隴擾ｽ･", "陞溘・, "驕倥・, "陷・ｬ"] as const;

export const normalSeasons = ["隴擾ｽ･", "驕倥・] as const;

export const modules = ["A", "B", "C"] as const;

export const classMethods = ["陝・ｽｾ鬮ｱ・｢", "郢ｧ・ｪ郢晢ｽｳ郢昴・繝ｻ郢晢ｽｳ郢昴・, "陷ｷ譴ｧ蜃ｾ陷ｿ譴ｧ蟀ｿ陷ｷ繝ｻ] as const;



export type AllSeason = (typeof allSeasons)[number];

export type NormalSeason = (typeof normalSeasons)[number];

export type Module = (typeof modules)[number];

export type ClassMethod = (typeof classMethods)[number];



const isAllSeason = (char: string): char is AllSeason =>

  (allSeasons as readonly string[]).includes(char);



const isNormalSeason = (char: string): char is NormalSeason =>

  (normalSeasons as readonly string[]).includes(char);



const isModule = (char: string): char is Module =>

  (modules as readonly string[]).includes(char);



export const getTermCode = (season: NormalSeason, module: Module) =>

  (season === "隴擾ｽ･" ? 0 : 3) + (module === "A" ? 0 : module === "B" ? 1 : 2);



export class Subject {

  private _code: string;

  private _name: string;

  private _credit: number;

  private _termCodes: number[][] = [];

  private _timeslotTables: TimeslotTable[] = [];

  // timeslotTables 邵ｺ・ｮ郢晁侭繝｣郢昜ｺ･繝ｻ邵ｺ・ｮ髫ｲ荵溽ｊ驕ｨ謳ｾ・ｼ蝓滂ｽ､諛・ｽｴ・｢騾包ｽｨ繝ｻ繝ｻ  private _timeslotTableBits = 0n;

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



  constructor(line: KdbData["subject"][0]) {

    this._code = line[0];

    this._name = line[1];



    this._credit = Number.parseFloat(line[3]);

    if (Number.isNaN(this._credit)) {

      this._credit = 0;

    }

    this.year = line[4];

    this.termStr = line[5];

    this.timeslotStr = line[6];

    this.room = line[7];

    this.person = line[8];

    this.abstract = line[9];

    this.note = line[10];



    this._termCodes = Subject.parseTerm(this.termStr);



    // 隴弱ｋ蜑・
    // 郢ｧ・ｿ郢晢ｽｼ郢晢｣ｰ邵ｺ・ｨ郢ｧ・ｳ郢晄ｧｭ繝ｻ郢ｧ・ｰ郢晢ｽｫ郢晢ｽｼ郢晞斡閨樒ｸｺ・ｯ驕楪邵ｺ・ｫ闕ｳﾂ髢ｾ・ｴ邵ｺ蜉ｱ竊醍ｸｺ繝ｻ・ｰ・ｴ陷ｷ蛹ｻ窶ｲ邵ｺ繧・ｽ・
    // 郢ｧ・ｿ郢晢ｽｼ郢晢｣ｰ邵ｺ・ｮ郢ｧ・ｰ郢晢ｽｫ郢晢ｽｼ郢晏干窶ｲ 1 邵ｺ・､邵ｺ蜉ｱﾂｰ邵ｺ・ｪ邵ｺ繝ｻ・ｰ・ｴ陷ｷ蛹ｻ繝ｻ邵ｲ竏壺・邵ｺ・ｹ邵ｺ・ｦ邵ｺ・ｮ郢ｧ・ｳ郢晄ｧｭ・帝お・ｱ陷ｷ繝ｻ    const tempTimeslotStr =

      this._termCodes.length === 1

        ? this.timeslotStr.replace(/ /g, ",")

        : this.timeslotStr;



    // 郢ｧ・ｰ郢晢ｽｫ郢晢ｽｼ郢晉軸・ｯ蠑ｱ竊楢怎・ｦ騾・・    const termStrArray = tempTimeslotStr.split(" ");

    for (const str of termStrArray) {

      this._timeslotTables.push(createTimeslotTable(str));

      this.concentration ||= str.includes("鬮ｮ繝ｻ・ｸ・ｭ");

      this.negotiable ||= str.includes("陟｢諛・ｽｫ繝ｻ);

      this.asneeded ||= str.includes("鬮ｫ荵怜・");

      this.nt ||= str.includes("NT");

    }

    for (const table of this._timeslotTables) {

      this._timeslotTableBits |= timeslotTableToBits(table);

    }



    // 郢ｧ・ｳ郢晄ｧｭ繝ｻ郢ｧ・ｰ郢晢ｽｫ郢晢ｽｼ郢晏干窶ｲ 1 邵ｺ・､邵ｺ蜉ｱﾂｰ邵ｺ・ｪ邵ｺ繝ｻ・ｰ・ｴ陷ｷ蛹ｻ繝ｻ邵ｲ竏壺・邵ｺ・ｹ邵ｺ・ｦ邵ｺ・ｮ郢ｧ・ｿ郢晢ｽｼ郢晢｣ｰ郢ｧ蝣､・ｵ・ｱ陷ｷ繝ｻ    if (this._timeslotTables.length === 1) {

      this._termCodes = [[...new Set(this._termCodes.flat())]];

    }



    this.classMethods = classMethods.filter((it) => this.note.indexOf(it) > -1);

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

    return `https://kdb.tsukuba.ac.jp/syllabi/${CURRENT_YEAR}/${this.code}/jpn`;

  }



  private static parseTerm(termStr: string) {

    // 郢ｧ・ｿ郢晢ｽｼ郢晢｣ｰ郢ｧ・ｳ郢晢ｽｼ郢昴・    // - 隴擾ｽ･ A-C: 0-2

    // - 驕倥・A-C: 3-5

    // - 隴擾ｽ･陝・ｽ｣邵ｲ竏晢ｽ､荳橸ｽｭ・｣邵ｲ竏ｫ・ｧ蜿･・ｭ・｣邵ｲ竏昴・陝・ｽ｣闔ｨ隨ｬ・･・ｭ闕ｳ・ｭ: 6-9

    const termCodes: number[][] = [];

    let season: AllSeason | null = null;



    // 陋ｻ譏ｴ・∫ｸｺ・ｫ郢ｧ・ｹ郢晏｣ｹ繝ｻ郢ｧ・ｹ邵ｺ・ｧ陋ｻ繝ｻ迚｡

    const termGroups = termStr.split(" ");

    for (const groupStr of termGroups) {

      // 邵ｺ・ｻ邵ｺ・ｨ郢ｧ阮吮・邵ｺ・ｮ驕倬・蟯ｼ邵ｺ・ｫ邵ｺ・ｦ邵ｲ竏壹■郢晢ｽｼ郢晢｣ｰ郢ｧ・ｳ郢晢ｽｼ郢晏ｳｨ繝ｻ郢ｧ・ｰ郢晢ｽｫ郢晢ｽｼ郢晏干繝ｻ郢ｧ・ｳ郢晄ｧｭ繝ｻ郢ｧ・ｰ郢晢ｽｫ郢晢ｽｼ郢晏干竊定叉ﾂ髢ｾ・ｴ邵ｺ蜷ｶ・・
      const group: number[] = [];

      const charArray = Array.from(groupStr);



      for (let i = 0; i < charArray.length; i++) {

        const char = charArray[i];

        const nextChar = charArray[i + 1];



        // 鬨ｾ螢ｼ・ｹ・ｴ邵ｺ・ｮ陜｣・ｴ陷ｷ蛹ｻ繝ｻ隴擾ｽ･ A-C繝ｻ讙趣ｽｧ蟶ｰ-C 郢ｧ雋槭・郢ｧ蠕鯉ｽ・
        if (char === "鬨ｾ繝ｻ && nextChar === "陝ｷ・ｴ") {

          group.push(0, 1, 2, 3, 4, 5);

          continue;

        }

        // 陝・ｽ｣驕ｽﾂ邵ｺ謔溘・霑ｴ・ｾ邵ｺ蜉ｱ笳・撻・ｴ陷ｷ蛹ｻﾂ竏ｽ・ｻ・･鬮ｯ髦ｪ繝ｻ郢ｧ・ｿ郢晢ｽｼ郢晢｣ｰ邵ｺ・ｯ邵ｺ譏ｴ繝ｻ陝・ｽ｣驕ｽﾂ邵ｺ・ｨ邵ｺ蜉ｱ窶ｻ隰・ｽｱ邵ｺ繝ｻ        if (isAllSeason(char)) {

          season = char;

        }

        if (season) {

          // ABC 郢ｧ・ｿ郢晢ｽｼ郢晢｣ｰ

          if (isModule(char) && isNormalSeason(season)) {

            const no = getTermCode(season, char);

            group.push(no);

          }

          // 闔ｨ隨ｬ・･・ｭ闕ｳ・ｭ

          if (char === "闔ｨ繝ｻ) {

            group.push(allSeasons.indexOf(season) + 6);

          }

        }

      }

      termCodes.push(group);

    }

    return termCodes;

  }

}



export const kdb = (() => {

  const subjectMap: { [key: string]: Subject } = {};

  const subjectCodeList: string[] = [];



  const allSubjects = [

    ...(kdbData as KdbData).subject,

    ...(kdbGradData as KdbData).subject,

  ];

  for (const line of allSubjects) {

    const subject = new Subject(line);

    subjectMap[subject.code] = subject;

    subjectCodeList.push(subject.code);

  }

  return {

    subjectMap,

    subjectCodeList,

    updated: kdbData.updated,

  };

})();



// 闕ｳﾂ陟趣ｽｦ邵ｺ・ｫ髯ｦ・ｨ驕会ｽｺ邵ｺ蜷ｶ・玖脂・ｶ隰ｨ・ｰ

export const ONCE_COUNT = 50;



// 鬯ｮ蛟ｬﾂ貅ｷ蝟ｧ邵ｺ・ｮ邵ｺ貅假ｽ∫ｸｲ竏昴・陜玲ｫ・ｽ｡・ｨ驕会ｽｺ隴弱ｅ繝ｻ邵ｺ・ｿ郢晁ｼ斐≦郢晢ｽｫ郢ｧ・ｿ邵ｺ霈費ｽ檎ｸｺ・ｦ邵ｺ・ｪ邵ｺ繝ｻ・ｧ驢榊ｲｼ郢ｧ螳夲ｽ｡・ｨ驕会ｽｺ

export const initialSubjects = kdb.subjectCodeList

  .slice(0, ONCE_COUNT)

  .map((code) => kdb.subjectMap[code]);



// UTF-8繝ｻ繝ｻOM 闔牙･窶ｳ繝ｻ蟲ｨ繝ｻ CSV 郢晁ｼ斐＜郢ｧ・､郢晢ｽｫ邵ｺ・ｫ陷・ｽｺ陷峨・export const outputSubjectsToCSV = (

  subjects: Subject[],

  a: HTMLAnchorElement | null,

) => {

  const escaped = /,|\r?\n|\r|"/;

  const e = /"/g;



  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

  const rows = [

    [

      "驕倬・蟯ｼ騾｡・ｪ陷ｿ・ｷ",

      "驕倬・蟯ｼ陷ｷ繝ｻ,

      "陷雁・ｽｽ閧ｴ辟・,

      "陝ｷ・ｴ隹ｺ・｡",

      "郢ｧ・ｿ郢晢ｽｼ郢晢｣ｰ",

      "隴匁㊧蠕狗ｹ晢ｽｻ隴弱ｋ蜑・,

      "隲｡繝ｻ・ｽ繝ｻ,

      "陞ｳ貊灘多陟厄ｽ｢隲ｷ繝ｻ,

      "隶弱ｊ・ｦ繝ｻ,

      "陋ｯ蜻ｵﾂ繝ｻ,

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



  // 郢ｧ・ｨ郢ｧ・ｹ郢ｧ・ｱ郢晢ｽｼ郢昴・  const csvRows: string[] = [];

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



  // Blob 邵ｺ・ｮ郢晢ｽｪ郢晢ｽｳ郢ｧ・ｯ郢ｧ蝣､蜃ｽ隰後・  const blob = new Blob([bom, csvRows.join("\n")], { type: "text/csv" });

  if (a) {

    a.download = filename;

    a.href = window.URL.createObjectURL(blob);

  }

};

