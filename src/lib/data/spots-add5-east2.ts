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
  { id: "re5040", prefecture: "東京都", areaName: "江東・お台場", slug: "tokyo-koto-odaiba" },
  { id: "re5041", prefecture: "東京都", areaName: "大田・品川", slug: "tokyo-ota-shinagawa" },
  { id: "re5050", prefecture: "神奈川県", areaName: "真鶴・湯河原", slug: "kanagawa-manazuru-yugawara" },
  { id: "re5051", prefecture: "神奈川県", areaName: "横須賀・三浦", slug: "kanagawa-yokosuka-miura" },
  { id: "re5060", prefecture: "茨城県", areaName: "鹿嶋・波崎", slug: "ibaraki-kashima-hasaki" },
  { id: "re5061", prefecture: "茨城県", areaName: "大洗・那珂湊", slug: "ibaraki-oarai-nakaminato" },
  { id: "re5070", prefecture: "宮城県", areaName: "石巻・牡鹿", slug: "miyagi-ishinomaki-oshika" },
  { id: "re5071", prefecture: "宮城県", areaName: "塩釜・松島", slug: "miyagi-shiogama-matsushima" },
  { id: "re5072", prefecture: "宮城県", areaName: "気仙沼・南三陸", slug: "miyagi-kesennuma-minamisanriku" },
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
const btNight = [
  { label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "good" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "fair" as const },
  { label: "夕マヅメ", timeRange: "16:00〜18:30", rating: "good" as const },
  { label: "夜", timeRange: "19:00〜23:00", rating: "best" as const },
];
const btAllDay = [
  { label: "朝", timeRange: "6:00〜9:00", rating: "best" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "good" as const },
  { label: "夕方", timeRange: "15:00〜18:00", rating: "best" as const },
  { label: "夜", timeRange: "19:00〜21:00", rating: "fair" as const },
];

const tideStandard = { bestTide: "中潮〜大潮", bestTidePhase: "上げ潮〜満潮前後", description: "潮が動く時間帯に回遊魚の活性が上がります。" };
const tideSurf = { bestTide: "大潮〜中潮", bestTidePhase: "下げ始め", description: "サーフでは下げ潮で離岸流が発生し、魚が集まりやすくなります。" };
const tidePort = { bestTide: "中潮〜大潮", bestTidePhase: "満潮前後", description: "港内は満潮前後に小魚が入りやすく、それを追って大型魚も回遊します。" };
const tideRiver = { bestTide: "中潮", bestTidePhase: "上げ潮", description: "河川・湖沼は潮汐の影響は少ないが、気圧変化や水温変化で活性が変わります。" };

