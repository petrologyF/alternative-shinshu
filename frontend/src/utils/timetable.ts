// 曜日（月〜土）

// 時限情報から TimeslotTable を作成

export const daysofweek: readonly string[] = [
  "月",
  "火",
  "水",
  "木",
  "金",
];

// 最大時限数

export const maxPeriod = 6;



// 指定された値で埋められた Timetable を作成

export type Timetable<T> = T[][];

export type TimeslotTable = Timetable<boolean>;



/**
 * 指定された値で埋められた Timetable を作成
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
 * 時限文字列から TimeslotTable を作成
 */

export const createTimeslotTable = (value: string): TimeslotTable => {
  const table = fillTimetable(false);
  let dayArray: number[] = [];

  // 全角数字を半角に変換し、スペースをカンマに正規化
  const normalizedValue = value
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/ /g, ",");

  const slotStrArray = normalizedValue.split(",");
  for (const slotStr of slotStrArray) {
    if (!slotStr) continue;

    // 曜日の抽出
    const dayStr = slotStr.replace(/[0-9-]/g, "");
    const days = dayStr
      .split("")
      .filter((day) => daysofweek.includes(day))
      .map((day) => daysofweek.indexOf(day));

    if (days.length > 0) {
      dayArray = days;
    }

    // 時限の抽出
    const periodArray: number[] = [];
    const periodStr = slotStr.replace(/[^0-9-]/g, "");

    if (periodStr.indexOf("-") > -1) {
      const periodStrArray = periodStr.split("-");
      const startPeriod = Number(periodStrArray[0]);
      const endPeriod = Number(periodStrArray[1]);
      for (
        let k = Math.max(startPeriod, 1);
        k <= Math.min(endPeriod, maxPeriod);
        k++
      ) {
        periodArray.push(k);
      }
    } else if (periodStr.length > 0) {
      periodArray.push(Number(periodStr));
    }

    if (periodStr.length > 0) {
      for (const day of dayArray) {
        for (const period of periodArray) {
          if (day >= 0 && day < daysofweek.length && period >= 1 && period <= maxPeriod) {
            table[day][period - 1] = true;
          }
        }
      }
    }
  }
  return table;
};



/**
 * 空の TimeslotTable を作成
 */

export const createEmptyTimeslotTable = (): TimeslotTable => {

  return fillTimetable(false);

};



/**
 * TimeslotTable のコマ数を取得
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
 * TimeslotTable をクリア
 */

export const clearTimeslotTable = (table: TimeslotTable) => {

  for (let day = 0; day < table.length; day++) {

    for (let period = 0; period < table[day].length; period++) {

      table[day][period] = false;

    }

  }

};



/**
 * 2 つの TimeslotTable が重なっているか判定
 */

export const matchesTimeslots = (a: bigint, b: bigint) => {

  return (a & b) !== 0n;

};



/**
 * TimeslotTable をビット列に変換
 */

export const timeslotTableToBits = (table: TimeslotTable) => {

  // 7 * 6 = 42 bit のビット列に変換
  let bits = 0n;

  for (let day = 0; day < table.length; day++) {

    for (let period = 0; period < table[day].length; period++) {

      // コマがない場合は 0 、コマがある場合は 1
      bits = (bits << 1n) | (table[day][period] === true ? 1n : 0n);

    }

  }

  return bits;

};

