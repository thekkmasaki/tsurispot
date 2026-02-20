"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// --- スポットの釣れる魚を今月で絞る ---

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
      item: "https://tsurispot.jp",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "今日のおすすめスポット",
      item: "https://tsurispot.jp/recommendation",
    },
  ],
};

// --- メインページ ---

export default function RecommendationPage() {
  const [today] = useState(() => new Date());
  const month = today.getMonth() + 1;
  const moonAge = getMoonAge(today);
  const tideType = getTideType(moonAge);

  // フィルター状態
  const [userLevel, setUserLevel] = useState<UserLevel>("beginner");
  const [companion, setCompanion] = useState<Companion>("solo");
  const [targetFishSlug, setTargetFishSlug] = useState<string | null>(null);

  // 旬の魚リスト
  const seasonalFish = useMemo(() => getSeasonalFish(month), [month]);
  const peakFish = useMemo(() => getPeakFishList(month), [month]);
  const season = getSeason(month);

  // スコアリング＆ソート
  const scoredSpots = useMemo(() => {
    const scored = fishingSpots.map((spot) =>
      scoreSpot(spot, month, tideType, userLevel, companion, targetFishSlug)
    );
    scored.sort((a, b) => b.totalScore - a.totalScore);
    // 今月釣れる魚がないスポットは除外
    return scored.filter((s) => s.catchableFishNow.length > 0);
  }, [month, tideType, userLevel, companion, targetFishSlug]);

  const topSpots = scoredSpots.slice(0, 6);

  const formatDate = (d: Date) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
  };

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
            <div className="flex items-center gap-2 text-orange-100 text-sm mb-3">
              <Link href="/" className="hover:text-white transition-colors">
                ホーム
              </Link>
              <ChevronRight className="size-3" />
              <span>今日のおすすめ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Sparkles className="size-7 sm:size-8" />
              今日のおすすめ釣りスポット
            </h1>
            <p className="mt-2 text-orange-100 text-sm sm:text-base">
              {formatDate(today)} の条件に最適な釣り場をスコアリングして提案します
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
          {/* 今日の釣り条件 */}
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="size-5 text-orange-500" />
                今日の釣り条件
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <Waves className="size-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">潮回り</p>
                  <Badge className={`mt-1 ${getTideTypeColor(tideType)}`}>
                    {tideType}
                  </Badge>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <Moon className="size-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">月齢</p>
                  <p className="font-bold text-sm mt-1">
                    {moonAge.toFixed(1)}
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <Calendar className="size-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">季節</p>
                  <p className="font-bold text-sm mt-1">
                    {getSeasonLabel(season)}
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <Fish className="size-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">旬の魚</p>
                  <p className="font-bold text-sm mt-1">
                    {peakFish.length}種
                  </p>
                </div>
              </div>

              {/* 旬の魚チップス */}
              {peakFish.length > 0 && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-xs text-gray-500 mb-2">
                    今が旬の魚：
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {peakFish.map((f) => (
                      <Link key={f.slug} href={`/fish/${f.slug}`}>
                        <Badge
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-orange-100 border-orange-300 text-orange-700"
                        >
                          {f.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 条件入力パネル */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="size-5 text-blue-500" />
                条件を設定
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {/* 釣りレベル */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-gray-500" />
                  釣りレベル
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      {
                        value: "beginner",
                        label: "初心者",
                        desc: "はじめて〜数回",
                      },
                      {
                        value: "intermediate",
                        label: "中級者",
                        desc: "月1〜2回釣行",
                      },
                      {
                        value: "advanced",
                        label: "上級者",
                        desc: "週1以上",
                      },
                    ] as const
                  ).map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setUserLevel(level.value)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        userLevel === level.value
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <span className="font-medium">{level.label}</span>
                      <span
                        className={`block text-[10px] mt-0.5 ${
                          userLevel === level.value
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        {level.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 同行者 */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Users className="size-4 text-gray-500" />
                  同行者
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      {
                        value: "solo",
                        label: "1人",
                        icon: User,
                      },
                      {
                        value: "friends",
                        label: "友人と",
                        icon: UserPlus,
                      },
                      {
                        value: "family",
                        label: "家族と",
                        icon: Heart,
                      },
                    ] as const
                  ).map((comp) => {
                    const Icon = comp.icon;
                    return (
                      <button
                        key={comp.value}
                        onClick={() => setCompanion(comp.value)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all flex items-center gap-2 ${
                          companion === comp.value
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        <Icon className="size-4" />
                        <span className="font-medium">{comp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 釣りたい魚 */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Fish className="size-4 text-gray-500" />
                  釣りたい魚（任意）
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setTargetFishSlug(null)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      targetFishSlug === null
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    指定なし
                  </button>
                  {seasonalFish.map((f) => (
                    <button
                      key={f.slug}
                      onClick={() =>
                        setTargetFishSlug(
                          targetFishSlug === f.slug ? null : f.slug
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        targetFishSlug === f.slug
                          ? "bg-blue-600 text-white border-blue-600"
                          : f.peakMonths.includes(month)
                            ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {f.name}
                      {f.peakMonths.includes(month) && " (旬)"}
                    </button>
                  ))}
                </div>
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
                <p className="text-sm text-gray-400 mt-1">
                  フィルター条件を変更してみてください
                </p>
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
            <Link href="/spots">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2.5">
                    <MapPin className="size-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">釣りスポット一覧</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      全国の人気釣り場を探す
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
}: {
  scored: ScoredSpot;
  rank: number;
}) {
  const { spot, totalScore, rank: scoreRank, catchableFishNow, reason } = scored;

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

          {/* 今釣れる魚 */}
          <div>
            <p className="text-xs text-gray-500 mb-1">今釣れる魚：</p>
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
                <Badge variant="outline" className="text-[10px] text-gray-400">
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
              <span className="text-[10px] text-gray-400">
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
        </CardContent>
      </Card>
    </Link>
  );
}
