/**
 * シャクリズム（ツリスポ公式のエギング用 iPhone/Apple Watch アプリ）をスポット詳細で案内するための判定。
 *
 * 1,200か所超のスポットに同じ宣伝文を貼ると定型文になるため、
 * そのスポットのアオリイカの時期・夜釣り可否を織り込んだ1〜2行にする（2026-11 戦略合意）。
 * サーバー専用（FishingSpot 全体を受け取る）。
 */
import type { FishingSpot } from "@/types";
import { isFishListedAtSpot } from "@/lib/data/fish-aptitude";
import { getForbiddenMethods, isNightFishingAdvisable } from "@/lib/utils/spot-rule-consistency";

export const SHAKURHYTHM_APP_STORE_URL = "https://apps.apple.com/jp/app/id6825799808";

/** エギングの対象魚（魚ページで案内を出す魚種） */
export const EGING_TARGET_FISH = new Set(["aoriika", "kouika", "yariika", "kensaki-ika"]);

export interface ShakurhythmSpotContext {
  spotName: string;
  prefecture: string;
  /** 例: "9〜11月" */
  seasonLabel: string;
  /** 今月がアオリイカの時期か */
  inSeason: boolean;
  /** 春（4〜6月）・秋（9〜11月）のハイシーズンか（目立たせる） */
  highSeason: boolean;
  night: "banned" | "ok" | "unknown";
}

function inRange(month: number, start: number, end: number): boolean {
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}

/** 日本時間の月（1-12） */
export function currentJstMonth(now = new Date()): number {
  return new Date(now.getTime() + 9 * 3600 * 1000).getUTCMonth() + 1;
}

export function getShakurhythmSpotContext(
  spot: FishingSpot,
  month = currentJstMonth()
): ShakurhythmSpotContext | null {
  if (!isFishListedAtSpot(spot, "aoriika")) return null;
  const forbidden = getForbiddenMethods(spot);
  if (forbidden.has("エギング")) return null;
  const entries = spot.catchableFish.filter((cf) => cf.fish.slug === "aoriika");
  if (entries.length === 0) return null;
  const main = entries.find((cf) => /エギ/.test(cf.method)) ?? entries[0];
  const seasonLabel =
    main.monthStart === main.monthEnd
      ? `${main.monthStart}月`
      : main.monthStart === 1 && main.monthEnd === 12
        ? "一年中"
        : `${main.monthStart}〜${main.monthEnd}月`;
  const inSeason = entries.some((cf) => inRange(month, cf.monthStart, cf.monthEnd));
  const highSeason = inSeason && (inRange(month, 4, 6) || inRange(month, 9, 11));
  const night =
    spot.rules?.nightFishing === false ? "banned" : isNightFishingAdvisable(spot) ? "ok" : "unknown";
  return {
    spotName: spot.name,
    prefecture: spot.region.prefecture,
    seasonLabel,
    inSeason,
    highSeason,
    night,
  };
}
