import type { FishingSpot, FishSpecies, GearGuide } from "@/types";
import { regions } from "./regions";
import type { Region } from "@/types";
import { getFishBySlug } from "./fish";

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

// ローカルリージョン
const localRegions: Region[] = [
  { id: "r400", prefecture: "兵庫県", areaName: "神戸・須磨", slug: "hyogo-kobe-suma" },
  { id: "r403", prefecture: "兵庫県", areaName: "加古川・高砂", slug: "hyogo-kakogawa-takasago" },
  { id: "r406", prefecture: "兵庫県", areaName: "淡路島西部", slug: "hyogo-awaji-west" },
];

function lr(id: string): Region {
  return localRegions.find((r) => r.id === id) || region(id);
}

// 共通ベストタイム
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
const btNight = [
  { label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "good" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "fair" as const },
  { label: "夕マヅメ", timeRange: "16:00〜18:30", rating: "good" as const },
  { label: "夜", timeRange: "19:00〜23:00", rating: "best" as const },
];

// 共通 Gear Guides
const gearSabiki: GearGuide = {
  targetFish: "アジ・サバ・イワシ",
  method: "サビキ釣り",
  difficulty: "beginner",
  rod: "磯竿3号 3.6〜4.5m",
  reel: "スピニングリール 2500番",
  line: "ナイロン3号",
  hook: "サビキ仕掛け 5〜7号",
  otherItems: ["コマセカゴ", "アミエビ", "バケツ"],
  tip: "コマセは少しずつ出すのがコツ。夕マヅメが特に釣果がよい。"
};

const gearNage: GearGuide = {
  targetFish: "キス・カレイ",
  method: "投げ釣り",
  difficulty: "beginner",
  rod: "投げ竿 3.9〜4.25m",
  reel: "スピニングリール 3000〜4000番",
  line: "ナイロン4号",
  hook: "流線針 7〜9号",
  otherItems: ["天秤オモリ 20〜25号", "青イソメ", "竿立て"],
  tip: "砂地を狙って遠投。アタリは小さいのでラインを張りすぎないこと。"
};

const gearRock: GearGuide = {
  targetFish: "カサゴ・メバル",
  method: "穴釣り・根魚釣り",
  difficulty: "beginner",
  rod: "穴釣りロッド 1.1〜1.5m",
  reel: "小型両軸リール",
  line: "フロロ3号",
  hook: "ブラクリ 3〜5号",
  otherItems: ["アオイソメ", "サバの切り身"],
  tip: "テトラの隙間に落とし込み、底に着いたら少し持ち上げて待つ。"
};

const gearUki: GearGuide = {
  targetFish: "クロダイ・メジナ",
  method: "ウキフカセ釣り",
  difficulty: "intermediate",
  rod: "磯竿1.5〜2号 5.3m",
  reel: "スピニングリール 2500〜3000番",
  line: "ナイロン2号",
  hook: "チヌ針3〜4号",
  otherItems: ["ウキ", "オキアミ", "コマセ"],
  tip: "潮の流れに乗せてウキを流すのがコツ。"
};

const gearJig: GearGuide = {
  targetFish: "ブリ・ヒラマサ・カンパチ",
  method: "ショアジギング",
  difficulty: "intermediate",
  rod: "ショアジギングロッド M〜MH 10ft",
  reel: "スピニングリール 4000〜5000番",
  line: "PE 1〜1.5号",
  hook: "メタルジグ 30〜60g",
  otherItems: ["リーダー フロロ5号", "プライヤー"],
  tip: "朝マヅメの時合いに集中。ジャークのリズムを一定に保つ。"
};

const gearLure: GearGuide = {
  targetFish: "シーバス",
  method: "ルアー釣り",
  difficulty: "intermediate",
  rod: "シーバスロッド 9ft ML",
  reel: "スピニングリール 3000番",
  line: "PE 1号",
  hook: "ミノー 80〜120mm",
  otherItems: ["リーダー フロロ5号", "スナップ", "プライヤー"],
  tip: "常夜灯周りの明暗部を狙うのが基本。"
};

