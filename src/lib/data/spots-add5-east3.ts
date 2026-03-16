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

const localRegions: Region[] = [
  { id: "re5080", prefecture: "山梨県", areaName: "富士五湖", slug: "yamanashi-fujigoko" },
  { id: "re5081", prefecture: "山梨県", areaName: "桂川・道志川", slug: "yamanashi-katsuragawa-doshigawa" },
  { id: "re5090", prefecture: "岩手県", areaName: "宮古・田老", slug: "iwate-miyako-taro" },
  { id: "re5091", prefecture: "岩手県", areaName: "大船渡・釜石", slug: "iwate-ofunato-kamaishi" },
  { id: "re5100", prefecture: "秋田県", areaName: "男鹿半島", slug: "akita-oga" },
  { id: "re5101", prefecture: "秋田県", areaName: "秋田市・潟上", slug: "akita-shi-katagami" },
  { id: "re5110", prefecture: "埼玉県", areaName: "荒川・入間川", slug: "saitama-arakawa-irumagawa" },
  { id: "re5111", prefecture: "埼玉県", areaName: "利根川・中川", slug: "saitama-tone-nakagawa" },
  { id: "re5120", prefecture: "北海道", areaName: "苫小牧・室蘭", slug: "hokkaido-tomakomai-muroran" },
  { id: "re5121", prefecture: "北海道", areaName: "函館・道南", slug: "hokkaido-hakodate-donan" },
  { id: "re5130", prefecture: "青森県", areaName: "八戸・階上", slug: "aomori-hachinohe-hashikami" },
  { id: "re5131", prefecture: "青森県", areaName: "むつ・下北", slug: "aomori-mutsu-shimokita" },
  { id: "re5140", prefecture: "千葉県", areaName: "木更津・富津", slug: "chiba-kisarazu-futtsu-e5" },
  { id: "re5141", prefecture: "千葉県", areaName: "勝浦・御宿", slug: "chiba-katsuura-onjuku" },
];

function localRegion(id: string) {
  return localRegions.find((r) => r.id === id) || region(id);
}

const mazumeEast = {
  springSunrise: "5:15頃", springSunset: "18:15頃",
  summerSunrise: "4:15頃", summerSunset: "19:00頃",
  autumnSunrise: "5:30頃", autumnSunset: "17:00頃",
  winterSunrise: "6:50頃", winterSunset: "16:25頃",
  tip: "東日本は太平洋側と日本海側で気候が大きく異なる。太平洋側は黒潮の影響で温暖、日本海側は冬季に荒天が多い。",
};
const mazumeInland = {
  springSunrise: "5:20頃", springSunset: "18:10頃",
  summerSunrise: "4:25頃", summerSunset: "19:00頃",
  autumnSunrise: "5:30頃", autumnSunset: "17:00頃",
  winterSunrise: "6:50頃", winterSunset: "16:30頃",
  tip: "内陸部の河川・湖沼は朝夕の気温差が大きく、マヅメ時の活性が高い。渓流は水温変化に敏感。",
};
const mazumeNorth = {
  springSunrise: "5:00頃", springSunset: "18:20頃",
  summerSunrise: "4:00頃", summerSunset: "19:15頃",
  autumnSunrise: "5:15頃", autumnSunset: "17:00頃",
  winterSunrise: "6:45頃", winterSunset: "16:15頃",
  tip: "北日本は夏のマヅメが早く長い。冬は日照時間が短いため午前中が勝負。",
};

const btMorning = [
  { label: "朝マヅメ", timeRange: "5:00〜7:30", rating: "best" as const },
  { label: "日中", timeRange: "10:00〜14:00", rating: "good" as const },
  { label: "夕マヅメ", timeRange: "16:30〜18:30", rating: "good" as const },
  { label: "夜", timeRange: "20:00〜23:00", rating: "fair" as const },
];
const btEvening = [
  { label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "good" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "fair" as const },
  { label: "夕マヅメ", timeRange: "16:00〜18:30", rating: "best" as const },
  { label: "夜", timeRange: "19:00〜22:00", rating: "good" as const },
];
const btAllDay = [
  { label: "朝", timeRange: "6:00〜9:00", rating: "best" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "good" as const },
  { label: "夕方", timeRange: "15:00〜18:00", rating: "best" as const },
  { label: "夜", timeRange: "19:00〜21:00", rating: "fair" as const },
];
const btNight = [
  { label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "good" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "fair" as const },
  { label: "夕マヅメ", timeRange: "16:00〜18:30", rating: "good" as const },
  { label: "夜", timeRange: "19:00〜23:00", rating: "best" as const },
];

