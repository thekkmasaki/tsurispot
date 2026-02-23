"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Star, MapPin, Trophy, Fish, ChevronDown, Info, Navigation, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** サーバーから渡される軽量スポットデータ */
export interface RankingSpot {
  id: string;
  slug: string;
  name: string;
  rating: number;
  reviewCount: number;
  prefecture: string;
  spotType: string;
  difficulty: string;
  latitude: number;
  longitude: number;
  hasParking: boolean;
  hasToilet: boolean;
  hasRentalRod: boolean;
  isFree: boolean;
  fishCount: number;
  topFish: { id: string; name: string }[];
  bestTimes: { label: string; rating: string }[];
}

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

function hasNightFishing(spot: RankingSpot): boolean {
  return spot.bestTimes.some(
    (t) => t.label === "夜" && (t.rating === "best" || t.rating === "good")
  );
}

function filterByPrefecture(spots: RankingSpot[], prefecture: string): RankingSpot[] {
  if (prefecture === "全国") return spots;
  return spots.filter((s) => {
    const spotPref = s.prefecture;
    return spotPref === prefecture
      || spotPref === prefecture.replace(/[都道府県]$/, "")
      || spotPref.replace(/[都道府県]$/, "") === prefecture.replace(/[都道府県]$/, "");
  });
}

function filterSpots(spots: RankingSpot[], tab: TabKey): RankingSpot[] {
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
function calcRankScore(spot: RankingSpot): number {
  const C = 10;
  const M = 3.8;
  const bayesian = (spot.reviewCount * spot.rating + C * M) / (spot.reviewCount + C);
  const ratingScore = (bayesian / 5) * 50;

  const fishScore = Math.min(spot.fishCount / 8, 1) * 15;

  let facilityScore = 0;
  if (spot.hasParking) facilityScore += 4;
  if (spot.hasToilet) facilityScore += 4;
  if (spot.hasRentalRod) facilityScore += 4;
  if (spot.isFree) facilityScore += 3;

  const popularityScore = Math.min(spot.reviewCount / 200, 1) * 10;

  const accessScore = spot.difficulty === "beginner" ? 10 : spot.difficulty === "intermediate" ? 5 : 2;

  return ratingScore + fishScore + facilityScore + popularityScore + accessScore;
}

function sortSpots(spots: RankingSpot[]): RankingSpot[] {
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

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface SpotCardProps {
  spot: RankingSpot;
  rank: number;
  distanceKm?: number;
}

function SpotCard({ spot, rank, distanceKm }: SpotCardProps) {
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
            {spot.prefecture}
          </span>
          <span>{SPOT_TYPE_LABELS[spot.spotType] ?? spot.spotType}</span>
          <span className="flex items-center gap-1 font-semibold text-blue-600">
            {score.toFixed(1)}pt
          </span>
          {distanceKm !== undefined && (
            <span className="flex items-center gap-1 font-medium text-emerald-600">
              <Navigation className="h-3 w-3" />
              {distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)}km
            </span>
          )}
        </div>

        {/* 対象魚 */}
        {spot.topFish.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Fish className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            {spot.topFish.map((f) => (
              <span
                key={f.id}
                className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
              >
                {f.name}
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
  spots: RankingSpot[];
}

export function RankingClient({ spots }: RankingClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [activePrefecture, setActivePrefecture] = useState("全国");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setNearbyMode(true);
        setActivePrefecture("全国");
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const rankedSpots = useMemo(() => {
    if (nearbyMode && userLocation) {
      const filtered = filterSpots(spots, activeTab);
      return filtered
        .map((s) => {
          const dist = calcDistance(userLocation[0], userLocation[1], s.latitude, s.longitude);
          const score = calcRankScore(s);
          const distBonus = dist <= 30 ? 20 : dist <= 100 ? 20 * (1 - (dist - 30) / 70) : 0;
          return { spot: s, score: score + distBonus, dist };
        })
        .filter((x) => x.dist <= 100)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((x) => ({ ...x.spot, _dist: x.dist }));
    }
    const byPref = filterByPrefecture(spots, activePrefecture);
    const filtered = filterSpots(byPref, activeTab);
    return sortSpots(filtered).slice(0, 10);
  }, [spots, activeTab, activePrefecture, nearbyMode, userLocation]);

  return (
    <div>
      {/* 現在地ボタン */}
      <div className="mb-3">
        <button
          onClick={() => {
            if (nearbyMode) {
              setNearbyMode(false);
            } else {
              handleLocate();
            }
          }}
          disabled={locating}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all w-full sm:w-auto",
            nearbyMode
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200"
          )}
        >
          {locating ? <Loader2 className="size-4 animate-spin" /> : <Navigation className="size-4" />}
          {nearbyMode ? "現在地の近く（100km以内）を表示中" : "現在地の近くでランキング"}
        </button>
        {nearbyMode && (
          <p className="mt-1.5 text-xs text-emerald-600">
            スコアに距離ボーナスを加算。近い＋評価の高いスポットが上位に表示されます。
          </p>
        )}
      </div>

      {/* 都道府県フィルタ - モバイル: セレクトボックス */}
      <div className={cn("mb-4 sm:hidden", nearbyMode && "opacity-50 pointer-events-none")}>
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
      <div className={cn("mb-4 hidden sm:block space-y-2", nearbyMode && "opacity-50 pointer-events-none")}>
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
        {nearbyMode ? "現在地の近く" : activePrefecture}・{TABS.find((t) => t.key === activeTab)?.label ?? "総合"} TOP10
        （{rankedSpots.length}件）
      </p>

      {/* ランキングリスト */}
      {rankedSpots.length > 0 ? (
        <div className="space-y-3">
          {rankedSpots.map((spot, index) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              rank={index + 1}
              distanceKm={nearbyMode && "_dist" in spot ? (spot as RankingSpot & { _dist: number })._dist : undefined}
            />
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
