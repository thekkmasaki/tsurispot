import type { FishRegionalAptitude } from "../types";

/**
 * 根魚・ハタほか（fish-sea-root-hata.ts の30種）の地域適性。
 * 値の意味・解決順は ../types.ts を参照。
 */
export const seaRootHataAptitude: Record<string, FishRegionalAptitude> = {
  kasago: {
    default: 3,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { オホーツク海: 0 },
    prefectureOverrides: {
      aomori: 2,
      akita: 2,
      iwate: 2,
      okinawa: 2,
    },
    rationale:
      "カサゴは本州〜九州の岩礁・堤防の穴釣り定番で、ほぼ全ての沿岸県に実績がある。寒海には少なく、北海道は境界域（北ではソイ類が主役）。",
    sources: [
      "農林水産省 海面漁業生産統計調査（かさご類）",
      "穴釣り・ロックフィッシュ釣果実績",
    ],
  },
  // その他29種は P3 で投入
};
