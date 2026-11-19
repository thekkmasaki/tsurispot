import { describe, it, expect } from "vitest";
import { parseClosedRule, isClosedOn, isSpotClosedOn, ymdJst } from "../spot-closed-days";
import { fishingSpots, getSpotBySlug } from "../data/spots";

describe("parseClosedRule", () => {
  it("毎週の曜日指定を読む", () => {
    expect(parseClosedRule("毎週木曜日（祝日は開園）、1月1日")).toMatchObject({
      weekly: [4],
      holidayOpen: true,
      dates: [{ from: [1, 1], to: [1, 1] }],
    });
    expect(parseClosedRule("毎週火・水曜日")?.weekly).toEqual([2, 3]);
    expect(parseClosedRule("火曜・水曜")?.weekly).toEqual([2, 3]);
    expect(parseClosedRule("水・木")?.weekly).toEqual([3, 4]);
    expect(parseClosedRule("月曜日（祝日の場合は翌日）、年末年始、荒天時")).toMatchObject({
      weekly: [1],
      holidayOpen: true,
    });
  });

  it("第N曜日を読む", () => {
    expect(parseClosedRule("第3週木曜日(8月を除く。祝日は営業)")).toMatchObject({
      weekly: [],
      nth: [{ weekday: 4, nths: [3] }],
      exceptMonths: [8],
      holidayOpen: true,
    });
    expect(parseClosedRule("第3水曜・第3木曜(祝日は営業)")?.nth).toEqual([
      { weekday: 3, nths: [3] },
      { weekday: 4, nths: [3] },
    ]);
    expect(parseClosedRule("毎月第3金曜(臨時休業あり)")?.nth).toEqual([{ weekday: 5, nths: [3] }]);
  });

  it("曜日の範囲と無休の月を読む", () => {
    expect(parseClosedRule("月〜水(祝日は営業、臨時休業あり)")).toMatchObject({ weekly: [1, 2, 3], holidayOpen: true });
    expect(parseClosedRule("木曜(5・7・8月は無休)、年末年始、12〜2月の平日")?.exceptMonths).toEqual([5, 7, 8]);
    expect(parseClosedRule("木曜(7〜8月は無休、祝日は営業)")).toMatchObject({ exceptMonths: [7, 8], holidayOpen: true });
    expect(parseClosedRule("火・水・木(祝日・GW・お盆は営業)。12〜3月は冬季休業")?.holidayOpen).toBe(true);
  });

  it("日付だけの休みを読む", () => {
    expect(parseClosedRule("元旦のみ休業")?.dates).toEqual([{ from: [1, 1], to: [1, 1] }]);
    expect(parseClosedRule("木曜日(祝日は営業し前日の水曜が休み)、12/28〜1/2、毎年2月は全休")?.dates).toEqual([
      { from: [12, 28], to: [1, 2] },
    ]);
  });

  it("読めない表記は null（休みと決めつけない）", () => {
    for (const t of [
      "不定休",
      "年中無休",
      "なし",
      "冬季休業",
      "平日",
      "3〜11月 水・木、12〜2月 水・木・金(祝日は営業、年末年始休)",
      "11〜3月は木曜、4〜10月は不定休",
      "第1・第3金曜(5月は第2・第4、8月は第1・第4)、元旦、台風時",
      "水・土・日曜・祝日のみ営業(2026年9月以降。8月は休園)",
      "冬期休業(営業は3/21〜11/30。栃ナビ・NAVITIME の値)",
      "季節営業(2026年は5/3〜11/3)",
      "シーズンオフ(2026年11月1日から休業中)",
      "火・水曜(7〜9月は火曜も営業、祝日営業)",
      "",
      undefined,
    ]) {
      expect(parseClosedRule(t), String(t)).toBeNull();
    }
  });
});

describe("isClosedOn", () => {
  it("毎週木曜・祝日は開園", () => {
    const t = "毎週木曜日（祝日は開園）、1月1日";
    expect(isClosedOn(t, "2026-11-19")).toBe(true); // 木
    expect(isClosedOn(t, "2026-11-20")).toBe(false); // 金
    expect(isClosedOn(t, "2027-02-11")).toBe(false); // 木・建国記念の日
    expect(isClosedOn(t, "2027-01-01")).toBe(true); // 金・元日
  });

  it("祝日の注記が無ければ祝日でも休み", () => {
    expect(isClosedOn("毎週木曜", "2027-02-11")).toBe(true);
  });

  it("第3木曜（8月を除く）", () => {
    const t = "第3週木曜日(8月を除く。祝日は営業)";
    expect(isClosedOn(t, "2026-11-19")).toBe(true); // 11月の第3木曜
    expect(isClosedOn(t, "2026-11-12")).toBe(false); // 第2木曜
    expect(isClosedOn(t, "2026-11-26")).toBe(false); // 第4木曜
    expect(isClosedOn(t, "2026-08-20")).toBe(false); // 8月は除く
  });

  it("年またぎの日付範囲", () => {
    const t = "火曜(祝日は営業)、12/28〜1/2";
    expect(isClosedOn(t, "2026-12-30")).toBe(true);
    expect(isClosedOn(t, "2027-01-02")).toBe(true);
    expect(isClosedOn(t, "2027-01-03")).toBe(false);
  });

  it("定休日情報が無ければ常に false", () => {
    expect(isSpotClosedOn({}, "2026-11-19")).toBe(false);
  });
});

describe("実データ", () => {
  it("平磯海づり公園は木曜（2026-11-19）が休園日", () => {
    const hiraiso = getSpotBySlug("hiraiso-fishing-park");
    expect(hiraiso).toBeTruthy();
    expect(isSpotClosedOn(hiraiso!, "2026-11-19")).toBe(true);
    expect(isSpotClosedOn(hiraiso!, "2026-11-21")).toBe(false);
  });

  it("すそのフィッシングパークは第3木曜（2026-11-19）が定休日", () => {
    const susono = getSpotBySlug("shizuoka-susono-fishing-park");
    expect(susono).toBeTruthy();
    expect(isSpotClosedOn(susono!, "2026-11-19")).toBe(true);
    expect(isSpotClosedOn(susono!, "2026-11-12")).toBe(false);
  });

  it("「年中無休」「なし」を休みと読まない", () => {
    for (const s of fishingSpots) {
      const c = s.managementInfo?.closedDays;
      if (c && /^(年中無休|なし|定休日なし|通年営業)/.test(c)) {
        const rule = parseClosedRule(c);
        expect(rule?.weekly ?? [], `${s.slug}: ${c}`).toEqual([]);
        expect(rule?.nth ?? [], `${s.slug}: ${c}`).toEqual([]);
      }
    }
  });
});

describe("ymdJst", () => {
  it("UTCの夕方はJSTでは翌日", () => {
    expect(ymdJst(new Date("2026-11-19T16:00:00Z"))).toBe("2026-11-20");
  });
});
