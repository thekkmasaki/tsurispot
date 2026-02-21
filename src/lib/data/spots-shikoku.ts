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

const shikokuRegions: Region[] = [
  { id: "r150", prefecture: "香川県", areaName: "詫間", slug: "kagawa-takuma" },
  { id: "r151", prefecture: "徳島県", areaName: "小松島", slug: "tokushima-komatsushima" },
  { id: "r152", prefecture: "高知県", areaName: "宿毛", slug: "kochi-sukumo" },
  { id: "r153", prefecture: "高知県", areaName: "桂浜", slug: "kochi-katsurahama" },
  { id: "r154", prefecture: "愛媛県", areaName: "今治", slug: "ehime-imabari" },
  { id: "r155", prefecture: "愛媛県", areaName: "佐田岬", slug: "ehime-sadamisaki" },
];

function localRegion(id: string) {
  return shikokuRegions.find((r) => r.id === id) || region(id);
}

const mazumeShikoku = { springSunrise: "5:40頃", springSunset: "18:20頃", summerSunrise: "5:00頃", summerSunset: "19:10頃", autumnSunrise: "5:40頃", autumnSunset: "17:30頃", winterSunrise: "6:50頃", winterSunset: "17:00頃", tip: "朝マヅメは日の出前後1時間が最も活性が上がります。" };

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
const gearEging = { targetFish: "アオリイカ", method: "エギング", difficulty: "intermediate" as const, rod: "エギングロッド 8.6ft ML", reel: "スピニングリール 2500番", line: "PE 0.6号", hook: "エギ 3〜3.5号", otherItems: ["リーダー フロロ2号", "ギャフ", "イカ締めピック"], tip: "秋は3号、春は3.5号のエギがおすすめ。ボトムをしっかり取ること。" };
const gearNage = { targetFish: "キス・カレイ", method: "投げ釣り", difficulty: "beginner" as const, rod: "投げ竿 3.9〜4.25m", reel: "スピニングリール 3000〜4000番", line: "ナイロン4号", hook: "流線針 7〜9号", otherItems: ["天秤オモリ 20〜25号", "青イソメ", "竿立て"], tip: "エサはイソメを房掛けにすると大型が食ってきます。" };
const gearRock = { targetFish: "カサゴ・メバル", method: "穴釣り・根魚釣り", difficulty: "beginner" as const, rod: "穴釣りロッド 1.1〜1.5m", reel: "小型両軸リール", line: "フロロ3号", hook: "ブラクリ 3〜5号", otherItems: ["アオイソメ", "サバの切り身"], tip: "テトラの隙間に落とし込み、底に着いたら少し持ち上げて待つ。" };

