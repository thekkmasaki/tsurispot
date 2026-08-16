import { describe, it, expect } from "vitest";
import {
  buildActivityLevels,
  countByLevel,
  maxTripsInAnyMonth,
  todayJST,
} from "@/lib/activity";
import { evalStreakBadges, STREAK_BADGES } from "@/lib/streak-badges";
import { calculateStreak } from "@/lib/streak";

function daysAgoJST(n: number): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 3600 * 1000 - n * 86400000);
  return jst.toISOString().slice(0, 10);
}

describe("buildActivityLevels", () => {
  it("同じ日は最大レベルが勝つ", () => {
    const levels = buildActivityLevels(
      ["2026-08-01", "2026-08-02"],
      ["2026-08-02", "2026-08-03"],
      ["2026-08-03"],
    );
    expect(levels).toEqual({
      "2026-08-01": 1,
      "2026-08-02": 2,
      "2026-08-03": 3,
    });
  });

  it("低いレベルで高いレベルを上書きしない", () => {
    const levels = buildActivityLevels(["2026-08-01"], [], ["2026-08-01"]);
    expect(levels["2026-08-01"]).toBe(3);
  });

  it("不正な日付は無視する", () => {
    const levels = buildActivityLevels(
      ["2026-08-01", "not-a-date", "2026/08/02", ""],
      [],
      [],
    );
    expect(Object.keys(levels)).toEqual(["2026-08-01"]);
  });

  it("空入力で空オブジェクト", () => {
    expect(buildActivityLevels([], [], [])).toEqual({});
  });
});

describe("countByLevel / maxTripsInAnyMonth", () => {
  it("レベル別に数える", () => {
    const levels = {
      "2026-08-01": 1,
      "2026-08-02": 1,
      "2026-08-03": 2,
      "2026-08-04": 3,
    };
    expect(countByLevel(levels)).toEqual({ lv1: 2, lv2: 1, lv3: 1 });
  });

  it("同一月のLv3最大値を返す", () => {
    const levels = {
      "2026-07-01": 3,
      "2026-07-08": 3,
      "2026-07-15": 3,
      "2026-08-02": 3,
      "2026-08-03": 1,
    };
    expect(maxTripsInAnyMonth(levels)).toBe(3);
  });

  it("Lv3ゼロなら0", () => {
    expect(maxTripsInAnyMonth({ "2026-08-01": 2 })).toBe(0);
  });
});

describe("ハイブリッドストリーク（訪問だけでも伸びる）", () => {
  it("訪問のみの連続日数が current になる", () => {
    const visits = [daysAgoJST(0), daysAgoJST(1), daysAgoJST(2)];
    const levels = buildActivityLevels(visits, [], []);
    const streak = calculateStreak(Object.keys(levels));
    expect(streak.current).toBe(3);
    expect(streak.totalDays).toBe(3);
  });

  it("訪問+釣行が混ざっても日単位でユニークに数える", () => {
    const levels = buildActivityLevels(
      [daysAgoJST(0), daysAgoJST(1)],
      [daysAgoJST(1)],
      [daysAgoJST(1)],
    );
    const streak = calculateStreak(Object.keys(levels));
    expect(streak.current).toBe(2);
    expect(streak.totalDays).toBe(2);
  });
});

describe("evalStreakBadges", () => {
  it("最長基準で獲得判定（過去に達成していれば残る）", () => {
    const states = evalStreakBadges(14, 2, 0);
    const byCode = Object.fromEntries(states.map((s) => [s.code, s]));
    expect(byCode["streak-3"].earned).toBe(true);
    expect(byCode["streak-7"].earned).toBe(true);
    expect(byCode["streak-14"].earned).toBe(true);
    expect(byCode["streak-30"].earned).toBe(false);
  });

  it("未獲得は current ベースの progress を返す（99%上限）", () => {
    const states = evalStreakBadges(2, 2, 0);
    const b3 = states.find((s) => s.code === "streak-3")!;
    expect(b3.earned).toBe(false);
    expect(b3.progress).toBe(67);
    const almost = evalStreakBadges(2, 3, 0).find((s) => s.code === "streak-3")!;
    // longest=2 なので未獲得のまま progress は 99 で頭打ち
    expect(almost.progress).toBeLessThanOrEqual(99);
  });

  it("通い詰めは月4回のLv3で獲得", () => {
    const not = evalStreakBadges(0, 0, 3).find((s) => s.code === "streak-kayoi")!;
    expect(not.earned).toBe(false);
    expect(not.progress).toBe(75);
    const got = evalStreakBadges(0, 0, 4).find((s) => s.code === "streak-kayoi")!;
    expect(got.earned).toBe(true);
  });

  it("バッジは7種", () => {
    expect(STREAK_BADGES).toHaveLength(7);
  });
});

describe("todayJST", () => {
  it("YYYY-MM-DD 形式", () => {
    expect(todayJST()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
