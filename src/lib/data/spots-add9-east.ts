import { FishingSpot, FishSpecies, Region } from "@/types";
import { getFishBySlug } from "./fish";
import { regions } from "./regions";

function fish(slug: string): FishSpecies { const f = getFishBySlug(slug); if (!f) throw new Error(`Fish not found: ${slug}`); return f; }
function region(id: string) { const r = regions.find((r) => r.id === id); if (!r) throw new Error(`Region not found: ${id}`); return r; }

const localRegions: Region[] = [
  // 青森県
  { id: "rs9001", prefecture: "青森県", areaName: "津軽半島・小泊", slug: "aomori-tsugaru-kodomari-s9" },
  { id: "rs9002", prefecture: "青森県", areaName: "津軽半島・蟹田", slug: "aomori-tsugaru-kanita-s9" },
  { id: "rs9003", prefecture: "青森県", areaName: "階上・三八", slug: "aomori-hashikami-sanpachi-s9" },
  // 岩手県
  { id: "rs9004", prefecture: "岩手県", areaName: "重茂半島", slug: "iwate-omoe-s9" },
  // 秋田県
  { id: "rs9005", prefecture: "秋田県", areaName: "岩城", slug: "akita-iwaki-s9" },
  // 宮城県
  { id: "rs9006", prefecture: "宮城県", areaName: "名取・閖上", slug: "miyagi-natori-yuriage-s9" },
  { id: "rs9007", prefecture: "宮城県", areaName: "南三陸・志津川", slug: "miyagi-minamisanriku-s9" },
  { id: "rs9008", prefecture: "宮城県", areaName: "雄勝", slug: "miyagi-ogatsu-s9" },
  { id: "rs9009", prefecture: "宮城県", areaName: "仙台・荒浜", slug: "miyagi-sendai-arahama-s9" },
  // 福島県
  { id: "rs9010", prefecture: "福島県", areaName: "四倉", slug: "fukushima-yotsukura-s9" },
  { id: "rs9011", prefecture: "福島県", areaName: "勿来", slug: "fukushima-nakoso-s9" },
  // 茨城県
  { id: "rs9012", prefecture: "茨城県", areaName: "潮来・霞ヶ浦", slug: "ibaraki-itako-kasumigaura-s9" },
  { id: "rs9013", prefecture: "茨城県", areaName: "神栖・利根川河口", slug: "ibaraki-kamisu-tonegawa-s9" },
  { id: "rs9014", prefecture: "茨城県", areaName: "鉾田・北浦", slug: "ibaraki-hokota-kitaura-s9" },
  // 栃木県
  { id: "rs9015", prefecture: "栃木県", areaName: "大芦川・鹿沼", slug: "tochigi-oashigawa-kanuma-s9" },
  // 群馬県
  { id: "rs9016", prefecture: "群馬県", areaName: "烏川・高崎", slug: "gunma-karasugawa-takasaki-s9" },
  // 東京都
  { id: "rs9017", prefecture: "東京都", areaName: "三宅島", slug: "tokyo-miyakejima-s9" },
  { id: "rs9018", prefecture: "東京都", areaName: "新島・式根島", slug: "tokyo-niijima-shikinejima-s9" },
  { id: "rs9019", prefecture: "東京都", areaName: "八丈島", slug: "tokyo-hachijojima-s9" },
  { id: "rs9020", prefecture: "東京都", areaName: "隅田川・両国", slug: "tokyo-sumidagawa-ryogoku-s9" },
  { id: "rs9021", prefecture: "東京都", areaName: "中川・平井", slug: "tokyo-nakagawa-hirai-s9" },
  // 神奈川県
  { id: "rs9022", prefecture: "神奈川県", areaName: "大磯", slug: "kanagawa-oiso-s9" },
  { id: "rs9023", prefecture: "神奈川県", areaName: "金沢八景", slug: "kanagawa-kanazawahakkei-s9" },
  // 千葉県
  { id: "rs9024", prefecture: "千葉県", areaName: "鋸南", slug: "chiba-kyonan-s9" },
  { id: "rs9025", prefecture: "千葉県", areaName: "船橋・三番瀬", slug: "chiba-funabashi-sanbanze-s9" },
  { id: "rs9026", prefecture: "千葉県", areaName: "興津", slug: "chiba-okitsu-s9" },
  { id: "rs9027", prefecture: "千葉県", areaName: "金谷", slug: "chiba-kanaya-s9" },
  // 山梨県
  { id: "rs9028", prefecture: "山梨県", areaName: "四尾連湖", slug: "yamanashi-shibirekko-s9" },
];

function localRegion(id: string) { return localRegions.find((r) => r.id === id) || region(id); }

