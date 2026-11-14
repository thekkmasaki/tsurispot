/**
 * LINE で位置情報を送ってもらったときの返信（純関数）。現在地から近い釣り場をカードで返す。
 *
 * スポット本体（TS 18MB）を webhook に import するとバンドルが重くなるので、
 * 座標は CDN 配信の /api/spots/coords（軽量・force-static）を route 側で取得して渡す。
 */
import { haversineKm } from "@/lib/geo/distance";
import { SPOT_TYPE_LABELS, type FishingSpot } from "@/types";
import type { LineFlexReply } from "@/lib/line/chouka-reply";
import { lineUrl } from "@/lib/line/line-url";

type FlexComponent = Record<string, unknown>;

/** /api/spots/coords の1件（キーは短縮形） */
export interface CoordSpot {
  s: string;
  n: string;
  la: number;
  lo: number;
  t: FishingSpot["spotType"];
  r?: number;
  p: string;
  a?: string;
  f?: boolean;
}

export interface NearbySpot {
  spot: CoordSpot;
  km: number;
}

export const NEARBY_COUNT = 5;

export function nearestSpots(spots: readonly CoordSpot[], lat: number, lng: number, n = NEARBY_COUNT): NearbySpot[] {
  return spots
    .filter((s) => Number.isFinite(s.la) && Number.isFinite(s.lo))
    .map((spot) => ({ spot, km: haversineKm(lat, lng, spot.la, spot.lo) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, n);
}

export const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)}m` : km < 10 ? `${km.toFixed(1)}km` : `${Math.round(km)}km`);

const spotUrl = (slug: string) => lineUrl(`/spots/${slug}`, "nearby");
const detailOf = (n: NearbySpot) =>
  [formatKm(n.km), SPOT_TYPE_LABELS[n.spot.t] ?? "", n.spot.a ?? n.spot.p, n.spot.f ? "無料" : ""].filter(Boolean).join("・");

const C = { brand: "#0369a1", sub: "#e0f2fe", text: "#111827", muted: "#6b7280", soft: "#f8fafc", accent: "#ea580c" };
const txt = (text: string, opt: FlexComponent = {}): FlexComponent => ({ type: "text", text: text || " ", wrap: true, ...opt });

/**
 * @param areaNote マイエリアを登録・変更したときの一言（無ければ出さない）
 */
export function buildNearbyFlex(list: NearbySpot[], areaNote?: string): LineFlexReply {
  const far = !list.length || list[0].km > 50;
  const rows = list.map((n, i): FlexComponent => ({
    type: "box", layout: "horizontal", spacing: "md", margin: i ? "sm" : "none", paddingAll: "10px", cornerRadius: "8px", backgroundColor: C.soft,
    action: { type: "uri", label: n.spot.n.slice(0, 20), uri: spotUrl(n.spot.s) },
    contents: [
      txt(String(i + 1), { flex: 0, size: "md", weight: "bold", color: C.accent, gravity: "center" }),
      { type: "box", layout: "vertical", flex: 1, contents: [txt(n.spot.n, { size: "sm", weight: "bold", color: C.text, maxLines: 2 }), txt(detailOf(n), { size: "xxs", color: C.muted })] },
      txt("›", { flex: 0, size: "xl", color: C.muted, gravity: "center" }),
    ],
  }));
  const body: FlexComponent[] = [];
  if (areaNote) body.push(txt(areaNote, { size: "xs", color: "#047857", weight: "bold", margin: "none" }));
  if (far) body.push(txt("近くに登録されている釣り場が見つかりませんでした。いちばん近い釣り場です。", { size: "xs", color: C.muted, margin: areaNote ? "sm" : "none" }));
  body.push({ type: "box", layout: "vertical", margin: body.length ? "md" : "none", contents: rows.length ? rows : [txt("釣り場の情報を読み込めませんでした。", { size: "sm", color: C.muted })] });
  return {
    altText: list.length ? `近くの釣り場：${list[0].spot.n}（${formatKm(list[0].km)}）ほか` : "近くの釣り場",
    contents: {
      type: "bubble", size: "mega",
      header: {
        type: "box", layout: "vertical", backgroundColor: C.brand, paddingAll: "16px", spacing: "4px",
        contents: [txt("近くの釣り場", { color: "#ffffff", weight: "bold", size: "lg" }), txt("送ってもらった位置から近い順（直線距離）", { color: C.sub, size: "xs" })],
      },
      body: { type: "box", layout: "vertical", paddingAll: "16px", contents: body },
      footer: {
        type: "box", layout: "vertical", spacing: "sm", paddingAll: "12px",
        contents: [
          { type: "button", style: "primary", color: C.brand, height: "sm", action: { type: "uri", label: "もっと探す（地図）", uri: lineUrl("/map", "nearby") } },
          { type: "button", style: "secondary", height: "sm", action: { type: "message", label: "今週の釣果を見る", text: "釣果" } },
        ],
      },
    },
    quickReply: ["釣果", "アジ", "道具"],
  };
}

export function buildNearbyText(list: NearbySpot[], areaNote?: string): string {
  return [
    "近くの釣り場（直線距離）",
    ...(areaNote ? [areaNote] : []),
    "",
    ...list.flatMap((n, i) => [`${i + 1}. ${n.spot.n}（${detailOf(n)}）`, `   ${spotUrl(n.spot.s)}`]),
    "",
    "▼ 地図でもっと探す",
    lineUrl("/map", "nearby"),
  ].join("\n");
}
