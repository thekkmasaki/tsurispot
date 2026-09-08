import type { FishRegionalAptitude } from "../types";

/**
 * イカ・タコ・甲殻類（fish-sea-ika-tako.ts の9種）の地域適性。
 * 値の意味・解決順は ../types.ts を参照。
 */
export const seaIkaTakoAptitude: Record<string, FishRegionalAptitude> = {
  aoriika: {
    default: 2,
    regionOverrides: { hokkaido: 0 },
    seaOverrides: {
      日本海: 3,
      東シナ海: 3,
      有明海: 0, // 泥干潟でアオリイカは実質不在（佐賀・福岡・熊本の湾奥共通）
      東京湾: 1, // 湾奥はほぼ実績なし（実データ上も東京5件・湾奥皆無）
      オホーツク海: 0,
    },
    prefectureOverrides: {
      // 漁獲量上位・エギングのメッカ（日本海〜東シナ海側）
      yamaguchi: { 日本海: 4, 瀬戸内海: 2 },
      shimane: 4,
      tottori: 3,
      nagasaki: 4,
      saga: { 日本海: 4 },
      fukuoka: { 日本海: 3, 瀬戸内海: 2 },
      fukui: 4,
      ishikawa: 3,
      kyoto: 4,
      hyogo: { 日本海: 4, 瀬戸内海: 2 },
      kagoshima: 4,
      // 太平洋側でも実績豊富な県
      wakayama: 3,
      kochi: 3,
      mie: 3,
      shizuoka: 3,
      tokushima: 3,
      ehime: 3,
      oita: 3,
      miyazaki: 3,
      okinawa: 3,
      kanagawa: 3, // 三浦半島・相模湾側（東京湾側は湾overrideで1）
      // 分布北限の境界域（黒潮・対馬暖流の先端）
      aomori: 1,
      iwate: 0,
      miyagi: 1,
      akita: 1,
      yamagata: 1,
      fukushima: 1,
      ibaraki: 1,
    },
    rationale:
      "海面漁業生産統計のいか類漁獲量は長崎・山口・島根・佐賀など対馬暖流域が上位で、エギング実績も山陰・北陸・九州日本海側が突出。太平洋側は和歌山・高知・三重・静岡など黒潮域に実績が集中する。分布北限は東北で、青森〜福島は境界域、北海道は実質分布しない。有明海の泥干潟と東京湾奥には実質不在。",
    sources: [
      "農林水産省 海面漁業生産統計調査（いか類・県別漁獲量）",
      "各県水産技術センター資料（アオリイカ資源・藻場）",
      "エギング釣果実績（釣具店・釣果情報サイト）",
    ],
  },
  yariika: {
    default: 2,
    seaOverrides: { 日本海: 3, 瀬戸内海: 1, 有明海: 0, 東京湾: 1, オホーツク海: 1 },
    prefectureOverrides: {
      hokkaido: 3,
      aomori: 3,
      ishikawa: 3,
      fukui: 3,
      hyogo: { 日本海: 3, 瀬戸内海: 1 },
      tottori: 3,
      shimane: 3,
      nagasaki: 3,
      kagoshima: 1,
      miyazaki: 1,
      okinawa: 0,
    },
    rationale:
      "冬〜早春の岸釣りターゲットで、主産地は北海道〜山陰の日本海側（対馬暖流域）。太平洋側は相模湾・駿河湾等に冬季の回遊があるが規模は小さい。暖海の南九州・沖縄には分布せず、瀬戸内の実績も薄い。",
    sources: [
      "農林水産省 海面漁業生産統計調査（いか類・県別漁獲量）",
      "冬季ヤリイカ釣果実績（釣具店・釣果情報サイト）",
    ],
  },
  madako: {
    default: 2,
    seaOverrides: { 瀬戸内海: 4, 東京湾: 3, オホーツク海: 0 },
    regionOverrides: { hokkaido: 1 },
    prefectureOverrides: {
      // 明石ダコに代表される瀬戸内が本場。ただし神戸市須磨〜垂水・赤穂は
      // 漁業権によりタコ釣り禁止（スポット側rulesで表示）
      aomori: 1,
      iwate: 1,
      akita: 1,
      miyagi: 1,
      yamagata: 1,
      okinawa: 1, // 沖縄はワモンダコが主で本種の実績は薄い
    },
    rationale:
      "マダコは瀬戸内海（明石・鳴門）が漁獲・釣り実績とも突出し、東京湾のタコエギ実績も厚い。寒海には少なく北海道・北東北は境界域（北のタコ釣りはミズダコが主体）。",
    sources: [
      "農林水産省 海面漁業生産統計調査（たこ類・県別漁獲量）",
      "タコエギ釣果実績（明石・東京湾）",
    ],
  },
  // surumeika / kouika / kensaki-ika / watarigani / nokogirigazami / iidako は P3 で投入
};
