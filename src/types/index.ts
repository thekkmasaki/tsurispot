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
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  accessInfo: string;
  region: Region;
  spotType: "port" | "beach" | "rocky" | "river" | "pier" | "breakwater";
  difficulty: "beginner" | "intermediate" | "advanced";
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
  familyInfo?: FamilyInfo;
  spotPhotos?: SpotPhoto[];
}

export interface SpotRules {
  castingAllowed: boolean;
  lureAllowed: boolean;
  chumAllowed: boolean;
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
  services: string[];
  baitStock?: BaitStock[];
  nearbySpotSlugs: string[];
  imageUrl: string;
  rating: number;
  isPremium: boolean;
}

export interface BaitStock {
  name: string;
  available: boolean;
  price?: string;
  updatedAt: string;
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
};

export const DIFFICULTY_LABELS = {
  beginner: "初心者向け",
  intermediate: "中級者向け",
  advanced: "上級者向け",
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
