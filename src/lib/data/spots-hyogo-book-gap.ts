import type { FishingSpot, FishSpecies, GearGuide } from "@/types";
import { regions } from "./regions";
import { getFishBySlug } from "./fish";

/**
 * 関西の釣り場ガイド本（2021年3月時点）との照合で見つかった未掲載スポットのうち、
 * 2026-11 時点の公開情報で「現存・釣りが可能（禁止情報なし）・位置を地図で特定できた」ものだけを追加する。
 *
 * - 座標は国土地理院の地理院タイル（標準地図・写真）で防波堤・港の位置を目視確認した値
 * - 沖堤防（一文字・ケーソン）は 2024〜2026 年の釣果投稿で渡船の運航が確認できたもののみ
 * - 紹介文はオリジナル。書籍の文章は使用していない
 */

function fish(slug: string): FishSpecies {
  const f = getFishBySlug(slug);
  if (!f) throw new Error(`Fish not found: ${slug}`);
  return f;
}

function region(id: string) {
  const r = regions.find((r) => r.id === id);
  if (!r) throw new Error(`Region not found: ${id}`);
  return r;
}

const SRC = "釣果投稿サイト等の2023〜2026年の報告";

const btMorning = [
  { label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "best" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "good" as const },
  { label: "夕マヅメ", timeRange: "16:00〜18:30", rating: "good" as const },
  { label: "夜", timeRange: "19:00〜22:00", rating: "fair" as const },
];
const btEvening = [
  { label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "good" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "fair" as const },
  { label: "夕マヅメ", timeRange: "16:00〜18:30", rating: "best" as const },
  { label: "夜", timeRange: "19:00〜23:00", rating: "good" as const },
];

const gearSabiki: GearGuide = {
  targetFish: "アジ・イワシ・サバ", method: "サビキ釣り", difficulty: "beginner",
  rod: "磯竿2〜3号 3.6〜4.5m", reel: "スピニングリール 2500番", line: "ナイロン3号",
  hook: "サビキ仕掛け 5〜7号", otherItems: ["コマセカゴ", "アミエビ", "バケツ"],
  tip: "群れが回ってくる朝夕に集中して竿を出す。コマセは少量ずつ。",
};
const gearNage: GearGuide = {
  targetFish: "キス・カレイ", method: "投げ釣り", difficulty: "beginner",
  rod: "投げ竿 3.9〜4.25m", reel: "スピニングリール 3000〜4000番", line: "ナイロン3〜4号",
  hook: "流線針 7〜12号", otherItems: ["天秤オモリ 20〜25号", "イソメ類", "竿立て"],
  tip: "カレイは置き竿で複数の方向を探り、キスはゆっくり引いて砂地の変化を探す。",
};
const gearRock: GearGuide = {
  targetFish: "カサゴ・メバル", method: "穴釣り・探り釣り", difficulty: "beginner",
  rod: "穴釣りロッド 1.1〜1.8m", reel: "小型両軸リール", line: "フロロ3号",
  hook: "ブラクリ 3〜5号", otherItems: ["イソメ類", "サバの切り身"],
  tip: "根掛かりしやすいので、底を取ったら少し浮かせてアタリを待つ。",
};
const gearUki: GearGuide = {
  targetFish: "クロダイ・メジナ", method: "ウキフカセ釣り", difficulty: "intermediate",
  rod: "磯竿1〜1.5号 5.3m", reel: "スピニングリール 2500番", line: "ナイロン2号",
  hook: "チヌ針2〜3号", otherItems: ["円錐ウキ", "オキアミ", "配合エサ"],
  tip: "潮下にコマセと付けエサを同調させる。足元の際も忘れずに探る。",
};
const gearEging: GearGuide = {
  targetFish: "アオリイカ", method: "エギング", difficulty: "intermediate",
  rod: "エギングロッド 8.3〜8.6ft ML", reel: "スピニングリール 2500番", line: "PE 0.6〜0.8号",
  hook: "エギ 2.5〜3.5号", otherItems: ["リーダー フロロ2〜2.5号", "ギャフ"],
  tip: "秋は小型エギで数を、春は大きめのエギで良型を狙う。夏の採捕規制期間は避ける。",
};
const gearLure: GearGuide = {
  targetFish: "シーバス", method: "ルアー釣り", difficulty: "intermediate",
  rod: "シーバスロッド 8.6〜9.6ft ML", reel: "スピニングリール 3000番", line: "PE 1号",
  hook: "ミノー・バイブレーション", otherItems: ["リーダー フロロ4〜5号", "スナップ"],
  tip: "濁りが入ったタイミングや潮の効き始めがチャンス。",
};
const gearTachiuo: GearGuide = {
  targetFish: "タチウオ", method: "ウキ釣り・ワインド", difficulty: "intermediate",
  rod: "磯竿2号 4.5m またはワインドロッド", reel: "スピニングリール 2500〜3000番", line: "ナイロン3号 / PE 0.8〜1号",
  hook: "タチウオ針・ワインド用ジグヘッド", otherItems: ["ワイヤーハリス", "電気ウキ", "キビナゴ"],
  tip: "夕マヅメから暗くなるまでが時合い。タナをこまめに変えて探る。",
};
const gearJig: GearGuide = {
  targetFish: "ハマチ・サワラ", method: "ショアジギング", difficulty: "intermediate",
  rod: "ショアジギングロッド M〜MH 9.6〜10ft", reel: "スピニングリール 4000番",
  line: "PE 1〜1.5号", hook: "メタルジグ 30〜40g", otherItems: ["リーダー フロロ5号", "タモ網"],
  tip: "回遊のある秋の朝マヅメが勝負。サワラ狙いはリーダーを太めに。",
};

