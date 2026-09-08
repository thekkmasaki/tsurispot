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
  surumeika: {
    default: 1,
    regionOverrides: { tohoku: 3 },
    seaOverrides: { 瀬戸内海: 1, 有明海: 0 },
    prefectureOverrides: {
      hokkaido: { 日本海: 4, 太平洋: 4, オホーツク海: 2 }, // 函館は「イカのまち」
      aomori: 4, // 八戸・津軽海峡
      ishikawa: 3, // 能登小木は日本有数のイカ釣り基地
      niigata: 3, // 佐渡
      toyama: 3,
      fukui: 2,
      kyoto: 2,
      hyogo: { 日本海: 2, 瀬戸内海: 1 },
      tottori: 2,
      shimane: 2,
      nagasaki: 2, // 対馬
      okinawa: 0, // 暖海の琉球列島は分布外
    },
    rationale:
      "スルメイカは冷水性で、「イカのまち」函館を筆頭に北海道・津軽海峡・三陸と日本海北部が漁獲・夜釣り実績とも本場。能登小木・佐渡など北陸も基地。南日本では薄く、有明海・沖縄には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（するめいか・県別漁獲量）",
      "夜焚き・堤防イカ釣り実績（函館・三陸・日本海北部）",
    ],
  },
  kouika: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: {
      東京湾: 4,
      伊勢湾: 4,
      瀬戸内海: 4,
      有明海: 3,
      オホーツク海: 0,
    },
    prefectureOverrides: {
      okinawa: 1, // コブシメ等別種が主で本種は少ない
    },
    rationale:
      "コウイカ（スミイカ）は内湾の砂泥底に着く春の乗っ込みエギングの定番で、江戸前のスミイカ釣り文化を持つ東京湾と伊勢湾・瀬戸内海が実績・文化とも本場。分布は本州以南で、東北は境界域、北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（こういか類）",
      "スミイカ・エギング釣果実績（東京湾・伊勢湾・瀬戸内）",
    ],
  },
  "kensaki-ika": {
    default: 1,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { 瀬戸内海: 1, 有明海: 0, オホーツク海: 0 },
    prefectureOverrides: {
      nagasaki: 4, // 壱岐・対馬・五島の夜焚き
      saga: { 日本海: 4, 東シナ海: 2 }, // 呼子のイカ
      fukuoka: { 日本海: 4, 瀬戸内海: 1 },
      yamaguchi: { 日本海: 4, 瀬戸内海: 1 },
      shimane: 4, // 白イカ
      tottori: 3,
      hyogo: { 日本海: 3, 瀬戸内海: 1 },
      kyoto: 3,
      fukui: 3,
      ishikawa: 3,
      niigata: 2,
      yamagata: 2,
      kanagawa: 2, // 相模湾のマルイカ（船）
      shizuoka: 2,
      oita: 2,
      kagoshima: 2,
      okinawa: 1,
    },
    rationale:
      "ケンサキイカ（白イカ・マルイカ）は対馬暖流域の夏の夜焚き・イカメタルが本場で、呼子・壱岐対馬・山陰が漁獲・食文化とも突出。北陸〜新潟まで実績が続き、太平洋側は相模湾のマルイカ船が知られる。東北は境界域で、北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（いか類・県別漁獲量）",
      "夜焚き・イカメタル釣果実績（九州北部・山陰・北陸）",
    ],
  },
  watarigani: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: {
      瀬戸内海: 4,
      伊勢湾: 4,
      有明海: 4,
      東京湾: 3,
      オホーツク海: 0,
    },
    prefectureOverrides: {
      aichi: 3, // 三河湾
      okinawa: 1, // タイワンガザミ等別種が主
    },
    rationale:
      "ワタリガニ（ガザミ）は内湾の砂泥底に生息し、瀬戸内海・伊勢湾・三河湾・有明海が漁獲・カニ網釣りとも本場。東京湾でも夜の堤防で実績がある。寒海には少なく北海道は境界域。",
    sources: [
      "農林水産省 海面漁業生産統計調査（がざみ類・県別漁獲量）",
      "カニ網・夜釣り実績（瀬戸内・伊勢湾・東京湾）",
    ],
  },
  nokogirigazami: {
    default: 0,
    prefectureOverrides: {
      okinawa: 4, // マングローブ域のガニ（アミナー）
      kagoshima: 3,
      kochi: 3, // 浦戸湾等の「エガニ」
      miyazaki: 2,
      ehime: 2,
      tokushima: 2,
      wakayama: 2,
      mie: 2,
      shizuoka: 2, // 浜名湖の「ドウマン」
      aichi: 2, // 三河湾の「ドウマン」
      kumamoto: 2,
      nagasaki: 2,
      oita: 1,
      kanagawa: 1,
      chiba: 1,
    },
    rationale:
      "ノコギリガザミ類は暖地の河口・内湾干潟に生息する大型ガニで、マングローブ域の沖縄と、ドウマンと呼ぶ浜名湖・三河湾、エガニと呼ぶ高知の内湾が知られる。九州・四国・紀伊半島の暖流域にも点在するが、関東以北では散発的な記録にとどまる。",
    sources: [
      "各県水産資料（トゲノコギリガザミ・ドウマン・エガニ）",
      "カニ網・打ち込み釣り実績（沖縄・浜名湖・高知）",
    ],
  },
  iidako: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: {
      瀬戸内海: 4,
      東京湾: 3,
      伊勢湾: 3,
      有明海: 3,
      オホーツク海: 0,
    },
    prefectureOverrides: {
      okinawa: 1,
    },
    rationale:
      "イイダコは内湾の砂泥底に多い小型ダコで、テンヤの伝統釣法が根付く瀬戸内海が文化・実績とも本場。東京湾・伊勢湾・有明海など各地の内湾でも秋〜冬の定番。寒海には少なく北海道は境界域で、沖縄はまれ。",
    sources: [
      "農林水産省 海面漁業生産統計調査（たこ類）",
      "イイダコテンヤ釣果実績（瀬戸内・東京湾）",
    ],
  },
};
