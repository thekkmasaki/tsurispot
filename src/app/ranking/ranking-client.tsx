"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, MapPin, Trophy, Users, Fish } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FishingSpot } from "@/types";

type TabKey = "all" | "beginner" | "family" | "night" | "port";

const ALL_PREFECTURES = [
  "全国",
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "総合" },
  { key: "beginner", label: "初心者向け" },
  { key: "family", label: "ファミリー向け" },
  { key: "night", label: "夜釣り" },
  { key: "port", label: "堤防・漁港" },
];

const SPOT_TYPE_LABELS: Record<string, string> = {
  port: "漁港",
  beach: "海水浴場",
  rocky: "磯",
  river: "河川",
  pier: "堤防",
  breakwater: "防波堤",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "初心者",
  intermediate: "中級者",
  advanced: "上級者",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

function hasNightFishing(spot: FishingSpot): boolean {
  return spot.bestTimes.some(
    (t) => t.label === "夜" && (t.rating === "best" || t.rating === "good")
  );
}

function filterByPrefecture(spots: FishingSpot[], prefecture: string): FishingSpot[] {
  if (prefecture === "全国") return spots;
  return spots.filter((s) => s.region.prefecture.includes(prefecture.replace(/[都府県]$/, "")));
}

function filterSpots(spots: FishingSpot[], tab: TabKey): FishingSpot[] {
  switch (tab) {
    case "all":
      return spots;
    case "beginner":
      return spots.filter((s) => s.difficulty === "beginner");
    case "family":
      return spots.filter((s) => s.hasToilet && s.hasParking);
    case "night":
      return spots.filter(hasNightFishing);
    case "port":
      return spots.filter((s) => s.spotType === "port" || s.spotType === "pier");
    default:
      return spots;
  }
}

function sortSpots(spots: FishingSpot[]): FishingSpot[] {
  return [...spots].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviewCount - a.reviewCount;
  });
}

function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-white shadow-md">
        <Trophy className="h-5 w-5" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-300 text-white shadow-md">
        <span className="text-sm font-bold">2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow-md">
        <span className="text-sm font-bold">3</span>
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
      <span className="text-sm font-semibold">{rank}</span>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < full
              ? "fill-yellow-400 text-yellow-400"
              : i === full && half
              ? "fill-yellow-200 text-yellow-400"
              : "fill-gray-100 text-gray-300"
          )}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
}

interface SpotCardProps {
  spot: FishingSpot;
  rank: number;
}

function SpotCard({ spot, rank }: SpotCardProps) {
  const topFish = spot.catchableFish.slice(0, 3);
  const isTop3 = rank <= 3;

  return (
    <Link
      href={`/spots/${spot.slug}`}
      className={cn(
        "flex gap-3 rounded-xl border p-4 transition-all hover:shadow-md sm:gap-4",
        isTop3
          ? "border-yellow-200 bg-yellow-50 hover:border-yellow-300"
          : "border-gray-100 bg-white hover:border-blue-100"
      )}
    >
      {/* 順位バッジ */}
      <MedalBadge rank={rank} />

      {/* コンテンツ */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-1">
          <h2 className="text-base font-bold text-gray-900 leading-tight">{spot.name}</h2>
          <StarRating rating={spot.rating} />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {spot.region.prefecture}
          </span>
          <span>{SPOT_TYPE_LABELS[spot.spotType] ?? spot.spotType}</span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {spot.reviewCount}件
          </span>
        </div>

        {/* 対象魚 */}
        {topFish.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Fish className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            {topFish.map((cf) => (
              <span
                key={cf.fish.id}
                className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
              >
                {cf.fish.name}
              </span>
            ))}
          </div>
        )}

        {/* 難易度バッジ */}
        <div className="mt-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              DIFFICULTY_COLORS[spot.difficulty]
            )}
          >
            {DIFFICULTY_LABELS[spot.difficulty]}
          </span>
        </div>
      </div>
    </Link>
  );
}

interface RankingClientProps {
  spots: FishingSpot[];
}

export function RankingClient({ spots }: RankingClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [activePrefecture, setActivePrefecture] = useState("全国");

  const rankedSpots = useMemo(() => {
    const byPref = filterByPrefecture(spots, activePrefecture);
    const filtered = filterSpots(byPref, activeTab);
    return sortSpots(filtered).slice(0, 10);
  }, [spots, activeTab, activePrefecture]);

  return (
    <div>
      {/* 都道府県フィルタ */}
      <div className="mb-4 -mx-1 overflow-x-auto">
        <div className="flex gap-2 px-1 pb-1" style={{ width: "max-content" }}>
          {ALL_PREFECTURES.map((pref) => (
            <button
              key={pref}
              onClick={() => setActivePrefecture(pref)}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                activePrefecture === pref
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* カテゴリタブフィルタ */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 件数表示 */}
      <p className="mb-4 text-sm text-muted-foreground">
        {activePrefecture}・{TABS.find((t) => t.key === activeTab)?.label ?? "総合"} TOP10
        （{rankedSpots.length}件）
      </p>

      {/* ランキングリスト */}
      {rankedSpots.length > 0 ? (
        <div className="space-y-3">
          {rankedSpots.map((spot, index) => (
            <SpotCard key={spot.id} spot={spot} rank={index + 1} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50 py-12 text-center">
          <p className="text-muted-foreground">該当するスポットが見つかりませんでした。</p>
        </div>
      )}
    </div>
  );
}
