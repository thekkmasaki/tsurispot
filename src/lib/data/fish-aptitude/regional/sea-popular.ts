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
  saba: {
    default: 3,
    regionOverrides: { hokkaido: 2 },
    seaOverrides: { オホーツク海: 1 },
    prefectureOverrides: {
      // まき網漁獲は茨城・静岡・長崎が上位。堤防サビキとしては全国区
      ibaraki: 4,
      shizuoka: 4,
      nagasaki: 4,
      mie: 3,
      chiba: 3,
    },
    rationale:
      "マサバ・ゴマサバは全国の堤防サビキの定番回遊魚。漁獲量は茨城・静岡・長崎など太平洋〜東シナ海側が上位。北海道は道南中心にやや薄く、オホーツク海側はまれ。",
    sources: [
      "農林水産省 海面漁業生産統計調査（さば類・県別漁獲量）",
      "サビキ・カゴ釣り釣果実績（全国の釣具店釣果情報）",
    ],
  },
  iwashi: {
    default: 3,
    seaOverrides: { オホーツク海: 1 },
    prefectureOverrides: {
      // マイワシ・カタクチとも茨城・千葉が漁獲量の中心
      ibaraki: 4,
      chiba: 4,
      nagasaki: 3,
    },
    rationale:
      "マイワシ・カタクチイワシは全国の内湾に回遊するサビキ入門の定番。漁獲量は茨城・千葉が突出し、近年は資源回復で北海道日本海側でもマイワシが豊漁。",
    sources: [
      "農林水産省 海面漁業生産統計調査（いわし類・県別漁獲量）",
      "サビキ釣果実績（全国の釣具店釣果情報）",
    ],
  },
  megochi: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { オホーツク海: 0, 東京湾: 3, 伊勢湾: 3 },
    rationale:
      "ネズミゴチ等のメゴチ類は本州〜九州の砂泥底に広く分布し、キス投げ釣りの外道の定番。東京湾・伊勢湾など内湾の砂泥地で特に濃い。北海道は境界域。",
    sources: [
      "日本産魚類検索（ネズッポ科の分布）",
      "投げ釣り（キス・メゴチ）釣果実績",
    ],
  },
  karei: {
    default: 2,
    regionOverrides: { hokkaido: 4, tohoku: 4, kyushu: 1 },
    seaOverrides: { 陸奥湾: 4 },
    prefectureOverrides: {
      niigata: 3,
      toyama: 3,
      ishikawa: 3,
      ibaraki: 3,
      fukuoka: { 日本海: 2, 瀬戸内海: 2 },
      saga: { 日本海: 2, 東シナ海: 2 },
      oita: 2, // 別府湾の城下カレイ
      okinawa: 0, // 分布南限外
    },
    rationale:
      "マコガレイ・イシガレイは北方系で、北海道・東北（陸奥湾・仙台湾）が投げ釣りの本場。漁獲量も北海道が突出。九州は玄界灘沿岸や大分の城下カレイなど局所的で、南西諸島には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（かれい類・県別漁獲量）",
      "投げ釣り（カレイ）釣果実績（陸奥湾・仙台湾ほか）",
    ],
  },
  kawahagi: {
    default: 3,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { オホーツク海: 0, 東京湾: 4, 相模湾: 4 },
    prefectureOverrides: {
      okinawa: 1, // 南西諸島は別種主体でまれ
    },
    rationale:
      "カワハギは本州〜九州の岩礁まじりの砂地に分布し、東京湾・相模湾（久比里・剣崎沖）は専門の釣り文化が根付く本場。北海道は道南の境界域、沖縄は別種主体でまれ。",
    sources: [
      "農林水産省 海面漁業生産統計調査（かわはぎ類）",
      "カワハギ釣果実績（東京湾・相模湾ほか）",
    ],
  },
  sayori: {
    default: 3,
    regionOverrides: { hokkaido: 2 },
    seaOverrides: { オホーツク海: 0 },
    rationale:
      "サヨリは北海道南部〜九州の内湾表層に広く回遊し、秋〜春の堤防釣りの定番。漁獲は石川・富山など日本海側と瀬戸内で厚く、北海道も道南を中心に実績がある。",
    sources: [
      "農林水産省 海面漁業生産統計調査（さより）",
      "サヨリ釣果実績（連玉ウキ仕掛け・全国）",
    ],
  },
  kamasu: {
    default: 3,
    regionOverrides: { hokkaido: 1, tohoku: 2 },
    seaOverrides: { オホーツク海: 0 },
    rationale:
      "アカカマス・ヤマトカマスは本州中部以南の沿岸に多い暖海系で、秋の堤防ルアー・サビキの定番。相模湾〜駿河湾や山陰で実績が厚い。温暖化で東北へ北上中だが北海道はまれ。",
    sources: [
      "農林水産省 海面漁業生産統計調査（かます類）",
      "カマス釣果実績（相模湾・駿河湾・山陰ほか）",
    ],
  },
  ishimochi: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 東京湾: 4, 有明海: 4, 伊勢湾: 3 },
    prefectureOverrides: {
      chiba: 3, // 九十九里の投げイシモチ
      kanagawa: 3,
      aichi: 3,
      kumamoto: 3,
      okinawa: 1,
    },
    rationale:
      "シログチ（イシモチ）は内湾性の砂泥底の魚で、東京湾・九十九里・伊勢湾・有明海が投げ釣りの本場。漁獲量も千葉・愛知・福岡・熊本など内湾県が上位。仙台湾以北はまれで北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（ぐち類・県別漁獲量）",
      "投げ釣り（イシモチ）釣果実績（東京湾・九十九里ほか）",
    ],
  },
  umitanago: {
    default: 3,
    regionOverrides: { hokkaido: 2, kyushu: 2 },
    seaOverrides: { オホーツク海: 0 },
    prefectureOverrides: {
      okinawa: 0, // 分布南限外
      kagoshima: 1,
      miyazaki: 1,
    },
    rationale:
      "ウミタナゴは北海道南部〜九州の藻場・堤防に着く北方寄りの魚で、東北〜本州の冬〜春のウキ釣り定番。九州南部は分布の南限域で、南西諸島には分布しない。",
    sources: [
      "日本産魚類検索（ウミタナゴ科の分布）",
      "ウキ釣り（ウミタナゴ）釣果実績（東北・本州）",
    ],
  },
  aigo: {
    default: 3,
    regionOverrides: { hokkaido: 0, tohoku: 1, kanto: 2 },
    seaOverrides: { オホーツク海: 0 },
    prefectureOverrides: {
      niigata: 1,
      toyama: 2,
      ishikawa: 2,
      okinawa: 3, // スクガラス等アイゴ類の食文化が根付く
    },
    rationale:
      "アイゴは本州中部以南の暖流域に多い磯・堤防のウキ釣り対象で、紀伊半島〜四国・九州が本場。温暖化で北陸・関東へ拡大中だが東北は境界域で、北海道には分布しない。",
    sources: [
      "日本産魚類検索（アイゴの分布北限）",
      "磯・堤防ウキ釣り釣果実績（西日本）",
    ],
  },
  suzumedai: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0 },
    prefectureOverrides: {
      fukuoka: { 日本海: 3, 瀬戸内海: 2 }, // 博多の「あぶってかも」食文化
      okinawa: 3, // スズメダイ類が豊富
    },
    rationale:
      "スズメダイは本州中部以南の岩礁に群れる暖海系の小魚で、西日本の堤防では餌取りの常連。博多では食用文化もある。東北は境界域で、北海道には分布しない。",
    sources: [
      "日本産魚類検索（スズメダイの分布）",
      "堤防釣り釣果実績（西日本）",
    ],
  },
  nenbutsudai: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0 },
    rationale:
      "ネンブツダイは本州中部以南の岩礁域に群れる夜行性の小魚で、西日本〜南日本の夜釣り・胴突き仕掛けの常連。東北は境界域で、北海道には分布しない。",
    sources: [
      "日本産魚類検索（テンジクダイ科の分布）",
      "夜釣り・胴突き仕掛け釣果実績（本州中部以南）",
    ],
  },
  bora: {
    default: 3,
    regionOverrides: { hokkaido: 2 },
    seaOverrides: { オホーツク海: 1 },
    rationale:
      "ボラは全国の内湾・汽水域に広く分布する定番魚で、河口・運河・港湾のどこでも見られる。北海道は分布するものの本州以南より薄い。",
    sources: [
      "日本産魚類検索（ボラ科の分布）",
      "内湾・河口の釣果実績（全国）",
    ],
  },
  hiiragi: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 伊勢湾: 3, 有明海: 3 },
    rationale:
      "ヒイラギは本州中部以南の内湾砂泥底に多い小魚で、伊勢湾・瀬戸内・有明海など西日本の内湾で特に濃く、投げ釣り・サビキの外道の常連。東北は境界域で、北海道には分布しない。",
    sources: [
      "日本産魚類検索（ヒイラギ科の分布）",
      "内湾投げ釣り釣果実績（西日本）",
    ],
  },
};
