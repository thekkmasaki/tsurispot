"use client";

import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { SpotCard } from "@/components/spots/spot-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FishingSpot, SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import { regions } from "@/lib/data/regions";

const ITEMS_PER_PAGE = 100;

const spotTypes = Object.entries(SPOT_TYPE_LABELS) as [FishingSpot["spotType"], string][];
const difficulties = Object.entries(DIFFICULTY_LABELS) as [FishingSpot["difficulty"], string][];

// Build unique prefecture list from regions
const prefectures = Array.from(new Set(regions.map((r) => r.prefecture)));

export function SpotListClient({ spots }: { spots: FishingSpot[] }) {
  const [searchText, setSearchText] = useState("");
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("");
  const [selectedType, setSelectedType] = useState<FishingSpot["spotType"] | "">("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<FishingSpot["difficulty"] | "">("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const hasFilters = searchText || selectedPrefecture || selectedType || selectedDifficulty;
  const activeFilterCount = [selectedPrefecture, selectedType, selectedDifficulty].filter(Boolean).length;

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        const nameMatch = spot.name.toLowerCase().includes(q);
        const regionMatch =
          spot.region.prefecture.toLowerCase().includes(q) ||
          spot.region.areaName.toLowerCase().includes(q);
        if (!nameMatch && !regionMatch) return false;
      }
      if (selectedPrefecture && spot.region.prefecture !== selectedPrefecture) return false;
      if (selectedType && spot.spotType !== selectedType) return false;
      if (selectedDifficulty && spot.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [spots, searchText, selectedPrefecture, selectedType, selectedDifficulty]);

  const totalPages = Math.ceil(filteredSpots.length / ITEMS_PER_PAGE);
  const paginatedSpots = filteredSpots.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const clearFilters = () => {
    setSearchText("");
    setSelectedPrefecture("");
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
        isFilterOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"
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
                onClick={() => handleFilterChange(setSelectedPrefecture, selectedPrefecture === pref ? "" : pref)}
                className="min-h-[36px] text-xs sm:text-sm"
              >
                {pref}
              </Button>
            ))}
          </div>
        </div>

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
              <SpotCard key={spot.id} spot={spot} />
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
