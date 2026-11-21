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
      // 「8月は休園」「営業は3/21〜11/30」「季節営業(2026年は5/3〜11/3)」は 2026-11 から
      // 季節休業として読む（下の「季節休業・営業期間」で検証）
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

describe("季節休業・営業期間（2026-11: 冬季休業中の施設に釣行指数を出していた）", () => {
  const closed = (t: string, d: string) => isClosedOn(t, d);

  it("「12〜2月は休業」は12〜2月だけ休み", () => {
    expect(closed("12〜2月は休業", "2026-12-01")).toBe(true);
    expect(closed("12〜2月は休業", "2027-02-28")).toBe(true);
    expect(closed("12〜2月は休業", "2026-11-30")).toBe(false);
    expect(closed("12〜2月は休業", "2027-03-01")).toBe(false);
  });

  it("曜日の定休と季節休業を両方読む", () => {
    const t = "水曜。12〜3月は冬季休業";
    expect(closed(t, "2026-11-25")).toBe(true); // 水曜
    expect(closed(t, "2026-11-26")).toBe(false);
    expect(closed(t, "2027-01-07")).toBe(true); // 冬季
  });

  it("理由つき・月末表記・月の列挙を読む", () => {
    expect(closed("7〜9月は高水温のため休業(2026-27シーズンは10/15開始)", "2027-08-01")).toBe(true);
    expect(closed("営業日は公式ブログの月間カレンダー。12月〜3月末は冬季休業", "2027-03-31")).toBe(true);
    expect(closed("4〜11月は毎日営業、12月と3月は土日祝のみ、1・2月は閉園", "2027-02-10")).toBe(true);
    expect(closed("4〜11月は毎日営業、12月と3月は土日祝のみ、1・2月は閉園", "2026-12-10")).toBe(false);
  });

  it("主語つきの部分休業（エサ釣りだけ・マス釣りだけ）は休みにしない", () => {
    expect(closed("平日。エサ釣りは12〜3月休業(フライ・ルアーは通年)", "2027-01-09")).toBe(false);
    expect(closed("1〜3月はマス釣り休み(2026年は4/12から)", "2027-02-06")).toBe(false);
  });

  it("あいまいな境界（上旬・中旬・下旬・前後）は読まない", () => {
    expect(parseClosedRule("11月下旬〜4月上旬は休業。定休日は記載なし")).toBeNull();
    expect(parseClosedRule("営業は土・日・月・祝のみ(12/6〜5/31、水温で前後)")).toBeNull();
  });

  it("日付範囲の休み", () => {
    expect(closed("休園 12/29〜3/31", "2027-02-01")).toBe(true);
    expect(closed("11月1日〜翌年4月24日は休館", "2027-04-24")).toBe(true);
    expect(closed("11月1日〜翌年4月24日は休館", "2027-04-25")).toBe(false);
    expect(closed("期間内は無休(7/1〜9/30は休業)", "2026-09-30")).toBe(true);
    expect(closed("10/1〜4/30は禁漁", "2026-11-21")).toBe(true);
  });

  it("営業期間の外は休み（翌年またぎ・月末表記）", () => {
    expect(closed("冬期休業(営業は3/21〜11/30。栃ナビ・NAVITIME の値)", "2026-12-01")).toBe(true);
    expect(closed("冬期休業(営業は3/21〜11/30。栃ナビ・NAVITIME の値)", "2026-11-30")).toBe(false);
    expect(closed("営業期間 11/1〜翌3/31", "2027-01-15")).toBe(false);
    expect(closed("営業期間 11/1〜翌3/31", "2027-06-15")).toBe(true);
    expect(closed("冬季(1〜3月)のみ営業", "2026-12-31")).toBe(true);
    expect(closed("冬季(1〜3月)のみ営業", "2027-03-31")).toBe(false);
    expect(closed("3月末〜11月末の期間中は無休(増水時は臨時休業)", "2026-12-01")).toBe(true);
  });

  it("年つきの営業期間は、その年にだけ当てはめる", () => {
    const t = "季節営業(2026年は5/3〜11/3)";
    expect(closed(t, "2026-11-21")).toBe(true);
    expect(closed(t, "2026-08-01")).toBe(false);
    expect(closed(t, "2027-11-21")).toBe(false); // 2027年の期間は不明なので断定しない
    expect(closed("期間外(令和8年は3/14〜12/28)", "2026-12-29")).toBe(true);
  });

  it("複数の営業期間（区間ごとに曜日が違う書き方）", () => {
    const t = "2026年は4/29〜7/12 の土日祝、7/18〜8/30 の毎日、9/5〜9/23 の土日祝に営業";
    expect(closed(t, "2026-07-15")).toBe(true); // 7/13〜7/17 は期間外
    expect(closed(t, "2026-08-01")).toBe(false);
    expect(closed("解禁期間外は釣り不可(2026年度は5/27〜6/28・9/18〜10/4)", "2026-07-15")).toBe(true);
    expect(closed("解禁期間外は釣り不可(2026年度は5/27〜6/28・9/18〜10/4)", "2026-06-01")).toBe(false);
  });

  it("年つきの特定日", () => {
    expect(closed("2026年11月は2・9・16・24・30日", "2026-11-24")).toBe(true);
    expect(closed("2026年11月は2・9・16・24・30日", "2026-11-25")).toBe(false);
    expect(closed("2026-11-29 は休み", "2026-11-29")).toBe(true);
    expect(closed("2026-11-29 は休み", "2027-11-29")).toBe(false);
    const t = "火曜+不定の水曜(11月は第2・4水曜)。2026-12-14〜19 はトイレ改修で休業、12/30〜1/1 休業";
    expect(closed(t, "2026-12-16")).toBe(true);
    expect(closed(t, "2026-12-31")).toBe(true);
    expect(closed("臨時休業あり(2026年は11/18・11/25・12/2・12/9・12/16)。12月21日以降は冬季休業", "2026-11-25")).toBe(true);
  });

  it("営業曜日の説明は読まず、月の休園だけ読む", () => {
    const t = "水・土・日曜・祝日のみ営業(2026年9月以降。8月は休園)";
    expect(parseClosedRule(t)?.weekly).toEqual([]);
    expect(closed(t, "2026-08-12")).toBe(true);
    expect(closed(t, "2026-11-24")).toBe(false); // 火曜でも曜日の休みとしては読まない
  });

  it("営業の説明だけの文は従来どおり休みとして読まない", () => {
    expect(parseClosedRule("土日祝のみ営業")).toBeNull();
    expect(parseClosedRule("年中無休")).toBeNull();
    expect(parseClosedRule("冬季は休業")).toBeNull();
  });
});
