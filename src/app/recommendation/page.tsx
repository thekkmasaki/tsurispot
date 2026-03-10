"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Star,
  Fish,
  Users,
  Waves,
  Moon,
  MapPin,
  Award,
  Sparkles,
  Calendar,
  User,
  UserPlus,
  Heart,
  Trophy,
  TrendingUp,
  Compass,
  Navigation,
  Check,
  Globe,
  ChevronDown,
  RotateCcw,
  Map,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import type { FishingSpot, FishSpecies } from "@/types";

// --- 潮汐計算（tidesページと同じロジック） ---

function getMoonAge(date: Date): number {
  const knownNewMoon = new Date(2024, 0, 11);
  const diffDays =
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  return ((diffDays % 29.53) + 29.53) % 29.53;
}

function getTideType(
  moonAge: number
): "大潮" | "中潮" | "小潮" | "長潮" | "若潮" {
  if (moonAge < 2 || (moonAge >= 13.5 && moonAge < 16.5)) return "大潮";
  if (
    (moonAge >= 2 && moonAge < 5) ||
    (moonAge >= 10 && moonAge < 13.5) ||
    (moonAge >= 16.5 && moonAge < 20) ||
    (moonAge >= 25 && moonAge < 28)
  )
    return "中潮";
  if ((moonAge >= 5 && moonAge < 8) || (moonAge >= 20 && moonAge < 23))
    return "小潮";
  if ((moonAge >= 8 && moonAge < 9) || (moonAge >= 23 && moonAge < 24))
    return "長潮";
  if ((moonAge >= 9 && moonAge < 10) || (moonAge >= 24 && moonAge < 25))
    return "若潮";
  return "中潮";
}

function getTideScore(tideType: string): number {
  switch (tideType) {
    case "大潮":
      return 10;
    case "中潮":
      return 7;
    case "小潮":
      return 4;
    case "長潮":
      return 2;
    case "若潮":
      return 3;
    default:
      return 5;
  }
}

