/**
 * 気象庁 潮位表データ（public/tide-data/）と潮回り計算の回帰テスト。
 *
 * - 満干値の回帰ピン: 気象庁の推算txt原本・潮MieYell・tide736 と手動突合済みの値を
 *   リテラルで固定。取り込みスクリプトのパース変更による破壊を検知する。
 * - 潮回りの回帰ピン: tide736（津）の実ラベル14日分と一致することを固定。
 * - 日付カバレッジ: 「今日+14日」が未整備になると fail する（年次更新の強制装置）。
 *   fail したら `node scripts/build-tide-data.mjs --year <翌年>` を実行して差分をコミットすること。
 */
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { todayJST } from "@/lib/activity";
import { TIDE_STATIONS } from "@/lib/tide/stations";
import { getTideDay, type StationYearData } from "@/lib/tide/tide-data";
import { getTideInfoForDate } from "@/lib/tide/tide-info";
import { getMoonAgeJST, getTidePhaseJST } from "@/lib/tide/moon";

const DATA_DIR = path.join(process.cwd(), "public", "tide-data");

describe("データファイルの網羅性・妥当性", () => {
  const years = fs
    .readdirSync(DATA_DIR)
    .filter((d) => /^\d{4}$/.test(d))
    .sort();

  it("年ディレクトリが存在する", () => {
    expect(years.length).toBeGreaterThan(0);
  });

  it("全239地点×全年のJSONが存在し、時刻・潮位が妥当", () => {
    const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const year of years) {
      const expectedDays = Number(year) % 4 === 0 ? 366 : 365;
      for (const st of TIDE_STATIONS) {
        const file = path.join(DATA_DIR, year, `${st.code}.json`);
        expect(fs.existsSync(file), `${year}/${st.code}.json が無い`).toBe(true);
        const data = JSON.parse(fs.readFileSync(file, "utf-8")) as StationYearData;
        expect(data.code).toBe(st.code);
        const dayKeys = Object.keys(data.days);
        expect(dayKeys.length, `${year}/${st.code} の日数`).toBe(expectedDays);
        // 全日を舐めると重いので、月初・月末・うるう境界を含む12日をサンプル検査
        const samples = dayKeys.filter((d) => /-(01|15|28)$/.test(d.slice(5)));
        for (const key of samples) {
          const day = data.days[key];
          for (const list of [day.hi, day.lo]) {
            let prev = "";
            for (const [time, cm] of list) {
              expect(time, `${st.code} ${key}`).toMatch(timeRe);
              expect(cm).toBeGreaterThan(-150);
              expect(cm).toBeLessThan(700); // 有明海（大浦・大牟田等）は大潮で500cm超に達する
              expect(time > prev, `${st.code} ${key} 時刻昇順`).toBe(true);
              prev = time;
            }
          }
        }
      }
    }
  });

  it("今日+14日のデータが整備済み（failしたら翌年データの取り込みが必要）", () => {
    const d = new Date(`${todayJST()}T12:00:00+09:00`);
    d.setUTCDate(d.getUTCDate() + 14);
    const target = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(d);
    const day = getTideDay("TK", target);
    expect(
      day,
      `${target} のデータ未整備。node scripts/build-tide-data.mjs --year ${target.slice(0, 4)} を実行してPRしてください`,
    ).not.toBeNull();
  });
});

