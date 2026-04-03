import { matchesCodeRequirement } from "../kdb/code-types";
import type { ClassMethod, NormalSeason, Subject } from "./subject";
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
  campuses: Set<string>;
  departments: Set<string>;
  categories: Set<string>;
  timeslotTable: TimeslotTable;
  excludesBookmark: boolean;
  containsName: boolean;
  containsCode: boolean;
  containsRoom: boolean;
  containsPerson: boolean;
  containsAbstract: boolean;
  containsNote: boolean;
  filter: "all" | "bookmark" | "except-bookmark";
  exceptSameName: boolean;
  sortBy: string | null;
  sortOrder: "asc" | "desc";
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
    campuses: new Set(),
    departments: new Set(),
    categories: new Set(),
    timeslotTable: createEmptyTimeslotTable(),
    excludesBookmark: false,
    containsName: true,
    containsCode: true,
    containsRoom: false,
    containsPerson: false,
    containsAbstract: false,
    containsNote: false,
    filter: "all",
    exceptSameName: false,
    sortBy: null,
    sortOrder: "asc",
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

  // Sorting
  if (searchOptions.sortBy) {
    subjects.sort((a, b) => {
      const key = searchOptions.sortBy as keyof Subject;
      let valA = a[key];
      let valB = b[key];

      // Handle nulls
      if (valA == null) return 1;
      if (valB == null) return -1;

      // Special handling for specific fields
      if (key === "termStr") {
        const order: Record<string, number> = { 前期: 1, 後期: 2, 通年: 3 };
        const aOrder = order[valA as string] || 99;
        const bOrder = order[valB as string] || 99;
        return searchOptions.sortOrder === "asc" ? aOrder - bOrder : bOrder - aOrder;
      }

      if (key === "credit") {
        const aVal = typeof valA === "number" ? valA : 0;
        const bVal = typeof valB === "number" ? valB : 0;
        return searchOptions.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Default string/locale comparison for Japanese
      const aStr = String(valA);
      const bStr = String(valB);
      return searchOptions.sortOrder === "asc"
        ? aStr.localeCompare(bStr, "ja")
        : bStr.localeCompare(aStr, "ja");
    });
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
  // 履修学年
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

  // キャンパス
  const matchesCampus = options.campuses.size === 0 || options.campuses.has(subject.campus);

  // 部局
  const matchesDepartment = options.departments.size === 0 || options.departments.has(subject.openingDepartment);

  // カテゴリ
  const matchesCategory = options.categories.size === 0 || options.categories.has(subject.category);

  // 要件
  const matchesRequirement = (() => {
    const reqA = options.reqA !== "null" ? options.reqA : null;
    const reqB = options.reqB !== "null" ? options.reqB : null;
    const reqC = options.reqC !== "null" ? options.reqC : null;
    return matchesCodeRequirement(subject.code, reqA, reqB, reqC);
  })();

  // オンライン
  const matchesClassMethod =
    !options.classMethod ||
    subject.classMethods.some((method) => options.classMethod === method);

  // ブックマーク
  const matchesBookmark = (() => {
    const bookmarked = bookmarksHas(subject.code);
    return (
      options.filter === "all" ||
      (options.filter === "bookmark" && bookmarked) ||
      (options.filter === "except-bookmark" && !bookmarked)
    );
  })();

  // 同名の科目を除外
  const matchesSameName = !options.exceptSameName || !codeSet.has(subject.name);

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
    matchesSameName &&
    matchesCampus &&
    matchesDepartment &&
    matchesCategory
  );
};

/** 失敗した正規表現のキャッシュ */
const regExpCaches: Set<string> = new Set();

/**
 * エラーに寛容に正規表現を構築する
 * @param keyword
 */
const buildRegExp = (keyword: string): RegExp | string => {
  try {
    return new RegExp(keyword, "i");
  } catch {
    return keyword;
  }
};

/**
 * エラーに寛容にマッチ検索する
 * @param base
 * @param regex
 */
const matchesSoftly = (
  base: string,
  regex: string | RegExp,
): RegExpMatchArray | null => {
  // 不正な正規表現などでエラーが起きれば、単純に文字列同士の部分一致をとる
  // 失敗キャッシュがあればそれを返す
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
  // 何の条件も設定されていない場合は true
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

  // 空文字の場合は true
  if (options.keyword === "") {
    return true;
  }

  // 科目番号は前方一致
  const matchesCode =
    options.containsCode && subject.code.startsWith(options.keyword);

  const matchesName =
    options.containsName && matchesSoftly(subject.name, regex);
  const matchesRoom =
    options.containsRoom && matchesSoftly(subject.room, regex);

  // 教員名のスペースを無視して検索
  // すなわち、"情報太郎" または "情報　太郎" で検索した場合も、"情報 太郎" にヒットさせる
  const matchesPerson =
    options.containsPerson &&
    matchesSoftly(
      subject.person.replace(" ", ""),
      buildRegExp(options.keyword.replace(/[ 　]/, "")),
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

  if (!season) return true;

  // 「通年」の科目は前期・後期のいずれの検索でもヒットさせる
  if (subject.termStr === "通年") return true;

  return subject.termStr === season;
};

const matchesTimeslot = (
  subject: Subject,
  options: SearchOptions,
  enableBits: bigint,
  disableBits: bigint,
) => {
  // 除外時限に一致する場合は false
  if (
    options.excludesBookmark &&
    matchesTimeslots(subject.timeslotTableBits, disableBits)
  ) {
    return false;
  }

  // 以下のいずれかの場合は true
  // - 何の条件も設定されていない
  // - 時限が一致する
  // - 集中、横断、随時に一致する
  const isNotSpecified = getTimeslotsLength(options.timeslotTable) === 0;

  return (
    isNotSpecified || matchesTimeslots(subject.timeslotTableBits, enableBits)
  );
};
