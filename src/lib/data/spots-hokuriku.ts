import { FishingSpot, FishSpecies, Region } from "@/types";
import { getFishBySlug } from "./fish";
import { regions } from "./regions";

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

const hokurikuRegions: Region[] = [
  { id: "r146", prefecture: "新潟県", areaName: "寺泊", slug: "niigata-teradomari" },
  { id: "r147", prefecture: "新潟県", areaName: "柏崎", slug: "niigata-kashiwazaki" },
  { id: "r148", prefecture: "石川県", areaName: "能登島", slug: "ishikawa-notojima" },
  { id: "r149", prefecture: "福井県", areaName: "三国", slug: "fukui-mikuni" },
];

function localRegion(id: string) {
  return hokurikuRegions.find((r) => r.id === id) || region(id);
}

const mazumeChubu = { springSunrise: "5:20頃", springSunset: "18:10頃", summerSunrise: "4:30頃", summerSunset: "19:00頃", autumnSunrise: "5:30頃", autumnSunset: "17:20頃", winterSunrise: "6:40頃", winterSunset: "16:40頃", tip: "朝マヅメは日の出前後1時間がチャンスタイム。" };

const btMorning = [
  { label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "best" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "good" as const },
  { label: "夕マヅメ", timeRange: "16:00〜18:00", rating: "good" as const },
  { label: "夜", timeRange: "19:00〜22:00", rating: "fair" as const },
];
const btStandard = [
  { label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "best" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "fair" as const },
  { label: "夕マヅメ", timeRange: "16:00〜18:00", rating: "good" as const },
  { label: "夜", timeRange: "19:00〜22:00", rating: "good" as const },
];

const tideStandard = { bestTide: "中潮〜大潮", bestTidePhase: "上げ潮〜満潮前後", description: "潮が動く時間帯に回遊魚の活性が上がります。" };
const tideRock = { bestTide: "中潮〜大潮", bestTidePhase: "満潮前後", description: "満潮前後が根魚の活性が最も高まります。" };

const gearSabiki = { targetFish: "アジ・サバ・イワシ", method: "サビキ釣り", difficulty: "beginner" as const, rod: "磯竿3号 3.6〜4.5m", reel: "スピニングリール 2500番", line: "ナイロン3号", hook: "サビキ仕掛け 5〜7号", otherItems: ["コマセカゴ", "アミエビ", "バケツ"], tip: "コマセを撒きすぎず、少しずつ出すのがコツ。" };
const gearNage = { targetFish: "キス・カレイ", method: "投げ釣り", difficulty: "beginner" as const, rod: "投げ竿 3.9〜4.25m", reel: "スピニングリール 3000〜4000番", line: "ナイロン4号", hook: "流線針 7〜9号", otherItems: ["天秤オモリ 20〜25号", "青イソメ", "竿立て"], tip: "エサはイソメを房掛けにすると大型が食ってきます。" };
const gearEging = { targetFish: "アオリイカ", method: "エギング", difficulty: "intermediate" as const, rod: "エギングロッド 8.6ft ML", reel: "スピニングリール 2500番", line: "PE 0.6号", hook: "エギ 3〜3.5号", otherItems: ["リーダー フロロ2号", "ギャフ", "イカ締めピック"], tip: "秋は3号、春は3.5号のエギがおすすめ。ボトムをしっかり取ること。" };
const gearRock = { targetFish: "カサゴ・メバル", method: "穴釣り・根魚釣り", difficulty: "beginner" as const, rod: "穴釣りロッド 1.1〜1.5m", reel: "小型両軸リール", line: "フロロ3号", hook: "ブラクリ 3〜5号", otherItems: ["アオイソメ", "サバの切り身"], tip: "テトラの隙間に落とし込み、底に着いたら少し持ち上げて待つ。" };