export const shikokuSpots: FishingSpot[] = [
  // ========================================
  // 香川県 (5スポット)
  // ========================================
  {
    id: "s461", name: "高松港玉藻公園前", slug: "takamatsu-tamamo-park",
    description: "高松市中心部の海に面した釣りスポット。玉藻公園と栗林公園の間に位置し、観光と釣りを同時に楽しめる。チヌやメバルが通年で狙える。",
    latitude: 34.3510, longitude: 134.0480,
    address: "香川県高松市玉藻町",
    accessInfo: "JR高松駅から徒歩約10分。高松自動車道高松中央ICから約15分。",
    region: region("r30"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "周辺コインパーキングあり（300円/時）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/takamatsu-tamamo-park.jpg", images: [], rating: 3.7, reviewCount: 135,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["観光客も多いのでマナーに注意", "都市部で施設充実"],
    youtubeLinks: [
      { label: "高松港 チヌ", searchQuery: "高松港 チヌ クロダイ 釣り", description: "高松港でのチヌ釣り動画" },
    ],
  },
  {
    id: "s462", name: "詫間港", slug: "takuma-port",
    description: "瀬戸内海の穏やかな海に面した港。タチウオの接岸が早く、夏から秋の夜釣りが特に人気。キスの投げ釣りも好調。",
    latitude: 34.2230, longitude: 133.6520,
    address: "香川県三豊市詫間町詫間",
    accessInfo: "JR予讃線詫間駅から徒歩約20分。高松自動車道三豊鳥坂ICから約15分。",
    region: localRegion("r150"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/takuma-port.jpg", images: [], rating: 3.8, reviewCount: 92,
    catchableFish: [
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki, gearNage],
    safetyLevel: "safe", safetyNotes: ["穏やかな海で安全"],
    youtubeLinks: [
      { label: "詫間港 タチウオ", searchQuery: "詫間港 タチウオ 夜釣り", description: "詫間港でのタチウオ釣り動画" },
    ],
  },
  {
    id: "s463", name: "坂出港番の州", slug: "sakaide-bannosu",
    description: "瀬戸大橋のたもとに位置する埋立地の釣りスポット。広い護岸でサビキ釣りやタチウオの夜釣りが人気。瀬戸大橋の絶景ポイント。",
    latitude: 34.3060, longitude: 133.8350,
    address: "香川県坂出市番の州緑町",
    accessInfo: "JR坂出駅から車で約10分。瀬戸中央自動車道坂出ICから約5分。",
    region: localRegion("r150"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "護岸沿いに無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/sakaide-bannosu.jpg", images: [], rating: 3.6, reviewCount: 108,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["護岸は広く安全", "夜釣りはヘッドライト必携"],
    youtubeLinks: [
      { label: "坂出 サビキ", searchQuery: "坂出港 番の州 サビキ 釣り", description: "坂出港番の州での釣り動画" },
    ],
  },
  {
    id: "s464", name: "丸亀港", slug: "marugame-port",
    description: "丸亀城の城下町に位置する港。堤防からチヌやメバルが安定して釣れ、うどん巡りの合間に気軽に楽しめる。",
    latitude: 34.2840, longitude: 133.7960,
    address: "香川県丸亀市港町",
    accessInfo: "JR予讃線丸亀駅から徒歩約15分。高松自動車道坂出ICから約10分。",
    region: localRegion("r150"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/marugame-port.jpg", images: [], rating: 3.5, reviewCount: 85,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["足場良好", "うどん店が近くに多数"],
    youtubeLinks: [
      { label: "丸亀港 釣り", searchQuery: "丸亀港 チヌ 釣り", description: "丸亀港での釣り動画" },
    ],
  },
  {
    id: "s465", name: "小豆島土庄港", slug: "shodoshima-tonosho-port",
    description: "瀬戸内海の小豆島・土庄港。離島ならではの魚影の濃さが魅力。アジやメバル、チヌが安定して釣れ、オリーブの島観光と合わせて楽しめる。",
    latitude: 34.4870, longitude: 134.1820,
    address: "香川県小豆郡土庄町甲",
    accessInfo: "高松港からフェリーで約60分。土庄港下船すぐ。",
    region: region("r30"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/shodoshima-tonosho-port.jpg", images: [], rating: 4.0, reviewCount: 72,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
      { fish: fish("kurodai"), monthStart: 3, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["フェリー時刻に注意", "離島のため釣具は事前準備"],
    youtubeLinks: [
      { label: "小豆島 釣り", searchQuery: "小豆島 土庄港 釣り", description: "小豆島での釣り動画" },
    ],
  },

  // ========================================
  // 徳島県 (4スポット)
  // ========================================
  {
    id: "s466", name: "鳴門海峡ウチノ海", slug: "naruto-uchinoumi-fishing",
    description: "鳴門海峡に近い穏やかな内海。潮通しの良さから多彩な魚種が集まり、タチウオやアジ、メバルが好調。大鳴門橋を望む絶景ポイント。",
    latitude: 34.1820, longitude: 134.6180,
    address: "徳島県鳴門市鳴門町土佐泊浦",
    accessInfo: "JR鳴門線鳴門駅から車で約15分。神戸淡路鳴門自動車道鳴門北ICから約5分。",
    region: region("r29"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "周辺に無料駐車場あり（20台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/naruto-uchinoumi-fishing.jpg", images: [], rating: 4.0, reviewCount: 115,
    catchableFish: [
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["鳴門海峡の潮流は非常に速いので海峡側には入らない"],
    youtubeLinks: [
      { label: "鳴門 タチウオ", searchQuery: "鳴門 タチウオ 夜釣り", description: "鳴門でのタチウオ釣り動画" },
    ],
  },
  {
    id: "s467", name: "小松島港", slug: "komatsushima-port",
    description: "徳島県南部の主要港。広い岸壁からサビキ釣りやちょい投げが楽しめ、アジやハゼが安定して釣れる。ファミリーにも人気。",
    latitude: 34.0010, longitude: 134.5910,
    address: "徳島県小松島市小松島町",
    accessInfo: "JR牟岐線中田駅から車で約10分。徳島自動車道徳島ICから約20分。",
    region: localRegion("r151"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/komatsushima-port.jpg", images: [], rating: 3.6, reviewCount: 95,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki, gearNage],
    safetyLevel: "safe", safetyNotes: ["足場良好でファミリー向け"],
    youtubeLinks: [
      { label: "小松島港 釣り", searchQuery: "小松島港 サビキ 釣り", description: "小松島港での釣り動画" },
    ],
  },
  {
    id: "s468", name: "阿南市蒲生田岬", slug: "anan-gamoda-cape",
    description: "四国最東端の岬。太平洋に面した磯場で、グレやイシダイなどの磯釣りの聖地。潮通しが抜群で大物が期待できる。",
    latitude: 33.8380, longitude: 134.7530,
    address: "徳島県阿南市椿町蒲生田",
    accessInfo: "JR牟岐線阿南駅から車で約50分。徳島自動車道徳島ICから約90分。",
    region: localRegion("r151"), spotType: "rocky", difficulty: "advanced",
    isFree: true, hasParking: true, parkingDetail: "岬駐車場あり（無料・10台）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/anan-gamoda-cape.jpg", images: [], rating: 4.3, reviewCount: 62,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("ishidai"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "石鯛仕掛け" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeShikoku,
    gearGuides: [gearEging],
    safetyLevel: "danger", safetyNotes: ["磯靴・ライフジャケット必須", "荒天時は絶対に入らない", "一人での釣行は避ける"],
    youtubeLinks: [
      { label: "蒲生田岬 磯釣り", searchQuery: "蒲生田岬 磯釣り グレ", description: "蒲生田岬での磯釣り動画" },
    ],
  },
  {
    id: "s469", name: "徳島港沖洲", slug: "tokushima-okisu",
    description: "徳島市内からアクセス良好な港。マリンピア沖洲に隣接し、サビキ釣りやシーバス狙いのルアーが楽しめる都市型スポット。",
    latitude: 34.0640, longitude: 134.5750,
    address: "徳島県徳島市東沖洲",
    accessInfo: "JR徳島駅から車で約15分。徳島自動車道徳島ICから約15分。",
    region: region("r29"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "周辺に無料駐車スペースあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/tokushima-okisu.jpg", images: [], rating: 3.5, reviewCount: 108,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["足場良好", "駐車場・施設充実"],
    youtubeLinks: [
      { label: "徳島港 シーバス", searchQuery: "徳島港 沖洲 シーバス ルアー", description: "徳島港でのシーバス釣り動画" },
    ],
  },

  // ========================================
  // 高知県 (5スポット)
  // ========================================
  {
    id: "s470", name: "須崎港新荘川河口", slug: "susaki-shinjo-river",
    description: "最後のニホンカワウソが目撃された新荘川の河口。シーバスやチヌの好ポイントで、須崎の鍋焼きラーメンと合わせて楽しめる。",
    latitude: 33.3930, longitude: 133.2810,
    address: "高知県須崎市浜町",
    accessInfo: "JR土讃線須崎駅から徒歩約10分。高知自動車道須崎東ICから約10分。",
    region: localRegion("r152"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "河川敷に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/susaki-shinjo-river.jpg", images: [], rating: 3.8, reviewCount: 72,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ルアー" },
      { fish: fish("kurodai"), monthStart: 3, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "caution", safetyNotes: ["河口は流れが速い時がある", "増水時は釣りを控える"],
    youtubeLinks: [
      { label: "須崎 シーバス", searchQuery: "須崎港 シーバス 釣り", description: "須崎港でのシーバス釣り動画" },
    ],
  },
  {
    id: "s471", name: "宿毛湾", slug: "sukumo-bay",
    description: "四国南西端の深い入江。黒潮の影響で魚種が豊富。グレやイサギの磯釣りから、湾内でのアジ釣りまで幅広く楽しめる。",
    latitude: 32.9380, longitude: 132.6930,
    address: "高知県宿毛市大島",
    accessInfo: "土佐くろしお鉄道宿毛駅から車で約15分。高知自動車道四万十町中央ICから約90分。",
    region: localRegion("r152"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/sukumo-bay.jpg", images: [], rating: 4.2, reviewCount: 68,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("aji"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki, gearEging],
    safetyLevel: "caution", safetyNotes: ["磯場は足元注意", "遠方のためガソリンや食料は事前確保"],
    youtubeLinks: [
      { label: "宿毛湾 釣り", searchQuery: "宿毛湾 磯釣り グレ", description: "宿毛湾での釣り動画" },
    ],
  },
  {
    id: "s472", name: "桂浜近く種崎漁港", slug: "katsurahama-tanezaki",
    description: "坂本龍馬像で有名な桂浜の近く。浦戸湾の入口に位置し、シーバスやチヌが安定して釣れる。観光と釣りの両立が可能。",
    latitude: 33.5190, longitude: 133.5720,
    address: "高知県高知市種崎",
    accessInfo: "JR高知駅から車で約25分。高知自動車道高知ICから約20分。",
    region: localRegion("r153"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/katsurahama-tanezaki.jpg", images: [], rating: 3.7, reviewCount: 82,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("kurodai"), monthStart: 3, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["桂浜観光と合わせて楽しめる"],
    youtubeLinks: [
      { label: "桂浜 釣り", searchQuery: "桂浜 種崎 シーバス 釣り", description: "桂浜周辺での釣り動画" },
    ],
  },
  {
    id: "s473", name: "土佐清水市以布利港", slug: "tosashimizu-iburi",
    description: "足摺岬の手前に位置する小さな漁港。ジンベイザメの研究施設がある。磯が近く、グレやイシダイの好ポイント。黒潮の恵みで魚影が濃い。",
    latitude: 32.7870, longitude: 132.9430,
    address: "高知県土佐清水市以布利",
    accessInfo: "土佐くろしお鉄道中村駅から車で約40分。",
    region: region("r59"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港内に駐車可（5台程度）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/tosashimizu-iburi.jpg", images: [], rating: 4.1, reviewCount: 55,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("aoriika"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "穴釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeShikoku,
    gearGuides: [gearEging, gearRock],
    safetyLevel: "caution", safetyNotes: ["磯場は足元注意", "遠方のため食料・燃料は事前準備"],
    youtubeLinks: [
      { label: "土佐清水 磯釣り", searchQuery: "土佐清水 以布利 磯釣り グレ", description: "土佐清水での磯釣り動画" },
    ],
  },
  {
    id: "s474", name: "高知港弘化台", slug: "kochi-kokadai",
    description: "高知市内の中央卸売市場に隣接する護岸。市場の新鮮な朝食を楽しんだ後に釣りができる。チヌやシーバスの都市型ポイント。",
    latitude: 33.5410, longitude: 133.5430,
    address: "高知県高知市弘化台",
    accessInfo: "JR高知駅から車で約10分。高知自動車道高知ICから約15分。",
    region: localRegion("r153"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "市場駐車場あり（早朝は混雑）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/kochi-kokadai.jpg", images: [], rating: 3.5, reviewCount: 92,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "落とし込み" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["市場関係者の邪魔にならないよう注意"],
    youtubeLinks: [
      { label: "高知港 チヌ", searchQuery: "高知港 弘化台 チヌ 落とし込み", description: "高知港でのチヌ釣り動画" },
    ],
  },

  // ========================================
  // 愛媛県 (5スポット)
  // ========================================
  {
    id: "s475", name: "今治港", slug: "imabari-port",
    description: "しまなみ海道の四国側玄関口。瀬戸内海の潮流が速く、タイやアジの好ポイント。造船の街ならではの岸壁釣りが楽しめる。",
    latitude: 34.0650, longitude: 132.9930,
    address: "愛媛県今治市片原町1丁目",
    accessInfo: "JR予讃線今治駅から徒歩約15分。西瀬戸自動車道今治ICから約10分。",
    region: localRegion("r154"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺にコインパーキングあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/imabari-port.jpg", images: [], rating: 3.8, reviewCount: 128,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("madai"), monthStart: 3, monthEnd: 5, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "カゴ釣り" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["瀬戸内海の潮流に注意", "船の往来に注意"],
    youtubeLinks: [
      { label: "今治港 釣り", searchQuery: "今治港 アジ サビキ 釣り", description: "今治港での釣り動画" },
    ],
  },
  {
    id: "s476", name: "松山外港", slug: "matsuyama-gaiko",
    description: "道後温泉の街・松山の外港。広い岸壁でファミリーフィッシングに最適。アジやイワシのサビキ釣りが中心で、秋はタチウオも。",
    latitude: 33.8590, longitude: 132.7090,
    address: "愛媛県松山市海岸通",
    accessInfo: "伊予鉄道三津駅から徒歩約10分。松山自動車道松山ICから約20分。",
    region: region("r31"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/matsuyama-gaiko.jpg", images: [], rating: 3.6, reviewCount: 145,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["足場良好でファミリー向け", "道後温泉と合わせて楽しめる"],
    youtubeLinks: [
      { label: "松山外港 釣り", searchQuery: "松山外港 サビキ 釣り", description: "松山外港での釣り動画" },
    ],
  },
  {
    id: "s477", name: "宇和島港", slug: "uwajima-port-fishing",
    description: "真珠養殖と闘牛で有名な宇和島の港。宇和海に面し、グレやアジの好ポイント。九島大橋周辺は根魚も豊富。",
    latitude: 33.2270, longitude: 132.5590,
    address: "愛媛県宇和島市住吉町",
    accessInfo: "JR予讃線宇和島駅から徒歩約10分。松山自動車道宇和島朝日ICから約5分。",
    region: localRegion("r154"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/uwajima-port-fishing.jpg", images: [], rating: 3.9, reviewCount: 88,
    catchableFish: [
      { fish: fish("aji"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki, gearEging],
    safetyLevel: "safe", safetyNotes: ["足場良好", "鯛めしの名店が多い"],
    youtubeLinks: [
      { label: "宇和島 エギング", searchQuery: "宇和島港 エギング アオリイカ", description: "宇和島港でのエギング動画" },
    ],
  },
  {
    id: "s478", name: "佐田岬半島三崎港", slug: "sadamisaki-misaki-port",
    description: "四国最西端・佐田岬半島の先端に近い港。九州に最も近い四国の地で、潮通し抜群。アジやブリなどの青物が期待できる。",
    latitude: 33.3530, longitude: 132.0870,
    address: "愛媛県西宇和郡伊方町三崎",
    accessInfo: "JR八幡浜駅から車で約50分。松山自動車道大洲ICから約70分。",
    region: localRegion("r155"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/sadamisaki-misaki-port.jpg", images: [], rating: 4.2, reviewCount: 62,
    catchableFish: [
      { fish: fish("aji"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("buri"), monthStart: 10, monthEnd: 1, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
      { fish: fish("aoriika"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki, gearEging],
    safetyLevel: "caution", safetyNotes: ["半島先端は風が強い", "遠方のため計画的な釣行を"],
    youtubeLinks: [
      { label: "佐田岬 釣り", searchQuery: "佐田岬 三崎港 釣り 青物", description: "佐田岬三崎港での釣り動画" },
    ],
  },
  {
    id: "s479", name: "八幡浜港", slug: "yawatahama-port-fishing",
    description: "愛媛県南部の主要港。九州へのフェリーが発着する港で、アジやタチウオが安定して釣れる。「八幡浜ちゃんぽん」も名物。",
    latitude: 33.4620, longitude: 132.4240,
    address: "愛媛県八幡浜市沖新田",
    accessInfo: "JR予讃線八幡浜駅から徒歩約10分。松山自動車道大洲ICから約30分。",
    region: localRegion("r155"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/yawatahama-port-fishing.jpg", images: [], rating: 3.7, reviewCount: 95,
    catchableFish: [
      { fish: fish("aji"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ" },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "穴釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeShikoku,
    gearGuides: [gearSabiki, gearRock],
    safetyLevel: "safe", safetyNotes: ["フェリーの発着時は周辺に注意", "足場良好"],
    youtubeLinks: [
      { label: "八幡浜 タチウオ", searchQuery: "八幡浜港 タチウオ 夜釣り", description: "八幡浜港でのタチウオ釣り動画" },
    ],
  },
];
