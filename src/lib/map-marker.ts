/**
 * 地図マーカーの見た目に関する共有定義。
 * spotType ごとの色と混雑レベルの色を、マーカー(divIcon HTML)と凡例UIで共用する。
 */
import type { CrowdLevel } from "@/lib/crowd-prediction";
import type { MapSpot } from "@/types";

/** spotType ごとのマーカー色（凡例とマーカーで共用）。SPOT_TYPE_LABELS と同じキー。 */
export const SPOT_TYPE_COLORS: Record<MapSpot["spotType"], string> = {
  port: "#2563eb", // 漁港
  beach: "#f59e0b", // 砂浜
  rocky: "#57534e", // 磯
  river: "#16a34a", // 河川
  pier: "#7c3aed", // 桟橋
  breakwater: "#0e7490", // 堤防
  surf: "#db2777", // サーフ
  lake: "#0ea5e9", // 湖沼
  pond: "#65a30d", // 管理釣り場（ポンド）
};

/**
 * 混雑レベルごとの hex 色（HTMLマーカー/ポップアップ用）。
 * crowd-prediction の CROWD_LABELS（Tailwind クラス）の配色に対応する。
 */
export const CROWD_LEVEL_HEX: Record<CrowdLevel, string> = {
  empty: "#16a34a",
  low: "#10b981",
  moderate: "#eab308",
  busy: "#f97316",
  very_busy: "#ef4444",
};

/**
 * Leaflet divIcon 用のマーカーHTML。spotType 色の円 + 右上に混雑レベルの小ドット。
 * crowdLevel が null（管理釣り場など混雑予想を出さない場合）は混雑ドットを描かない。
 */
export function markerIconHtml(
  spotType: MapSpot["spotType"],
  crowdLevel: CrowdLevel | null,
): string {
  const color = SPOT_TYPE_COLORS[spotType] ?? "#2563eb";
  const crowdDot = crowdLevel
    ? `<span style="position:absolute;top:-3px;right:-3px;width:9px;height:9px;border-radius:50%;background:${CROWD_LEVEL_HEX[crowdLevel]};border:1.5px solid #fff;box-shadow:0 1px 2px rgba(0,0,0,0.3)"></span>`
    : "";
  return (
    `<div style="position:relative;width:18px;height:18px">` +
    `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></span>` +
    `${crowdDot}</div>`
  );
}