// 東北地方のマヅメ情報
const mazumeTohoku = { springSunrise: "4:50頃", springSunset: "18:20頃", summerSunrise: "4:15頃", summerSunset: "19:00頃", autumnSunrise: "5:20頃", autumnSunset: "17:00頃", winterSunrise: "6:45頃", winterSunset: "16:20頃", tip: "東北の海は親潮と対馬海流が交わるため魚種が豊富。冬場は荒れやすいので天候に注意。" };
const mazumeTohokuNihonkai = { springSunrise: "5:00頃", springSunset: "18:30頃", summerSunrise: "4:20頃", summerSunset: "19:10頃", autumnSunrise: "5:25頃", autumnSunset: "17:05頃", winterSunrise: "6:50頃", winterSunset: "16:30頃", tip: "日本海側は冬の季節風が強く荒天が多い。春〜秋がメインシーズン。" };
// 関東地方のマヅメ情報
const mazumeKanto = { springSunrise: "5:10頃", springSunset: "18:10頃", summerSunrise: "4:30頃", summerSunset: "18:55頃", autumnSunrise: "5:30頃", autumnSunset: "17:00頃", winterSunrise: "6:45頃", winterSunset: "16:30頃", tip: "東京湾・相模湾は黒潮の影響で魚種が多い。朝夕のマヅメが最も熱い。" };
const mazumeKantoRiver = { springSunrise: "5:10頃", springSunset: "18:10頃", summerSunrise: "4:30頃", summerSunset: "18:55頃", autumnSunrise: "5:30頃", autumnSunset: "17:00頃", winterSunrise: "6:45頃", winterSunset: "16:30頃", tip: "関東の河川は水量・水温の変化で釣果が変わる。増水後の落ち着いたタイミングが好機。" };
const mazumeIzu = { springSunrise: "5:15頃", springSunset: "18:15頃", summerSunrise: "4:35頃", summerSunset: "18:55頃", autumnSunrise: "5:30頃", autumnSunset: "17:05頃", winterSunrise: "6:45頃", winterSunset: "16:35頃", tip: "伊豆諸島は黒潮の本流が直接当たるため、大型の回遊魚が期待できる。" };
const mazumeYamanashi = { springSunrise: "5:15頃", springSunset: "18:15頃", summerSunrise: "4:35頃", summerSunset: "19:00頃", autumnSunrise: "5:35頃", autumnSunset: "17:05頃", winterSunrise: "6:50頃", winterSunset: "16:35頃", tip: "山梨の湖沼・渓流は標高が高いため夏でも水温が低い。早朝が勝負。" };

const btMorning = [{ label: "朝マヅメ", timeRange: "5:00〜7:30", rating: "best" as const }, { label: "日中", timeRange: "10:00〜14:00", rating: "good" as const }, { label: "夕マヅメ", timeRange: "16:30〜18:30", rating: "good" as const }, { label: "夜", timeRange: "20:00〜23:00", rating: "fair" as const }];
const btEvening = [{ label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "good" as const }, { label: "日中", timeRange: "10:00〜15:00", rating: "fair" as const }, { label: "夕マヅメ", timeRange: "16:00〜18:30", rating: "best" as const }, { label: "夜", timeRange: "19:00〜22:00", rating: "good" as const }];
const btNight = [{ label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "good" as const }, { label: "日中", timeRange: "10:00〜15:00", rating: "fair" as const }, { label: "夕マヅメ", timeRange: "16:00〜18:30", rating: "good" as const }, { label: "夜", timeRange: "19:00〜23:00", rating: "best" as const }];
const btAllDay = [{ label: "朝", timeRange: "6:00〜9:00", rating: "best" as const }, { label: "日中", timeRange: "10:00〜15:00", rating: "good" as const }, { label: "夕方", timeRange: "15:00〜18:00", rating: "best" as const }, { label: "夜", timeRange: "19:00〜21:00", rating: "fair" as const }];

const tideStandard = { bestTide: "中潮〜大潮", bestTidePhase: "上げ潮〜満潮前後", description: "潮が動く時間帯に回遊魚の活性が上がります。" };
const tidePort = { bestTide: "中潮〜大潮", bestTidePhase: "満潮前後", description: "港内は満潮前後に小魚が入りやすい。" };
const tideRiver = { bestTide: "中潮", bestTidePhase: "上げ潮", description: "河川は潮汐の影響は少ないが気圧変化で活性が変わる。" };
const tideBreakwater = { bestTide: "中潮〜大潮", bestTidePhase: "上げ潮〜満潮", description: "堤防では潮が動く時間帯にアジやサバの回遊が活発になる。" };
const tidePier = { bestTide: "中潮〜大潮", bestTidePhase: "満潮前後", description: "桟橋・海釣り施設では潮位が高い時間帯が狙い目。" };
const tideSurf = { bestTide: "大潮〜中潮", bestTidePhase: "下げ始め", description: "サーフでは下げ潮で離岸流が発生し魚が集まりやすい。" };
const tideFreshwater = { bestTide: "なし", bestTidePhase: "なし", description: "淡水域のため潮汐の影響はありませんが、気圧変化や水温で活性が変わります。" };

