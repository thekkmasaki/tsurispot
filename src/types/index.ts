/** 構造物カテゴリ（特許 衛星画像解析 9分類） */
export type StructureCategory =
  | "seawall"          // 護岸
  | "tetrapod"         // テトラポッド
  | "rocky"            // 岩礁
  | "sandy"            // 砂浜
  | "pier"             // 桟橋
  | "port-facility"    // 港湾施設
  | "other-structure"  // その他構造物
  | "water"            // 水域
  | "land";            // 陸地

export const STRUCTURE_CATEGORY_LABELS: Record<StructureCategory, string> = {
  seawall: "護岸",
  tetrapod: "テトラポッド",
  rocky: "岩礁",
  sandy: "砂浜",
  pier: "桟橋",
  "port-facility": "港湾施設",
  "other-structure": "その他構造物",
  water: "水域",
  land: "陸地",
};

/** 8地域（regions-group.ts 準拠） */
export type RegionSlug =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu";

/** 地域別シーズンオーバーライド */
export interface RegionalSeasonData {
  seasonMonths: number[];
  peakMonths: number[];
}

export interface Region {
  id: string;
  prefecture: string;
  areaName: string;
  slug: string;
}

export interface FishingSpot {
  id: string;
  name: string;
  slug: string;
  isManagedPond?: boolean; // 管理釣り場 (営業時間あり): 混雑予想・タマヅメ等のおすすめ時間帯を非表示
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  accessInfo: string;
  region: Region;
  spotType: "port" | "beach" | "rocky" | "river" | "pier" | "breakwater" | "surf" | "lake" | "pond";
  difficulty: "beginner" | "intermediate" | "advanced" | "all";
  isFree: boolean;
  feeDetail?: string;
  hasParking: boolean;
  parkingDetail?: string;
  hasToilet: boolean;
  hasConvenienceStore: boolean;
  hasFishingShop: boolean;
  hasRentalRod: boolean;
  rentalDetail?: string;
  mainImageUrl: string;
  imageAttribution?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  catchableFish: CatchableFish[];
  bestTimes: BestTime[];
  tackleRecommendations: TackleRecommendation[];
  tideAdvice?: TideAdvice;
  mazumeInfo?: MazumeInfo;
  gearGuides?: GearGuide[];
  safetyLevel?: "safe" | "caution" | "danger";
  safetyNotes?: string[];
  isKuchikomiSpot?: boolean;
  youtubeLinks?: YouTubeSearchLink[];
  rules?: SpotRules;
  parkingPeakInfo?: ParkingPeakInfo;
  parkingGuide?: ParkingGuide;
  familyInfo?: FamilyInfo;
  spotPhotos?: SpotPhoto[];
  googleRating?: number;
  googleReviewCount?: number;
  managementInfo?: ManagementInfo;
  officialUrl?: string;
  /** 構造物カテゴリ（特許: 衛星画像解析による自動分類） */
  structureTypes?: StructureCategory[];
  /** 衛星画像URL */
  satelliteImageUrl?: string;
}

/**
 * 一覧カード表示用の軽量スポット型。
 * SpotCard / SpotListClient のフィルタが使うフィールドのみを持つ。catchableFish の重い
 * FishSpecies(24フィールド) を fishNames/methods(文字列配列) に削減し、穴場/高級魚判定は
 * サーバーで事前計算したフラグ(isHiddenGem/hasPremiumFish)として持つ。全 FishingSpot を
 * クライアントへ渡す代わりにこの型へ map することで JS バンドルと RSC ペイロードを削減する。
 * 変換は lib/data/list-spot.ts の toListSpot（サーバー専用）で行う。
 */
export interface ListSpot {
  id: string;
  slug: string;
  name: string;
  address: string;
  region: Region;
  latitude: number;
  longitude: number;
  spotType: FishingSpot["spotType"];
  difficulty: FishingSpot["difficulty"];
  isFree: boolean;
  hasParking: boolean;
  hasToilet: boolean;
  hasConvenienceStore: boolean;
  hasFishingShop: boolean;
  hasRentalRod: boolean;
  mainImageUrl: string;
  rating: number;
  /** 釣れる魚の名前（first-seen 順で unique。表示・対象魚フィルタ用） */
  fishNames: string[];
  /** 釣法（unique。釣法フィルタ用） */
  methods: string[];
  /** サーバー事前計算: 穴場判定 */
  isHiddenGem: boolean;
  /** サーバー事前計算: 高級魚が釣れるか */
  hasPremiumFish: boolean;
}

export interface SpotRules {
  castingAllowed: boolean;
  lureAllowed: boolean;
  chumAllowed: boolean;
  nightFishing?: boolean;
  fishingLicenseRequired: boolean;
  maxRods?: number;
  minKeepSize?: string;
  restrictedAreas?: string[];
  otherRules?: string[];
}

export interface ParkingPeakInfo {
  peakStartTime: string;
  recommendedArrival: string;
  alternateParking?: string;
}

export interface ParkingGuide {
  fee: "free" | "paid" | "conditional";
  feeDetail?: string;
  capacity?: number;
  parkingName?: string;
  locationNote?: string;
  parkingLatitude?: number;
  parkingLongitude?: number;
  walkToSpot?: string;
  peakTime?: string;
  alternate?: AlternateParking[];
  notes?: string[];
}

export interface AlternateParking {
  name: string;
  distance?: string;
  fee?: string;
  latitude?: number;
  longitude?: number;
}

export interface FamilyInfo {
  strollerAccessible: boolean;
  hasRailing: boolean;
  hasPlayArea: boolean;
  parkingToSpotDistance?: string;
  hasBabyChanging: boolean;
  hasNursing: boolean;
  familyNotes?: string;
}

