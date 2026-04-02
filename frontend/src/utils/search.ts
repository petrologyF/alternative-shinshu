import { matchesCodeRequirement } from "../kdb/code-types";
import type { ClassMethod, Module, NormalSeason, Subject } from "./subject";
import { getTermCode } from "./subject";
import {
  createEmptyTimeslotTable,
  getTimeslotsLength,
  matchesTimeslots,
  type TimeslotTable,
  timeslotTableToBits,
} from "./timetable";

export interface SearchOptions {
  keyword: string;
  reqA: string;
  reqB: string;
  reqC: string;
  classMethod: ClassMethod | null;
  years: Set<number>;
  season: NormalSeason | null;
  module: Module | null;
  timeslotTable: TimeslotTable;
  excludesBookmark: boolean;
  containsName: boolean;
  containsCode: boolean;
  containsRoom: boolean;
  containsPerson: boolean;
  containsAbstract: boolean;
  containsNote: boolean;
  filter: "all" | "bookmark" | "except-bookmark";
  concentration: boolean;
  negotiable: boolean;
  asneeded: boolean;
  nt: boolean;
  exceptSameName: boolean;
}

export const createSearchOptions = (): SearchOptions => {
  return {
    keyword: "",
    reqA: "null",
    reqB: "null",
    reqC: "null",
    classMethod: null,
    years: new Set(),
    season: null,
    module: null,
    timeslotTable: createEmptyTimeslotTable(),
    excludesBookmark: false,
    containsName: true,
    containsCode: true,
    containsRoom: false,
    containsPerson: false,
    containsAbstract: false,
    containsNote: false,
    filter: "all",
    concentration: false,
    negotiable: false,
    asneeded: false,
    nt: false,
    exceptSameName: false,
  };
};

export const searchSubjects = (
  subjectMap: Record<string, Subject>,
  subjectCodeList: string[],
  searchOptions: SearchOptions,
  bookmarkTimeslotTable: TimeslotTable,
  bookmarksHas: (subjectCode: string) => boolean,
) => {
  const subjects: Subject[] = [];
  const nameSet = new Set<string>();
  const enableTimeslotBits = timeslotTableToBits(searchOptions.timeslotTable);
  const disableTimeslotBits = timeslotTableToBits(
    searchOptions.excludesBookmark ? bookmarkTimeslotTable : [],
  );

  const regex = buildRegExp(searchOptions.keyword);

  for (let i = 0; i < subjectCodeList.length; i++) {
    const subject = subjectMap[subjectCodeList[i]];
    if (
      matchesSearchOptions(
        subject,
        searchOptions,
        regex,
        nameSet,
        enableTimeslotBits,
        disableTimeslotBits,
        bookmarksHas,
      )
    ) {
      subjects.push(subject);
      nameSet.add(subject.name);
    }
  }
  return subjects;
};

