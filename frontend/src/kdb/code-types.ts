import codeTypesGrad from "./code-types-grad.json";

import codeTypesUndergrad from "./code-types-undergrad.json";



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



// 驕倬・蟯ｼ騾｡・ｪ陷ｿ・ｷ邵ｺ・ｮ鬩滓ｦ翫・

export const allCodeTypes = (() => {

  // 陝・ｽｦ驗抵ｽ､

  const undergrad = codeTypesUndergrad as unknown as CodeArray;

  const grad = codeTypesGrad as unknown as MidCodeArray;

  return [...undergrad, { name: "陞滂ｽｧ陝・ｽｦ鬮ｯ・｢鬮｢邇厄ｽｨ・ｭ隰怜沺・･・ｭ驕倬・蟯ｼ闕ｳﾂ髫包ｽｧ", children: grad }];

})();



// 驕倬・蟯ｼ騾｡・ｪ陷ｿ・ｷ邵ｺ・ｮ郢晄ｧｭ繝｣郢昴・export const allCodeMap: CodeMap = (() => {

  const map: CodeMap = {};



  // 陞滂ｽｧ陋ｻ繝ｻ・｡繝ｻ  for (const large of allCodeTypes) {

    map[large.name] = { codes: [], mid: {} };

    const largeMap = map[large.name];



    // 闕ｳ・ｭ陋ｻ繝ｻ・｡讒ｭ窶ｲ陝・ｼ懈Β邵ｺ蜉ｱ竊醍ｸｺ繝ｻ・ｰ・ｴ陷ｷ繝ｻ    if (typeof large.children[0] === "string") {

      largeMap.codes = large.children as Codes;

      continue;

    }

    // 闕ｳ・ｭ陋ｻ繝ｻ・｡繝ｻ    for (const mid of large.children as MidCodeArray) {

      largeMap.mid[mid.name] = { codes: [], small: {} };

      const midMap = largeMap.mid[mid.name];



      // 陝・ｸ槭・鬯俶ｧｭ窶ｲ陝・ｼ懈Β邵ｺ蜉ｱ竊醍ｸｺ繝ｻ・ｰ・ｴ陷ｷ繝ｻ      if (typeof mid.children[0] === "string") {

        midMap.codes = mid.children as Codes;

        largeMap.codes.push(...(mid.children as Codes));

        continue;

      }

      // 陝・ｸ槭・鬯倥・      for (const small of mid.children as SmallCodeArray) {

        midMap.small[small.name] = { codes: small.children };

        largeMap.codes.push(...small.children);

        midMap.codes.push(...small.children);

      }

    }

  }

  return map;

})();



/**

 * 隰悶・・ｮ螢ｹ・・ｹｧ蠕娯螺驕倬・蟯ｼ騾｡・ｪ陷ｿ・ｷ邵ｺ譴ｧ谺陞ｳ螢ｹ・・ｹｧ蠕娯螺髫補或・ｻ・ｶ郢ｧ蜻茨ｽｺﾂ邵ｺ貅倪・邵ｺ荵昶・邵ｺ繝ｻﾂｰ郢ｧ螳夲ｽｿ譁絶・

 * @param code 驕倬・蟯ｼ騾｡・ｪ陷ｿ・ｷ

 * @param reqA 陞滂ｽｧ陋ｻ繝ｻ・｡繝ｻ * @param reqB 闕ｳ・ｭ陋ｻ繝ｻ・｡繝ｻ * @param reqC 陝・ｸ槭・鬯倥・ * @returns 隰悶・・ｮ螢ｹ・・ｹｧ蠕娯螺騾｡・ｪ陷ｿ・ｷ邵ｺ譴ｧ谺陞ｳ螢ｹ・・ｹｧ蠕娯螺髫補或・ｻ・ｶ郢ｧ蜻茨ｽｺﾂ邵ｺ貅倪・邵ｺ荵昶・邵ｺ繝ｻﾂｰ

 */

export const matchesCodeRequirement = (

  code: string,

  reqA: string | null,

  reqB: string | null,

  reqC: string | null,

) => {

  // 隰悶・・ｮ螢ｹ竊醍ｸｺ繝ｻ  if (reqA === null) {

    return true;

  }

  // 陞滂ｽｧ陋ｻ繝ｻ・｡繝ｻ  if (reqB === null) {

    return allCodeMap[reqA]?.codes.some((c) => code.startsWith(c));

  }

  // 闕ｳ・ｭ陋ｻ繝ｻ・｡繝ｻ  if (reqC === null) {

    return allCodeMap[reqA]?.mid[reqB]?.codes.some((c) => code.startsWith(c));

  }

  // 陝・ｸ槭・鬯倥・  return allCodeMap[reqA]?.mid[reqB]?.small[reqC]?.codes.some((c) =>

    code.startsWith(c),

  );

};

