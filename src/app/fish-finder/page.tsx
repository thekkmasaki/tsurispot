"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ChevronLeft,
  Fish,
  Waves,
  RotateCcw,
  Check,
  Target,
  Award,
  Utensils,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fishSpecies } from "@/lib/data/fish";
import type { FishSpecies } from "@/types";

// --- Metadata (handled via export below since this is "use client") ---
// Metadata is set in layout or via generateMetadata in a separate file.
// For "use client" pages, we add a <title> and <meta> via head tags.

// --- Types ---

type LocationType = "sea" | "freshwater" | "any";
type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type Priority = "quantity" | "trophy" | "delicious" | "family";

// --- Step definitions ---

const STEPS = [
  { id: 1, label: "釣り場", icon: "location" },
  { id: 2, label: "経験", icon: "level" },
  { id: 3, label: "目的", icon: "priority" },
] as const;

// --- Filter logic ---

function filterFish(
  allFish: FishSpecies[],
  location: LocationType,
  level: ExperienceLevel,
  priority: Priority,
  currentMonth: number
): FishSpecies[] {
  let filtered = [...allFish];

  // Step 1: Filter by category
  if (location === "sea") {
    filtered = filtered.filter(
      (f) => f.category === "sea" || f.category === "brackish"
    );
  } else if (location === "freshwater") {
    filtered = filtered.filter(
      (f) => f.category === "freshwater" || f.category === "brackish"
    );
  }
  // "any" -> no category filter

  // Step 2: Filter by difficulty based on experience level
  if (level === "beginner") {
    filtered = filtered.filter((f) => f.difficulty === "beginner");
  } else if (level === "intermediate") {
    filtered = filtered.filter(
      (f) => f.difficulty === "beginner" || f.difficulty === "intermediate"
    );
  }
  // "advanced" -> no difficulty filter (all are fine)

  // Step 3: Filter/sort by priority
  if (priority === "quantity") {
    // Quantity fishing -> prefer beginner difficulty (sabiki-type fish)
    // Fish that are typically caught in quantity: beginner difficulty
    filtered = filtered.filter((f) => f.difficulty === "beginner");
  } else if (priority === "trophy") {
    // Trophy fishing -> advanced difficulty fish
    filtered = filtered.filter((f) => f.difficulty === "advanced");
  } else if (priority === "delicious") {
    // Delicious -> sort by taste rating (high first)
    filtered.sort((a, b) => b.tasteRating - a.tasteRating);
  } else if (priority === "family") {
    // Family -> beginner difficulty fish
    filtered = filtered.filter((f) => f.difficulty === "beginner");
  }

  // Prioritize fish that are in season this month
  const inSeason = filtered.filter((f) =>
    f.seasonMonths.includes(currentMonth)
  );
  const outOfSeason = filtered.filter(
    (f) => !f.seasonMonths.includes(currentMonth)
  );

  // Peak season fish first, then in-season, then out-of-season
  const peakSeason = inSeason.filter((f) =>
    f.peakMonths.includes(currentMonth)
  );
  const normalSeason = inSeason.filter(
    (f) => !f.peakMonths.includes(currentMonth)
  );

  return [...peakSeason, ...normalSeason, ...outOfSeason].slice(0, 5);
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
      name: "釣り方診断",
      item: "https://tsurispot.com/fish-finder",
    },
  ],
};

// --- Main Page ---

