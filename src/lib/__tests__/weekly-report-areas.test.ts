import { describe, it, expect } from "vitest";
import {
  WEEKLY_REPORT_AREAS,
  getWeeklyAreaForSpot,
  matchWeeklyAreaForPost,
  pickLatestWeeklyByArea,
  isWeeklyReportTitle,
  MAIN_WEEKLY_AREA_SLUGS,
  weeklyAreaHubPath,
  listWeeklyPostsForArea,
  extractWeeklyDigest,
  parseWeeklyCatchRows,
  catchRowHasFish,
} from "../weekly-report-areas";
import { fishingSpots } from "../data/spots";

describe("WEEKLY_REPORT_AREAS 定義", () => {
  it("主要10＋拡張5の15エリアで slug が一意", () => {
    expect(WEEKLY_REPORT_AREAS).toHaveLength(15);
    const slugs = WEEKLY_REPORT_AREAS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(15);
  });

  it("同一県内で市区町村が2エリアに重複定義されていない（曖昧判定の原因になる）", () => {
    const seen = new Map<string, string>();
    for (const a of WEEKLY_REPORT_AREAS) {
      for (const pref of a.prefectures) {
        for (const m of a.municipalities) {
          const key = `${pref}|${m}`;
          expect(seen.get(key), `${key} が ${seen.get(key)} と ${a.slug} の両方に定義`).toBeUndefined();
          seen.set(key, a.slug);
        }
      }
    }
  });
});

describe("getWeeklyAreaForSpot（スポット→週報エリア）", () => {
  const spotBySlug = (slug: string) => {
    const s = fishingSpots.find((x) => x.slug === slug);
    if (!s) throw new Error(`spot not found: ${slug}`);
    return s;
  };

  it("奈多漁港堤防（福岡市東区）→ 福岡・北九州", () => {
    expect(getWeeklyAreaForSpot(spotBySlug("nata-port-breakwater"))?.slug).toBe("fukuoka-kitakyushu");
  });

  it("検見川浜突堤（千葉市）は横浜の週報を当てない（週報の対象外エリア）", () => {
    expect(getWeeklyAreaForSpot(spotBySlug("kemigawahama-tottei"))).toBeNull();
  });

  it("敦賀新港（福井）は週報エリアなし", () => {
    expect(getWeeklyAreaForSpot(spotBySlug("tsuruga-shinko-fukui"))).toBeNull();
  });

  it("国府津海岸は region が三浦でも address（小田原市）で判定し、湘南にも横浜にも当てない", () => {
    expect(getWeeklyAreaForSpot(spotBySlug("kozu-kaigan6"))).toBeNull();
  });

  it("県が違えば同名市区町村でも当てない（和歌山・美浜町 vs 愛知・美浜町）", () => {
    expect(
      getWeeklyAreaForSpot({ region: { prefecture: "和歌山県" }, address: "和歌山県日高郡美浜町" })?.slug,
    ).toBe("nanki-shirahama");
    expect(
      getWeeklyAreaForSpot({ region: { prefecture: "愛知県" }, address: "愛知県知多郡美浜町" })?.slug,
    ).toBe("chita-mikawa");
    expect(
      getWeeklyAreaForSpot({ region: { prefecture: "福井県" }, address: "福井県三方郡美浜町" }),
    ).toBeNull();
  });

  it("address が空なら null", () => {
    expect(getWeeklyAreaForSpot({ region: { prefecture: "兵庫県" }, address: "" })).toBeNull();
  });

  it("全スポットで判定が例外を出さず、対応するスポットが各主要エリアに1件以上ある", () => {
    const counts = new Map<string, number>();
    for (const s of fishingSpots) {
      const a = getWeeklyAreaForSpot(s);
      if (a) counts.set(a.slug, (counts.get(a.slug) ?? 0) + 1);
    }
    for (const slug of [
      "akashi-kobe", "osaka-sennan", "tokyobay-yokohama", "fukuoka-kitakyushu", "suruga-izu",
      "chita-mikawa", "nanki-shirahama", "setouchi-hiroshima", "sendai-ishinomaki", "otaru-ishikari",
    ]) {
      expect(counts.get(slug) ?? 0, slug).toBeGreaterThan(0);
    }
  });
});

