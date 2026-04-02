// 騾包ｽｨ髫ｱ讒ｫ・ｮ螟ゑｽｾ・ｩ

// 隴匁㊧蠕九・螢ｽ諤ｦ隴匁㊧蠕狗ｸｺ荵晢ｽ芽ｭ鯉ｽ･隴匁㊧蠕狗ｸｺ・ｾ邵ｺ・ｧ邵ｺ・ｮ 7 隴鯉ｽ･鬮｢繝ｻ// 隴弱ｋ蜑槭・螢ｽ閧｢隶鯉ｽｭ邵ｺ・ｮ隴弱ｋ菫｣陝ｶ・ｯ郢ｧ螳夲ｽ｡・ｨ邵ｺ蜷晁・闖ｴ繝ｻ// 郢ｧ・ｳ郢晄ｩｸ・ｼ繝ｻimeslot繝ｻ莨夲ｽｼ螟る浹陞ｳ螢ｹ繝ｻ隴匁㊧蠕狗ｸｺ・ｨ隴弱ｋ蜑樒ｸｺ・ｮ驍ｨ繝ｻ竏ｩ陷ｷ蛹ｻ・冗ｸｺ蟶卍ｰ郢ｧ逕ｻ・ｧ蛹ｺ繝ｻ邵ｺ霈費ｽ檎ｹｧ荵敖竏ｵ閧｢隶鯉ｽｭ邵ｺ・ｮ 1 郢ｧ・ｳ郢昴・// 隴弱ｋ菫｣陷托ｽｲ繝ｻ繝ｻimetable繝ｻ莨夲ｽｼ螢ｽ螻・ｭ鯉ｽ･ ・・・隴弱ｋ蜑・邵ｺ・ｮ郢昴・繝ｻ郢晄じﾎ・
// TimeslotTable繝ｻ螢ｹ縺慕ｹ晄ｧｭ繝ｻ隴幄・笏檎ｹｧ螳夲ｽ｡・ｨ邵ｺ蜷ｶ繝ｦ郢晢ｽｼ郢晄じﾎ・


export const daysofweek: readonly string[] = [

  "隴帙・,

  "霓｣・ｫ",

  "雎鯉ｽｴ",

  "隴幢ｽｨ",

  "鬩･繝ｻ,

  "陜ｨ繝ｻ,

];

// 隴崢陞滂ｽｧ隴弱ｋ蜑櫁ｬｨ・ｰ

export const maxPeriod = 6;



// 闔譴ｧ・ｬ・｡陷医・繝ｻ陋ｻ證ｦ・ｼ繝ｻ隴匁㊧蠕犠[隴弱ｋ蜑枉繝ｻ蟲ｨ竊堤ｸｺ蜉ｱ窶ｻ髯ｦ・ｨ霑ｴ・ｾ

export type Timetable<T> = T[][];

export type TimeslotTable = Timetable<boolean>;



/**

 * filled 邵ｺ・ｧ陜謎ｹ晢ｽ∫ｹｧ蟲ｨ・檎ｸｺ貊灘・鬮｢轣倡横繝ｻ蝓滓ｦ遯ｶ謐ｺ蠕・・・・6鬮ｯ闊娯穐邵ｺ・ｧ繝ｻ蟲ｨ・定抄諛医・邵ｺ蜷ｶ・・
 */

export const fillTimetable = <T>(filled: T): T[][] => {

  const table = new Array(daysofweek.length);

  for (let day = 0; day < daysofweek.length; day++) {

    table[day] = new Array(maxPeriod);

    for (let period = 0; period < maxPeriod; period++) {

      table[day][period] = structuredClone(filled);

    }

  }

  return table;

};



/**

 * 隴弱ｋ蜑樒ｹｧ螳夲ｽ｡・ｨ邵ｺ蜻取椢陝・懊・郢ｧ蛛ｵ繝ｱ郢晢ｽｼ郢ｧ・ｹ邵ｺ蜉ｱ窶ｻ邵ｲ竏ｵ蜃ｾ鬮｢轣倡横郢ｧ蜑・ｽｽ諛医・邵ｺ蜷ｶ・・
 */

