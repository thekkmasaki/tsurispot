import type { FishRegionalAptitude } from "../types";

/**
 * タイ・スズキ・フラット系（fish-sea-tai-suzuki.ts の18種）の地域適性。
 * 値の意味・解決順は ../types.ts を参照。
 */
export const seaTaiSuzukiAptitude: Record<string, FishRegionalAptitude> = {
  suzuki: {
    default: 3,
    seaOverrides: { 東京湾: 4, 有明海: 4, オホーツク海: 0 },
    prefectureOverrides: {
      hokkaido: 1, // 道南に遡上記録がある程度の境界域
      okinawa: 0, // 分布外
      aomori: 2,
      akita: 2,
      iwate: 2,
    },
    rationale:
      "スズキ（シーバス）は本州〜九州の内湾・河口に広く分布。東京湾はシーバスゲームの世界的メッカで、有明海には大型化する個体群（有明スズキ）がいる。沖縄には分布せず、北海道は境界域。",
    sources: [
      "農林水産省 海面漁業生産統計調査（すずき類）",
      "シーバス釣果実績（東京湾・大阪湾ほか）",
    ],
  },
  madai: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    // 陸奥湾は春の乗っ込みマダイの好漁場（東北一律1の例外として湾単位で指定）
    seaOverrides: { 瀬戸内海: 3, 日本海: 3, 玄界灘: 4, 陸奥湾: 3, オホーツク海: 0 },
    prefectureOverrides: {
      ehime: 4, // 来島海峡・宇和海
      nagasaki: 4,
      hyogo: { 瀬戸内海: 4, 日本海: 3 }, // 明石鯛
      tokushima: 3, // 鳴門鯛
      mie: 3,
      wakayama: 3,
      kagoshima: 3,
      niigata: 3,
      akita: 2, // 東北では秋田・山形の日本海側に実績
      yamagata: 2,
    },
    rationale:
      "マダイの漁獲量・釣り実績は瀬戸内海（明石・鳴門・来島）、玄界灘、長崎など西日本が中心。岸からはカゴ釣り・ショアラバで狙うが敷居は高め。北海道には分布せず、東北太平洋側は薄い。",
    sources: [
      "農林水産省 海面漁業生産統計調査（まだい・県別漁獲量）",
      "カゴ釣り・ショアラバ実績",
    ],
  },
  hirame: {
    default: 2,
    seaOverrides: { オホーツク海: 1, 瀬戸内海: 2 },
    prefectureOverrides: {
      // 青森は漁獲量全国上位でヒラメは県魚。常磐〜東北太平洋岸のサーフが本場
      aomori: 4,
      iwate: 3,
      miyagi: 3,
      fukushima: 3,
      ibaraki: 3,
      hokkaido: 2,
      niigata: 3,
      akita: 3,
      yamagata: 3,
      chiba: 3,
      shizuoka: 3,
      miyazaki: 3,
      okinawa: 0, // 分布外（南限）
    },
    rationale:
      "ヒラメの漁獲量は青森（県魚）・北海道・福島・茨城など北日本〜常磐が上位で、サーフのルアー釣りの主要ターゲット。日本海側の新潟〜山形にも実績が厚い。沖縄には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（ひらめ・県別漁獲量）",
      "サーフヒラメ釣果実績（東北・常磐・遠州灘）",
    ],
  },
  // hirame以外のフラット（magochi）、磯物（ishidai/mejina等）、その他はP3で投入
};
