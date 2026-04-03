import { z } from "zod";
import codeTypesGrad from "./code-types-grad.json";
import codeTypesUndergrad from "./code-types-undergrad.json";

export const subjectCodeSchema = z.string().min(7).max(10);



type Codes = string[];

export type SmallCodeArray = { name: string; children: Codes }[];

export type MidCodeArray = { name: string; children: SmallCodeArray | Codes }[];

export type CodeArray = {

  name: string;

  children: MidCodeArray | Codes;

}[];



type SmallCodeMap = Record<string, { codes: Codes }>;

type MidCodeMap = Record<string, { codes: Codes; small: SmallCodeMap }>;

type CodeMap = Record<string, { codes: Codes; mid: MidCodeMap }>;



// 科目コードの定義

export const allCodeTypes = (() => {

  // 学群

  const undergrad = codeTypesUndergrad as unknown as CodeArray;

  const grad = codeTypesGrad as unknown as MidCodeArray;

  return [...undergrad, { name: "大学院・専門職大学院・開放講義", children: grad }];

})();



// 科目コードのマップ
export const allCodeMap: CodeMap = (() => {

  const map: CodeMap = {};



  // 大区分
  for (const large of allCodeTypes) {

    map[large.name] = { codes: [], mid: {} };

    const largeMap = map[large.name];



    // 子要素が文字列の場合はコードを直接追加
    if (typeof large.children[0] === "string") {

      largeMap.codes = large.children as Codes;

      continue;

    }

    // 中区分
    for (const mid of large.children as MidCodeArray) {

      largeMap.mid[mid.name] = { codes: [], small: {} };

      const midMap = largeMap.mid[mid.name];



      // 子要素が文字列の場合はコードを直接追加
      if (typeof mid.children[0] === "string") {

        midMap.codes = mid.children as Codes;

        largeMap.codes.push(...(mid.children as Codes));

        continue;

      }

      // 小区分
      for (const small of mid.children as SmallCodeArray) {

        midMap.small[small.name] = { codes: small.children };

        largeMap.codes.push(...small.children);

        midMap.codes.push(...small.children);

      }

    }

  }

  return map;

})();



/**
 * 指定された要件（大・中・小区分）に科目コードが一致するか判定
 * @param code 科目コード
 * @param reqA 大区分
 * @param reqB 中区分
 * @param reqC 小区分
 * @returns 一致するかどうか
 */

export const matchesCodeRequirement = (

  code: string,

  reqA: string | null,

  reqB: string | null,

  reqC: string | null,

) => {

  // 要件が指定されていない場合は true
  if (reqA === null) {

    return true;

  }

  // 大区分のみ指定
  if (reqB === null) {

    return allCodeMap[reqA]?.codes.some((c) => code.startsWith(c));

  }

  // 中区分まで指定
  if (reqC === null) {

    return allCodeMap[reqA]?.mid[reqB]?.codes.some((c) => code.startsWith(c));

  }

  // 小区分まで指定
  return allCodeMap[reqA]?.mid[reqB]?.small[reqC]?.codes.some((c) =>

    code.startsWith(c),

  );

};

