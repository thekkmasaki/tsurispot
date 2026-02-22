"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, MapPin, Navigation, Loader2 } from "lucide-react";
import { SpotCard } from "@/components/spots/spot-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FishingSpot, SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import { regions } from "@/lib/data/regions";

// カタカナ → ひらがな変換
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// 検索用正規化（小文字+ひらがな統一）
function normalizeForSearch(str: string): string {
  return katakanaToHiragana(str).toLowerCase();
}

// あいまい検索：双方向部分一致 + かな正規化
function fuzzyMatch(query: string, ...targets: string[]): boolean {
  const nq = normalizeForSearch(query);
  for (const target of targets) {
    if (!target) continue;
    const nt = normalizeForSearch(target);
    // 双方向: "伊根町"で"伊根"を検索 or "伊根"で"伊根町"を検索 どちらもOK
    if (nt.includes(nq) || nq.includes(nt)) return true;
  }
  // クエリが複数語の場合（スペース区切り）すべて含まれるかチェック
  const words = nq.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const combined = targets.filter(Boolean).map(normalizeForSearch).join(" ");
    return words.every((w) => combined.includes(w));
  }
  return false;
}

function haversineDistance(
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

const ITEMS_PER_PAGE = 100;

const spotTypes = Object.entries(SPOT_TYPE_LABELS) as [FishingSpot["spotType"], string][];
const difficulties = Object.entries(DIFFICULTY_LABELS) as [FishingSpot["difficulty"], string][];

// Build unique prefecture list from regions
const prefectures = Array.from(new Set(regions.map((r) => r.prefecture)));

export function SpotListClient({ spots, initialQuery = "" }: { spots: FishingSpot[]; initialQuery?: string }) {
  const [searchText, setSearchText] = useState(initialQuery);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedType, setSelectedType] = useState<FishingSpot["spotType"] | "">("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<FishingSpot["difficulty"] | "">("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("お使いのブラウザは位置情報に対応していません");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
        setGeoLoading(false);
        setCurrentPage(1);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("位置情報の使用が許可されていません。ブラウザの設定を確認してください。");
        } else {
          setGeoError("位置情報を取得できませんでした。もう一度お試しください。");
        }
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  const clearDistanceSort = useCallback(() => {
    setSortByDistance(false);
    setCurrentPage(1);
  }, []);

  // Build area list for selected prefecture
  const areasForPrefecture = useMemo(() => {
    if (!selectedPrefecture) return [];
    return regions
      .filter((r) => r.prefecture === selectedPrefecture)
      .map((r) => r.areaName);
  }, [selectedPrefecture]);

  const hasFilters = searchText || selectedPrefecture || selectedArea || selectedType || selectedDifficulty;
  const activeFilterCount = [selectedPrefecture, selectedArea, selectedType, selectedDifficulty].filter(Boolean).length;

  // Precompute distances for all spots if user location is available
  const distanceMap = useMemo(() => {
    if (!userLocation) return null;
    const map = new Map<string, number>();
    for (const spot of spots) {
      map.set(spot.id, haversineDistance(userLocation.lat, userLocation.lng, spot.latitude, spot.longitude));
    }
    return map;
  }, [spots, userLocation]);

  const filteredSpots = useMemo(() => {
    const filtered = spots.filter((spot) => {
      if (searchText) {
        if (!fuzzyMatch(
          searchText,
          spot.name,
          spot.region.prefecture,
          spot.region.areaName,
          spot.address,
        )) return false;
      }
      if (selectedPrefecture && spot.region.prefecture !== selectedPrefecture) return false;
      if (selectedArea && spot.region.areaName !== selectedArea) return false;
      if (selectedType && spot.spotType !== selectedType) return false;
      if (selectedDifficulty && spot.difficulty !== selectedDifficulty) return false;
      return true;
    });

    // Sort by distance if enabled
    if (sortByDistance && distanceMap) {
      filtered.sort((a, b) => (distanceMap.get(a.id) ?? Infinity) - (distanceMap.get(b.id) ?? Infinity));
    }

    return filtered;
  }, [spots, searchText, selectedPrefecture, selectedArea, selectedType, selectedDifficulty, sortByDistance, distanceMap]);

  const totalPages = Math.ceil(filteredSpots.length / ITEMS_PER_PAGE);
  const paginatedSpots = filteredSpots.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const clearFilters = () => {
    setSearchText("");
    setSelectedPrefecture("");
    setSelectedArea("");
    setSelectedType("");
    setSelectedDifficulty("");
    setCurrentPage(1);
  };

  const handleFilterChange = <T,>(setter: (v: T) => void, value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search bar - prominent */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="スポット名・地域名で検索..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
          className="h-12 pl-11 text-base sm:h-10 sm:pl-10 sm:text-sm"
        />
        {searchText && (
          <button
            onClick={() => setSearchText("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            aria-label="検索をクリア"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Nearby sort button */}
      {!sortByDistance ? (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={requestLocation}
            disabled={geoLoading}
            className="gap-1.5 min-h-[44px] border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
          >
            {geoLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MapPin className="size-4" />
            )}
            {geoLoading ? "位置情報を取得中..." : "現在地から近い順に並べ替え"}
          </Button>
          {geoError && (
            <p className="mt-1.5 text-xs text-red-600">{geoError}</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
          <Navigation className="size-4 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            現在地から近い順に表示しています
          </span>
          <button
            onClick={clearDistanceSort}
            className="ml-auto shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            解除
          </button>
        </div>
      )}

      {/* Mobile: collapsible filter toggle */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:hidden min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          <span>絞り込み</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown className={cn("size-4 transition-transform", isFilterOpen && "rotate-180")} />
      </button>

      {/* Filters - always visible on desktop, collapsible on mobile */}
      <div className={cn(
        "space-y-4 overflow-hidden transition-all duration-200",
        isFilterOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"
      )}>
        {/* Prefecture filter */}
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">地域</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {prefectures.map((pref) => (
              <Button
                key={pref}
                variant={selectedPrefecture === pref ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newPref = selectedPrefecture === pref ? "" : pref;
                  handleFilterChange(setSelectedPrefecture, newPref);
                  setSelectedArea("");
                }}
                className="min-h-[36px] text-xs sm:text-sm"
              >
                {pref}
              </Button>
            ))}
          </div>
        </div>

        {/* Area filter - shown when a prefecture is selected */}
        {selectedPrefecture && areasForPrefecture.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">エリア</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Button
                variant={selectedArea === "" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(setSelectedArea, "")}
                className="min-h-[36px] text-xs sm:text-sm"
              >
                すべてのエリア
              </Button>
              {areasForPrefecture.map((area) => (
                <Button
                  key={area}
                  variant={selectedArea === area ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange(setSelectedArea, selectedArea === area ? "" : area)}
                  className="min-h-[36px] text-xs sm:text-sm"
                >
                  {area}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Spot type + Difficulty in a row on mobile */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Spot type filter */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">タイプ</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {spotTypes.map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedType === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange(setSelectedType, selectedType === key ? "" : key)}
                  className="min-h-[36px] text-xs sm:text-sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">難易度</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {difficulties.map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedDifficulty === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange(setSelectedDifficulty, selectedDifficulty === key ? "" : key)}
                  className="min-h-[36px] text-xs sm:text-sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active filters summary + clear */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredSpots.length}件のスポット
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="min-h-[36px]">
            <X className="mr-1 size-4" />
            クリア
          </Button>
        )}
      </div>

      {/* Results grid */}
      {paginatedSpots.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {paginatedSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                distance={sortByDistance && distanceMap ? distanceMap.get(spot.id) : undefined}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="min-h-[44px] gap-1"
              >
                <ChevronLeft className="size-4" />
                前へ
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="min-h-[44px] min-w-[44px]"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="min-h-[44px] gap-1"
              >
                次へ
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-base font-medium text-muted-foreground sm:text-lg">
            条件に一致するスポットが見つかりませんでした
          </p>
          <Button variant="outline" className="mt-4 min-h-[44px]" onClick={clearFilters}>
            フィルターをクリア
          </Button>
        </div>
      )}
    </div>
  );
}
