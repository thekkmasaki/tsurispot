import Link from "next/link";
import { ClipboardList } from "lucide-react";
import type { FishingSpot } from "@/types";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import { getPrefectureByName } from "@/lib/data/prefectures";
import { getFishingRuleByPrefName } from "@/lib/data/fishing-rules-data";
import { getCatchTier } from "@/lib/data/fish-aptitude";
import { getTideStationForSpot } from "@/lib/tide/nearest-station";
import { getStationSlug } from "@/lib/tide/station-slugs";
import { getParkingBadgeText } from "@/components/spots/parking-guide-card";
import { getSpotDepthTerrain, MSIL_DISCLAIMER } from "@/lib/spot-depth-terrain";
import {
  formatMonthRanges,
  getSpotRestrictionSummary,
  isMonthInRange,
  sourceHostOf,
} from "@/lib/spot-restrictions";

const TIER_ORDER = { excellent: 0, good: 1, fair: 2, excluded: 3 } as const;

interface Row {
  label: string;
  value: React.ReactNode;
}

/**
 * スポット詳細の「基本データ」表（サーバーコンポーネント・SSR本文）。
 *
 * AI検索（AI Overviews / ChatGPT / Perplexity）や検索スニペットが「種別・駐車場・トイレ・
 * 夜釣り・ルール・対象魚・シーズン」を機械的に拾えるよう、1つの <table> にまとめる。
 * データに存在する項目だけで行を作り、値が無い行は出さない（推測値で埋めない）。
 * 地形（水深）は海のスポットのみ、海しる等深線から作った目安を出す（足もとの水深ではない）。
 */