const ferryRules = ["渡船料金が必要（料金・出船時刻は渡船店に要確認）", "最終便の時刻厳守", "ライフジャケット着用", "ゴミは必ず持ち帰り"];
const awajiSquidRule = "アオリイカは夏季（7〜9月）に地元の採捕規制期間あり。現地掲示・漁協の案内に従うこと";
const octopusRule = "タコは漁業権の対象のため釣らないこと";

export const hyogoBookGapSpots: FishingSpot[] = [
  // =========================================
  // 神戸・播磨
  // =========================================
  {
    id: "hbg001", name: "舞子漁港", slug: "maiko-gyoko",
    description: "山陽電鉄の西舞子駅の目の前にある、神戸市が管理する小さな漁港。明石海峡の東口に面しており、潮の動きがよく魚の出入りが多い。港を囲む短い防波堤と沖側の消波ブロック帯の周りで、カサゴやメバルなどの根魚、チヌ、シーバスが狙える。夏から秋はアジの回遊もある。駅から歩いてすぐ竿を出せる手軽さが魅力。ただし規模は小さく、漁船の作業場所も兼ねるため、漁業者の作業を優先し、立入禁止の柵がある先端の消波ブロックには入らないこと。",
    latitude: 34.6366, longitude: 135.0280,
    address: "〒655-0048 兵庫県神戸市垂水区西舞子",
    accessInfo: "山陽電鉄「西舞子」駅から徒歩すぐ。JR「舞子」駅から徒歩約15分。",
    region: region("r401"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: false, parkingDetail: "釣り人用の駐車場は確認できず。周辺のコインパーキングを利用",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.4, reviewCount: 0,
    catchableFish: [
      { fish: fish("kasago"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "落とし込み・ウキ釣り", source: SRC },
      { fish: fish("suzuki"), monthStart: 4, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: SRC },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["先端の消波ブロックは柵で立入禁止", "明石海峡に面し潮流が速い", "漁船の出入り・作業の妨げにならないこと"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      restrictedAreas: ["防波堤先端の消波ブロック（柵で立入禁止）"],
      otherRules: [octopusRule, "漁業者の作業スペースでは竿を出さない", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearRock, gearSabiki, gearLure],
    youtubeLinks: [{ label: "舞子漁港 釣り", searchQuery: "舞子漁港 西舞子 釣り", description: "舞子漁港周辺での釣り動画" }],
  },
  {
    id: "hbg002", name: "本荘ケーソン（神鋼ケーソン）", slug: "honjo-caisson",
    description: "加古川市の製鉄所の埋立地から南東へ約1km延びる沖のケーソン堤（沖堤防）。陸からは入れず、播磨町本荘の渡船で渡る。播磨灘の東部にあって潮通しがよく、水深もあるため、秋はハマチなど青物の回遊、冬から春はカレイの投げ釣りが楽しめる。シーバスやチヌの実績も高い。足場はケーソンの天端で平らだが手すりはなく、周りに日陰もない。ライフジャケットの着用と、飲み物の持参は必須。渡船の出船時刻と迎えの時刻は、乗船前に必ず確認しておこう。",
    latitude: 34.7034, longitude: 134.8294,
    address: "兵庫県加古川市金沢町地先（沖堤防・渡船利用）",
    accessInfo: "播磨町本荘の渡船乗り場から渡船（くさべ渡船ほか）を利用。乗り場の最寄りは山陽電鉄「播磨町」駅。",
    region: region("r451"), spotType: "breakwater", difficulty: "intermediate",
    isFree: false, feeDetail: "渡船料金が必要（2024年時点で大人2,700円程度。最新料金は渡船店に確認）",
    hasParking: true, parkingDetail: "渡船乗り場に駐車スペースあり（渡船利用者向け）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("suzuki"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: SRC },
      { fish: fish("inada"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ショアジギング", source: SRC },
      { fish: fish("karei"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "落とし込み", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング", source: SRC },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: SRC },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["渡船でしか渡れない沖堤防", "手すりなし・日陰なし", "荒天時は渡船が欠航", "ライフジャケット必須"],
    rules: { castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false, otherRules: [...ferryRules, octopusRule] },
    gearGuides: [gearLure, gearJig, gearNage, gearUki],
    youtubeLinks: [{ label: "本荘ケーソン 釣り", searchQuery: "本荘ケーソン 渡船 釣り", description: "本荘ケーソンでの釣り動画" }],
  },
  {
    id: "hbg003", name: "揖保川河口", slug: "ibogawa-kakou",
    description: "たつの市御津町と姫路市網干区の境を流れる揖保川の河口部。両岸から沖に導流堤が延び、川の水と播磨灘の潮が混ざる汽水域になっている。春のバチ抜けから秋にかけてシーバスが河口に差してくるほか、チヌやキビレの実績も多い。夏から秋は足元でハゼも釣れる。周りは工場地帯と干拓地で、立入禁止の区域や私有地が多い。入る場所と駐車場所は現地の表示をよく確かめること。大雨の後は濁りと流れが強くなるので、増水時は近づかないようにしたい。",
    latitude: 34.7625, longitude: 134.5660,
    address: "兵庫県たつの市御津町黒崎（揖保川河口）",
    accessInfo: "JR・山陽電鉄「網干」駅から車で移動。最寄りの高速道路出入口は山陽自動車道 龍野西IC。",
    region: region("r404"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: false, parkingDetail: "専用駐車場なし。工場・私有地への駐車は厳禁",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.4, reviewCount: 0,
    catchableFish: [
      { fish: fish("suzuki"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "トップウォーター・ブッコミ", source: SRC },
      { fish: fish("kibire"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "チニング", source: SRC },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ", source: SRC },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["導流堤の先端付近は足場が悪い", "増水時・大雨の後は近づかない", "周辺に立入禁止区域が多い"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      restrictedAreas: ["周辺の工場敷地・私有地"],
      otherRules: ["河川でアユ・ウナギなど漁業権魚種を狙う場合は漁協の遊漁券が必要"],
    },
    gearGuides: [gearLure, gearNage],
    youtubeLinks: [{ label: "揖保川河口 シーバス", searchQuery: "揖保川河口 シーバス チヌ", description: "揖保川河口での釣り動画" }],
  },
  {
    id: "hbg004", name: "岩見港", slug: "iwami-ko-tatsuno",
    description: "たつの市御津町の伊津湾の奥にある港。湾の入口に向かって長い防波堤が延び、先端には赤い灯台が立つ。防波堤ではサビキでアジやイワシ、ウキ釣りでサヨリ、夜はメバルやガシラ（カサゴ）が狙える。秋から冬にかけてはヒイカやアオリイカを狙うエギングも人気で、潮通しのよい先端ではハマチなどの青物やヒラメが出ることもある。近くの道の駅みつに駐車場とトイレがある。マリーナの駐車場と、道の駅敷地内の磯は釣り禁止なので注意。",
    latitude: 34.7808, longitude: 134.5285,
    address: "〒671-1331 兵庫県たつの市御津町岩見",
    accessInfo: "山陽自動車道 龍野西IC、またはJR「網干」駅から車で移動。道の駅みつから徒歩圏。",
    region: region("r404"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "道の駅みつの駐車場を利用（マリーナ専用駐車場には停めないこと）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
      { fish: fish("iwashi"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: SRC },
      { fish: fish("sayori"), monthStart: 10, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ウキ釣り", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング", source: SRC },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: SRC },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング", source: SRC },
      { fish: fish("hirame"), monthStart: 10, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ルアー", source: SRC },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["防波堤の外側は消波ブロックで足場が悪い", "先端は風の影響を受けやすい"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      restrictedAreas: ["道の駅みつ敷地内の磯（釣り禁止）"],
      otherRules: ["マリーナの駐車場は釣り人の利用不可", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearSabiki, gearRock, gearEging],
    youtubeLinks: [{ label: "岩見港 釣り", searchQuery: "岩見港 御津 釣り", description: "岩見港での釣り動画" }],
  },
  {
    id: "hbg005", name: "壺根漁港", slug: "tsubone-gyoko",
    description: "相生湾の西岸、壺根地区にある小さな漁港。湾口に近く、港から南へ延びる長い防波堤が主な釣り場になる。夏から秋はサビキでアジやイワシ、防波堤からの投げ釣りでキスやカレイ、夜は常夜灯周りでメバルやカサゴが釣れる。シーバスやチヌも回ってくる。人が少なく静かに釣りができる一方、港内には立入禁止・釣り禁止の区画があり、トイレもない。漁港の作業を邪魔しないよう、表示に従って竿を出すこと。対岸の鰯浜とは湾をはさんだ反対側なので、行き先を間違えないように。",
    latitude: 34.7660, longitude: 134.4633,
    address: "〒678-0041 兵庫県相生市相生（壺根）",
    accessInfo: "JR「相生」駅から車で相生湾の西岸を南下。",
    region: region("r404"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり（漁業者の作業の妨げにならない場所に）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.3, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
      { fish: fish("iwashi"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: SRC },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング", source: SRC },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: SRC },
      { fish: fish("suzuki"), monthStart: 4, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: SRC },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["港内に立入禁止・釣り禁止の区画あり", "トイレなし", "夜間は足元が暗い場所あり"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      restrictedAreas: ["港内の立入禁止・釣り禁止の表示がある区画"],
      otherRules: ["漁船・漁具に近づかない", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearSabiki, gearNage, gearRock],
    youtubeLinks: [{ label: "壺根漁港 釣り", searchQuery: "壺根漁港 相生 釣り", description: "壺根漁港での釣り動画" }],
  },
  // =========================================
  // 淡路島
  // =========================================
  {
    id: "hbg006", name: "浦港", slug: "ura-ko-awaji",
    description: "淡路市浦、東浦地区の港。白い灯台の立つ大波止と、その南側の防波堤が主な釣り場。外側には消波ブロックが入り、カサゴやアコウなどの根魚を穴釣りで狙える。冬から春は投げ釣りのカレイが有名で、アイナメやメバルも混じる。秋の夜はタチウオ、春と秋はチヌも狙える。港の南には道の駅とビーチがある。南の防波堤の近くに駐車場はないので、車の停め方に注意。冬は北西の風が強い日が多く、風裏になる場所を選ぶと釣りやすくなる。",
    latitude: 34.5428, longitude: 134.9963,
    address: "兵庫県淡路市浦",
    accessInfo: "神戸淡路鳴門自動車道 東浦ICから国道28号を北へ車で約5分。",
    region: region("r886"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: false, parkingDetail: "南防波堤付近に駐車場なし。港内・路上の駐車は避ける",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("ainame"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り・探り釣り", source: SRC },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング", source: SRC },
      { fish: fish("tachiuo"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ウキ釣り", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: SRC },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["外側の消波ブロック上は転落に注意", "冬は北西風が強い日がある"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      otherRules: [octopusRule, awajiSquidRule, "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearNage, gearRock, gearTachiuo],
    youtubeLinks: [{ label: "浦港 淡路 釣り", searchQuery: "淡路島 浦港 カレイ 釣り", description: "浦港での釣り動画" }],
  },
  {
    id: "hbg007", name: "仮屋一文字", slug: "kariya-ichimonji",
    description: "淡路市の仮屋漁港の沖にある、全長約600mの沖堤防。陸続きではなく、北隣の森漁港から渡船で数分で渡る。大阪湾に面して潮がよく通り、冬から春のマコガレイとイシガレイの投げ釣りで知られる。大型のヒラメが上がることもあり、外側の消波ブロック周りではガシラ（カサゴ）やメバル、チヌも狙える。トイレや売店はないので、飲み物や防寒具を持って渡ること。迎えの便の時刻は乗船時に必ず確認し、荒天の予報が出ている日は無理をしないこと。",
    latitude: 34.5147, longitude: 134.9900,
    address: "兵庫県淡路市仮屋地先（沖堤防・渡船利用）",
    accessInfo: "森漁港（淡路市森）から森渡船を利用。最寄りの高速道路出入口は神戸淡路鳴門自動車道 東浦IC。",
    region: region("r886"), spotType: "breakwater", difficulty: "intermediate",
    isFree: false, feeDetail: "渡船料金が必要（最新料金・出船時刻は森渡船に確認）",
    hasParking: true, parkingDetail: "渡船乗り場周辺に駐車（渡船店の案内に従う）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("hirame"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "泳がせ・ルアー", source: SRC },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 6, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "穴釣り", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: SRC },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["渡船でしか渡れない沖堤防", "外側は消波ブロックで足場が悪い", "荒天時は渡船が欠航", "ライフジャケット必須"],
    rules: { castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: false, fishingLicenseRequired: false, otherRules: [...ferryRules, octopusRule] },
    gearGuides: [gearNage, gearRock, gearUki],
    youtubeLinks: [{ label: "仮屋一文字 カレイ", searchQuery: "仮屋一文字 森渡船 カレイ", description: "仮屋一文字での釣り動画" }],
  },
  {
    id: "hbg008", name: "生穂一文字", slug: "ikuho-ichimonji",
    description: "淡路市の津名港にある、佐野新島と生穂新島の間の水路に置かれた長さ約110mの小さな沖堤防。津名港内の一文字を回る渡船で渡る。規模は小さいが、潮が通る水路の真ん中にあって、夏から秋はサビキでアジがまとまって釣れる。秋はタチウオの数釣りが楽しめ、サワラやハマチなど青物の回遊も多い。チヌやカレイも狙える。渡船の運航日・時刻は事前に確認しておくこと。堤防が短く横並びになりやすいので、周りの人と声をかけ合ってキャストしよう。",
    latitude: 34.4449, longitude: 134.9254,
    address: "兵庫県淡路市生穂地先（津名港内・渡船利用）",
    accessInfo: "志筑ボートパーク（淡路市志筑）から一文字渡船を利用。最寄りの高速道路出入口は神戸淡路鳴門自動車道 津名一宮IC。",
    region: region("r886"), spotType: "breakwater", difficulty: "intermediate",
    isFree: false, feeDetail: "渡船料金が必要（最新料金・出船時刻は渡船店に確認）",
    hasParking: true, parkingDetail: "渡船乗り場周辺に駐車（渡船店の案内に従う）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ウキ釣り・ワインド", source: SRC },
      { fish: fish("sawara"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ショアジギング", source: SRC },
      { fish: fish("inada"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ショアジギング", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: SRC },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: SRC },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["渡船でしか渡れない沖堤防", "堤防が短く混雑時はキャストに注意", "荒天時は渡船が欠航", "ライフジャケット必須"],
    rules: { castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false, otherRules: [...ferryRules, octopusRule] },
    gearGuides: [gearSabiki, gearTachiuo, gearJig],
    youtubeLinks: [{ label: "生穂一文字 釣り", searchQuery: "生穂一文字 渡船 タチウオ アジ", description: "生穂一文字での釣り動画" }],
  },
  {
    id: "hbg009", name: "仁頃漁港", slug: "nigoro-gyoko",
    description: "南あわじ市の灘海岸、山が海に迫る地区にある小さな漁港。紀伊水道に面し、外洋の潮が入るので水がきれい。港の内側の岸壁は足場がよく、外側には大きな消波ブロックが積まれている。秋と春はアオリイカを狙うエギングの人気が高く、夜釣りの実績もある。根魚のガシラ（カサゴ）やメバル、アジ、チヌ、グレ（メジナ）も狙える。周りに店はないので、食べ物や飲み物は事前に用意しておくこと。外洋のうねりが入る日は外側の消波ブロックに乗らず、内側の岸壁から竿を出したい。",
    latitude: 34.1918, longitude: 134.7455,
    address: "兵庫県南あわじ市灘仁頃",
    accessInfo: "神戸淡路鳴門自動車道 淡路島南ICから車で南あわじ市の灘地区へ。",
    region: region("r136"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり（漁業者の作業の妨げにならない場所に）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("aoriika"), monthStart: 10, monthEnd: 6, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "エギング", source: SRC },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 6, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング", source: SRC },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: SRC },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ウキフカセ", source: SRC },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["外側の大型消波ブロックは転落の危険が高い", "外洋に面し、うねりの強い日は波をかぶる", "周辺に店舗なし"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      otherRules: [octopusRule, awajiSquidRule, "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearEging, gearRock, gearUki],
    youtubeLinks: [{ label: "仁頃漁港 エギング", searchQuery: "仁頃漁港 エギング 淡路島", description: "仁頃漁港での釣り動画" }],
  },
  {
    id: "hbg010", name: "阿那賀港", slug: "anaga-ko",
    description: "南あわじ市阿那賀、鳴門海峡の北にある港。海峡からの速い潮の影響を受けるため魚の活性が高く、港内でも本格的な魚が狙える。グレ（メジナ）のウキフカセ釣りの実績が高く、サビキのアジ、ガシラ（カサゴ）やメバル、投げ釣りのキスやカレイも楽しめる。秋と春はアオリイカも回ってくる。駐車場所から釣り場までが近く、家族連れでも入りやすい。漁港なので、漁業者の作業や漁船の出入りを優先すること。潮の速い時間帯は軽い仕掛けが流されやすいので、オモリを重めにして対応しよう。",
    latitude: 34.2705, longitude: 134.6685,
    address: "〒656-0661 兵庫県南あわじ市阿那賀",
    accessInfo: "神戸淡路鳴門自動車道 西淡三原ICまたは淡路島南ICから車で移動。",
    region: region("r136"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり（漁業者の作業の妨げにならない場所に）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜日中", method: "ウキフカセ", source: SRC },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 6, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング", source: SRC },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("aoriika"), monthStart: 10, monthEnd: 6, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング", source: SRC },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["鳴門海峡に近く潮流が速い", "漁船の出入りが多い"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      otherRules: [octopusRule, awajiSquidRule, "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearUki, gearSabiki, gearNage],
    youtubeLinks: [{ label: "阿那賀港 グレ", searchQuery: "阿那賀 漁港 グレ 釣り", description: "阿那賀港での釣り動画" }],
  },
  {
    id: "hbg011", name: "湊港（南あわじ市）", slug: "minato-ko-minamiawaji",
    description: "南あわじ市湊、三原川の河口の西にある港。埋立地から沖へ延びる長い防波堤があり、赤と白の灯台がそれぞれの先端に立つ。播磨灘の南端に面して魚種が多く、冬から春はカレイの投げ釣り、夏から秋はサビキのアジ、イワシ、サバが楽しめる。秋はタチウオや青物も回ってくる。チヌやシーバス、アオリイカ、コブダイの実績もある。長い防波堤と並んでいる桟橋は柵で立入禁止。防波堤の先端は風と波を受けやすいので、天気が荒れそうな日は根元寄りで釣るのが安全。",
    latitude: 34.3330, longitude: 134.7235,
    address: "兵庫県南あわじ市湊",
    accessInfo: "神戸淡路鳴門自動車道 西淡三原ICから車で移動。",
    region: region("r406"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり（漁業者・港湾の作業の妨げにならない場所に）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
      { fish: fish("iwashi"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: SRC },
      { fish: fish("saba"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り", source: SRC },
      { fish: fish("tachiuo"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ウキ釣り・ワインド", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: SRC },
      { fish: fish("suzuki"), monthStart: 4, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: SRC },
      { fish: fish("aoriika"), monthStart: 10, monthEnd: 6, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング", source: SRC },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["長波止と並行する桟橋はフェンスで立入禁止", "防波堤先端は風・波の影響を受けやすい"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      restrictedAreas: ["長波止と並行する桟橋（フェンスで立入禁止）"],
      otherRules: [octopusRule, awajiSquidRule, "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearNage, gearSabiki, gearTachiuo],
    youtubeLinks: [{ label: "湊港 淡路島 釣り", searchQuery: "南あわじ 湊港 釣り", description: "湊港での釣り動画" }],
  },
  {
    id: "hbg012", name: "新川口漁港", slug: "shinkawaguchi-gyoko",
    description: "洲本市由良の北の端、成山（成ヶ島）との間の水道「新川口」に面した小さな漁港。紀伊水道と大阪湾を結ぶ水道の潮が港の前を流れ、潮が動く時間は魚の活性が高い。アジ、メバル、ガシラ（カサゴ）が中心で、投げ釣りのキス、カレイ、秋はカワハギやタチウオ、チヌも狙える。駐車スペースはあるがトイレはない。漁船や遊漁船の出入りが多いので、船の通り道にはキャストしないこと。潮の流れが速い水道なので、潮止まりの前後に仕掛けを落ち着かせて狙うのが釣果を伸ばすコツ。",
    latitude: 34.2988, longitude: 134.9428,
    address: "兵庫県洲本市由良4丁目",
    accessInfo: "神戸淡路鳴門自動車道 洲本ICから国道28号・県道76号経由で由良方面へ。",
    region: region("r886"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり（漁業者の作業の妨げにならない場所に）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.4, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング", source: SRC },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 6, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: SRC },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("kawahagi"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "胴突き仕掛け", source: SRC },
      { fish: fish("tachiuo"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ウキ釣り", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: SRC },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["水道に面して潮流が速い", "漁船・遊漁船の出入りが多い", "トイレなし"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      otherRules: [octopusRule, awajiSquidRule, "船の航路にキャストしない", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearSabiki, gearRock, gearNage],
    youtubeLinks: [{ label: "新川口 由良 釣り", searchQuery: "由良 新川口 漁港 釣り", description: "新川口漁港での釣り動画" }],
  },
  {
    id: "hbg013", name: "五色浜", slug: "goshikihama",
    description: "洲本市五色町鳥飼浦の西海岸に続く浜。色とりどりの小石が見られることから名前が付いた。播磨灘に向かって遠投でき、初夏から秋はキスの投げ釣りが中心で、ベラや根の近くではガシラ（カサゴ）が混じる。夕方以降はシーバスのルアー、秋と春は岩場の周りでアオリイカを狙う人もいる。夏の海水浴場の開設期間は、遊泳区域とその周りで竿を出せない。キス狙いは人の少ない早朝の時間帯が向いており、遠投するほど型がよくなる傾向がある。",
    latitude: 34.3660, longitude: 134.7465,
    address: "兵庫県洲本市五色町鳥飼浦",
    accessInfo: "神戸淡路鳴門自動車道 津名一宮ICまたは洲本ICから車で淡路島西海岸へ。",
    region: region("r406"), spotType: "beach", difficulty: "beginner",
    isFree: true, hasParking: false, parkingDetail: "駐車場の有無・料金は時期により異なるため現地で確認",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: SRC },
      { fish: fish("bera"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "探り釣り", source: SRC },
      { fish: fish("suzuki"), monthStart: 4, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: SRC },
      { fish: fish("aoriika"), monthStart: 10, monthEnd: 6, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング", source: SRC },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["海水浴場の開設期間は遊泳区域で釣りをしない", "遠投時は後方の人に注意"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      otherRules: ["海水浴場の開設期間中は遊泳区域とその周辺で竿を出さない", awajiSquidRule, octopusRule],
    },
    gearGuides: [gearNage, gearLure, gearEging],
    youtubeLinks: [{ label: "五色浜 キス", searchQuery: "五色浜 淡路島 キス 投げ釣り", description: "五色浜での投げ釣り動画" }],
  },
  {
    id: "hbg014", name: "室津漁港（淡路市）", slug: "murotsu-gyoko-awaji",
    description: "淡路市室津、淡路島北西部の西海岸にある漁港。たつの市にある同じ名前の室津漁港とは別の港。北側に長く延びる防波堤の先端に灯台があり、外側の消波ブロックと内側の岸壁が釣り場になる。播磨灘に面し、投げ釣りでキスとカレイ、夜はメバルやガシラ（カサゴ）、サビキでアジが狙える。チヌやグレ（メジナ）のウキフカセ、秋と春のエギングも楽しめる。北淡ICから近く、行きやすい。冬は北西の季節風をまともに受けるので、風の弱い日を選ぶか、内側の岸壁で釣るとよい。",
    latitude: 34.5222, longitude: 134.8770,
    address: "兵庫県淡路市室津",
    accessInfo: "神戸淡路鳴門自動車道 北淡ICから車ですぐ。",
    region: region("r406"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり（漁業者の作業の妨げにならない場所に）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: SRC },
      { fish: fish("karei"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: SRC },
      { fish: fish("mebaru"), monthStart: 12, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング", source: SRC },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 6, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: SRC },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝夕マヅメ", method: "サビキ釣り", source: SRC },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: SRC },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ウキフカセ", source: SRC },
      { fish: fish("aoriika"), monthStart: 10, monthEnd: 6, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング", source: SRC },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["外側の消波ブロック上は転落に注意", "冬は北西の季節風が強い"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true, nightFishing: true, fishingLicenseRequired: false,
      otherRules: [octopusRule, awajiSquidRule, "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearNage, gearRock, gearUki, gearEging],
    youtubeLinks: [{ label: "淡路 室津漁港 釣り", searchQuery: "淡路市 室津漁港 釣り", description: "淡路市室津漁港での釣り動画" }],
  },
];
