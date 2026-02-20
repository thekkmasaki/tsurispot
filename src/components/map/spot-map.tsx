'use client';

import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fishingSpots } from '@/lib/data/spots';
import { tackleShops } from '@/lib/data/shops';
import { regions } from '@/lib/data/regions';
import Link from 'next/link';
import { Star, Store } from 'lucide-react';
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

const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useMemo(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export function SpotMap() {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const [showShops, setShowShops] = useState(true);

  const prefectures = Array.from(new Set(regions.map((r) => r.prefecture)));

  const filteredSpots = selectedPrefecture
    ? fishingSpots.filter((s) => s.region.prefecture === selectedPrefecture)
    : fishingSpots;

  const filteredShops = selectedPrefecture
    ? tackleShops.filter((s) => s.region.prefecture === selectedPrefecture)
    : tackleShops;

  const mapCenter = selectedPrefecture && prefectureCenters[selectedPrefecture]
    ? prefectureCenters[selectedPrefecture].center
    : DEFAULT_CENTER;

  const mapZoom = selectedPrefecture && prefectureCenters[selectedPrefecture]
    ? prefectureCenters[selectedPrefecture].zoom
    : DEFAULT_ZOOM;

  return (
    <div className="space-y-3">
      {/* Region filter */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="mr-1 text-xs font-medium text-muted-foreground sm:text-sm">地域:</span>
        <button
          onClick={() => setSelectedPrefecture('')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] sm:text-sm ${
            !selectedPrefecture
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          すべて
        </button>
        {prefectures.map((pref) => (
          <button
            key={pref}
            onClick={() => setSelectedPrefecture(selectedPrefecture === pref ? '' : pref)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] sm:text-sm ${
              selectedPrefecture === pref
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {pref}
          </button>
        ))}
      </div>

      {/* Shop toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showShops}
            onChange={(e) => setShowShops(e.target.checked)}
            className="rounded"
          />
          <Store className="size-4 text-emerald-600" />
          <span className="text-muted-foreground">釣具店を表示</span>
        </label>
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
        {showShops && filteredShops.map((shop) => (
          <Marker key={shop.id} position={[shop.latitude, shop.longitude]} icon={shopIcon}>
            <Popup>
              <div className="min-w-[200px] space-y-2 p-1">
                <div className="flex items-center gap-1.5">
                  <Store className="size-4 text-emerald-600" />
                  <h3 className="text-sm font-bold leading-tight">{shop.name}</h3>
                </div>
                <p className="text-xs text-gray-600">{shop.businessHours}（定休: {shop.closedDays}）</p>
                <div className="flex flex-wrap gap-1">
                  {shop.hasLiveBait && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">活きエサ</span>
                  )}
                  {shop.hasFrozenBait && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">冷凍エサ</span>
                  )}
                  {shop.hasRentalRod && (
                    <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-700">レンタル竿</span>
                  )}
                </div>
                <Link
                  href={`/shops/${shop.slug}`}
                  className="mt-1 inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  店舗情報 &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