export default function FishFinderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);

  // Selections
  const [location, setLocation] = useState<LocationType>("any");
  const [level, setLevel] = useState<ExperienceLevel>("beginner");
  const [priority, setPriority] = useState<Priority>("quantity");

  const currentMonth = new Date().getMonth() + 1;

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setShowResults(false);
  }, []);

  const handleLocationSelect = useCallback(
    (loc: LocationType) => {
      setLocation(loc);
      goToStep(2);
    },
    [goToStep]
  );

  const handleLevelSelect = useCallback(
    (lv: ExperienceLevel) => {
      setLevel(lv);
      goToStep(3);
    },
    [goToStep]
  );

  const handlePrioritySelect = useCallback((p: Priority) => {
    setPriority(p);
    setCurrentStep(4);
    setShowResults(true);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setShowResults(false);
    setLocation("any");
    setLevel("beginner");
    setPriority("quantity");
  }, []);

  const handleBack = useCallback(() => {
    if (showResults) {
      setShowResults(false);
      setCurrentStep(3);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, showResults]);

  // Results
  const results = useMemo(() => {
    if (!showResults) return [];
    return filterFish(fishSpecies, location, level, priority, currentMonth);
  }, [showResults, location, level, priority, currentMonth]);

  // Labels
  const getLocationLabel = () => {
    const labels: Record<LocationType, string> = {
      sea: "海（堤防・磯・砂浜）",
      freshwater: "川・湖（淡水）",
      any: "決めてない",
    };
    return labels[location];
  };
  const getLevelLabel = () => {
    const labels: Record<ExperienceLevel, string> = {
      beginner: "初めて・初心者",
      intermediate: "何回かやったことがある",
      advanced: "経験豊富",
    };
    return labels[level];
  };
  const getPriorityLabel = () => {
    const labels: Record<Priority, string> = {
      quantity: "たくさん釣りたい",
      trophy: "大物を狙いたい",
      delicious: "美味しい魚を持ち帰りたい",
      family: "家族で楽しみたい",
    };
    return labels[priority];
  };

  const getMonthLabel = () => {
    return `${currentMonth}月`;
  };

  return (
    <>
      <title>あなたにぴったりの釣り方診断 | ツリスポ</title>
      <meta
        name="description"
        content="3つの質問に答えるだけで、あなたにおすすめの魚と必要な道具がわかります。釣具店での道具選びに便利！"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
        {/* Header */}
        <section className="bg-gradient-to-r from-cyan-600 to-blue-500 text-white">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
            <div className="flex items-center gap-2 text-cyan-100 text-sm mb-3">
              <Link href="/" className="hover:text-white transition-colors">
                ホーム
              </Link>
              <ChevronRight className="size-3" />
              <span>釣り方診断</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Fish className="size-7 sm:size-8" />
              この魚を釣りたい！診断
            </h1>
            <p className="mt-2 text-cyan-100 text-sm sm:text-base">
              3つの質問に答えるだけで、あなたにぴったりの魚と道具がわかります
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          {/* Step progress */}
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((step, i) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id && !showResults;
              return (
                <div
                  key={step.id}
                  className="flex items-center"
                >
                  <button
                    onClick={() => {
                      if (isCompleted) goToStep(step.id);
                    }}
                    disabled={!isCompleted && !isCurrent}
                    className={`relative flex flex-col items-center gap-1 transition-all ${
                      isCompleted ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 text-white shadow-md shadow-green-200"
                          : isCurrent
                            ? "bg-cyan-500 text-white shadow-lg shadow-cyan-200 scale-110"
                            : showResults && step.id === 3
                              ? "bg-green-500 text-white shadow-md shadow-green-200"
                              : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted || (showResults && step.id === 3) ? (
                        <Check className="size-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium transition-colors ${
                        isCurrent
                          ? "text-cyan-600"
                          : isCompleted || (showResults && step.id === 3)
                            ? "text-green-600"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="w-12 sm:w-20 mx-1 sm:mx-2">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? "bg-green-400"
                            : "bg-gray-200"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {/* Result indicator */}
            <div className="flex items-center">
              <div className="w-12 sm:w-20 mx-1 sm:mx-2">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    showResults ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    showResults
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-200 scale-110"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Award className="size-5" />
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium ${
                    showResults ? "text-amber-600" : "text-gray-400"
                  }`}
                >
                  結果
                </span>
              </div>
            </div>
          </div>

          {/* Back / Reset buttons */}
          {(currentStep > 1 || showResults) && (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-600 transition-colors min-h-[44px]"
              >
                <ChevronLeft className="size-4" />
                戻る
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-cyan-600 transition-colors min-h-[44px]"
              >
                <RotateCcw className="size-3.5" />
                最初からやり直す
              </button>
            </div>
          )}

          {/* ============ STEP 1: Location type ============ */}
          {currentStep === 1 && !showResults && (
            <Card className="border-cyan-200 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Waves className="size-5 text-cyan-500" />
                  Step 1：釣り場のタイプは？
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  どこで釣りたいかを選んでください
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleLocationSelect("sea")}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      🌊
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-cyan-700">
                      海
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      堤防・磯・砂浜
                    </span>
                  </button>
                  <button
                    onClick={() => handleLocationSelect("freshwater")}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      🏞️
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-emerald-700">
                      川・湖
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      淡水
                    </span>
                  </button>
                  <button
                    onClick={() => handleLocationSelect("any")}
                    className="p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      🤷
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-orange-700">
                      決めてない
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      おまかせで
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============ STEP 2: Experience level ============ */}
          {currentStep === 2 && !showResults && (
            <Card className="border-blue-200 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="size-5 text-blue-500" />
                  Step 2：経験レベルは？
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  あなたの釣り経験を教えてください
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleLevelSelect("beginner")}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      🔰
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-blue-700">
                      初めて・初心者
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      道具の扱いから知りたい
                    </span>
                  </button>
                  <button
                    onClick={() => handleLevelSelect("intermediate")}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      📗
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-blue-700">
                      何回かやったことがある
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      基本は分かる
                    </span>
                  </button>
                  <button
                    onClick={() => handleLevelSelect("advanced")}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      🎯
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-blue-700">
                      経験豊富
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      新しいターゲットを探したい
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============ STEP 3: Priority ============ */}
          {currentStep === 3 && !showResults && (
            <Card className="border-amber-200 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="size-5 text-amber-500" />
                  Step 3：何を重視する？
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  今回の釣りの目的を教えてください
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePrioritySelect("quantity")}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      🐟
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-amber-700">
                      たくさん釣りたい
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      数釣りで楽しみたい
                    </span>
                  </button>
                  <button
                    onClick={() => handlePrioritySelect("trophy")}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      🏆
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-amber-700">
                      大物を狙いたい
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      記録に残る一匹を
                    </span>
                  </button>
                  <button
                    onClick={() => handlePrioritySelect("delicious")}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      🍳
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-amber-700">
                      美味しい魚を持ち帰りたい
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      食べて美味しい魚を狙う
                    </span>
                  </button>
                  <button
                    onClick={() => handlePrioritySelect("family")}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-center group min-h-[100px]"
                  >
                    <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">
                      👨‍👩‍👧
                    </span>
                    <span className="block text-base font-bold text-gray-700 group-hover:text-amber-700">
                      家族で楽しみたい
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      子どもでも安全に楽しめる
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============ Results ============ */}
          {showResults && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
              {/* Selection summary */}
              <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-cyan-800 flex items-center gap-2">
                      <Fish className="size-4" />
                      あなたの回答
                    </p>
                    <button
                      onClick={handleReset}
                      className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center gap-1 transition-colors min-h-[44px]"
                    >
                      <RotateCcw className="size-3" />
                      やり直す
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200">
                      <Waves className="size-3 mr-1" />
                      {getLocationLabel()}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                      <Target className="size-3 mr-1" />
                      {getLevelLabel()}
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
                      <Award className="size-3 mr-1" />
                      {getPriorityLabel()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Results header */}
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Fish className="size-5 text-cyan-500" />
                  あなたにおすすめの魚
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {getMonthLabel()}の釣果を考慮したおすすめです
                </p>
              </div>

              {/* Fish result cards */}
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((fish) => (
                    <FishResultCard
                      key={fish.id}
                      fish={fish}
                      currentMonth={currentMonth}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Fish className="size-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      条件に合う魚が見つかりませんでした
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      条件を変更して再度お試しください
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

              {/* Related links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Link href="/recommendation">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="rounded-full bg-orange-100 p-2.5">
                        <Target className="size-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          今日のおすすめスポット
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          条件に合った釣り場を提案
                        </p>
                      </div>
                      <ChevronRight className="size-4 text-gray-400 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/guide/beginner">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-2.5">
                        <Fish className="size-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          初心者ガイド
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          釣りの始め方を丁寧に解説
                        </p>
                      </div>
                      <ChevronRight className="size-4 text-gray-400 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// --- Fish Result Card ---

function FishResultCard({
  fish,
  currentMonth,
}: {
  fish: FishSpecies;
  currentMonth: number;
}) {
  const isInSeason = fish.seasonMonths.includes(currentMonth);
  const isPeak = fish.peakMonths.includes(currentMonth);

  const difficultyLabel: Record<string, string> = {
    beginner: "初心者向け",
    intermediate: "中級者向け",
    advanced: "上級者向け",
  };

  const difficultyColor: Record<string, string> = {
    beginner: "bg-green-100 text-green-700 border-green-200",
    intermediate: "bg-blue-100 text-blue-700 border-blue-200",
    advanced: "bg-red-100 text-red-700 border-red-200",
  };

  // Get one-line description (first sentence)
  const shortDescription =
    fish.description.split("。")[0] + "。";

  // Taste stars
  const tasteStars = Array.from({ length: 5 }, (_, i) => i < fish.tasteRating);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Fish image */}
          <div className="relative w-full sm:w-40 h-36 sm:h-auto bg-gray-100 shrink-0">
            <Image
              src={fish.imageUrl}
              alt={fish.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 160px"
            />
            {/* Season badge */}
            {isPeak ? (
              <div className="absolute top-2 left-2">
                <Badge className="bg-orange-500 text-white text-xs shadow-md">
                  <Calendar className="size-3 mr-1" />
                  今が旬！
                </Badge>
              </div>
            ) : isInSeason ? (
              <div className="absolute top-2 left-2">
                <Badge className="bg-green-500 text-white text-xs shadow-md">
                  <Calendar className="size-3 mr-1" />
                  シーズン中
                </Badge>
              </div>
            ) : (
              <div className="absolute top-2 left-2">
                <Badge className="bg-gray-400 text-white text-xs shadow-md">
                  <Calendar className="size-3 mr-1" />
                  シーズン外
                </Badge>
              </div>
            )}
          </div>

          {/* Fish info */}
          <div className="flex-1 p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold">{fish.name}</h3>
                <Badge
                  className={`text-xs ${difficultyColor[fish.difficulty]}`}
                >
                  {difficultyLabel[fish.difficulty]}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{shortDescription}</p>
            </div>

            {/* Info row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Fish className="size-3" />
                {fish.sizeCm}
              </span>
              <span className="flex items-center gap-1">
                <Utensils className="size-3" />
                美味しさ：
                {tasteStars.map((filled, i) => (
                  <span
                    key={i}
                    className={filled ? "text-amber-400" : "text-gray-300"}
                  >
                    ★
                  </span>
                ))}
              </span>
            </div>

            {/* Cooking tips */}
            {fish.cookingTips.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {fish.cookingTips.slice(0, 4).map((tip) => (
                  <Badge
                    key={tip}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {tip}
                  </Badge>
                ))}
              </div>
            )}

            {/* Link to fish detail page */}
            <Link
              href={`/fish/${fish.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-800 transition-colors min-h-[44px]"
            >
              この魚の釣り方と必要な道具
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