export const createTimeslotTable = (value: string): TimeslotTable => {

  const table = fillTimetable(false);

  let dayArray: number[] = [];



  // 繝ｻ蟶ｶ螻・ｭ鯉ｽ･ + 隰ｨ・ｰ陝・圜・ｼ蛹ｻ繝ｯ郢ｧ・､郢晁ｼ釆ｦ陷ｷ・ｫ郢ｧﾂ繝ｻ莨夲ｽｽ譏ｴ窶ｲ郢ｧ・ｳ郢晢ｽｳ郢晄ｧｫ邇・崕繝ｻ・顔ｸｺ・ｧ驛｢・ｰ郢ｧ鬘假ｽｿ譁撰ｼ・ｹｧ蠕鯉ｽ・
  // 郢ｧ・ｳ郢晢ｽｳ郢晄ｧｭ縲定崕繝ｻ迚｡

  // TODO: check

  const slotStrArray = (value as string).split(",");

  for (const slotStr of slotStrArray) {

    // 隴匁㊧蠕狗ｹｧ雋槫徐陟輔・    const dayStr = slotStr.replace(/[0-9-]/g, "");

    const days = dayStr

      .split("郢晢ｽｻ")

      .filter((day) => daysofweek.includes(day))

      .map((day) => daysofweek.indexOf(day));

    if (days.length > 0) {

      dayArray = days;

    }



    // 隴弱ｋ蜑樒ｹｧ雋槫徐陟輔・    const periodArray: number[] = [];

    const periodStr = slotStr.replace(/[^0-9-]/g, "");



    // - 邵ｺ謔滓ｧ邵ｺ・ｾ郢ｧ蠕鯉ｽ玖撻・ｴ陷ｷ蛹ｻ繝ｻ驕ｽ繝ｻ蟲・ｩ包ｽｸ隰壹・    if (periodStr.indexOf("-") > -1) {

      const periodStrArray = periodStr.split("-");

      const startPeriod = Number(periodStrArray[0]);

      const endPeriod = Number(periodStrArray[1]);

      for (

        let k = Math.max(startPeriod, 0);

        k <= Math.min(endPeriod, maxPeriod);

        k++

      ) {

        periodArray.push(k);

      }

    } else {

      periodArray.push(Number(periodStr));

    }



    if (periodStr.length > 0) {

      for (const day of dayArray) {

        for (const period of periodArray) {

          table[day][period - 1] = true;

        }

      }

    }

  }

  return table;

};



/**

 * 驕ｨ・ｺ邵ｺ・ｮ TimeslotTable 郢ｧ蜑・ｽｽ諛医・邵ｺ蜷ｶ・・
 */

export const createEmptyTimeslotTable = (): TimeslotTable => {

  return fillTimetable(false);

};



/**

 * 隴弱ｋ菫｣陷托ｽｲ邵ｺ荵晢ｽ芽惺驛・ｽｨ蛹ｻ縺慕ｹ晄ｨ顔・郢ｧ蝣､・ｮ諤懊・邵ｺ蜷ｶ・・
 */

export const getTimeslotsLength = (table: TimeslotTable) => {

  let sum = 0;

  for (let day = 0; day < table.length; day++) {

    for (let period = 0; period < table[day].length; period++) {

      if (table[day][period]) {

        sum++;

      }

    }

  }

  return sum;

};



/**

 * 隴弱ｋ菫｣陷托ｽｲ郢ｧ蝣､・ｩ・ｺ邵ｺ・ｫ邵ｺ蜷ｶ・・
 */

export const clearTimeslotTable = (table: TimeslotTable) => {

  for (let day = 0; day < table.length; day++) {

    for (let period = 0; period < table[day].length; period++) {

      table[day][period] = false;

    }

  }

};



/**

 * 2 邵ｺ・､邵ｺ・ｮ隴弱ｋ菫｣陷托ｽｲ邵ｺ・ｮ郢ｧ・ｳ郢晄ｧｭ窶ｲ鬩･髦ｪ竊醍ｸｺ・｣邵ｺ・ｦ邵ｺ繝ｻ・狗ｸｺ荵昶・邵ｺ繝ｻﾂｰ郢ｧ蛛ｵﾂ竏壹Φ郢昴・繝ｨ陋ｻ蜉ｱ・帝包ｽｨ邵ｺ繝ｻ窶ｻ陋ｻ・､陞ｳ螢ｹ笘・ｹｧ繝ｻ */

export const matchesTimeslots = (a: bigint, b: bigint) => {

  return (a & b) !== 0n;

};



/**

 * TimeslotTable 郢ｧ蛛ｵ繝ｳ郢昴・繝ｨ陋ｻ蜉ｱ竊楢棔逕ｻ驪､邵ｺ蜷ｶ・・
 */

export const timeslotTableToBits = (table: TimeslotTable) => {

  // 7 * 6 = 42 bit 邵ｺ・ｪ邵ｺ・ｮ邵ｺ・ｧ郢ｧ・ｪ郢晢ｽｼ郢晁・繝ｻ郢晁ｼ釆溽ｹ晢ｽｼ邵ｺ蜉ｱ竊醍ｸｺ繝ｻ  let bits = 0n;

  for (let day = 0; day < table.length; day++) {

    for (let period = 0; period < table[day].length; period++) {

      // 驕楪邵ｺ・ｫ undefined 邵ｺ謔溘・郢ｧ荵晢ｼ・ｸｺ・ｨ邵ｺ蠕娯旺郢ｧ荵敖・ｶndefined 邵ｺ・ｮ陜｣・ｴ陷ｷ蛹ｻ繝ｻ 0 郢ｧ雋槭・郢ｧ蠕鯉ｽ・
      bits = (bits << 1n) | (table[day][period] === true ? 1n : 0n);

    }

  }

  return bits;

};