export const eastAdd9Spots: FishingSpot[] = [
  // =========================================
  // 青森県（3スポット: ss9001〜ss9003）
  // =========================================
  {
    id: "ss9001", name: "小泊漁港", slug: "kodomari-gyokou-a9",
    description: "津軽半島の日本海側に位置する静かな漁港。テトラ周りでメバルやソイが安定して釣れ、春秋はアジの回遊も見られる。",
    latitude: 41.1350, longitude: 140.2740,
    address: "〒037-0500 青森県北津軽郡中泊町小泊",
    accessInfo: "津軽自動車道五所川原ICから車で約50分",
    region: localRegion("rs9001"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夜", method: "メバリング" },
      { fish: fish("kurosoi"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "穴釣り" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btNight, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohokuNihonkai,
  },
  {
    id: "ss9002", name: "蟹田漁港", slug: "kanita-gyokou-a9",
    description: "陸奥湾に面した漁港で、足場が良くファミリーにも適している。秋のアジのサビキ釣りと冬のカレイの投げ釣りが人気。",
    latitude: 41.0320, longitude: 140.6390,
    address: "〒030-1300 青森県東津軽郡外ヶ浜町蟹田",
    accessInfo: "JR蟹田駅から徒歩約15分",
    region: localRegion("rs9002"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },
  {
    id: "ss9003", name: "階上漁港", slug: "hashikami-gyokou-a9",
    description: "三陸海岸の北端に位置する漁港。投げ釣りでカレイ、テトラ際でアイナメが狙える。冬場は良型のマコガレイの実績がある。",
    latitude: 40.4360, longitude: 141.6620,
    address: "〒039-1200 青森県三戸郡階上町",
    accessInfo: "八戸自動車道階上ICから車で約10分",
    region: localRegion("rs9003"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
      { fish: fish("ainame"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },

  // =========================================
  // 岩手県（3スポット: ss9004〜ss9006）
  // =========================================
  {
    id: "ss9004", name: "重茂漁港", slug: "omoe-gyokou-a9",
    description: "本州最東端の重茂半島に位置する漁港。潮通しが良くアイナメやソイの良型が期待できる穴場的ポイント。",
    latitude: 39.6200, longitude: 142.0700,
    address: "〒027-0111 岩手県宮古市重茂",
    accessInfo: "宮古駅から車で約30分",
    region: localRegion("rs9004"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("ainame"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("kurosoi"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夜", method: "ワーム" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },
  {
    id: "ss9005", name: "越喜来漁港", slug: "okirai-gyokou-a9",
    description: "越喜来湾の奥に位置する漁港。湾内は波が穏やかでカレイの投げ釣りが楽しめる。秋にはアイナメの数釣りも可能。",
    latitude: 39.0830, longitude: 141.8590,
    address: "〒022-0101 岩手県大船渡市三陸町越喜来",
    accessInfo: "三陸自動車道三陸ICから車で約10分",
    region: region("r69"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
      { fish: fish("ainame"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },
  {
    id: "ss9006", name: "唐丹漁港", slug: "toni-gyokou-a9",
    description: "釜石市南部のリアス海岸に面した漁港。根魚の魚影が濃く、特に冬場のソイが好ターゲット。投げ釣りのカレイも実績が高い。",
    latitude: 39.2180, longitude: 141.8980,
    address: "〒026-0121 岩手県釜石市唐丹町",
    accessInfo: "釜石駅から車で約20分",
    region: region("r68"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
      { fish: fish("kurosoi"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夜", method: "ワーム" },
      { fish: fish("ainame"), monthStart: 3, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
    ],
    bestTimes: btNight, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },

  // =========================================
  // 秋田県（4スポット: ss9007〜ss9010）
  // =========================================
  {
    id: "ss9007", name: "象潟漁港", slug: "kisakata-gyokou-a9",
    description: "鳥海山を背に日本海に面した漁港。夏〜秋のアジのサビキ釣りが好調で、春にはメバリングも楽しめるポイント。",
    latitude: 39.2000, longitude: 139.9060,
    address: "〒018-0100 秋田県にかほ市象潟町",
    accessInfo: "JR象潟駅から徒歩約15分",
    region: region("r71"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mebaru"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夜", method: "メバリング" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohokuNihonkai,
  },
  {
    id: "ss9008", name: "金浦漁港", slug: "konoura-gyokou-a9",
    description: "にかほ市の小規模漁港で、堤防からアジやクロダイが狙える。周辺は岩礁帯もありルアーフィッシングにも適している。",
    latitude: 39.2280, longitude: 139.9100,
    address: "〒018-0300 秋田県にかほ市金浦",
    accessInfo: "JR金浦駅から車で約5分",
    region: region("r71"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kurodai"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohokuNihonkai,
  },
  {
    id: "ss9009", name: "岩城漁港", slug: "iwaki-gyokou-akita-a9",
    description: "由利本荘市の日本海沿いの漁港。アジのサビキ釣りが安定しており、冬にはハタハタの接岸で地元の釣り人で賑わう。",
    latitude: 39.4810, longitude: 140.0500,
    address: "〒018-1300 秋田県由利本荘市岩城",
    accessInfo: "JR岩城みなと駅から徒歩約10分",
    region: localRegion("rs9005"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("hatahata"), monthStart: 11, monthEnd: 1, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夜", method: "サビキ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohokuNihonkai,
  },
  {
    id: "ss9010", name: "能代港・火力発電所前", slug: "noshiro-hatsudenjo-mae-a9",
    description: "能代港の火力発電所前に広がる堤防エリア。温排水の影響で冬場でも魚の活性が高く、キスやクロダイが年間通して狙える。",
    latitude: 40.1970, longitude: 140.0270,
    address: "〒016-0000 秋田県能代市大森山付近",
    accessInfo: "JR能代駅から車で約10分",
    region: region("r141"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "付近に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "投げ釣り" },
      { fish: fish("kurodai"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideBreakwater, mazumeInfo: mazumeTohokuNihonkai,
  },

  // =========================================
  // 山形県（4スポット: ss9011〜ss9014）
  // =========================================
  {
    id: "ss9011", name: "飛島・勝浦港", slug: "tobishima-katsuura-a9",
    description: "酒田沖に浮かぶ飛島の玄関口。離島ならではの魚影の濃さが魅力で、クロダイやメジナの大物が港内からでも狙える。",
    latitude: 39.1940, longitude: 139.5540,
    address: "〒998-0100 山形県酒田市飛島勝浦",
    accessInfo: "酒田港からフェリーで約75分",
    region: region("r37"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: false, parkingDetail: "島内に駐車場なし（徒歩移動）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.1, reviewCount: 0,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("mejina"), monthStart: 4, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohokuNihonkai,
  },
  {
    id: "ss9012", name: "鼠ヶ関漁港・南堤防", slug: "nezugaseki-minami-a9",
    description: "山形県最南端の漁港。南堤防は潮通しが良くアジの回遊が安定しており、秋にはクロダイの好ポイントとしても知られる。",
    latitude: 38.5560, longitude: 139.5420,
    address: "〒999-7126 山形県鶴岡市鼠ヶ関",
    accessInfo: "JR鼠ヶ関駅から徒歩約10分",
    region: region("r142"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kurodai"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("mebaru"), monthStart: 3, monthEnd: 6, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "メバリング" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tideBreakwater, mazumeInfo: mazumeTohokuNihonkai,
  },
  {
    id: "ss9013", name: "温海漁港", slug: "atsumi-gyokou-a9",
    description: "温泉街に近い小規模漁港。堤防からのアジやメバルのライトゲームが人気で、周辺の磯場ではクロダイも狙える。",
    latitude: 38.6020, longitude: 139.5460,
    address: "〒999-7205 山形県鶴岡市温海",
    accessInfo: "JRあつみ温泉駅から車で約5分",
    region: region("r72"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mebaru"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夜", method: "メバリング" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohokuNihonkai,
  },
  {
    id: "ss9014", name: "最上川河口・酒田側", slug: "mogamigawa-kakou-sakata-a9",
    description: "最上川が日本海に注ぐ河口部。汽水域に集まるシーバスの実績が高く、秋にはサクラマスの遡上前のランも楽しめる。",
    latitude: 38.9300, longitude: 139.8600,
    address: "〒998-0000 山形県酒田市最上川河口付近",
    accessInfo: "JR酒田駅から車で約10分",
    region: region("r37"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("suzuki"), monthStart: 4, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ルアー" },
      { fish: fish("sakuramasu"), monthStart: 3, monthEnd: 5, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeTohokuNihonkai,
  },

  // =========================================
  // 宮城県（4スポット: ss9015〜ss9018）
  // =========================================
  {
    id: "ss9015", name: "閖上漁港", slug: "yuriage-gyokou-a9",
    description: "名取川河口に隣接する漁港。ハゼ釣りの名所として知られ、秋には数釣りが楽しめる。投げ釣りのカレイも人気。",
    latitude: 38.1720, longitude: 140.9590,
    address: "〒981-1213 宮城県名取市閖上",
    accessInfo: "仙台東部道路名取ICから車で約10分",
    region: localRegion("rs9006"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },
  {
    id: "ss9016", name: "志津川漁港", slug: "shizugawa-gyokou-a9",
    description: "南三陸町の中心に位置する漁港。養殖筏が近くアイナメやカレイが豊富。震災復興後に整備され足場も良好。",
    latitude: 38.6770, longitude: 141.4520,
    address: "〒986-0700 宮城県本吉郡南三陸町志津川",
    accessInfo: "三陸自動車道志津川ICから車で約5分",
    region: localRegion("rs9007"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("ainame"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },
  {
    id: "ss9017", name: "雄勝漁港", slug: "ogatsu-gyokou-a9",
    description: "牡鹿半島の北側に位置するリアス海岸の漁港。アイナメやソイなどの根魚が豊富で、静かな環境でじっくり釣りが楽しめる。",
    latitude: 38.5290, longitude: 141.4690,
    address: "〒986-1300 宮城県石巻市雄勝町",
    accessInfo: "三陸自動車道河北ICから車で約30分",
    region: localRegion("rs9008"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("ainame"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("kurosoi"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夜", method: "ワーム" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },
  {
    id: "ss9018", name: "荒浜漁港（仙台）", slug: "arahama-gyokou-sendai-a9",
    description: "仙台市の海岸沿いにある漁港。ハゼ釣りの定番スポットで、秋の落ちハゼシーズンには良型が数多く釣れる。",
    latitude: 38.2140, longitude: 140.9700,
    address: "〒984-0032 宮城県仙台市若林区荒浜",
    accessInfo: "仙台東部道路荒浜ICから車で約5分",
    region: localRegion("rs9009"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車場あり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },

  // =========================================
  // 福島県（3スポット: ss9019〜ss9021）
  // =========================================
  {
    id: "ss9019", name: "四倉漁港", slug: "yotsukura-gyokou-a9",
    description: "いわき市北部の大型漁港。広い堤防から投げ釣りでカレイ、テトラ際でアイナメが狙える。駐車場やトイレも完備で快適。",
    latitude: 37.1130, longitude: 140.9990,
    address: "〒979-0201 福島県いわき市四倉町",
    accessInfo: "常磐自動車道いわき四倉ICから車で約5分",
    region: localRegion("rs9010"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車場あり（無料）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
      { fish: fish("ainame"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },
  {
    id: "ss9020", name: "勿来漁港・南側", slug: "nakoso-gyokou-minami-a9",
    description: "いわき市最南端の漁港で茨城県境に近い。南側の堤防はカレイの実績が高く、砂地沖合ではヒラメも期待できる。",
    latitude: 36.8720, longitude: 140.8230,
    address: "〒979-0146 福島県いわき市勿来町",
    accessInfo: "常磐自動車道勿来ICから車で約10分",
    region: localRegion("rs9011"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
      { fish: fish("hirame"), monthStart: 4, monthEnd: 12, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "泳がせ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeTohoku,
  },
  {
    id: "ss9021", name: "桧原湖・東岸", slug: "hibarako-higashigan-a9",
    description: "裏磐梯・桧原湖の東岸エリア。全国屈指のスモールマウスバスフィールドとして知られ、4〜11月はルアーフィッシング、結氷期の11〜3月は氷上のワカサギ穴釣りと一年を通して遊べる釣り場。バスは朝マヅメの時間帯が狙い目で、ワカサギは日中でも安定して楽しめる。湖岸に駐車スペースとトイレがあり、周辺に釣具店やレンタル竿の用意もあるため、ワカサギ釣りは初心者や家族連れでも挑戦しやすい。冬の氷上釣りは冷え込みが厳しく防寒対策を万全に。磐越自動車道猪苗代磐梯高原ICから車で約30分。",
    latitude: 37.7080, longitude: 140.0830,
    address: "〒966-0400 福島県耶麻郡北塩原村桧原",
    accessInfo: "磐越自動車道猪苗代磐梯高原ICから車で約30分",
    region: region("r637"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "湖岸駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.2, reviewCount: 0,
    catchableFish: [
      { fish: fish("blackbass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("wakasagi"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "穴釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeTohoku,
  },

  // =========================================
  // 茨城県（4スポット: ss9022〜ss9025）
  // =========================================
  {
    id: "ss9022", name: "涸沼・大場付近", slug: "hinuma-ooba-a9",
    description: "関東有数の汽水湖・涸沼の西岸エリア。シーバスの聖地として全国から釣り人が集まり、ハゼ釣りもファミリーに好評。",
    latitude: 36.3260, longitude: 140.3760,
    address: "〒311-1500 茨城県鉾田市大場付近",
    accessInfo: "北関東自動車道水戸南ICから車で約20分",
    region: region("r744"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "湖畔駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("suzuki"), monthStart: 4, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ルアー" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9023", name: "牛堀地区・霞ヶ浦", slug: "ushibori-kasumigaura-a9",
    description: "霞ヶ浦東岸の牛堀地区。護岸からバス釣りが楽しめるポイントが点在し、ヘラブナの管理釣り場も近い。",
    latitude: 35.9770, longitude: 140.4290,
    address: "〒311-2400 茨城県潮来市牛堀",
    accessInfo: "東関東自動車道潮来ICから車で約10分",
    region: localRegion("rs9012"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "護岸沿いに駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("blackbass"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("herabuna"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "へら竿" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9024", name: "利根川・神栖市付近河口域", slug: "tonegawa-kamisu-kakou-a9",
    description: "利根川河口部の広大な汽水域。シーバスのナイトゲームが盛んで、日中はハゼのちょい投げが手軽に楽しめる。",
    latitude: 35.7480, longitude: 140.7970,
    address: "〒314-0100 茨城県神栖市利根川河口付近",
    accessInfo: "東関東自動車道潮来ICから車で約20分",
    region: localRegion("rs9013"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("suzuki"), monthStart: 4, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btNight, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9025", name: "北浦・鉾田市付近", slug: "kitaura-hokota-a9",
    description: "霞ヶ浦に接続する北浦の南岸エリア。バス釣りの好ポイントが多く、冬場はドーム船でのワカサギ釣りも楽しめる。",
    latitude: 36.1050, longitude: 140.4900,
    address: "〒311-1500 茨城県鉾田市北浦付近",
    accessInfo: "東関東自動車道潮来ICから車で約30分",
    region: localRegion("rs9014"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "湖畔駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("blackbass"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("wakasagi"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ドーム船" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKanto,
  },

  // =========================================
  // 栃木県（5スポット: ss9026〜ss9030）
  // =========================================
  {
    id: "ss9026", name: "那珂川・烏山付近", slug: "nakagawa-karasuyama-a9",
    description: "那珂川中流域の人気渓流ポイント。関東随一のアユの名川として知られ、友釣りシーズンには多くの釣り師で賑わう。",
    latitude: 36.6530, longitude: 140.1520,
    address: "〒321-0600 栃木県那須烏山市那珂川沿い",
    accessInfo: "北関東自動車道宇都宮上三川ICから車で約40分",
    region: region("r624"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券2,000円前後）",
    hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.1, reviewCount: 0,
    catchableFish: [
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "日中", method: "友釣り" },
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },
  {
    id: "ss9027", name: "渡良瀬川・足利市", slug: "watarasegawa-ashikaga-a9",
    description: "足利市内を流れる渡良瀬川中流域。夏場のアユ釣りが盛んで、年間を通してコイのぶっこみ釣りも楽しめる。",
    latitude: 36.3400, longitude: 139.4530,
    address: "〒326-0000 栃木県足利市渡良瀬川沿い",
    accessInfo: "北関東自動車道足利ICから車で約10分",
    region: region("r684"), spotType: "river", difficulty: "beginner",
    isFree: false, feeDetail: "遊漁券が必要（日釣券1,500円前後）",
    hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "日中", method: "友釣り" },
      { fish: fish("koi"), monthStart: 3, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ぶっこみ釣り" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },
  {
    id: "ss9028", name: "箒川・那須塩原市", slug: "houkigawa-nasushiobara-a9",
    description: "塩原温泉郷を流れる清流。上流域はヤマメやイワナの渓流釣りが楽しめ、美しい渓谷の景色も魅力のフィールド。",
    latitude: 36.9230, longitude: 139.8240,
    address: "〒329-2800 栃木県那須塩原市箒川沿い",
    accessInfo: "東北自動車道西那須野塩原ICから車で約20分",
    region: region("r746"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券2,000円前後）",
    hasParking: true, parkingDetail: "渓流沿いに駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("iwana"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "エサ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },
  {
    id: "ss9029", name: "大芦川・鹿沼市", slug: "oashigawa-kanuma-a9",
    description: "鹿沼市を流れる清流で、透明度の高さが自慢。ヤマメやイワナが生息し、入渓しやすいポイントが多く渓流入門に最適。",
    latitude: 36.6170, longitude: 139.6470,
    address: "〒322-0000 栃木県鹿沼市大芦川沿い",
    accessInfo: "東北自動車道鹿沼ICから車で約20分",
    region: localRegion("rs9015"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券1,500円前後）",
    hasParking: true, parkingDetail: "川沿いに駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "エサ釣り" },
      { fish: fish("iwana"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "エサ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },
  {
    id: "ss9030", name: "湯ノ湖", slug: "yunoko-tochigi-a9",
    description: "奥日光の標高1,478mに位置する湖。ニジマスやホンマスが放流されており、フライフィッシングの聖地として知られる。",
    latitude: 36.8020, longitude: 139.4280,
    address: "〒321-1662 栃木県日光市湯元",
    accessInfo: "日光宇都宮道路清滝ICから車で約40分",
    region: region("r672"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券1,500円前後）",
    hasParking: true, parkingDetail: "湯元温泉駐車場あり（無料）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 5, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フライ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },

  // =========================================
  // 群馬県（5スポット: ss9031〜ss9035）
  // =========================================
  {
    id: "ss9031", name: "利根川・渋川市付近", slug: "tonegawa-shibukawa-a9",
    description: "利根川上流域の渋川市エリア。水量が豊富でアユの友釣りの名所。初夏から秋にかけてヤマメも上流で狙える。",
    latitude: 36.4890, longitude: 139.0080,
    address: "〒377-0000 栃木県渋川市利根川沿い",
    accessInfo: "関越自動車道渋川伊香保ICから車で約10分",
    region: region("r657"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券2,000円前後）",
    hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "日中", method: "友釣り" },
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },
  {
    id: "ss9032", name: "碓氷川・安中市", slug: "usuigawa-annaka-a9",
    description: "碓氷峠から流れ出す清流。安中市内のアクセスしやすい区間でアユやヤマメが釣れ、渓流入門にも適している。",
    latitude: 36.3270, longitude: 138.8850,
    address: "〒379-0100 群馬県安中市碓氷川沿い",
    accessInfo: "上信越自動車道松井田妙義ICから車で約10分",
    region: region("r747"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券1,500円前後）",
    hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "日中", method: "友釣り" },
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "エサ釣り" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },
  {
    id: "ss9033", name: "烏川・高崎市", slug: "karasugawa-takasaki-a9",
    description: "高崎市内を流れる烏川中流域。市街地に近くアクセスが良い。アユやコイのほか、オイカワなど小物釣りも楽しめる。",
    latitude: 36.3170, longitude: 139.0190,
    address: "〒370-0000 群馬県高崎市烏川沿い",
    accessInfo: "関越自動車道高崎ICから車で約10分",
    region: localRegion("rs9016"), spotType: "river", difficulty: "beginner",
    isFree: false, feeDetail: "遊漁券が必要（日釣券1,000円前後）",
    hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "日中", method: "友釣り" },
      { fish: fish("koi"), monthStart: 3, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ぶっこみ釣り" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },
  {
    id: "ss9034", name: "丸沼・ボート釣り", slug: "marunuma-boat-a9",
    description: "片品村の標高1,400mに位置する山上湖。ボートからニジマスやヒメマスが狙え、大自然の中で静かな釣りが楽しめる。",
    latitude: 36.8240, longitude: 139.3500,
    address: "〒378-0414 群馬県利根郡片品村丸沼",
    accessInfo: "関越自動車道沼田ICから車で約50分",
    region: region("r671"), spotType: "river", difficulty: "beginner",
    isFree: false, feeDetail: "ボート利用料・遊漁料が必要",
    hasParking: true, parkingDetail: "丸沼高原駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("himemasu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },
  {
    id: "ss9035", name: "桐生川・桐生市", slug: "kiryugawa-kiryu-a9",
    description: "桐生市北部を流れる清流。上流域ではヤマメやイワナの渓流釣りが楽しめ、市街地近くでも手軽に自然を満喫できる。",
    latitude: 36.4610, longitude: 139.3260,
    address: "〒376-0000 群馬県桐生市桐生川沿い",
    accessInfo: "北関東自動車道太田桐生ICから車で約25分",
    region: region("r759"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券1,500円前後）",
    hasParking: true, parkingDetail: "川沿いに駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "エサ釣り" },
      { fish: fish("iwana"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "エサ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeKantoRiver,
  },

  // =========================================
  // 東京都（7スポット: ss9036〜ss9042）
  // =========================================
  {
    id: "ss9036", name: "三宅島・伊ヶ谷漁港", slug: "miyakejima-igaya-a9",
    description: "三宅島西部の漁港で、黒潮の恩恵を受け魚影が濃い。堤防からメジナやイサキが狙え、離島ならではの豪快な釣りが楽しめる。",
    latitude: 34.0990, longitude: 139.4930,
    address: "〒100-1100 東京都三宅村伊ヶ谷",
    accessInfo: "竹芝桟橋からフェリーで約6時間30分",
    region: localRegion("rs9017"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.2, reviewCount: 0,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("isaki"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "カゴ釣り" },
      { fish: fish("kanpachi"), monthStart: 7, monthEnd: 10, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideStandard, mazumeInfo: mazumeIzu,
  },
  {
    id: "ss9037", name: "三宅島・三池港", slug: "miyakejima-miike-a9",
    description: "三宅島南部の主要港。潮通しが抜群でカンパチやメジナの大型が回遊する。港内ではサビキ釣りも楽しめる。",
    latitude: 34.0620, longitude: 139.5310,
    address: "〒100-1100 東京都三宅村三池",
    accessInfo: "三宅島空港から車で約10分",
    region: localRegion("rs9017"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港内駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.3, reviewCount: 0,
    catchableFish: [
      { fish: fish("kanpachi"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
      { fish: fish("mejina"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideStandard, mazumeInfo: mazumeIzu,
  },
  {
    id: "ss9038", name: "新島・前浜海岸", slug: "niijima-maehama-a9",
    description: "新島の東海岸に広がる白砂のビーチ。サーフからのヒラスズキが人気で、回遊次第ではカンパチも射程圏内に入る。",
    latitude: 34.3660, longitude: 139.2900,
    address: "〒100-0400 東京都新島村前浜",
    accessInfo: "竹芝桟橋からフェリーで約8時間、または調布飛行場から約35分",
    region: localRegion("rs9018"), spotType: "beach", difficulty: "advanced",
    isFree: true, hasParking: true, parkingDetail: "海岸駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("hirasuzuki"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("kanpachi"), monthStart: 7, monthEnd: 10, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideSurf, mazumeInfo: mazumeIzu,
  },
  {
    id: "ss9039", name: "八丈島・神湊漁港", slug: "hachijojima-kaminato-a9",
    description: "八丈島のメイン漁港。黒潮の直撃エリアでカンパチやシマアジなど高級魚が堤防から狙える、離島釣りの醍醐味が凝縮されたスポット。",
    latitude: 33.1190, longitude: 139.8050,
    address: "〒100-1500 東京都八丈町三根",
    accessInfo: "羽田空港からANA直行便で約55分",
    region: localRegion("rs9019"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港内駐車スペースあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("kanpachi"), monthStart: 6, monthEnd: 12, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング" },
      { fish: fish("isaki"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "カゴ釣り" },
      { fish: fish("mejina"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideStandard, mazumeInfo: mazumeIzu,
  },
  {
    id: "ss9040", name: "式根島・野伏港", slug: "shikinejima-nobushi-a9",
    description: "式根島の玄関口で連絡船の発着港。港内でもメジナやイサキが手軽に釣れ、離島ビギナーにもおすすめの釣り場。",
    latitude: 34.3270, longitude: 139.2210,
    address: "〒100-0500 東京都新島村式根島",
    accessInfo: "新島から連絡船で約15分",
    region: localRegion("rs9018"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: false, parkingDetail: "島内は徒歩・レンタサイクル移動",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("isaki"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "カゴ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeIzu,
  },
  {
    id: "ss9041", name: "隅田川テラス・両国付近", slug: "sumidagawa-ryogoku-a9",
    description: "都心の隅田川沿い遊歩道から手軽にシーバスやハゼが狙える。夜のシーバスゲームはビル群の夜景とともに楽しめる都市型フィッシング。",
    latitude: 35.6950, longitude: 139.7960,
    address: "〒130-0000 東京都墨田区両国付近",
    accessInfo: "JR両国駅から徒歩約5分",
    region: localRegion("rs9020"), spotType: "river", difficulty: "beginner",
    isFree: true, hasParking: false, parkingDetail: "周辺のコインパーキングを利用",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("suzuki"), monthStart: 4, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btNight, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9042", name: "中川・平井大橋付近", slug: "nakagawa-hiraiohashi-a9",
    description: "江戸川区の中川沿い。テナガエビの名所として有名で、夏場はエビ釣りファンで賑わう。ハゼ釣りも秋に好シーズンを迎える。",
    latitude: 35.7070, longitude: 139.8460,
    address: "〒132-0000 東京都江戸川区平井大橋付近",
    accessInfo: "JR平井駅から徒歩約10分",
    region: localRegion("rs9021"), spotType: "river", difficulty: "beginner",
    isFree: true, hasParking: false, parkingDetail: "周辺のコインパーキングを利用",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("tenagaebi"), monthStart: 5, monthEnd: 9, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "ウキ釣り" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeKanto,
  },

  // =========================================
  // 神奈川県（5スポット: ss9043〜ss9047）
  // =========================================
  {
    id: "ss9043", name: "真鶴・岩漁港", slug: "manazuru-iwa-gyokou-a9",
    description: "真鶴半島の先端近くにある岩漁港。周囲を磯に囲まれた好環境で、通年メジナ（グレ）がフカセ釣りで狙え、5〜11月にはブッコミ釣りで磯の王者イシダイも期待できる上級者好みのポイント。テトラ周りでは通年カサゴの穴釣りも楽しめ、初心者でも根魚に手が届く。漁港駐車場（有料）とトイレが整い、JR真鶴駅からバスで約15分。入場無料。相模湾の潮を受ける実績の高い神奈川県の漁港で、朝マヅメのメジナ狙いが特に有望だ。",
    latitude: 35.1510, longitude: 139.1430,
    address: "〒259-0200 神奈川県足柄下郡真鶴町岩",
    accessInfo: "JR真鶴駅からバスで約15分",
    region: region("r79"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車場あり（有料）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
      { fish: fish("ishidai"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ブッコミ" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideStandard, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9044", name: "横浜・本牧海づり施設", slug: "honmoku-umizuri-shisetsu-a9",
    description: "横浜港に面した有料の海釣り施設。安全な桟橋からアジやカサゴが狙え、道具のレンタルも充実。ファミリーの釣りデビューに最適。",
    latitude: 35.4190, longitude: 139.6710,
    address: "〒231-0811 神奈川県横浜市中区本牧ふ頭1番地",
    accessInfo: "JR根岸駅からバスで約15分",
    region: region("r6"), spotType: "pier", difficulty: "beginner",
    isFree: false, feeDetail: "大人900円（レンタル竿別途）",
    hasParking: true, parkingDetail: "施設駐車場あり（有料）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: true,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.1, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "ブラクリ" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePier, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9045", name: "金沢八景・野島公園護岸", slug: "kanazawahakkei-nojima-a9",
    description: "平潟湾に面した公園護岸で、足場が良くファミリーに人気。秋のハゼ釣りと冬のカレイ釣りが定番。",
    latitude: 35.3280, longitude: 139.6280,
    address: "〒236-0025 神奈川県横浜市金沢区野島町",
    accessInfo: "京急金沢八景駅から徒歩約15分",
    region: localRegion("rs9023"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "野島公園駐車場あり（有料）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideBreakwater, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9046", name: "大磯港・西堤防", slug: "oiso-nishi-teihou-a9",
    description: "湘南の大磯港西側の堤防。相模湾に面し潮通しが良く、アジのサビキ釣りやメジナのフカセ釣りが楽しめる人気スポット。",
    latitude: 35.3030, longitude: 139.3100,
    address: "〒255-0003 神奈川県中郡大磯町大磯",
    accessInfo: "JR大磯駅から徒歩約15分",
    region: localRegion("rs9022"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "大磯港駐車場あり（有料）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mejina"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tideBreakwater, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9047", name: "三崎港・花暮岸壁", slug: "misakikou-hanagure-a9",
    description: "三浦半島先端のマグロの町・三崎港。花暮岸壁は足場が良くアジやサバのサビキ釣りで賑わう。周辺の飲食店でマグロ料理も楽しめる。",
    latitude: 35.1400, longitude: 139.6180,
    address: "〒238-0200 神奈川県三浦市三崎町花暮",
    accessInfo: "京急三崎口駅からバスで約15分",
    region: region("r8"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "三崎港周辺に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "ブラクリ" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePier, mazumeInfo: mazumeKanto,
  },

  // =========================================
  // 千葉県（4スポット: ss9048〜ss9051）
  // =========================================
  {
    id: "ss9048", name: "勝山漁港", slug: "katsuyama-gyokou-a9",
    description: "鋸南町の内房に面した漁港。東京湾の入り口に位置し、アジやメジナの魚影が濃い。堤防釣りの環境が整っておりファミリーにも人気。",
    latitude: 35.0850, longitude: 139.8350,
    address: "〒299-2100 千葉県安房郡鋸南町勝山",
    accessInfo: "富津館山道路鋸南保田ICから車で約5分",
    region: localRegion("rs9024"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mejina"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9049", name: "船橋三番瀬海浜公園護岸", slug: "funabashi-sanbanze-gogan-a9",
    description: "東京湾最奥部の干潟に面した公園護岸。ハゼ釣りの超定番スポットで、秋には家族連れで大盛況。冬はカレイの実績もある。",
    latitude: 35.6730, longitude: 139.9630,
    address: "〒273-0016 千葉県船橋市潮見町",
    accessInfo: "JR船橋駅からバスで約25分",
    region: localRegion("rs9025"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "公園駐車場あり（有料）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "投げ釣り" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tidePier, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9050", name: "興津漁港", slug: "okitsu-gyokou-chiba-a9",
    description: "勝浦市の外房に面した中規模漁港。潮通しが良くアジの回遊が安定しており、堤防先端ではメジナも狙える好ポイント。",
    latitude: 35.1380, longitude: 140.2650,
    address: "〒299-5200 千葉県勝浦市興津",
    accessInfo: "圏央道市原鶴舞ICから車で約50分",
    region: localRegion("rs9026"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("mejina"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フカセ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeKanto,
  },
  {
    id: "ss9051", name: "浜金谷港・南側", slug: "hamakanaya-minami-a9",
    description: "東京湾フェリーの発着地に隣接する漁港。南側の堤防はアジやカサゴが安定して釣れ、対岸の富士山を眺めながら釣りが楽しめる。",
    latitude: 35.1560, longitude: 139.8250,
    address: "〒299-1861 千葉県富津市金谷",
    accessInfo: "JR浜金谷駅から徒歩約5分",
    region: localRegion("rs9027"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "ブラクリ" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeKanto,
  },

  // =========================================
  // 山梨県（5スポット: ss9052〜ss9056）
  // =========================================
  {
    id: "ss9052", name: "精進湖", slug: "shojiko-yamanashi-a9",
    description: "富士五湖の中で最も小さい静かな湖。ヘラブナの聖地として名高く、冬場はワカサギのボート釣りも人気。富士山の絶景も魅力。",
    latitude: 35.4720, longitude: 138.6060,
    address: "〒401-0336 山梨県南都留郡富士河口湖町精進",
    accessInfo: "中央自動車道河口湖ICから車で約20分",
    region: region("r632"), spotType: "river", difficulty: "beginner",
    isFree: false, feeDetail: "遊漁券が必要（ボート利用料別途）",
    hasParking: true, parkingDetail: "湖畔駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("herabuna"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "へら竿" },
      { fish: fish("wakasagi"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ボート" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeYamanashi,
  },
  {
    id: "ss9053", name: "桂川中流域・大月市", slug: "katsuragawa-otsuki-a9",
    description: "大月市内を流れる桂川の中流域。都心からアクセスしやすく、ヤマメやイワナが渓流の雰囲気の中で手軽に狙える。",
    latitude: 35.6110, longitude: 138.9380,
    address: "〒401-0000 山梨県大月市桂川沿い",
    accessInfo: "中央自動車道大月ICから車で約5分",
    region: region("r612"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券1,500円前後）",
    hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("iwana"), monthStart: 3, monthEnd: 9, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "エサ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeYamanashi,
  },
  {
    id: "ss9054", name: "笛吹川・石和温泉付近", slug: "fuefukigawa-isawa-a9",
    description: "石和温泉街を流れる笛吹川中流域。夏場のアユ釣りが盛んで、温泉宿に泊まりながら釣りを楽しむスタイルが人気。",
    latitude: 35.6580, longitude: 138.6350,
    address: "〒406-0000 山梨県笛吹市石和町笛吹川沿い",
    accessInfo: "中央自動車道一宮御坂ICから車で約10分",
    region: region("r613"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券1,500円前後）",
    hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "日中", method: "友釣り" },
      { fish: fish("oikawa"), monthStart: 4, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "毛バリ" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeYamanashi,
  },
  {
    id: "ss9055", name: "道志川・道志村", slug: "doshigawa-doshimura-a9",
    description: "道志村を流れる清流で、キャンプ場と併設のポイントも多い。ヤマメやイワナが棲む渓流で、アウトドアと釣りを同時に楽しめる。",
    latitude: 35.5180, longitude: 139.0560,
    address: "〒402-0200 山梨県南都留郡道志村道志川沿い",
    accessInfo: "中央自動車道相模湖ICから車で約30分",
    region: region("r693"), spotType: "river", difficulty: "intermediate",
    isFree: false, feeDetail: "遊漁券が必要（日釣券1,500円前後）",
    hasParking: true, parkingDetail: "キャンプ場や川沿いに駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "エサ釣り" },
      { fish: fish("iwana"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "エサ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeYamanashi,
  },
  {
    id: "ss9056", name: "四尾連湖", slug: "shibirekko-a9",
    description: "市川三郷町の山上にある神秘的な湖。ヘラブナやコイが棲み、静寂な環境でのんびり釣りが楽しめる隠れた名所。",
    latitude: 35.5740, longitude: 138.4820,
    address: "〒409-3600 山梨県西八代郡市川三郷町四尾連",
    accessInfo: "中央自動車道甲府南ICから車で約40分",
    region: localRegion("rs9028"), spotType: "river", difficulty: "beginner",
    isFree: false, feeDetail: "遊漁料が必要",
    hasParking: true, parkingDetail: "湖畔駐車場あり（有料）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("herabuna"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "へら竿" },
      { fish: fish("koi"), monthStart: 3, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ぶっこみ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideFreshwater, mazumeInfo: mazumeYamanashi,
  },
];