describe("matchWeeklyAreaForPost / pickLatestWeeklyByArea", () => {
  const now = new Date("2026-10-21T09:00:00+09:00");
  const posts = [
    {
      slug: "chouka-shuho-akashi-kobe-2026-10-week3",
      title: "【釣果週報】明石・神戸エリア 2026年10月第3週｜六甲アイランドでタチウオ3本",
      publishedAt: "2026-10-19",
      description: "明石・神戸の10月第3週釣果。",
    },
    {
      slug: "chouka-shuho-akashi-kobe-2026-10-week2",
      title: "【釣果週報】明石・神戸エリア 2026年10月第2週｜平磯でメジロ",
      publishedAt: "2026-10-12",
      description: "古い方",
    },
    {
      // slug 揺れ（boso-peninsula）でもタイトルで房総に拾う
      slug: "chouka-shuho-boso-peninsula-2026-03-week1",
      title: "【釣果週報】房総エリア 2026年3月第1週｜…",
      publishedAt: "2026-03-05",
      description: "",
    },
    {
      slug: "sabiki-tsuri-5-tips",
      title: "サビキ釣りで確実に釣るための5つのコツ",
      publishedAt: "2026-10-20",
      description: "週報ではない通常記事",
    },
  ];

  it("週報タイトル判定", () => {
    expect(isWeeklyReportTitle("【釣果週報】明石・神戸エリア…")).toBe(true);
    expect(isWeeklyReportTitle("釣果速報：大阪湾")).toBe(true);
    expect(isWeeklyReportTitle("サビキ釣りのコツ")).toBe(false);
  });

  it("slug 前方一致 → タイトル の順でエリアを判定し、通常記事は null", () => {
    expect(matchWeeklyAreaForPost(posts[0])?.slug).toBe("akashi-kobe");
    expect(matchWeeklyAreaForPost(posts[2])?.slug).toBe("boso");
    expect(matchWeeklyAreaForPost(posts[3])).toBeNull();
  });

  it("エリアごとに最新1件を選び、28日より古い週報は落とす", () => {
    const map = pickLatestWeeklyByArea(posts, now);
    const akashi = map.get("akashi-kobe");
    expect(akashi?.publishedAt).toBe("2026-10-19");
    expect(akashi?.href).toBe("/blog/chouka-shuho-akashi-kobe-2026-10-week3");
    expect(akashi?.areaLabel).toBe("明石・神戸");
    expect(map.has("boso")).toBe(false); // 3月の記事は「最近の様子」ではない
  });

  it("freshDays を広げれば古い週報も拾える（しきい値が効いていることの確認）", () => {
    const map = pickLatestWeeklyByArea(posts, now, 365);
    expect(map.has("boso")).toBe(true);
  });
});