const matchesSearchOptions = (
  subject: Subject,
  options: SearchOptions,
  keywordRegex: RegExp | string,
  codeSet: Set<string>,
  enableTimeslotBits: bigint,
  disableTimeslotBits: bigint,
  bookmarksHas: (subjectCode: string) => boolean,
) => {
  // 讓呎ｺ門ｱ･菫ｮ蟷ｴ谺｡
  const matchesYear = (() => {
    if (options.years.size === 0) {
      return true;
    }
    if (!subject.year.includes("-")) {
      return [...options.years].some((year) =>
        subject.year.includes(year.toString()),
      );
    }
    const minYear = Number.parseInt(
      subject.year.replace(/\s-\s[1-6]/g, ""),
      10,
    );
    const maxYear = Number.parseInt(
      subject.year.replace(/[1-6]\s-\s/g, ""),
      10,
    );
    return [...options.years].some(
      (year) => minYear <= year && year <= maxYear,
    );
  })();

  // 隕∽ｻｶ
  const matchesRequirement = (() => {
    const reqA = options.reqA !== "null" ? options.reqA : null;
    const reqB = options.reqB !== "null" ? options.reqB : null;
    const reqC = options.reqC !== "null" ? options.reqC : null;
    return matchesCodeRequirement(subject.code, reqA, reqB, reqC);
  })();

  // 繧ｪ繝ｳ繝ｩ繧､繝ｳ
  const matchesClassMethod =
    !options.classMethod ||
    subject.classMethods.some((method) => options.classMethod === method);

  // 繝悶ャ繧ｯ繝槭・繧ｯ
  const matchesBookmark = (() => {
    const bookmarked = bookmarksHas(subject.code);
    return (
      options.filter === "all" ||
      (options.filter === "bookmark" && bookmarked) ||
      (options.filter === "except-bookmark" && !bookmarked)
    );
  })();

  // 蜷悟錐縺ｮ遘醍岼繧帝勁螟・  const matchesSameName = !options.exceptSameName || !codeSet.has(subject.name);

  return (
    matchesKeyword(subject, options, keywordRegex) &&
    matchesTerm(subject, options) &&
    matchesTimeslot(
      subject,
      options,
      enableTimeslotBits,
      disableTimeslotBits,
    ) &&
    matchesRequirement &&
    matchesBookmark &&
    matchesClassMethod &&
    matchesYear &&
    matchesSameName
  );
};

/** 螟ｱ謨励＠縺滓ｭ｣隕剰｡ｨ迴ｾ縺ｮ繧ｭ繝｣繝・す繝･*/
const regExpCaches: Set<string> = new Set();

/**
 * 繧ｨ繝ｩ繝ｼ縺ｫ蟇帛ｮｹ縺ｫ豁｣隕剰｡ｨ迴ｾ繧呈ｧ狗ｯ峨☆繧・ * @param keyword
 */
const buildRegExp = (keyword: string): RegExp | string => {
  try {
    return new RegExp(keyword, "i");
  } catch {
    return keyword;
  }
};

/**
 * 繧ｨ繝ｩ繝ｼ縺ｫ蟇帛ｮｹ縺ｫ繝槭ャ繝∵､懃ｴ｢縺吶ｋ
 * @param base
 * @param regex
 */
const matchesSoftly = (
  base: string,
  regex: string | RegExp,
): RegExpMatchArray | null => {
  // 荳肴ｭ｣縺ｪ豁｣隕剰｡ｨ迴ｾ遲峨↓繧医▲縺ｦ繧ｨ繝ｩ繝ｼ縺瑚ｵｷ縺阪ｌ縺ｰ・悟腰邏斐↓譁・ｭ怜・縺ｩ縺・＠縺ｮ驛ｨ蛻・ｸ閾ｴ繧偵→繧・
  // 螟ｱ謨励く繝｣繝・す繝･縺後≠繧後・縺昴ｌ繧定ｿ斐☆
  const keyword = typeof regex === "string" ? regex : regex.source;
  if (regExpCaches.has(regex as string)) {
    return base.includes(regex as string) ? [base] : null;
  }

  try {
    return base.match(regex);
  } catch {
    regExpCaches.add(keyword);
    return base.includes(keyword) ? [base] : null;
  }
};

