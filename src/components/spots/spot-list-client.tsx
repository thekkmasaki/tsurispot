"use client";

import { useState, useMemo, useCallback, useDeferredValue, useTransition, useEffect, useRef, Fragment } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, MapPin, Navigation, Loader2 } from "lucide-react";
import { SpotCard } from "@/components/spots/spot-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InFeedAd } from "@/components/ads/ad-unit";
import { ListSpot, SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import { regions } from "@/lib/data/regions";
import { spotSearchMatch } from "@/lib/search/spot-match";

type RegionKey = "hokkaido" | "tohoku" | "kanto" | "chubu" | "kinki" | "chugoku" | "shikoku" | "kyushu";

const REGION_CONFIG: Record<RegionKey, { label: string; prefectures: string[] }> = {
  hokkaido: { label: "北海道", prefectures: ["北海道"] },
  tohoku: { label: "東北", prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  kanto: { label: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  chubu: { label: "中部", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  kinki: { label: "近畿", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  chugoku: { label: "中国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"] },
  shikoku: { label: "四国", prefectures: ["徳島県", "香川県", "愛媛県", "高知県"] },
  kyushu: { label: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
};

// 検索マッチング（katakanaToHiragana / fuzzyMatch / spotSearchMatch）は
// /api/search と共用するため src/lib/search/spot-match.ts に集約した

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

const ITEMS_PER_PAGE = 20;

const spotTypes = Object.entries(SPOT_TYPE_LABELS) as [ListSpot["spotType"], string][];
const difficulties = Object.entries(DIFFICULTY_LABELS) as [ListSpot["difficulty"], string][];

// Build unique prefecture list from regions
const prefectures = Array.from(new Set(regions.map((r) => r.prefecture)));

type FacilityKey = "hasParking" | "hasToilet" | "hasConvenienceStore" | "hasFishingShop" | "hasRentalRod";

const FACILITY_OPTIONS: { key: FacilityKey; label: string }[] = [
  { key: "hasParking", label: "駐車場" },
  { key: "hasToilet", label: "トイレ" },
  { key: "hasConvenienceStore", label: "コンビニ" },
  // { key: "hasFishingShop", label: "釣具店" }, // データ精度見直し中のため一時非表示
  { key: "hasRentalRod", label: "レンタル竿" },
];

export function SpotListClient({ spots }: { spots: ListSpot[] }) {
  // UX-3: URL query から filter 初期値を復元 (share/back/reload で復元可能に)
  // useSearchParams() で初回レンダから URL の値を state に反映する。静的生成時は
  // 空 params のまま page.tsx 側の Suspense fallback（サーバー描画の既定一覧）が
  // SSR HTML に載るため、本文・広告が SSR から消える CSR バックアウト問題
  // （2026-07 判明）は再発しない。
  // 旧方式「マウント後に window.location.search から復元」には
  // (1) クライアント遷移で URL 反映より先に mount effect が走り q を取り逃す
  // (2) 同一ルートへの router.push('/spots?q=…') では remount されず反映されない
  // (3) 取り逃した状態を 300ms 後の同期 effect が URL から消す
  // という実バグがあった（2026-08 UX監査で特定）。
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchText, setSearchText] = useState(() => searchParams.get("q") ?? "");
  const deferredSearchText = useDeferredValue(searchText);
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | "">("");
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>(() => searchParams.get("prefecture") ?? "");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedType, setSelectedType] = useState<ListSpot["spotType"] | "">(() => (searchParams.get("type") ?? "") as ListSpot["spotType"] | "");
  const [selectedDifficulty, setSelectedDifficulty] = useState<ListSpot["difficulty"] | "">(() => (searchParams.get("difficulty") ?? "") as ListSpot["difficulty"] | "");
  const [selectedFacilities, setSelectedFacilities] = useState<FacilityKey[]>([]);
  const [selectedFree, setSelectedFree] = useState<"" | "free" | "paid">("");
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedFishNames, setSelectedFishNames] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number.parseInt(searchParams.get("page") ?? "", 10);
    return Number.isFinite(p) && p > 1 ? p : 1;
  });
  const [isPending, startTransition] = useTransition();

  // 自分が writeUrl で書いた URL を記録し、URL→state 同期 effect が自分の書き込みに
  // 反応して入力中のテキストを巻き戻すのを防ぐ（打鍵 → デバウンス書き込み → effect の競合対策）
  const lastWrittenUrlRef = useRef<string | null>(null);

  // URL を書き出す。router.replace ではなく History API を直接使う:
  // (1) router.replace は同一ルートでも RSC ペイロードを取りに行き、/spots のそれは
  //     実測で数百KB・Cloudflare では DYNAMIC 扱い（キャッシュされずオリジン直撃）。
  //     フィルタ操作のたびにこれが走っていた。History API なら通信ゼロ。
  // (2) ページ送りを pushState にすることで履歴エントリが積まれ、GA4 の拡張計測
  //     「履歴イベントに基づくページの変更」で PV として計上される。従来ページ送りは
  //     setState のみで URL すら変わらず、全ページ分の PV が失われていた。
  // App Router は window.history.pushState/replaceState の直接利用を公式にサポートしている。
  const writeUrl = useCallback(
    (page: number, mode: "push" | "replace") => {
      const params = new URLSearchParams();
      if (searchText) params.set("q", searchText);
      if (selectedPrefecture) params.set("prefecture", selectedPrefecture);
      if (selectedType) params.set("type", selectedType);
      if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
      if (page > 1) params.set("page", String(page));
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      // 同一URLでも「自分の書き込み」として記録してから抜ける
      // （URL→state 同期 effect の自己反応防止に使う）
      lastWrittenUrlRef.current = url;
      // 同一URLなら何もしない。これがないと同期用の replace が
      // ページ送りで積んだ履歴エントリを潰してしまう
      if (url === window.location.pathname + window.location.search) return;
      if (mode === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    },
    [searchText, selectedPrefecture, selectedType, selectedDifficulty, pathname],
  );

  // ページ送り。setState と URL を必ずセットで動かす
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      writeUrl(page, "push");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [writeUrl],
  );

  // URL → state 同期: ヘッダー検索の router.push（同一ルート・remount なし）、
  // 戻る/進む、外部リンクなど「自分以外」が URL を変えたときに絞り込みへ反映する。
  // useSearchParams は App Router の履歴統合により pushState/replaceState でも更新される。
  // 自分の writeUrl 由来の変化は lastWrittenUrlRef で除外（入力巻き戻し防止）。
  // 「URLに無い＝クリア」で上書きしないと、戻ったのに前の絞り込みが残る。
  useEffect(() => {
    const current = window.location.pathname + window.location.search;
    if (lastWrittenUrlRef.current === current) return;
    setSearchText(searchParams.get("q") ?? "");
    setSelectedPrefecture(searchParams.get("prefecture") ?? "");
    setSelectedType((searchParams.get("type") ?? "") as ListSpot["spotType"] | "");
    setSelectedDifficulty((searchParams.get("difficulty") ?? "") as ListSpot["difficulty"] | "");
    const page = Number.parseInt(searchParams.get("page") ?? "", 10);
    setCurrentPage(Number.isFinite(page) && page > 1 ? page : 1);
  }, [searchParams]);

  // UX-3: state 変更時に URL query を同期 (share/back/reload で復元可能に)
  // 打鍵ごとに書き換えると入力中の INP が悪化するため 300ms デバウンスする。
  // currentPage を含めるのは、マウント直後にこの effect が ?page=N を消さないため。
  // ページ送り由来の変化は writeUrl 内の同一URLガードで no-op になる。
  useEffect(() => {
    const timer = setTimeout(() => {
      writeUrl(currentPage, "replace");
    }, 300);
    return () => clearTimeout(timer);
  }, [writeUrl, currentPage]);

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

  const topMethods = useMemo(() => {
    const counts = new Map<string, number>();
    for (const spot of spots) {
      for (const method of spot.methods) {
        counts.set(method, (counts.get(method) || 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([m]) => m);
  }, [spots]);

  const topFishNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const spot of spots) {
      for (const name of spot.fishNames) {
        counts.set(name, (counts.get(name) || 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([n]) => n);
  }, [spots]);

  const hasFilters = searchText || selectedRegion || selectedPrefecture || selectedArea || selectedType || selectedDifficulty || selectedFacilities.length > 0 || selectedFree || selectedMethods.length > 0 || selectedFishNames.length > 0;
  const activeFilterCount = [selectedRegion, selectedPrefecture, selectedArea, selectedType, selectedDifficulty, selectedFree].filter(Boolean).length + selectedFacilities.length + selectedMethods.length + selectedFishNames.length;

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
      if (deferredSearchText) {
        if (!spotSearchMatch(deferredSearchText, spot)) return false;
      }
      if (selectedRegion && !REGION_CONFIG[selectedRegion].prefectures.includes(spot.region.prefecture)) return false;
      if (selectedPrefecture && spot.region.prefecture !== selectedPrefecture) return false;
      if (selectedArea && spot.region.areaName !== selectedArea) return false;
      if (selectedType && spot.spotType !== selectedType) return false;
      if (selectedDifficulty && spot.difficulty !== selectedDifficulty) return false;
      if (selectedFree === "free" && !spot.isFree) return false;
      if (selectedFree === "paid" && spot.isFree) return false;
      for (const fac of selectedFacilities) {
        if (!spot[fac]) return false;
      }
      // 釣法フィルタ（AND: 選択したすべての釣法が可能なスポット）
      if (selectedMethods.length > 0) {
        const spotMethods = new Set(spot.methods);
        if (!selectedMethods.every(m => spotMethods.has(m))) return false;
      }
      // 対象魚フィルタ（OR: 選択した魚のいずれかがいるスポット）
      if (selectedFishNames.length > 0) {
        const spotFish = new Set(spot.fishNames);
        if (!selectedFishNames.some(f => spotFish.has(f))) return false;
      }
      return true;
    });

    // Sort by distance if enabled
    if (sortByDistance && distanceMap) {
      filtered.sort((a, b) => (distanceMap.get(a.id) ?? Infinity) - (distanceMap.get(b.id) ?? Infinity));
    }

    return filtered;
  }, [spots, deferredSearchText, selectedRegion, selectedPrefecture, selectedArea, selectedType, selectedDifficulty, selectedFacilities, selectedFree, selectedMethods, selectedFishNames, sortByDistance, distanceMap]);

  const totalPages = Math.ceil(filteredSpots.length / ITEMS_PER_PAGE);
  const paginatedSpots = filteredSpots.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const clearFilters = () => {
    setSearchText("");
    startTransition(() => {
      setSelectedRegion("");
      setSelectedPrefecture("");
      setSelectedArea("");
      setSelectedType("");
      setSelectedDifficulty("");
      setSelectedFacilities([]);
      setSelectedFree("");
      setSelectedMethods([]);
      setSelectedFishNames([]);
      setCurrentPage(1);
    });
  };

  const handleFilterChange = <T,>(setter: (v: T) => void, value: T) => {
    startTransition(() => {
      setter(value);
      setCurrentPage(1);
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search bar - prominent */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="スポット名・地域名で検索"
          placeholder="スポット名・地域名で検索..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); startTransition(() => { setCurrentPage(1); }); }}
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
        isFilterOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"
      )}>
        {/* Region block filter (1段目: 地方ブロック) */}
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">地方</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(Object.keys(REGION_CONFIG) as RegionKey[]).map((key) => (
              <Button
                key={key}
                variant={selectedRegion === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newRegion = selectedRegion === key ? "" : key;
                  startTransition(() => {
                    setSelectedRegion(newRegion);
                    setSelectedPrefecture("");
                    setSelectedArea("");
                    setCurrentPage(1);
                  });
                }}
                className="min-h-[40px] text-xs sm:text-sm"
              >
                {REGION_CONFIG[key].label}
              </Button>
            ))}
          </div>
        </div>

        {/* Prefecture filter (2段目: 選択した地方の都道府県) */}
        {selectedRegion && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">都道府県</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {REGION_CONFIG[selectedRegion].prefectures.map((pref) => (
                <Button
                  key={pref}
                  variant={selectedPrefecture === pref ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newPref = selectedPrefecture === pref ? "" : pref;
                    startTransition(() => {
                      setSelectedPrefecture(newPref);
                      setSelectedArea("");
                      setCurrentPage(1);
                    });
                  }}
                  className="min-h-[40px] text-xs sm:text-sm"
                >
                  {pref}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Area filter - shown when a prefecture is selected */}
        {selectedPrefecture && areasForPrefecture.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">エリア</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Button
                variant={selectedArea === "" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(setSelectedArea, "")}
                className="min-h-[40px] text-xs sm:text-sm"
              >
                すべてのエリア
              </Button>
              {areasForPrefecture.map((area) => (
                <Button
                  key={area}
                  variant={selectedArea === area ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange(setSelectedArea, selectedArea === area ? "" : area)}
                  className="min-h-[40px] text-xs sm:text-sm"
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
                  className="min-h-[40px] text-xs sm:text-sm"
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
                  className="min-h-[40px] text-xs sm:text-sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Facility + Free/Paid row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Facility filter */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">施設</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {FACILITY_OPTIONS.map(({ key, label }) => {
                const active = selectedFacilities.includes(key);
                return (
                  <Button
                    key={key}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      startTransition(() => {
                        const next = active ? selectedFacilities.filter((f) => f !== key) : [...selectedFacilities, key];
                        setSelectedFacilities(next);
                        setCurrentPage(1);
                      });
                    }}
                    className="min-h-[40px] text-xs sm:text-sm"
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Free / Paid filter */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">料金</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {([["free", "無料"], ["paid", "有料"]] as const).map(([val, label]) => (
                <Button
                  key={val}
                  variant={selectedFree === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => { handleFilterChange(setSelectedFree, selectedFree === val ? "" : val); }}
                  className="min-h-[40px] text-xs sm:text-sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 釣法フィルタ */}
        {topMethods.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">釣法</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {topMethods.map((method) => {
                const active = selectedMethods.includes(method);
                return (
                  <Button
                    key={method}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      startTransition(() => {
                        setSelectedMethods(active ? selectedMethods.filter(m => m !== method) : [...selectedMethods, method]);
                        setCurrentPage(1);
                      });
                    }}
                    className="min-h-[40px] text-xs sm:text-sm"
                  >
                    {method}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* 対象魚フィルタ */}
        {topFishNames.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">対象魚</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {topFishNames.map((fishName) => {
                const active = selectedFishNames.includes(fishName);
                return (
                  <Button
                    key={fishName}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      startTransition(() => {
                        setSelectedFishNames(active ? selectedFishNames.filter(f => f !== fishName) : [...selectedFishNames, fishName]);
                        setCurrentPage(1);
                      });
                    }}
                    className="min-h-[40px] text-xs sm:text-sm"
                  >
                    {fishName}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active filters summary + clear */}
      <div className="flex items-center justify-between">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {filteredSpots.length}件のスポット
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="min-h-[40px]">
            <X className="mr-1 size-4" />
            クリア
          </Button>
        )}
      </div>

      {/* Results grid */}
      {paginatedSpots.length > 0 ? (
        <>
          <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 transition-opacity duration-200", isPending && "opacity-50")}>
            {paginatedSpots.map((spot, index) => (
              <Fragment key={spot.id}>
                <SpotCard
                  spot={spot}
                  distance={sortByDistance && distanceMap ? distanceMap.get(spot.id) : undefined}
                  priority={index < 4}
                />
                {(index === 3 || index === 7 || index === 11 || index === 15) && (
                  <div className="col-span-full">
                    <InFeedAd />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-4 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className="min-h-[44px] gap-1"
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">前へ</span>
              </Button>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {(() => {
                  if (totalPages <= 7) {
                    return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="min-h-[44px] min-w-[44px]"
                      >
                        {page}
                      </Button>
                    ));
                  }
                  const pages: (number | string)[] = [];
                  pages.push(1);
                  if (currentPage > 3) pages.push("start-ellipsis");
                  for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
                    pages.push(p);
                  }
                  if (currentPage < totalPages - 2) pages.push("end-ellipsis");
                  pages.push(totalPages);
                  return pages.map((page) =>
                    typeof page === "string" ? (
                      <span key={page} className="flex min-h-[44px] min-w-[32px] items-center justify-center text-sm text-muted-foreground sm:min-w-[44px]">...</span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="min-h-[44px] min-w-[36px] sm:min-w-[44px]"
                      >
                        {page}
                      </Button>
                    )
                  );
                })()}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="min-h-[44px] gap-1"
              >
                <span className="hidden sm:inline">次へ</span>
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