describe("エリア別最新釣果ページ用ヘルパー", () => {
  it("主要10エリアだけを対象にする", () => {
    expect(MAIN_WEEKLY_AREA_SLUGS).toHaveLength(10);
    expect(MAIN_WEEKLY_AREA_SLUGS).toContain("tokyobay-yokohama");
    expect(MAIN_WEEKLY_AREA_SLUGS).not.toContain("boso");
    expect(weeklyAreaHubPath("nanki-shirahama")).toBe("/chouka/nanki-shirahama");
  });

  it("指定エリアの週報だけを新しい順に返す", () => {
    const posts = [
      { slug: "chouka-shuho-nanki-shirahama-2026-11-week1", title: "【釣果週報】南紀・白浜エリア 2026年11月第1週｜a", publishedAt: "2026-11-03" },
      { slug: "chouka-shuho-akashi-kobe-2026-11-week2", title: "【釣果週報】明石・神戸エリア 2026年11月第2週｜b", publishedAt: "2026-11-10" },
      { slug: "chouka-shuho-nanki-shirahama-2026-11-week2", title: "【釣果週報】南紀・白浜エリア 2026年11月第2週｜c", publishedAt: "2026-11-10" },
      { slug: "aji-guide", title: "アジの釣り方", publishedAt: "2026-11-11" },
    ];
    expect(listWeeklyPostsForArea(posts, "nanki-shirahama").map((p) => p.publishedAt)).toEqual(["2026-11-10", "2026-11-03"]);
  });

  it("週報本文から冒頭要約と一覧表だけを抜き出す", () => {
    const html =
      '<p style="x">南紀の釣果をまとめました。</p><h2>今週の釣果速報（一覧）</h2><div><table><tr><td>天神崎</td></tr></table></div><p>※好調度は…</p><hr/><h2>① 天神崎</h2><p>本文</p>';
    const d = extractWeeklyDigest(html);
    expect(d.intro).toBe('<p style="x">南紀の釣果をまとめました。</p>');
    expect(d.table).toContain("<table>");
    expect(d.table).toContain("※好調度");
    expect(d.table).not.toContain("本文");
  });

  it("「今週末に狙うなら」節も抜き出す（新形式の週報）", () => {
    const html =
      '<p>intro</p><h2>今週末に狙うなら</h2><ul><li><strong>アジ</strong>：本牧</li></ul><h2>今週の釣果速報（一覧）</h2><table><tr><td>a</td></tr></table><h3>先週からの変化</h3><ul><li>🆕 タチウオ</li></ul><hr/><h2>① 本牧</h2>';
    const d = extractWeeklyDigest(html);
    expect(d.picks).toBe("<ul><li><strong>アジ</strong>：本牧</li></ul>");
    expect(d.table).toContain("先週からの変化");
    expect(d.table).not.toContain("① 本牧");
  });

  it("釣果表の行を読む", () => {
    const html =
      '<h2>今週の釣果速報（一覧）</h2><div><table><thead><tr><th>スポット</th><th>魚種</th><th>サイズ</th><th>釣り方</th><th>好調度</th></tr></thead><tbody>' +
      '<tr><td style="x"><a href="/spots/minabe-sakai-gyokou">みなべ・堺漁港</a></td><td>タチウオ・カマス</td><td>70cm</td><td>ウキ釣り</td><td>🔥🔥🔥</td></tr>' +
      '<tr><td>白浜町の磯</td><td>アオリイカ</td><td>1kg</td><td>エギング</td><td>—</td></tr></tbody></table></div>';
    expect(parseWeeklyCatchRows(html)).toEqual([
      { spot: "みなべ・堺漁港", spotHref: "/spots/minabe-sakai-gyokou", fish: "タチウオ・カマス", size: "70cm", method: "ウキ釣り", heat: 3 },
      { spot: "白浜町の磯", spotHref: null, fish: "アオリイカ", size: "1kg", method: "エギング", heat: 0 },
    ]);
  });

  it("microCMS保存後の実際のマークアップ（th行・<p>入りセル・h2にid）でも読める", () => {
    const html =
      '<h2 id="h08b3c2c740">今週の釣果速報（一覧）</h2><table><tbody><tr><th colspan="1" rowspan="1"><p>スポット</p></th><th colspan="1" rowspan="1"><p>魚種</p></th><th colspan="1" rowspan="1"><p>サイズ</p></th><th colspan="1" rowspan="1"><p>釣り方</p></th><th colspan="1" rowspan="1"><p>好調度</p></th></tr>' +
      '<tr><td colspan="1" rowspan="1"><p><a href="/spots/minabe-sakai-gyokou"><strong>みなべ・堺漁港</strong></a></p></td><td colspan="1" rowspan="1"><p>タチウオ・カマス・アジ</p></td><td colspan="1" rowspan="1"><p>タチウオ指2〜3本／70cm、カマス25cm、アジ20cm</p></td><td colspan="1" rowspan="1"><p>ウキ釣り・カゴ釣り・テンヤ・ジグサビキ</p></td><td colspan="1" rowspan="1"><p>🔥🔥🔥</p></td></tr></tbody></table><p>※好調度は…</p><h2 id="x">① みなべ・堺漁港</h2>';
    const rows = parseWeeklyCatchRows(html);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ spot: "みなべ・堺漁港", spotHref: "/spots/minabe-sakai-gyokou", fish: "タチウオ・カマス・アジ", heat: 3 });
    expect(extractWeeklyDigest(html).table).not.toContain("①");
  });

  it("魚種セルが魚（別名含む）を含むか判定する", () => {
    const buri = { name: "ブリ", aliases: ["ハマチ", "メジロ"] };
    expect(catchRowHasFish("ハマチ・メジロ・シオほか", buri)).toBe(true);
    expect(catchRowHasFish("タチウオ（指3本）", { name: "タチウオ" })).toBe(true);
    expect(catchRowHasFish("アオリイカ", buri)).toBe(false);
  });

  it("表が無い記事では空文字を返す", () => {
    expect(extractWeeklyDigest("<h2>まとめ</h2><p>x</p>")).toEqual({ intro: "", picks: "", table: "" });
  });
});