const matchesKeyword = (
  subject: Subject,
  options: SearchOptions,
  regex: RegExp | string,
) => {
  // 菴輔・譚｡莉ｶ繧りｨｭ螳壹＆繧後※縺・↑縺・ｴ蜷医・ true
  if (
    !options.containsCode &&
    !options.containsName &&
    !options.containsRoom &&
    !options.containsPerson &&
    !options.containsAbstract &&
    !options.containsNote
  ) {
    return true;
  }

  // 遨ｺ譁・ｭ励・蝣ｴ蜷医・ true
  if (options.keyword === "") {
    return true;
  }

  // 遘醍岼逡ｪ蜿ｷ縺ｯ蜑肴婿荳閾ｴ
  const matchesCode =
    options.containsCode && subject.code.startsWith(options.keyword);

  const matchesName =
    options.containsName && matchesSoftly(subject.name, regex);
  const matchesRoom =
    options.containsRoom && matchesSoftly(subject.room, regex);

  // 謨吝藤蜷阪・繧ｹ繝壹・繧ｹ繧堤┌隕悶＠縺ｦ讀懃ｴ｢
  // 縺吶↑繧上■縲・諠・ｱ螟ｪ驛・ 縺ｾ縺溘・ "諠・ｱ縲螟ｪ驛・ 縺ｧ讀懃ｴ｢縺励◆蝣ｴ蜷医ｂ縲・諠・ｱ 螟ｪ驛・ 縺ｫ繝偵ャ繝医＆縺帙ｋ
  const matchesPerson =
    options.containsPerson &&
    matchesSoftly(
      subject.person.replace(" ", ""),
      buildRegExp(options.keyword.replace(/[ 縲]/, "")),
    ) != null;

  const matchesAbstract =
    options.containsAbstract && matchesSoftly(subject.abstract, regex);
  const matchesNote =
    options.containsNote && matchesSoftly(subject.note, regex);

  return (
    matchesCode ||
    matchesName ||
    matchesRoom ||
    matchesPerson ||
    matchesAbstract ||
    matchesNote
  );
};

const matchesTerm = (subject: Subject, options: SearchOptions) => {
  const season = options.season;
  const module = options.module;

  // 騾壼ｹｴ縺ｮ蝣ｴ蜷医・繝槭ャ繝・  if (subject.termStr.includes("騾壼ｹｴ")) {
    return true;
  }

  // 蟄ｦ譛溘√Δ繧ｸ繝･繝ｼ繝ｫ縺御ｸ｡譁ｹ謖・ｮ壹＆繧後※縺・ｋ蝣ｴ蜷医・邨・∩蜷医ｏ縺帙〒讀懃ｴ｢
  if (season && module) {
    return subject.termCodes.some((codes) =>
      codes.includes(getTermCode(season, module)),
    );
  }

  // 縺昴≧縺ｧ縺ｪ縺代ｌ縺ｰ縺ｩ縺｡繧峨°迚・婿縺ｧ讀懃ｴ｢
  const matchesSeason = !season || subject.termStr.includes(season);
  const matchesModule = !module || subject.termStr.includes(module);
  return matchesSeason && matchesModule;
};

const matchesTimeslot = (
  subject: Subject,
  options: SearchOptions,
  enableBits: bigint,
  disableBits: bigint,
) => {
  // 髯､螟匁凾髯舌↓荳閾ｴ縺吶ｋ蝣ｴ蜷医・ false
  if (
    options.excludesBookmark &&
    matchesTimeslots(subject.timeslotTableBits, disableBits)
  ) {
    return false;
  }

  // 莉･荳九・縺・★繧後°縺ｮ蝣ｴ蜷医・ true
  // - 菴輔・譚｡莉ｶ繧りｨｭ螳壹＆繧後※縺・↑縺・  // - 譎る剞縺御ｸ閾ｴ縺吶ｋ
  // - 髮・ｸｭ縲∵ｨｪ譁ｭ縲・囂譎ゅ↓荳閾ｴ縺吶ｋ
  const isNotSpecified =
    getTimeslotsLength(options.timeslotTable) === 0 &&
    !options.concentration &&
    !options.negotiable &&
    !options.asneeded &&
    !options.nt;
  const matchesSpecial =
    (options.concentration && subject.concentration) ||
    (options.negotiable && subject.negotiable) ||
    (options.asneeded && subject.asneeded) ||
    (options.nt && subject.nt);

  return (
    isNotSpecified ||
    matchesTimeslots(subject.timeslotTableBits, enableBits) ||
    matchesSpecial
  );
};
