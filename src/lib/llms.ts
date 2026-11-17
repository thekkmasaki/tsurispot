/**
 * llms.txt / llms-full.txt / llms/{都道府県}.txt 共通の集計・整形ヘルパ（サーバー専用）。
 *
 * 方針（2026-11 見直し）:
 * - 件数はすべて実データから算出する（「18,000+」「約10,000」等のハードコードは置かない）。
 * - 根拠を示せない主張（「現地調査」「専門家ネットワーク」「週次更新」等）は書かない。
 * - 内部実装（JSON-LD の種類等）の説明は載せない。
 */
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { prefectures } from "@/lib/data/prefectures";
import { isFishListedAtSpot } from "@/lib/data/fish-aptitude";
import { getIndexablePrefMonthFishCombos, getEligiblePrefFishCombos } from "@/lib/data";
import { MONTHS, isMonthInRange } from "@/lib/data/fishing-methods";
import { extractMunicipality } from "@/lib/geo/municipality";
import { LATEST_CONTENT_DATE, filesLatestYmd } from "@/lib/content-dates";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS, type FishingSpot } from "@/types";
import { facilityLabel, feeShortText, openingHoursText, closedDaysText } from "@/lib/managed-pond";

export const SITE_URL = "https://tsurispot.com";
/** ドメイン登録・リポジトリ作成ともに 2026-02-20（GitHub / WHOIS で確認） */
export const SITE_LAUNCHED = "2026年2月";

/** データの最終更新日（git のデータファイル最終コミット日。配信日ではない） */
export const LLMS_LAST_UPDATED = filesLatestYmd(/^src\/lib\/data\//) ?? LATEST_CONTENT_DATE;

export function spotTypeLabel(t: string): string {
  return (SPOT_TYPE_LABELS as Record<string, string>)[t] ?? "その他";
}

export function prefFileUrl(prefSlug: string): string {
  return `${SITE_URL}/llms/${prefSlug}.txt`;
}

export function getSiteStats() {
  const coveredPrefectures = new Set(fishingSpots.map((s) => s.region.prefecture)).size;
  const spotsByType = new Map<string, number>();
  for (const s of fishingSpots) {
    const label = spotTypeLabel(s.spotType);
    spotsByType.set(label, (spotsByType.get(label) ?? 0) + 1);
  }

  // 都道府県×月ページ（sitemap と同じ基準: その月に釣れる魚種が3種以上）
  let prefMonthPages = 0;
  for (const pref of prefectures) {
    const prefSpots = fishingSpots.filter((s) => s.region.prefecture === pref.name);
    for (const month of MONTHS) {
      const fish = new Set<string>();
      for (const spot of prefSpots) {
        for (const cf of spot.catchableFish) {
          if (!isFishListedAtSpot(spot, cf.fish.slug)) continue;
          if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) fish.add(cf.fish.slug);
        }
      }
      if (fish.size >= 3) prefMonthPages++;
    }
  }

  return {
    totalSpots: fishingSpots.length,
    totalFish: fishSpecies.length,
    seaFish: fishSpecies.filter((f) => f.category === "sea").length,
    freshwaterFish: fishSpecies.filter((f) => f.category === "freshwater").length,
    brackishFish: fishSpecies.filter((f) => f.category === "brackish").length,
    coveredPrefectures,
    spotsByType: [...spotsByType.entries()].sort((a, b) => b[1] - a[1]),
    prefFishPages: getEligiblePrefFishCombos(3).length,
    prefMonthPages,
    prefMonthFishPages: getIndexablePrefMonthFishCombos().length,
    bannedSpots: fishingSpots.filter((s) => s.fishingBan).length,
  };
}

/** 都道府県ごとのスポット（北から順） */
export function getSpotsByPrefecture(): { slug: string; name: string; spots: FishingSpot[] }[] {
  return prefectures
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      spots: fishingSpots.filter((s) => s.region.prefecture === p.name),
    }))
    .filter((p) => p.spots.length > 0);
}

/** そのスポットで釣れる度ゲートを通る魚（定義順に上位 n 件） */
function listedFish(spot: FishingSpot) {
  return spot.catchableFish.filter((cf) => isFishListedAtSpot(spot, cf.fish.slug));
}

