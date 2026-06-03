'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.heat';
import { Navigation, Loader2, Fish, ChevronDown, ChevronUp, SlidersHorizontal, MapPin, Flame, List, Info } from 'lucide-react';
import { DIFFICULTY_LABELS, SPOT_TYPE_LABELS } from '@/types';
import type { MapSpot } from '@/types';
import { getCurrentCrowdBadge, CROWD_LABELS } from '@/lib/crowd-prediction';
import type { CrowdPrediction, CrowdLevel } from '@/lib/crowd-prediction';
import { markerIconHtml, SPOT_TYPE_COLORS, CROWD_LEVEL_HEX } from '@/lib/map-marker';
import { getFavorites } from '@/hooks/use-favorites';
import { SpotSearch } from '@/components/map/spot-search';
import { SpotMapList } from '@/components/map/spot-map-list';
import { MapAffiliateRecommend } from '@/components/map/map-affiliate-recommend';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const prefectureCenters: Record<string, { center: [number, number]; zoom: number }> = {
  '神奈川県': { center: [35.35, 139.55], zoom: 10 },
  '東京都': { center: [35.68, 139.77], zoom: 10 },
  '千葉県': { center: [35.33, 140.18], zoom: 9 },
  '大阪府': { center: [34.55, 135.35], zoom: 10 },
  '兵庫県': { center: [34.70, 135.15], zoom: 9 },
  '京都府': { center: [35.55, 135.30], zoom: 9 },
};

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

