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
  ainame: {
    default: 2,
    regionOverrides: { hokkaido: 4, tohoku: 4, shikoku: 1, kyushu: 1 },
    prefectureOverrides: {
      ibaraki: 3, // 常磐は北方系根魚の南の主力フィールド
      miyazaki: 0,
      kagoshima: 0,
      okinawa: 0,
    },
    rationale:
      "アイナメは北方系の根魚で、北海道と三陸・仙台湾など東北が漁獲・釣り実績とも本場。常磐までは魚影が濃く、関東〜瀬戸内では普通に釣れるが西日本では減少傾向。暖流の強い四国・九州は境界域で、南九州・沖縄には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（あいなめ類）",
      "ロックフィッシュ釣果実績（北海道・三陸・常磐）",
    ],
  },
  kurosoi: {
    default: 1,
    regionOverrides: { hokkaido: 4, tohoku: 3 },
    prefectureOverrides: {
      miyagi: 4, // 仙台湾はソイ釣りのメッカ
      niigata: 3,
      ibaraki: 2,
      toyama: 2,
      ishikawa: 2,
      fukui: 2,
      tottori: 2,
      shimane: 2,
      miyazaki: 0,
      kagoshima: 0,
      okinawa: 0,
    },
    rationale:
      "クロソイは冷水性の根魚で「北の海のクロダイ」と呼ばれ、北海道と仙台湾（放流も盛ん）が二大フィールド。日本海側は新潟〜山陰まで実績が続くが、本州中部以南の太平洋岸ではまれになり、南九州・沖縄には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（そい類含むめばる・かさご類）",
      "各県水産技術センター資料（クロソイ種苗放流）",
      "ロックフィッシュ釣果実績（北海道・仙台湾）",
    ],
  },
  anago: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { 東京湾: 4, 播磨灘: 4, 瀬戸内海: 3, 伊勢湾: 3 },
    prefectureOverrides: { okinawa: 0 },
    rationale:
      "マアナゴは全国の内湾・砂泥底の夜釣り定番で、江戸前の東京湾と明石を擁する播磨灘が漁獲・食文化とも特筆。伊勢湾・大阪湾など大都市圏の内湾に実績が厚い。北海道は境界域で、琉球列島には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（あなご類・県別漁獲量）",
      "夜釣り・ぶっこみ釣り実績（東京湾・明石）",
    ],
  },
  utsubo: {
    default: 1,
    regionOverrides: {
      hokkaido: 0,
      tohoku: 0,
      kanto: 2,
      chubu: 2,
      kinki: 2,
      shikoku: 3,
      kyushu: 3,
    },
    seaOverrides: { 日本海: 1, 瀬戸内海: 1, 有明海: 1 },
    prefectureOverrides: {
      ibaraki: 1,
      chiba: 3,
      tokyo: 3, // 伊豆諸島
      shizuoka: 3,
      mie: 3,
      wakayama: 4,
      tokushima: 3,
      kochi: 4,
      miyazaki: 3,
      kagoshima: 3,
      okinawa: 3,
    },
    rationale:
      "ウツボは黒潮の当たる磯・ゴロタに多く、食文化のある南紀（和歌山）と高知が特筆。房総・伊豆〜紀伊半島・四国・九州南部・沖縄に実績が厚い。日本海側・瀬戸内ではまれで、東北以北には分布しない。",
    sources: [
      "ぶっこみ釣り・磯釣り実績（南紀・高知）",
      "魚類図鑑的分布情報（ウツボ科・分布北限）",
    ],
  },
  hata: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { 瀬戸内海: 4, 日本海: 3 },
    prefectureOverrides: {
      aomori: 1,
      akita: 1,
      yamagata: 1,
      niigata: 2,
      okinawa: 1,
    },
    rationale:
      "キジハタ（アコウ）は瀬戸内海が漁獲・放流・釣り実績とも突出し、山陰〜北陸の日本海側でも夏の高級ロックフィッシュとして定着。太平洋側でも普通に狙える。分布北限は東北の日本海側で、北海道には生息しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（はた類）",
      "各県水産技術センター資料（キジハタ種苗放流・瀬戸内）",
      "ロックフィッシュ釣果実績（瀬戸内・山陰・北陸）",
    ],
  },
  akahata: {
    default: 1,
    regionOverrides: {
      hokkaido: 0,
      tohoku: 0,
      kanto: 2,
      chubu: 2,
      kinki: 2,
      shikoku: 3,
      kyushu: 3,
    },
    seaOverrides: { 日本海: 1, 瀬戸内海: 1, 有明海: 1 },
    prefectureOverrides: {
      shizuoka: 4, // 伊豆半島はアカハタゲームの代表格
      tokyo: 3, // 伊豆諸島
      mie: 3,
      wakayama: 3,
      kochi: 3,
      nagasaki: 3,
      miyazaki: 3,
      kagoshima: 4,
      okinawa: 4,
      aomori: 0,
      akita: 0,
      yamagata: 0,
    },
    rationale:
      "アカハタは黒潮域の磯・ゴロタのロックフィッシュで、近年資源が急増した伊豆半島・伊豆諸島が岸釣りの代表格。南紀・四国・九州南部〜沖縄で実績が厚い。日本海側・瀬戸内はまれで、東北以北には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（はた類）",
      "ロックフィッシュ釣果実績（伊豆・南紀・南九州）",
    ],
  },
  eso: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    rationale:
      "エソ類は本州以南の砂浜・堤防に広く分布し、キス釣り・ショアジギングの外道として全国で釣れる。かまぼこ産地の西日本では漁獲も多い。寒海には少なく、東北は境界域、北海道には実質分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（えそ類）",
      "投げ釣り・ショアジギング釣果実績",
    ],
  },
  fugu: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { 東京湾: 3 },
    rationale:
      "クサフグ等のフグ類は全国の堤防で釣れる代表的な外道で、東京湾〜外房にはショウサイフグのカットウ釣り文化があり実績が厚い。下関など漁獲・食文化の中心は西日本。北海道は種類・数とも少ない境界域。",
    sources: [
      "農林水産省 海面漁業生産統計調査（ふぐ類）",
      "堤防釣り・カットウ釣り実績（東京湾）",
    ],
  },
  gonzui: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { 日本海: 1, 玄界灘: 2, 響灘: 2 },
    rationale:
      "ゴンズイは本州中部以南の太平洋岸・九州の堤防・磯に多い夜釣り定番の毒魚。日本海側では少なく、東北は境界域、北海道には分布しない。",
    sources: [
      "夜釣り実績（太平洋岸・九州）",
      "魚類図鑑的分布情報（ゴンズイ・分布域）",
    ],
  },
  haokoze: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    rationale:
      "ハオコゼは本州〜九州の堤防・藻場に広く生息する小型の毒魚で、探り釣り・サビキの外道として全国で釣れる。東北は境界域で、北海道には分布しない。",
    sources: ["堤防釣り実績（外道）", "魚類図鑑的分布情報（ハオコゼ・分布域）"],
  },
  oniokoze: {
    default: 1,
    regionOverrides: { hokkaido: 0, tohoku: 0, shikoku: 2, kyushu: 2 },
    seaOverrides: { 瀬戸内海: 3 },
    rationale:
      "オニオコゼは西日本の砂泥底に多い高級魚で、漁獲・種苗放流とも瀬戸内海が中心。岸からはぶっこみ釣り等でまれに釣れる程度で主対象ではない。関東以北で急に少なくなり、東北・北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（おこぜ類）",
      "各県水産技術センター資料（オニオコゼ種苗放流・瀬戸内）",
    ],
  },
  akaei: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { 東京湾: 3 },
    prefectureOverrides: { okinawa: 1 },
    rationale:
      "アカエイは全国の内湾・河口の砂泥底に広く分布し、ぶっこみ釣りの大物ターゲットとして定番。個体数の多い東京湾は特に実績が厚い。北海道は境界域で、琉球列島では別種のエイ類が主となりまれ。",
    sources: [
      "ぶっこみ釣り実績（東京湾ほか全国内湾）",
      "魚類図鑑的分布情報（アカエイ・分布域）",
    ],
  },
  dochizame: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    prefectureOverrides: { okinawa: 1 },
    rationale:
      "ドチザメは全国の内湾・堤防の夜釣りやぶっこみ釣りで釣れる沿岸性のサメで、地域差が小さい。北海道・琉球列島は記録の少ない境界域。",
    sources: ["夜釣り・ぶっこみ釣り実績", "魚類図鑑的分布情報（ドチザメ・分布域）"],
  },
  nekozame: {
    default: 1,
    regionOverrides: { hokkaido: 0 },
    prefectureOverrides: { okinawa: 0 },
    rationale:
      "ネコザメは本州〜九州の岩礁帯に生息するが個体数が少なく、磯・堤防のぶっこみ釣りでまれに釣れる程度の外道。北海道・沖縄には分布しない。",
    sources: ["磯・堤防釣り実績（外道）", "魚類図鑑的分布情報（ネコザメ・分布域）"],
  },
  hoshizame: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    prefectureOverrides: { okinawa: 1 },
    rationale:
      "ホシザメは本州〜九州の内湾砂泥底に広く分布し、投げ釣り・ぶっこみ釣りの外道として全国で釣れる。北海道は境界域で、琉球列島ではまれ。",
    sources: ["投げ釣り・ぶっこみ釣り実績", "魚類図鑑的分布情報（ホシザメ・分布域）"],
  },
  kinmedai: {
    default: 1,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { 瀬戸内海: 0, 日本海: 1, 有明海: 0 },
    prefectureOverrides: { chiba: 2, tokyo: 2, shizuoka: 2, kochi: 2 },
    rationale:
      "キンメダイは水深200m超に生息する深海魚で船釣り専門のため、岸釣り適性は全国的に低い。漁獲・遊漁船とも銚子・伊豆・伊豆諸島・室戸が代表格。浅い瀬戸内海・有明海には生息せず、北海道にも分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（きんめだい・県別漁獲量）",
      "中深場船釣り実績（伊豆・銚子・室戸）",
    ],
  },
  hatahata: {
    default: 0,
    seaOverrides: { 日本海: 2 },
    prefectureOverrides: {
      hokkaido: { 日本海: 3, オホーツク海: 2, 太平洋: 2 },
      akita: 4, // 県魚。冬の接岸「ハタハタパターン」のメッカ
      yamagata: 3,
      niigata: 3,
      tottori: 3,
      ishikawa: 2,
      fukui: 2,
      miyagi: 1,
      hyogo: { 日本海: 3, 瀬戸内海: 0 },
    },
    rationale:
      "ハタハタは日本海側の冬の風物詩で、県魚の秋田を筆頭に山形・新潟・北海道日本海側で冬の接岸期の堤防釣りが成立する。底びき漁獲は兵庫・鳥取も全国上位。太平洋側は仙台湾以北にわずかに分布するのみで、関東以南・瀬戸内には生息しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（はたはた・県別漁獲量）",
      "冬季ハタハタ釣り実績（秋田・新潟・北海道日本海側）",
    ],
  },
  hokke: {
    default: 0,
    prefectureOverrides: {
      hokkaido: 4,
      aomori: 2,
      iwate: 1,
      akita: 1,
      miyagi: 1,
      yamagata: 1,
    },
    rationale:
      "ホッケは冷水性で漁獲の大半を北海道が占め、道内では防波堤・磯の冬〜春の定番ターゲット。青森（津軽海峡・陸奥湾）までは岸釣り実績があるが、北東北の他県は境界域で、関東以南には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（ほっけ・県別漁獲量）",
      "北海道の防波堤・磯釣り実績",
    ],
  },
  akamutsu: {
    default: 1,
    seaOverrides: { 日本海: 2, 瀬戸内海: 0, 有明海: 0 },
    prefectureOverrides: { hokkaido: 1 },
    rationale:
      "アカムツ（ノドグロ）は水深100〜300mの中深海魚で船釣り専門のため岸釣り適性は低い。漁獲・遊漁とも新潟〜山陰の日本海側が本場。浅く閉じた瀬戸内海・有明海には生息しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（あかむつ類）",
      "中深場船釣り実績（新潟・山陰）",
    ],
  },
  madara: {
    default: 0,
    regionOverrides: { hokkaido: 3, tohoku: 2 },
    prefectureOverrides: {
      aomori: 3,
      ibaraki: 1,
      niigata: 2,
      toyama: 1,
      ishikawa: 1,
      fukui: 1,
    },
    rationale:
      "マダラは亜寒帯の深場に生息し、漁獲は北海道が過半を占める。船のタラジギングは北海道・青森・東北が本場で、岸から釣れるのはまれ。分布南限は太平洋側で常磐、日本海側で北陸〜山陰沖にとどまり、西日本沿岸には生息しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（まだら・県別漁獲量）",
      "タラジギング船釣り実績（北海道・青森）",
    ],
  },
  kue: {
    default: 1,
    regionOverrides: { hokkaido: 0, tohoku: 0, kinki: 2, shikoku: 3, kyushu: 3 },
    seaOverrides: { 瀬戸内海: 1, 有明海: 1 },
    prefectureOverrides: {
      shizuoka: 2,
      mie: 3,
      wakayama: 4, // クエ鍋文化の日高・白浜
      kochi: 3,
      ehime: 3,
      nagasaki: 4, // 五島・対馬
      oita: 3,
      miyazaki: 3,
      kagoshima: 3,
      shimane: 2,
      yamaguchi: { 日本海: 2, 瀬戸内海: 1 },
      fukuoka: { 日本海: 2, 瀬戸内海: 1 },
      saga: { 日本海: 2, 東シナ海: 1 },
      okinawa: 2,
    },
    rationale:
      "クエは磯の底物釣り最高峰のターゲットで、クエ鍋文化のある紀伊半島（日高・白浜）と五島・対馬を擁する長崎が特筆。四国・九州の外洋磯に実績が厚い。関東以北では急減し、東北・北海道には分布しない。沖縄はヤイトハタ等が主でクエ自体は少ない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（はた類）",
      "底物・泳がせ釣り実績（南紀・五島・九州）",
    ],
  },
  mutsu: {
    default: 1,
    regionOverrides: {
      hokkaido: 0,
      kanto: 2,
      chubu: 2,
      kinki: 2,
      shikoku: 2,
      kyushu: 2,
    },
    seaOverrides: { 日本海: 1, 瀬戸内海: 1, 有明海: 0 },
    prefectureOverrides: { tokyo: 3, shizuoka: 3, okinawa: 1 },
    rationale:
      "ムツは中深海魚だが幼魚（ムツっこ）が夏〜秋の夜に浅場へ差すため、伊豆・伊豆諸島など太平洋岸の磯・堤防の夜釣りに実績がある。本場は伊豆諸島・駿河湾の深場釣り。浅く閉じた有明海には生息せず、北海道にも分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（むつ類）",
      "夜釣り・深場船釣り実績（伊豆・伊豆諸島）",
    ],
  },
  akame: {
    default: 0,
    prefectureOverrides: {
      kochi: 4, // 浦戸湾・四万十川
      miyazaki: 3, // 大淀川等
      tokushima: 1,
      ehime: 1,
      oita: 1,
      kagoshima: 1,
      wakayama: 1,
    },
    rationale:
      "アカメは高知（浦戸湾・四万十川）と宮崎（大淀川等）の汽水域にほぼ限られる日本固有の大型魚で、両県がルアー釣りの二大聖地。周辺県では散発的な記録があるのみで、それ以外の地域には生息しない。",
    sources: [
      "各県水産資料・レッドリスト（アカメ分布）",
      "アカメルアー釣り実績（高知・宮崎）",
    ],
  },
  mahata: {
    default: 1,
    regionOverrides: {
      hokkaido: 0,
      tohoku: 0,
      kanto: 2,
      chubu: 2,
      kinki: 2,
      shikoku: 2,
      kyushu: 2,
    },
    seaOverrides: { 日本海: 1, 瀬戸内海: 1, 有明海: 1 },
    prefectureOverrides: {
      shizuoka: 3,
      mie: 3,
      wakayama: 3,
      kochi: 3,
      nagasaki: 3,
      kagoshima: 3,
      okinawa: 2,
    },
    rationale:
      "マハタは暖海の岩礁に生息する大型ハタで、泳がせ釣り・船釣りが主体。伊豆〜紀伊半島・四国・九州西岸の実績が厚く、岸からは磯の泳がせでまれに出る。日本海側・瀬戸内は少なく、東北以北には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（はた類）",
      "泳がせ釣り・船釣り実績（伊豆・紀伊半島・九州）",
    ],
  },
  oomonhata: {
    default: 1,
    regionOverrides: {
      hokkaido: 0,
      tohoku: 0,
      kanto: 2,
      chubu: 2,
      kinki: 2,
      shikoku: 3,
      kyushu: 3,
    },
    seaOverrides: { 日本海: 1, 瀬戸内海: 1, 有明海: 1 },
    prefectureOverrides: {
      shizuoka: 3,
      mie: 3,
      wakayama: 3,
      kochi: 4,
      ehime: 3,
      oita: 3,
      miyazaki: 3,
      kagoshima: 4,
      nagasaki: 3,
      fukuoka: { 日本海: 2, 瀬戸内海: 1 },
      okinawa: 3,
    },
    rationale:
      "オオモンハタは近年人気が急上昇した暖流系ロックフィッシュで、高知・鹿児島を筆頭に南紀・四国・九州のスイミングゲーム実績が突出する。伊豆〜東海でも定着。日本海側・瀬戸内はまれで、東北以北には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（はた類）",
      "ロックフィッシュ釣果実績（高知・南九州・伊豆）",
    ],
  },
  onikasago: {
    default: 1,
    regionOverrides: { hokkaido: 0 },
    seaOverrides: { 瀬戸内海: 1, 有明海: 0 },
    prefectureOverrides: { chiba: 2, kanagawa: 2, shizuoka: 2 },
    rationale:
      "オニカサゴ（イズカサゴ等）は水深80〜200mの船釣り専門ターゲットで、岸釣り適性は全国的に低い。相模湾・駿河湾・外房の中深場五目が本場。浅い有明海には生息せず、北海道にも分布しない。",
    sources: [
      "中深場船釣り実績（相模湾・駿河湾・外房）",
      "魚類図鑑的分布情報（オニカサゴ類・生息水深）",
    ],
  },
  taman: {
    default: 0,
    prefectureOverrides: {
      okinawa: 4, // 打ち込み釣りの看板ターゲット
      kagoshima: 3, // 奄美群島・南薩
      miyazaki: 2,
      kochi: 2,
      wakayama: 1,
      mie: 1,
      shizuoka: 1,
      tokushima: 1,
      ehime: 1,
      oita: 1,
      nagasaki: 1,
      kumamoto: 1,
    },
    rationale:
      "タマン（ハマフエフキ）は沖縄の打ち込み釣りを代表する看板ターゲットで、奄美〜南薩の鹿児島も実績が厚い。黒潮の当たる宮崎・高知では夏に狙え、南紀・伊豆など本州では散発的な記録にとどまる。",
    sources: [
      "沖縄の打ち込み釣り実績（釣具店・釣果情報）",
      "魚類図鑑的分布情報（ハマフエフキ・分布域）",
    ],
  },
  oonibe: {
    default: 0,
    prefectureOverrides: {
      miyazaki: 4, // 冬の日向灘サーフの象徴
      kagoshima: 2, // 志布志湾など大隅東岸
      oita: 1,
      kochi: 1,
      tokushima: 1,
      ehime: 1,
      shizuoka: 1,
      aichi: 1,
      mie: 1,
      wakayama: 1,
      chiba: 1,
    },
    rationale:
      "オオニベは宮崎の冬サーフを象徴する大型ターゲットで、漁獲・釣り実績とも日向灘に集中し、志布志湾など鹿児島東岸が続く。遠州灘〜熊野灘や四国太平洋岸では散発的な記録があるのみで、他地域には実質生息しない。",
    sources: [
      "宮崎県水産資料（オオニベ種苗放流・日向灘）",
      "サーフルアー釣果実績（宮崎）",
    ],
  },
  sujiara: {
    default: 0,
    prefectureOverrides: { okinawa: 4, kagoshima: 3 },
    rationale:
      "スジアラ（アカジン）は琉球列島のサンゴ礁域を代表する高級ハタで、沖縄が漁獲・釣り実績とも突出し、奄美群島など鹿児島の島嶼部が続く。屋久島・種子島以北には実質生息しない。",
    sources: [
      "沖縄県の漁獲・釣果情報（アカジンミーバイ）",
      "魚類図鑑的分布情報（スジアラ・分布域）",
    ],
  },
};
