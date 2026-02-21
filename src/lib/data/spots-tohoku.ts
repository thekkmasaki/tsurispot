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

const tohokuRegions: Region[] = [
  { id: "r138", prefecture: "青森県", areaName: "陸奥湾", slug: "aomori-mutsu" },
  { id: "r139", prefecture: "青森県", areaName: "大間", slug: "aomori-oma" },
  { id: "r140", prefecture: "岩手県", areaName: "久慈", slug: "iwate-kuji" },
  { id: "r141", prefecture: "秋田県", areaName: "能代", slug: "akita-noshiro" },
  { id: "r142", prefecture: "山形県", areaName: "鼠ヶ関", slug: "yamagata-nezugaseki" },
  { id: "r143", prefecture: "福島県", areaName: "相馬新地", slug: "fukushima-soma-shinchi" },
  { id: "r144", prefecture: "宮城県", areaName: "女川", slug: "miyagi-onagawa" },
  { id: "r145", prefecture: "宮城県", areaName: "石巻", slug: "miyagi-ishinomaki" },
];

function localRegion(id: string) {
  return tohokuRegions.find((r) => r.id === id) || region(id);
}

const mazumeTohoku = { springSunrise: "5:10頃", springSunset: "18:10頃", summerSunrise: "4:10頃", summerSunset: "19:00頃", autumnSunrise: "5:20頃", autumnSunset: "17:20頃", winterSunrise: "6:40頃", winterSunset: "16:20頃", tip: "朝マヅメは日の出前後1時間が最も活性が上がります。" };

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
const gearRock = { targetFish: "カサゴ・メバル", method: "穴釣り・根魚釣り", difficulty: "beginner" as const, rod: "穴釣りロッド 1.1〜1.5m", reel: "小型両軸リール", line: "フロロ3号", hook: "ブラクリ 3〜5号", otherItems: ["アオイソメ", "サバの切り身"], tip: "テトラの隙間に落とし込み、底に着いたら少し持ち上げて待つ。" };

