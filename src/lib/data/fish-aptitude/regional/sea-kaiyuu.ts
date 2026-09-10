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
  inada: {
    default: 3,
    regionOverrides: { hokkaido: 2 },
    seaOverrides: { オホーツク海: 1 },
    prefectureOverrides: {
      toyama: 4, // 氷見・富山湾のフクラギは定置網漁獲・釣果とも特筆
      niigata: 3,
      ishikawa: 3,
      okinawa: 0, // ブリ属は琉球列島に分布しない
    },
    rationale:
      "イナダ（ブリ若魚）は秋の堤防・サーフのショアジギング・カゴ釣り定番で、ほぼ全国の沿岸に回遊する。富山湾（氷見のフクラギ）など日本海側は漁獲・釣果とも厚く、北海道でも温暖化で回遊が増加中。暖海の沖縄には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（ぶり類・県別漁獲量）",
      "ショアジギング・カゴ釣り釣果実績（全国の釣具店釣果情報）",
    ],
  },
  buri: {
    default: 2,
    seaOverrides: { 日本海: 3, オホーツク海: 1 },
    prefectureOverrides: {
      hokkaido: { 日本海: 3, 太平洋: 2, オホーツク海: 1 }, // 温暖化で近年漁獲量全国トップ級
      toyama: 4, // 氷見の寒ブリ
      ishikawa: 4, // 能登
      niigata: 3, // 佐渡
      kyoto: 3, // 伊根ブリ
      nagasaki: 3,
      shimane: 3,
      chiba: 3, // 外房のワラサ・ブリ
      okinawa: 0, // ブリは琉球列島に分布しない
    },
    rationale:
      "ブリは能登・氷見・佐渡など日本海側が漁獲・寒ブリ文化とも本場で、温暖化で回遊が北上し近年は北海道の漁獲が全国トップ級に急増。ショアからは磯・沖堤のキャスティングや泳がせで狙う。暖海の沖縄には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（ぶり類・県別漁獲量）",
      "ショアキャスティング・泳がせ釣り実績（能登・佐渡・外房）",
    ],
  },
  kanpachi: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 瀬戸内海: 1 },
    prefectureOverrides: {
      kagoshima: 4, // 錦江湾ほか養殖日本一の海域で天然の実績も厚い
      tokyo: 3, // 伊豆諸島
      shizuoka: 3,
      mie: 3,
      wakayama: 3,
      kochi: 3,
      miyazaki: 3,
      nagasaki: 3,
      okinawa: 3,
    },
    rationale:
      "カンパチは暖流の磯・堤防で若魚（ショゴ・ネリゴ）を中心に狙う回遊魚で、伊豆〜紀伊半島・四国・九州南部の黒潮域が本場。漁獲・養殖とも鹿児島が突出する。瀬戸内では薄く、東北は夏の境界域、北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（かんぱち類）",
      "ショアジギング釣果実績（伊豆・南紀・南九州）",
    ],
  },
  soudagatuo: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: {
      相模湾: 4,
      駿河湾: 4,
      東京湾: 1,
      オホーツク海: 0,
      瀬戸内海: 1,
      有明海: 1,
    },
    prefectureOverrides: {
      wakayama: 3,
      kochi: 3,
      mie: 3,
      tokushima: 3,
      chiba: 3,
    },
    rationale:
      "マルソウダ・ヒラソウダは夏〜秋に黒潮沿岸へ大挙して差す回遊魚で、カゴ釣り・弓角（サーフトローリング）文化が根付く相模湾・駿河湾が本場。南紀・四国太平洋岸も実績が厚い。内湾・瀬戸内には差しにくく、東北は境界域、北海道には回遊しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（そうだがつお類）",
      "カゴ釣り・弓角釣果実績（相模湾・駿河湾）",
    ],
  },
  shimaaji: {
    default: 1,
    regionOverrides: {
      hokkaido: 0,
      tohoku: 1,
      kanto: 2,
      chubu: 2,
      kinki: 2,
      shikoku: 2,
      kyushu: 2,
    },
    seaOverrides: { 日本海: 1, 瀬戸内海: 1, 有明海: 0, オホーツク海: 0 },
    prefectureOverrides: {
      tokyo: 4, // 伊豆諸島は大型「オオカミ」の聖地
      shizuoka: 3,
      chiba: 2,
      mie: 3,
      wakayama: 3,
      kochi: 3,
      nagasaki: 3, // 五島
      miyazaki: 3,
      kagoshima: 3,
      okinawa: 2,
    },
    rationale:
      "シマアジは磯・沖磯のカゴ釣り最高峰のターゲットで、大型を「オオカミ」と呼ぶ伊豆諸島が聖地。伊豆〜南紀・四国・九州南部の黒潮域に実績が集中する。日本海側・瀬戸内はまれで、東北は境界域、北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（しまあじ）",
      "カゴ釣り・磯釣り実績（伊豆諸島・南日本）",
    ],
  },
  katsuo: {
    default: 1,
    regionOverrides: { hokkaido: 0 },
    seaOverrides: { 瀬戸内海: 0, 有明海: 0, オホーツク海: 0 },
    prefectureOverrides: {
      kochi: 4, // カツオ一本釣りの国
      shizuoka: 3, // 御前崎・伊豆
      mie: 3,
      wakayama: 3,
      tokyo: 3, // 伊豆諸島
      chiba: 2,
      miyagi: 2, // 気仙沼は生鮮カツオ水揚げ日本一（船釣り主体）
      kagoshima: 3, // 枕崎・山川
      miyazaki: 2,
      okinawa: 3, // パヤオ・カツオ漁文化
    },
    rationale:
      "カツオは黒潮の外洋を回遊し岸から釣れる機会はごく限られる船釣り主体のターゲット。高知・静岡・三重・和歌山など黒潮沿岸と、水揚げ日本一の気仙沼を擁する三陸沖が本場。閉じた内湾・瀬戸内には入らず、北海道沿岸には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（かつお・県別漁獲量）",
      "カツオ船釣り・カゴ釣り実績（高知・御前崎・伊豆諸島）",
    ],
  },
  sawara: {
    default: 2,
    seaOverrides: { 瀬戸内海: 4, 東シナ海: 3 },
    prefectureOverrides: {
      hokkaido: { 日本海: 2, 太平洋: 1, オホーツク海: 1 }, // 石狩湾で近年漁獲急増
      fukuoka: { 日本海: 4, 瀬戸内海: 3 },
      hyogo: { 瀬戸内海: 4, 日本海: 3 },
      kyoto: 4, // 丹後は近年サワラ漁獲全国上位
      fukui: 3,
      ishikawa: 3,
      toyama: 3,
      niigata: 3,
      tottori: 3,
      shimane: 3,
      okinawa: 1, // 本種はまれ（カマスサワラ等別種が主）
    },
    rationale:
      "サワラは瀬戸内海（岡山・香川の食文化）と東シナ海が本場の回遊魚で、温暖化に伴い回遊が日本海を北上し、丹後・北陸〜新潟ではショアのサゴシ・サワラゲームが定着。近年は石狩湾など北海道日本海側でも漁獲が急増している。",
    sources: [
      "農林水産省 海面漁業生産統計調査（さわら類・県別漁獲量）",
      "ショアキャスティング釣果実績（瀬戸内・玄界灘・北陸）",
    ],
  },
  hiramasa: {
    default: 2,
    regionOverrides: { hokkaido: 0 },
    seaOverrides: { オホーツク海: 0, 瀬戸内海: 1, 有明海: 0, 東京湾: 1 },
    prefectureOverrides: {
      chiba: 4, // 外房は関東ヒラマサキャスティングの聖地
      nagasaki: 4, // 五島・平戸・対馬
      fukuoka: { 日本海: 4, 瀬戸内海: 1 },
      saga: { 日本海: 4, 東シナ海: 2 },
      yamaguchi: { 日本海: 3, 瀬戸内海: 1 },
      shimane: 3,
      tottori: 3,
      akita: 3, // 男鹿半島
      yamagata: 3, // 飛島・庄内磯
      aomori: { 日本海: 2, 太平洋: 1 },
      iwate: 1,
      miyagi: 1,
      fukushima: 1,
      tokyo: 3, // 伊豆諸島
      shizuoka: 3,
      mie: 3,
      wakayama: 3,
      kochi: 3,
      miyazaki: 3,
      kagoshima: 3,
      okinawa: 2,
    },
    rationale:
      "ヒラマサは磯・沖磯キャスティングの最高峰ターゲットで、玄界灘〜五島・対馬と外房が二大聖地。男鹿・飛島など日本海側の磯も実績が厚い。内湾・瀬戸内には少なく、東北太平洋側は境界域で、北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（ひらまさ）",
      "ショアキャスティング・カゴ釣り実績（外房・玄界灘・男鹿）",
    ],
  },
  shiira: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 瀬戸内海: 1, 有明海: 0, 東京湾: 1 },
    prefectureOverrides: {
      kanagawa: 3, // 相模湾のキャスティング
      shizuoka: 3,
      wakayama: 3,
      kochi: 3,
      miyazaki: 3,
      kagoshima: 3,
      shimane: 3, // シイラ漬け漁の文化
      nagasaki: 3,
      okinawa: 3, // パヤオ・フーヌイユ（食文化）
    },
    rationale:
      "シイラは夏〜秋に暖流に乗って沿岸へ差す表層回遊魚で、相模湾・駿河湾のキャスティングと山陰のシイラ漬け漁が有名。黒潮の当たるサーフ・磯では夏の定番となる。閉じた内湾には差しにくく、東北は境界域、北海道には回遊しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（しいら類）",
      "ショアキャスティング釣果実績（相模湾・駿河湾・山陰）",
    ],
  },
  "rounin-aji": {
    default: 0,
    prefectureOverrides: {
      okinawa: 4, // GTキャスティング・打ち込み釣りの聖地
      kagoshima: 2, // 奄美群島・トカラ。本土南部は夏の幼魚（メッキ）
      miyazaki: 1, // 幼魚（メッキ）の記録が中心
    },
    rationale:
      "ロウニンアジ（GT）は琉球列島のサンゴ礁域を代表する大型魚で、沖縄がキャスティング・打ち込み釣りとも聖地。奄美群島など鹿児島の島嶼部が続き、南九州では夏に幼魚（メッキ）が汽水域へ差す程度。本州・四国には生息しない。",
    sources: [
      "沖縄のGTキャスティング・打ち込み釣り実績",
      "魚類図鑑的分布情報（ロウニンアジ・分布域）",
    ],
  },
};
