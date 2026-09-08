import type { FishRegionalAptitude } from "../types";

/**
 * 汽水魚（fish-brackish.ts の4種）の地域適性。
 * 値の意味・解決順は ../types.ts を参照。
 */
export const brackishAptitude: Record<string, FishRegionalAptitude> = {
  kurodai: {
    default: 3,
    seaOverrides: { 瀬戸内海: 4, オホーツク海: 0 },
    prefectureOverrides: {
      hokkaido: 0, // 分布北限外（近年の温暖化での北上はあるが実績は未定着）
      aomori: 1,
      iwate: 1,
      akita: 2,
      miyagi: 2,
      aichi: 4, // 三河湾・浜名湖周辺は筏・かかり釣り文化の本場
      shizuoka: 3,
      okinawa: 2, // ミナミクロダイ域
    },
    rationale:
      "クロダイ（チヌ）は本州〜九州の内湾・河口に広く分布し、瀬戸内海が漁獲・釣り文化とも本場。東海（三河湾・浜名湖）のかかり釣りも著名。北海道・北東北は分布の北限で実績が薄い。",
    sources: [
      "農林水産省 海面漁業生産統計調査（くろだい・へだい類）",
      "チヌ（フカセ・かかり釣り・チニング）釣果実績",
    ],
  },
  // haze / konoshiro / sakuramasu は P3 で投入
};