export const tohokuSpots: FishingSpot[] = [
  // ========================================
  // 青森県 (5スポット)
  // ========================================
  {
    id: "s421", name: "陸奥湾平内町", slug: "mutsu-bay-hiranai",
    description: "陸奥湾に面した穏やかな漁港。ホタテの養殖が盛んなエリアで、カレイやアイナメなどの根魚が安定して釣れる。冬場のヤリイカも人気。",
    latitude: 40.9280, longitude: 140.9560,
    address: "青森県東津軽郡平内町浜子",
    accessInfo: "JR青い森鉄道小湊駅から車で約5分。青森市街から国道4号経由で約40分。",
    region: localRegion("r138"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり（10台）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/mutsu-bay-hiranai.jpg", images: [], rating: 3.7, reviewCount: 65,
    catchableFish: [
      { fish: fish("karei"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
      { fish: fish("ainame"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("yariika"), monthStart: 12, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "エギング" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearNage, gearRock],
    safetyLevel: "safe", safetyNotes: ["冬場は路面凍結注意", "防寒対策必須"],
    youtubeLinks: [
      { label: "陸奥湾 カレイ釣り", searchQuery: "陸奥湾 カレイ 投げ釣り", description: "陸奥湾でのカレイ投げ釣り動画" },
    ],
  },
  {
    id: "s422", name: "大間崎", slug: "omazaki",
    description: "本州最北端の地。マグロで有名だが、堤防からもアイナメやソイなどの根魚が豊富。潮通しが良く大型の回遊魚も期待できる。",
    latitude: 41.5430, longitude: 140.9110,
    address: "青森県下北郡大間町大間大間平",
    accessInfo: "JR下北駅から車で約90分。フェリーで函館から約90分。",
    region: localRegion("r139"), spotType: "rocky", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "大間崎無料駐車場（30台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/omazaki.jpg", images: [], rating: 4.1, reviewCount: 89,
    catchableFish: [
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("kurosoi"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ワーム" },
      { fish: fish("karei"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
      { fish: fish("inada"), monthStart: 8, monthEnd: 10, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeTohoku,
    gearGuides: [gearRock],
    safetyLevel: "caution", safetyNotes: ["磯場は滑りやすいため磯靴必須", "風が強い日は特に注意"],
    youtubeLinks: [
      { label: "大間崎 釣り", searchQuery: "大間崎 釣り ロックフィッシュ", description: "本州最北端での釣り動画" },
    ],
  },
  {
    id: "s423", name: "八戸港フェリーターミナル", slug: "hachinohe-ferry-terminal",
    description: "八戸港のフェリーターミナル周辺は足場が良く、サバやイワシのサビキ釣りからシーバスまで多彩な魚種が狙える。夜釣りも人気。",
    latitude: 40.5350, longitude: 141.5340,
    address: "青森県八戸市新湊3丁目",
    accessInfo: "JR八戸線本八戸駅から車で約15分。八戸自動車道八戸ICから約20分。",
    region: region("r18"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "無料駐車場あり（50台以上）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/hachinohe-ferry-terminal.jpg", images: [], rating: 4.0, reviewCount: 156,
    catchableFish: [
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("iwashi"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki, gearNage],
    safetyLevel: "safe", safetyNotes: ["フェリー運航時は周辺に注意", "柵がない箇所あり"],
    youtubeLinks: [
      { label: "八戸港 サビキ釣り", searchQuery: "八戸港 サビキ釣り サバ", description: "八戸港でのサビキ釣り動画" },
    ],
  },
  {
    id: "s424", name: "青森港北防波堤", slug: "aomori-kita-breakwater",
    description: "青森市内からアクセス良好な釣りスポット。堤防からサビキ釣りやちょい投げが楽しめ、夏はサバ、冬はカレイが主なターゲット。",
    latitude: 40.8390, longitude: 140.7540,
    address: "青森県青森市安方1丁目",
    accessInfo: "JR青森駅から徒歩約20分。青森ICから約15分。",
    region: localRegion("r138"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "周辺コインパーキングあり（500円/日）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/aomori-kita-breakwater.jpg", images: [], rating: 3.6, reviewCount: 98,
    catchableFish: [
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["足場は比較的良好", "冬場は凍結注意"],
    youtubeLinks: [
      { label: "青森港 釣り", searchQuery: "青森港 堤防 釣り", description: "青森港堤防での釣り動画" },
    ],
  },
  {
    id: "s425", name: "鰺ヶ沢漁港", slug: "ajigasawa-port",
    description: "日本海に面した津軽の漁港。アジやメバルが通年で狙え、夏のイカ釣りも盛ん。白神山地を望む絶景ポイント。",
    latitude: 40.7780, longitude: 140.2120,
    address: "青森県西津軽郡鰺ヶ沢町本町",
    accessInfo: "JR五能線鰺ヶ沢駅から徒歩約15分。",
    region: localRegion("r138"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/ajigasawa-port.jpg", images: [], rating: 3.8, reviewCount: 72,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
      { fish: fish("surumeika"), monthStart: 7, monthEnd: 9, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "エギング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["夜釣り時はヘッドライト必携"],
    youtubeLinks: [
      { label: "鰺ヶ沢 釣り", searchQuery: "鰺ヶ沢漁港 釣り アジ", description: "鰺ヶ沢漁港での釣り動画" },
    ],
  },

  // ========================================
  // 岩手県 (4スポット)
  // ========================================
  {
    id: "s426", name: "宮古港閉伊川河口", slug: "miyako-heigawa-mouth",
    description: "閉伊川が宮古湾に注ぐ河口域。シーバスやヒラメの好ポイントで、秋にはサケの遡上も見られる。護岸が整備され足場良好。",
    latitude: 39.6410, longitude: 141.9620,
    address: "岩手県宮古市藤原",
    accessInfo: "JR山田線宮古駅から車で約5分。宮古ICから約10分。",
    region: region("r19"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "河川敷に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/miyako-heigawa-mouth.jpg", images: [], rating: 3.9, reviewCount: 83,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ルアー" },
      { fish: fish("hirame"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "泳がせ釣り" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearNage],
    safetyLevel: "caution", safetyNotes: ["増水時は釣りを控えること", "河口は流れが速いので注意"],
    youtubeLinks: [
      { label: "宮古 シーバス", searchQuery: "宮古港 シーバス ルアー", description: "宮古港周辺でのシーバス釣り動画" },
    ],
  },
  {
    id: "s427", name: "釜石港大防波堤", slug: "kamaishi-breakwater",
    description: "三陸リアス海岸の釜石港。世界遺産の製鉄所に隣接する大防波堤は、根魚やカレイの好ポイント。秋にはイナダの回遊も。",
    latitude: 39.2680, longitude: 141.8920,
    address: "岩手県釜石市港町1丁目",
    accessInfo: "JR釜石線釜石駅から徒歩約20分。釜石自動車道釜石ICから約10分。",
    region: localRegion("r140"), spotType: "breakwater", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/kamaishi-breakwater.jpg", images: [], rating: 4.0, reviewCount: 91,
    catchableFish: [
      { fish: fish("kasago"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "穴釣り" },
      { fish: fish("ainame"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("inada"), monthStart: 8, monthEnd: 11, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeTohoku,
    gearGuides: [gearRock, gearNage],
    safetyLevel: "caution", safetyNotes: ["防波堤先端は風が強い", "テトラ帯は足場注意"],
    youtubeLinks: [
      { label: "釜石港 釣り", searchQuery: "釜石港 根魚 ロックフィッシュ", description: "釜石港での根魚釣り動画" },
    ],
  },
  {
    id: "s428", name: "久慈港", slug: "kuji-port",
    description: "あまちゃんの舞台として知られる久慈市の港。ウニだけでなく釣りも楽しめ、アイナメやソイなどの根魚が豊富。",
    latitude: 40.1930, longitude: 141.7830,
    address: "岩手県久慈市中央2丁目",
    accessInfo: "JR八戸線久慈駅から徒歩約15分。",
    region: localRegion("r140"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/kuji-port.jpg", images: [], rating: 3.7, reviewCount: 68,
    catchableFish: [
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("kurosoi"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ワーム" },
      { fish: fish("iwashi"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeTohoku,
    gearGuides: [gearRock, gearSabiki],
    safetyLevel: "safe", safetyNotes: ["足場良好でファミリーにも適する"],
    youtubeLinks: [
      { label: "久慈港 釣り", searchQuery: "久慈港 釣り アイナメ", description: "久慈港での釣り動画" },
    ],
  },

  // ========================================
  // 秋田県 (4スポット)
  // ========================================
  {
    id: "s430", name: "男鹿半島加茂漁港", slug: "oga-kamo-port",
    description: "男鹿半島西側に位置する小さな漁港。テトラ帯でメバルやカサゴが安定して釣れ、夏場はアジのサビキ釣りも好調。男鹿の絶景を楽しみながら釣りができる。",
    latitude: 39.9180, longitude: 139.7680,
    address: "秋田県男鹿市戸賀加茂青砂",
    accessInfo: "JR男鹿線男鹿駅から車で約30分。秋田自動車道昭和男鹿半島ICから約60分。",
    region: region("r36"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港横に無料駐車スペースあり（10台）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/oga-kamo-port.jpg", images: [], rating: 4.0, reviewCount: 82,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
      { fish: fish("kasago"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "穴釣り" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kurodai"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeTohoku,
    gearGuides: [gearRock, gearSabiki],
    safetyLevel: "caution", safetyNotes: ["テトラ帯は足場が悪い", "冬場は日本海側のため風雪に注意"],
    youtubeLinks: [
      { label: "男鹿半島 メバリング", searchQuery: "男鹿半島 メバリング メバル", description: "男鹿半島でのメバリング動画" },
    ],
  },
  {
    id: "s431", name: "秋田港セリオン前", slug: "akita-port-selion",
    description: "秋田港のランドマーク・セリオンタワー前の護岸。足場が整備されファミリーに最適。ハゼやシーバスが狙える都市型釣りスポット。",
    latitude: 39.7750, longitude: 140.0560,
    address: "秋田県秋田市土崎港西1丁目",
    accessInfo: "JR土崎駅から徒歩約20分。秋田自動車道秋田北ICから約10分。",
    region: localRegion("r141"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "セリオン無料駐車場（100台以上）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/akita-port-selion.jpg", images: [], rating: 3.5, reviewCount: 120,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("iwashi"), monthStart: 6, monthEnd: 9, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["護岸は柵付きで安全", "駐車場・トイレ完備"],
    youtubeLinks: [
      { label: "秋田港 ハゼ釣り", searchQuery: "秋田港 ハゼ ちょい投げ", description: "秋田港でのハゼ釣り動画" },
    ],
  },
  {
    id: "s432", name: "にかほ市金浦漁港", slug: "nikaho-konoura-port",
    description: "鳥海山を背景にした日本海の漁港。アジやメバルの好ポイントで、秋のイナダ回遊時はショアジギングファンで賑わう。",
    latitude: 39.2280, longitude: 139.9060,
    address: "秋田県にかほ市金浦",
    accessInfo: "JR金浦駅から徒歩約10分。日本海東北道にかほICから約10分。",
    region: localRegion("r141"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/nikaho-konoura-port.jpg", images: [], rating: 3.9, reviewCount: 74,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "メバリング" },
      { fish: fish("inada"), monthStart: 8, monthEnd: 11, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["足場は比較的良好"],
    youtubeLinks: [
      { label: "にかほ 釣り", searchQuery: "にかほ市 漁港 釣り", description: "にかほ市周辺での釣り動画" },
    ],
  },
  {
    id: "s433", name: "能代港", slug: "noshiro-port",
    description: "米代川河口に位置する能代港。シーバスの聖地として知られ、秋のハタハタ接岸時期は特に賑わう。河口ならではの多彩な魚種が魅力。",
    latitude: 40.2130, longitude: 140.0210,
    address: "秋田県能代市大森山",
    accessInfo: "JR五能線能代駅から車で約10分。秋田自動車道能代東ICから約15分。",
    region: localRegion("r141"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/noshiro-port.jpg", images: [], rating: 3.8, reviewCount: 92,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ルアー" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("hirame"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "caution", safetyNotes: ["河口付近は流れが強い", "夜釣りは足元に注意"],
    youtubeLinks: [
      { label: "能代港 シーバス", searchQuery: "能代港 シーバス ルアー 米代川", description: "能代港でのシーバス釣り動画" },
    ],
  },

  // ========================================
  // 宮城県 (4スポット)
  // ========================================
  {
    id: "s434", name: "女川港", slug: "onagawa-port",
    description: "三陸の漁師町・女川の港。リアス海岸で水深があり、根魚やカレイの宝庫。復興後の整備された岸壁は足場も良い。",
    latitude: 38.4460, longitude: 141.4460,
    address: "宮城県牡鹿郡女川町女川浜",
    accessInfo: "JR石巻線女川駅から徒歩約10分。三陸自動車道石巻女川ICから約15分。",
    region: localRegion("r144"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "駅前無料駐車場あり（30台）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/onagawa-port.jpg", images: [], rating: 3.9, reviewCount: 88,
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearNage, gearRock],
    safetyLevel: "safe", safetyNotes: ["整備された護岸で安全", "冬は防寒対策必須"],
    youtubeLinks: [
      { label: "女川港 カレイ", searchQuery: "女川港 カレイ 投げ釣り", description: "女川港でのカレイ釣り動画" },
    ],
  },
  {
    id: "s435", name: "塩釜港マリンゲート前", slug: "shiogama-marinegate",
    description: "松島観光の玄関口にある塩釜港。岸壁からサビキ釣りやちょい投げが楽しめ、観光のついでに気軽に釣りができる。",
    latitude: 38.3190, longitude: 141.0240,
    address: "宮城県塩竈市港町1丁目",
    accessInfo: "JR仙石線本塩釜駅から徒歩約10分。三陸自動車道利府塩釜ICから約15分。",
    region: region("r2"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "マリンゲート駐車場あり（有料300円/回）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/shiogama-marinegate.jpg", images: [], rating: 3.6, reviewCount: 145,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("iwashi"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["観光客も多いのでマナーに注意", "足場良好"],
    youtubeLinks: [
      { label: "塩釜港 ハゼ", searchQuery: "塩釜港 ハゼ釣り ちょい投げ", description: "塩釜港でのハゼ釣り動画" },
    ],
  },
  {
    id: "s436", name: "仙台新港", slug: "sendai-shinko",
    description: "仙台市から最も近い本格的釣りスポット。サーフからのヒラメ・マゴチが名物で、堤防からはサビキ釣りやシーバスも楽しめる。",
    latitude: 38.2780, longitude: 141.0050,
    address: "宮城県仙台市宮城野区港4丁目",
    accessInfo: "JR仙石線中野栄駅から車で約10分。仙台東部道路仙台港ICすぐ。",
    region: region("r2"), spotType: "beach", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "無料駐車場あり（50台以上）",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/sendai-shinko.jpg", images: [], rating: 4.2, reviewCount: 210,
    catchableFish: [
      { fish: fish("hirame"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("magochi"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ルアー" },
      { fish: fish("kisu"), monthStart: 6, monthEnd: 9, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: { bestTide: "大潮・中潮", bestTidePhase: "下げ始め", description: "下げ潮で砂浜の払い出しにベイトが集まります。" },
    mazumeInfo: mazumeTohoku,
    gearGuides: [gearNage],
    safetyLevel: "caution", safetyNotes: ["サーフは波が高い日は要注意", "離岸流に注意"],
    youtubeLinks: [
      { label: "仙台新港 ヒラメ", searchQuery: "仙台新港 ヒラメ サーフ ルアー", description: "仙台新港サーフでのヒラメ釣り動画" },
    ],
  },
  {
    id: "s437", name: "石巻漁港", slug: "ishinomaki-gyoko",
    description: "世界三大漁場の一つ・金華山沖に近い大港。カツオやマグロの水揚げで有名だが、堤防からもサバやイワシが大量に釣れる。",
    latitude: 38.4240, longitude: 141.3060,
    address: "宮城県石巻市魚町2丁目",
    accessInfo: "JR仙石線石巻駅から車で約10分。三陸自動車道石巻港ICから約5分。",
    region: localRegion("r145"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/ishinomaki-gyoko.jpg", images: [], rating: 3.8, reviewCount: 132,
    catchableFish: [
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("iwashi"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
      { fish: fish("ainame"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ブラクリ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["漁業作業中は邪魔にならないよう注意"],
    youtubeLinks: [
      { label: "石巻漁港 サビキ", searchQuery: "石巻漁港 サビキ釣り", description: "石巻漁港でのサビキ釣り動画" },
    ],
  },

  // ========================================
  // 山形県 (3スポット)
  // ========================================
  {
    id: "s438", name: "酒田港中央埠頭", slug: "sakata-chuo-wharf",
    description: "山形県最大の港・酒田港の中央埠頭。足場が良く、サビキ釣りからルアーまで多彩な釣りが楽しめる。夕日が美しいスポットとしても有名。",
    latitude: 38.9230, longitude: 139.8480,
    address: "山形県酒田市船場町2丁目",
    accessInfo: "JR酒田駅から車で約10分。日本海東北道酒田ICから約15分。",
    region: region("r37"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "埠頭に無料駐車スペースあり（30台）",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/sakata-chuo-wharf.jpg", images: [], rating: 3.7, reviewCount: 105,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kisu"), monthStart: 6, monthEnd: 9, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki, gearNage],
    safetyLevel: "safe", safetyNotes: ["足場良好", "強風時は注意"],
    youtubeLinks: [
      { label: "酒田港 釣り", searchQuery: "酒田港 サビキ 釣り", description: "酒田港での釣り動画" },
    ],
  },
  {
    id: "s439", name: "鼠ヶ関漁港", slug: "nezugaseki-port",
    description: "山形県最南端の漁港で、新潟県との県境に位置。日本海の荒波を受ける港は魚影が濃く、クロダイやメジナの磯釣りファンに人気。",
    latitude: 38.5550, longitude: 139.5390,
    address: "山形県鶴岡市鼠ヶ関",
    accessInfo: "JR鼠ヶ関駅から徒歩約5分。日本海東北道あつみ温泉ICから約15分。",
    region: localRegion("r142"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/nezugaseki-port.jpg", images: [], rating: 4.1, reviewCount: 78,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
    ],
    bestTimes: btStandard, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "caution", safetyNotes: ["堤防先端は波をかぶることがある", "磯場は足元注意"],
    youtubeLinks: [
      { label: "鼠ヶ関 クロダイ", searchQuery: "鼠ヶ関 クロダイ フカセ", description: "鼠ヶ関でのクロダイ釣り動画" },
    ],
  },
  {
    id: "s440", name: "鶴岡市由良海岸", slug: "tsuruoka-yura-coast",
    description: "白山島を望む景勝地。夏場はキスの投げ釣り、秋はアオリイカのエギングが人気。海水浴場にもなるため砂浜が広い。",
    latitude: 38.7680, longitude: 139.7230,
    address: "山形県鶴岡市由良",
    accessInfo: "JR羽越本線あつみ温泉駅から車で約20分。",
    region: localRegion("r142"), spotType: "beach", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "海水浴場駐車場あり（夏季有料500円）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/tsuruoka-yura-coast.jpg", images: [], rating: 3.8, reviewCount: 65,
    catchableFish: [
      { fish: fish("kisu"), monthStart: 6, monthEnd: 9, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("hirame"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: { bestTide: "大潮・中潮", bestTidePhase: "下げ始め", description: "下げ潮で砂浜の払い出しにベイトが集まります。" },
    mazumeInfo: mazumeTohoku,
    gearGuides: [gearNage],
    safetyLevel: "safe", safetyNotes: ["海水浴シーズンは釣り場が制限される場合あり"],
    youtubeLinks: [
      { label: "由良海岸 キス釣り", searchQuery: "由良海岸 キス 投げ釣り", description: "由良海岸でのキス釣り動画" },
    ],
  },

  // ========================================
  // 福島県 (3スポット)
  // ========================================
  {
    id: "s441", name: "小名浜港アクアマリンパーク", slug: "onahama-aquamarine-park",
    description: "いわき市の観光名所・アクアマリンふくしま隣接の釣り場。整備された護岸でサビキ釣りやちょい投げが楽しめ、ファミリーに大人気。",
    latitude: 36.9380, longitude: 140.8970,
    address: "福島県いわき市小名浜辰巳町",
    accessInfo: "JR常磐線泉駅からバスで約15分。常磐自動車道いわき湯本ICから約20分。",
    region: region("r38"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "アクアマリン駐車場あり（有料500円/日）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/onahama-aquamarine-park.jpg", images: [], rating: 3.8, reviewCount: 178,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["護岸は柵付きで安全", "観光施設隣接でトイレ・売店完備"],
    youtubeLinks: [
      { label: "小名浜港 サビキ", searchQuery: "小名浜港 アクアマリン サビキ釣り", description: "小名浜港でのサビキ釣り動画" },
    ],
  },
  {
    id: "s443", name: "いわき市四倉漁港", slug: "iwaki-yotsukura-port",
    description: "いわき市北部の漁港。道の駅よつくら港に隣接し、アクセスと施設が充実。サビキ釣りやちょい投げで家族連れに人気。",
    latitude: 37.0830, longitude: 140.9680,
    address: "福島県いわき市四倉町",
    accessInfo: "JR常磐線四ツ倉駅から徒歩約15分。常磐自動車道四倉ICから約5分。",
    region: region("r38"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "道の駅駐車場あり（無料）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/iwaki-yotsukura-port.jpg", images: [], rating: 3.6, reviewCount: 88,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSabiki],
    safetyLevel: "safe", safetyNotes: ["道の駅隣接で施設充実", "ファミリー向け"],
    youtubeLinks: [
      { label: "四倉漁港 釣り", searchQuery: "四倉漁港 サビキ 釣り いわき", description: "四倉漁港での釣り動画" },
    ],
  },
];