describe("満干値の回帰ピン（気象庁txt原本と突合済み）", () => {
  // hourly（毎時潮位）は --with-hourly 生成時のみ付くため、満干（hi/lo）だけをピンする
  it("鳥羽TB 2026-08-29/30（香良洲漁港の最寄り地点・UGC指摘の検証日）", () => {
    const d29 = getTideDay("TB", "2026-08-29");
    expect(d29?.hi).toEqual([
      ["06:15", 215],
      ["19:02", 218],
    ]);
    expect(d29?.lo).toEqual([
      ["00:26", 73],
      ["12:39", 33],
    ]);
    const d30 = getTideDay("TB", "2026-08-30");
    expect(d30?.hi).toEqual([
      ["06:52", 217],
      ["19:25", 219],
    ]);
    expect(d30?.lo).toEqual([
      ["00:56", 63],
      ["13:08", 41],
    ]);
  });

  it("東京TK 2026-01-01（負の潮位を含む固定長パースの回帰）", () => {
    const d = getTideDay("TK", "2026-01-01");
    expect(d?.hi).toEqual([
      ["04:08", 169],
      ["14:15", 176],
    ]);
    expect(d?.lo).toEqual([
      ["09:01", 123],
      ["21:35", -2],
    ]);
  });

  it("那覇NH 2026-08-29", () => {
    const d = getTideDay("NH", "2026-08-29");
    expect(d?.hi).toEqual([
      ["07:32", 222],
      ["20:12", 216],
    ]);
    expect(d?.lo).toEqual([
      ["01:37", 72],
      ["13:56", 35],
    ]);
  });

  it("hourly（毎時潮位）が24点・満干と整合したレンジで入っている", () => {
    const d = getTideDay("TB", "2026-08-29");
    expect(d?.hourly).toHaveLength(24);
    const min = Math.min(...(d?.hourly ?? []));
    const max = Math.max(...(d?.hourly ?? []));
    // 満干の潮位は毎時サンプルの範囲を少し超える程度に収まる
    expect(min).toBeGreaterThan(0);
    expect(max).toBeLessThan(250);
    expect(max).toBeGreaterThanOrEqual(215); // 満潮215cm付近を含む
  });
});

describe("潮回り・月齢の回帰ピン（tide736 津の実ラベルと突合済み）", () => {
  it("2026-08の14日分が一致する", () => {
    const expected: [string, number, string][] = [
      ["2026-08-10", 26.7, "中潮"],
      ["2026-08-11", 27.7, "大潮"],
      ["2026-08-12", 28.7, "大潮"],
      ["2026-08-13", 0.4, "大潮"], // 新月
      ["2026-08-14", 1.4, "大潮"],
      ["2026-08-15", 2.4, "中潮"],
      ["2026-08-19", 6.4, "小潮"],
      ["2026-08-20", 7.4, "小潮"], // 上弦
      ["2026-08-21", 8.4, "小潮"],
      ["2026-08-22", 9.4, "長潮"],
      ["2026-08-25", 12.4, "中潮"],
      ["2026-08-28", 15.4, "大潮"], // 満月
      ["2026-08-29", 16.4, "大潮"], // UGC指摘日（旧実装は「中潮」と誤表示していた）
      ["2026-08-30", 17.4, "中潮"],
    ];
    for (const [date, age, label] of expected) {
      expect(getMoonAgeJST(date), `${date} 月齢`).toBeCloseTo(age, 1);
      expect(getTidePhaseJST(date).tideType, `${date} 潮回り`).toBe(label);
    }
  });
});

describe("getTideInfoForDate（TideInfo互換アダプタ）", () => {
  it("鳥羽 2026-08-29: 満干時刻＋大潮（旧近似式の約5.5h逆転が解消されている）", () => {
    const info = getTideInfoForDate("TB", "2026-08-29");
    expect(info.highTides).toEqual(["06:15", "19:02"]);
    expect(info.lowTides).toEqual(["00:26", "12:39"]);
    expect(info.tideType).toBe("大潮");
    expect(info.fishingScore).toBe(5);
  });

  it("code=null（淡水）は潮回りのみで満干は空", () => {
    const info = getTideInfoForDate(null, "2026-08-29");
    expect(info.highTides).toEqual([]);
    expect(info.lowTides).toEqual([]);
    expect(info.tideType).toBe("大潮");
  });

  it("データ未整備の日付（遠い将来）は満干が空になり、近似式へフォールバックしない", () => {
    const info = getTideInfoForDate("TB", "2099-01-01");
    expect(info.highTides).toEqual([]);
    expect(info.lowTides).toEqual([]);
  });
});