function FlyToHandler({
  target,
}: {
  target: { lat: number; lng: number; zoom: number; tick: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

const userIcon = new L.DivIcon({
  html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function heartSvg(filled: boolean): string {
  const fill = filled ? '#ef4444' : 'none';
  const stroke = filled ? '#ef4444' : '#9ca3af';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>`;
}

function buildPopupHtml(spot: MapSpot, isFav: boolean, crowd: CrowdPrediction | null): string {
  const fishBadges = spot.fishNames
    .slice(0, 3)
    .map(
      (name) =>
        `<span style="display:inline-block;padding:2px 6px;border-radius:4px;background:#ffedd5;color:#9a3412;font-size:10px;margin-right:4px;margin-top:2px">${escapeHtml(name)}</span>`
    )
    .join('');
  const moreFish =
    spot.fishNames.length > 3
      ? `<span style="display:inline-block;color:#6b7280;font-size:10px">+${spot.fishNames.length - 3}種</span>`
      : '';
  const img = spot.mainImageUrl
    ? `<img src="${escapeHtml(spot.mainImageUrl)}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:6px" loading="lazy" onerror="this.style.display='none'" />`
    : '';
  const free = spot.isFree
    ? `<span style="display:inline-block;padding:2px 6px;border-radius:4px;background:#dcfce7;color:#166534;font-size:10px;margin-left:4px">無料</span>`
    : '';
  const crowdRow = crowd
    ? `<div style="margin-top:6px"><span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:9999px;background:#f3f4f6;color:${CROWD_LEVEL_HEX[crowd.level]};font-size:11px;font-weight:600"><span style="width:7px;height:7px;border-radius:50%;background:${CROWD_LEVEL_HEX[crowd.level]}"></span>いま ${escapeHtml(crowd.label)}</span></div>`
    : '';

  return `
    <div role="dialog" aria-label="${escapeHtml(spot.name)}の詳細" style="min-width:240px;padding:4px">
      ${img}
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <h3 style="margin:0;font-size:14px;font-weight:700;line-height:1.3;color:#111827">${escapeHtml(spot.name)}</h3>
        <button data-fav-slug="${escapeHtml(spot.slug)}" data-fav-state="${isFav ? '1' : '0'}" aria-label="お気に入り" aria-pressed="${isFav ? 'true' : 'false'}" style="background:none;border:none;cursor:pointer;padding:2px;flex-shrink:0;line-height:0">${heartSvg(isFav)}</button>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;color:#4b5563;flex-wrap:wrap">
        <span>${escapeHtml(spot.region.prefecture)} ${escapeHtml(spot.region.areaName)}</span>
        <span style="display:inline-block;padding:2px 6px;border-radius:4px;background:#e5e7eb;color:#374151;font-size:10px">${escapeHtml(DIFFICULTY_LABELS[spot.difficulty])}</span>
        ${free}
      </div>
      <div style="display:flex;align-items:center;gap:4px;margin-top:6px;font-size:13px;color:#111827">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span style="font-weight:600">${spot.rating.toFixed(1)}</span>
      </div>
      ${crowdRow}
      ${
        fishBadges
          ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap;align-items:center;gap:2px">${fishBadges}${moreFish}</div>`
          : ''
      }
      <a href="/spots/${escapeHtml(spot.slug)}" style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%;padding:8px 16px;border-radius:8px;background:#1d4ed8;color:#fff;font-size:13px;font-weight:700;text-decoration:none;margin-top:10px">詳細を見る →</a>
    </div>
  `;
}

function clusterIconHtml(count: number): string {
  let bg = '#3b82f6';
  let size = 36;
  if (count >= 100) {
    bg = '#1e3a8a';
    size = 52;
  } else if (count >= 25) {
    bg = '#1d4ed8';
    size = 44;
  } else if (count >= 10) {
    bg = '#2563eb';
    size = 40;
  }
  return `<div style="background:${bg};color:#fff;border:3px solid #fff;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${count}</div>`;
}

function HeatLayer({
  spots,
  enabled,
  catchCounts,
}: {
  spots: MapSpot[];
  enabled: boolean;
  catchCounts: Record<string, number> | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || spots.length === 0) return;

    // 釣果データがあればそれを優先、無ければ rating×reviewCount にフォールバック
    const useCatch = catchCounts && Object.keys(catchCounts).length > 0;
    const maxCatch = useCatch ? Math.max(1, ...Object.values(catchCounts!)) : 0;

    const points: [number, number, number][] = spots.map((s) => {
      let intensity: number;
      if (useCatch) {
        const c = catchCounts![s.slug] ?? 0;
        // 対数スケールで正規化（0件のスポットも僅かに表示しないよう 0.05 を下限）
        intensity = c > 0 ? Math.min(1, Math.log10(c + 1) / Math.log10(maxCatch + 1)) : 0.05;
      } else {
        const rating = Math.max(0, Math.min(5, s.rating || 3));
        const reviews = Math.max(0, s.reviewCount || 0);
        intensity = Math.min(
          1,
          (rating / 5) * (Math.log10(reviews + 1) / Math.log10(101))
        );
        intensity = Math.max(0.1, intensity);
      }
      return [s.latitude, s.longitude, intensity];
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heat = (L as any).heatLayer(points, {
      radius: 28,
      blur: 38,
      maxZoom: 11,
      max: 1.0,
      gradient: {
        0.2: '#3b82f6',
        0.4: '#10b981',
        0.6: '#f59e0b',
        0.8: '#ef4444',
        1.0: '#dc2626',
      },
    });

    map.addLayer(heat);
    return () => {
      map.removeLayer(heat);
    };
  }, [spots, enabled, catchCounts, map]);

  return null;
}

function ClusteredSpotMarkers({ spots }: { spots: MapSpot[] }) {
  const map = useMap();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      chunkedLoading: true,
      chunkInterval: 100,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount();
        const size = count >= 100 ? 52 : count >= 25 ? 44 : count >= 10 ? 40 : 36;
        return L.divIcon({
          html: clusterIconHtml(count),
          className: '',
          iconSize: [size, size],
        });
      },
    });

    const favs = new Set(getFavorites());
    spots.forEach((spot) => {
      // 管理釣り場は営業時間ベースで混雑予想が無意味なので出さない。
      const crowd = spot.isManagedPond
        ? null
        : getCurrentCrowdBadge({
            rating: spot.rating,
            isFree: spot.isFree,
            difficulty: spot.difficulty,
            prefecture: spot.region.prefecture,
            hasParking: spot.hasParking,
            reviewCount: spot.reviewCount,
          });
      const marker = L.marker([spot.latitude, spot.longitude], {
        icon: L.divIcon({
          html: markerIconHtml(spot.spotType, crowd ? crowd.level : null),
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -10],
        }),
      });
      marker.bindPopup(() => buildPopupHtml(spot, favs.has(spot.slug), crowd), {
        maxWidth: 280,
        autoPan: true,
      });
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
    };
  }, [spots, map]);

  // お気に入りクリックのイベントデリゲーション
  useEffect(() => {
    const STORAGE_KEY = 'tsurispot-favorites';
    const handler = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest('[data-fav-slug]') as HTMLElement | null;
      if (!target) return;
      const slug = target.dataset.favSlug;
      if (!slug) return;
      e.preventDefault();
      e.stopPropagation();

      let current: string[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        current = raw ? JSON.parse(raw) : [];
      } catch {
        current = [];
      }
      const isCurrentlyFav = current.includes(slug);
      const next = isCurrentlyFav ? current.filter((s) => s !== slug) : [...current, slug];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('favorites-updated'));
      fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action: isCurrentlyFav ? 'decrement' : 'increment' }),
      }).catch(() => {});

      // この popup の DOM を即時更新（再開時にも反映）
      const newFav = !isCurrentlyFav;
      target.dataset.favState = newFav ? '1' : '0';
      target.setAttribute('aria-pressed', newFav ? 'true' : 'false');
      target.innerHTML = heartSvg(newFav);
    };
    const container = map.getContainer();
    container.addEventListener('click', handler, true);
    return () => container.removeEventListener('click', handler, true);
  }, [map]);

  return null;
}

