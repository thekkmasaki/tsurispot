import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---- 外部I/Oはすべてモック（DynamoDB / Redis / Upstash / Open-Meteo / microCMS） ----
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));
vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn(),
  dbBatchGet: vi.fn(async (keys: unknown[]) => keys.map(() => null)),
}));
vi.mock("@/lib/social-store", () => ({
  getOfficialRepliesBatch: vi.fn(async (ids: string[]) => ids.map(() => null)),
}));
vi.mock("@/lib/private-author-lookup", () => ({
  getUserVisibilityCached: vi.fn(async (id: string) =>
    id === "u-private" ? { nickname: "x", isPublic: false } : { nickname: "x", isPublic: true },
  ),
}));
vi.mock("@/lib/data/spot-weekly-catches", async (orig) => ({
  ...(await orig<typeof import("@/lib/data/spot-weekly-catches")>()),
  getWeeklyCatchesBySpot: vi.fn(async () => ({})),
}));

import { handleMessage } from "../protocol";
import {
  findNearbySpots,
  getFishingForecast,
  getRecentCatches,
  findTackleShops,
  recommendGear,
  getFishInfo,
  checkFishingRules,
  todayJST,
  TOOLS,
} from "../tools";
import { addDaysYmd } from "../tools/shared";
import { fishingSpots } from "@/lib/data/spots";
import { affiliateProducts } from "@/lib/data/affiliate-products";
import { dbGet } from "@/lib/dynamodb";
import { getOfficialRepliesBatch } from "@/lib/social-store";
import { getWeeklyCatchesBySpot } from "@/lib/data/spot-weekly-catches";
import { POST } from "@/app/api/mcp/route";

type Ok = { result: Record<string, unknown> };
const call = async (name: string, args: Record<string, unknown>) =>
  ((await handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } })) as Ok).result;

const UTM_URL = /^https:\/\/tsurispot\.com\/.+\?utm_source=ai_mcp/;
const YOKOHAMA = { latitude: 35.4437, longitude: 139.638 };

// 予報テスト用: 海の釣り公園（満干フル表示）と、失敗用に座標の違う別スポット
const seaSpot = fishingSpots.find((s) => s.slug === "daikoku-fishing-facility")!;
const otherSpot = fishingSpots.find(
  (s) => s.region.prefecture === "千葉県" && s.spotType === "port" && !s.fishingBan,
)!;