export const hokurikuSpots: FishingSpot[] = [
  // ========================================
  // 新潟県 (5スポット)
  // ========================================
  {
    id: "s444", name: "直江津港", slug: "naoetsu-port",
    description: "上越市の日本海に面した大港。広い岸壁でサビキ釣りからショアジギングまで楽しめる。春のホタルイカ接岸時期は特に賑わう。",
    latitude: 37.1740, longitude: 138.2280,
    address: "新潟県上越市港町2丁目",
    accessInfo: "えちごトキめき鉄道直江津駅から徒歩約15分。北陸自動車道上越ICから約10分。",
    region: region("r3"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり（50台）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/naoetsu-port.jpg", images: [], rating: 4.0, reviewCount: 165,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("inada"), monthStart: 8, monthEnd: 11, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearNage],
    safetyLevel: "safe", safetyNotes: ["広い岸壁で足場良好", "冬場は日本海の風に注意"],
    youtubeLinks: [
      { label: "直江津港 サビキ", searchQuery: "直江津港 サビキ釣り アジ", description: "直江津港でのサビキ釣り動画" },
    ],
  },
  {
    id: "s445", name: "寺泊港", slug: "teradomari-port",
    description: "魚のアメ横と呼ばれる鮮魚市場に隣接した港。アジやキスが安定して釣れ、観光と釣りを同時に楽しめる人気スポット。",
    latitude: 37.6290, longitude: 138.7580,
    address: "新潟県長岡市寺泊下荒町",
    accessInfo: "JR越後線寺泊駅からバスで約10分。北陸自動車道中之島見附ICから約30分。",
    region: localRegion("r146"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "市場周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/teradomari-port.jpg", images: [], rating: 3.9, reviewCount: 142,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kisu"), monthStart: 6, monthEnd: 9, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearNage],
    safetyLevel: "safe", safetyNotes: ["市場隣接で施設充実", "観光客との共存に配慮"],
    youtubeLinks: [
      { label: "寺泊港 釣り", searchQuery: "寺泊港 釣り アジ キス", description: "寺泊港での釣り動画" },
    ],
  },
  {
    id: "s446", name: "新潟西港", slug: "niigata-nishi-port",
    description: "信濃川河口に近い新潟西港。シーバスの名ポイントとして知られ、秋のサケ遡上シーズンも見もの。都市型の便利な釣り場。",
    latitude: 37.9290, longitude: 139.0240,
    address: "新潟県新潟市中央区入船町4丁目",
    accessInfo: "JR新潟駅からバスで約20分。新潟亀田ICから約15分。",
    region: region("r3"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "周辺コインパーキングあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/niigata-nishi-port.jpg", images: [], rating: 3.8, reviewCount: 132,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["都市部の港で施設充実", "船の往来に注意"],
    youtubeLinks: [
      { label: "新潟西港 シーバス", searchQuery: "新潟西港 シーバス ルアー", description: "新潟西港でのシーバス釣り動画" },
    ],
  },
  {
    id: "s447", name: "柏崎港", slug: "kashiwazaki-port",
    description: "柏崎市の中心部に近い港。堤防が長く伸び、アジやサバのサビキ釣りからエギングまで多彩。夕日が美しいスポットとしても知られる。",
    latitude: 37.3620, longitude: 138.5570,
    address: "新潟県柏崎市番神2丁目",
    accessInfo: "JR信越本線柏崎駅から車で約10分。北陸自動車道柏崎ICから約15分。",
    region: localRegion("r147"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり（30台）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/kashiwazaki-port.jpg", images: [], rating: 3.8, reviewCount: 118,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "穴釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearEging],
    safetyLevel: "safe", safetyNotes: ["堤防は比較的足場良好"],
    youtubeLinks: [
      { label: "柏崎港 アオリイカ", searchQuery: "柏崎港 エギング アオリイカ", description: "柏崎港でのエギング動画" },
    ],
  },
  {
    id: "s448", name: "佐渡小木港", slug: "sado-ogi-port",
    description: "佐渡島南端のたらい舟で有名な港。離島ならではの魚影の濃さで、アジ・メバル・クロダイなど多彩な魚種が釣れる。",
    latitude: 37.8150, longitude: 138.2570,
    address: "新潟県佐渡市小木町",
    accessInfo: "佐渡汽船小木港フェリーターミナルすぐ。直江津港からフェリーで約1時間40分。",
    region: localRegion("r147"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/sado-ogi-port.jpg", images: [], rating: 4.2, reviewCount: 68,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearEging],
    safetyLevel: "safe", safetyNotes: ["離島のためフェリー時間に注意", "宿泊準備推奨"],
    youtubeLinks: [
      { label: "佐渡 釣り", searchQuery: "佐渡島 小木港 釣り", description: "佐渡小木港での釣り動画" },
    ],
  },

  // ========================================
  // 富山県 (4スポット)
  // ========================================
  {
    id: "s449", name: "氷見漁港", slug: "himi-gyoko",
    description: "寒ブリで全国的に有名な氷見の漁港。堤防からはアジやキスが釣れ、冬場のヤリイカ狙いのエギングも人気。立山連峰を望む絶景。",
    latitude: 36.8560, longitude: 136.9800,
    address: "富山県氷見市比美町",
    accessInfo: "JR氷見線氷見駅から徒歩約15分。能越自動車道氷見ICから約10分。",
    region: region("r21"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "氷見漁港場外市場駐車場あり（無料）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/himi-gyoko.jpg", images: [], rating: 4.0, reviewCount: 145,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kisu"), monthStart: 6, monthEnd: 9, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("yariika"), monthStart: 12, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "エギング" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearNage],
    safetyLevel: "safe", safetyNotes: ["市場隣接で施設充実", "漁業作業時は邪魔にならないよう注意"],
    youtubeLinks: [
      { label: "氷見漁港 釣り", searchQuery: "氷見漁港 釣り アジ", description: "氷見漁港での釣り動画" },
    ],
  },
  {
    id: "s450", name: "魚津補助港", slug: "uozu-hojo-port",
    description: "蜃気楼の街・魚津の補助港。埋没林博物館の近くで、ホタルイカの名所でもある。アジやカマスが安定して釣れる穴場スポット。",
    latitude: 36.8260, longitude: 137.4010,
    address: "富山県魚津市釈迦堂",
    accessInfo: "あいの風とやま鉄道魚津駅から車で約5分。北陸自動車道魚津ICから約10分。",
    region: localRegion("r146"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港横に無料駐車スペースあり（15台）",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/uozu-hojo-port.jpg", images: [], rating: 3.7, reviewCount: 82,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kamasu"), monthStart: 8, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "穴釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearRock],
    safetyLevel: "safe", safetyNotes: ["足場は良好"],
    youtubeLinks: [
      { label: "魚津 釣り", searchQuery: "魚津港 釣り アジ カマス", description: "魚津港での釣り動画" },
    ],
  },
  {
    id: "s451", name: "新湊漁港東堤防", slug: "shinminato-east-breakwater",
    description: "富山湾の奥に位置する新湊漁港。シロエビやホタルイカの水揚げで有名。堤防からのアジングやキス釣りが人気で、内海のため穏やかな日が多い。",
    latitude: 36.7760, longitude: 137.1080,
    address: "富山県射水市港町",
    accessInfo: "万葉線東新湊駅から徒歩約10分。北陸自動車道小杉ICから約20分。",
    region: localRegion("r146"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/shinminato-east-breakwater.jpg", images: [], rating: 3.6, reviewCount: 76,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "アジング" },
      { fish: fish("kisu"), monthStart: 6, monthEnd: 9, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearNage],
    safetyLevel: "safe", safetyNotes: ["内海のため波は穏やか", "漁業関係者優先"],
    youtubeLinks: [
      { label: "新湊漁港 釣り", searchQuery: "新湊漁港 釣り アジ", description: "新湊漁港での釣り動画" },
    ],
  },
  {
    id: "s452", name: "黒部漁港", slug: "kurobe-gyoko",
    description: "黒部川河口近くの漁港。河口からはシーバスやヒラメが、堤防からはアジやカマスが狙える。秋のサケ遡上も見られる。",
    latitude: 36.9180, longitude: 137.4370,
    address: "富山県黒部市生地中区",
    accessInfo: "あいの風とやま鉄道生地駅から徒歩約15分。北陸自動車道黒部ICから約10分。",
    region: localRegion("r146"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港周辺に無料駐車場あり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/kurobe-gyoko.jpg", images: [], rating: 3.8, reviewCount: 68,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ルアー" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kamasu"), monthStart: 8, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki],
    safetyLevel: "caution", safetyNotes: ["河口付近は流れが速い", "テトラ帯は足元注意"],
    youtubeLinks: [
      { label: "黒部漁港 釣り", searchQuery: "黒部漁港 シーバス 釣り", description: "黒部漁港での釣り動画" },
    ],
  },

  // ========================================
  // 石川県 (4スポット)
  // ========================================
  {
    id: "s453", name: "金沢港大浜釣り護岸", slug: "kanazawa-ohama-fishing",
    description: "金沢市内からアクセス抜群の整備された釣り護岸。柵付きの護岸でファミリーに最適。アジやキスを中心に多彩な魚種が狙える。",
    latitude: 36.6120, longitude: 136.6180,
    address: "石川県金沢市大浜町",
    accessInfo: "北陸鉄道大野港バス停から徒歩約10分。北陸自動車道金沢西ICから約15分。",
    region: localRegion("r148"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "無料駐車場あり（50台）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/kanazawa-ohama-fishing.jpg", images: [], rating: 3.8, reviewCount: 158,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kisu"), monthStart: 6, monthEnd: 9, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearNage],
    safetyLevel: "safe", safetyNotes: ["柵付き護岸で安全", "駐車場・トイレ完備"],
    youtubeLinks: [
      { label: "金沢港 釣り", searchQuery: "金沢港 大浜 釣り護岸", description: "金沢港大浜釣り護岸での動画" },
    ],
  },
  {
    id: "s454", name: "能登島向田漁港", slug: "notojima-koda-port",
    description: "能登島の東側に位置する静かな漁港。クロダイやメバルの好ポイントで、エギングでアオリイカも狙える。のとじま水族館にも近い。",
    latitude: 37.1270, longitude: 136.9940,
    address: "石川県七尾市能登島向田町",
    accessInfo: "能登島大橋を渡り車で約15分。のと里山海道能登島ICすぐ。",
    region: localRegion("r148"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり（10台）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/notojima-koda-port.jpg", images: [], rating: 4.1, reviewCount: 72,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeChubu,
    gearGuides: [gearEging],
    safetyLevel: "safe", safetyNotes: ["離島のため帰路のスケジュールに注意"],
    youtubeLinks: [
      { label: "能登島 エギング", searchQuery: "能登島 エギング アオリイカ", description: "能登島でのエギング動画" },
    ],
  },
  {
    id: "s455", name: "輪島港マリンタウン", slug: "wajima-marinetown",
    description: "朝市で有名な輪島の港。奥能登の潮通しの良い海域で、根魚やイカの好ポイント。観光と組み合わせた釣行にも最適。",
    latitude: 37.3930, longitude: 136.9000,
    address: "石川県輪島市マリンタウン",
    accessInfo: "のと里山海道能登空港ICから約30分。",
    region: region("r22"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "マリンタウン無料駐車場（30台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/wajima-marinetown.jpg", images: [], rating: 3.9, reviewCount: 65,
    catchableFish: [
      { fish: fish("kasago"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "穴釣り" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeChubu,
    gearGuides: [gearRock, gearEging],
    safetyLevel: "caution", safetyNotes: ["冬場は荒天が多い", "能登地震の影響で一部立入制限あり"],
    youtubeLinks: [
      { label: "輪島港 釣り", searchQuery: "輪島港 釣り 根魚", description: "輪島港での釣り動画" },
    ],
  },
  {
    id: "s456", name: "七尾港矢田新埠頭", slug: "nanao-yatashin-wharf",
    description: "七尾湾に面した穏やかな港。アジのサビキ釣りやキスのちょい投げが中心で、初心者やファミリーに向いた釣り場。",
    latitude: 37.0490, longitude: 136.9620,
    address: "石川県七尾市矢田新町",
    accessInfo: "JR七尾線七尾駅から車で約10分。能越自動車道七尾ICから約10分。",
    region: localRegion("r148"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "埠頭に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/nanao-yatashin-wharf.jpg", images: [], rating: 3.5, reviewCount: 88,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kisu"), monthStart: 6, monthEnd: 9, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["足場良好でファミリー向け"],
    youtubeLinks: [
      { label: "七尾港 釣り", searchQuery: "七尾港 サビキ 釣り", description: "七尾港での釣り動画" },
    ],
  },

  // ========================================
  // 福井県 (4スポット)
  // ========================================
  {
    id: "s457", name: "敦賀新港", slug: "tsuruga-shinko",
    description: "北陸屈指の人気釣りスポット。広い岸壁から多彩な魚種が狙え、アジ・サバのサビキ釣りから青物のショアジギまで楽しめる。",
    latitude: 35.6590, longitude: 136.0620,
    address: "福井県敦賀市鞠山",
    accessInfo: "JR北陸本線敦賀駅から車で約10分。北陸自動車道敦賀ICから約15分。",
    region: region("r23"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "無料駐車場あり（100台以上）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/tsuruga-shinko.jpg", images: [], rating: 4.3, reviewCount: 285,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("inada"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearEging],
    safetyLevel: "safe", safetyNotes: ["広い岸壁で足場良好", "週末は混雑するので早朝到着推奨"],
    youtubeLinks: [
      { label: "敦賀新港 サビキ", searchQuery: "敦賀新港 サビキ釣り アジ", description: "敦賀新港でのサビキ釣り動画" },
    ],
  },
  {
    id: "s458", name: "三国港突堤", slug: "mikuni-tottei",
    description: "九頭竜川河口に位置する三国港。堤防先端は潮通しが良く、クロダイやシーバスの好ポイント。夕陽の名所としても有名。",
    latitude: 36.2520, longitude: 136.1480,
    address: "福井県坂井市三国町宿",
    accessInfo: "えちぜん鉄道三国港駅から徒歩約10分。北陸自動車道金津ICから約20分。",
    region: localRegion("r149"), spotType: "breakwater", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "三国サンセットビーチ駐車場あり（無料）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/mikuni-tottei.jpg", images: [], rating: 4.0, reviewCount: 128,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki],
    safetyLevel: "caution", safetyNotes: ["突堤先端は風が強い日は注意", "河口の流れに注意"],
    youtubeLinks: [
      { label: "三国港 クロダイ", searchQuery: "三国港 クロダイ フカセ", description: "三国港でのクロダイ釣り動画" },
    ],
  },
  {
    id: "s459", name: "小浜漁港", slug: "obama-gyoko",
    description: "若狭湾に面した古くからの漁港。アジやカマスが年中釣れ、秋のアオリイカシーズンは県外からも多くの釣り人が訪れる。",
    latitude: 35.4830, longitude: 135.7540,
    address: "福井県小浜市川崎3丁目",
    accessInfo: "JR小浜線小浜駅から徒歩約15分。舞鶴若狭自動車道小浜ICから約10分。",
    region: region("r23"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/obama-gyoko.jpg", images: [], rating: 4.1, reviewCount: 138,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kamasu"), monthStart: 8, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearEging],
    safetyLevel: "safe", safetyNotes: ["足場良好", "釣具店も近くにある"],
    youtubeLinks: [
      { label: "小浜漁港 エギング", searchQuery: "小浜漁港 エギング アオリイカ", description: "小浜漁港でのエギング動画" },
    ],
  },
  {
    id: "s460", name: "越前漁港", slug: "echizen-gyoko",
    description: "越前がにで有名な漁港。冬季のカニ漁で賑わうが、春から秋はアジやイカの好釣り場。磯場も近く多彩な釣りが楽しめる。",
    latitude: 35.9720, longitude: 135.9580,
    address: "福井県丹生郡越前町厨",
    accessInfo: "福井鉄道武生駅から車で約30分。北陸自動車道鯖江ICから約40分。",
    region: localRegion("r149"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車場あり（30台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/echizen-gyoko.jpg", images: [], rating: 4.0, reviewCount: 95,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "穴釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeChubu,
    gearGuides: [gearSabiki, gearEging, gearRock],
    safetyLevel: "caution", safetyNotes: ["磯場は滑りやすいので磯靴推奨", "冬場は日本海の荒波に注意"],
    youtubeLinks: [
      { label: "越前漁港 釣り", searchQuery: "越前漁港 釣り エギング", description: "越前漁港での釣り動画" },
    ],
  },
];