const gearWind: GearGuide = {
  targetFish: "シーバス・タチウオ",
  method: "ワインド釣法",
  difficulty: "intermediate",
  rod: "ワインドロッド 8〜9ft M",
  reel: "スピニングリール 3000番",
  line: "PE 0.8〜1号",
  hook: "ワームジグヘッド 10〜21g",
  otherItems: ["リーダー フロロ5号", "ワーム各色", "スナップ"],
  tip: "ロッドを上下にシャクってダートさせるのがコツ。リアクションバイトを誘う。"
};

export const kobeKakogawaAddSpots: FishingSpot[] = [
  // =========================================
  // 須磨港一文字（神戸・須磨エリア）
  // =========================================
  {
    id: "sh130", name: "須磨港一文字", slug: "suma-ko-hitomoji",
    description: "須磨港沖に位置する沖堤防で、渡船「須磨丸」を利用して渡る。沖合に出ることで港内では出会えない良型のチヌやタチウオが狙えるのが最大の魅力。春〜秋はフカセ釣りでチヌの40cm級が安定して出る好ポイントで、秋口からはタチウオの引き釣り・ワインドで指3本〜4本クラスが連発することも。青物の回遊時期にはハマチクラスのショアジギングも成立し、足元ではメバル・カサゴの数釣りも楽しめる。渡船利用のためライフジャケット着用が必須。",
    latitude: 34.6330, longitude: 135.1310,
    address: "〒654-0055 兵庫県神戸市須磨区須磨浦通（須磨港渡船乗り場より渡船利用）",
    accessInfo: "JR「須磨」駅から須磨港渡船乗り場まで徒歩約8分。第二神明道路須磨ICから約10分。渡船「須磨丸」で約5分。",
    region: lr("r400"), spotType: "breakwater", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "須磨港周辺に有料駐車場あり（500〜800円/日）",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 4.2, reviewCount: 198,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜日中", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("saba"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ワインド・引き釣り", source: "現地釣果情報" },
      { fish: fish("buri"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング", source: "現地釣果情報" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー釣り", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["渡船利用のため救命胴衣（ライフジャケット）必須", "渡船の出発時間・最終便を事前確認", "沖堤防のため荒天時は渡船欠航", "足場は比較的平坦だが滑り止め靴を推奨", "飲料水・食料は持参すること"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["渡船料金が必要（要確認）", "ゴミは必ず持ち帰り", "渡船の最終便に乗り遅れないこと"],
    },
    gearGuides: [gearUki, gearSabiki, gearNage, gearJig, gearWind],
    youtubeLinks: [{ label: "須磨一文字 釣り", searchQuery: "須磨港一文字 チヌ タチウオ 渡船 釣り", description: "須磨港一文字での釣り動画" }],
  },
  // =========================================
  // 加古川尻一文字（加古川・高砂エリア）
  // =========================================
  {
    id: "sh131", name: "加古川尻一文字", slug: "kakogawajiri-hitomoji",
    description: "加古川河口沖に浮かぶ沖堤防で、渡船を利用して渡る。加古川からの豊富な栄養分で魚影が濃く、特にワインド釣法でのシーバスが関西のアングラーから注目されているポイント。河口特有の濁りと潮流が絡むタイミングではシーバスの爆釣劇も珍しくない。チヌ・グレのフカセ釣りも好ポイントで、年無し（50cm級）チヌの実績もある。秋はタチウオの群れが接岸し、ワインドやジグヘッド＋ワームで効率よく数を稼げる。青物の回遊も見られ、ショアジギングでハマチクラスが掛かることも。",
    latitude: 34.7180, longitude: 134.8300,
    address: "〒676-0012 兵庫県高砂市高砂町（加古川河口沖、渡船利用）",
    accessInfo: "山陽電鉄「高砂」駅からタクシー約10分で渡船乗り場。加古川バイパス加古川西ランプから約15分。",
    region: lr("r403"), spotType: "breakwater", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "渡船乗り場付近に駐車スペースあり（無料・台数限定）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 4.1, reviewCount: 156,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜日中", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ワインド釣法", source: "現地釣果情報" },
      { fish: fish("buri"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("saba"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ワインド", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["渡船利用のため救命胴衣（ライフジャケット）必須", "加古川河口の潮流が速いため足元注意", "荒天時は渡船欠航", "トイレ・自販機なし、飲料水と食料を持参", "渡船の最終便を確認しておくこと"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["渡船料金が必要（要確認）", "ゴミは必ず持ち帰り", "河口付近のため潮位・天候情報を確認してから出発"],
    },
    gearGuides: [gearUki, gearWind, gearLure, gearSabiki, gearJig],
    youtubeLinks: [{ label: "加古川尻一文字 釣り", searchQuery: "加古川尻一文字 シーバス ワインド チヌ 釣り", description: "加古川尻一文字での釣り動画" }],
  },
  // =========================================
  // 東播磨港（加古川・高砂エリア）
  // =========================================
  {
    id: "sh132", name: "東播磨港", slug: "higashi-harima-ko",
    description: "加古川市と高砂市の境界付近に位置する港で、広い岸壁からのんびりと竿を出せるのが魅力。港内は波が穏やかでファミリーフィッシングに適しており、サビキでアジの数釣りが手軽に楽しめる。外側の堤防先端付近ではチヌのフカセ釣りやメバリングの実績もあり、足元のテトラ周りではガシラ（カサゴ）の穴釣りも好釣果が期待できる。投げ釣りではキス・カレイも狙え、1年を通じて多彩なターゲットを楽しめる万能ポイント。",
    latitude: 34.7340, longitude: 134.8480,
    address: "〒676-0019 兵庫県高砂市高砂町東播磨港",
    accessInfo: "山陽電鉄「高砂」駅からタクシー約8分。加古川バイパス加古川西ランプから約10分。",
    region: lr("r403"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港内に無料駐車スペースあり（漁業関係者優先のため譲り合いを）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.6, reviewCount: 89,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は足場が良く安全", "外側堤防のテトラ帯は足元注意", "漁船の出入りに注意", "近くにコンビニがないため飲食物を持参推奨"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁船の出入り時は竿を上げること", "コマセ使用後は清掃すること", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearSabiki, gearNage, gearRock, gearUki],
    youtubeLinks: [{ label: "東播磨港 釣り", searchQuery: "東播磨港 サビキ アジ チヌ 加古川 釣り", description: "東播磨港での釣り動画" }],
  },
  // =========================================
  // 尾崎漁港（淡路島西部エリア）
  // =========================================
  {
    id: "sh133", name: "尾崎漁港", slug: "ozaki-gyoko-awaji",
    description: "淡路島の北西部に位置する小さな漁港。観光客で賑わう東岸とは対照的に、釣り人が少なく穴場的存在。港内は波が穏やかで、メバリングやアジングといったライトゲームに適した環境が整っている。常夜灯周りでは冬場のメバルが好調で、尺メバルの実績もある。春〜秋はチヌのウキ釣り、冬はカレイの投げ釣りも楽しめる。淡路島の西海岸は夕日が美しく、夕マヅメの景色を楽しみながらの釣りは格別。",
    latitude: 34.4800, longitude: 134.7200,
    address: "〒656-1726 兵庫県淡路市尾崎",
    accessInfo: "神戸淡路鳴門自動車道北淡ICから約15分。明石港から淡路ジェノバラインで岩屋港下船後、車で約25分。",
    region: lr("r406"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に無料駐車スペースあり（数台）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.5, reviewCount: 62,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "アジング・サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btNight,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は足場が良く安全", "堤防先端は風が強い日は注意", "近くに店舗がないため飲食物を持参", "夜釣りはヘッドライト必須"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁港関係者の作業を妨げないこと", "ゴミは必ず持ち帰り", "コマセ使用後は清掃すること"],
    },
    gearGuides: [gearRock, gearUki, gearSabiki, gearNage],
    youtubeLinks: [{ label: "淡路島 尾崎漁港 釣り", searchQuery: "淡路島 尾崎漁港 メバル アジング 釣り", description: "尾崎漁港での釣り動画" }],
  },
];
