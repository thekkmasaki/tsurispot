'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fishingSpots } from '@/lib/data/spots';
import Link from 'next/link';
import { Star, Navigation, Loader2, Heart, Fish, ChevronDown, ChevronUp, SlidersHorizontal, MapPin } from 'lucide-react';
import { DIFFICULTY_LABELS } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/use-favorites';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEFAULT_CENTER: [number, number] = [36.5, 137.0];
const DEFAULT_ZOOM = 5;

// Prefecture center coordinates for zooming
const prefectureCenters: Record<string, { center: [number, number]; zoom: number }> = {
  '神奈川県': { center: [35.35, 139.55], zoom: 10 },
  '東京都': { center: [35.68, 139.77], zoom: 10 },
  '千葉県': { center: [35.33, 140.18], zoom: 9 },
  '大阪府': { center: [34.55, 135.35], zoom: 10 },
  '兵庫県': { center: [34.70, 135.15], zoom: 9 },
  '京都府': { center: [35.55, 135.30], zoom: 9 },
};

// 地方グループ定義
const REGION_GROUPS: { label: string; prefectures: string[] }[] = [
  { label: '北海道', prefectures: ['北海道'] },
  { label: '東北', prefectures: ['青森県', '岩手県', '秋田県', '宮城県', '山形県', '福島県'] },
  { label: '関東', prefectures: ['東京都', '神奈川県', '千葉県', '埼玉県', '茨城県', '栃木県', '群馬県'] },
  { label: '中部', prefectures: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] },
  { label: '近畿', prefectures: ['大阪府', '兵庫県', '京都府', '滋賀県', '奈良県', '和歌山県', '三重県'] },
  { label: '中国', prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] },
  { label: '四国', prefectures: ['香川県', '徳島県', '高知県', '愛媛県'] },
  { label: '九州沖縄', prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] },
];

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useMemo(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

// 現在地用マーカー
const userIcon = new L.DivIcon({
  html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function SpotMap() {
  const [selectedPrefectures, setSelectedPrefectures] = useState<Set<string>>(new Set());
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [selectedFish, setSelectedFish] = useState<Set<string>>(new Set());
  const [showAllFish, setShowAllFish] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  // モバイル判定（デフォルト折りたたみ）
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setFiltersOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // デフォルトで現在地の近くを表示
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setNearbyMode(true);
          setLocating(false);
        },
        () => { setLocating(false); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setNearbyMode(true);
        setSelectedPrefectures(new Set());
        setSelectedFish(new Set());
        setShowAllFish(false);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const toggleFish = (fishSlug: string) => {
    setSelectedFish((prev) => {
      const next = new Set(prev);
      if (next.has(fishSlug)) {
        next.delete(fishSlug);
      } else {
        next.add(fishSlug);
      }
      return next;
    });
  };

  const togglePrefecture = (pref: string) => {
    setNearbyMode(false);
    setSelectedAreas(new Set());
    setSelectedFish(new Set());
    setShowAllFish(false);
    setShowAllAreas(false);
    setSelectedPrefectures((prev) => {
      const next = new Set(prev);
      if (next.has(pref)) {
        next.delete(pref);
      } else {
        next.add(pref);
      }
      return next;
    });
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) {
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  };

  const [showAllAreas, setShowAllAreas] = useState(false);

  // 選択した都道府県内の利用可能なエリア一覧（都道府県別グループ）
  const availableAreasByPref = useMemo(() => {
    if (selectedPrefectures.size === 0) return [];
    const prefAreaMap = new Map<string, Map<string, number>>();
    fishingSpots
      .filter((s) => selectedPrefectures.has(s.region.prefecture))
      .forEach((s) => {
        if (!prefAreaMap.has(s.region.prefecture)) {
          prefAreaMap.set(s.region.prefecture, new Map());
        }
        const areaMap = prefAreaMap.get(s.region.prefecture)!;
        areaMap.set(s.region.areaName, (areaMap.get(s.region.areaName) || 0) + 1);
      });
    return Array.from(prefAreaMap.entries()).map(([pref, areaMap]) => ({
      prefecture: pref,
      areas: Array.from(areaMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    }));
  }, [selectedPrefectures]);

  const totalAreaCount = useMemo(() => availableAreasByPref.reduce((sum, g) => sum + g.areas.length, 0), [availableAreasByPref]);

  // 地域・エリアでフィルタしたスポット（魚種フィルタ前）
  const locationFilteredSpots = useMemo(() => {
    if (nearbyMode && userLocation) {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const nearby = fishingSpots
        .map((s) => {
          const dLat = toRad(s.latitude - userLocation[0]);
          const dLon = toRad(s.longitude - userLocation[1]);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(userLocation[0])) * Math.cos(toRad(s.latitude)) * Math.sin(dLon / 2) ** 2;
          const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return { ...s, _dist: dist };
        })
        .filter((s) => s._dist <= 30)
        .sort((a, b) => a._dist - b._dist);
      // 30km内に0件なら全スポット表示にフォールバック
      if (nearby.length === 0) return fishingSpots;
      return nearby;
    }
    if (selectedPrefectures.size === 0) return fishingSpots;
    const prefFiltered = fishingSpots.filter((s) => selectedPrefectures.has(s.region.prefecture));
    if (selectedAreas.size === 0) return prefFiltered;
    return prefFiltered.filter((s) => selectedAreas.has(s.region.areaName));
  }, [selectedPrefectures, selectedAreas, nearbyMode, userLocation]);

  // 利用可能な魚種リスト（地域フィルタ後のスポットから集計）
  const availableFish = useMemo(() => {
    const fishMap = new Map<string, { name: string; slug: string; count: number }>();
    locationFilteredSpots.forEach((s) => {
      if (s.catchableFish && s.catchableFish.length > 0) {
        s.catchableFish.forEach((cf) => {
          if (cf.fish?.slug && cf.fish?.name) {
            const existing = fishMap.get(cf.fish.slug);
            if (existing) {
              existing.count++;
            } else {
              fishMap.set(cf.fish.slug, { name: cf.fish.name, slug: cf.fish.slug, count: 1 });
            }
          }
        });
      }
    });
    return Array.from(fishMap.values()).sort((a, b) => b.count - a.count);
  }, [locationFilteredSpots]);

  // 魚種フィルタも適用した最終結果
  const filteredSpots = useMemo(() => {
    if (selectedFish.size === 0) return locationFilteredSpots;
    return locationFilteredSpots.filter((s) =>
      s.catchableFish?.some((cf) => cf.fish?.slug && selectedFish.has(cf.fish.slug))
    );
  }, [locationFilteredSpots, selectedFish]);

  const { mapCenter, mapZoom } = useMemo((): { mapCenter: [number, number]; mapZoom: number } => {
    if (nearbyMode && userLocation) {
      // nearbyEmpty（30km内0件）の場合は日本全体を表示
      if (locationFilteredSpots.length === fishingSpots.length) {
        return { mapCenter: DEFAULT_CENTER, mapZoom: DEFAULT_ZOOM };
      }
      return { mapCenter: userLocation, mapZoom: 12 };
    }
    if (selectedPrefectures.size === 0) {
      return { mapCenter: DEFAULT_CENTER, mapZoom: DEFAULT_ZOOM };
    }
    if (selectedPrefectures.size === 1) {
      const pref = Array.from(selectedPrefectures)[0];
      if (prefectureCenters[pref]) {
        return { mapCenter: prefectureCenters[pref].center, mapZoom: prefectureCenters[pref].zoom };
      }
      // prefectureCentersに未登録の県はスポットの平均座標にフォールバック
    }
    // 2県以上、またはprefectureCenters未登録の1県: フィルタ済みスポットのバウンディングボックス中心
    if (filteredSpots.length > 0) {
      const lats = filteredSpots.map((s) => s.latitude);
      const lngs = filteredSpots.map((s) => s.longitude);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      return { mapCenter: [centerLat, centerLng], mapZoom: 8 };
    }
    return { mapCenter: DEFAULT_CENTER, mapZoom: DEFAULT_ZOOM };
  }, [selectedPrefectures, filteredSpots, nearbyMode, userLocation, locationFilteredSpots]);

  // nearbyModeで0件の場合の検出
  const nearbyEmpty = nearbyMode && userLocation && locationFilteredSpots.length === fishingSpots.length;

  return (
    <div className="space-y-2">
      {/* フィルター折りたたみヘッダー + 件数バッジ */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          <SlidersHorizontal className="size-4" />
          フィルター
          {filtersOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          {(selectedPrefectures.size > 0 || selectedFish.size > 0 || nearbyMode) && (
            <span className="ml-1 flex size-2 rounded-full bg-blue-600" />
          )}
        </button>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          <span className="font-medium tabular-nums">{filteredSpots.length.toLocaleString()}件</span>
          <span className="hidden sm:inline">のスポットを表示中</span>
        </div>
      </div>

      {/* 折りたたみ可能なフィルターセクション */}
      {filtersOpen && (
      <div className="space-y-2 rounded-lg border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">地域:</span>
          <button
            onClick={() => { setSelectedPrefectures(new Set()); setSelectedAreas(new Set()); setSelectedFish(new Set()); setShowAllFish(false); setNearbyMode(false); }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] sm:text-sm ${
              selectedPrefectures.size === 0 && !nearbyMode
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            すべて
          </button>
          <button
            onClick={handleLocate}
            disabled={locating}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] sm:text-sm ${
              nearbyMode
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
            }`}
          >
            {locating ? <Loader2 className="size-3.5 animate-spin" /> : <Navigation className="size-3.5" />}
            現在地の近く
          </button>
          {nearbyMode && !nearbyEmpty && (
            <span className="text-xs text-blue-600 font-medium">
              半径30km内 {filteredSpots.length}件
            </span>
          )}
          {nearbyMode && nearbyEmpty && (
            <span className="text-xs text-amber-600 font-medium">
              半径30km内にスポットがないため全表示中
            </span>
          )}
          {!nearbyMode && selectedPrefectures.size > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedPrefectures.size}県選択中
            </span>
          )}
        </div>
        {REGION_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 text-[10px] font-medium text-muted-foreground sm:text-xs">
              {group.label}
            </span>
            {group.prefectures.map((pref) => (
              <button
                key={pref}
                onClick={() => togglePrefecture(pref)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors min-h-[32px] sm:text-xs ${
                  selectedPrefectures.has(pref)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pref === '北海道' ? '北海道' : pref.replace(/[都道府県]$/, '')}
              </button>
            ))}
          </div>
        ))}
        {/* エリアフィルタ（都道府県選択時に表示・都道府県別グループ） */}
        {availableAreasByPref.length > 0 && !nearbyMode && (
          <div className="space-y-1.5 rounded-lg bg-muted/50 p-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">エリア</span>
              <button
                onClick={() => setSelectedAreas(new Set())}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors min-h-[28px] sm:text-xs ${
                  selectedAreas.size === 0
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                すべて
              </button>
              {selectedAreas.size > 0 && (
                <span className="text-[10px] text-emerald-600 font-medium">{selectedAreas.size}エリア選択中</span>
              )}
              {totalAreaCount > 10 && (
                <button
                  onClick={() => setShowAllAreas((v) => !v)}
                  className="ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground sm:text-xs"
                >
                  {showAllAreas ? <>閉じる <ChevronUp className="size-3" /></> : <>すべて表示 <ChevronDown className="size-3" /></>}
                </button>
              )}
            </div>
            {availableAreasByPref.map(({ prefecture, areas }) => {
              const displayAreas = showAllAreas ? areas : areas.slice(0, 8);
              const hiddenCount = areas.length - displayAreas.length;
              return (
                <div key={prefecture} className="flex flex-wrap items-center gap-1.5">
                  <span className="w-14 shrink-0 text-[10px] font-medium text-emerald-700 sm:text-xs">
                    {prefecture === '北海道' ? '北海道' : prefecture.replace(/[都道府県]$/, '')}
                  </span>
                  {displayAreas.map(({ name, count }) => (
                    <button
                      key={name}
                      onClick={() => toggleArea(name)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors min-h-[28px] sm:text-xs ${
                        selectedAreas.has(name)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {name}
                      <span className="ml-0.5 text-[9px] opacity-60">({count})</span>
                    </button>
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => setShowAllAreas(true)}
                      className="text-[10px] text-muted-foreground hover:text-foreground sm:text-xs"
                    >
                      +{hiddenCount}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* 魚種フィルタ */}
        {availableFish.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-orange-50 p-2">
            <span className="flex w-14 shrink-0 items-center gap-0.5 text-[10px] font-medium text-orange-700 sm:text-xs">
              <Fish className="size-3" />
              魚種
            </span>
            <button
              onClick={() => setSelectedFish(new Set())}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors min-h-[28px] sm:text-xs ${
                selectedFish.size === 0
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-orange-700 hover:bg-orange-100'
              }`}
            >
              すべて
            </button>
            {(showAllFish ? availableFish : availableFish.slice(0, 20)).map(({ name, slug, count }) => (
              <button
                key={slug}
                onClick={() => toggleFish(slug)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors min-h-[28px] sm:text-xs ${
                  selectedFish.has(slug)
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-orange-700 hover:bg-orange-100'
                }`}
              >
                {name}
                <span className="ml-0.5 text-[9px] opacity-60">({count})</span>
              </button>
            ))}
            {availableFish.length > 20 && (
              <button
                onClick={() => setShowAllFish((v) => !v)}
                className="flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[10px] font-medium text-orange-600 hover:bg-orange-100 min-h-[28px] sm:text-xs"
              >
                {showAllFish ? (
                  <>閉じる <ChevronUp className="size-3" /></>
                ) : (
                  <>他{availableFish.length - 20}種 <ChevronDown className="size-3" /></>
                )}
              </button>
            )}
            {selectedFish.size > 0 && (
              <span className="text-[10px] text-orange-600 font-medium sm:text-xs">
                {filteredSpots.length}件
              </span>
            )}
          </div>
        )}
      </div>
      )}

      {/* 現在地取得中のローディング表示 */}
      {locating && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Loader2 className="size-4 animate-spin" />
          現在地を取得中...
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-[60vh] w-full rounded-lg sm:h-[70vh] md:h-[80vh]"
        scrollWheelZoom={true}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && nearbyMode && (
          <>
            <Marker position={userLocation} icon={userIcon}>
              <Popup><span className="text-sm font-medium">現在地</span></Popup>
            </Marker>
            <Circle center={userLocation} radius={30000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1 }} />
          </>
        )}
        {filteredSpots.map((spot) => (
          <Marker key={spot.id} position={[spot.latitude, spot.longitude]}>
            <Popup>
              <div className="min-w-[220px] space-y-2 p-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold leading-tight sm:text-base">{spot.name}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(spot.slug); }}
                    aria-label={isFavorite(spot.slug) ? 'お気に入り解除' : 'お気に入り登録'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                  >
                    <Heart
                      className="size-5 transition-transform"
                      style={{
                        fill: isFavorite(spot.slug) ? '#ef4444' : 'none',
                        color: isFavorite(spot.slug) ? '#ef4444' : '#9ca3af',
                      }}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{spot.region.prefecture} {spot.region.areaName}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {DIFFICULTY_LABELS[spot.difficulty]}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{spot.rating}</span>
                </div>
                <Link
                  href={`/spots/${spot.slug}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#1d4ed8', color: '#ffffff', fontSize: '14px', fontWeight: 700, textDecoration: 'none', marginTop: '8px', border: 'none' }}
                >
                  詳細を見る →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
