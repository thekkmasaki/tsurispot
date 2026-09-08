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
  haze: {
    default: 3,
    regionOverrides: { hokkaido: 2 },
    seaOverrides: { 東京湾: 4, オホーツク海: 1 },
    prefectureOverrides: {
      okinawa: 1, // マハゼの分布南限外に近く別種ハゼが主
    },
    rationale:
      "マハゼは全国の内湾・河口・運河で釣れるファミリーフィッシングの代名詞で、江戸前のハゼ釣り文化を持つ東京湾（江戸川放水路・木更津）が文化的本場。北海道でも道南〜石狩を中心に実績がある。沖縄は別種主体でまれ。",
    sources: [
      "ハゼ釣り実績（江戸川放水路ほか全国の内湾河口）",
      "魚類図鑑的分布情報（マハゼ・分布域）",
    ],
  },
  konoshiro: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: {
      東京湾: 4,
      伊勢湾: 4,
      有明海: 4,
      大阪湾: 3,
      オホーツク海: 0,
    },
    prefectureOverrides: {
      okinawa: 1,
    },
    rationale:
      "コノシロは内湾の表層に群れる魚で、東京湾・伊勢湾・有明海が漁獲（すし種・郷土食）・サビキ実績とも本場。近年はコノシロパターンのシーバス釣りでも注目される。分布北限は温暖化で北上中だが北海道はまだ境界域。",
    sources: [
      "農林水産省 海面漁業生産統計調査（このしろ・県別漁獲量）",
      "サビキ釣果実績（東京湾・伊勢湾・有明海）",
    ],
  },
  sakuramasu: {
    default: 0,
    regionOverrides: { hokkaido: 4, tohoku: 3, chubu: 1 },
    prefectureOverrides: {
      aomori: 4,
      akita: 4,
      yamagata: 4, // 庄内サーフ
      miyagi: 2,
      fukushima: 1,
      niigata: 2,
      toyama: 2, // 富山湾・神通川水系
      fukui: 2, // 九頭竜川
      ibaraki: 1, // 那珂川水系の遡上
    },
    rationale:
      "サクラマスは春に沿岸へ接岸する冷水性のマスで、海サクラルアーは北海道（島牧・積丹等）と青森・秋田・山形のサーフが本場。日本海側は九頭竜川・神通川など母川のある北陸まで実績が続く。関東以西の太平洋側と西南日本には実質分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（さくらます・県別漁獲量）",
      "海サクラルアー釣果実績（北海道・東北サーフ）",
    ],
  },
};
