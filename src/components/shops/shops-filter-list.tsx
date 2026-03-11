"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
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
  const [filterLiveBait, setFilterLiveBait] = useState(false);
  const [filterRental, setFilterRental] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  // フィルタ適用
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      // テキスト検索
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
      // 地方フィルタ
      if (selectedRegion && !selectedPrefecture) {
        const group = REGION_GROUPS.find((g) => g.name === selectedRegion);
        if (group && !group.prefectures.includes(shop.region.prefecture)) {
          return false;
        }
      }
      // 都道府県フィルタ
      if (selectedPrefecture && shop.region.prefecture !== selectedPrefecture) {
        return false;
      }
      // サービスフィルタ
      if (filterLiveBait && !shop.hasLiveBait) return false;
      if (filterRental && !shop.hasRentalRod) return false;
      return true;
    });
  }, [shops, searchQuery, selectedRegion, selectedPrefecture, filterLiveBait, filterRental]);

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

  const hasActiveFilters = selectedRegion || selectedPrefecture || filterLiveBait || filterRental || searchQuery;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRegion(null);
    setSelectedPrefecture(null);
    setFilterLiveBait(false);
    setFilterRental(false);
  };

  return (
    <div>
      {/* 検索バー */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="店名・エリア・住所で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? "border-primary bg-primary/5 text-primary"
              : "hover:bg-muted"
          }`}
        >
          <SlidersHorizontal className="size-4" />
          <span className="hidden sm:inline">絞り込み</span>
          {hasActiveFilters && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {[selectedRegion, selectedPrefecture, filterLiveBait, filterRental].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* フィルタパネル */}
      {showFilters && (
        <div className="mb-6 rounded-xl border bg-muted/30 p-4">
          {/* 地方フィルタ */}
          <div className="mb-3">
            <p className="mb-2 text-xs font-bold text-muted-foreground">地方で絞り込み</p>
            <div className="flex flex-wrap gap-1.5">
              {REGION_GROUPS.map((group) => (
                <button
                  key={group.name}
                  onClick={() => {
                    if (selectedRegion === group.name) {
                      setSelectedRegion(null);
                      setSelectedPrefecture(null);
                    } else {
                      setSelectedRegion(group.name);
                      setSelectedPrefecture(null);
                    }
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedRegion === group.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border hover:bg-muted"
                  }`}
                >
                  {group.name}
                  <span className="ml-1 opacity-60">{regionCounts[group.name]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 都道府県フィルタ（地方選択時のみ表示） */}
          {selectedRegion && regionPrefectures.length > 1 && (
            <div className="mb-3">
              <p className="mb-2 text-xs font-bold text-muted-foreground">都道府県</p>
              <div className="flex flex-wrap gap-1.5">
                {regionPrefectures.map((pref) => {
                  const count = shops.filter((s) => s.region.prefecture === pref).length;
                  return (
                    <button
                      key={pref}
                      onClick={() =>
                        setSelectedPrefecture(selectedPrefecture === pref ? null : pref)
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        selectedPrefecture === pref
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border hover:bg-muted"
                      }`}
                    >
                      {pref.replace(/[都府県]$/, "")}
                      <span className="ml-1 opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* サービスフィルタ */}
          <div className="mb-2">
            <p className="mb-2 text-xs font-bold text-muted-foreground">サービス</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterLiveBait(!filterLiveBait)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filterLiveBait
                    ? "bg-green-600 text-white"
                    : "bg-background border hover:bg-muted"
                }`}
              >
                🪱 活きエサあり
              </button>
              <button
                onClick={() => setFilterRental(!filterRental)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filterRental
                    ? "bg-blue-600 text-white"
                    : "bg-background border hover:bg-muted"
                }`}
              >
                🎣 レンタルロッド
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs text-primary hover:underline"
            >
              フィルタをクリア
            </button>
          )}
        </div>
      )}

      {/* 結果カウント */}
      <p className="mb-4 text-sm text-muted-foreground">
        {hasActiveFilters ? (
          <>
            <span className="font-bold text-foreground">{filteredShops.length}</span>件の釣具店が見つかりました
            {selectedPrefecture && <span>（{selectedPrefecture}）</span>}
            {selectedRegion && !selectedPrefecture && <span>（{selectedRegion}）</span>}
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
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {shop.hasLiveBait && (
                    <Badge variant="default" className="bg-green-600 text-xs hover:bg-green-700">
                      活きエサ
                    </Badge>
                  )}
                  {shop.hasFrozenBait && (
                    <Badge variant="default" className="bg-blue-600 text-xs hover:bg-blue-700">
                      冷凍エサ
                    </Badge>
                  )}
                  {shop.hasRentalRod && (
                    <Badge variant="outline" className="text-xs">レンタルロッド</Badge>
                  )}
                  {shop.services.some((s) => s.includes("中古")) && (
                    <Badge variant="outline" className="text-xs">中古取扱</Badge>
                  )}
                  {shop.isPremium && (
                    <Badge className="bg-amber-100 text-xs text-amber-700 hover:bg-amber-100">公式</Badge>
                  )}
                </div>
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