export const eastAdd5Spots2: FishingSpot[] = [
  // =========================================
  // 東京都（12スポット: se5049〜se5060）
  // =========================================
  {
    id: "se5049", name: "若洲海浜公園", slug: "wakasu-kaihin-kouen",
    description: "東京ゲートブリッジのたもとにある釣り公園。柵付きの護岸で安全にサビキ釣りが楽しめ、都心からのアクセスも良好。夜釣りも可能。",
    latitude: 35.6150, longitude: 139.8310,
    address: "〒136-0083 東京都江東区若洲三丁目",
    accessInfo: "JR新木場駅からバスで約15分。首都高速湾岸線新木場ICから約5分。",
    region: localRegion("re5040"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "有料駐車場あり（1回500円）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: true,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5050", name: "豊洲ぐるり公園", slug: "toyosu-gururi-kouen",
    description: "豊洲市場の周囲を囲む公園。護岸沿いでハゼやシーバスが狙える都心の人気釣り場。夜景を楽しみながらの夜釣りも魅力。",
    latitude: 35.6470, longitude: 139.7870,
    address: "〒135-0061 東京都江東区豊洲六丁目",
    accessInfo: "ゆりかもめ市場前駅から徒歩約5分。有楽町線豊洲駅から徒歩約10分。",
    region: localRegion("re5040"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "周辺有料駐車場を利用",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
    ],
    bestTimes: btNight, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5051", name: "大井ふ頭中央海浜公園", slug: "ooi-futou-chuou-kaihin",
    description: "品川区の運河沿いの公園。ハゼ釣りの名所として知られ、秋には大型のマハゼが数釣りできる。BBQ場も併設。",
    latitude: 35.6010, longitude: 139.7530,
    address: "〒140-0003 東京都品川区八潮四丁目",
    accessInfo: "東京モノレール大井競馬場前駅から徒歩約10分。",
    region: localRegion("re5041"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "有料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5052", name: "城南島海浜公園", slug: "jonan-jima-kaihin",
    description: "大田区の人工島にある海浜公園。砂浜と護岸があり投げ釣りでカレイやキスが狙える。飛行機の離着陸を間近に見られるスポット。",
    latitude: 35.5780, longitude: 139.7700,
    address: "〒143-0002 東京都大田区城南島四丁目",
    accessInfo: "JR大森駅からバスで約20分。首都高速湾岸線大井南ICから約10分。",
    region: localRegion("re5041"), spotType: "beach", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "有料駐車場あり（1回300〜500円）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝", method: "投げ釣り" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideSurf, mazumeInfo: mazumeEast,
  },
  {
    id: "se5053", name: "暁ふ頭公園", slug: "akatsuki-futou-kouen",
    description: "お台場エリアの釣り場。東京港に面した護岸からハゼやシーバスが狙え、レインボーブリッジの眺望が素晴らしい。",
    latitude: 35.6280, longitude: 139.7740,
    address: "〒135-0064 東京都江東区青海二丁目",
    accessInfo: "ゆりかもめテレコムセンター駅から徒歩約5分。",
    region: localRegion("re5040"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "周辺有料駐車場を利用",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
    ],
    bestTimes: btNight, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5054", name: "東扇島西公園", slug: "higashi-ougijima-nishi-kouen",
    description: "川崎市の東扇島にある釣り公園。柵付きの護岸が約500m続き、アジやイワシのサビキから大物のシーバスまで狙える人気スポット。",
    latitude: 35.4710, longitude: 139.7520,
    address: "〒210-0869 神奈川県川崎市川崎区東扇島",
    accessInfo: "JR川崎駅からバスで約30分。首都高速湾岸線東扇島ICから約5分。",
    region: localRegion("re5041"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "有料駐車場あり（1回800円）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5055", name: "旧中川・平井大橋付近", slug: "kyu-nakagawa-hirai",
    description: "江戸川区と墨田区の境を流れる旧中川。都心で気軽にハゼやテナガエビが釣れる身近な釣り場。護岸が整備されている。",
    latitude: 35.7030, longitude: 139.8440,
    address: "〒132-0035 東京都江戸川区平井",
    accessInfo: "JR平井駅から徒歩約5分。",
    region: localRegion("re5040"), spotType: "river", difficulty: "beginner",
    isFree: true, hasParking: false, parkingDetail: "周辺のコインパーキングを利用",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.4, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeEast,
  },
  {
    id: "se5056", name: "荒川 葛西橋付近", slug: "arakawa-kasai-bashi",
    description: "荒川下流域の人気ポイント。シーバスのルアー釣りで有名で、秋にはハゼの数釣りも楽しめる。河川敷の広い空間でのびのび釣りができる。",
    latitude: 35.6780, longitude: 139.8540,
    address: "〒132-0033 東京都江戸川区東葛西",
    accessInfo: "東京メトロ東西線葛西駅から徒歩約15分。",
    region: localRegion("re5040"), spotType: "river", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "河川敷に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btNight, tackleRecommendations: [], tideAdvice: tideStandard, mazumeInfo: mazumeEast,
  },
  {
    id: "se5057", name: "多摩川 丸子橋付近", slug: "tamagawa-maruko-bashi",
    description: "大田区と川崎市の境を流れる多摩川の人気ポイント。コイやフナの淡水釣りから、汽水域のシーバスまで多彩な釣りが楽しめる。",
    latitude: 35.5870, longitude: 139.6630,
    address: "〒146-0095 東京都大田区多摩川",
    accessInfo: "東急多摩川線沼部駅から徒歩約5分。",
    region: localRegion("re5041"), spotType: "river", difficulty: "beginner",
    isFree: true, hasParking: false, parkingDetail: "周辺のコインパーキングを利用",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("koi"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "吸い込み釣り" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tideRiver, mazumeInfo: mazumeEast,
  },
  {
    id: "se5058", name: "有明西ふ頭公園", slug: "ariake-nishi-futou-kouen",
    description: "有明エリアの運河沿いにある釣り場。東京ビッグサイトの近くでアクセス良好。ハゼやシーバスが通年で狙える気軽なスポット。",
    latitude: 35.6360, longitude: 139.7890,
    address: "〒135-0063 東京都江東区有明三丁目",
    accessInfo: "ゆりかもめ東京ビッグサイト駅から徒歩約5分。りんかい線国際展示場駅から徒歩約10分。",
    region: localRegion("re5040"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "周辺有料駐車場を利用",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.4, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
    ],
    bestTimes: btNight, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5059", name: "芝浦南ふ頭公園", slug: "shibaura-minami-futou",
    description: "港区の運河沿いにある公園。レインボーブリッジを目の前に望みながらハゼやシーバスが狙える。仕事帰りの夜釣りにも最適。",
    latitude: 35.6330, longitude: 139.7590,
    address: "〒108-0023 東京都港区芝浦四丁目",
    accessInfo: "JR田町駅から徒歩約15分。ゆりかもめ芝浦ふ頭駅から徒歩約5分。",
    region: localRegion("re5041"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: false, parkingDetail: "周辺のコインパーキングを利用",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.4, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー" },
    ],
    bestTimes: btNight, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5060", name: "葛西臨海公園", slug: "kasai-rinkai-kouen-tsuri",
    description: "葛西臨海水族園に隣接する大型公園。なぎさエリアの護岸からハゼやカレイが狙え、家族連れの初めての釣りにも最適。",
    latitude: 35.6370, longitude: 139.8610,
    address: "〒134-0086 東京都江戸川区臨海町六丁目",
    accessInfo: "JR葛西臨海公園駅から徒歩約5分。首都高速湾岸線葛西ICから約5分。",
    region: localRegion("re5040"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "有料駐車場あり（1時間200円）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
    ],
    bestTimes: btAllDay, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },

  // =========================================
  // 神奈川県（12スポット: se5061〜se5072）
  // =========================================
  {
    id: "se5061", name: "真鶴港", slug: "manazuru-kou",
    description: "真鶴半島の付け根に位置する漁港。クロダイやメジナのフカセ釣りが盛んで、堤防からアオリイカも狙える相模湾西部の好漁場。",
    latitude: 35.1560, longitude: 139.1370,
    address: "〒259-0201 神奈川県足柄下郡真鶴町真鶴",
    accessInfo: "JR真鶴駅から徒歩約15分。小田原厚木道路小田原西ICから約15分。",
    region: localRegion("re5050"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港周辺に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ウキフカセ" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5062", name: "三崎港", slug: "misaki-kou-kanagawa",
    description: "三浦半島先端の大型漁港。マグロの水揚げで有名だが釣りも盛んで、堤防からサビキやカワハギ釣りが楽しめる。",
    latitude: 35.1420, longitude: 139.6220,
    address: "〒238-0243 神奈川県三浦市三崎",
    accessInfo: "京急三崎口駅からバスで約15分。横浜横須賀道路衣笠ICから約30分。",
    region: localRegion("re5051"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kawahagi"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "胴付き仕掛け" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5063", name: "うみかぜ公園", slug: "umikaze-kouen",
    description: "横須賀市のシーサイド公園。護岸からアジやイワシのサビキ釣り、タチウオの夜釣りが人気。BBQ場やスケートパークも併設。",
    latitude: 35.2780, longitude: 139.6640,
    address: "〒238-0013 神奈川県横須賀市平成町三丁目",
    accessInfo: "京急県立大学駅から徒歩約15分。横浜横須賀道路横須賀ICから約10分。",
    region: localRegion("re5051"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "有料駐車場あり（1時間310円）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5064", name: "城ヶ島岸壁", slug: "jogashima-ganpeki",
    description: "三浦半島最南端の城ヶ島。潮通し抜群で回遊魚の実績が高く、メジナやイシダイなど磯物も狙える本格派の釣り場。",
    latitude: 35.1300, longitude: 139.6170,
    address: "〒238-0237 神奈川県三浦市三崎町城ヶ島",
    accessInfo: "京急三崎口駅からバスで約30分。城ヶ島大橋を渡ってすぐ。",
    region: localRegion("re5051"), spotType: "rocky", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "城ヶ島公園有料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ウキフカセ" },
      { fish: fish("ishidai"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "石鯛仕掛け" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideStandard, mazumeInfo: mazumeEast,
  },
  {
    id: "se5065", name: "岩港", slug: "iwa-kou-manazuru",
    description: "真鶴町の小さな港。穴場的な釣り場でメバルやカサゴの根魚が豊富。春先のメバリングが特におすすめ。",
    latitude: 35.1520, longitude: 139.1310,
    address: "〒259-0201 神奈川県足柄下郡真鶴町真鶴",
    accessInfo: "JR真鶴駅から徒歩約10分。",
    region: localRegion("re5050"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "メバリング" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "アジング" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5066", name: "海辺つり公園", slug: "umibe-tsuri-kouen",
    description: "横須賀市の本格的な海釣り公園。約300mの護岸に安全柵が完備され、アジ・イワシから大物のタチウオまで狙える人気施設。",
    latitude: 35.2690, longitude: 139.6660,
    address: "〒238-0013 神奈川県横須賀市平成町三丁目",
    accessInfo: "京急堀ノ内駅から徒歩約10分。横浜横須賀道路横須賀ICから約10分。",
    region: localRegion("re5051"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "有料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.9, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "テンヤ" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝", method: "投げ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5067", name: "佐島漁港", slug: "sajima-gyokou",
    description: "横須賀市の西海岸にある静かな漁港。相模湾に面しアジやカワハギの実績が高い。周辺の磯ではメジナも狙える。",
    latitude: 35.2250, longitude: 139.6050,
    address: "〒240-0103 神奈川県横須賀市佐島",
    accessInfo: "JR逗子駅からバスで約30分。横浜横須賀道路横須賀ICから約20分。",
    region: localRegion("re5051"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港近くに駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kawahagi"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "胴付き仕掛け" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ウキフカセ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideStandard, mazumeInfo: mazumeEast,
  },
  {
    id: "se5068", name: "大磯港", slug: "oiso-kou",
    description: "湘南エリアの歴史ある漁港。西堤防は人気の釣り場で、アジやイワシのサビキから、シロギスの投げ釣りまで楽しめる。",
    latitude: 35.3040, longitude: 139.3060,
    address: "〒255-0003 神奈川県中郡大磯町大磯",
    accessInfo: "JR大磯駅から徒歩約15分。小田原厚木道路大磯ICから約5分。",
    region: localRegion("re5050"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港近くに有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.7, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝", method: "投げ釣り" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5069", name: "三浦海岸サーフ", slug: "miura-kaigan-surf",
    description: "三浦半島東側に広がる砂浜。秋〜冬のカレイ釣りが有名で、夏はシロギスの投げ釣りが好調。広い海岸でゆったり釣りができる。",
    latitude: 35.1780, longitude: 139.6470,
    address: "〒238-0101 神奈川県三浦市南下浦町上宮田",
    accessInfo: "京急三浦海岸駅から徒歩約5分。横浜横須賀道路衣笠ICから約20分。",
    region: localRegion("re5051"), spotType: "beach", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "海岸沿いに有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.6, reviewCount: 0,
    catchableFish: [
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝", method: "投げ釣り" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideSurf, mazumeInfo: mazumeEast,
  },
  {
    id: "se5070", name: "早川港", slug: "hayakawa-kou",
    description: "小田原市の小田原漁港に隣接する港。相模湾の恵みを受けアジやカマスの回遊が多く、秋のカマスのルアー釣りが特に人気。",
    latitude: 35.2360, longitude: 139.1430,
    address: "〒250-0021 神奈川県小田原市早川",
    accessInfo: "JR早川駅から徒歩約5分。小田原厚木道路小田原西ICから約5分。",
    region: localRegion("re5050"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に有料駐車場あり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.8, reviewCount: 0,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
      { fish: fish("kamasu"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ルアー" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
  {
    id: "se5071", name: "野比海岸", slug: "nobi-kaigan",
    description: "横須賀市南部の砂浜海岸。シロギスの投げ釣りポイントとして根強い人気があり、夏場は数釣りが楽しめる。",
    latitude: 35.2270, longitude: 139.6790,
    address: "〒239-0841 神奈川県横須賀市野比",
    accessInfo: "京急YRP野比駅から徒歩約10分。横浜横須賀道路佐原ICから約15分。",
    region: localRegion("re5051"), spotType: "beach", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "海岸沿いに駐車スペースあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝", method: "投げ釣り" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝", method: "投げ釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [], tideAdvice: tideSurf, mazumeInfo: mazumeEast,
  },
  {
    id: "se5072", name: "福浦漁港", slug: "fukuura-gyokou-kanagawa",
    description: "湯河原町の小さな漁港。相模湾の入り口に位置し、メジナやカサゴなど根魚が豊富。のんびりとした雰囲気で釣りが楽しめる。",
    latitude: 35.1430, longitude: 139.1110,
    address: "〒259-0312 神奈川県足柄下郡湯河原町鍛冶屋",
    accessInfo: "JR真鶴駅から車で約10分。小田原厚木道路小田原西ICから約20分。",
    region: localRegion("re5050"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/default-spot.jpg", images: [], rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ウキフカセ" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り" },
    ],
    bestTimes: btEvening, tackleRecommendations: [], tideAdvice: tidePort, mazumeInfo: mazumeEast,
  },
];