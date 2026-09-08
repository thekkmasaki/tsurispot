import type { FishRegionalAptitude } from "../types";

/**
 * 海水・堤防定番（fish-sea-popular.ts の17種）の地域適性。
 * 値の意味・解決順は ../types.ts を参照。
 */
export const seaPopularAptitude: Record<string, FishRegionalAptitude> = {
  aji: {
    default: 3,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { オホーツク海: 0 },
    prefectureOverrides: {
      // 漁獲量上位（長崎が突出、次いで島根・宮崎など西日本）
      nagasaki: 4,
      shimane: 4,
      yamaguchi: 4,
      oita: 4,
      ehime: 4,
      miyazaki: 3,
      kagoshima: 3,
      aomori: 2,
      iwate: 2,
      akita: 2,
    },
    rationale:
      "アジは全国の堤防釣りの代名詞で、ほぼ全ての沿岸県で安定した実績がある。漁獲量は長崎が全国断トツで、島根・山口・大分・愛媛など西日本が上位。北海道は道南の一部に限られる境界域。",
    sources: [
      "農林水産省 海面漁業生産統計調査（あじ類・県別漁獲量）",
      "サビキ・アジング釣果実績（全国の釣具店釣果情報）",
    ],
  },
  kisu: {
    default: 3,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { オホーツク海: 0 },
    prefectureOverrides: {
      // 遠州灘・伊勢湾周辺と瀬戸内・丹後が投げ釣りの本場
      shizuoka: 4,
      aichi: 4,
      mie: 3,
      kyoto: 3,
      hiroshima: 3,
      okayama: 3,
      aomori: 2,
      iwate: 2,
      okinawa: 2, // ホシギス・モトギス域
    },
    rationale:
      "シロギスは本州〜九州の砂浜・砂底に広く分布し、投げ釣りの定番。遠州灘〜伊勢湾と瀬戸内が実績の中心。北海道は道南の一部のみの境界域。",
    sources: [
      "農林水産省 海面漁業生産統計調査（きす類）",
      "投げ釣り（キス）釣果実績",
    ],
  },
  mebaru: {
    default: 3,
    seaOverrides: { 瀬戸内海: 4, オホーツク海: 0 },
    prefectureOverrides: {
      hokkaido: 2, // 道南
      okinawa: 0, // 分布南限外
      kagoshima: 2,
      miyazaki: 2,
    },
    rationale:
      "メバルは北海道南部〜九州に分布し、藻場と常夜灯周りの夜釣り・メバリングの定番。瀬戸内海が魚影・文化とも本場。南西諸島には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（めばる類）",
      "メバリング釣果実績（瀬戸内ほか）",
    ],
  },
  // saba / iwashi / megochi / karei / kawahagi / sayori / kamasu / ishimochi /
  // umitanago / aigo / suzumedai / nenbutsudai / bora / hiiragi は P3 で投入
};
