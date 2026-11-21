// 釣りのルール・規制（スポット個別ルール＋都道府県の漁業調整規則の要点）
import type { FishingSpot } from "@/types";
import { getSpotRestrictionSummary } from "@/lib/spot-restrictions";
import {
  COMMON_RULES,
  prefectureFishingRules,
  type PrefectureFishingRule,
} from "@/lib/data/fishing-rules-data";
import { getPrefectureRestrictedSpots } from "@/lib/data/prefecture-restricted-spots";
import { getSpotInlandFishery } from "@/lib/data/inland-fishery";
import { type ToolDef, ToolInputError, RULES_NOTICE, str, findSpot, siteUrl } from "./shared";

const FRESHWATER_TYPES = new Set<FishingSpot["spotType"]>(["river", "lake", "pond"]);

function findPrefRule(q: string): PrefectureFishingRule | undefined {
  const t = q.trim().toLowerCase();
  const n = t.replace(/[都道府県]$/, "");
  if (!n) return undefined;
  // 「京都」で東京都に当たらないよう前方一致（prefName は「東京都」「京都府」）
  return prefectureFishingRules.find((r) => r.prefSlug === t || r.prefName === q.trim() || r.prefName.startsWith(n));
}

function prefRuleSummary(rule: PrefectureFishingRule, scope: "sea" | "inland" | "both") {
  const sea = rule.seaRules;
  return {
    prefecture: rule.prefName,
    authority: rule.authority,
    officialReference: rule.referenceUrl,
    lastVerified: rule.lastVerified,
    inland:
      scope === "sea"
        ? undefined
        : {
            licenseRequiredRivers: rule.yugyokenRivers.slice(0, 8),
            closedSeasons: rule.closedSeasons.slice(0, 8),
            sizeLimits: rule.sizeLimits.slice(0, 8),
            notes: rule.specialNotes.slice(0, 5),
          },
    sea:
      scope === "inland" || !sea
        ? undefined
        : {
            fishingRights: sea.fishingRightsNotes.slice(0, 5),
            chum: sea.chumRegulation,
            closedSeasons: sea.closedSeasons.slice(0, 8),
            sizeLimits: sea.sizeLimits.slice(0, 10),
            methodRestrictions: sea.methodRestrictions.slice(0, 5),
            restrictedAreas: sea.restrictedAreas.slice(0, 8),
            notes: sea.otherNotes.slice(0, 5),
          },
    url: siteUrl(`/fishing-rules/${rule.prefSlug}`),
  };
}

const COMMON = [COMMON_RULES.fishingRights, COMMON_RULES.sizeLimit, COMMON_RULES.penalty];

/** 河川・湖の管轄漁協（一次情報で確認したものだけ）。管理釣り場・海は対象外 */
function inlandFisherySummary(spot: FishingSpot) {
  if ((spot.spotType !== "river" && spot.spotType !== "lake") || spot.isManagedPond || spot.fishingBan?.scope === "full") return undefined;
  const f = getSpotInlandFishery(spot.slug);
  if (!f) {
    return { status: "unconfirmed", note: "管轄の漁協はツリスポで未確認です。川・湖の多くは遊漁券が必要なので、現地の看板か県の漁業権の案内で確認してください" };
  }
  if (f.kind === "outside") {
    return { status: "outside_fishery_right", detail: f.link.reason.text, source: f.link.reason.source };
  }
  const c = f.coop;
  return {
    status: "confirmed",
    licenseRequired: true,
    coop: c.name,
    officialUrl: c.officialUrl,
    jurisdiction: c.jurisdiction.text,
    seasonYear: c.seasonYear,
    fees: c.fees.map((x) => ({ label: x.label, price: x.price, note: x.note })),
    openSeasons: c.seasons.map((x) => ({ fish: x.fish, period: x.period })),
    rules: c.rules.map((x) => x.text),
    note: f.link.note,
    verifiedAt: c.verifiedAt,
    caution: "料金・解禁日は毎年変わります。釣行前に漁協の最新情報を確認してください",
  };
}

