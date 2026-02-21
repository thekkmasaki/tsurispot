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

const okinawaRegions: Region[] = [
  { id: "r180", prefecture: "沖縄県", areaName: "北谷・宜野湾", slug: "okinawa-chatan-ginowan" },
  { id: "r181", prefecture: "沖縄県", areaName: "読谷・恩納", slug: "okinawa-yomitan-onna" },
  { id: "r182", prefecture: "沖縄県", areaName: "名護・本部", slug: "okinawa-nago-motobu" },
  { id: "r183", prefecture: "沖縄県", areaName: "金武・うるま", slug: "okinawa-kin-uruma" },
  { id: "r184", prefecture: "沖縄県", areaName: "中城・南城", slug: "okinawa-nakagusuku-nanjo" },
  { id: "r185", prefecture: "沖縄県", areaName: "糸満・豊見城", slug: "okinawa-itoman-tomigusuku" },
  { id: "r186", prefecture: "沖縄県", areaName: "石垣島", slug: "okinawa-ishigaki" },
];

function localRegion(id: string) {
  return okinawaRegions.find((r) => r.id === id) || region(id);
}

const mazumeOkinawa = {
  springSunrise: "6:30頃", springSunset: "19:00頃",
  summerSunrise: "5:50頃", summerSunset: "19:30頃",
  autumnSunrise: "6:20頃", autumnSunset: "18:00頃",
  winterSunrise: "7:10頃", winterSunset: "17:50頃",
  tip: "沖縄は一年中温暖で魚の活性が高い。朝夕のマヅメ時は特に回遊魚の活性が上がります。夏の日中は強烈な日差しに注意。",
};

const btMorning = [
  { label: "朝マヅメ", timeRange: "6:00〜8:00", rating: "best" as const },
  { label: "日中", timeRange: "10:00〜14:00", rating: "fair" as const },
  { label: "夕マヅメ", timeRange: "17:00〜19:00", rating: "good" as const },
  { label: "夜", timeRange: "20:00〜23:00", rating: "good" as const },
];
const btNight = [
  { label: "朝マヅメ", timeRange: "6:00〜8:00", rating: "good" as const },
  { label: "日中", timeRange: "10:00〜14:00", rating: "fair" as const },
  { label: "夕マヅメ", timeRange: "17:00〜19:00", rating: "good" as const },
  { label: "夜", timeRange: "20:00〜23:00", rating: "best" as const },
];

const tideStandard = { bestTide: "中潮〜大潮", bestTidePhase: "上げ潮〜満潮前後", description: "潮が動く時間帯に回遊魚の活性が上がります。" };
const tideRock = { bestTide: "中潮〜大潮", bestTidePhase: "満潮前後", description: "満潮前後が根魚の活性が最も高まります。" };

const gearSabiki = { targetFish: "アジ・ガーラ（アジ類）", method: "サビキ釣り", difficulty: "beginner" as const, rod: "磯竿3号 3.6〜4.5m", reel: "スピニングリール 2500番", line: "ナイロン3号", hook: "サビキ仕掛け 5〜7号", otherItems: ["コマセカゴ", "アミエビ", "バケツ"], tip: "沖縄ではアジ類を「ガーラ」とも呼ぶ。コマセを使ったサビキで数釣りが楽しめる。" };
const gearNage = { targetFish: "キス・ハマフエフキ", method: "投げ釣り", difficulty: "beginner" as const, rod: "投げ竿 3.9〜4.25m", reel: "スピニングリール 3000〜4000番", line: "ナイロン4号", hook: "流線針 7〜9号", otherItems: ["天秤オモリ 20〜25号", "青イソメ", "竿立て"], tip: "砂浜ではキスやハマフエフキが狙える。エサはイソメが定番。" };
const gearRock = { targetFish: "ミーバイ（ハタ類）・カサゴ", method: "穴釣り・根魚釣り", difficulty: "beginner" as const, rod: "穴釣りロッド 1.5〜2m", reel: "小型スピニングリール", line: "フロロ3〜5号", hook: "ブラクリ 5〜8号", otherItems: ["アオイソメ", "エビ類"], tip: "沖縄ではハタ類を「ミーバイ」と呼ぶ。テトラや岩礁帯の穴に落とし込む。" };
const gearEging = { targetFish: "アオリイカ（ミミイカ）", method: "エギング", difficulty: "intermediate" as const, rod: "エギングロッド 8.6〜9ft", reel: "スピニングリール 2500〜3000番", line: "PE 0.6〜0.8号 + リーダー フロロ 2号", hook: "エギ 2.5〜3.5号", otherItems: ["エギ各色", "フィッシュグリップ"], tip: "沖縄のアオリイカは「ミミイカ」とも呼ばれる。周年狙えるが秋がシーズン。" };
const gearJigging = { targetFish: "カンパチ・GT（ロウニンアジ）", method: "ショアジギング", difficulty: "intermediate" as const, rod: "ショアジギングロッド 9.6〜10ft 40〜80g", reel: "スピニングリール 5000〜6000番", line: "PE 2〜3号 + リーダー ナイロン60lb", hook: "メタルジグ 40〜80g", otherItems: ["ジグ各種", "フィッシュグリップ", "プライヤー"], tip: "GT（ロウニンアジ）狙いにはPE3号以上の強タックルが必要。朝一番の回遊を狙う。" };