function getTideTypeColor(type: string): string {
  switch (type) {
    case "大潮":
      return "bg-orange-500 text-white";
    case "中潮":
      return "bg-blue-500 text-white";
    case "小潮":
      return "bg-gray-500 text-white";
    case "長潮":
    case "若潮":
      return "bg-emerald-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

// --- 旬判定 ---

function isFishInSeason(
  fish: FishSpecies,
  month: number
): { inSeason: boolean; isPeak: boolean } {
  const inSeason = fish.seasonMonths.includes(month);
  const isPeak = fish.peakMonths.includes(month);
  return { inSeason, isPeak };
}

// --- スポットの釣れる魚を指定月で絞る ---

function getCatchableFishNow(
  spot: FishingSpot,
  month: number
): { fish: FishSpecies; isPeak: boolean; method: string }[] {
  return spot.catchableFish
    .filter((cf) => {
      const start = cf.monthStart;
      const end = cf.monthEnd;
      if (start <= end) {
        return month >= start && month <= end;
      }
      return month >= start || month <= end;
    })
    .map((cf) => ({
      fish: cf.fish,
      isPeak: cf.peakSeason,
      method: cf.method,
    }));
}

// --- スコアリング ---

type UserLevel = "beginner" | "intermediate" | "advanced";
type Companion = "solo" | "friends" | "family";

interface ScoredSpot {
  spot: FishingSpot;
  totalScore: number;
  seasonScore: number;
  tideScore: number;
  difficultyScore: number;
  seasonalFitScore: number;
  catchableFishNow: { fish: FishSpecies; isPeak: boolean; method: string }[];
  rank: "S" | "A" | "B" | "C";
  reason: string;
}

function scoreSpot(
  spot: FishingSpot,
  month: number,
  tideType: string,
  userLevel: UserLevel,
  companion: Companion,
  targetFishSlug: string | null
): ScoredSpot {
  const catchableNow = getCatchableFishNow(spot, month);

  // 1. 旬スコア (0-10)
  let seasonScore = 0;
  if (catchableNow.length > 0) {
    const peakCount = catchableNow.filter((c) => c.isPeak).length;
    const normalCount = catchableNow.length - peakCount;
    seasonScore = Math.min(10, peakCount * 3.5 + normalCount * 1.5);
  }

  // 対象魚フィルタ: 選んだ魚がいるスポットに加点
  if (targetFishSlug) {
    const hasTarget = catchableNow.some(
      (c) => c.fish.slug === targetFishSlug
    );
    if (hasTarget) {
      const isPeakTarget = catchableNow.some(
        (c) => c.fish.slug === targetFishSlug && c.isPeak
      );
      seasonScore += isPeakTarget ? 5 : 3;
    } else {
      seasonScore -= 5;
    }
  }

  // 2. 潮回りスコア (0-10)
  const tideScore = getTideScore(tideType);

  // 3. 難易度マッチスコア (0-10)
  let difficultyScore = 5;
  const levelMap: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };
  const spotLevel = levelMap[spot.difficulty] || 1;
  const userLevelNum = levelMap[userLevel] || 1;

  if (spotLevel === userLevelNum) {
    difficultyScore = 10;
  } else if (Math.abs(spotLevel - userLevelNum) === 1) {
    difficultyScore = 6;
  } else {
    difficultyScore = 2;
  }

  // 同行者補正
  if (companion === "family") {
    if (spot.difficulty === "beginner") difficultyScore += 3;
    if (spot.hasToilet) difficultyScore += 1;
    if (spot.hasParking) difficultyScore += 1;
    if (spot.hasConvenienceStore) difficultyScore += 1;
    if (spot.difficulty === "advanced") difficultyScore -= 4;
  }

  difficultyScore = Math.max(0, Math.min(10, difficultyScore));

  // 4. 季節適合度 (0-10)
  let seasonalFitScore = 5;
  const season = getSeason(month);
  if (season === "summer" && (spot.spotType === "beach" || spot.spotType === "port")) {
    seasonalFitScore = 8;
  } else if (season === "winter" && (spot.spotType === "port" || spot.spotType === "breakwater")) {
    seasonalFitScore = 7;
  } else if (season === "spring" && spot.spotType === "river") {
    seasonalFitScore = 8;
  } else if (season === "autumn") {
    seasonalFitScore = 7; // 秋は全般的に良い
  }

  // 評価加点
  seasonalFitScore += Math.min(2, (spot.rating - 3.5) * 2);
  seasonalFitScore = Math.max(0, Math.min(10, seasonalFitScore));

  // 合計スコア
  const totalScore =
    seasonScore * 0.35 +
    tideScore * 0.2 +
    difficultyScore * 0.25 +
    seasonalFitScore * 0.2;

  // ランク
  let rank: "S" | "A" | "B" | "C";
  if (totalScore >= 8) rank = "S";
  else if (totalScore >= 6) rank = "A";
  else if (totalScore >= 4) rank = "B";
  else rank = "C";

  // おすすめ理由
  const reason = generateReason(
    spot,
    catchableNow,
    tideType,
    userLevel,
    companion,
    season
  );

  return {
    spot,
    totalScore,
    seasonScore,
    tideScore,
    difficultyScore,
    seasonalFitScore,
    catchableFishNow: catchableNow,
    rank,
    reason,
  };
}

function getSeason(
  month: number
): "spring" | "summer" | "autumn" | "winter" {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function getSeasonLabel(
  season: "spring" | "summer" | "autumn" | "winter"
): string {
  switch (season) {
    case "spring":
      return "春";
    case "summer":
      return "夏";
    case "autumn":
      return "秋";
    case "winter":
      return "冬";
  }
}

function generateReason(
  spot: FishingSpot,
  catchable: { fish: FishSpecies; isPeak: boolean; method: string }[],
  tideType: string,
  userLevel: UserLevel,
  companion: Companion,
  season: "spring" | "summer" | "autumn" | "winter"
): string {
  const parts: string[] = [];

  // 潮回りコメント
  if (tideType === "大潮") {
    parts.push("大潮で潮の動きが大きい日");
  } else if (tideType === "中潮") {
    parts.push("中潮で安定した釣果が期待できる日");
  }

  // 旬の魚コメント
  const peakFish = catchable.filter((c) => c.isPeak);
  if (peakFish.length > 0) {
    const fishNames = peakFish
      .slice(0, 3)
      .map((c) => c.fish.name)
      .join("・");
    const method = peakFish[0].method;
    parts.push(`${fishNames}が旬を迎えており、${method}で狙えます`);
  } else if (catchable.length > 0) {
    const fishNames = catchable
      .slice(0, 2)
      .map((c) => c.fish.name)
      .join("・");
    parts.push(`${fishNames}が釣れるシーズン`);
  }

  // 同行者コメント
  if (companion === "family" && spot.difficulty === "beginner") {
    parts.push("家族連れでも安心の設備が整っています");
  }

  if (parts.length === 0) {
    parts.push(
      `${getSeasonLabel(season)}の${spot.spotType === "port" ? "港" : spot.spotType === "beach" ? "砂浜" : "釣り場"}として人気のスポット`
    );
  }

  return parts.join("。") + "。";
}

// --- ランクバッジの色 ---

function getRankColor(rank: string): string {
  switch (rank) {
    case "S":
      return "bg-gradient-to-r from-amber-400 to-yellow-500 text-white";
    case "A":
      return "bg-gradient-to-r from-red-400 to-rose-500 text-white";
    case "B":
      return "bg-gradient-to-r from-blue-400 to-indigo-500 text-white";
    case "C":
      return "bg-gray-400 text-white";
    default:
      return "bg-gray-400 text-white";
  }
}

// --- 旬の魚リストを取得 ---

function getSeasonalFish(month: number): FishSpecies[] {
  return fishSpecies.filter(
    (f) => f.peakMonths.includes(month) || f.seasonMonths.includes(month)
  );
}

function getPeakFishList(month: number): FishSpecies[] {
  return fishSpecies.filter((f) => f.peakMonths.includes(month));
}

// --- JSON-LD ---

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://tsurispot.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "今週どこ行こうかな？",
      item: "https://tsurispot.com/recommendation",
    },
  ],
};

// --- エリア定義 ---

type RegionGroup = "all" | "hokkaido-tohoku" | "kanto" | "chubu-hokuriku" | "kansai" | "chugoku-shikoku" | "kyushu-okinawa" | "geolocation";

interface RegionOption {
  value: RegionGroup;
  label: string;
  icon: string;
  prefectures: string[];
}

const REGION_OPTIONS: RegionOption[] = [
  { value: "all", label: "全国", icon: "🗾", prefectures: [] },
  {
    value: "hokkaido-tohoku",
    label: "北海道・東北",
    icon: "🏔️",
    prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  },
  {
    value: "kanto",
    label: "関東",
    icon: "🏙️",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  },
  {
    value: "chubu-hokuriku",
    label: "中部・北陸",
    icon: "⛰️",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  },
  {
    value: "kansai",
    label: "関西",
    icon: "⛩️",
    prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  },
  {
    value: "chugoku-shikoku",
    label: "中国・四国",
    icon: "🌊",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"],
  },
  {
    value: "kyushu-okinawa",
    label: "九州・沖縄",
    icon: "🌺",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
  },
];

// --- 釣りの種類 ---

type FishingCategory = "all" | "sea" | "freshwater";

// --- ステップ定義（6ステップ） ---