export function SpotMap({ spots }: { spots: MapSpot[] }) {
  const [selectedPrefectures, setSelectedPrefectures] = useState<Set<string>>(new Set());
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [selectedFish, setSelectedFish] = useState<Set<string>>(new Set());
  const [showAllFish, setShowAllFish] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [heatEnabled, setHeatEnabled] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [catchCounts, setCatchCounts] = useState<Record<string, number> | null>(null);

  // ヒートマップ ON 時に釣果カウントを 1 回だけ取得（CDN キャッシュ前提）
  useEffect(() => {
    if (!heatEnabled || catchCounts !== null) return;
    fetch('/api/catch-report/all-counts')
      .then((r) => (r.ok ? r.json() : { counts: {} }))
      .then((d: { counts?: Record<string, number> }) => {
        setCatchCounts(d.counts ?? {});
      })
      .catch(() => setCatchCounts({}));
  }, [heatEnabled, catchCounts]);
  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
    tick: number;
  } | null>(null);

  const handleSearchSelect = useCallback((spot: MapSpot) => {
    setFlyTarget({
      lat: spot.latitude,
      lng: spot.longitude,
      zoom: 14,
      tick: Date.now(),
    });
  }, []);

  const handleListSelect = useCallback((spot: MapSpot) => {
    setFlyTarget({
      lat: spot.latitude,
      lng: spot.longitude,
      zoom: 14,
      tick: Date.now(),
    });
    setListOpen(false);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      if (mobile) setFiltersOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setNearbyMode(true);
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
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

  const availableAreasByPref = useMemo(() => {
    if (selectedPrefectures.size === 0) return [];
    const prefAreaMap = new Map<string, Map<string, number>>();
    spots
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
  }, [selectedPrefectures, spots]);

  const totalAreaCount = useMemo(
    () => availableAreasByPref.reduce((sum, g) => sum + g.areas.length, 0),
    [availableAreasByPref]
  );

  const locationFilteredSpots = useMemo(() => {
    if (nearbyMode && userLocation) {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const nearby = spots
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
      if (nearby.length === 0) return spots;
      return nearby;
    }
    if (selectedPrefectures.size === 0) return spots;
    const prefFiltered = spots.filter((s) =>
      selectedPrefectures.has(s.region.prefecture)
    );
    if (selectedAreas.size === 0) return prefFiltered;
    return prefFiltered.filter((s) => selectedAreas.has(s.region.areaName));
  }, [selectedPrefectures, selectedAreas, nearbyMode, userLocation, spots]);

  const availableFish = useMemo(() => {
    const fishMap = new Map<string, { name: string; slug: string; count: number }>();
    locationFilteredSpots.forEach((s) => {
      s.fishSlugs.forEach((slug, i) => {
        const name = s.fishNames[i];
        if (!slug || !name) return;
        const existing = fishMap.get(slug);
        if (existing) {
          existing.count++;
        } else {
          fishMap.set(slug, { name, slug, count: 1 });
        }
      });
    });
    return Array.from(fishMap.values()).sort((a, b) => b.count - a.count);
  }, [locationFilteredSpots]);

  const filteredSpots = useMemo(() => {
    if (selectedFish.size === 0) return locationFilteredSpots;
    return locationFilteredSpots.filter((s) =>
      s.fishSlugs.some((slug) => selectedFish.has(slug))
    );
  }, [locationFilteredSpots, selectedFish]);

  // リストSheet上部のアフィリエイト導線用に、表示中スポットから釣れる魚・釣り方を頻度集計（上位）する。
  const listAffiliateContext = useMemo(() => {
    const fishCount = new Map<string, number>();
    const methodCount = new Map<string, number>();
    const prefCount = new Map<string, number>();
    let isNight = false;
    filteredSpots.forEach((s) => {
      s.fishNames.forEach((n) => fishCount.set(n, (fishCount.get(n) ?? 0) + 1));
      s.methods.forEach((m) => methodCount.set(m, (methodCount.get(m) ?? 0) + 1));
      prefCount.set(s.region.prefecture, (prefCount.get(s.region.prefecture) ?? 0) + 1);
      if (s.isNightFishing) isNight = true;
    });
    const top = (m: Map<string, number>, n: number) =>
      Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([k]) => k);
    return {
      fishNames: top(fishCount, 6),
      methods: top(methodCount, 6),
      prefecture: top(prefCount, 1)[0],
      isNightFishing: isNight,
    };
  }, [filteredSpots]);

  const { mapCenter, mapZoom } = useMemo((): {
    mapCenter: [number, number];
    mapZoom: number;
  } => {
    if (nearbyMode && userLocation) {
      if (locationFilteredSpots.length === spots.length) {
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
        return {
          mapCenter: prefectureCenters[pref].center,
          mapZoom: prefectureCenters[pref].zoom,
        };
      }
    }
    if (filteredSpots.length > 0) {
      const lats = filteredSpots.map((s) => s.latitude);
      const lngs = filteredSpots.map((s) => s.longitude);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      return { mapCenter: [centerLat, centerLng], mapZoom: 8 };
    }
    return { mapCenter: DEFAULT_CENTER, mapZoom: DEFAULT_ZOOM };
  }, [selectedPrefectures, filteredSpots, nearbyMode, userLocation, locationFilteredSpots, spots]);

  const nearbyEmpty =
    nearbyMode && userLocation && locationFilteredSpots.length === spots.length;

  return (
    <div className="space-y-2">
      <SpotSearch spots={spots} onSelect={handleSearchSelect} />
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="map-filters"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          <SlidersHorizontal className="size-4" />
          フィルター
          {filtersOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          {(selectedPrefectures.size > 0 || selectedFish.size > 0 || nearbyMode) && (
            <span className="ml-1 flex size-2 rounded-full bg-blue-600" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setListOpen(true)}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors min-h-[36px] hover:bg-muted/80 hover:text-foreground sm:text-sm"
            title="フィルタ済みのスポットをリスト表示"
          >
            <List className="size-3.5" />
            <span className="hidden sm:inline">リスト</span>
          </button>
          <button
            onClick={() => setHeatEnabled((v) => !v)}
            aria-pressed={heatEnabled}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] sm:text-sm ${
              heatEnabled
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-orange-100 hover:text-orange-700'
            }`}
            title="釣果ヒート（釣果データを優先、無い場合は人気度を表示）"
          >
            <Flame className="size-3.5" />
            <span>ヒート</span>
          </button>
          <button
            onClick={() => setLegendOpen((v) => !v)}
            aria-pressed={legendOpen}
            aria-controls="map-legend"
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] sm:text-sm ${
              legendOpen
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
            title="マーカーの色の凡例"
          >
            <Info className="size-3.5" />
            <span className="hidden sm:inline">凡例</span>
          </button>
          <div
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            <span className="font-medium tabular-nums">{filteredSpots.length.toLocaleString()}件</span>
            <span className="hidden sm:inline">のスポットを表示中</span>
          </div>
        </div>
      </div>

      {legendOpen && (
        <div
          id="map-legend"
          className="space-y-2 rounded-lg border bg-card p-3 text-xs"
          aria-label="マーカーの色の凡例"
        >
          <div>
            <p className="mb-1 font-medium text-muted-foreground">スポットの種類（マーカーの色）</p>
            <ul role="list" className="flex flex-wrap gap-x-3 gap-y-1.5">
              {(Object.keys(SPOT_TYPE_LABELS) as (keyof typeof SPOT_TYPE_LABELS)[]).map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span
                    className="size-3 shrink-0 rounded-full border border-white shadow-sm"
                    style={{ background: SPOT_TYPE_COLORS[t] }}
                  />
                  {SPOT_TYPE_LABELS[t]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 font-medium text-muted-foreground">
              いまの混雑（マーカー右上のドット）
            </p>
            <ul role="list" className="flex flex-wrap gap-x-3 gap-y-1.5">
              {(Object.keys(CROWD_LABELS) as CrowdLevel[]).map((lv) => (
                <li key={lv} className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: CROWD_LEVEL_HEX[lv] }}
                  />
                  {CROWD_LABELS[lv].label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {filtersOpen && (
        <div
          id="map-filters"
          role="group"
          aria-label="スポットの絞り込み"
          className="space-y-2 rounded-lg border bg-card p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground sm:text-sm">地域:</span>
            <button
              onClick={() => {
                setSelectedPrefectures(new Set());
                setSelectedAreas(new Set());
                setSelectedFish(new Set());
                setShowAllFish(false);
                setNearbyMode(false);
              }}
              aria-pressed={selectedPrefectures.size === 0 && !nearbyMode}
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
              {locating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Navigation className="size-3.5" />
              )}
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
            <div
              key={group.label}
              role="group"
              aria-label={`${group.label}の都道府県で絞り込み`}
              className="flex flex-wrap items-center gap-1.5"
            >
              <span className="w-14 shrink-0 text-[10px] font-medium text-muted-foreground sm:text-xs">
                {group.label}
              </span>
              {group.prefectures.map((pref) => (
                <button
                  key={pref}
                  onClick={() => togglePrefecture(pref)}
                  aria-pressed={selectedPrefectures.has(pref)}
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
          {availableAreasByPref.length > 0 && !nearbyMode && (
            <div className="space-y-1.5 rounded-lg bg-muted/50 p-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                  エリア
                </span>
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
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {selectedAreas.size}エリア選択中
                  </span>
                )}
                {totalAreaCount > 10 && (
                  <button
                    onClick={() => setShowAllAreas((v) => !v)}
                    className="ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground sm:text-xs"
                  >
                    {showAllAreas ? (
                      <>
                        閉じる <ChevronUp className="size-3" />
                      </>
                    ) : (
                      <>
                        すべて表示 <ChevronDown className="size-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
              {availableAreasByPref.map(({ prefecture, areas }) => {
                const displayAreas = showAllAreas ? areas : areas.slice(0, 8);
                const hiddenCount = areas.length - displayAreas.length;
                return (
                  <div key={prefecture} className="flex flex-wrap items-center gap-1.5">
                    <span className="w-14 shrink-0 text-[10px] font-medium text-emerald-700 sm:text-xs">
                      {prefecture === '北海道'
                        ? '北海道'
                        : prefecture.replace(/[都道府県]$/, '')}
                    </span>
                    {displayAreas.map(({ name, count }) => (
                      <button
                        key={name}
                        onClick={() => toggleArea(name)}
                        aria-pressed={selectedAreas.has(name)}
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
          {availableFish.length > 0 && (
            <div
              role="group"
              aria-label="魚種で絞り込み"
              className="flex flex-wrap items-center gap-1.5 rounded-lg bg-orange-50 p-2"
            >
              <span className="flex w-14 shrink-0 items-center gap-0.5 text-[10px] font-medium text-orange-700 sm:text-xs">
                <Fish className="size-3" aria-hidden="true" />
                魚種
              </span>
              <button
                onClick={() => setSelectedFish(new Set())}
                aria-pressed={selectedFish.size === 0}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors min-h-[28px] sm:text-xs ${
                  selectedFish.size === 0
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-orange-700 hover:bg-orange-100'
                }`}
              >
                すべて
              </button>
              {(showAllFish ? availableFish : availableFish.slice(0, 20)).map(
                ({ name, slug, count }) => (
                  <button
                    key={slug}
                    onClick={() => toggleFish(slug)}
                    aria-pressed={selectedFish.has(slug)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors min-h-[28px] sm:text-xs ${
                      selectedFish.has(slug)
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    {name}
                    <span className="ml-0.5 text-[9px] opacity-60">({count})</span>
                  </button>
                )
              )}
              {availableFish.length > 20 && (
                <button
                  onClick={() => setShowAllFish((v) => !v)}
                  className="flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[10px] font-medium text-orange-600 hover:bg-orange-100 min-h-[28px] sm:text-xs"
                >
                  {showAllFish ? (
                    <>
                      閉じる <ChevronUp className="size-3" />
                    </>
                  ) : (
                    <>
                      他{availableFish.length - 20}種 <ChevronDown className="size-3" />
                    </>
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
        <FlyToHandler target={flyTarget} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && nearbyMode && (
          <>
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <span className="text-sm font-medium">現在地</span>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={30000}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.05,
                weight: 1,
              }}
            />
          </>
        )}
        <HeatLayer spots={filteredSpots} enabled={heatEnabled} catchCounts={catchCounts} />
        <ClusteredSpotMarkers spots={filteredSpots} />
      </MapContainer>

      <Sheet open={listOpen} onOpenChange={setListOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2 text-base">
              <List className="size-4 text-primary" />
              スポット一覧
              <span className="text-xs font-normal text-muted-foreground">
                {filteredSpots.length.toLocaleString()}件
              </span>
            </SheetTitle>
            <SheetDescription className="text-xs">
              カードをタップすると地図がそのスポットに移動します。
            </SheetDescription>
          </SheetHeader>
          <MapAffiliateRecommend
            methods={listAffiliateContext.methods}
            fishNames={listAffiliateContext.fishNames}
            isNightFishing={listAffiliateContext.isNightFishing}
            prefecture={listAffiliateContext.prefecture}
            spotCount={filteredSpots.length}
          />
          <SpotMapList spots={filteredSpots} onSelect={handleListSelect} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
