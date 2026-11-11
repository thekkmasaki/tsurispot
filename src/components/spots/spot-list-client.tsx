"use client";

import { useState, useMemo, useCallback, useDeferredValue, useTransition, useEffect, useRef, Fragment } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Navigation, Loader2, List, Map as MapIcon } from "lucide-react";
import { SpotCard } from "@/components/spots/spot-card";

// 地図タブ用（Leaflet）。タブを開いたときだけ読み込む
const SpotResultsMap = dynamic(
  () => import("@/components/spots/spot-results-map").then((m) => m.SpotResultsMap),
  { ssr: false, loading: () => <div className="h-[60vh] min-h-[360px] w-full animate-pulse rounded-xl bg-muted" /> },
);
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

/**
 * 全件データ（5,000件超）は HTML に埋め込まず、表示後に /api/spots/list（force-static・CDN配信）から
 * 1回だけ取得する（/spots の HTML が gzip 約500KB → 数十KB）。取得完了までは initialSpots（既定の
 * 1ページ目＝SSR と同じ20件）で描画し、件数は totalCount を出す。
 */
export function SpotListClient({ initialSpots, totalCount }: { initialSpots: ListSpot[]; totalCount: number }) {
  const [allSpots, setAllSpots] = useState<ListSpot[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/spots/list")
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((data: ListSpot[]) => {
          if (alive) setAllSpots(data);
        })
        .catch(() => {
          if (alive) setLoadError(true);
        });
    // 初期表示（LCP）を邪魔しないようアイドル時に取得。URLに絞り込み条件があれば即取得
    const hasQuery = window.location.search.length > 1;
    if (hasQuery || typeof window.requestIdleCallback !== "function") {
      load();
    } else {
      window.requestIdleCallback(() => load(), { timeout: 1500 });
    }
    return () => {
      alive = false;
    };
  }, []);
  const spots = allSpots ?? initialSpots;
  const isLoadingAll = allSpots === null && !loadError;
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

  // ページ送りリンクの href（writeUrl と同じ組み立て。クローラ・新規タブ用）
  const pageHref = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      if (searchText) params.set("q", searchText);
      if (selectedPrefecture) params.set("prefecture", selectedPrefecture);
      if (selectedType) params.set("type", selectedType);
      if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
      if (page > 1) params.set("page", String(page));
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [searchText, selectedPrefecture, selectedType, selectedDifficulty, pathname],
  );

  const [viewMode, setViewMode] = useState<"list" | "map">("list");

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
  const [sortByRating, setSortByRating] = useState(false);

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

    // Sort: 現在地からの距離を最優先、無効時は評価の高い順（同点は名前昇順で決定的）
    if (sortByDistance && distanceMap) {
      filtered.sort((a, b) => (distanceMap.get(a.id) ?? Infinity) - (distanceMap.get(b.id) ?? Infinity));
    } else if (sortByRating) {
      filtered.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
    }

    return filtered;
  }, [spots, deferredSearchText, selectedRegion, selectedPrefecture, selectedArea, selectedType, selectedDifficulty, selectedFacilities, selectedFree, selectedMethods, selectedFishNames, sortByDistance, sortByRating, distanceMap]);

  // 全件取得前は、絞り込みなしなら全体件数（totalCount）でページ数・件数を出す
  const resultCount = allSpots === null && !hasFilters ? totalCount : filteredSpots.length;
  const totalPages = Math.ceil(resultCount / ITEMS_PER_PAGE);
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

  // 4,000件超の絞り込みは端末によって時間がかかるため、反映待ちの間は入力欄と件数に表示する
  // 全件の取得待ちで、絞り込みや2ページ目以降を表示しようとしている間も「絞り込み中」扱いにする
  const isFiltering = isPending || searchText !== deferredSearchText || (isLoadingAll && (Boolean(hasFilters) || currentPage > 1));

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
          className={cn("h-12 pl-11 text-base sm:h-10 sm:pl-10 sm:text-sm", searchText && "pr-16")}
        />
        {isFiltering && (
          <Loader2
            className={cn("absolute top-1/2 size-4 -translate-y-1/2 animate-spin text-primary", searchText ? "right-10" : "right-3")}
            aria-hidden="true"
          />
        )}
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

      {/* よく使う条件（サウナイキタイ式: 検索バー直下に3つだけ。細かい条件は「すべての条件」パネルへ） */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-bold text-muted-foreground">
          都道府県
          <select
            value={selectedPrefecture}
            onChange={(e) => {
              const v = e.target.value;
              startTransition(() => {
                setSelectedRegion("");
                setSelectedPrefecture(v);
                setSelectedArea("");
                setCurrentPage(1);
              });
            }}
            className="h-11 rounded-lg border bg-background px-2 text-sm font-normal text-foreground"
          >
            <option value="">すべて</option>
            {(Object.keys(REGION_CONFIG) as RegionKey[]).map((key) => (
              <optgroup key={key} label={REGION_CONFIG[key].label}>
                {REGION_CONFIG[key].prefectures.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-muted-foreground">
          釣りたい魚
          <select
            value={selectedFishNames.length === 1 ? selectedFishNames[0] : ""}
            onChange={(e) => {
              const v = e.target.value;
              startTransition(() => {
                setSelectedFishNames(v ? [v] : []);
                setCurrentPage(1);
              });
            }}
            className="h-11 rounded-lg border bg-background px-2 text-sm font-normal text-foreground"
          >
            <option value="">すべて</option>
            {topFishNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-muted-foreground">
          釣り場のタイプ
          <select
            value={selectedType}
            onChange={(e) => handleFilterChange(setSelectedType, e.target.value as ListSpot["spotType"] | "")}
            className="h-11 rounded-lg border bg-background px-2 text-sm font-normal text-foreground"
          >
            <option value="">すべて</option>
            {spotTypes.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-expanded={isFilterOpen}
            className="flex h-11 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-bold text-primary transition-colors hover:bg-accent"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            すべての条件
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={cn("size-4 transition-transform", isFilterOpen && "rotate-180")} aria-hidden="true" />
          </button>
        </div>
      </div>
      {geoError && <p className="text-xs text-red-600">{geoError}</p>}
      {loadError && (
        <p className="text-xs text-red-600">
          釣り場データの読み込みに失敗しました。絞り込みは表示中のスポットだけが対象です。ページを再読み込みしてください。
        </p>
      )}

      {/* すべての条件パネル（既定は閉じる。PCでも閉じてスッキリ見せる） */}
      <div className={cn(
        "space-y-4 overflow-hidden rounded-xl transition-all duration-200",
        isFilterOpen ? "max-h-[1600px] border bg-muted/40 p-4 opacity-100" : "max-h-0 opacity-0"
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

      {/* 結果ヘッダー: 件数 ・ 並び替え ・ リスト/地図 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b pb-3">
        <p aria-live="polite" className="flex items-center gap-1.5 text-sm">
          {isFiltering ? (
            <>
              <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden="true" />
              <span className="text-muted-foreground">絞り込み中…</span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">検索結果</span>
              <span className="font-display text-lg font-bold tabular-nums">{resultCount.toLocaleString()}</span>
              <span className="text-muted-foreground">件</span>
            </>
          )}
        </p>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground">
            <X className="size-3.5" aria-hidden="true" />
            条件をクリア
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <label className="sr-only" htmlFor="spot-sort">並び替え</label>
          <select
            id="spot-sort"
            value={sortByDistance ? "distance" : sortByRating ? "rating" : "default"}
            disabled={geoLoading}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "distance") {
                setSortByRating(false);
                requestLocation();
              } else {
                clearDistanceSort();
                setSortByRating(v === "rating");
                setCurrentPage(1);
              }
            }}
            className="h-9 rounded-lg border bg-background px-2 text-sm"
          >
            <option value="default">おすすめ順</option>
            <option value="rating">評価の高い順</option>
            <option value="distance">{geoLoading ? "位置情報を取得中…" : "現在地から近い順"}</option>
          </select>
          <div className="flex rounded-lg border p-0.5" role="tablist" aria-label="表示切替">
            {([["list", "リスト", List], ["map", "地図", MapIcon]] as const).map(([mode, label, Icon]) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={viewMode === mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-sm font-bold transition-colors",
                  viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {sortByDistance && (
        <p className="-mt-2 flex items-center gap-1 text-xs text-primary">
          <Navigation className="size-3.5" aria-hidden="true" />
          現在地から近い順に表示しています
        </p>
      )}

      {/* 地図表示（タブを開いたときだけ読み込む） */}
      {viewMode === "map" && (
        <div className={cn("transition-opacity", isFiltering && "opacity-50")}>
          <SpotResultsMap spots={filteredSpots} />
          <p className="mt-2 text-xs text-muted-foreground">ピンをタップするとスポットの詳細へ進めます。</p>
        </div>
      )}

      {/* Results grid */}
      {viewMode === "map" ? null : isLoadingAll && (hasFilters || currentPage > 1) ? (
        /* 全件データの取得待ち（絞り込み・2ページ目以降は全件が必要）。誤って「見つかりません」を出さない */
        <div className="flex flex-col items-center gap-2 py-12 text-sm text-muted-foreground" role="status">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
          釣り場データを読み込んでいます…
        </div>
      ) : paginatedSpots.length > 0 ? (
        <>
          <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 transition-opacity duration-200", isFiltering && "opacity-50")}>
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
          {/* ページ送り: 番号付きの <a href="?page=n">（クロール可能）。クリック時は従来どおり
              History API でページ遷移なしに切り替える（goToPage） */}
          {totalPages > 1 && (
            <nav aria-label="ページ送り" className="flex items-center justify-center gap-1 pt-4 sm:gap-2">
              {(() => {
                const linkCls = "inline-flex min-h-[44px] min-w-[36px] items-center justify-center gap-1 rounded-lg border px-2 text-sm transition-colors hover:bg-accent sm:min-w-[44px]";
                const pageLink = (page: number, content: React.ReactNode, label?: string) => (
                  <a
                    key={`p-${page}-${label ?? ""}`}
                    href={pageHref(page)}
                    aria-label={label}
                    aria-current={page === currentPage && !label ? "page" : undefined}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      goToPage(page);
                    }}
                    className={cn(linkCls, page === currentPage && !label && "border-primary bg-primary font-bold text-primary-foreground hover:bg-primary")}
                  >
                    {content}
                  </a>
                );
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let p = 1; p <= totalPages; p++) pages.push(p);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push("start-ellipsis");
                  for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) pages.push(p);
                  if (currentPage < totalPages - 2) pages.push("end-ellipsis");
                  pages.push(totalPages);
                }
                return (
                  <>
                    {currentPage > 1 &&
                      pageLink(currentPage - 1, <><ChevronLeft className="size-4" aria-hidden="true" /><span className="hidden sm:inline">前へ</span></>, "前のページ")}
                    {pages.map((page) =>
                      typeof page === "string" ? (
                        <span key={page} className="flex min-h-[44px] min-w-[24px] items-center justify-center text-sm text-muted-foreground">…</span>
                      ) : (
                        pageLink(page, page)
                      ),
                    )}
                    {currentPage < totalPages &&
                      pageLink(currentPage + 1, <><span className="hidden sm:inline">次へ</span><ChevronRight className="size-4" aria-hidden="true" /></>, "次のページ")}
                  </>
                );
              })()}
            </nav>
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
