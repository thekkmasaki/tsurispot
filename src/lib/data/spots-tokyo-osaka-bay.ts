import type { FishingSpot, FishSpecies, GearGuide } from "@/types";
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

// ローカルリージョン（既存regionsに無いエリア用）
const localRegions = [
  { id: "r890", prefecture: "神奈川県", areaName: "川崎", slug: "kanagawa-kawasaki" },
  { id: "r891", prefecture: "神奈川県", areaName: "鶴見", slug: "kanagawa-tsurumi" },
  { id: "r892", prefecture: "千葉県", areaName: "市原", slug: "chiba-ichihara" },
];

function lr(id: string) {
  return localRegions.find((r) => r.id === id) || region(id);
}

// ベストタイム定数
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

// ギアガイド定数
const gearSabiki: GearGuide = { targetFish: "アジ・サバ・イワシ", method: "サビキ釣り", difficulty: "beginner", rod: "磯竿3号 3.6〜4.5m", reel: "スピニングリール 2500番", line: "ナイロン3号", hook: "サビキ仕掛け 5〜7号", otherItems: ["コマセカゴ", "アミエビ", "バケツ"], tip: "コマセは少しずつ出すのがコツ。夕マヅメが特に釣果がよい。" };
const gearChoinage: GearGuide = { targetFish: "ハゼ・シロギス", method: "ちょい投げ", difficulty: "beginner", rod: "万能竿 2.4〜3.6m", reel: "スピニングリール 2000〜2500番", line: "ナイロン2〜3号", hook: "流線針 6〜8号", otherItems: ["ナス型オモリ 5〜8号", "青イソメ", "バケツ"], tip: "足元から10〜30m程度に投げて底を探る。アタリがあったら少し送り込んでからアワセる。" };
const gearRock: GearGuide = { targetFish: "カサゴ・メバル", method: "穴釣り・根魚釣り", difficulty: "beginner", rod: "穴釣りロッド 1.1〜1.5m", reel: "小型両軸リール", line: "フロロ3号", hook: "ブラクリ 3〜5号", otherItems: ["アオイソメ", "サバの切り身"], tip: "テトラの隙間に落とし込み、底に着いたら少し持ち上げて待つ。" };
const gearUki: GearGuide = { targetFish: "クロダイ・メジナ", method: "ウキフカセ釣り", difficulty: "intermediate", rod: "磯竿1.5〜2号 5.3m", reel: "スピニングリール 2500〜3000番", line: "ナイロン2号", hook: "チヌ針3〜4号", otherItems: ["ウキ", "オキアミ", "コマセ"], tip: "潮の流れに乗せてウキを流すのがコツ。" };
const gearLure: GearGuide = { targetFish: "シーバス", method: "ルアー釣り", difficulty: "intermediate", rod: "シーバスロッド 9ft ML", reel: "スピニングリール 3000番", line: "PE 1号", hook: "ミノー 80〜120mm", otherItems: ["リーダー フロロ5号", "スナップ", "プライヤー"], tip: "常夜灯周りの明暗部を狙うのが基本。" };
const gearNage: GearGuide = { targetFish: "キス・カレイ", method: "投げ釣り", difficulty: "beginner", rod: "投げ竿 3.9〜4.25m", reel: "スピニングリール 3000〜4000番", line: "ナイロン4号", hook: "流線針 7〜9号", otherItems: ["天秤オモリ 20〜25号", "青イソメ", "竿立て"], tip: "砂地を狙って遠投。アタリは小さいのでラインを張りすぎないこと。" };
const gearJig: GearGuide = { targetFish: "ブリ・ヒラマサ・カンパチ", method: "ショアジギング", difficulty: "intermediate", rod: "ショアジギングロッド M〜MH 10ft", reel: "スピニングリール 4000〜5000番", line: "PE 1〜1.5号", hook: "メタルジグ 30〜60g", otherItems: ["リーダー フロロ5号", "プライヤー"], tip: "朝マヅメの時合いに集中。ジャークのリズムを一定に保つ。" };
const gearMebaring: GearGuide = { targetFish: "メバル", method: "メバリング", difficulty: "beginner", rod: "メバリングロッド 7〜8ft UL", reel: "スピニングリール 1000〜2000番", line: "フロロ 2〜3lb", hook: "ジグヘッド 1〜3g + ワーム", otherItems: ["プラグ各種", "スナップ"], tip: "常夜灯の明暗部を軽いジグヘッドでスローに攻める。" };
const gearTakoegi: GearGuide = { targetFish: "マダコ", method: "タコエギ", difficulty: "beginner", rod: "タコ専用ロッドまたは硬めのルアーロッド", reel: "スピニングリール 3000〜4000番", line: "PE 2〜3号", hook: "タコエギ 3.5号", otherItems: ["リーダー フロロ8号", "タコ入れネット"], tip: "底をズルズル引いて重みを感じたら大きくアワセる。" };
const gearSaguri: GearGuide = { targetFish: "カサゴ・アイナメ・マダコ", method: "探り釣り", difficulty: "beginner", rod: "短めの万能竿 1.5〜2.1m", reel: "小型スピニングリール 2000番", line: "ナイロン3号", hook: "丸セイゴ 10〜12号", otherItems: ["ナス型オモリ 3〜5号", "アオイソメ"], tip: "堤防の際や岩の隙間をテンポよく探る。アタリがあったら即アワセ。" };