export function SpotBasicDataTable({ spot }: { spot: FishingSpot }) {
  const rows: Row[] = [];
  const pref = getPrefectureByName(spot.region.prefecture);

  rows.push({ label: "種別", value: SPOT_TYPE_LABELS[spot.spotType] });

  // 足場: 構造化された実データ（柵・ベビーカー可）がある時だけ
  const footing: string[] = [];
  if (spot.familyInfo?.hasRailing) footing.push("柵あり");
  if (spot.familyInfo?.strollerAccessible) footing.push("ベビーカーで移動可");
  if (footing.length > 0) rows.push({ label: "足場", value: footing.join("・") });

  // 地形（水深）: 海しる等深線から作った目安。足もとの水深ではないので地形タイプを主役にする
  const terrain = getSpotDepthTerrain(spot.slug);
  if (terrain) {
    rows.push({
      label: "地形（水深）",
      value: (
        <>
          <span className="font-medium">{terrain.label}</span>
          {terrain.hint && <span className="text-muted-foreground">（{terrain.hint}）</span>}
          <span className="block text-xs text-muted-foreground">
            {terrain.detail}・海しる等深線による目安で、足もとの水深ではありません
          </span>
        </>
      ),
    });
  }

  rows.push({ label: "難易度", value: DIFFICULTY_LABELS[spot.difficulty] });

  if (spot.isFree) rows.push({ label: "料金", value: "無料" });
  else if (spot.feeDetail) rows.push({ label: "料金", value: spot.feeDetail });

  if (spot.hasParking) {
    const text = getParkingBadgeText(spot.hasParking, spot.parkingDetail, spot.parkingGuide);
    rows.push({ label: "駐車場", value: text === "駐車場" ? "あり" : `あり${text.replace(/^駐車場/, "")}` });
  }
  if (spot.hasToilet) rows.push({ label: "トイレ", value: "あり" });

  if (spot.rules?.nightFishing === true) rows.push({ label: "夜釣り", value: "可" });
  else if (spot.rules?.nightFishing === false) rows.push({ label: "夜釣り", value: "不可" });

  // 釣り禁止・ルール
  const restriction = getSpotRestrictionSummary(spot);
  const prefRule = getFishingRuleByPrefName(spot.region.prefecture);
  if (restriction) {
    const firstSource = restriction.sourceUrls[0];
    rows.push({
      label: "釣り禁止・ルール",
      value: (
        <>
          <span className={restriction.level.startsWith("ban") ? "font-bold text-destructive" : "font-medium"}>
            {restriction.label}
          </span>
          {firstSource && (
            <span className="ml-1 text-xs text-muted-foreground">
              （出典:{" "}
              <a href={firstSource} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {sourceHostOf(firstSource)}
              </a>
              {restriction.confirmedAt && `・${restriction.confirmedAt}確認`}）
            </span>
          )}
        </>
      ),
    });
  } else if (pref && prefRule) {
    rows.push({
      label: "釣り禁止・ルール",
      value: (
        <span className="text-muted-foreground">
          スポット個別の禁止情報は未確認（
          <Link prefetch={false} href={`/fishing-rules/${pref.slug}`} className="text-primary underline-offset-2 hover:underline">
            {pref.name}の釣りルール
          </Link>
          を確認）
        </span>
      ),
    });
  }

  // 主な対象魚（釣れる度順・生息域外は除外）
  const seen = new Set<string>();
  const targets = spot.catchableFish
    .filter((cf) => {
      if (seen.has(cf.fish.slug)) return false;
      seen.add(cf.fish.slug);
      return true;
    })
    .map((cf) => ({ cf, tier: getCatchTier(spot, cf.fish.slug) }))
    .filter((t) => t.tier !== "excluded")
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || Number(b.cf.peakSeason) - Number(a.cf.peakSeason))
    .slice(0, 6);
  if (targets.length > 0) {
    rows.push({
      label: "主な対象魚",
      value: (
        <span className="inline-flex flex-wrap gap-x-1">
          {targets.map(({ cf }, i) => (
            <span key={cf.fish.slug}>
              <Link prefetch={false} href={`/fish/${cf.fish.slug}`} className="text-primary underline-offset-2 hover:underline">
                {cf.fish.name}
              </Link>
              {i < targets.length - 1 && "、"}
            </span>
          ))}
        </span>
      ),
    });
  }

  // ベストシーズン: 狙える魚種数が最も多い月（攻略法セクションと同じ算出）
  if (spot.catchableFish.length > 0) {
    const counts = Array.from({ length: 12 }, (_, i) =>
      spot.catchableFish.filter((cf) => isMonthInRange(i + 1, cf.monthStart, cf.monthEnd)).length,
    );
    const max = Math.max(...counts);
    if (max > 0) {
      const best = counts.map((c, i) => (c === max ? i + 1 : 0)).filter((m) => m > 0);
      rows.push({
        label: "ベストシーズン",
        value: `${formatMonthRanges(best)}（${max}種が狙える時期）`,
      });
    }
  }

  // 最寄りの潮見表
  const station = getTideStationForSpot(spot);
  const stationSlug = station ? getStationSlug(station.code) : null;
  if (station && stationSlug) {
    rows.push({
      label: "最寄りの潮見表",
      value: (
        <>
          <Link prefetch={false} href={`/tides/${stationSlug}`} className="text-primary underline-offset-2 hover:underline">
            {station.name}の潮見表
          </Link>
          <span className="ml-1 text-xs text-muted-foreground">（約{station.distanceKm}km・気象庁データ）</span>
        </>
      ),
    });
  }

  return (
    <section className="mb-6 mt-4" aria-labelledby="spot-basic-data-heading">
      <h2 id="spot-basic-data-heading" className="mb-2 flex items-center gap-2 text-lg font-bold">
        <ClipboardList className="size-5 text-primary" aria-hidden="true" />
        {spot.name}の基本データ
      </h2>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <caption className="sr-only">{spot.name}の種別・設備・ルール・対象魚・シーズンの一覧</caption>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.label} className="align-top">
                <th scope="row" className="w-32 bg-muted/40 px-3 py-2 text-left text-xs font-medium text-muted-foreground sm:w-36 sm:text-sm">
                  {row.label}
                </th>
                <td className="px-3 py-2">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        ※ 掲載データにある項目のみ表示しています。現地の掲示・管理者の案内を優先してください。
      </p>
      {terrain && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          ※ 地形（水深）の出典:{" "}
          <a href="https://www.msil.go.jp/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            海洋状況表示システム（海しる）
          </a>
          。{MSIL_DISCLAIMER}。航海には使用できません。
        </p>
      )}
    </section>
  );
}
