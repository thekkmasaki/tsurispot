'use client';

import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fishingSpots } from '@/lib/data/spots';
import Link from 'next/link';
import { Star } from 'lucide-react';
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

export function SpotMap() {
  const [selectedPrefectures, setSelectedPrefectures] = useState<Set<string>>(new Set());

  const togglePrefecture = (pref: string) => {
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

  const filteredSpots = useMemo(
    () =>
      selectedPrefectures.size === 0
        ? fishingSpots
        : fishingSpots.filter((s) => selectedPrefectures.has(s.region.prefecture)),
    [selectedPrefectures]
  );

  // ズーム挙動: 0県→全体、1県→その県、2県以上→バウンディングボックス中心
  const { mapCenter, mapZoom } = useMemo((): { mapCenter: [number, number]; mapZoom: number } => {
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
  }, [selectedPrefectures, filteredSpots]);

  return (
    <div className="space-y-3">
      {/* Region filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">地域:</span>
          <button
            onClick={() => setSelectedPrefectures(new Set())}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] sm:text-sm ${
              selectedPrefectures.size === 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            すべて
          </button>
          {selectedPrefectures.size > 0 && (
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
                  <span className="text-xs text-gray-500">({spot.reviewCount}件)</span>
                </div>
                <Link
                  href={`/spots/${spot.slug}`}
                  className="mt-1 inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
