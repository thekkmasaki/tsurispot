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

// 姫路・播磨エリア用ローカルリージョン
const himejiHarimaLocalRegions: Region[] = [
  { id: "r403", prefecture: "兵庫県", areaName: "加古川・高砂", slug: "hyogo-kakogawa-takasago" },
  { id: "r412", prefecture: "兵庫県", areaName: "姫路・飾磨", slug: "hyogo-himeji-shikama" },
  { id: "r404", prefecture: "兵庫県", areaName: "赤穂・相生・たつの", slug: "hyogo-ako-aioi-tatsuno" },
];

function lr(id: string): Region {
  return himejiHarimaLocalRegions.find((r) => r.id === id) || region(id);
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

export const himejiHarimaDetailSpots: FishingSpot[] = [
  // =========================================
  // 姫路・飾磨エリア（4スポット）
  // =========================================
  {
    id: "sh120", name: "姫路市立遊漁センター", slug: "himeji-yugyo-center",
    description: "姫路市的形町の沖合に位置する有料の海釣り施設。桟橋型の釣り台が設けられ、全周に安全柵が設置されているためファミリーや初心者でも安心して釣りを楽しめる。春から秋はサビキ仕掛けでアジやサバの数釣りが楽しめ、夏場のキス、冬のカレイも実績が高い。チヌやメバルといった中級者好みのターゲットにも対応しており、秋にはハマチの回遊も見られる。売店や休憩所もあり、手ぶら釣行にも向いた施設。",
    latitude: 34.7660, longitude: 134.6320,
    address: "〒671-0111 兵庫県姫路市的形町福泊地先",
    accessInfo: "山陽電鉄「的形」駅からタクシー約10分。姫路バイパス姫路南ランプから約20分。",
    region: lr("r412"), spotType: "fishing-park", difficulty: "beginner",
    isFree: false, hasParking: true, parkingDetail: "専用駐車場あり（無料）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "竿・仕掛けのレンタルあり（有料）",
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.9, reviewCount: 280,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("madako"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "タコエギ", source: "現地釣果情報" },
      { fish: fish("buri"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "のませ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["全周柵付きで安全", "売店・休憩所あり", "小さな子供連れでも安心", "天候により営業中止の場合あり"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["入場料が必要（大人1,100円程度、小人550円程度）", "営業時間内のみ利用可", "ゴミは持ち帰り"],
    },
    gearGuides: [gearSabiki, gearNage, gearUki],
    youtubeLinks: [{ label: "姫路市立遊漁センター 釣り", searchQuery: "姫路市立遊漁センター サビキ アジ 釣り", description: "姫路市立遊漁センターでの釣り動画" }],
  },
  {
    id: "sh121", name: "妻鹿一文字", slug: "mega-ichibunshi",
    description: "姫路港沖に浮かぶ沖堤防で、渡船を利用してアクセスする本格的な釣り場。フカセ釣りでは良型のチヌやグレが安定して釣れることから、播磨エリア屈指の人気を誇る。秋から冬にかけてはハマチなどの青物回遊もあり、ショアジギングでも実績がある。堤防の外向きは潮通しが良く、冬場でも遠投サビキで良型アジが狙える。内側のケーソン際ではカレイの投げ釣りやメバルの探り釣りも楽しめる、播磨を代表する一級ポイント。",
    latitude: 34.7850, longitude: 134.7350,
    address: "〒672-8023 兵庫県姫路市飾磨区妻鹿沖（渡船利用）",
    accessInfo: "山陽電鉄「妻鹿」駅から渡船乗り場まで徒歩約10分。姫路バイパス姫路南ランプから約15分。渡船は早朝出船。",
    region: lr("r412"), spotType: "breakwater", difficulty: "intermediate",
    isFree: false, hasParking: true, parkingDetail: "渡船場に無料駐車場あり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 4.2, reviewCount: 195,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 3, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜日中", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("buri"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ショアジギング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["渡船利用のため船の時間厳守", "堤防上は風が強いことが多い", "落水時は自力で上がれない場所あり", "ライフジャケット必須"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["渡船料金が必要（要予約）", "最終便に乗り遅れないよう注意", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearUki, gearSabiki, gearJig, gearNage],
    youtubeLinks: [{ label: "妻鹿一文字 チヌ釣り", searchQuery: "妻鹿一文字 チヌ フカセ 姫路", description: "妻鹿一文字でのチヌフカセ釣り動画" }],
  },
  {
    id: "sh122", name: "広畑港", slug: "hirohata-ko",
    description: "姫路市南部の工業地帯に隣接する漁港で、港内の岸壁や周辺の護岸から釣りが楽しめる。チヌの落とし込み釣りで実績が高く、年間を通じて40cmクラスが期待できる。夜間はシーバスのルアーフィッシングが人気で、常夜灯周りでメバルやアジの好釣果も多い。投げ釣りではキスやカレイが狙え、足場が良い場所が多いのでファミリーでも入りやすい。",
    latitude: 34.7830, longitude: 134.6440,
    address: "〒671-1121 兵庫県姫路市広畑区吾妻町付近",
    accessInfo: "山陽電鉄「広畑」駅から徒歩約15分。姫路バイパス広畑ランプから約10分。",
    region: lr("r412"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり（路肩注意）",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.6, reviewCount: 150,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "落とし込み", source: "現地釣果情報" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["岸壁は足場良好", "工業地帯のため大型車両に注意", "夜釣りは明るい場所で"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁港関係者の通行を妨げないこと", "立入禁止区域あり（標識確認）", "コマセ使用後は清掃すること"],
    },
    gearGuides: [gearUki, gearLure, gearSabiki, gearNage],
    youtubeLinks: [{ label: "広畑港 釣り", searchQuery: "広畑港 チヌ シーバス 姫路 釣り", description: "広畑港でのチヌ・シーバス釣り動画" }],
  },
  {
    id: "sh123", name: "灘浜東テトラ", slug: "nadahama-higashi-tetra",
    description: "姫路市の灘浜緑地東側に広がるテトラ帯で、根魚の宝庫として知られるポイント。テトラの隙間にブラクリを落とし込めばガシラやメバルが飽きない程度に釣れ続ける。フカセ釣りではチヌやグレの実績もあり、特に冬場のグレは良型が混じることも。潮通しが良いためアジの回遊も多く、サビキやアジングの好ポイントでもある。ただしテトラ上は滑りやすく足場が悪いため、磯靴やライフジャケットの装着が必須。",
    latitude: 34.7870, longitude: 134.6550,
    address: "〒672-8035 兵庫県姫路市飾磨区中島付近",
    accessInfo: "山陽電鉄「飾磨」駅から車で約10分。姫路バイパス姫路南ランプから約15分。",
    region: lr("r412"), spotType: "breakwater", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "灘浜緑地駐車場を利用（無料）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.7, reviewCount: 120,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mejina"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜日中", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "穴釣り", source: "現地釣果情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中〜夕マヅメ", method: "穴釣り", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "アジング", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["テトラ上は滑りやすいため磯靴必須", "ライフジャケット着用推奨", "単独釣行は避けること", "高波時は絶対に近づかない"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["テトラの移動は慎重に", "ゴミの持ち帰り徹底"],
    },
    gearGuides: [gearRock, gearUki],
    youtubeLinks: [{ label: "灘浜テトラ 根魚", searchQuery: "灘浜 テトラ ガシラ メバル 穴釣り 姫路", description: "灘浜テトラでの穴釣り動画" }],
  },

  // =========================================
  // 加古川・高砂エリア（1スポット）
  // =========================================
  {
    id: "sh124", name: "曽根港", slug: "sone-ko",
    description: "高砂市の東端に位置する小さな漁港で、地元の釣り人に親しまれている穴場的存在。港内は足場が良く、サビキでアジやイワシを狙うファミリーの姿が多い。チヌのウキ釣りや落とし込みでも30〜40cmクラスの実績があり、冬場の投げ釣りではカレイが面白い。港の外側ではメバリングも楽しめ、常夜灯周辺では数釣りが期待できる。規模は小さいが多彩な釣りが楽しめる港。",
    latitude: 34.7440, longitude: 134.8070,
    address: "〒676-0082 兵庫県高砂市曽根町付近",
    accessInfo: "山陽電鉄「曽根」駅から徒歩約20分。加古川バイパス高砂西ランプから約10分。",
    region: lr("r403"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.5, reviewCount: 95,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキ釣り", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は足場良好", "漁船の出入りに注意", "夜間は照明が少ない箇所あり"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁業関係者の通行優先", "コマセ使用後は清掃すること", "ゴミは持ち帰り"],
    },
    gearGuides: [gearSabiki, gearUki, gearNage, gearRock],
    youtubeLinks: [{ label: "曽根港 釣り", searchQuery: "曽根港 高砂 アジ チヌ 釣り", description: "曽根港でのサビキ・チヌ釣り動画" }],
  },

  // =========================================
  // 赤穂・相生・たつのエリア（4スポット）
  // =========================================
  {
    id: "sh125", name: "賀波漁港", slug: "kaba-gyoko",
    description: "たつの市御津町にある小さな漁港で、瀬戸内海に面した穏やかな雰囲気が魅力。メバルやガシラといった根魚が堤防際の捨て石周りに豊富で、特に冬場のメバリングは好ポイント。チヌのウキ釣りでも安定した釣果があり、投げ釣りではキスとカレイの両方が狙える。アジの回遊もあり、夕マヅメのサビキは手堅い。駐車スペースもあり、のんびりと竿を出すには絶好のロケーション。",
    latitude: 34.8030, longitude: 134.4950,
    address: "〒671-1301 兵庫県たつの市御津町黒崎付近",
    accessInfo: "山陽自動車道龍野西ICから約20分。JR網干駅からバス利用。",
    region: lr("r404"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.5, reviewCount: 85,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中〜夕マヅメ", method: "穴釣り", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキ釣り", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["堤防は足場良好", "周辺に売店なし（飲料持参推奨）", "漁船の作業中は距離を取ること"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁港利用者の邪魔にならないこと", "ゴミは持ち帰り"],
    },
    gearGuides: [gearRock, gearUki, gearSabiki, gearNage],
    youtubeLinks: [{ label: "賀波漁港 メバル", searchQuery: "賀波漁港 たつの メバル 釣り", description: "賀波漁港でのメバリング動画" }],
  },
  {
    id: "sh126", name: "浅野漁港", slug: "asano-gyoko-aioi",
    description: "相生市の東部に位置する小さな漁港で、投げ釣りのカレイポイントとして地元では知られた存在。港口から外向きに遠投すると砂地に当たり、秋から冬にかけてマコガレイの好釣果が期待できる。メバルやガシラは堤防の捨て石際やテトラ周りで安定して釣れ、チヌのウキ釣りでも良型が出る。秋にはアオリイカの姿も確認されており、エギングの穴場としても注目されている。",
    latitude: 34.8050, longitude: 134.4500,
    address: "〒678-0041 兵庫県相生市浅野付近",
    accessInfo: "山陽自動車道龍野西ICから約15分。JR相生駅から車で約10分。",
    region: lr("r404"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港横に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.6, reviewCount: 90,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中〜夕マヅメ", method: "穴釣り", source: "現地釣果情報" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "エギング", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は足場良好", "外側テトラは注意が必要", "売店なし（飲食物持参推奨）"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁港関係者の通行を妨げないこと", "ゴミは持ち帰り"],
    },
    gearGuides: [gearNage, gearRock, gearUki, gearEging, gearSabiki],
    youtubeLinks: [{ label: "浅野漁港 カレイ", searchQuery: "浅野漁港 相生 カレイ 投げ釣り", description: "浅野漁港での投げ釣り動画" }],
  },
  {
    id: "sh127", name: "嘉浦漁港", slug: "kaura-gyoko",
    description: "赤穂市の西寄りに位置する小規模な漁港。瀬戸内海に面した静かな入り江にあり、根魚の魚影が非常に濃い。メバルとガシラは堤防際の捨て石から通年で狙え、数釣りが楽しめる。チヌは春から秋のウキ釣りで30〜40cmクラスの実績がある。アジの回遊は夏から秋にかけてで、サビキで手軽に楽しめる。冬場はカレイの投げ釣りも面白く、地元の常連が多い穴場ポイント。",
    latitude: 34.7650, longitude: 134.4180,
    address: "〒678-0235 兵庫県赤穂市御崎付近",
    accessInfo: "山陽自動車道赤穂ICから約15分。JR播州赤穂駅から車で約20分。",
    region: lr("r404"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "漁港付近に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.5, reviewCount: 70,
    catchableFish: [
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中〜夕マヅメ", method: "穴釣り", source: "現地釣果情報" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキ釣り", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
    ],
    bestTimes: btEvening,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["港内は足場良好", "周辺に売店なし（飲食物持参推奨）", "漁船の出入りに注意"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁港利用者の邪魔にならないこと", "ゴミは持ち帰り"],
    },
    gearGuides: [gearRock, gearSabiki, gearUki, gearNage],
    youtubeLinks: [{ label: "嘉浦漁港 根魚", searchQuery: "嘉浦漁港 赤穂 メバル ガシラ 釣り", description: "嘉浦漁港での根魚釣り動画" }],
  },
  {
    id: "sh128", name: "赤穂・福浦", slug: "ako-fukuura",
    description: "赤穂市の南西部、瀬戸内海に面した石積みの堤防が特徴的な釣り場。堤防から投げ釣りでカレイやキスを狙う釣り人が多く、特に秋から冬のカレイシーズンは好ポイント。堤防際ではチヌのウキ釣りが人気で、良型の実績も豊富。根魚はメバル・ガシラとも魚影が濃く、夜のメバリングは安定した釣果が得られる。秋にはアオリイカの回遊もあり、エギングで狙う釣り人も増えている。瀬戸内の景色を楽しみながら竿を出せる風光明媚なスポット。",
    latitude: 34.7540, longitude: 134.3880,
    address: "〒678-0215 兵庫県赤穂市福浦付近",
    accessInfo: "山陽自動車道赤穂ICから約20分。JR播州赤穂駅から車で約25分。",
    region: lr("r404"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "堤防付近に駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.webp", images: [], rating: 3.6, reviewCount: 80,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ", source: "現地釣果情報" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "メバリング", source: "現地釣果情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中〜夕マヅメ", method: "穴釣り", source: "現地釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "現地釣果情報" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "現地釣果情報" },
      { fish: fish("aoriika"), monthStart: 9, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "エギング", source: "現地釣果情報" },
    ],
    bestTimes: btMorning,
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["石積み堤防は滑りやすい箇所あり（磯靴推奨）", "周辺に売店なし", "天候急変時は早めに撤収"],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      fishingLicenseRequired: false,
      otherRules: ["漁業関係者の通行を妨げないこと", "ゴミは必ず持ち帰り"],
    },
    gearGuides: [gearUki, gearNage, gearRock, gearEging, gearSabiki],
    youtubeLinks: [{ label: "赤穂福浦 チヌ釣り", searchQuery: "赤穂 福浦 チヌ カレイ 投げ釣り", description: "赤穂福浦での投げ釣り・チヌ釣り動画" }],
  },
];
