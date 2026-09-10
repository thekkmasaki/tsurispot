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
  magochi: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { オホーツク海: 0, 東京湾: 3, 伊勢湾: 3, 瀬戸内海: 3 },
    prefectureOverrides: {
      shizuoka: 4, // 遠州灘サーフ
      aichi: 4, // 伊勢湾・三河湾の照りゴチ文化
      chiba: 3, // 九十九里
      kanagawa: 3, // 湘南サーフ
      miyazaki: 3,
      okinawa: 1, // 本種は少なく近縁種主体
    },
    rationale:
      "マゴチは本州〜九州の砂浜・河口に分布し、ヒラメと並ぶサーフのフラットフィッシュ定番。遠州灘〜伊勢湾の「照りゴチ」文化と湘南・九十九里のサーフ実績が厚く、東京湾・瀬戸内の内湾でも安定する。北海道は境界域で、沖縄は近縁種主体でまれ。",
    sources: [
      "農林水産省 海面漁業生産統計調査（こち類）",
      "サーフルアー・照りゴチ釣果実績（遠州灘・湘南・九十九里）",
    ],
  },
  ishidai: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 有明海: 1 },
    prefectureOverrides: {
      chiba: 3, // 房総の底物
      tokyo: 3, // 伊豆諸島
      shizuoka: 3, // 伊豆半島
      mie: 3,
      wakayama: 3, // 南紀
      tokushima: 3,
      kochi: 4,
      ehime: 3,
      oita: 3,
      miyazaki: 3,
      kagoshima: 4, // トカラ・屋久島
      nagasaki: 4, // 男女群島・五島
      okinawa: 1, // イシガキダイ優勢で本種はまれ
    },
    rationale:
      "イシダイは「磯の王者」と呼ばれる底物釣りの最高峰ターゲットで、房総〜伊豆・南紀・四国・九州の外洋磯が本場。男女群島・五島の長崎、トカラ・屋久島の鹿児島、高知の外洋磯は特筆される。北限は東北の境界域で、北海道には分布しない。沖縄はイシガキダイが主で本種はまれ。",
    sources: [
      "底物（イシダイ）釣り実績（房総・伊豆・南紀・四国・九州）",
      "魚類図鑑的分布情報（イシダイ・分布域）",
    ],
  },
  mejina: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 有明海: 1 },
    prefectureOverrides: {
      chiba: 3,
      kanagawa: 3, // 三浦・真鶴の磯
      shizuoka: 4, // 伊豆半島は口太グレのメッカ
      tokyo: 4, // 伊豆諸島の尾長グレ
      mie: 3,
      wakayama: 3, // 南紀
      tokushima: 3,
      kochi: 4,
      ehime: 3,
      oita: 3,
      miyazaki: 3,
      kagoshima: 4,
      nagasaki: 4, // 五島・男女群島
      okinawa: 2, // 尾長・オキナメジナ域
    },
    rationale:
      "メジナ（グレ・クロ）は磯フカセ釣りの本命で、伊豆・南紀・四国・九州の磯が本場。伊豆諸島・高知・長崎（五島・男女群島）・鹿児島は尾長グレのメッカとして特筆され、堤防の木っ端グレは全国区。北限は東北南部の境界域で、北海道には分布しない。",
    sources: [
      "磯フカセ（グレ）釣り実績（伊豆・南紀・四国・九州）",
      "魚類図鑑的分布情報（メジナ属・分布域）",
    ],
  },
  koshoudai: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0 },
    prefectureOverrides: {
      wakayama: 3,
      kochi: 3,
      nagasaki: 3,
      kumamoto: 3, // 天草
      kagoshima: 3,
      miyazaki: 3,
      okinawa: 2, // アジアコショウダイ等の近縁種主体
    },
    rationale:
      "コショウダイは本州中部以南の磯・堤防に着く南方系のイサキ科で、紀伊半島・四国・九州の磯釣り・カゴ釣りで実績が厚い。温暖化で瀬戸内・関東の堤防でも釣果が増えている。東北は境界域で、北海道には分布しない。",
    sources: [
      "磯・カゴ釣り釣果実績（南紀・四国・九州）",
      "魚類図鑑的分布情報（コショウダイ・分布域）",
    ],
  },
  houbou: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    seaOverrides: { オホーツク海: 0, 東京湾: 3, 相模湾: 3 },
    prefectureOverrides: {
      okinawa: 1, // 記録の少ない南限域
    },
    rationale:
      "ホウボウは全国の砂泥底に分布し、投げ釣り・サーフルアーの外道からショアジギングまで幅広く釣れる高級魚。船釣りでは東京湾・相模湾の実績が厚い。北海道は南部中心の境界域で、沖縄は記録の少ない南限域。",
    sources: [
      "農林水産省 海面漁業生産統計調査（ほうぼう類）",
      "投げ釣り・サーフルアー釣果実績（全国）",
    ],
  },
  bera: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 瀬戸内海: 4 },
    prefectureOverrides: {
      okinawa: 2, // 南方系ベラ類が豊富
    },
    rationale:
      "キュウセン等のベラ類は本州〜九州の砂地まじりの岩礁・堤防に多い五目釣りの定番。特に瀬戸内海では夏の食文化として定着し、漁獲・釣り実績とも特筆される。東北は境界域で、北海道には分布しない。",
    sources: [
      "瀬戸内のキュウセン食文化・釣果実績",
      "魚類図鑑的分布情報（ベラ科・分布域）",
    ],
  },
  isaki: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 瀬戸内海: 1, 有明海: 1 },
    prefectureOverrides: {
      chiba: 3, // 外房
      tokyo: 3, // 伊豆諸島
      shizuoka: 3, // 伊豆
      mie: 3,
      wakayama: 3,
      kochi: 3,
      ehime: 3, // 宇和海
      oita: 3,
      miyazaki: 3,
      kagoshima: 3,
      nagasaki: 4, // 五島・平戸は漁獲・釣りとも特筆
      fukuoka: { 日本海: 3, 瀬戸内海: 1 },
      saga: { 日本海: 3, 東シナ海: 3 },
    },
    rationale:
      "イサキは初夏の磯・沖磯・カゴ釣りの主役で、九州西岸（五島・平戸・玄界灘）と房総・伊豆・南紀・四国の外洋に面した磯で実績が厚い。漁獲量は長崎が全国上位。内湾性の瀬戸内海・有明海では少なく、北限は東北南部の境界域で北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（いさき・県別漁獲量）",
      "磯・カゴ釣り釣果実績（五島・平戸・伊豆・房総）",
    ],
  },
  amadai: {
    default: 1,
    regionOverrides: { hokkaido: 0 },
    seaOverrides: { オホーツク海: 0, 瀬戸内海: 1, 有明海: 0 },
    prefectureOverrides: {
      kanagawa: 2, // 相模湾のアマダイ船
      shizuoka: 2,
      kyoto: 2, // 丹後グジ
      fukui: 2, // 若狭グジ
      nagasaki: 2,
      fukuoka: { 日本海: 2, 瀬戸内海: 1 }, // 玄界灘の船文化
    },
    rationale:
      "アカアマダイは水深30〜150mの砂泥底に生息する船釣り主体の高級魚で、岸からの実績は全国的に低い。若狭湾（若狭グジ・丹後グジ）・相模湾・玄界灘に船釣り文化が根付く。浅い有明海には生息せず、北海道にも分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（あまだい類・県別漁獲量）",
      "アマダイ船釣り実績（相模湾・若狭湾・玄界灘）",
    ],
  },
  kobudai: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 瀬戸内海: 3, 有明海: 1 },
    prefectureOverrides: {
      niigata: 4, // 佐渡のコブダイ（カンダイ）釣りは特筆
      ishikawa: 3, // 能登
      tottori: 3,
      shimane: 3,
      okinawa: 0, // 温帯種で琉球列島には分布しない
    },
    rationale:
      "コブダイは本州中部以南の岩礁に生息する大型のベラで、冬の磯のカブセ釣り・ぶっこみ釣りの大物ターゲット。佐渡を擁する新潟は特筆され、能登・山陰の日本海側と瀬戸内海（しまなみ周辺）に実績が厚い。東北は境界域で、北海道・琉球列島には分布しない。",
    sources: [
      "カブセ釣り・磯釣り実績（佐渡・山陰・瀬戸内）",
      "魚類図鑑的分布情報（コブダイ・分布域）",
    ],
  },
  ishigakidai: {
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
      tokyo: 3, // 伊豆諸島
      shizuoka: 3, // 伊豆半島
      wakayama: 3, // 南紀
      kochi: 3,
      nagasaki: 4, // 男女群島のクチジロは底物の聖地
      kagoshima: 4, // トカラ・屋久島
      miyazaki: 3,
      okinawa: 3,
    },
    rationale:
      "イシガキダイはイシダイより南方寄りの底物ターゲットで、伊豆・南紀・四国・九州南部の黒潮域が本場。大型（クチジロ）は男女群島・トカラ・屋久島・沖縄が聖地とされる。日本海側・瀬戸内はまれで、東北以北には分布しない。",
    sources: [
      "底物（イシガキダイ・クチジロ）釣り実績（伊豆・南紀・男女群島・トカラ）",
      "魚類図鑑的分布情報（イシガキダイ・分布域）",
    ],
  },
  hirasuzuki: {
    default: 1,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0 },
    prefectureOverrides: {
      chiba: 3, // 外房の磯ヒラ
      shizuoka: 3, // 伊豆
      tokyo: 2, // 伊豆諸島
      mie: 3,
      wakayama: 3,
      tokushima: 2,
      kochi: 4, // 磯ヒラのメッカ
      ehime: { 太平洋: 3, 瀬戸内海: 1 }, // 佐田岬・宇和海
      oita: 2,
      miyazaki: 3,
      kagoshima: 4,
      nagasaki: 4, // 五島・平戸
      tottori: 2,
      shimane: 3, // 山陰の磯ヒラ
      yamaguchi: { 日本海: 3, 瀬戸内海: 1 },
      fukuoka: { 日本海: 2, 瀬戸内海: 1 },
      saga: { 日本海: 2, 東シナ海: 2 },
      okinawa: 0, // スズキ属は分布しない
    },
    rationale:
      "ヒラスズキは荒磯のサラシを釣る「磯マル」ゲームの対象で、外洋に面した磯に限られる。九州（五島・平戸・鹿児島）・高知・山陰・房総・伊豆が本場。内湾には少なく、東北は温暖化で記録が出始めた境界域。北海道・沖縄には分布しない。",
    sources: [
      "磯ヒラスズキ釣果実績（九州・四国・山陰・房総・伊豆）",
      "魚類図鑑的分布情報（ヒラスズキ・分布域）",
    ],
  },
  itoyoridai: {
    default: 1,
    regionOverrides: { hokkaido: 0, tohoku: 1, kinki: 2, chugoku: 2, shikoku: 2, kyushu: 3 },
    seaOverrides: { オホーツク海: 0, 瀬戸内海: 3, 有明海: 1 },
    prefectureOverrides: {
      kanagawa: 2, // 相模湾の船五目
      shizuoka: 2,
      mie: 2,
      ehime: 3,
      nagasaki: 3,
      yamaguchi: { 日本海: 2, 瀬戸内海: 3 },
    },
    rationale:
      "イトヨリダイは西日本の砂泥底に多い高級魚で、漁獲は瀬戸内海・東シナ海が中心。船の五目釣りが主体だが、瀬戸内・九州では投げ釣り・胴突きで岸からも釣れる。関東〜東海は船でまれに交じる程度で、東北は境界域、北海道には分布しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（いとよりだい・県別漁獲量）",
      "船五目・投げ釣り実績（瀬戸内・九州）",
    ],
  },
  medai: {
    default: 1,
    seaOverrides: { オホーツク海: 0, 瀬戸内海: 0, 有明海: 0 },
    prefectureOverrides: {
      tokyo: 2, // 伊豆諸島
      niigata: 2, // 佐渡の沖磯
      shimane: 2, // 隠岐
    },
    rationale:
      "メダイは水深100〜400mの深場に生息する船釣り主体の魚で、岸から釣れるのは伊豆諸島・佐渡・隠岐など離島の磯にまれにある程度。船では日本海側と伊豆諸島の中深場五目で定番。浅く閉じた瀬戸内海・有明海には生息しない。",
    sources: [
      "農林水産省 海面漁業生産統計調査（めだい）",
      "中深場船釣り実績（伊豆諸島・日本海側）",
    ],
  },
  hedai: {
    default: 1,
    regionOverrides: {
      hokkaido: 0,
      tohoku: 1,
      kanto: 2,
      chubu: 2,
      kinki: 2,
      chugoku: 2,
      shikoku: 3,
      kyushu: 3,
    },
    seaOverrides: { オホーツク海: 0, 日本海: 1, 瀬戸内海: 3 },
    prefectureOverrides: {
      wakayama: 3, // 紀州釣り・カゴ釣り
      shizuoka: 3, // 駿河湾・伊豆の堤防
      okinawa: 2,
    },
    rationale:
      "ヘダイは本州中部以南の内湾・堤防に着くタイ科で、紀州釣り・カゴ釣り・フカセの定番ゲスト。瀬戸内海・四国・九州など西日本の内湾で魚影が濃く、駿河湾・南紀でも実績が厚い。日本海側と東北は境界域で、北海道には分布しない。",
    sources: [
      "紀州釣り・カゴ釣り釣果実績（西日本内湾）",
      "魚類図鑑的分布情報（ヘダイ・分布域）",
    ],
  },
  kibire: {
    default: 2,
    regionOverrides: { hokkaido: 0, tohoku: 1 },
    seaOverrides: { オホーツク海: 0, 日本海: 1, 大阪湾: 4, 瀬戸内海: 3, 有明海: 3, 東京湾: 3 },
    prefectureOverrides: {
      shizuoka: 3, // 浜名湖
      aichi: 3, // 三河湾・矢作川河口
      hiroshima: 4, // 太田川河口のチニングは特筆
      tottori: 2, // 湖山池・中海周辺
      shimane: 2,
      okinawa: 1, // ミナミクロダイ等の近縁種主体
    },
    rationale:
      "キビレ（キチヌ）は西日本の河口・内湾で優勢なクロダイの近縁種で、大阪湾と広島（太田川河口）はチニングのメッカ。浜名湖・三河湾・有明海でも魚影が濃く、近年は東京湾など関東でも増加中。日本海側と東北は境界域で、北海道には分布しない。",
    sources: [
      "チニング釣果実績（大阪湾・広島・浜名湖）",
      "魚類図鑑的分布情報（キチヌ・分布域）",
    ],
  },
};
