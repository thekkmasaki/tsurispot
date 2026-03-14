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

// 淡路島詳細用ローカルリージョン
const awajiLocalRegions: Region[] = [
  { id: "r405", prefecture: "兵庫県", areaName: "淡路島北部", slug: "hyogo-awaji-north" },
  { id: "r406", prefecture: "兵庫県", areaName: "淡路島西部", slug: "hyogo-awaji-west" },
  { id: "r410", prefecture: "兵庫県", areaName: "淡路島南部", slug: "hyogo-awaji-south" },
  { id: "r411", prefecture: "兵庫県", areaName: "淡路島中部", slug: "hyogo-awaji-central" },
];

function lr(id: string): Region {
  return awajiLocalRegions.find((r) => r.id === id) || region(id);
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

const gearEging: GearGuide = {
  targetFish: "アオリイカ",
  method: "エギング",
  difficulty: "intermediate",
  rod: "エギングロッド 8.6ft ML",
  reel: "スピニングリール 2500番",
  line: "PE 0.6号",
  hook: "エギ 3〜3.5号",
  otherItems: ["リーダー フロロ2号", "ギャフ", "イカ締めピック"],
  tip: "秋イカは3号エギ、春の親イカは3.5〜4号が効果的。"
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

export const awajiDetailSpots: FishingSpot[] = [
  // =========================================
  // 淡路島北部エリア（2スポット）
  // =========================================
  {
    id: "sh100", name: "松帆（松帆の浦）", slug: "matsuho-no-ura",
    description: "淡路島北端に位置し、古くから大ガレイの好ポイントとして知られる釣り場。冬場のカレイ狙いの投げ釣りで実績が高く、40cm超の座布団ガレイが上がることもある。春から秋にかけてはチヌのフカセ釣りやキスの投げ釣りも楽しめる。明石海峡大橋を望むロケーションで、潮通しが良いため魚影も濃い。夜釣りではメバリングも面白く、良型メバルが期待できるポイントだ。",
    latitude: 34.5950, longitude: 134.9680,
    address: "〒656-2311 兵庫県淡路市松帆",
    accessInfo: "神戸淡路鳴門自動車道淡路ICから車で約10分。明石海峡大橋を渡ってすぐのエリア。",
    region: lr("r405"), spotType: "beach", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "近隣に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.9, reviewCount: 98,
    catchableFish: [
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["足場の悪い岩場があるため注意", "潮流が速いエリアがある", "冬場は北西風が強い"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁業関係者に配慮すること", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearNage, gearUki, gearRock],
    youtubeLinks: [{ label: "松帆 カレイ釣り", searchQuery: "淡路島 松帆 カレイ 投げ釣り", description: "松帆の浦での大ガレイ狙い投げ釣り動画" }],
  },
  {
    id: "sh101", name: "佐野漁港（淡路島）", slug: "awaji-sano-gyoko",
    description: "淡路島北部の佐野地区に位置する漁港で、アオリイカの好ポイントとして関西エギンガーの間で広く知られている。秋のアオリイカシーズンには堤防先端付近でキロアップも期待できる。フカセ釣りでのチヌ狙いも実績があり、年無しサイズの報告もある。夏から秋にかけてタチウオの回遊があり、ワインド釣法やテンヤで狙えるのも魅力。サビキ釣りでアジが年間を通じて釣れるため、ファミリーでも楽しみやすい。",
    latitude: 34.5200, longitude: 134.9150,
    address: "〒656-2131 兵庫県淡路市佐野",
    accessInfo: "神戸淡路鳴門自動車道津名一宮ICから車で約15分。淡路島北部を西に向かうルート。",
    region: lr("r405"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に無料駐車スペースあり（約20台）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 4.0, reviewCount: 156,
    catchableFish: [
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "エギング", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("tachiuo"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ワインド", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は足場が良い", "堤防先端は高波注意", "夜釣り時はヘッドライト必須"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁船の出入りに注意", "コマセ使用後は清掃すること"],
    },
    gearGuides: [gearEging, gearUki, gearSabiki, gearRock],
    youtubeLinks: [{ label: "佐野漁港 エギング", searchQuery: "淡路島 佐野漁港 エギング アオリイカ", description: "淡路島佐野漁港でのアオリイカエギング動画" }],
  },
  // =========================================
  // 淡路島中部エリア（2スポット）
  // =========================================
  {
    id: "sh102", name: "生穂漁港", slug: "ikuho-gyoko",
    description: "淡路島中部の津名港エリアに位置する漁港。沖に一文字波止があり、津名港からシーバンサーの渡船で渡ることができる。一文字では沖向きでチヌのフカセ釣りやカレイの投げ釣りに実績があり、港内側でもサビキでアジの数釣りが楽しめる。秋にはタチウオの回遊も見られ、ワインドやテンヤで狙える。メバルは冬場の常夜灯周りでのメバリングが面白い。渡船を利用すれば沖の本格的な釣りが楽しめる穴場スポット。",
    latitude: 34.4600, longitude: 134.9100,
    address: "〒656-2132 兵庫県淡路市生穂",
    accessInfo: "神戸淡路鳴門自動車道津名一宮ICから車で約10分。津名港付近。",
    region: lr("r411"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港付近に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.8, reviewCount: 112,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("tachiuo"), monthStart: 7, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ワインド", source: "現地釣果情報" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["一文字波止は渡船利用", "渡船の運行スケジュールを事前確認", "沖堤防はライフジャケット必須"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["渡船利用時は船長の指示に従うこと", "荒天時は渡船欠航あり"],
    },
    gearGuides: [gearUki, gearSabiki, gearNage, gearEging],
    youtubeLinks: [{ label: "生穂漁港 チヌ釣り", searchQuery: "淡路島 生穂漁港 チヌ フカセ釣り", description: "生穂漁港一文字でのチヌ狙いフカセ釣り動画" }],
  },
  {
    id: "sh103", name: "古茂江", slug: "komoe",
    description: "淡路島中部の洲本市にある古茂江は、大型シーバスの実績が高いことで知られる釣り場。河口部に位置し、ベイトフィッシュが豊富に集まるため、ランカーサイズのシーバスが狙える。チヌやグレのフカセ釣りでも良型が上がり、テトラ帯ではメバルやカサゴの根魚も豊富。青物シーズンにはハマチやメジロが回遊することもあり、ショアジギングも人気が出てきている。潮通しが良く、多彩なターゲットが狙える中級者向けポイント。",
    latitude: 34.3430, longitude: 134.8980,
    address: "〒656-0023 兵庫県洲本市小路谷",
    accessInfo: "神戸淡路鳴門自動車道洲本ICから車で約15分。洲本市街地から南へ。",
    region: lr("r411"), spotType: "breakwater", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "周辺に駐車スペースあり（無料）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 4.1, reviewCount: 134,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー釣り", source: "現地釣果情報" },
      { fish: fish("buri"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["テトラ帯は足場が悪い", "潮流が速いので注意", "ライフジャケット推奨"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["テトラ上での釣りは十分注意すること", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearLure, gearUki, gearSabiki, gearJig],
    youtubeLinks: [{ label: "古茂江 シーバス", searchQuery: "淡路島 古茂江 シーバス ルアー", description: "古茂江でのランカーシーバス狙いルアー釣り動画" }],
  },
  // =========================================
  // 淡路島南部エリア（3スポット）
  // =========================================
  {
    id: "sh104", name: "土生港（淡路島）", slug: "awaji-habu-ko",
    description: "淡路島南部の南あわじ市に位置する土生港は、波止からの釣りが中心の穏やかな漁港。港内ではサビキ釣りでアジの数釣りが楽しめ、波止先端付近ではチヌのフカセ釣りが人気。冬場はカレイの投げ釣りで良型の実績があり、秋にはアオリイカのエギングでも賑わう。メバルは常夜灯周りで年間を通じて狙えるため、夕方からの釣行にも向いている。比較的穏やかな海域で、のんびりと釣りを楽しみたい方におすすめ。",
    latitude: 34.2700, longitude: 134.8100,
    address: "〒656-0511 兵庫県南あわじ市灘土生",
    accessInfo: "神戸淡路鳴門自動車道西淡三原ICから車で約25分。淡路島南部の太平洋側。",
    region: lr("r410"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.7, reviewCount: 87,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は足場良好", "堤防先端は波が被ることがあるので注意"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁船の出入りに注意", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearSabiki, gearUki, gearNage, gearEging],
    youtubeLinks: [{ label: "土生港 釣り", searchQuery: "淡路島 土生港 サビキ チヌ 釣り", description: "土生港でのサビキ釣り・チヌ釣り動画" }],
  },
  {
    id: "sh105", name: "メガフロート（南あわじ市）", slug: "megafloat-minamiawaji",
    description: "南あわじ市に設置された海釣り公園施設「メガフロート」。浮体式の釣り台から沖合の魚が狙えるため、陸からでは届かないポイントにアクセスできるのが最大の魅力。チヌやマダイのフカセ釣り、メバルの根魚釣り、キスの投げ釣りなど多彩な釣りが楽しめる。施設には柵が設置されており安全面も考慮されているため、ファミリーフィッシングにも適している。足場がフラットで広いため、のびのびと釣りができる。",
    latitude: 34.2530, longitude: 134.7220,
    address: "〒656-0543 兵庫県南あわじ市阿万塩屋町",
    accessInfo: "神戸淡路鳴門自動車道西淡三原ICから車で約20分。南あわじ市の西海岸沿い。",
    region: lr("r410"), spotType: "breakwater", difficulty: "beginner",
    isFree: false, hasParking: true, parkingDetail: "施設専用無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: true,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 4.0, reviewCount: 145,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("madai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["柵あり・安全設備充実", "レンタル竿あり", "天候不良時は閉鎖の場合あり"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["施設利用料が必要（営業時間・料金は公式サイトで確認）", "営業時間外は利用不可"],
    },
    gearGuides: [gearSabiki, gearUki, gearNage],
    youtubeLinks: [{ label: "メガフロート 釣り", searchQuery: "南あわじ メガフロート 海釣り公園 釣り", description: "南あわじメガフロートでの海釣り公園釣り動画" }],
  },
  {
    id: "sh106", name: "伊毘漁港", slug: "ibi-gyoko",
    description: "淡路島南部の西海岸に面した小さな漁港で、アオリイカの激釣エリアとして釣り人の間で評判が高い。秋のシーズンには堤防からのエギングで連発することも珍しくなく、キロオーバーの良型も期待できる。漁港の規模は小さいが、テトラ帯でのメバル・カサゴの根魚釣りや、チヌのフカセ釣りでも実績がある。アジのサビキ釣りも夕方から楽しめ、少人数でのんびり釣りをしたい方に最適な穴場ポイント。",
    latitude: 34.2280, longitude: 134.6620,
    address: "〒656-0661 兵庫県南あわじ市阿那賀伊毘",
    accessInfo: "神戸淡路鳴門自動車道淡路島南ICから車で約15分。島の南西部。",
    region: lr("r410"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港横に駐車スペースあり（5〜6台）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 4.2, reviewCount: 108,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "エギング", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["テトラ帯は足場注意", "駐車スペースが少ないため譲り合い", "夜釣り時は足元に注意"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁港関係者に配慮すること", "ゴミは必ず持ち帰り", "路上駐車禁止"],
    },
    gearGuides: [gearEging, gearRock, gearUki, gearSabiki],
    youtubeLinks: [{ label: "伊毘漁港 エギング", searchQuery: "淡路島 伊毘漁港 エギング アオリイカ", description: "伊毘漁港でのアオリイカエギング動画" }],
  },
  // =========================================
  // 淡路島西部エリア（6スポット）
  // =========================================
  {
    id: "sh107", name: "津井漁港", slug: "tsui-gyoko",
    description: "淡路島西海岸に位置する津井漁港は、大型アイナメの実績で知られるポイント。テトラ帯や岩場周りでブラクリ仕掛けを使ったアイナメ狙いが人気で、40cm超の良型が出ることもある。メバルやカサゴなどの根魚も豊富で、穴釣りの入門にも最適。チヌのフカセ釣りやアジのサビキ釣りも楽しめ、特に波止先端付近は潮通しが良く魚影が濃い。西海岸特有の夕日を眺めながらの釣りは格別。",
    latitude: 34.2530, longitude: 134.6450,
    address: "〒656-0332 兵庫県南あわじ市津井",
    accessInfo: "神戸淡路鳴門自動車道西淡三原ICから車で約10分。島の西海岸沿い。",
    region: lr("r406"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.9, reviewCount: 94,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("ainame"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ブラクリ", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は足場良好", "テトラ帯は滑りやすいので注意"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁船の出入りに注意", "コマセ使用後は清掃すること"],
    },
    gearGuides: [gearRock, gearUki, gearSabiki],
    youtubeLinks: [{ label: "津井漁港 根魚釣り", searchQuery: "淡路島 津井漁港 アイナメ 穴釣り メバル", description: "津井漁港での根魚・アイナメ狙い動画" }],
  },
  {
    id: "sh108", name: "鳥飼漁港", slug: "torikai-gyoko",
    description: "淡路島西部に位置する鳥飼漁港は、メバルの好ポイントとして地元釣り師に親しまれている。冬場のメバリングでは25cm級の良型が期待でき、常夜灯周りは特に実績が高い。チヌのフカセ釣りでは年間を通じて安定した釣果が見られ、波止外向きが狙い目。アジのサビキ釣りはファミリーにも人気で、夏から秋にかけて入れ食いになることも。冬のカレイ狙いも楽しめ、四季を通じて釣りが成立するバランスの良い漁港。",
    latitude: 34.2850, longitude: 134.6350,
    address: "〒656-0331 兵庫県南あわじ市津井鳥飼浦",
    accessInfo: "神戸淡路鳴門自動車道西淡三原ICから車で約15分。西海岸の県道沿い。",
    region: lr("r406"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に無料駐車スペースあり（約10台）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.8, reviewCount: 76,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "エギング", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は穏やかで足場良好", "波止先端は潮流注意"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁船の出入りに注意", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearRock, gearUki, gearSabiki, gearNage, gearEging],
    youtubeLinks: [{ label: "鳥飼漁港 メバリング", searchQuery: "淡路島 鳥飼漁港 メバリング メバル", description: "鳥飼漁港でのメバリング動画" }],
  },
  {
    id: "sh109", name: "船瀬漁港", slug: "funase-gyoko",
    description: "淡路島西海岸の五色町エリアにある船瀬漁港は、こぢんまりとした港ながら根魚の魚影が濃い穴場スポット。メバルは港内の岸壁際でも釣れるほど魚影が濃く、テトラ帯ではカサゴの穴釣りが楽しめる。チヌのフカセ釣りでは乗っ込みシーズンの春に実績が高い。冬場のカレイ投げ釣りも港内の砂地で可能。釣り人の少ない静かな環境で、ゆったりと釣りを楽しみたい方にぴったりのポイント。",
    latitude: 34.3100, longitude: 134.6400,
    address: "〒656-1344 兵庫県洲本市五色町鳥飼浦",
    accessInfo: "神戸淡路鳴門自動車道西淡三原ICから車で約20分。県道31号沿い。",
    region: lr("r406"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.6, reviewCount: 54,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["小規模な港で足場は良好", "テトラ帯は滑りやすい"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁業関係者に配慮すること", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearRock, gearUki, gearSabiki, gearNage],
    youtubeLinks: [{ label: "船瀬漁港 釣り", searchQuery: "淡路島 船瀬漁港 メバル チヌ 釣り", description: "船瀬漁港でのメバル・チヌ釣り動画" }],
  },
  {
    id: "sh110", name: "都志港", slug: "toshi-ko",
    description: "淡路島西海岸のほぼ中央に位置する都志港は、堤防からのルアー釣りで大型スズキが狙えるポイントとして知られている。港内に流れ込む小河川の影響でベイトフィッシュが集まりやすく、特に秋から冬にかけてランカークラスのシーバスの実績がある。メバルやカサゴの根魚も港内全域で狙え、テトラ帯での穴釣りが面白い。アジのサビキ釣りは夕方の回遊が安定しており、チヌのフカセ釣りも波止外向きで実績がある。",
    latitude: 34.3800, longitude: 134.6500,
    address: "〒656-1325 兵庫県洲本市五色町都志",
    accessInfo: "神戸淡路鳴門自動車道北淡ICから車で約30分。県道31号線沿い。",
    region: lr("r406"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "港付近に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.9, reviewCount: 102,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー釣り", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: "現地釣果情報" },
    ],
    bestTimes: btNight,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["堤防先端は潮流が速い", "夜釣りは足元に十分注意", "テトラ帯は滑りやすい"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁船の出入りに注意", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearLure, gearRock, gearSabiki, gearUki],
    youtubeLinks: [{ label: "都志港 シーバス", searchQuery: "淡路島 都志港 シーバス ルアー 釣り", description: "都志港での大型シーバス狙いルアー釣り動画" }],
  },
  {
    id: "sh111", name: "明神漁港", slug: "myojin-gyoko",
    description: "淡路島西部の北寄りに位置する明神漁港は、ファミリーフィッシングに最適な穏やかな漁港。港内は足場が良く、波も穏やかなため初心者やお子さん連れでも安心して釣りが楽しめる。サビキ釣りでアジが安定して釣れるほか、チヌのフカセ釣り、メバルのメバリング、冬場のカレイ投げ釣りなど年間を通じて多彩な魚種が狙える。グレのフカセ釣りでは波止外向きのテトラ帯で25cm級が期待できる。近隣にトイレのある公園もあり、長時間の釣行にも向いている。",
    latitude: 34.4100, longitude: 134.6800,
    address: "〒656-1301 兵庫県洲本市五色町鮎原南谷",
    accessInfo: "神戸淡路鳴門自動車道北淡ICから車で約25分。県道31号線沿い。",
    region: lr("r406"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に無料駐車スペースあり（約15台）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.7, reviewCount: 68,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は足場良好で穏やか", "ファミリーフィッシングに最適", "波止外向きテトラは注意"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁船の出入りに注意", "コマセ使用後は清掃すること", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearSabiki, gearUki, gearRock, gearNage],
    youtubeLinks: [{ label: "明神漁港 ファミリー釣り", searchQuery: "淡路島 明神漁港 サビキ ファミリー 釣り", description: "明神漁港でのファミリーフィッシング動画" }],
  },
  {
    id: "sh112", name: "江井漁港", slug: "ei-gyoko",
    description: "淡路島西部の北寄りに位置する江井漁港は、フカセ釣りでのグレ釣りが面白いポイントとして知られている。波止外向きのテトラ帯周辺は潮通しが良く、30cm級のグレが期待できる。チヌのフカセ釣りも実績が高く、特に春の乗っ込みシーズンには年無しサイズの可能性もある。メバルは冬場の常夜灯周りでのメバリングで安定した釣果が見込め、アジのサビキ釣りも夏から秋にかけて好調。フカセ釣り師にとっては一度は訪れたい淡路島の実力派ポイント。",
    latitude: 34.4500, longitude: 134.7000,
    address: "〒656-1531 兵庫県淡路市江井",
    accessInfo: "神戸淡路鳴門自動車道北淡ICから車で約15分。県道31号線沿い。",
    region: lr("r406"), spotType: "port", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "漁港横に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 4.0, reviewCount: 89,
    catchableFish: [
      { fish: fish("mejina"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["テトラ帯は足場が不安定", "潮通しが良いため波が高い日は注意", "ライフジャケット推奨"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁船の出入りに注意", "コマセ使用後は清掃すること", "テトラ上は十分注意して釣りをすること"],
    },
    gearGuides: [gearUki, gearSabiki, gearRock],
    youtubeLinks: [{ label: "江井漁港 グレ釣り", searchQuery: "淡路島 江井漁港 グレ フカセ釣り", description: "江井漁港でのグレ狙いフカセ釣り動画" }],
  },
];