const STEPS = [
  { id: 1, label: "日付", shortLabel: "日付" },
  { id: 2, label: "種類", shortLabel: "種類" },
  { id: 3, label: "エリア", shortLabel: "エリア" },
  { id: 4, label: "レベル", shortLabel: "レベル" },
  { id: 5, label: "同行者", shortLabel: "同行者" },
  { id: 6, label: "釣りたい魚", shortLabel: "魚" },
] as const;

// --- 距離計算 ---

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- 日付関連のヘルパー ---

function getDayLabel(date: Date, today: Date): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const diffMs = date.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const monthDay = `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;

  if (diffDays === 0) return `今日 ${monthDay}`;
  if (diffDays === 1) return `明日 ${monthDay}`;
  return monthDay;
}

function getDateChipStyle(date: Date): string {
  const day = date.getDay();
  if (day === 0) return "border-red-300 hover:border-red-500 hover:bg-red-50"; // 日曜
  if (day === 6) return "border-blue-300 hover:border-blue-500 hover:bg-blue-50"; // 土曜
  return "border-gray-200 hover:border-orange-400 hover:bg-orange-50"; // 平日
}

function getDateChipSelectedStyle(date: Date): string {
  const day = date.getDay();
  if (day === 0) return "border-red-500 bg-red-50 ring-2 ring-red-300"; // 日曜
  if (day === 6) return "border-blue-500 bg-blue-50 ring-2 ring-blue-300"; // 土曜
  return "border-orange-500 bg-orange-50 ring-2 ring-orange-300"; // 平日
}

function getDateTextColor(date: Date): string {
  const day = date.getDay();
  if (day === 0) return "text-red-600";
  if (day === 6) return "text-blue-600";
  return "text-gray-700";
}

// --- メインページ ---

export default function RecommendationPage() {
  const [today] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // 日付選択（8日分生成）
  const dateOptions = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [today]);

  // 選択された日付（デフォルトは今日）
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedMoonAge = getMoonAge(selectedDate);
  const selectedTideType = getTideType(selectedMoonAge);

  // ウィザード状態
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  // フィルター状態
  const [fishingCategory, setFishingCategory] = useState<FishingCategory>("all");
  const [selectedRegion, setSelectedRegion] = useState<RegionGroup>("all");
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [showPrefectureDetail, setShowPrefectureDetail] = useState(false);
  const [userLevel, setUserLevel] = useState<UserLevel>("beginner");
  const [companion, setCompanion] = useState<Companion>("solo");
  const [targetFishSlug, setTargetFishSlug] = useState<string | null>(null);

  // 位置情報
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // ステップ遷移
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    if (step === 7) {
      setShowResults(true);
    }
  }, []);

  const completeStep = useCallback((step: number) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  // Step 1: 日付選択
  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      completeStep(1);
      goToStep(2);
    },
    [completeStep, goToStep]
  );

  // Step 2: カテゴリ選択
  const handleCategorySelect = useCallback(
    (cat: FishingCategory) => {
      setFishingCategory(cat);
      completeStep(2);
      goToStep(3);
    },
    [completeStep, goToStep]
  );

  // Step 3: エリア選択
  const handleRegionSelect = useCallback(
    (region: RegionGroup) => {
      if (region === "geolocation") {
        setGeoLoading(true);
        setGeoError(null);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
              setSelectedRegion("geolocation");
              setSelectedPrefecture(null);
              setShowPrefectureDetail(false);
              setGeoLoading(false);
              completeStep(3);
              goToStep(4);
            },
            () => {
              setGeoError("位置情報を取得できませんでした");
              setGeoLoading(false);
            },
            { enableHighAccuracy: false, timeout: 10000 }
          );
        } else {
          setGeoError("お使いのブラウザは位置情報に対応していません");
          setGeoLoading(false);
        }
        return;
      }
      if (region === "all") {
        setSelectedRegion("all");
        setSelectedPrefecture(null);
        setShowPrefectureDetail(false);
        setUserLocation(null);
        completeStep(3);
        goToStep(4);
        return;
      }
      // 地方を選んだら都道府県選択を表示
      setSelectedRegion(region);
      setSelectedPrefecture(null);
      setUserLocation(null);
      setShowPrefectureDetail(true);
    },
    [completeStep, goToStep]
  );

  const handlePrefectureSelect = useCallback(
    (prefecture: string | null) => {
      setSelectedPrefecture(prefecture);
      setShowPrefectureDetail(false);
      completeStep(3);
      goToStep(4);
    },
    [completeStep, goToStep]
  );

  // Step 4: レベル選択
  const handleLevelSelect = useCallback(
    (level: UserLevel) => {
      setUserLevel(level);
      completeStep(4);
      goToStep(5);
    },
    [completeStep, goToStep]
  );

  // Step 5: 同行者選択
  const handleCompanionSelect = useCallback(
    (comp: Companion) => {
      setCompanion(comp);
      completeStep(5);
      goToStep(6);
    },
    [completeStep, goToStep]
  );

  // Step 6: 魚選択
  const handleFishSelect = useCallback(
    (slug: string | null) => {
      setTargetFishSlug(slug);
      completeStep(6);
      goToStep(7);
    },
    [completeStep, goToStep]
  );

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setShowResults(false);
    setSelectedDate(today);
    setFishingCategory("all");
    setSelectedRegion("all");
    setSelectedPrefecture(null);
    setShowPrefectureDetail(false);
    setUserLevel("beginner");
    setCompanion("solo");
    setTargetFishSlug(null);
    setUserLocation(null);
    setGeoError(null);
  }, [today]);

  // 選択された日付ベースの旬の魚リスト
  const peakFish = useMemo(() => getPeakFishList(selectedMonth), [selectedMonth]);
  const season = getSeason(selectedMonth);

  // カテゴリ＋エリアフィルタリング
  const filteredSpots = useMemo(() => {
    let spots = fishingSpots;

    // カテゴリフィルタ（spotType: "river" → 淡水、それ以外 → 海）
    if (fishingCategory === "sea") {
      spots = spots.filter((s) => s.spotType !== "river");
    } else if (fishingCategory === "freshwater") {
      spots = spots.filter((s) => s.spotType === "river");
    }

    // エリアフィルタ
    if (selectedRegion === "all" || selectedRegion === "geolocation") {
      return spots;
    }
    const regionOption = REGION_OPTIONS.find((r) => r.value === selectedRegion);
    if (!regionOption) return spots;
    if (selectedPrefecture) {
      return spots.filter((spot) => spot.region.prefecture === selectedPrefecture);
    }
    return spots.filter((spot) =>
      regionOption.prefectures.includes(spot.region.prefecture)
    );
  }, [fishingCategory, selectedRegion, selectedPrefecture]);

  // スポットデータから選択月の釣れる魚を動的に収集
  const spotFishList = useMemo(() => {
    const fishRecord: Record<string, { fish: FishSpecies; isPeak: boolean }> = {};
    for (const spot of filteredSpots) {
      for (const cf of spot.catchableFish) {
        const start = cf.monthStart;
        const end = cf.monthEnd;
        let inSeason = false;
        if (start <= end) {
          inSeason = selectedMonth >= start && selectedMonth <= end;
        } else {
          inSeason = selectedMonth >= start || selectedMonth <= end;
        }
        if (inSeason) {
          if (!fishRecord[cf.fish.slug]) {
            fishRecord[cf.fish.slug] = { fish: cf.fish, isPeak: cf.peakSeason };
          } else if (cf.peakSeason) {
            fishRecord[cf.fish.slug] = { fish: cf.fish, isPeak: true };
          }
        }
      }
    }
    const all = Object.values(fishRecord);
    const peak = all.filter((f) => f.isPeak).sort((a, b) => a.fish.name.localeCompare(b.fish.name));
    const nonPeak = all.filter((f) => !f.isPeak).sort((a, b) => a.fish.name.localeCompare(b.fish.name));
    return { peak, nonPeak, all };
  }, [filteredSpots, selectedMonth]);

  // スコアリング＆ソート
  const scoredSpots = useMemo(() => {
    const scored = filteredSpots.map((spot) =>
      scoreSpot(spot, selectedMonth, selectedTideType, userLevel, companion, targetFishSlug)
    );
    scored.sort((a, b) => b.totalScore - a.totalScore);
    // 今月釣れる魚がないスポットは除外
    let result = scored.filter((s) => s.catchableFishNow.length > 0);
    // 現在地ソート
    if (selectedRegion === "geolocation" && userLocation) {
      result.sort((a, b) => {
        const distA = getDistanceKm(
          userLocation.lat,
          userLocation.lon,
          a.spot.latitude,
          a.spot.longitude
        );
        const distB = getDistanceKm(
          userLocation.lat,
          userLocation.lon,
          b.spot.latitude,
          b.spot.longitude
        );
        // 距離が近い順だが、スコアも考慮（スコア70%、距離近さ30%で混合）
        const compositeA = a.totalScore * 0.7 - distA * 0.003;
        const compositeB = b.totalScore * 0.7 - distB * 0.003;
        return compositeB - compositeA;
      });
    }
    return result;
  }, [filteredSpots, selectedMonth, selectedTideType, userLevel, companion, targetFishSlug, selectedRegion, userLocation]);

  const topSpots = scoredSpots.slice(0, 6);

  // 選択済みラベル取得
  const getDateLabel = () => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}(${days[selectedDate.getDay()]})`;
  };
  const getCategoryLabel = () => {
    const labels: Record<FishingCategory, string> = { all: "すべて", sea: "海釣り", freshwater: "淡水釣り" };
    return labels[fishingCategory];
  };
  const getRegionLabel = () => {
    if (selectedRegion === "geolocation") return "現在地から";
    if (selectedPrefecture) return selectedPrefecture;
    const opt = REGION_OPTIONS.find((r) => r.value === selectedRegion);
    return opt?.label || "全国";
  };
  const getLevelLabel = () => {
    const labels: Record<UserLevel, string> = { beginner: "初心者", intermediate: "中級者", advanced: "上級者" };
    return labels[userLevel];
  };
  const getCompanionLabel = () => {
    const labels: Record<Companion, string> = { solo: "1人", friends: "友人と", family: "家族と" };
    return labels[companion];
  };
  const getFishLabel = () => {
    if (!targetFishSlug) return "指定なし";
    const f = spotFishList.all.find((sf) => sf.fish.slug === targetFishSlug);
    return f?.fish.name || "指定なし";
  };

  const formatDate = (d: Date) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
  };

  // 「この日に行く」ボタンのハンドラ
  const handleSaveDate = useCallback((spotSlug: string) => {
    try {
      const key = "tsurispot-planned-trips";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const entry = {
        spotSlug,
        date: selectedDate.toISOString().split("T")[0],
        savedAt: new Date().toISOString(),
      };
      // 同じスポット・日付の重複は除く
      const filtered = existing.filter(
        (e: { spotSlug: string; date: string }) =>
          !(e.spotSlug === spotSlug && e.date === entry.date)
      );
      filtered.push(entry);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch {
      // localStorage unavailable
    }
  }, [selectedDate]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        {/* ヘッダー */}
        <section className="bg-gradient-to-r from-orange-500 to-amber-400 text-white">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <CalendarDays className="size-7 sm:size-8" />
              今週どこ行こうかな？
            </h1>
            <p className="mt-2 text-orange-100 text-sm sm:text-base">
              行きたい日を選んで、潮回り・旬の魚から最適な釣り場を提案します
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "今週のおすすめ" }]} />

          {/* 選んだ日付の釣り条件（コンパクト） */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="text-center p-2.5 bg-white rounded-lg shadow-sm border border-orange-100">
              <CalendarDays className="size-4 text-orange-500 mx-auto mb-0.5" />
              <p className="text-[10px] text-gray-500">選択日</p>
              <p className="font-bold text-xs mt-0.5">{getDateLabel()}</p>
            </div>
            <div className="text-center p-2.5 bg-white rounded-lg shadow-sm border border-orange-100">
              <Waves className="size-4 text-blue-500 mx-auto mb-0.5" />
              <p className="text-[10px] text-gray-500">潮回り</p>
              <Badge className={`mt-0.5 text-[10px] px-1.5 ${getTideTypeColor(selectedTideType)}`}>
                {selectedTideType}
              </Badge>
            </div>
            <div className="text-center p-2.5 bg-white rounded-lg shadow-sm border border-orange-100">
              <Calendar className="size-4 text-green-500 mx-auto mb-0.5" />
              <p className="text-[10px] text-gray-500">季節</p>
              <p className="font-bold text-xs mt-0.5">{getSeasonLabel(season)}</p>
            </div>
            <div className="text-center p-2.5 bg-white rounded-lg shadow-sm border border-orange-100">
              <Fish className="size-4 text-orange-500 mx-auto mb-0.5" />
              <p className="text-[10px] text-gray-500">旬の魚</p>
              <p className="font-bold text-xs mt-0.5">{peakFish.length}種</p>
            </div>
          </div>

          {/* ステップ進捗バー */}
          <div className="relative overflow-x-auto">
            <div className="flex items-center justify-between min-w-[500px]">
              {STEPS.map((step, i) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                const isAccessible = step.id <= Math.max(currentStep, ...completedSteps, 0);
                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => isAccessible && goToStep(step.id)}
                      disabled={!isAccessible}
                      className={`relative flex flex-col items-center gap-1 transition-all ${
                        isAccessible ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-500 text-white shadow-md shadow-green-200"
                            : isCurrent
                              ? "bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110"
                              : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isCompleted ? <Check className="size-4 sm:size-5" /> : step.id}
                      </div>
                      <span
                        className={`text-[9px] sm:text-xs font-medium transition-colors ${
                          isCurrent
                            ? "text-orange-600"
                            : isCompleted
                              ? "text-green-600"
                              : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 mx-0.5 sm:mx-2">
                        <div
                          className={`h-1 rounded-full transition-all duration-500 ${
                            completedSteps.includes(step.id)
                              ? "bg-green-400"
                              : "bg-gray-200"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {/* 結果ステップ */}
              <div className="flex items-center">
                <div className="w-3 sm:w-6 mx-0.5 sm:mx-2">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      showResults ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                      showResults
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-200 scale-110"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Trophy className="size-4 sm:size-5" />
                  </div>
                  <span
                    className={`text-[9px] sm:text-xs font-medium ${
                      showResults ? "text-amber-600" : "text-gray-400"
                    }`}
                  >
                    結果
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* リセットボタン（ステップ進行後に表示） */}
          {completedSteps.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-600 transition-colors"
              >
                <RotateCcw className="size-3.5" />
                最初からやり直す
              </button>
            </div>
          )}

          {/* ============ STEP 1: 日付選択 ============ */}
          {currentStep === 1 && !showResults && (
            <Card className="border-orange-200 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="size-5 text-orange-500" />
                  Step 1：いつ行く？
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  釣りに行きたい日を選んでください（各日の潮回りも表示）
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {dateOptions.map((date) => {
                    const moonAge = getMoonAge(date);
                    const tide = getTideType(moonAge);
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => handleDateSelect(date)}
                        className={`p-4 rounded-xl border-2 transition-all text-center group ${getDateChipStyle(date)}`}
                      >
                        <span className={`block text-base font-bold ${getDateTextColor(date)} group-hover:scale-105 transition-transform`}>
                          {getDayLabel(date, today)}
                        </span>
                        <div className="mt-2">
                          <Badge className={`text-[10px] px-1.5 ${getTideTypeColor(tide)}`}>
                            {tide}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 完了したStep 1（折りたたみ） */}
          {completedSteps.includes(1) && currentStep !== 1 && (
            <button
              onClick={() => goToStep(1)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-green-600 font-medium">Step 1：日付</span>
                  <p className="text-sm font-bold text-green-800 truncate">
                    {formatDate(selectedDate)} ・ {selectedTideType}
                  </p>
                </div>
                <ChevronDown className="size-4 text-green-400 flex-shrink-0" />
              </div>
            </button>
          )}

          {/* ============ STEP 2: 種類選択 ============ */}
          {currentStep === 2 && !showResults && (
            <Card className="border-cyan-200 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Waves className="size-5 text-cyan-500" />
                  Step 2：どんな釣り？
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  海釣りか淡水釣りかを選んでください
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleCategorySelect("sea")}
                    className="p-5 rounded-xl border-2 border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all text-center group"
                  >
                    <span className="block text-3xl mb-2 group-hover:scale-110 transition-transform">🌊</span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-cyan-700">海釣り</span>
                    <span className="block text-xs text-gray-500 mt-1">堤防・漁港・磯・砂浜など</span>
                  </button>
                  <button
                    onClick={() => handleCategorySelect("freshwater")}
                    className="p-5 rounded-xl border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center group"
                  >
                    <span className="block text-3xl mb-2 group-hover:scale-110 transition-transform">🏞️</span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-emerald-700">淡水釣り</span>
                    <span className="block text-xs text-gray-500 mt-1">川・湖・池・渓流など</span>
                  </button>
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className="p-5 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all text-center group"
                  >
                    <span className="block text-3xl mb-2 group-hover:scale-110 transition-transform">🗾</span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-orange-700">どちらも</span>
                    <span className="block text-xs text-gray-500 mt-1">ジャンル問わず提案</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 完了したStep 2（折りたたみ） */}
          {completedSteps.includes(2) && currentStep !== 2 && (
            <button
              onClick={() => goToStep(2)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-green-600 font-medium">Step 2：種類</span>
                  <p className="text-sm font-bold text-green-800 truncate">{getCategoryLabel()}</p>
                </div>
                <ChevronDown className="size-4 text-green-400 flex-shrink-0" />
              </div>
            </button>
          )}

          {/* ============ STEP 3: エリア選択 ============ */}
          {currentStep === 3 && !showResults && (
            <Card className="border-orange-200 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="size-5 text-orange-500" />
                  Step 3：どこで釣りたい？
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {showPrefectureDetail
                    ? "都道府県を選ぶか、地方全体で探すこともできます"
                    : "釣りに行きたいエリアを選んでください"}
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {showPrefectureDetail ? (
                  /* 都道府県サブ選択 */
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPrefectureDetail(false)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600 transition-colors"
                    >
                      <ChevronRight className="size-3 rotate-180" />
                      地方選択に戻る
                    </button>
                    <div className="text-center mb-2">
                      <span className="text-sm font-bold text-orange-700">
                        {REGION_OPTIONS.find((r) => r.value === selectedRegion)?.icon}{" "}
                        {REGION_OPTIONS.find((r) => r.value === selectedRegion)?.label}
                      </span>
                    </div>
                    {/* この地方全体 */}
                    <button
                      onClick={() => handlePrefectureSelect(null)}
                      className="w-full p-3 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 transition-all text-center"
                    >
                      <span className="text-sm font-bold text-orange-700">
                        この地方全体で探す
                      </span>
                      <span className="block text-[10px] text-orange-500 mt-0.5">
                        {REGION_OPTIONS.find((r) => r.value === selectedRegion)?.prefectures.length}都道府県すべて
                      </span>
                    </button>
                    {/* 都道府県ボタン */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {REGION_OPTIONS.find((r) => r.value === selectedRegion)?.prefectures.map((pref) => {
                        const spotCount = fishingSpots.filter((s) => s.region.prefecture === pref).length;
                        return (
                          <button
                            key={pref}
                            onClick={() => handlePrefectureSelect(pref)}
                            className="p-3 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-center group"
                          >
                            <span className="block text-sm font-bold text-gray-700 group-hover:text-orange-700">
                              {pref.replace(/県|府|都/, "")}
                            </span>
                            <span className="block text-[10px] text-gray-500 mt-0.5">
                              {spotCount}スポット
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* 地方選択 */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* 現在地から探す */}
                    <button
                      onClick={() => handleRegionSelect("geolocation")}
                      disabled={geoLoading}
                      className="relative p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all text-center group"
                    >
                      {geoLoading ? (
                        <Loader2 className="size-8 text-blue-500 mx-auto mb-2 animate-spin" />
                      ) : (
                        <Navigation className="size-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="block text-sm font-bold text-blue-700">
                        {geoLoading ? "取得中..." : "現在地から探す"}
                      </span>
                      <span className="block text-[10px] text-blue-500 mt-1">
                        GPSで近くのスポットを検索
                      </span>
                    </button>

                    {/* 全国・各地方 */}
                    {REGION_OPTIONS.map((region) => (
                      <button
                        key={region.value}
                        onClick={() => handleRegionSelect(region.value)}
                        className="p-4 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-center group"
                      >
                        <span className="block text-2xl mb-2 group-hover:scale-110 transition-transform">
                          {region.icon}
                        </span>
                        <span className="block text-sm font-bold text-gray-700 group-hover:text-orange-700">
                          {region.label}
                        </span>
                        {region.value !== "all" && (
                          <span className="block text-[10px] text-gray-500 mt-1">
                            {region.prefectures.length}都道府県
                          </span>
                        )}
                        {region.value === "all" && (
                          <span className="block text-[10px] text-gray-500 mt-1">
                            エリア指定なし
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {geoError && (
                  <p className="text-xs text-red-500 mt-3 text-center">{geoError}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 完了したStep 3（折りたたみ） */}
          {completedSteps.includes(3) && currentStep !== 3 && (
            <button
              onClick={() => goToStep(3)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-green-600 font-medium">Step 3：エリア</span>
                  <p className="text-sm font-bold text-green-800 truncate">{getRegionLabel()}</p>
                </div>
                <ChevronDown className="size-4 text-green-400 flex-shrink-0" />
              </div>
            </button>
          )}

          {/* ============ STEP 4: レベル選択 ============ */}
          {currentStep === 4 && !showResults && (
            <Card className="border-blue-200 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="size-5 text-blue-500" />
                  Step 4：釣りレベルは？
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  あなたの釣り経験を教えてください
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        value: "beginner" as const,
                        label: "初心者",
                        desc: "はじめて〜数回",
                        detail: "道具のレンタルがあると安心",
                        emoji: "🔰",
                      },
                      {
                        value: "intermediate" as const,
                        label: "中級者",
                        desc: "月1〜2回釣行",
                        detail: "いろんな釣り方に挑戦したい",
                        emoji: "🎣",
                      },
                      {
                        value: "advanced" as const,
                        label: "上級者",
                        desc: "週1以上",
                        detail: "大物・穴場を狙いたい",
                        emoji: "🏆",
                      },
                    ]
                  ).map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleLevelSelect(level.value)}
                      className="p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
                    >
                      <span className="block text-3xl mb-2 group-hover:scale-110 transition-transform">
                        {level.emoji}
                      </span>
                      <span className="block text-base font-bold text-gray-700 group-hover:text-blue-700">
                        {level.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {level.desc}
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-1">
                        {level.detail}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 完了したStep 4（折りたたみ） */}
          {completedSteps.includes(4) && currentStep !== 4 && (
            <button
              onClick={() => goToStep(4)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-green-600 font-medium">Step 4：レベル</span>
                  <p className="text-sm font-bold text-green-800 truncate">{getLevelLabel()}</p>
                </div>
                <ChevronDown className="size-4 text-green-400 flex-shrink-0" />
              </div>
            </button>
          )}

          {/* ============ STEP 5: 同行者選択 ============ */}
          {currentStep === 5 && !showResults && (
            <Card className="border-purple-200 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="size-5 text-purple-500" />
                  Step 5：誰と行く？
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  同行者によっておすすめスポットが変わります
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        value: "solo" as const,
                        label: "1人で",
                        desc: "じっくり集中したい",
                        icon: User,
                        emoji: "🧘",
                      },
                      {
                        value: "friends" as const,
                        label: "友人と",
                        desc: "ワイワイ楽しみたい",
                        icon: UserPlus,
                        emoji: "🤝",
                      },
                      {
                        value: "family" as const,
                        label: "家族と",
                        desc: "安全で快適な場所",
                        icon: Heart,
                        emoji: "👨‍👩‍👧‍👦",
                      },
                    ]
                  ).map((comp) => (
                    <button
                      key={comp.value}
                      onClick={() => handleCompanionSelect(comp.value)}
                      className="p-5 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center group"
                    >
                      <span className="block text-3xl mb-2 group-hover:scale-110 transition-transform">
                        {comp.emoji}
                      </span>
                      <span className="block text-base font-bold text-gray-700 group-hover:text-purple-700">
                        {comp.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {comp.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 完了したStep 5（折りたたみ） */}
          {completedSteps.includes(5) && currentStep !== 5 && (
            <button
              onClick={() => goToStep(5)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-green-600 font-medium">Step 5：同行者</span>
                  <p className="text-sm font-bold text-green-800 truncate">{getCompanionLabel()}</p>
                </div>
                <ChevronDown className="size-4 text-green-400 flex-shrink-0" />
              </div>
            </button>
          )}

          {/* ============ STEP 6: 釣りたい魚 ============ */}
          {currentStep === 6 && !showResults && (
            <Card className="border-teal-200 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Fish className="size-5 text-teal-500" />
                  Step 6：何を釣りたい？
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  狙いたい魚があれば選択（任意）・{spotFishList.all.length}種類が{getDateLabel()}に釣れます
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {/* スキップボタン */}
                  <button
                    onClick={() => handleFishSelect(null)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50 transition-all text-center group"
                  >
                    <span className="text-sm font-bold text-gray-600 group-hover:text-teal-700">
                      特に決めていない / スキップ
                    </span>
                    <span className="block text-[10px] text-gray-500 mt-1">
                      今釣れる魚すべてから提案します
                    </span>
                  </button>

                  {/* 旬の魚（優先表示） */}
                  {spotFishList.peak.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-orange-600 mb-2 flex items-center gap-1">
                        <Star className="size-3 fill-orange-400 text-orange-400" />
                        {getDateLabel()}に旬の魚
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {spotFishList.peak.map((f) => (
                          <button
                            key={f.fish.slug}
                            onClick={() => handleFishSelect(f.fish.slug)}
                            className="px-4 py-2 rounded-lg border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 transition-all text-sm font-medium text-orange-700"
                          >
                            {f.fish.name}
                            <span className="text-[10px] ml-1 text-orange-500">(旬)</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* その他の釣れる魚 */}
                  {spotFishList.nonPeak.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        その他の釣れる魚
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {spotFishList.nonPeak.map((f) => (
                          <button
                            key={f.fish.slug}
                            onClick={() => handleFishSelect(f.fish.slug)}
                            className="px-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50 transition-all text-gray-600"
                          >
                            {f.fish.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 完了したStep 6（折りたたみ） */}
          {completedSteps.includes(6) && currentStep !== 6 && !showResults && (
            <button
              onClick={() => goToStep(6)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-green-600 font-medium">Step 6：釣りたい魚</span>
                  <p className="text-sm font-bold text-green-800 truncate">{getFishLabel()}</p>
                </div>
                <ChevronDown className="size-4 text-green-400 flex-shrink-0" />
              </div>
            </button>
          )}

          {/* ============ 結果表示 ============ */}
          {showResults && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
              {/* 選んだ日付の潮回り情報（大きく表示） */}
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base sm:text-lg font-bold text-blue-800 flex items-center gap-2">
                      <CalendarDays className="size-5" />
                      {formatDate(selectedDate)}の釣り条件
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white/80 rounded-xl">
                      <Waves className="size-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 mb-1">潮回り</p>
                      <Badge className={`text-sm px-2.5 py-0.5 ${getTideTypeColor(selectedTideType)}`}>
                        {selectedTideType}
                      </Badge>
                    </div>
                    <div className="text-center p-3 bg-white/80 rounded-xl">
                      <Moon className="size-5 text-yellow-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 mb-1">月齢</p>
                      <p className="font-bold text-base">{selectedMoonAge.toFixed(1)}</p>
                    </div>
                    <div className="text-center p-3 bg-white/80 rounded-xl">
                      <Fish className="size-5 text-orange-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 mb-1">旬の魚</p>
                      <p className="font-bold text-base">{peakFish.length}種</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 選択サマリー */}
              <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                      <Compass className="size-4" />
                      あなたの条件
                    </p>
                    <button
                      onClick={handleReset}
                      className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="size-3" />
                      やり直す
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200">
                      <CalendarDays className="size-3 mr-1" />
                      {getDateLabel()}
                    </Badge>
                    <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200">
                      <Waves className="size-3 mr-1" />
                      {getCategoryLabel()}
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200">
                      <Map className="size-3 mr-1" />
                      {getRegionLabel()}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                      <TrendingUp className="size-3 mr-1" />
                      {getLevelLabel()}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                      <Users className="size-3 mr-1" />
                      {getCompanionLabel()}
                    </Badge>
                    <Badge className="bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200">
                      <Fish className="size-3 mr-1" />
                      {getFishLabel()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 結果ヘッダー */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="size-5 text-amber-500" />
                  おすすめスポット TOP{Math.min(6, topSpots.length)}
                </h2>
                <p className="text-sm text-gray-500">
                  {scoredSpots.length}件中
                </p>
              </div>

              {/* 結果カード */}
              {topSpots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topSpots.map((scored, index) => (
                    <SpotCard
                      key={scored.spot.id}
                      scored={scored}
                      rank={index + 1}
                      userLocation={selectedRegion === "geolocation" ? userLocation : null}
                      selectedDate={selectedDate}
                      onSaveDate={handleSaveDate}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Fish className="size-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      条件に合うスポットが見つかりませんでした
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      エリアを「全国」にするか、条件を変更してみてください
                    </p>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="mt-4 gap-2"
                    >
                      <RotateCcw className="size-4" />
                      条件を変更する
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* もっと見るリンク */}
              {scoredSpots.length > 6 && (
                <div className="text-center">
                  <Link href="/spots">
                    <Button variant="outline" className="gap-2">
                      <MapPin className="size-4" />
                      すべての釣りスポットを見る
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 関連ページリンク */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
            <Link href="/tides">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2.5">
                    <Waves className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">潮見表・潮汐情報</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      今日の潮位グラフと満潮・干潮時刻
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/fish-finder">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2.5">
                    <Fish className="size-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">釣り方診断</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      3つの質問でおすすめの魚を提案
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// --- スポットカード ---

function SpotCard({
  scored,
  rank,
  userLocation,
  selectedDate,
  onSaveDate,
}: {
  scored: ScoredSpot;
  rank: number;
  userLocation?: { lat: number; lon: number } | null;
  selectedDate: Date;
  onSaveDate: (spotSlug: string) => void;
}) {
  const [saved, setSaved] = useState(false);
  const { spot, totalScore, rank: scoreRank, catchableFishNow, reason } = scored;

  const distance = userLocation
    ? getDistanceKm(
        userLocation.lat,
        userLocation.lon,
        spot.latitude,
        spot.longitude
      )
    : null;

  const spotTypeLabel: Record<string, string> = {
    port: "漁港",
    beach: "砂浜",
    rocky: "磯",
    river: "河川",
    pier: "桟橋",
    breakwater: "堤防",
  };

  const difficultyLabel: Record<string, string> = {
    beginner: "初心者向け",
    intermediate: "中級者向け",
    advanced: "上級者向け",
  };

  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const dateStr = `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}(${days[selectedDate.getDay()]})`;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveDate(spot.slug);
    setSaved(true);
  };

  return (
    <Link href={`/spots/${spot.slug}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer h-full group overflow-hidden">
        {/* ランクバッジ */}
        <div className="relative">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-lg ${getRankColor(scoreRank)}`}
            >
              {scoreRank}
            </span>
            {rank <= 3 && (
              <Award
                className={`size-5 ${rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-400" : "text-amber-600"} drop-shadow`}
              />
            )}
          </div>
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-white/90 text-gray-700 text-xs backdrop-blur-sm">
              #{rank}
            </Badge>
          </div>
          <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-300" />
        </div>

        <CardContent className="p-4 space-y-3">
          {/* スポット名と基本情報 */}
          <div>
            <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors line-clamp-1">
              {spot.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <MapPin className="size-3" />
              <span>
                {spot.region.prefecture} {spot.region.areaName}
              </span>
              {distance !== null && (
                <span className="text-blue-500 font-medium ml-auto">
                  <Navigation className="size-3 inline mr-0.5" />
                  {distance < 1
                    ? `${(distance * 1000).toFixed(0)}m`
                    : distance < 100
                      ? `${distance.toFixed(1)}km`
                      : `${distance.toFixed(0)}km`}
                </span>
              )}
            </div>
          </div>

          {/* レーティング・タグ */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1">
              <Star className="size-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium">{spot.rating}</span>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {spotTypeLabel[spot.spotType] || spot.spotType}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {difficultyLabel[spot.difficulty] || spot.difficulty}
            </Badge>
          </div>

          {/* 選んだ日付に釣れる魚 */}
          <div>
            <p className="text-xs text-gray-500 mb-1">{dateStr}に釣れる魚：</p>
            <div className="flex flex-wrap gap-1">
              {catchableFishNow.slice(0, 5).map((cf) => (
                <Badge
                  key={cf.fish.slug}
                  variant="outline"
                  className={`text-[10px] ${
                    cf.isPeak
                      ? "border-orange-300 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {cf.fish.name}
                  {cf.isPeak && " (旬)"}
                </Badge>
              ))}
              {catchableFishNow.length > 5 && (
                <Badge variant="outline" className="text-[10px] text-gray-500">
                  +{catchableFishNow.length - 5}
                </Badge>
              )}
            </div>
          </div>

          {/* おすすめ理由 */}
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-800 leading-relaxed">
              {reason}
            </p>
          </div>

          {/* スコアバー */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">
                おすすめスコア
              </span>
              <span className="text-xs font-bold text-orange-600">
                {totalScore.toFixed(1)} / 10
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-500"
                style={{ width: `${(totalScore / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* 「この日に行く」ボタン */}
          <button
            onClick={handleSave}
            disabled={saved}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
              saved
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200"
            }`}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-1">
                <Check className="size-3" />
                {dateStr}に行く予定に保存しました
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <Calendar className="size-3" />
                {dateStr}に行く
              </span>
            )}
          </button>
        </CardContent>
      </Card>
    </Link>
  );
}