export interface SpotPhoto {
  url: string;
  alt: string;
  credit: string;
}

export interface ManagementInfo {
  organizationName: string;
  contactPhone?: string;
  contactUrl?: string;
  openingHours?: string;
  closedDays?: string;
  fishingFee?: string;
  licensingInfo?: string;
  notes?: string[];
}

export interface FishSpecies {
  id: string;
  name: string;
  nameKana: string;
  nameEnglish: string;
  scientificName: string;
  slug: string;
  description: string;
  category: "sea" | "freshwater" | "brackish";
  family: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tasteRating: number;
  sizeCm: string;
  imageUrl: string;
  seasonMonths: number[];
  peakMonths: number[];
  cookingTips: string[];
  spots: SpotSummary[];
  spotCount?: number; // /fish リストページ用の軽量化フィールド: spots は先頭3件のみ、総数を保持
  aliases?: string[];
  popularity?: number;
  fishingMethods?: FishingMethod[];
  youtubeLinks?: YouTubeSearchLink[];
  userPhotos?: UserPhoto[];
  isPoisonous?: boolean;
  poisonType?: string;
  dangerLevel?: "low" | "medium" | "high";
  dangerNotes?: string[];
}

export interface UserPhoto {
  url: string;
  alt: string;
  credit: string;
}

export interface FishingMethod {
  methodName: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  bestSeason: string;
  tackle: {
    rod: string;
    reel: string;
    line: string;
    hookOrLure: string;
    otherItems: string[];
  };
  tips: string[];
}

export interface SpotSummary {
  id: string;
  name: string;
  slug: string;
  region: Region;
  rating: number;
  catchRating: "excellent" | "good" | "fair";
  latitude: number;
  longitude: number;
}

export interface CatchableFish {
  fish: FishSpecies;
  monthStart: number;
  monthEnd: number;
  peakSeason: boolean;
  catchDifficulty: "easy" | "medium" | "hard";
  recommendedTime: string;
  method: string;
  /** 釣果情報の出典（釣具店名・釣果サイト等） */
  source?: string;
}

export interface BestTime {
  label: string;
  timeRange: string;
  rating: "best" | "good" | "fair";
}

export interface TackleRecommendation {
  id: string;
  name: string;
  category: "rod" | "reel" | "line" | "hook" | "lure" | "set" | "other";
  brand: string;
  description: string;
  imageUrl: string;
  price: number;
  amazonUrl: string;
  rakutenUrl: string;
  rating: number;
  reviewCount: number;
  isBeginnerFriendly: boolean;
}

export interface TideInfo {
  date: string;
  tideType: string;
  highTide1: string;
  highTide1Cm: number;
  highTide2: string;
  highTide2Cm: number;
  lowTide1: string;
  lowTide1Cm: number;
  lowTide2: string;
  lowTide2Cm: number;
  sunrise: string;
  sunset: string;
}

export interface TideAdvice {
  bestTide: string;
  bestTidePhase: string;
  description: string;
}

export interface MazumeInfo {
  springSunrise: string;
  springSunset: string;
  summerSunrise: string;
  summerSunset: string;
  autumnSunrise: string;
  autumnSunset: string;
  winterSunrise: string;
  winterSunset: string;
  tip: string;
}

export interface GearGuide {
  targetFish: string;
  method: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  rod: string;
  reel: string;
  line: string;
  hook: string;
  otherItems: string[];
  tip: string;
  shopAdvice?: string;
}

export interface YouTubeSearchLink {
  label: string;
  searchQuery: string;
  description: string;
}

export interface TackleShop {
  id: string;
  name: string;
  slug: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  website?: string;
  businessHours: string;
  closedDays: string;
  region: Region;
  hasLiveBait: boolean;
  hasFrozenBait: boolean;
  hasRentalRod: boolean;
  hasParking?: boolean;
  parkingDetail?: string;
  services: string[];
  baitStock?: BaitStock[];
  nearbySpotSlugs: string[];
  imageUrl: string;
  photos?: string[];
  ownerMessage?: string;
  rating: number;
  isPremium: boolean;
  /** 掲載プラン: free(デフォルト) / basic(初年度500円・2年目〜980円) / pro(初年度1,980円・2年目〜2,980円) */
  planLevel?: "free" | "basic" | "pro";
  /** クーポン情報（プロプラン） */
  coupon?: { title: string; description: string; validUntil: string };
}

export interface BaitStock {
  name: string;
  available: boolean;
  price?: string;
  updatedAt: string;
}

/** Stripe サブスクリプション情報（DynamoDB保存） */
export interface SubscriptionData {
  stripeSubscriptionId: string;
  plan: "basic" | "pro";
  status: "active" | "past_due" | "canceled" | "unpaid";
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
}

export type SpotTypeLabel = {
  [key in FishingSpot["spotType"]]: string;
};

export const SPOT_TYPE_LABELS: SpotTypeLabel = {
  port: "漁港",
  beach: "砂浜",
  rocky: "磯",
  river: "河川",
  pier: "桟橋",
  breakwater: "堤防",
  surf: "サーフ",
  lake: "湖沼",
  pond: "管理釣り場（ポンド）",
};

export const DIFFICULTY_LABELS = {
  beginner: "初心者向け",
  intermediate: "中級者向け",
  advanced: "上級者向け",
  all: "初心者〜上級者向け",
} as const;

export const CATCH_RATING_LABELS = {
  excellent: "◎",
  good: "○",
  fair: "△",
} as const;

export const BEST_TIME_LABELS = {
  best: "◎ 最高",
  good: "○ 良い",
  fair: "△ まずまず",
} as const;

export const SAFETY_LEVEL_LABELS = {
  safe: "安全",
  caution: "注意",
  danger: "危険",
} as const;