export const okinawaSpots: FishingSpot[] = [
  // ========================================
  // 那覇市・近郊 (4スポット)
  // ========================================
  {
    id: "s500", name: "那覇新港", slug: "naha-shinko",
    description: "沖縄本島最大の港湾。クルーズ船やフェリーが発着する大型港の周辺で、アジ類やミーバイ（ハタ類）が狙える。夜釣りでの太刀魚も人気で、観光客から地元釣り師まで幅広く楽しめる港。",
    latitude: 26.2230, longitude: 127.6820,
    address: "沖縄県那覇市港町1丁目",
    accessInfo: "ゆいレール旭橋駅から車で約10分。那覇IC方面から国道58号経由。",
    region: region("r17"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港湾周辺に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/naha-shinko.jpg", images: [], rating: 3.8, reviewCount: 132,
    catchableFish: [
      { fish: fish("aji"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("tachiuo"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ釣り" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "穴釣り" },
      { fish: fish("seabass"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
    ],
    bestTimes: btNight, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearSabiki, gearRock],
    safetyLevel: "safe",
    safetyNotes: ["クルーズ船の接岸時は立入禁止区域あり", "熱中症対策必須（夏場は特に）"],
    youtubeLinks: [
      { label: "那覇港 太刀魚 夜釣り", searchQuery: "那覇 太刀魚 テンヤ 夜釣り 沖縄", description: "那覇港での太刀魚夜釣り動画" },
    ],
  },
  {
    id: "s501", name: "泊港", slug: "tomari-port",
    description: "那覇市内の離島航路が発着する泊港。港内の防波堤では年中アジ類やチヌが釣れる。那覇の中心部に近く、仕事帰りの夕マヅメ釣りを楽しむ地元アングラーで賑わう人気の釣り場。",
    latitude: 26.2310, longitude: 127.6790,
    address: "沖縄県那覇市前島3丁目",
    accessInfo: "ゆいレール美栄橋駅から徒歩約15分。国道58号からアクセス可。",
    region: region("r17"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "泊港周辺に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/tomari-port.jpg", images: [], rating: 3.9, reviewCount: 156,
    catchableFish: [
      { fish: fish("aji"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kurodai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("mebaru"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "メバリング" },
      { fish: fish("tachiuo"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ釣り" },
    ],
    bestTimes: btNight, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearSabiki, gearRock],
    safetyLevel: "safe",
    safetyNotes: ["離島行きフェリーの出入りに注意", "夜間は足元に注意"],
    youtubeLinks: [
      { label: "泊港 アジ 夕マヅメ 沖縄", searchQuery: "泊港 アジ サビキ 夕マヅメ 沖縄", description: "泊港での夕マヅメアジ釣り動画" },
    ],
  },
  {
    id: "s502", name: "糸満港", slug: "itoman-port",
    description: "沖縄本島南部の主要漁港。カーバライ（カワハギ）やミーバイの根魚釣りが盛んで、防波堤では年中アジ類のサビキ釣りが楽しめる。かつての沖縄戦の舞台でもある糸満の海辺の釣り場。",
    latitude: 26.1220, longitude: 127.6650,
    address: "沖縄県糸満市西崎町",
    accessInfo: "那覇市内から車で約30分。南風原南ICから国道331号経由で約20分。",
    region: localRegion("r185"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港湾内に無料駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/itoman-port.jpg", images: [], rating: 4.0, reviewCount: 118,
    catchableFish: [
      { fish: fish("aji"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("kawahagi"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "チョイ投げ・カワハギ釣り" },
      { fish: fish("hata"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "泳がせ釣り" },
      { fish: fish("kurodai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearSabiki, gearRock],
    safetyLevel: "safe",
    safetyNotes: ["漁船の出入りに注意", "夏は熱中症対策必須"],
    youtubeLinks: [
      { label: "糸満漁港 カワハギ釣り", searchQuery: "糸満 カワハギ 釣り 沖縄", description: "糸満漁港でのカワハギ釣り動画" },
    ],
  },
  {
    id: "s503", name: "豊見城瀬長島", slug: "tomigusuku-senaga-island",
    description: "那覇空港に隣接する瀬長島の外周釣りスポット。リゾート施設が整備された人気観光地だが、島の周辺にはカーエー（フエフキダイ）やミーバイが生息する豊かな磯が広がる。",
    latitude: 26.1640, longitude: 127.6450,
    address: "沖縄県豊見城市瀬長174番地",
    accessInfo: "那覇空港から車で約10分。豊見城・名嘉地ICから約5分。",
    region: localRegion("r185"), spotType: "rocky", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "島内に有料駐車場あり（600円〜）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/tomigusuku-senaga-island.jpg", images: [], rating: 4.1, reviewCount: 142,
    catchableFish: [
      { fish: fish("hata"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "泳がせ釣り・ルアー" },
      { fish: fish("kurodai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "穴釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearRock, gearEging],
    safetyLevel: "caution",
    safetyNotes: ["観光地のため混雑時は釣り場が少ない", "磯場は滑りやすい", "サンゴ礁の破壊禁止"],
    youtubeLinks: [
      { label: "瀬長島 エギング アオリイカ", searchQuery: "瀬長島 エギング アオリイカ 沖縄", description: "瀬長島でのエギング動画" },
    ],
  },
  // ========================================
  // 中部 (4スポット)
  // ========================================
  {
    id: "s504", name: "北谷フィッシャリーナ", slug: "chatan-fisharina",
    description: "アメリカンビレッジに隣接する北谷フィッシャリーナ。マリーナ内の桟橋やテトラ帯でアジ類やタチウオが狙える。夜は太刀魚のテンヤ釣りが人気で、観光地の明かりが集魚灯代わりになる。",
    latitude: 26.3080, longitude: 127.7490,
    address: "沖縄県中頭郡北谷町美浜34-3",
    accessInfo: "沖縄自動車道北中城ICから約20分。国道58号北谷方面から。",
    region: localRegion("r180"), spotType: "pier", difficulty: "beginner",
    isFree: false, feeDetail: "釣り場利用料500円（マリーナ管理費）",
    hasParking: true, parkingDetail: "アメリカンビレッジ周辺に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/chatan-fisharina.jpg", images: [], rating: 4.0, reviewCount: 187,
    catchableFish: [
      { fish: fish("aji"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("tachiuo"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ釣り" },
      { fish: fish("seabass"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
    ],
    bestTimes: btNight, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearSabiki, gearEging],
    safetyLevel: "safe",
    safetyNotes: ["マリーナ内は釣り禁止エリアあり、管理者に確認", "夜間は足元に注意"],
    youtubeLinks: [
      { label: "北谷 太刀魚 テンヤ 夜釣り", searchQuery: "北谷 太刀魚 テンヤ 夜釣り 沖縄", description: "北谷フィッシャリーナでの太刀魚夜釣り動画" },
    ],
  },
  {
    id: "s505", name: "宜野湾マリーナ", slug: "ginowan-marina",
    description: "沖縄本島中部の宜野湾市にあるマリーナ。防波堤ではアジやイワシのサビキ釣りが楽しめ、マリーナ内のテトラ帯ではカサゴやミーバイの根魚釣りも可能。初心者ファミリーに人気の釣りスポット。",
    latitude: 26.2780, longitude: 127.7540,
    address: "沖縄県宜野湾市真志喜4丁目2-1",
    accessInfo: "沖縄自動車道西原ICから約20分。国道58号宜野湾方面から。",
    region: localRegion("r180"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "マリーナ駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/ginowan-marina.jpg", images: [], rating: 3.8, reviewCount: 98,
    catchableFish: [
      { fish: fish("aji"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "穴釣り" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearSabiki, gearRock],
    safetyLevel: "safe",
    safetyNotes: ["マリーナの釣り可能エリアを事前に確認", "夏場の日射病対策必須"],
    youtubeLinks: [
      { label: "宜野湾マリーナ 釣り", searchQuery: "宜野湾マリーナ 釣り アジ 沖縄", description: "宜野湾マリーナでの釣り動画" },
    ],
  },
  {
    id: "s506", name: "うるま市海中道路", slug: "uruma-kaichu-road",
    description: "全長約4.7kmの海中道路（海上の道路）沿いの釣りスポット。潮通しが良く、大型のロウニンアジ（GT）の回遊ポイントとして知られる。カーエー（フエフキダイ）やミーバイも豊富。",
    latitude: 26.3520, longitude: 127.8790,
    address: "沖縄県うるま市与那城平安座",
    accessInfo: "沖縄自動車道沖縄北ICから車で約25分。国道329号海中道路方面。",
    region: localRegion("r183"), spotType: "breakwater", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "海中道路沿いに無料駐車スペースあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/uruma-kaichu-road.jpg", images: [], rating: 4.3, reviewCount: 234,
    catchableFish: [
      { fish: fish("kanpachi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
      { fish: fish("hata"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "泳がせ釣り" },
      { fish: fish("kurodai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("tachiuo"), monthStart: 7, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: { bestTide: "大潮", bestTidePhase: "潮流が速い時間帯", description: "海中道路は潮流が速くなる時間帯に大型魚の回遊が増えます。GT狙いは潮が効いている時間帯を狙う。" },
    mazumeInfo: mazumeOkinawa,
    gearGuides: [gearJigging, gearRock],
    safetyLevel: "caution",
    safetyNotes: ["道路沿いの釣りは車に注意", "潮流が速いため小さな子どもは要注意", "満潮時は波が道路に被ることあり"],
    youtubeLinks: [
      { label: "海中道路 GT ショアジギング", searchQuery: "海中道路 GT ロウニンアジ ショアジギング 沖縄", description: "海中道路でのGT（ロウニンアジ）ショアジギング動画" },
      { label: "海中道路 カーエー フカセ", searchQuery: "海中道路 カーエー フカセ釣り 沖縄", description: "海中道路でのカーエー釣り動画" },
    ],
  },
  {
    id: "s507", name: "中城湾", slug: "nakagusuku-bay",
    description: "沖縄本島東部に広がる中城湾。湾内は穏やかで、砂浜からの投げ釣りでキスやハマフエフキが狙える。湾奥ではシーバス（タマン）の実績も高く、初心者から中級者まで楽しめる釣りエリア。",
    latitude: 26.2410, longitude: 127.8120,
    address: "沖縄県中頭郡中城村",
    accessInfo: "沖縄自動車道北中城ICから約15分。国道329号中城方面から。",
    region: localRegion("r184"), spotType: "beach", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "湾岸沿いに無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/nakagusuku-bay.jpg", images: [], rating: 3.7, reviewCount: 76,
    catchableFish: [
      { fish: fish("kisu"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り" },
      { fish: fish("haze"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "チョイ投げ" },
      { fish: fish("seabass"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("kurodai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearNage, gearRock],
    safetyLevel: "safe",
    safetyNotes: ["サンゴ礁保護のため踏みつけ禁止", "夏場の日焼け・熱中症対策必須"],
    youtubeLinks: [
      { label: "中城湾 キス 投げ釣り 沖縄", searchQuery: "沖縄 キス 投げ釣り 中城湾", description: "中城湾でのキス投げ釣り動画" },
    ],
  },
  // ========================================
  // 北部 (3スポット)
  // ========================================
  {
    id: "s508", name: "名護漁港", slug: "nago-gyoko",
    description: "沖縄本島北部・名護市の漁港。やんばる（山原）の豊かな自然を背景に持つ港で、多種多様な魚が釣れる。ガーラ（アジ類）のサビキ釣りから、アオリイカのエギングまで幅広い釣りが楽しめる。",
    latitude: 26.5920, longitude: 127.9770,
    address: "沖縄県名護市城2丁目",
    accessInfo: "沖縄自動車道許田ICから約10分。国道58号名護市街方面から。",
    region: localRegion("r182"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港内に無料駐車スペースあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/nago-gyoko.jpg", images: [], rating: 3.9, reviewCount: 104,
    catchableFish: [
      { fish: fish("aji"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("hata"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "泳がせ釣り" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "穴釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearSabiki, gearEging],
    safetyLevel: "safe",
    safetyNotes: ["漁船の出入りに注意"],
    youtubeLinks: [
      { label: "名護漁港 アジ サビキ", searchQuery: "名護漁港 アジ サビキ 沖縄 北部", description: "名護漁港でのサビキ釣り動画" },
    ],
  },
  {
    id: "s509", name: "本部港", slug: "motobu-port",
    description: "沖縄美ら海水族館に近い本部港。離島（伊江島・水納島）行きのフェリーが発着する港で、防波堤からアジ類やミーバイが狙える。観光の合間に気軽に楽しめるアクセス抜群の釣りスポット。",
    latitude: 26.6590, longitude: 127.8890,
    address: "沖縄県国頭郡本部町港",
    accessInfo: "沖縄自動車道許田ICから約40分。美ら海水族館から車で約5分。",
    region: localRegion("r182"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港湾周辺に無料駐車スペースあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/motobu-port.jpg", images: [], rating: 3.8, reviewCount: 87,
    catchableFish: [
      { fish: fish("aji"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "穴釣り" },
      { fish: fish("kurodai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearSabiki, gearRock],
    safetyLevel: "safe",
    safetyNotes: ["フェリー乗降時の立入禁止区域に注意", "観光シーズンは混雑あり"],
    youtubeLinks: [
      { label: "本部港 釣り 沖縄 北部", searchQuery: "本部港 釣り 沖縄 北部 アジ", description: "本部港での釣り動画" },
    ],
  },
  {
    id: "s510", name: "読谷残波岬", slug: "yomitan-zanpa-cape",
    description: "沖縄本島西海岸の突端に位置する残波岬。隆起サンゴ礁の白い断崖が続く絶景の磯場で、GT（ロウニンアジ）のルアー釣りやミーバイ狙いのウキ釣りで知られる上級者向けの磯釣りスポット。",
    latitude: 26.4080, longitude: 127.7060,
    address: "沖縄県中頭郡読谷村字渡口",
    accessInfo: "沖縄自動車道沖縄北ICから車で約30分。国道58号読谷方面から県道6号経由。",
    region: localRegion("r181"), spotType: "rocky", difficulty: "advanced",
    isFree: true, hasParking: true, parkingDetail: "残波岬灯台周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/yomitan-zanpa-cape.jpg", images: [], rating: 4.5, reviewCount: 178,
    catchableFish: [
      { fish: fish("kanpachi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング・GT" },
      { fish: fish("hata"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ルアー・泳がせ釣り" },
      { fish: fish("ishidai"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "日中", method: "石鯛釣り" },
      { fish: fish("mejina"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearJigging],
    safetyLevel: "danger",
    safetyNotes: ["断崖絶壁のため転落事故に注意", "波が高い日は絶対に近づかない", "磯靴・ライフジャケット必須", "単独釣行は避け必ず複数で"],
    youtubeLinks: [
      { label: "残波岬 GT ショアジギング", searchQuery: "残波岬 GT ロウニンアジ ショアジギング 沖縄", description: "残波岬でのGT狙いショアジギング動画" },
      { label: "残波岬 磯釣り グレ", searchQuery: "残波岬 磯釣り グレ フカセ 沖縄", description: "残波岬での磯フカセ釣り動画" },
    ],
  },
  {
    id: "s511", name: "恩納村ムーンビーチ前", slug: "onna-moon-beach",
    description: "沖縄の高級リゾートエリア・恩納村のビーチ前の釣りスポット。透明度の高い海でキスやハマフエフキの投げ釣りが楽しめる。夏場はナイトシュノーケルも盛んなエリアだが、早朝の磯際では良型魚も狙える。",
    latitude: 26.4840, longitude: 127.8230,
    address: "沖縄県国頭郡恩納村字前兼久",
    accessInfo: "沖縄自動車道石川ICから約20分。国道58号恩納方面から。",
    region: localRegion("r181"), spotType: "beach", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "周辺に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/onna-moon-beach.jpg", images: [], rating: 3.6, reviewCount: 65,
    catchableFish: [
      { fish: fish("kisu"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "早朝", method: "投げ釣り" },
      { fish: fish("haze"), monthStart: 4, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "チョイ投げ" },
      { fish: fish("hata"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearNage],
    safetyLevel: "safe",
    safetyNotes: ["海水浴シーズン（7〜9月）は釣り禁止エリアあり", "サンゴ礁の破壊禁止"],
    youtubeLinks: [
      { label: "恩納村 キス 投げ釣り", searchQuery: "恩納村 キス 投げ釣り 沖縄 ビーチ", description: "恩納村ビーチでのキス投げ釣り動画" },
    ],
  },
  // ========================================
  // 南城市・石垣島 (3スポット)
  // ========================================
  {
    id: "s512", name: "南城市奥武島", slug: "nanjo-oku-island",
    description: "天ぷらで有名な奥武島（おうじま）の磯場。島の周囲は潮通しが良く、アオリイカやミーバイの好ポイント。橋で本島と繋がっているため渡船不要でアクセスできる穴場的な離島釣り場。",
    latitude: 26.1590, longitude: 127.7550,
    address: "沖縄県南城市玉城字奥武",
    accessInfo: "那覇市内から車で約35分。南風原南ICから国道331号経由で奥武島橋を渡る。",
    region: localRegion("r184"), spotType: "rocky", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "島内に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/nanjo-oku-island.jpg", images: [], rating: 4.2, reviewCount: 136,
    catchableFish: [
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("hata"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー・泳がせ釣り" },
      { fish: fish("kurodai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("madako"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "タコ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideRock, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearRock, gearEging],
    safetyLevel: "caution",
    safetyNotes: ["磯場は滑りやすいため注意", "観光客が多い時間帯は釣り場が少ない", "サンゴ礁保護のため踏みつけ禁止"],
    youtubeLinks: [
      { label: "奥武島 エギング アオリイカ", searchQuery: "奥武島 エギング アオリイカ 南城 沖縄", description: "奥武島でのエギング動画" },
    ],
  },
  {
    id: "s513", name: "金武湾", slug: "kin-bay",
    description: "沖縄本島東部の金武湾。内湾の穏やかな環境でシーバス（タマン）や根魚が狙える中級者向けスポット。夜釣りでのタチウオやルアーでのシーバスが人気で、地元アングラーに長年愛される釣り場。",
    latitude: 26.4230, longitude: 127.9180,
    address: "沖縄県国頭郡金武町金武",
    accessInfo: "沖縄自動車道金武ICから約10分。国道329号金武方面から。",
    region: localRegion("r183"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "金武漁港周辺に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/kin-bay.jpg", images: [], rating: 3.8, reviewCount: 82,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("tachiuo"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ釣り" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "穴釣り" },
      { fish: fish("aji"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btNight, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearRock, gearSabiki],
    safetyLevel: "safe",
    safetyNotes: ["夜間釣行時はライトを必ず携帯"],
    youtubeLinks: [
      { label: "金武湾 シーバス ルアー", searchQuery: "金武湾 シーバス タマン ルアー 沖縄", description: "金武湾でのシーバス（タマン）ルアー釣り動画" },
    ],
  },
  {
    id: "s514", name: "石垣港", slug: "ishigaki-port",
    description: "八重山諸島の中心・石垣島の港湾。南国の透明な海に囲まれ、カーエー（フエフキダイ）・ミーバイ・GT（ロウニンアジ）などの南国固有魚が狙える。離島遊覧と釣りを組み合わせた旅行にも最適。",
    latitude: 24.3380, longitude: 124.1560,
    address: "沖縄県石垣市美崎町1番地",
    accessInfo: "石垣空港から車で約20分。新石垣空港から国道390号経由。",
    region: localRegion("r186"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "離島ターミナル周辺に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: true, rentalDetail: "釣具レンタル2000円〜（近くの釣具店で取り扱い）",
    mainImageUrl: "/images/spots/ishigaki-port.jpg", images: [], rating: 4.5, reviewCount: 312,
    catchableFish: [
      { fish: fish("kanpachi"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
      { fish: fish("hata"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー・泳がせ釣り" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("kurodai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeOkinawa,
    gearGuides: [gearJigging, gearEging],
    safetyLevel: "caution",
    safetyNotes: ["台風の接近が本土より早い。天気予報を毎日確認", "離島は救急医療が限られるため安全を最優先", "海の透明度が高く紫外線が強烈 – 日焼け止め必須"],
    youtubeLinks: [
      { label: "石垣島 GT ショアジギング", searchQuery: "石垣島 GT ロウニンアジ ショアジギング", description: "石垣島でのGT狙いショアジギング動画" },
      { label: "石垣島 ミーバイ 根魚 釣り", searchQuery: "石垣島 ミーバイ ハタ 根魚 釣り", description: "石垣島でのミーバイ（ハタ類）釣り動画" },
    ],
  },
];
