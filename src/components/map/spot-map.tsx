'use client';

import { useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fishingSpots } from '@/lib/data/spots';
import Link from 'next/link';
import { Star, Navigation, Loader2 } from 'lucide-react';
import { DIFFICULTY_LABELS } from '@/types';
import { Badge } from '@/components/ui/badge';

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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setNearbyMode(true);
        setSelectedPrefectures(new Set());
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const togglePrefecture = (pref: string) => {
    setNearbyMode(false);
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

  const filteredSpots = useMemo(() => {
    if (nearbyMode && userLocation) {
      // 現在地から30km以内のスポットを距離順で表示
      const toRad = (d: number) => (d * Math.PI) / 180;
      return fishingSpots
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
    }
    if (selectedPrefectures.size === 0) return fishingSpots;
    return fishingSpots.filter((s) => selectedPrefectures.has(s.region.prefecture));
  }, [selectedPrefectures, nearbyMode, userLocation]);

  const { mapCenter, mapZoom } = useMemo((): { mapCenter: [number, number]; mapZoom: number } => {
    if (nearbyMode && userLocation) {
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
  }, [selectedPrefectures, filteredSpots, nearbyMode, userLocation]);

  return (
    <div className="space-y-3">
      {/* Region filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">地域:</span>
          <button
            onClick={() => { setSelectedPrefectures(new Set()); setNearbyMode(false); }}
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
          {nearbyMode && (
            <span className="text-xs text-blue-600 font-medium">
              半径30km内 {filteredSpots.length}件
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
                {pref.replace(/[都道府県]$/, '')}
              </button>
            ))}
          </div>
        ))}
      </div>

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
              <div className="min-w-[200px] space-y-2 p-1">
                <h3 className="text-sm font-bold leading-tight sm:text-base">{spot.name}</h3>
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
                  className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95"
                >
                  詳細を見る &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