const tideStandard = { bestTide: "中潮〜大潮", bestTidePhase: "上げ潮〜満潮前後", description: "潮が動く時間帯に回遊魚の活性が上がります。" };
const tideSurf = { bestTide: "大潮〜中潮", bestTidePhase: "下げ始め", description: "サーフでは下げ潮で離岸流が発生し、魚が集まりやすくなります。" };
const tidePort = { bestTide: "中潮〜大潮", bestTidePhase: "満潮前後", description: "港内は満潮前後に小魚が入りやすく、それを追って大型魚も回遊します。" };
const tideRiver = { bestTide: "中潮", bestTidePhase: "上げ潮", description: "河川・湖沼は潮汐の影響は少ないが、気圧変化や水温変化で活性が変わります。" };

export const eastAdd5Spots3: FishingSpot[] = [
  // =========================================
  // 山梨県（14スポット: se5097〜se5110）内陸・淡水
  // =========================================
  {
    id: "se5097", name: "河口湖", slug: "kawaguchiko-tsuri",
    description: "富士五湖で最もアクセスが良い湖。ブラックバスのメッカで全国から釣り人が集まる。ワカサギ釣りのドーム船も人気。",
    latitude: 35.5170, longitude: 138.7530,
    address: "〒401-0301 山梨県南都留郡富士河口湖町船津",
    accessInfo: "富士急行線河口湖駅から徒歩約10分。中央自動車道河口湖ICから約10分。",
    region: localRegion("re5080"), spotType: "river", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "湖畔に複数の有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: true,
    feeDetail: "遊漁券: 日券1,100円。ドーム船3,500円〜",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("blackbass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("wakasagi"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ワカサギ釣り" },
      { fish: fish("nijimasu"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5098", name: "山中湖", slug: "yamanakako-tsuri",
    description: "富士五湖の中で最大面積の湖。標高が高く夏でも涼しい。ワカサギ釣りのドーム船と岸からのバス釣りが楽しめる。",
    latitude: 35.4100, longitude: 138.8690,
    address: "〒401-0502 山梨県南都留郡山中湖村平野",
    accessInfo: "富士急行線富士山駅からバスで約30分。東富士五湖道路山中湖ICから約5分。",
    region: localRegion("re5080"), spotType: "river", difficulty: "beginner",
    isFree: false, hasParking: true, parkingDetail: "湖畔に複数の駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: true,
    feeDetail: "遊漁券: 日券600円。ドーム船3,500円〜",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("wakasagi"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ワカサギ釣り" },
      { fish: fish("blackbass"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5099", name: "西湖", slug: "saiko-tsuri",
    description: "富士五湖の中で最も自然が残る湖。ヒメマスの放流があり、トローリングやルアーで狙える。クニマスの再発見でも有名。",
    latitude: 35.5010, longitude: 138.6900,
    address: "〒401-0332 山梨県南都留郡富士河口湖町西湖",
    accessInfo: "富士急行線河口湖駅からバスで約30分。中央自動車道河口湖ICから約20分。",
    region: localRegion("re5080"), spotType: "river", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "湖畔に駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券1,100円",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("blackbass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("nijimasu"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5100", name: "精進湖", slug: "shojiko-tsuri",
    description: "富士五湖で最も小さい湖。ヘラブナ釣りの名所として知られ、富士山の眺望が素晴らしい。静かな環境でじっくり釣りができる。",
    latitude: 35.4830, longitude: 138.6590,
    address: "〒401-0336 山梨県南都留郡富士河口湖町精進",
    accessInfo: "中央自動車道河口湖ICから約25分。",
    region: localRegion("re5080"), spotType: "river", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "湖畔に駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券1,100円",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("hera"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "ヘラブナ釣り" },
      { fish: fish("blackbass"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5101", name: "本栖湖", slug: "motosuko-tsuri",
    description: "富士五湖で最も水深が深く水質が透明な湖。大型のニジマスやイワナが狙える。千円札の裏面の富士山はここから撮影された。",
    latitude: 35.4660, longitude: 138.5900,
    address: "〒409-3714 山梨県南巨摩郡身延町中ノ倉",
    accessInfo: "中央自動車道河口湖ICから約30分。",
    region: localRegion("re5080"), spotType: "river", difficulty: "advanced",
    isFree: false, hasParking: true, parkingDetail: "湖畔に駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券1,100円",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5102", name: "桂川 都留エリア", slug: "katsuragawa-tsuru",
    description: "都留市を流れる桂川中流域。アユの友釣りが盛んで、渓流釣りではヤマメも狙える。リニア見学センターの近く。",
    latitude: 35.5530, longitude: 138.9100,
    address: "〒402-0001 山梨県都留市田原",
    accessInfo: "富士急行線都留文科大学前駅から徒歩約10分。中央自動車道都留ICから約5分。",
    region: localRegion("re5081"), spotType: "river", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "河川沿いに駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券2,000円（アユ）",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "友釣り" },
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "渓流ルアー" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5103", name: "道志川", slug: "doshigawa-tsuri",
    description: "道志村を流れる清流。横浜市の水源として知られ水質が良い。ヤマメやイワナの渓流釣りが楽しめるキャンプと釣りの聖地。",
    latitude: 35.4940, longitude: 139.0480,
    address: "〒402-0209 山梨県南都留郡道志村",
    accessInfo: "中央自動車道相模湖ICから約40分。",
    region: localRegion("re5081"), spotType: "river", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "河川沿いのキャンプ場駐車場を利用",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券1,500円",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "渓流ルアー" },
      { fish: fish("iwana"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "渓流エサ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5104", name: "四尾連湖", slug: "shibire-ko",
    description: "市川三郷町にある標高880mの静かな山上湖。ヘラブナ釣りの穴場で、手漕ぎボートからの釣りが風情がある。",
    latitude: 35.5370, longitude: 138.5310,
    address: "〒409-3602 山梨県西八代郡市川三郷町山保",
    accessInfo: "中央自動車道甲府南ICから約40分。JR身延線市川大門駅から車で約30分。",
    region: localRegion("re5081"), spotType: "river", difficulty: "beginner",
    isFree: false, hasParking: true, parkingDetail: "湖畔に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券500円。ボート代別途",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("hera"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "ヘラブナ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5105", name: "笛吹川 石和エリア", slug: "fuefukigawa-isawa",
    description: "石和温泉で有名なエリアを流れる笛吹川。アユの友釣りやオイカワ釣りが楽しめる。温泉帰りに気軽に竿を出せる。",
    latitude: 35.6520, longitude: 138.6370,
    address: "〒406-0024 山梨県笛吹市石和町川中島",
    accessInfo: "JR石和温泉駅から徒歩約10分。中央自動車道一宮御坂ICから約10分。",
    region: localRegion("re5081"), spotType: "river", difficulty: "beginner",
    isFree: false, hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券2,000円（アユ）",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "友釣り" },
      { fish: fish("oikawa"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "毛バリ" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5106", name: "早川 奈良田エリア", slug: "hayakawa-narada",
    description: "南アルプスの麓を流れる早川の上流域。イワナの宝庫として知られ、天然イワナが棲む秘境的な渓流フィールド。",
    latitude: 35.4730, longitude: 138.3240,
    address: "〒409-2701 山梨県南巨摩郡早川町奈良田",
    accessInfo: "中部横断自動車道南部ICから約60分。JR身延駅から車で約50分。",
    region: localRegion("re5081"), spotType: "river", difficulty: "advanced",
    isFree: false, hasParking: true, parkingDetail: "河川沿いに駐車スペース点在",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券1,500円",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("iwana"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝", method: "渓流エサ釣り" },
      { fish: fish("amago"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "渓流ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5107", name: "釜無川 韮崎エリア", slug: "kamanashigawa-nirasaki",
    description: "韮崎市を流れる釜無川。富士川の上流にあたり、アユの友釣りが盛ん。河川敷が広く開放的な釣り場。",
    latitude: 35.7130, longitude: 138.4510,
    address: "〒407-0024 山梨県韮崎市本町",
    accessInfo: "JR韮崎駅から徒歩約15分。中央自動車道韮崎ICから約5分。",
    region: localRegion("re5081"), spotType: "river", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "河川敷に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券2,000円（アユ）",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "友釣り" },
      { fish: fish("oikawa"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "毛バリ" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5108", name: "桂川 大月エリア", slug: "katsuragawa-otsuki",
    description: "大月市を流れる桂川。中央線沿いでアクセス抜群。ヤマメやイワナの渓流釣りから、下流のアユ友釣りまで楽しめる。",
    latitude: 35.6120, longitude: 138.9410,
    address: "〒401-0013 山梨県大月市大月町花咲",
    accessInfo: "JR大月駅から徒歩約10分。中央自動車道大月ICから約5分。",
    region: localRegion("re5081"), spotType: "river", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "河川沿いに駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券1,500円",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "渓流ルアー" },
      { fish: fish("ayu"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "友釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5109", name: "丹波川", slug: "tabagawa-tsuri",
    description: "丹波山村を流れる多摩川の源流部。イワナやヤマメが棲む清流で、東京都の水源地としても重要。秘境感あふれる渓流。",
    latitude: 35.7920, longitude: 138.9370,
    address: "〒409-0300 山梨県北都留郡丹波山村丹波",
    accessInfo: "JR奥多摩駅からバスで約40分。中央自動車道勝沼ICから約50分。",
    region: localRegion("re5081"), spotType: "river", difficulty: "advanced",
    isFree: false, hasParking: true, parkingDetail: "河川沿いに駐車スペース点在",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券1,500円",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("iwana"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝", method: "渓流エサ釣り" },
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "渓流ルアー" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },
  {
    id: "se5110", name: "千代田湖", slug: "chiyoda-ko",
    description: "甲府市北部にある小さな湖。ヘラブナ釣りの穴場で、桟橋が整備されている。甲府市街からのアクセスが良い。",
    latitude: 35.6990, longitude: 138.5290,
    address: "〒400-0013 山梨県甲府市岩窪町",
    accessInfo: "JR甲府駅から車で約20分。中央自動車道甲府昭和ICから約20分。",
    region: localRegion("re5081"), spotType: "river", difficulty: "beginner",
    isFree: false, hasParking: true, parkingDetail: "湖畔に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    feeDetail: "遊漁券: 日券500円",
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.4, reviewCount: 0,
    catchableFish: [
      { fish: fish("hera"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "ヘラブナ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeInland,
  },

  // =========================================
  // 岩手県（10スポット: se5111〜se5120）
  // =========================================
  {
    id: "se5111", name: "宮古港", slug: "miyako-kou",
    description: "三陸海岸の中心的な漁港。浄土ヶ浜のすぐ近くで、ソイやアイナメの根魚が豊富。港内は穏やかで初心者にも優しい。",
    latitude: 39.6370, longitude: 141.9700,
    address: "〒027-0075 宮城県宮古市鍬ヶ崎",
    accessInfo: "JR宮古駅から車で約5分。三陸自動車道宮古中央ICから約10分。",
    region: localRegion("re5090"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("kurosoi"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "ワーム" },
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ブラクリ" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeNorth,
  },
  {
    id: "se5112", name: "大船渡港", slug: "ofunato-kou",
    description: "大船渡市の大型漁港。サンマの水揚げで有名だが釣りも盛んで、堤防からアイナメやソイの大物が期待できる。",
    latitude: 39.0710, longitude: 141.7400,
    address: "〒022-0002 大船渡市大船渡町茶屋前",
    accessInfo: "三陸自動車道大船渡ICから約5分。JR大船渡駅（BRT）から徒歩約15分。",
    region: localRegion("re5091"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ブラクリ" },
      { fish: fish("kurosoi"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "ワーム" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeNorth,
  },
  {
    id: "se5113", name: "釜石港", slug: "kamaishi-kou",
    description: "製鉄の街として知られる釜石の港。堤防からソイやメバルが通年で楽しめ、秋にはサバの回遊もある活気ある漁港。",
    latitude: 39.2670, longitude: 141.8940,
    address: "〒026-0024 岩手県釜石市大町",
    accessInfo: "三陸自動車道釜石中央ICから約5分。JR釜石駅から車で約5分。",
    region: localRegion("re5091"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("kurosoi"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "ワーム" },
      { fish: fish("mebaru"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "ワーム" },
      { fish: fish("saba"), monthStart: 8, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeNorth,
  },
  {
    id: "se5114", name: "田老漁港", slug: "taro-gyokou",
    description: "宮古市の田老地区にある漁港。三陸のリアス海岸に面し、根魚の宝庫。大防潮堤が整備された安全な釣り場。",
    latitude: 39.7270, longitude: 141.9640,
    address: "〒027-0301 岩手県宮古市田老",
    accessInfo: "三陸自動車道田老北ICから約5分。JR宮古駅から車で約20分。",
    region: localRegion("re5090"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ブラクリ" },
      { fish: fish("kurosoi"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "ワーム" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeNorth,
  },
  {
    id: "se5115", name: "山田港", slug: "yamada-kou-iwate",
    description: "山田町の牡蠣養殖で有名な湾内の漁港。穏やかな海面でカレイの投げ釣りやメバルの根魚釣りが楽しめる。",
    latitude: 39.4670, longitude: 141.9510,
    address: "〒028-1332 岩手県下閉伊郡山田町川向町",
    accessInfo: "三陸自動車道山田ICから約5分。JR宮古駅から車で約30分。",
    region: localRegion("re5090"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
      { fish: fish("mebaru"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "ワーム" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeNorth,
  },
  {
    id: "se5116", name: "吉浜漁港", slug: "yoshihama-gyokou",
    description: "大船渡市南部のリアス海岸にある漁港。ホタテ養殖の傍ら、堤防からアイナメやソイの良型が上がる穴場。",
    latitude: 39.0160, longitude: 141.7880,
    address: "〒022-0101 岩手県大船渡市三陸町吉浜",
    accessInfo: "三陸自動車道三陸ICから約15分。",
    region: localRegion("re5091"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ブラクリ" },
      { fish: fish("kurosoi"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "ワーム" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeNorth,
  },
  {
    id: "se5117", name: "重茂半島", slug: "omoe-hanto",
    description: "本州最東端に位置する重茂半島の磯場。潮通し抜群で大型のアイナメやクロソイが狙える上級者向けの岩場ポイント。",
    latitude: 39.6010, longitude: 142.0680,
    address: "〒027-0111 岩手県宮古市重茂",
    accessInfo: "JR宮古駅から車で約40分。三陸自動車道宮古中央ICから約30分。",
    region: localRegion("re5090"), spotType: "rocky", difficulty: "advanced",
    isFree: true, hasParking: true, parkingDetail: "漁港付近に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ブラクリ" },
      { fish: fish("kurosoi"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ワーム" },
      { fish: fish("mebaru"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "ワーム" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideStandard, mazumeInfo: mazumeNorth,
  },
  {
    id: "se5118", name: "陸前高田 広田港", slug: "rikuzentakata-hirota-kou",
    description: "陸前高田市の広田湾にある漁港。牡蠣やホタテの養殖が盛んな穏やかな湾で、カレイやアイナメの実績がある。",
    latitude: 38.9810, longitude: 141.6870,
    address: "〒029-2207 岩手県陸前高田市広田町",
    accessInfo: "三陸自動車道陸前高田ICから約15分。",
    region: localRegion("re5091"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ブラクリ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeNorth,
  },
  {
    id: "se5119", name: "岩泉 小本港", slug: "iwaizumi-omoto-kou",
    description: "岩泉町の小本川河口にある漁港。龍泉洞の街として知られ、サケの遡上シーズンは見応えがある。ソイやメバルの根魚釣り場。",
    latitude: 39.7520, longitude: 141.9340,
    address: "〒027-0421 岩手県下閉伊郡岩泉町小本",
    accessInfo: "三陸自動車道岩泉龍泉洞ICから約20分。",
    region: localRegion("re5090"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("kurosoi"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "ワーム" },
      { fish: fish("mebaru"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "ワーム" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeNorth,
  },
  {
    id: "se5120", name: "越喜来漁港", slug: "okkirai-gyokou",
    description: "大船渡市の越喜来湾にある漁港。静かな湾内でカレイやアイナメが狙える。三陸の海の幸を間近に感じられる。",
    latitude: 39.0880, longitude: 141.8010,
    address: "〒022-0211 岩手県大船渡市三陸町越喜来",
    accessInfo: "三陸自動車道三陸ICから約10分。",
    region: localRegion("re5091"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
      { fish: fish("ainame"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ブラクリ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeNorth,
  },
];