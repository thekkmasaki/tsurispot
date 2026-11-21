// 釣り場の検索・詳細・近く検索
import type { FishingSpot } from "@/types";
import { fishingSpots, getNearbySpots } from "@/lib/data/spots";
import { prefectures } from "@/lib/data/prefectures";
import {
  type ToolDef,
  ToolInputError,
  SPOT_TYPE_LABELS,
  DIFFICULTY_LABELS,
  RULES_NOTICE,
  str,
  int,
  month,
  norm,
  currentMonthJST,
  isMonthInRange,
  resolveFishSlugs,
  requireSpot,
  requireJapanLatLng,
  banInfo,
  facilityList,
  spotSummary,
  truncate,
  round1,
  siteUrl,
} from "./shared";

// ---------------------------------------------------------------------------
// search_spots
// ---------------------------------------------------------------------------

/**
 * query が都道府県名そのもの（「京都」「京都府」「東京」など）なら、その県名を返す。
 * 地名の部分一致のままだと「京都」が「東京都」の住所・県名に当たってしまうため、県の絞り込みに振り替える。
 */
function prefectureFromQuery(query: string): string | undefined {
  const q = query.normalize("NFKC").trim();
  return prefectures.find((p) => q === p.name || q === p.nameShort)?.name;
}

export function searchSpots(args: Record<string, unknown>) {
  let query = str(args.query);
  let prefecture = str(args.prefecture, 10);
  const prefFromQuery = query ? prefectureFromQuery(query) : undefined;
  if (prefFromQuery && (!prefecture || prefFromQuery.startsWith(prefecture.replace(/[都道府県]$/, "")))) {
    prefecture = prefFromQuery;
    query = undefined;
  }
  const fish = str(args.fish, 30);
  const spotType = str(args.spotType, 20) as FishingSpot["spotType"] | undefined;
  const m = month(args.month);
  const beginnerOnly = args.beginnerFriendly === true;
  const limit = int(args.limit, 1, 20) ?? 10;

  if (!query && !prefecture && !fish) {
    throw new ToolInputError("query・prefecture・fish のいずれかを指定してください");
  }
  if (spotType && !(spotType in SPOT_TYPE_LABELS)) {
    throw new ToolInputError(`spotType は ${Object.keys(SPOT_TYPE_LABELS).join(" / ")} のいずれかです`);
  }

  const fishSlugs = fish ? resolveFishSlugs(fish) : null;
  if (fishSlugs && fishSlugs.size === 0) {
    return { total: 0, spots: [], note: `魚種「${fish}」はツリスポに登録がありません` };
  }
  const q = query ? norm(query) : null;
  const prefNorm = prefecture?.replace(/[都道府県]$/, "");

  const scored: { spot: FishingSpot; score: number }[] = [];
  for (const spot of fishingSpots) {
    if (spot.fishingBan?.scope === "full") continue; // 全面禁止は推薦しない
    if (prefNorm && !spot.region.prefecture.startsWith(prefNorm)) continue;
    if (spotType && spot.spotType !== spotType) continue;
    if (beginnerOnly && spot.difficulty !== "beginner" && spot.difficulty !== "all") continue;
    if (q) {
      const hay = norm(
        [spot.name, spot.region.areaName, spot.region.prefecture, spot.address ?? ""].join(" "),
      );
      if (!hay.includes(q)) continue;
    }

    let score = spot.rating || 0;
    if (fishSlugs) {
      const hits = spot.catchableFish.filter(
        (cf) => fishSlugs.has(cf.fish.slug) && (m === undefined || isMonthInRange(m, cf.monthStart, cf.monthEnd)),
      );
      if (hits.length === 0) continue;
      score += 3 + (hits.some((h) => h.peakSeason) ? 2 : 0) + (hits.some((h) => h.source) ? 1 : 0);
    }
    // 出典付きの魚種データがあるスポット（裏取り済み）を優先
    score += Math.min(2, spot.catchableFish.filter((cf) => cf.source).length * 0.5);
    scored.push({ spot, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const m2 = m ?? currentMonthJST();
  return {
    total: scored.length,
    month: m2,
    spots: scored.slice(0, limit).map(({ spot }) => spotSummary(spot, m2)),
  };
}

// ---------------------------------------------------------------------------
// get_spot_details
// ---------------------------------------------------------------------------

export function getSpotDetails(args: Record<string, unknown>) {
  const spot = requireSpot(args);
  return {
    slug: spot.slug,
    name: spot.name,
    prefecture: spot.region.prefecture,
    area: spot.region.areaName,
    address: spot.address,
    latitude: spot.latitude,
    longitude: spot.longitude,
    type: SPOT_TYPE_LABELS[spot.spotType],
    difficulty: DIFFICULTY_LABELS[spot.difficulty],
    description: truncate(spot.description, 500),
    access: truncate(spot.accessInfo, 300),
    fee: spot.isFree ? "無料" : spot.feeDetail ?? "有料",
    parking: spot.hasParking ? spot.parkingDetail ?? "あり" : "なし",
    facilities: facilityList(spot),
    catchableFish: spot.catchableFish.slice(0, 20).map((cf) => ({
      fish: cf.fish.name,
      season: `${cf.monthStart}月〜${cf.monthEnd}月`,
      peakSeason: cf.peakSeason,
      method: cf.method,
      bestTime: cf.recommendedTime,
      difficulty: cf.catchDifficulty,
    })),
    bestTimes: spot.bestTimes.slice(0, 10).map((b) => `${b.label}（${b.timeRange}）`),
    rules: spot.rules
      ? {
          castingAllowed: spot.rules.castingAllowed,
          lureAllowed: spot.rules.lureAllowed,
          chumAllowed: spot.rules.chumAllowed,
          nightFishing: spot.rules.nightFishing,
          other: spot.rules.otherRules,
        }
      : undefined,
    fishingBan: banInfo(spot),
    safetyNotes: spot.safetyNotes?.slice(0, 10),
    url: siteUrl(`/spots/${spot.slug}`),
    notice: RULES_NOTICE,
  };
}

// ---------------------------------------------------------------------------
// find_nearby_spots
// ---------------------------------------------------------------------------

/** 近い順の候補プール。魚・月で絞り込んでも limit 件残るよう多めに取る */
const NEARBY_POOL = 300;
/** これより遠いスポットは「近く」として返さない */
const NEARBY_MAX_KM = 100;

export function findNearbySpots(args: Record<string, unknown>) {
  const { lat, lng } = requireJapanLatLng(args);
  const limit = int(args.limit, 1, 20) ?? 10;
  const fish = str(args.fish, 30);
  const m = month(args.month);

  const fishSlugs = fish ? resolveFishSlugs(fish) : null;
  if (fishSlugs && fishSlugs.size === 0) {
    return { total: 0, spots: [], note: `魚種「${fish}」はツリスポに登録がありません` };
  }
  const m2 = m ?? currentMonthJST();

  const hits = getNearbySpots(lat, lng, NEARBY_POOL).filter((s) => {
    if (s.distanceKm > NEARBY_MAX_KM) return false;
    if (s.fishingBan?.scope === "full") return false; // 全面禁止は推薦しない
    if (!fishSlugs) return true;
    return s.catchableFish.some(
      (cf) => fishSlugs.has(cf.fish.slug) && (m === undefined || isMonthInRange(m, cf.monthStart, cf.monthEnd)),
    );
  });

  return {
    origin: { latitude: lat, longitude: lng },
    month: m2,
    total: hits.length,
    spots: hits.slice(0, limit).map((s) => ({ ...spotSummary(s, m2), distanceKm: round1(s.distanceKm) })),
    note:
      hits.length === 0
        ? `半径${NEARBY_MAX_KM}km以内に条件に合う釣り場が見つかりませんでした`
        : "距離は直線距離です。道路距離・所要時間とは異なります",
  };
}

// ---------------------------------------------------------------------------
// 定義
// ---------------------------------------------------------------------------

export const SPOT_TOOLS: ToolDef[] = [
  {
    name: "search_spots",
    title: "釣り場を探す",
    description:
      "日本全国の釣り場を、地名・都道府県・狙いたい魚・月・釣り場の種類で検索します。" +
      "釣りに行く場所を提案するときに使ってください。各スポットの slug は他のツールに渡せます。" +
      "例: {\"prefecture\":\"神奈川\",\"fish\":\"アジ\",\"month\":7,\"beginnerFriendly\":true}",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "地名やスポット名（例: 横浜、大黒、湘南）" },
        prefecture: { type: "string", description: "都道府県（例: 神奈川県、千葉）" },
        fish: { type: "string", description: "狙いたい魚（例: アジ、アオリイカ、シーバス）" },
        month: { type: "integer", minimum: 1, maximum: 12, description: "釣行予定の月。fish と併用するとその月に釣れるスポットに絞る" },
        spotType: {
          type: "string",
          enum: Object.keys(SPOT_TYPE_LABELS),
          description: "port=漁港, breakwater=堤防, pier=釣り公園, beach=浜, surf=サーフ, rocky=磯, river=河川, lake=湖, pond=池・管理釣り場",
        },
        beginnerFriendly: { type: "boolean", description: "true なら初心者・ファミリー向けのみ" },
        limit: { type: "integer", minimum: 1, maximum: 20, description: "最大件数（既定10）" },
      },
    },
    run: searchSpots,
  },
  {
    name: "get_spot_details",
    title: "釣り場の詳細",
    description:
      "釣り場1か所の詳細（アクセス・駐車場・トイレ・釣れる魚と時期・釣り方・ルール・釣り禁止情報）を返します。" +
      "例: {\"slug\":\"daikoku-fishing-facility\"}（slug は search_spots / find_nearby_spots の結果から）",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "search_spots が返した slug" } },
      required: ["slug"],
    },
    run: getSpotDetails,
  },
  {
    name: "find_nearby_spots",
    title: "近くの釣り場",
    description:
      "緯度経度から近い順に釣り場を返します（直線距離・半径100km以内・全面釣り禁止は除外）。" +
      "「今いる場所の近くで釣りができる所は？」「◯◯駅の近くでアジが釣れる所」などに使ってください。" +
      "例: {\"latitude\":35.4437,\"longitude\":139.638,\"fish\":\"アジ\",\"limit\":5}",
    inputSchema: {
      type: "object",
      properties: {
        latitude: { type: "number", description: "緯度（例: 35.4437）" },
        longitude: { type: "number", description: "経度（例: 139.638）" },
        limit: { type: "integer", minimum: 1, maximum: 20, description: "最大件数（既定10）" },
        fish: { type: "string", description: "狙いたい魚で絞り込む（例: アジ）" },
        month: { type: "integer", minimum: 1, maximum: 12, description: "fish と併用するとその月に釣れるスポットに絞る" },
      },
      required: ["latitude", "longitude"],
    },
    run: findNearbySpots,
  },
];