/** 月の集合を「3〜5月・9〜11月」形式に圧縮 */
function formatMonths(months: number[]): string {
  if (months.length === 0) return "";
  if (months.length === 12) return "通年";
  const set = new Set(months);
  // 年をまたぐ連続（12→1）を1つにまとめるため、連続の切れ目から開始する
  let start = 1;
  for (let m = 1; m <= 12; m++) {
    if (!set.has(m) && set.has((m % 12) + 1)) {
      start = (m % 12) + 1;
      break;
    }
  }
  const ranges: string[] = [];
  let runStart: number | null = null;
  let prev = 0;
  for (let i = 0; i < 12; i++) {
    const m = ((start - 1 + i) % 12) + 1;
    if (set.has(m)) {
      if (runStart === null) runStart = m;
      prev = m;
    } else if (runStart !== null) {
      ranges.push(runStart === prev ? `${runStart}月` : `${runStart}〜${prev}月`);
      runStart = null;
    }
  }
  if (runStart !== null) ranges.push(runStart === prev ? `${runStart}月` : `${runStart}〜${prev}月`);
  return ranges.join("・");
}

/** ベストシーズン: 旬（peakSeason）の魚が最も多く重なる月（最大値の8割以上の月） */
export function spotBestSeason(spot: FishingSpot): string {
  const fish = listedFish(spot);
  const peak = fish.filter((cf) => cf.peakSeason);
  const source = peak.length > 0 ? peak : fish;
  const counts = new Array(13).fill(0);
  for (const cf of source) {
    for (let m = 1; m <= 12; m++) if (isMonthInRange(m, cf.monthStart, cf.monthEnd)) counts[m]++;
  }
  const max = Math.max(...counts.slice(1));
  if (max === 0) return "";
  const months: number[] = [];
  for (let m = 1; m <= 12; m++) if (counts[m] >= max * 0.8) months.push(m);
  return formatMonths(months);
}

/** 禁止・制限事項の要約（データに記録があるもののみ） */
export function spotRestrictions(spot: FishingSpot): string {
  const items: string[] = [];
  if (spot.fishingBan) items.push(spot.fishingBan.scope === "full" ? "釣り禁止" : "一部区域・条件付きで釣り禁止");
  const r = spot.rules;
  if (r) {
    if (!r.castingAllowed) items.push("投げ釣り禁止");
    if (!r.lureAllowed) items.push("ルアー禁止");
    if (!r.chumAllowed) items.push("コマセ禁止");
    if (r.nightFishing === false) items.push("夜釣り禁止");
    if (r.fishingLicenseRequired) items.push("遊漁券が必要");
  }
  return items.length > 0 ? items.join("・") : "登録なし";
}

/** 1スポット1行の要約 */
export function spotLine(spot: FishingSpot): string {
  const muni = extractMunicipality(spot.address, spot.region.prefecture) ?? spot.region.areaName;
  const fish = listedFish(spot)
    .slice(0, 5)
    .map((cf) => cf.fish.name);
  if (spot.isManagedPond) {
    // 管理釣り場・釣り堀: 列数は共通の9列のまま、5列目に料金・営業時間・定休日、6列目に設備（「ある」ものだけ）を入れる。
    // 海向けの「ベストシーズン」や「トイレなし」の断定は出さない。
    const fee = feeShortText(spot);
    const hours = openingHoursText(spot);
    const closed = closedDaysText(spot);
    const info = [fee ? `料金 ${fee}` : null, hours ? `営業 ${hours}` : null, closed ? `定休日 ${closed}` : null].filter(Boolean);
    const equip = [spot.hasParking ? "駐車場あり" : null, spot.hasRentalRod ? "レンタルあり" : null].filter(Boolean);
    const mp = [
      spot.name,
      muni,
      facilityLabel(spot),
      `主な魚: ${fish.length > 0 ? fish.join("・") : "—"}`,
      info.length > 0 ? info.join("・") : "料金・営業時間: —",
      equip.length > 0 ? equip.join("・") : "設備: —",
      `難易度: ${DIFFICULTY_LABELS[spot.difficulty]}`,
      `禁止・制限: ${spotRestrictions(spot)}`,
      `${SITE_URL}/spots/${spot.slug}`,
    ];
    return `- ${mp.join(" | ")}`;
  }
  const season = spotBestSeason(spot);
  const facilities = `駐車場${spot.hasParking ? "あり" : "なし"}・トイレ${spot.hasToilet ? "あり" : "なし"}`;
  const parts = [
    `${spot.name}`,
    muni,
    spotTypeLabel(spot.spotType),
    `主な魚: ${fish.length > 0 ? fish.join("・") : "—"}`,
    `ベストシーズン: ${season || "—"}`,
    facilities,
    `難易度: ${DIFFICULTY_LABELS[spot.difficulty]}`,
    `禁止・制限: ${spotRestrictions(spot)}`,
    `${SITE_URL}/spots/${spot.slug}`,
  ];
  return `- ${parts.join(" | ")}`;
}

export const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=86400, s-maxage=86400",
};
