"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, MapPin, Trophy, Users, Fish, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FishingSpot } from "@/types";

type TabKey = "all" | "beginner" | "family" | "night" | "port";

const PREFECTURE_GROUPS = [
  { label: "全国", prefectures: ["全国"] },
  { label: "北海道・東北", prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { label: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { label: "中部", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { label: "近畿", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { label: "中国・四国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"] },
  { label: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];

const ALL_PREFECTURES = PREFECTURE_GROUPS.flatMap((g) => g.prefectures);

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

/** ランキングスコア算出（100点満点） */
function calcRankScore(spot: FishingSpot): number {
  // 1. ベイズ平均レーティング（レビュー数が少ないと全体平均に引き寄せる）
  const C = 10; // 信頼の閾値（レビュー数がC以上で本来のratingに近づく）
  const M = 3.8; // 全体平均（仮定値）
  const bayesian = (spot.reviewCount * spot.rating + C * M) / (spot.reviewCount + C);
  const ratingScore = (bayesian / 5) * 50; // 最大50点

  // 2. 魚種の豊富さ（最大15点）
  const fishScore = Math.min(spot.catchableFish.length / 8, 1) * 15;

  // 3. 設備の充実度（最大15点）
  let facilityScore = 0;
  if (spot.hasParking) facilityScore += 4;
  if (spot.hasToilet) facilityScore += 4;
  if (spot.hasRentalRod) facilityScore += 4;
  if (spot.isFree) facilityScore += 3;

  // 4. 人気度（レビュー数、最大10点）
  const popularityScore = Math.min(spot.reviewCount / 200, 1) * 10;

  // 5. 初心者歓迎度（最大10点）
  const accessScore = spot.difficulty === "beginner" ? 10 : spot.difficulty === "intermediate" ? 5 : 2;

  return ratingScore + fishScore + facilityScore + popularityScore + accessScore;
}

function sortSpots(spots: FishingSpot[]): FishingSpot[] {
  return [...spots]
    .map((s) => ({ spot: s, score: calcRankScore(s) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.spot);
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
  const score = calcRankScore(spot);

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
          <span className="flex items-center gap-1 font-semibold text-blue-600">
            {score.toFixed(1)}pt
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
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const rankedSpots = useMemo(() => {
    const byPref = filterByPrefecture(spots, activePrefecture);
    const filtered = filterSpots(byPref, activeTab);
    return sortSpots(filtered).slice(0, 10);
  }, [spots, activeTab, activePrefecture]);

  return (
    <div>
      {/* 都道府県フィルタ - モバイル: セレクトボックス */}
      <div className="mb-4 sm:hidden">
        <div className="relative">
          <select
            value={activePrefecture}
            onChange={(e) => setActivePrefecture(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PREFECTURE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.prefectures.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* 都道府県フィルタ - PC: 地域別グループ */}
      <div className="mb-4 hidden sm:block space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setActivePrefecture("全国")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-bold transition-colors",
              activePrefecture === "全国"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            全国
          </button>
          <span className="text-xs text-muted-foreground">｜</span>
          {PREFECTURE_GROUPS.slice(1).map((group) => (
            <button
              key={group.label}
              onClick={() => setActiveRegion(activeRegion === group.label ? null : group.label)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                activeRegion === group.label
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                  : group.prefectures.includes(activePrefecture)
                  ? "bg-blue-50 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {group.label}
            </button>
          ))}
        </div>
        {activeRegion && (
          <div className="flex flex-wrap gap-1.5 pl-2 border-l-2 border-blue-200 ml-2">
            {PREFECTURE_GROUPS.find((g) => g.label === activeRegion)?.prefectures.map((pref) => (
              <button
                key={pref}
                onClick={() => { setActivePrefecture(pref); setActiveRegion(null); }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  activePrefecture === pref
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                )}
              >
                {pref}
              </button>
            ))}
          </div>
        )}
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

      {/* ランキング基準の説明 */}
      <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-blue-900">ランキングの算出基準</h3>
        </div>
        <p className="text-xs text-blue-800 mb-3">
          ツリスポのランキングは以下5つの指標を総合的に評価し、100点満点のスコアで順位を決定しています。
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-white/70 px-3 py-2">
            <div className="text-xs font-semibold text-gray-800">評価スコア（最大50pt）</div>
            <div className="text-xs text-gray-500 mt-0.5">ベイズ平均を使用。レビュー数が少ない場合は全体平均に補正され、信頼性を確保。</div>
          </div>
          <div className="rounded-lg bg-white/70 px-3 py-2">
            <div className="text-xs font-semibold text-gray-800">魚種の豊富さ（最大15pt）</div>
            <div className="text-xs text-gray-500 mt-0.5">釣れる魚の種類数が多いほど高評価。8種以上で満点。</div>
          </div>
          <div className="rounded-lg bg-white/70 px-3 py-2">
            <div className="text-xs font-semibold text-gray-800">設備の充実度（最大15pt）</div>
            <div className="text-xs text-gray-500 mt-0.5">駐車場・トイレ・レンタル竿の有無、無料かどうかを評価。</div>
          </div>
          <div className="rounded-lg bg-white/70 px-3 py-2">
            <div className="text-xs font-semibold text-gray-800">人気度（最大10pt）</div>
            <div className="text-xs text-gray-500 mt-0.5">レビュー数に基づく注目度。200件以上で満点。</div>
          </div>
          <div className="rounded-lg bg-white/70 px-3 py-2 sm:col-span-2">
            <div className="text-xs font-semibold text-gray-800">アクセスのしやすさ（最大10pt）</div>
            <div className="text-xs text-gray-500 mt-0.5">初心者向け＝10pt、中級者向け＝5pt、上級者向け＝2pt。誰でも行きやすいスポットを高評価。</div>
          </div>
        </div>
      </div>
    </div>
  );
}
