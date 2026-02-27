"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  MapPin,
  Fish,
  Car,
  Bath,
  Share2,
  Save,
  FolderOpen,
  Star,
  Link2,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SpotSummary } from "./page";

const SPOT_TYPE_LABELS: Record<string, string> = {
  port: "港",
  beach: "砂浜",
  rocky: "磯",
  river: "川",
  pier: "桟橋",
  breakwater: "堤防",
};

const STORAGE_KEY = "tsurispot-plans";

interface Plan {
  id: string;
  name: string;
  slugs: string[];
  createdAt: string;
}

function getPlans(): Plan[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePlans(plans: Plan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function PlannerClient({ spots }: { spots: SpotSummary[] }) {
  const searchParams = useSearchParams();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [planName, setPlanName] = useState("");
  const [savedPlans, setSavedPlans] = useState<Plan[]>([]);
  const [showPlans, setShowPlans] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // URLパラメータからスポットを復元
  useEffect(() => {
    const spotsParam = searchParams.get("spots");
    if (spotsParam) {
      const slugs = spotsParam.split(",").filter((s) => spots.some((sp) => sp.slug === s));
      if (slugs.length > 0) setSelectedSlugs(slugs);
    }
  }, [searchParams, spots]);

  // 保存済みプラン読み込み
  useEffect(() => {
    setSavedPlans(getPlans());
  }, []);

  // 検索外クリックで閉じる
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const spotMap = useMemo(() => {
    const map = new Map<string, SpotSummary>();
    for (const s of spots) map.set(s.slug, s);
    return map;
  }, [spots]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return spots
      .filter(
        (s) =>
          !selectedSlugs.includes(s.slug) &&
          (s.name.toLowerCase().includes(q) ||
            s.prefecture.includes(q) ||
            s.area.includes(q) ||
            s.fish.some((f) => f.includes(q)))
      )
      .slice(0, 10);
  }, [query, spots, selectedSlugs]);

  const selectedSpots = useMemo(
    () => selectedSlugs.map((slug) => spotMap.get(slug)).filter(Boolean) as SpotSummary[],
    [selectedSlugs, spotMap]
  );

  const addSpot = useCallback((slug: string) => {
    setSelectedSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setQuery("");
    setShowResults(false);
  }, []);

  const removeSpot = useCallback((slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const moveSpot = useCallback((index: number, direction: -1 | 1) => {
    setSelectedSlugs((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const shareUrl = useMemo(() => {
    if (selectedSlugs.length === 0) return "";
    return `${typeof window !== "undefined" ? window.location.origin : ""}/planner?spots=${selectedSlugs.join(",")}`;
  }, [selectedSlugs]);

  const handleCopyUrl = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const handleSave = useCallback(() => {
    if (selectedSlugs.length === 0) return;
    const name = planName.trim() || `プラン ${new Date().toLocaleDateString("ja-JP")}`;
    const plan: Plan = {
      id: Date.now().toString(),
      name,
      slugs: selectedSlugs,
      createdAt: new Date().toISOString(),
    };
    const plans = [...getPlans(), plan];
    savePlans(plans);
    setSavedPlans(plans);
    setPlanName("");
  }, [selectedSlugs, planName]);

  const handleLoadPlan = useCallback((plan: Plan) => {
    setSelectedSlugs(plan.slugs);
    setShowPlans(false);
  }, []);

  const handleDeletePlan = useCallback((planId: string) => {
    const plans = getPlans().filter((p) => p.id !== planId);
    savePlans(plans);
    setSavedPlans(plans);
  }, []);

  // 集計: 全魚種
  const allFish = useMemo(() => {
    const set = new Set<string>();
    for (const s of selectedSpots) for (const f of s.fish) set.add(f);
    return Array.from(set);
  }, [selectedSpots]);

  return (
    <div className="space-y-6">
      {/* スポット検索 */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => query.trim() && setShowResults(true)}
            placeholder="スポット名・地域名・魚種名で検索..."
            className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-xl border bg-white shadow-lg">
            {searchResults.map((spot) => (
              <button
                key={spot.slug}
                onClick={() => addSpot(spot.slug)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50"
              >
                <Plus className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{spot.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {spot.prefecture} {spot.area} / {SPOT_TYPE_LABELS[spot.spotType] || spot.spotType}
                    {spot.fish.length > 0 && ` / ${spot.fish.slice(0, 3).join("・")}`}
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {SPOT_TYPE_LABELS[spot.spotType] || spot.spotType}
                </Badge>
              </button>
            ))}
          </div>
        )}
        {showResults && query.trim() && searchResults.length === 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border bg-white px-4 py-6 text-center text-sm text-muted-foreground shadow-lg">
            該当するスポットが見つかりません
          </div>
        )}
      </div>

      {/* ツールバー */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowPlans(!showPlans)}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
        >
          <FolderOpen className="size-4" />
          保存済みプラン ({savedPlans.length})
        </button>
        {selectedSlugs.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="プラン名"
                className="w-32 rounded-lg border px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-40"
              />
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                <Save className="size-4" />
                保存
              </button>
            </div>
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              {copied ? <Check className="size-4 text-green-600" /> : <Share2 className="size-4" />}
              {copied ? "コピー済み" : "URLで共有"}
            </button>
          </>
        )}
      </div>

      {/* 保存済みプラン一覧 */}
      {showPlans && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-bold">保存済みプラン</h3>
            {savedPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground">保存済みのプランはありません</p>
            ) : (
              <div className="space-y-2">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <button
                      onClick={() => handleLoadPlan(plan)}
                      className="flex-1 text-left text-sm font-medium hover:text-primary"
                    >
                      {plan.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({plan.slugs.length}スポット)
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 選択済みスポット一覧 */}
      {selectedSpots.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed py-16 text-center">
          <MapPin className="mx-auto mb-3 size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            上の検索バーからスポットを追加してください
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedSpots.map((spot, index) => (
            <Card key={spot.slug} className="overflow-hidden">
              <CardContent className="flex items-start gap-3 p-4">
                {/* 順番 */}
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveSpot(index, -1)}
                      disabled={index === 0}
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-20"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      onClick={() => moveSpot(index, 1)}
                      disabled={index === selectedSpots.length - 1}
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-20"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                </div>

                {/* スポット情報 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/spots/${spot.slug}`}
                      className="text-base font-bold hover:text-primary"
                    >
                      {spot.name}
                    </Link>
                    <button
                      onClick={() => removeSpot(spot.slug)}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {spot.prefecture} {spot.area}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {SPOT_TYPE_LABELS[spot.spotType] || spot.spotType}
                    </Badge>
                    {spot.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        {spot.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {/* 施設 */}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {spot.hasParking && (
                      <span className="flex items-center gap-0.5"><Car className="size-3" /> 駐車場</span>
                    )}
                    {spot.hasToilet && (
                      <span className="flex items-center gap-0.5"><Bath className="size-3" /> トイレ</span>
                    )}
                    {spot.isFree && (
                      <span className="font-medium text-green-600">無料</span>
                    )}
                  </div>
                  {/* 釣れる魚 */}
                  {spot.fish.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {spot.fish.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs">
                          <Fish className="mr-0.5 size-3" />
                          {f}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 集計 */}
      {selectedSpots.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-bold">プランまとめ</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">スポット数</p>
                <p className="text-2xl font-bold text-primary">{selectedSpots.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">釣れる魚種</p>
                <p className="text-2xl font-bold text-primary">{allFish.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">エリア</p>
                <p className="text-2xl font-bold text-primary">
                  {new Set(selectedSpots.map((s) => s.prefecture)).size}都道府県
                </p>
              </div>
            </div>
            {allFish.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  釣れる可能性のある魚種一覧
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allFish.map((f) => (
                    <Badge key={f} variant="outline" className="text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {shareUrl && (
              <div className="mt-4 rounded-lg border bg-white p-3">
                <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Link2 className="size-3" />
                  共有URL
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 overflow-x-auto rounded bg-muted px-2 py-1 text-xs">
                    {shareUrl}
                  </code>
                  <button
                    onClick={handleCopyUrl}
                    className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                  >
                    {copied ? "OK" : "コピー"}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