export function checkFishingRules(args: Record<string, unknown>) {
  const slug = str(args.slug, 200);
  if (slug) {
    const spot = findSpot(slug);
    if (!spot) {
      throw new ToolInputError(`スポット "${slug}" が見つかりません。search_spots で検索してから指定してください`);
    }
    const restriction = getSpotRestrictionSummary(spot);
    const freshwater = FRESHWATER_TYPES.has(spot.spotType);
    const rule = findPrefRule(spot.region.prefecture);
    const r = spot.rules;
    return {
      spot: spot.name,
      prefecture: spot.region.prefecture,
      restriction: restriction
        ? {
            summary: restriction.label,
            detail: restriction.detail,
            sources: restriction.sourceUrls.slice(0, 3),
            confirmedAt: restriction.confirmedAt,
          }
        : { summary: "ツリスポに登録された禁止・制限情報はありません（規制が無いことの保証ではありません）" },
      spotRules: r
        ? {
            castingAllowed: r.castingAllowed,
            lureAllowed: r.lureAllowed,
            chumAllowed: r.chumAllowed,
            nightFishing: r.nightFishing,
            fishingLicenseRequired: r.fishingLicenseRequired,
            maxRods: r.maxRods,
            minKeepSize: r.minKeepSize,
            restrictedAreas: r.restrictedAreas?.slice(0, 5),
            other: r.otherRules?.slice(0, 5),
          }
        : undefined,
      inlandFishery: inlandFisherySummary(spot),
      prefectureRules: rule ? prefRuleSummary(rule, freshwater ? "inland" : "sea") : undefined,
      commonRules: freshwater ? [...COMMON, COMMON_RULES.yugyoken, COMMON_RULES.closedSeason] : COMMON,
      url: siteUrl(`/spots/${spot.slug}`),
      notice: RULES_NOTICE,
    };
  }

  const prefecture = str(args.prefecture, 20);
  if (!prefecture) throw new ToolInputError("slug（釣り場）か prefecture（都道府県）のどちらかを指定してください");
  const rule = findPrefRule(prefecture);
  if (!rule) {
    throw new ToolInputError(`「${prefecture}」の釣りルールが見つかりません。都道府県名（例: 神奈川県）で指定してください`);
  }
  const restricted = getPrefectureRestrictedSpots(rule.prefName);
  return {
    ...prefRuleSummary(rule, "both"),
    restrictedSpotsTotal: restricted.length,
    restrictedSpots: restricted.slice(0, 20).map((e) => ({
      name: e.spot.name,
      area: e.spot.region.areaName,
      restriction: e.restriction.label,
      detail: e.restriction.detail,
      url: siteUrl(`/spots/${e.spot.slug}`),
    })),
    commonRules: [...COMMON, COMMON_RULES.yugyoken, COMMON_RULES.closedSeason],
    notice: RULES_NOTICE,
  };
}

export const RULE_TOOLS: ToolDef[] = [
  {
    name: "check_fishing_rules",
    title: "釣りのルール・禁止情報",
    description:
      "釣り場（slug）または都道府県の釣りルールを返します: 釣り禁止・立入禁止区域、投げ釣り/ルアー/コマセ/夜釣りの可否、" +
      "遊漁券、禁漁期間、サイズ制限、漁業権（貝・タコ等の採取禁止）と、公式情報へのリンク。" +
      "「◯◯って釣りしていいの？」「◯◯県でタコを獲っていい？」に使ってください。" +
      "現地の掲示・管理者の指示が常に優先です。例: {\"slug\":\"daikoku-fishing-facility\"} または {\"prefecture\":\"神奈川県\"}",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "釣り場の slug（search_spots の結果）" },
        prefecture: { type: "string", description: "都道府県（例: 神奈川県）。slug 未指定時に使用" },
      },
    },
    run: checkFishingRules,
  },
];
