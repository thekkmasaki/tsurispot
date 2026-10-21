import { describe, it, expect } from "vitest";
import {
  WEEKLY_REPORT_AREAS,
  getWeeklyAreaForSpot,
  matchWeeklyAreaForPost,
  pickLatestWeeklyByArea,
  isWeeklyReportTitle,
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
