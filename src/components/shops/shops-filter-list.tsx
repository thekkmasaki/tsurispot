"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Search,
  X,
  Navigation,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TackleShop } from "@/types";

interface ShopsFilterListProps {
  shops: TackleShop[];
}

// 地方グループ
const REGION_GROUPS: { name: string; prefectures: string[] }[] = [
  { name: "北海道", prefectures: ["北海道"] },
  { name: "東北", prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { name: "関東", prefectures: ["東京都", "神奈川県", "千葉県", "埼玉県", "茨城県", "栃木県", "群馬県"] },
  { name: "中部", prefectures: ["愛知県", "静岡県", "三重県", "新潟県", "富山県", "石川県", "福井県", "長野県", "岐阜県", "山梨県"] },
  { name: "近畿", prefectures: ["大阪府", "兵庫県", "京都府", "滋賀県", "奈良県", "和歌山県"] },
  { name: "中国", prefectures: ["広島県", "岡山県", "山口県", "島根県", "鳥取県"] },
  { name: "四国", prefectures: ["愛媛県", "香川県", "高知県", "徳島県"] },
  { name: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];

export function ShopsFilterList({ shops }: ShopsFilterListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [filterLiveBait, setFilterLiveBait] = useState(false);
  const [filterFrozenBait, setFilterFrozenBait] = useState(false);
  const [filterRental, setFilterRental] = useState(false);
  const [filterParking, setFilterParking] = useState(false);

  // 都道府県一覧（実際にデータがあるもののみ）
  const availablePrefectures = useMemo(() => {
    const prefs = new Set(shops.map((s) => s.region.prefecture));
    return [...prefs].sort();
  }, [shops]);

  // 選択中の地方の都道府県（データがあるもののみ）
  const regionPrefectures = useMemo(() => {
    if (!selectedRegion) return [];
    const group = REGION_GROUPS.find((g) => g.name === selectedRegion);
    if (!group) return [];
    return group.prefectures.filter((p) => availablePrefectures.includes(p));
  }, [selectedRegion, availablePrefectures]);

  // 選択中の都道府県のエリア一覧
  const prefectureAreas = useMemo(() => {
    if (!selectedPrefecture) return [];
    const areas = shops
      .filter((s) => s.region.prefecture === selectedPrefecture)
      .map((s) => s.region.areaName);
    const uniqueAreas = [...new Set(areas)].sort();
    return uniqueAreas;
  }, [selectedPrefecture, shops]);

  // フィルタ適用
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !shop.name.toLowerCase().includes(q) &&
          !shop.address.toLowerCase().includes(q) &&
          !shop.region.areaName.toLowerCase().includes(q) &&
          !shop.region.prefecture.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (selectedRegion && !selectedPrefecture) {
        const group = REGION_GROUPS.find((g) => g.name === selectedRegion);
        if (group && !group.prefectures.includes(shop.region.prefecture)) {
          return false;
        }
      }
      if (selectedPrefecture && shop.region.prefecture !== selectedPrefecture) {
        return false;
      }
      if (selectedArea && shop.region.areaName !== selectedArea) {
        return false;
      }
      if (filterLiveBait && !shop.hasLiveBait) return false;
      if (filterFrozenBait && !shop.hasFrozenBait) return false;
      if (filterRental && !shop.hasRentalRod) return false;
      if (filterParking && !shop.hasParking) return false;
      return true;
    });
  }, [shops, searchQuery, selectedRegion, selectedPrefecture, selectedArea, filterLiveBait, filterFrozenBait, filterRental, filterParking]);

  // 地方ごとの店舗数
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of REGION_GROUPS) {
      counts[group.name] = shops.filter((s) =>
        group.prefectures.includes(s.region.prefecture)
      ).length;
    }
    return counts;
  }, [shops]);

  const hasActiveFilters = selectedRegion || selectedPrefecture || selectedArea || filterLiveBait || filterFrozenBait || filterRental || filterParking || searchQuery;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRegion(null);
    setSelectedPrefecture(null);
    setSelectedArea(null);
    setFilterLiveBait(false);
    setFilterFrozenBait(false);
    setFilterRental(false);
    setFilterParking(false);
  };

  // 現在の絞り込みラベル
  const filterLabel = selectedArea
    ? `${selectedPrefecture} ${selectedArea}`
    : selectedPrefecture
    ? selectedPrefecture
    : selectedRegion
    ? selectedRegion
    : null;

  return (
    <div>
      {/* 検索バー */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="店名・エリア・住所で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* 地方フィルタ（常時表示） */}
      <div className="mb-4 rounded-xl border bg-muted/30 p-3 sm:p-4">
        <div className="mb-3">
          <div className="mb-2 flex items-center gap-2">
            <Navigation className="size-3.5 text-muted-foreground" />
            <p className="text-xs font-bold text-muted-foreground">エリアで探す</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REGION_GROUPS.filter((g) => regionCounts[g.name] > 0).map((group) => (
              <button
                key={group.name}
                onClick={() => {
                  if (selectedRegion === group.name) {
                    setSelectedRegion(null);
                    setSelectedPrefecture(null);
                    setSelectedArea(null);
                  } else {
                    setSelectedRegion(group.name);
                    setSelectedPrefecture(null);
                    setSelectedArea(null);
                  }
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedRegion === group.name
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border bg-background hover:bg-muted"
                }`}
              >
                {group.name}
                <span className="ml-1 opacity-60">{regionCounts[group.name]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 都道府県フィルタ（地方選択時） */}
        {selectedRegion && regionPrefectures.length > 0 && (
          <div className="mb-3 border-t pt-3">
            <p className="mb-2 text-xs font-bold text-muted-foreground">都道府県</p>
            <div className="flex flex-wrap gap-1.5">
              {regionPrefectures.map((pref) => {
                const count = shops.filter((s) => s.region.prefecture === pref).length;
                return (
                  <button
                    key={pref}
                    onClick={() => {
                      if (selectedPrefecture === pref) {
                        setSelectedPrefecture(null);
                        setSelectedArea(null);
                      } else {
                        setSelectedPrefecture(pref);
                        setSelectedArea(null);
                      }
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedPrefecture === pref
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border bg-background hover:bg-muted"
                    }`}
                  >
                    {pref.replace(/[都道府県]$/, "")}
                    <span className="ml-1 opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* エリアフィルタ（都道府県選択時） */}
        {selectedPrefecture && prefectureAreas.length > 1 && (
          <div className="mb-3 border-t pt-3">
            <p className="mb-2 text-xs font-bold text-muted-foreground">エリア</p>
            <div className="flex flex-wrap gap-1.5">
              {prefectureAreas.map((area) => {
                const count = shops.filter(
                  (s) => s.region.prefecture === selectedPrefecture && s.region.areaName === area
                ).length;
                return (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(selectedArea === area ? null : area)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedArea === area
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border bg-background hover:bg-muted"
                    }`}
                  >
                    {area}
                    <span className="ml-1 opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* サービスフィルタ */}
        <div className={selectedRegion ? "border-t pt-3" : ""}>
          <p className="mb-2 text-xs font-bold text-muted-foreground">サービスで絞り込み</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterLiveBait(!filterLiveBait)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filterLiveBait
                  ? "bg-green-600 text-white shadow-sm"
                  : "border bg-background hover:bg-muted"
              }`}
            >
              活きエサあり
            </button>
            <button
              onClick={() => setFilterFrozenBait(!filterFrozenBait)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filterFrozenBait
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border bg-background hover:bg-muted"
              }`}
            >
              冷凍エサあり
            </button>
            <button
              onClick={() => setFilterRental(!filterRental)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filterRental
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "border bg-background hover:bg-muted"
              }`}
            >
              レンタルロッド
            </button>
            <button
              onClick={() => setFilterParking(!filterParking)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filterParking
                  ? "bg-amber-600 text-white shadow-sm"
                  : "border bg-background hover:bg-muted"
              }`}
            >
              駐車場あり
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <X className="size-3" />
            フィルタをクリア
          </button>
        )}
      </div>

      {/* 結果カウント */}
      <p className="mb-4 text-sm text-muted-foreground">
        {hasActiveFilters ? (
          <>
            {filterLabel && (
              <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <MapPin className="size-3" />
                {filterLabel}
              </span>
            )}
            <span className="font-bold text-foreground">{filteredShops.length}</span>件の釣具店が見つかりました
          </>
        ) : (
          <>全国<span className="font-bold text-foreground">{shops.length}</span>件の釣具店</>
        )}
      </p>

      {/* 店舗一覧 */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {filteredShops.map((shop) => (
          <Link
            key={shop.id}
            href={`/shops/${shop.slug}`}
            className="group block"
          >
            <Card className="h-full transition-shadow hover:shadow-md group-hover:border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-snug transition-colors group-hover:text-primary">
                    {shop.name}
                  </CardTitle>
                  <ChevronRight className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {shop.region.prefecture} · {shop.region.areaName}エリア
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-1">{shop.address}</span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ナビ
                  </a>
                </div>
                {shop.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 shrink-0 text-muted-foreground" />
                    <span>{shop.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-1">{shop.businessHours}</span>
                </div>
                {shop.isPremium && (
                  <div className="pt-1">
                    <Badge className="bg-amber-100 text-xs text-amber-700 hover:bg-amber-100">公式</Badge>
                  </div>
                )}
                <p className="line-clamp-2 pt-1 text-sm text-muted-foreground">
                  {shop.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">該当する釣具店が見つかりませんでした</p>
          <button onClick={clearFilters} className="mt-2 text-sm text-primary hover:underline">
            フィルタをクリアして全件表示
          </button>
        </div>
      )}
    </div>
  );
}
