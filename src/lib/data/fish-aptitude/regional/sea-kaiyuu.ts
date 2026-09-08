import type { FishRegionalAptitude } from "../types";

/**
 * 回遊魚（fish-sea-kaiyuu.ts の11種）の地域適性。
 * 値の意味・解決順は ../types.ts を参照。
 */
export const seaKaiyuuAptitude: Record<string, FishRegionalAptitude> = {
  tachiuo: {
    default: 2,
    regionOverrides: { hokkaido: 0 },
    seaOverrides: { 大阪湾: 4, 東京湾: 3, オホーツク海: 0 },
    prefectureOverrides: {
      wakayama: 4, // 紀北〜中紀のタチウオは全国屈指
      oita: 4,
      hyogo: { 瀬戸内海: 4, 日本海: 1 },
      hiroshima: 3,
      kagawa: 3,
      tokushima: 3,
      ehime: 3,
      yamaguchi: { 瀬戸内海: 3, 日本海: 2 },
      nagasaki: 3,
      kumamoto: 3,
      aichi: 3,
      mie: 3,
      // 北限の境界域（回遊が薄い）
      miyagi: 1,
      iwate: 0,
      aomori: 1,
      akita: 1,
      yamagata: 1,
      fukushima: 1,
      niigata: 2, // 近年回遊が定着傾向
    },
    rationale:
      "タチウオは内湾に差す回遊魚で、大阪湾・東京湾・紀伊水道・豊後水道が岸釣りの本場。漁獲量も和歌山・大分・愛媛など西日本が上位。東北以北は回遊がほぼなく、北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（たちうお・県別漁獲量）",
      "タチウオ釣果実績（大阪湾・東京湾ほか）",
    ],
  },
  // inada / buri / kanpachi / soudagatuo / shimaaji / katsuo / sawara /
  // hiramasa / shiira / rounin-aji は P3 で投入
};