export const tokyoOsakaBaySpots: FishingSpot[] = [
  // =========================================
  // 東京湾（6スポット）※本牧・うみかぜは既存のため除外
  // =========================================
  {
    id: "stob001", name: "豊洲ぐるり公園", slug: "toyosu-gururi-park",
    description: "豊洲市場のすぐ隣に整備された全長約4.5kmの護岸公園。東京湾を見渡せる開放的なロケーションで、シーバスやクロダイの好ポイントとして知られる。護岸は足場が広く柵も設置されているため、小さな子供連れでも安心して釣りが楽しめる。秋にはハゼのちょい投げで数釣りが可能で、冬場はカレイ狙いの投げ釣り師も多い。ゆりかもめ市場前駅から徒歩圏内でアクセスも抜群。",
    latitude: 35.6460, longitude: 139.7920,
    address: "〒135-0061 東京都江東区豊洲6丁目",
    accessInfo: "ゆりかもめ市場前駅から徒歩5分。首都高速豊洲ICから約5分。",
    region: region("r870"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "豊洲市場駐車場（有料）を利用可能",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 3.8, reviewCount: 180,
    catchableFish: [
      { fish: fish("seabass"), monthStart: 4, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: "上州屋" },
      { fish: fish("haze"), monthStart: 7, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ", source: "上州屋" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜日中", method: "ウキフカセ", source: "上州屋" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "上州屋" },
      { fish: fish("sayori"), monthStart: 9, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ウキ釣り", source: "現地情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り", source: "現地情報" },
    ], bestTimes: btEvening, tackleRecommendations: [],
    gearGuides: [gearLure, gearChoinage, gearUki, gearNage],
    safetyLevel: "safe", safetyNotes: ["護岸に柵あり", "足場が広くフラット", "夜間も街灯あり"],
  },
  {
    id: "stob002", name: "東扇島西公園", slug: "higashiogishima-nishi-park",
    description: "川崎市の人工島・東扇島にある無料の海釣り公園。約500mの護岸釣り場があり、アジやサバのサビキ釣りからタチウオの夜釣り、シーバスのルアーフィッシングまで多彩な釣りが楽しめる。特に秋のタチウオシーズンは大勢の釣り人で賑わう。駐車場やトイレも完備されており、川崎エリアでは貴重な無料釣りスポットとして幅広い層に親しまれている。",
    latitude: 35.4760, longitude: 139.7570,
    address: "〒210-0869 神奈川県川崎市川崎区東扇島94-1",
    accessInfo: "JR川崎駅東口から市営バス「東扇島西公園前」下車。首都高速湾岸線東扇島ICから約5分。",
    region: lr("r890"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "無料駐車場あり（約200台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 3.9, reviewCount: 230,
    catchableFish: [
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ウキ釣り・テンヤ", source: "上州屋" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り", source: "現地情報" },
    ], bestTimes: btEvening, tackleRecommendations: [],
    gearGuides: [gearSabiki, gearLure, gearRock],
    safetyLevel: "safe", safetyNotes: ["護岸に柵あり", "足場は平坦で安全", "駐車場から釣り場まで近い"],
  },
  {
    id: "stob003", name: "ふれーゆ裏", slug: "fureyu-ura",
    description: "横浜市鶴見区にある温水プール施設「ふれーゆ」の裏手に広がる護岸釣り場。正式な釣り場ではないが、地元では有名なポイント。特にタチウオの夜釣りで知られ、秋のシーズンには護岸が釣り人で埋まるほどの人気ぶり。アジやイワシのサビキ釣りも安定した釣果があり、常夜灯が多いため夜釣りがしやすい環境。周辺にコンビニがないので食料や飲み物は事前に用意しておきたい。",
    latitude: 35.5020, longitude: 139.6750,
    address: "〒230-0045 神奈川県横浜市鶴見区末広町1丁目",
    accessInfo: "JR鶴見駅から横浜市営バスで約15分「ふれーゆ」下車。",
    region: lr("r891"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "ふれーゆ施設駐車場あり（営業時間に注意）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 3.7, reviewCount: 160,
    catchableFish: [
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ウキ釣り・テンヤ", source: "上州屋" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー", source: "上州屋" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "メバリング", source: "現地情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り", source: "現地情報" },
    ], bestTimes: btNight, tackleRecommendations: [],
    gearGuides: [gearSabiki, gearLure, gearMebaring, gearRock],
    safetyLevel: "caution", safetyNotes: ["柵がない区間があるため注意", "夜釣り時はヘッドライト必須", "施設の営業時間外は駐車場が閉鎖される場合あり"],
  },
  {
    id: "stob004", name: "大黒海づり施設", slug: "daikoku-fishing-facility",
    description: "横浜ベイブリッジのたもとに位置する有料の管理釣り場。護岸沿いに設置された釣り台から安全に釣りが楽しめ、売店ではエサや仕掛けの購入も可能。レンタルロッドも充実しており、手ぶらで来ても釣りが楽しめるため初心者やファミリーに人気。アジやカサゴの安定した釣果に加え、時期によってはイナダやタチウオなど大物も回遊する。",
    latitude: 35.4740, longitude: 139.6640,
    address: "〒230-0054 神奈川県横浜市鶴見区大黒ふ頭20",
    accessInfo: "JR鶴見駅から横浜市営バスで約30分。首都高速湾岸線大黒ふ頭ICから約5分。",
    region: lr("r891"), spotType: "pier", difficulty: "beginner",
    isFree: false, feeDetail: "大人900円、中学生450円、小学生300円",
    hasParking: true, parkingDetail: "有料駐車場あり（3時間250円、以降30分100円）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    rentalDetail: "レンタル竿セット2,200円（仕掛け・エサ付き）",
    mainImageUrl: "", images: [], rating: 4.0, reviewCount: 210,
    managementInfo: {
      organizationName: "横浜フィッシングピアーズ",
      openingHours: "6:00〜19:00（季節変動あり）",
      closedDays: "施設点検日、年末年始",
      fishingFee: "大人900円、中学生450円、小学生300円",
    },
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中〜夜", method: "穴釣り・ブラクリ", source: "上州屋" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 4, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "メバリング・ウキ釣り", source: "上州屋" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("karei"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "上州屋" },
    ], bestTimes: btAllDay, tackleRecommendations: [],
    gearGuides: [gearSabiki, gearRock, gearMebaring, gearChoinage],
    safetyLevel: "safe", safetyNotes: ["管理釣り場のため安全設備完備", "柵あり", "スタッフ常駐で初心者も安心"],
  },
  {
    id: "stob005", name: "磯子海づり施設", slug: "isogo-fishing-facility",
    description: "横浜市磯子区にある有料の海釣り施設。約500mの護岸に柵付きの釣り台が設置されており、足場が非常に良いためファミリーフィッシングの定番スポット。冬場のカレイやアイナメ、春からはメバルやカサゴの根魚、夏から秋にかけてはアジやイワシのサビキ釣りが楽しめる。売店やレンタル竿も充実しており、初めての海釣りにもおすすめ。",
    latitude: 35.3940, longitude: 139.6320,
    address: "〒235-0017 神奈川県横浜市磯子区新磯子町38",
    accessInfo: "JR磯子駅から市営バスで約10分。首都高速磯子ICから約5分。",
    region: region("r6"), spotType: "pier", difficulty: "beginner",
    isFree: false, feeDetail: "大人900円、中学生450円、小学生300円",
    hasParking: true, parkingDetail: "有料駐車場あり（3時間250円、以降30分100円）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    rentalDetail: "レンタル竿セット2,200円（仕掛け・エサ付き）",
    mainImageUrl: "", images: [], rating: 3.9, reviewCount: 190,
    managementInfo: {
      organizationName: "横浜フィッシングピアーズ",
      openingHours: "6:00〜19:00（季節変動あり）",
      closedDays: "施設点検日、年末年始",
      fishingFee: "大人900円、中学生450円、小学生300円",
    },
    catchableFish: [
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "上州屋" },
      { fish: fish("ainame"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "ブラクリ・探り釣り", source: "上州屋" },
      { fish: fish("mebaru"), monthStart: 11, monthEnd: 5, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ〜夜", method: "ウキ釣り・メバリング", source: "上州屋" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中〜夜", method: "穴釣り", source: "上州屋" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "上州屋" },
    ], bestTimes: btAllDay, tackleRecommendations: [],
    gearGuides: [gearNage, gearRock, gearSabiki, gearMebaring],
    safetyLevel: "safe", safetyNotes: ["管理釣り場のため安全設備完備", "柵あり", "スタッフ常駐"],
  },
  {
    id: "stob006", name: "市原海釣り施設（オリジナルメーカー海づり公園）", slug: "ichihara-sea-fishing",
    description: "東京湾に突き出た桟橋型の有料海釣り施設。全長約300mの桟橋から沖合の深場を狙えるのが最大の魅力で、陸からでは届かないポイントにアプローチできる。アジやシロギスの数釣りから、秋冬のカレイ、回遊次第ではワラサやイナダも期待できる。管理施設のためトイレや売店完備、レンタル竿もあるのでビギナーのデビューにもぴったり。",
    latitude: 35.4680, longitude: 140.0810,
    address: "〒290-0045 千葉県市原市五井南海岸1-12",
    accessInfo: "JR五井駅から無料送迎バスあり（約15分）。館山自動車道市原ICから約15分。",
    region: lr("r892"), spotType: "pier", difficulty: "beginner",
    isFree: false, feeDetail: "大人940円、中学生以下470円",
    hasParking: true, parkingDetail: "無料駐車場あり（約300台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    rentalDetail: "レンタル竿セット一式あり（要確認）",
    mainImageUrl: "", images: [], rating: 3.8, reviewCount: 170,
    managementInfo: {
      organizationName: "市原市海釣り施設管理事務所",
      openingHours: "6:00〜19:00（季節変動あり）",
      closedDays: "月曜日（祝日の場合は翌日）、年末年始、荒天時",
      fishingFee: "大人940円、中学生以下470円",
    },
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "ちょい投げ", source: "上州屋" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("seabass"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ルアー", source: "上州屋" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中〜夜", method: "穴釣り", source: "現地情報" },
    ], bestTimes: btMorning, tackleRecommendations: [],
    gearGuides: [gearSabiki, gearChoinage, gearNage, gearRock],
    safetyLevel: "safe", safetyNotes: ["桟橋型のため足場良好", "柵完備", "送迎バスあり"],
  },

  // =========================================
  // 大阪湾（7スポット）
  // =========================================
  {
    id: "stob007", name: "南港魚つり園護岸", slug: "nanko-fishing-park",
    description: "大阪市南港にある無料の管理釣り場。約700mの護岸から手軽にサビキ釣りが楽しめ、アジやサバ、イワシの回遊が安定している。足場が広く柵も設置されているため、ファミリーフィッシングの定番スポットとして大阪では広く知られている。秋にはタチウオの夜釣り師も集まる。売店でエサや仕掛けの購入も可能で、初めての釣りデビューに最適な場所。",
    latitude: 34.6180, longitude: 135.3960,
    address: "〒559-0032 大阪府大阪市住之江区南港南6丁目9-3",
    accessInfo: "ニュートラムフェリーターミナル駅から徒歩約10分。阪神高速南港ICから約10分。",
    region: region("r131"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    rentalDetail: "レンタル竿あり（要確認）",
    mainImageUrl: "", images: [], rating: 3.8, reviewCount: 200,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ〜日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ウキ釣り", source: "上州屋" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: "上州屋" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夜", method: "ルアー", source: "現地情報" },
    ], bestTimes: btEvening, tackleRecommendations: [],
    gearGuides: [gearSabiki, gearUki, gearLure],
    safetyLevel: "safe", safetyNotes: ["柵完備で安全", "足場が広い", "管理人駐在"],
  },
  {
    id: "stob008", name: "貝塚人工島", slug: "kaizuka-artificial-island",
    description: "大阪湾南部に位置する人工島で、ショアジギングの好ポイントとして大阪の釣り人に絶大な人気を誇る。特にタチウオのシーズンは護岸が釣り人で埋まるほどの盛況ぶり。青物の回遊もあり、秋にはハマチやサゴシがジグに食いつく。サビキ釣りでアジやサバ、底物ではカレイやガシラも狙える。広大な護岸は水深もあり、多彩な釣り物を一年通して楽しめるポイント。",
    latitude: 34.4470, longitude: 135.3510,
    address: "〒597-0094 大阪府貝塚市二色南町",
    accessInfo: "南海本線貝塚駅から水鉄バスで約15分。阪神高速貝塚ICから約10分。",
    region: region("r881"), spotType: "breakwater", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "無料駐車スペースあり（早朝から埋まりやすい）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 4.0, reviewCount: 250,
    catchableFish: [
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ウキ釣り・テンヤ", source: "上州屋" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: "上州屋" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り", source: "現地情報" },
      { fish: fish("karei"), monthStart: 10, monthEnd: 3, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "上州屋" },
    ], bestTimes: btNight, tackleRecommendations: [],
    gearGuides: [gearJig, gearSabiki, gearUki, gearRock],
    safetyLevel: "caution", safetyNotes: ["柵のない区間あり", "テトラ帯は足元注意", "夜釣り時は十分な照明を"],
  },
  {
    id: "stob009", name: "岸和田旧港", slug: "kishiwada-old-port",
    description: "だんじり祭りで有名な岸和田市にある歴史ある漁港。港内は波が穏やかで、ファミリーでのんびりとサビキ釣りやちょい投げが楽しめる。アジやチヌ（クロダイ）が定番のターゲットで、夏から秋にかけてはタコ釣りも人気。港の雰囲気が良く、地元の食堂で新鮮な魚料理も味わえるため、釣りと観光を兼ねたお出かけにもぴったり。",
    latitude: 34.4630, longitude: 135.3690,
    address: "〒596-0014 大阪府岸和田市港緑町",
    accessInfo: "南海本線岸和田駅から徒歩約15分。阪神高速岸和田南ICから約5分。",
    region: region("r881"), spotType: "port", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "港周辺に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 3.6, reviewCount: 130,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ・落とし込み", source: "上州屋" },
      { fish: fish("madako"), monthStart: 6, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中〜夕方", method: "タコエギ", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り", source: "現地情報" },
    ], bestTimes: btEvening, tackleRecommendations: [],
    gearGuides: [gearSabiki, gearUki, gearTakoegi, gearRock],
    safetyLevel: "safe", safetyNotes: ["港内は波穏やか", "足場良好", "近くにコンビニあり"],
  },
  {
    id: "stob010", name: "忠岡テラス", slug: "tadaoka-terrace",
    description: "泉北郡忠岡町にあるテラス状に整備された護岸釣り場。足場が非常に良く、手すりも設置されているためファミリーに人気。チヌ（クロダイ）釣りの好ポイントとして地元では定評があり、落とし込み釣りやウキフカセで良型が上がる。秋はタチウオの夜釣り、サビキ釣りでのアジ・サバも楽しめる。駐車場からも近く、手軽にアクセスできるのが魅力。",
    latitude: 34.4900, longitude: 135.3870,
    address: "〒595-0805 大阪府泉北郡忠岡町忠岡東1丁目",
    accessInfo: "南海本線忠岡駅から徒歩約15分。阪神高速忠岡ICから約5分。",
    region: region("r880"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "近隣に無料駐車スペースあり",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 3.7, reviewCount: 120,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜夕マヅメ", method: "ウキフカセ・落とし込み", source: "上州屋" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ウキ釣り", source: "上州屋" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("saba"), monthStart: 7, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り", source: "現地情報" },
    ], bestTimes: btEvening, tackleRecommendations: [],
    gearGuides: [gearUki, gearSabiki, gearRock],
    safetyLevel: "safe", safetyNotes: ["テラス状で足場良好", "手すりあり", "夜間照明は少ない"],
  },
  {
    id: "stob011", name: "りんくう公園護岸", slug: "rinku-park",
    description: "関西国際空港の対岸に広がるりんくうタウン内の護岸釣り場。目の前に関空連絡橋を望む絶景ロケーションが魅力。サビキ釣りでアジやイワシが手軽に狙え、秋はタチウオの夜釣りが人気。チヌの落とし込みポイントとしても評価が高い。りんくうプレミアム・アウトレットにも近いため、買い物と釣りを組み合わせた休日プランにもおすすめ。",
    latitude: 34.4250, longitude: 135.2940,
    address: "〒598-0048 大阪府泉佐野市りんくう往来南3",
    accessInfo: "南海・JR日根野線りんくうタウン駅から徒歩約5分。関西空港自動車道泉佐野ICから約5分。",
    region: region("r882"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "りんくう公園駐車場あり（有料）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 3.7, reviewCount: 150,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ウキ釣り", source: "上州屋" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ〜日中", method: "ウキフカセ・落とし込み", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り", source: "現地情報" },
    ], bestTimes: btEvening, tackleRecommendations: [],
    gearGuides: [gearSabiki, gearUki, gearRock],
    safetyLevel: "safe", safetyNotes: ["公園内のため足場良好", "トイレ・自販機あり", "夜間は暗くなる場所もあり"],
  },
  {
    id: "stob012", name: "泉大津なぎさ公園", slug: "izumiotsu-nagisa-park",
    description: "泉大津市の臨海部に整備された公園。護岸からの釣りが楽しめ、足場が良好でファミリーにも適している。サビキ釣りでのアジ・イワシが定番で、秋にはタチウオ狙いの釣り人が増える。チヌのフカセ釣りやカサゴの穴釣りなど、多様な釣り方に対応。芝生広場もあり、子供を遊ばせながらのんびり竿を出せるのが人気の理由。ウキ釣りやウキフカセなど複数の釣法に対応した好ポイントです。",
    latitude: 34.5070, longitude: 135.3750,
    address: "〒595-0055 大阪府泉大津市なぎさ町",
    accessInfo: "南海本線泉大津駅から徒歩約20分。阪神高速泉大津ICから約5分。",
    region: region("r880"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 3.6, reviewCount: 110,
    catchableFish: [
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("tachiuo"), monthStart: 8, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夜", method: "ウキ釣り", source: "上州屋" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ウキフカセ", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り", source: "現地情報" },
    ], bestTimes: btEvening, tackleRecommendations: [],
    gearGuides: [gearSabiki, gearUki, gearRock],
    safetyLevel: "safe", safetyNotes: ["足場良好", "公園内にトイレあり", "芝生広場でファミリー向け"],
  },
  {
    id: "stob013", name: "大阪南港サンセット広場", slug: "nanko-sunset-plaza",
    description: "大阪南港の北側に位置するサンセット広場は、その名の通り美しい夕日が楽しめるロケーション。護岸からの釣りではチヌやシーバスが人気のターゲットで、エサ釣りからルアーフィッシングまで幅広いスタイルに対応。サビキ釣りでアジやイワシも狙え、特に夕方から日没にかけての時間帯が狙い目。都市部からのアクセスが良好で、仕事帰りの夕マヅメ釣行にも便利。",
    latitude: 34.6350, longitude: 135.4120,
    address: "〒559-0034 大阪府大阪市住之江区南港北2丁目",
    accessInfo: "ニュートラムトレードセンター前駅から徒歩約10分。阪神高速南港ICから約5分。",
    region: region("r131"), spotType: "pier", difficulty: "beginner",
    isFree: true, hasParking: true, parkingDetail: "近隣にコインパーキングあり",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 3.5, reviewCount: 100,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ウキフカセ・落とし込み", source: "上州屋" },
      { fish: fish("seabass"), monthStart: 3, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ〜夜", method: "ルアー", source: "上州屋" },
      { fish: fish("aji"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "サビキ釣り", source: "上州屋" },
      { fish: fish("iwashi"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "サビキ釣り", source: "現地情報" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夜", method: "穴釣り", source: "現地情報" },
    ], bestTimes: btEvening, tackleRecommendations: [],
    gearGuides: [gearUki, gearLure, gearSabiki],
    safetyLevel: "safe", safetyNotes: ["護岸は整備されている", "夕方以降は暗くなるのでライト推奨", "都市部のためアクセス良好"],
  },
];