// ---- Open-Meteo のモック応答 ----
function forecastJson(start: string) {
  const days = Array.from({ length: 7 }, (_, i) => addDaysYmd(start, i));
  const hours = days.flatMap((d) => Array.from({ length: 24 }, (_, h) => `${d}T${String(h).padStart(2, "0")}:00`));
  return {
    daily: {
      time: days,
      weather_code: days.map(() => 1),
      temperature_2m_max: days.map(() => 18),
      sunrise: days.map((d) => `${d}T06:20`),
      sunset: days.map((d) => `${d}T16:30`),
      wind_speed_10m_max: days.map(() => 10.8), // km/h → 3m/s
    },
    hourly: {
      time: hours,
      temperature_2m: hours.map(() => 15),
      weather_code: hours.map(() => 1),
      wind_speed_10m: hours.map(() => 8),
      wind_direction_10m: hours.map(() => 0), // 北風
    },
  };
}
function marineJson(start: string) {
  const days = Array.from({ length: 7 }, (_, i) => addDaysYmd(start, i));
  return { daily: { time: days, sea_surface_temperature_max: days.map(() => 19.5) } };
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  const today = todayJST();
  fetchMock = vi.fn(async (url: string) => {
    if (String(url).includes(`latitude=${otherSpot.latitude.toFixed(2)}`)) throw new Error("network down");
    const body = String(url).includes("marine-api") ? marineJson(today) : forecastJson(today);
    return new Response(JSON.stringify(body), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("find_nearby_spots", () => {
  it("近い順・100km以内・全面禁止を除外・URLにutm", () => {
    const r = findNearbySpots({ ...YOKOHAMA, limit: 10 });
    expect(r.spots.length).toBe(10);
    const ds = r.spots.map((s) => s.distanceKm);
    expect([...ds].sort((a, b) => a - b)).toEqual(ds);
    for (const s of r.spots) {
      expect(s.distanceKm).toBeLessThanOrEqual(100);
      expect(s.url).toMatch(UTM_URL);
      expect(fishingSpots.find((x) => x.slug === s.slug)?.fishingBan?.scope).not.toBe("full");
    }
  });

  it("魚と月で絞り込める", () => {
    const r = findNearbySpots({ ...YOKOHAMA, fish: "アジ", month: 7, limit: 5 });
    expect(r.spots.length).toBeGreaterThan(0);
    for (const s of r.spots) {
      const spot = fishingSpots.find((x) => x.slug === s.slug)!;
      expect(spot.catchableFish.some((cf) => cf.fish.name.includes("アジ"))).toBe(true);
    }
  });

  it("limit は20件まで、日本の外の座標はエラー", async () => {
    expect(findNearbySpots({ ...YOKOHAMA, limit: 999 }).spots.length).toBeLessThanOrEqual(20);
    expect((await call("find_nearby_spots", { latitude: 51.5, longitude: -0.12 })).isError).toBe(true);
    expect((await call("find_nearby_spots", { latitude: "abc", longitude: 139 })).isError).toBe(true);
  });
});

describe("get_fishing_forecast", () => {
  it("天気・風・水温・潮・釣行指数・7日分の見通しを返す", async () => {
    const r = await getFishingForecast({ slug: seaSpot.slug, date: addDaysYmd(todayJST(), 1) });
    expect(r.weather.summary).toBe("晴れ");
    expect(r.weather.windMaxMs).toBe(3);
    expect(r.weather.windDirection).toBe("北の風");
    expect(r.weather.seaSurfaceTempC).toBe(19.5);
    expect(r.tide.tideType).toBeTruthy();
    expect(r.tide.highTides.length).toBeGreaterThan(0);
    expect(r.fishingIndex.score).toBeGreaterThanOrEqual(0);
    expect(r.fishingIndex.score).toBeLessThanOrEqual(100);
    // 内訳の合計 = 総合点（fishing-index の設計原則がそのまま出ている）
    const sum = r.fishingIndex.breakdown.reduce((a, b) => a + Number(b.points.split("/")[0]), 0);
    expect(sum).toBe(r.fishingIndex.score);
    expect(r.weekOutlook).toHaveLength(7);
    expect(r.url).toMatch(UTM_URL);
  });

  it("7日より先・過去の日付は入力エラー", async () => {
    expect((await call("get_fishing_forecast", { slug: seaSpot.slug, date: addDaysYmd(todayJST(), 7) })).isError).toBe(true);
    expect((await call("get_fishing_forecast", { slug: seaSpot.slug, date: addDaysYmd(todayJST(), -1) })).isError).toBe(true);
  });

  it("Open-Meteo 障害時はクラッシュせず、分かりやすい isError を返す", async () => {
    const r = await call("get_fishing_forecast", { slug: otherSpot.slug });
    expect(r.isError).toBe(true);
    const text = (r.content as { text: string }[])[0].text;
    expect(text).toMatch(/天気予報サービス/);
    expect(text).toMatch(/get_tide/);
  });
});

describe("get_recent_catches", () => {
  const slug = seaSpot.slug;
  const ugc = [
    { id: "r1", spotSlug: slug, spotName: "x", fishName: "アジ", userName: "公開さん", tsuriId: "u-public", comment: "c", date: "2026-11-10", approved: true, photoUrl: "https://img/1.jpg", sizeCm: 20, method: "サビキ" },
    { id: "r2", spotSlug: slug, spotName: "x", fishName: "シーバス", userName: "本名太郎", tsuriId: "u-private", comment: "c", date: "2026-11-12", approved: true, photoUrl: "https://img/2.jpg", sizeCm: 60 },
    { id: "r3", spotSlug: slug, spotName: "x", fishName: "カサゴ", userName: "ゲスト", comment: "c", date: "2026-11-11", approved: true },
    { id: "r4", spotSlug: slug, spotName: "x", fishName: "メバル", userName: "未承認", comment: "c", date: "2026-11-13", approved: false },
  ];

  it("非公開プロフィールの名前を伏せ、写真・ID・tsuriId・コメントは返さない", async () => {
    vi.mocked(dbGet).mockResolvedValueOnce(ugc);
    const r = await getRecentCatches({ slug, limit: 10 });
    expect(r.userCatches.map((c) => c.fish)).toEqual(["シーバス", "カサゴ", "アジ"]); // 新しい順・未承認除外
    expect(r.userCatches[0].nickname).toBe("非公開の釣り人");
    expect(r.userCatches[2].nickname).toBe("公開さん");
    const json = JSON.stringify(r);
    for (const leak of ["本名太郎", "u-private", "u-public", "img/", "r1", "photoUrl", "tsuriId", "comment"]) {
      expect(json).not.toContain(leak);
    }
    // サンプル釣果（cr-*）は混ざらない
    expect(json).not.toMatch(/"cr-/);
  });

  it("取得途中で例外が出ても、伏せる前の名前は漏れない（fail-closed）", async () => {
    vi.mocked(dbGet).mockResolvedValueOnce(ugc);
    vi.mocked(getOfficialRepliesBatch).mockRejectedValueOnce(new Error("redis down"));
    const r = await getRecentCatches({ slug, limit: 10 });
    expect(JSON.stringify(r)).not.toContain("本名太郎");
  });

  it("DynamoDB / 週報が落ちていても空で返す", async () => {
    vi.mocked(dbGet).mockRejectedValueOnce(new Error("ddb down"));
    vi.mocked(getWeeklyCatchesBySpot).mockRejectedValueOnce(new Error("cms down"));
    const r = await getRecentCatches({ slug });
    expect(r.userCatches).toEqual([]);
    expect(r.weeklyReports).toEqual([]);
    expect(r.note).toMatch(/まだありません/);
  });

  it("週報の行は記事URL（utm付き）と一緒に返す", async () => {
    vi.mocked(dbGet).mockResolvedValueOnce(null);
    vi.mocked(getWeeklyCatchesBySpot).mockResolvedValueOnce({
      [slug]: [{ publishedAt: "2026-11-14", fish: "タチウオ", size: "F3", method: "テンヤ", heat: 3, articleHref: "/blog/weekly-x", areaSlug: "a", areaLabel: "横浜", spotLabel: "大黒" }],
    });
    const r = await getRecentCatches({ slug });
    expect(r.weeklyReports[0]).toMatchObject({ fish: "タチウオ", area: "横浜" });
    expect(r.weeklyReports[0].articleUrl).toMatch(/\/blog\/weekly-x\?utm_source=ai_mcp/);
  });
});

describe("find_tackle_shops", () => {
  it("slug 指定: 近い店を営業時間・エサ情報・店舗ページURLつきで返す（サンプル店舗は除外）", () => {
    const r = findTackleShops({ slug: seaSpot.slug, limit: 5 });
    expect(r.shops.length).toBeGreaterThan(0);
    for (const s of r.shops) {
      expect(s.url).toMatch(/^https:\/\/tsurispot\.com\/shops\/[^?]+\?utm_source=ai_mcp/);
      expect(s.url).not.toContain("/shops/sample-");
      expect(typeof s.liveBait).toBe("boolean");
      expect(s.distanceKm).toBeLessThanOrEqual(60);
    }
  });

  it("緯度経度でも探せる。どちらも無ければ入力エラー", async () => {
    expect(findTackleShops({ ...YOKOHAMA, limit: 3 }).shops.length).toBeGreaterThan(0);
    expect((await call("find_tackle_shops", {})).isError).toBe(true);
    expect((await call("find_tackle_shops", { slug: "no-such-spot" })).isError).toBe(true);
  });
});

describe("recommend_gear", () => {
  const urlOf = (id: string) => affiliateProducts.find((p) => p.id === id)?.url;

  it("アジ×サビキ: タックル・今月の針サイズ・月別仕掛け・関連商品・ガイドURL", () => {
    const r = recommendGear({ fish: "アジ", method: "サビキ", month: 7 });
    expect(r.methods[0].method).toMatch(/サビキ/);
    expect(r.methods[0].hookSizeThisMonth?.size).toBeTruthy();
    expect(r.monthlyRig.length).toBeGreaterThan(0);
    expect(r.products.length).toBeGreaterThan(0);
    expect(r.products.map((p) => p.url)).not.toContain(urlOf("af-eging-rod")); // 無関係な商品は出さない
    expect(r.guides.some((g) => g.url.includes("/guide/sabiki?utm_source=ai_mcp"))).toBe(true);
    expect(r.disclosure).toMatch(/アフィリエイト/);
  });

  it("アオリイカ×エギング: サビキ用のコマセ等は出さない", () => {
    const r = recommendGear({ fish: "アオリイカ", method: "エギング", month: 10 });
    const urls = r.products.map((p) => p.url);
    expect(urls).not.toContain(urlOf("af-amihime"));
    // 釣法非依存の汎用品（キーワード無し）も「この魚・釣り方の道具」としては出さない
    const generic = affiliateProducts.filter((p) => p.methodKeywords.length === 0 && !p.fishKeywords?.length).map((p) => p.url);
    for (const u of urls) expect(generic).not.toContain(u);
  });

  it("未登録の魚は入力エラー、未登録の釣り方は注記つきで主な釣り方を返す", async () => {
    expect((await call("recommend_gear", { fish: "存在しない魚ほげ" })).isError).toBe(true);
    const r = recommendGear({ fish: "アジ", method: "フライフィッシング" });
    expect(r.methodNote).toMatch(/登録釣り方にありません/);
    expect(r.methods.length).toBeGreaterThan(0);
  });
});

describe("get_fish_info", () => {
  it("時期・難易度・危険情報・URL", () => {
    const r = getFishInfo({ fish: "ゴンズイ" });
    expect(r.name).toBe("ゴンズイ");
    expect(r.danger?.poisonous).toBe(true);
    expect(r.season).toBeTruthy();
    expect(r.url).toMatch(/\/fish\/gonzui\?utm_source=ai_mcp/);
  });

  it("かな・別名でも引ける。空はエラー", async () => {
    expect(getFishInfo({ fish: "あおりいか" }).name).toBe("アオリイカ");
    expect((await call("get_fish_info", {})).isError).toBe(true);
  });
});

describe("check_fishing_rules", () => {
  it("スポット: 禁止情報・スポット個別ルール・県ルール・現地優先の注意書き", () => {
    const r = checkFishingRules({ slug: seaSpot.slug });
    if (!("spot" in r)) throw new Error("spot mode expected");
    expect(r.spot).toBe(seaSpot.name);
    expect(r.prefectureRules?.prefecture).toBe("神奈川県");
    expect(r.prefectureRules?.url).toMatch(/\/fishing-rules\/kanagawa\?utm_source=ai_mcp/);
    expect(r.notice).toMatch(/現地の掲示/);
  });

  it("全面釣り禁止のスポットは「釣り禁止」と出典つきで返す", () => {
    const banned = fishingSpots.find((s) => s.fishingBan?.scope === "full");
    if (!banned) return;
    const r = checkFishingRules({ slug: banned.slug });
    if (!("spot" in r)) throw new Error("spot mode expected");
    expect(r.restriction?.summary).toBe("釣り禁止");
    expect(r.restriction?.sources?.length).toBeGreaterThan(0);
  });

  it("都道府県: 「京都」で東京都に当たらない。制限スポット一覧つき", async () => {
    const r = checkFishingRules({ prefecture: "京都" });
    expect(r.prefecture).toBe("京都府");
    const k = checkFishingRules({ prefecture: "神奈川県" });
    if (!("restrictedSpots" in k)) throw new Error("prefecture mode expected");
    expect(k.restrictedSpots.length).toBeGreaterThan(0);
    expect(k.notice).toMatch(/現地の掲示/);
    expect((await call("check_fishing_rules", { prefecture: "アトランティス" })).isError).toBe(true);
    expect((await call("check_fishing_rules", {})).isError).toBe(true);
  });
});

describe("認証なしで使える（回帰）", () => {
  const post = (body: unknown) =>
    POST(new Request("https://tsurispot.com/api/mcp", { method: "POST", body: JSON.stringify(body) }));

  const SAMPLE_ARGS: Record<string, Record<string, unknown>> = {
    search_spots: { prefecture: "神奈川", limit: 2 },
    get_spot_details: { slug: "daikoku-fishing-facility" },
    get_tide: { slug: "daikoku-fishing-facility" },
    get_catchable_fish: { prefecture: "千葉県" },
    find_nearby_spots: { ...YOKOHAMA, limit: 2 },
    get_fishing_forecast: { slug: "daikoku-fishing-facility" },
    get_recent_catches: { slug: "daikoku-fishing-facility" },
    find_tackle_shops: { slug: "daikoku-fishing-facility" },
    recommend_gear: { fish: "アジ" },
    get_fish_info: { fish: "アジ" },
    check_fishing_rules: { slug: "daikoku-fishing-facility" },
  };

  it("全ツールにサンプル引数がある", () => {
    expect(Object.keys(SAMPLE_ARGS).sort()).toEqual(TOOLS.map((t) => t.name).sort());
  });

  it("Authorization ヘッダーなしで tools/list が返る", async () => {
    const res = await post({ jsonrpc: "2.0", id: 1, method: "tools/list" });
    expect(res.status).toBe(200);
    expect((await res.json()).result.tools).toHaveLength(TOOLS.length);
  });

  it.each(Object.keys(SAMPLE_ARGS))("Authorization ヘッダーなしで %s が成功する", async (name) => {
    vi.mocked(dbGet).mockResolvedValueOnce(null);
    const res = await post({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name, arguments: SAMPLE_ARGS[name] } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.isError).toBe(false);
    expect(JSON.stringify(json.result.structuredContent)).toMatch(/https:\/\/tsurispot\.com\/[^"]*utm_source=ai_mcp/);
  });

  it("ツールの説明文はすべて日本語で使用例つき", () => {
    for (const t of TOOLS) {
      expect(t.description).toMatch(/例: \{/);
      expect(t.title).toMatch(/[ぁ-んァ-ン一-龥]/);
    }
  });
});
