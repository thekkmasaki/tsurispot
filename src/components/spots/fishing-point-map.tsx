'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface FishingPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  fish: { name: string; method: string; season: string; difficulty: 'easy' | 'medium' | 'hard' }[];
  depth?: string;
  features?: string[];
  icon: 'hot' | 'good' | 'facility' | 'parking';
}

export interface FishingPointMapProps {
  spotName: string;
  center: [number, number];
  zoom?: number;
  points: FishingPoint[];
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};
const DIFFICULTY_LABELS = { easy: '初心者OK', medium: '中級者向け', hard: '上級者向け' };

function createIcon(type: FishingPoint['icon']) {
  const config = {
    hot: { emoji: '🔥', bg: '#ef4444', border: '#dc2626' },
    good: { emoji: '🐟', bg: '#3b82f6', border: '#2563eb' },
    facility: { emoji: '🏪', bg: '#8b5cf6', border: '#7c3aed' },
    parking: { emoji: '🅿️', bg: '#6b7280', border: '#4b5563' },
  };
  const c = config[type];
  return L.divIcon({
    className: 'fishing-point-marker',
    html: `<div style="
      background:${c.bg};border:3px solid ${c.border};border-radius:50%;
      width:40px;height:40px;display:flex;align-items:center;justify-content:center;
      font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;
      transition:transform 0.2s;
    " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${c.emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

function FitBounds({ points }: { points: FishingPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map(p => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    }
  }, [map, points]);
  return null;
}

export function FishingPointMap({ spotName, center, zoom = 17, points }: FishingPointMapProps) {
  const [activePoint, setActivePoint] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block size-3 rounded-full bg-red-500" />一級ポイント</span>
        <span className="flex items-center gap-1"><span className="inline-block size-3 rounded-full bg-blue-500" />釣りポイント</span>
        <span className="flex items-center gap-1"><span className="inline-block size-3 rounded-full bg-violet-500" />施設</span>
        <span className="flex items-center gap-1"><span className="inline-block size-3 rounded-full bg-gray-500" />駐車場</span>
      </div>
      <div className="relative overflow-hidden rounded-xl border shadow-sm" style={{ height: '450px' }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"
            attribution="出典: 国土地理院"
            maxZoom={18}
          />
          <FitBounds points={points} />
          {points.map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={createIcon(point.icon)}
              eventHandlers={{
                click: () => setActivePoint(point.id),
              }}
            >
              <Popup maxWidth={320} minWidth={260}>
                <div className="fishing-point-popup">
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px', color: '#1e293b' }}>
                    {point.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    {point.description}
                  </div>
                  {point.depth && (
                    <div style={{ fontSize: '12px', color: '#0ea5e9', marginBottom: '6px', fontWeight: 600 }}>
                      水深: {point.depth}
                    </div>
                  )}
                  {point.fish.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>
                        釣れる魚:
                      </div>
                      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>魚種</th>
                            <th style={{ padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>釣り方</th>
                            <th style={{ padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>時期</th>
                          </tr>
                        </thead>
                        <tbody>
                          {point.fish.map((f, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '3px 6px', fontWeight: 500 }}>{f.name}</td>
                              <td style={{ padding: '3px 6px', color: '#64748b' }}>{f.method}</td>
                              <td style={{ padding: '3px 6px', color: '#64748b' }}>{f.season}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {point.features && point.features.length > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {point.features.map((f, i) => (
                        <span key={i} style={{
                          fontSize: '10px', padding: '2px 6px', borderRadius: '9999px',
                          background: '#e0f2fe', color: '#0369a1', fontWeight: 500
                        }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ポイント一覧カード */}
      <div className="grid gap-2 sm:grid-cols-2">
        {points.filter(p => p.fish.length > 0).map((point) => (
          <button
            key={point.id}
            className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
              activePoint === point.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
            }`}
            onClick={() => setActivePoint(point.id)}
          >
            <span className="mt-0.5 text-xl">
              {point.icon === 'hot' ? '🔥' : '🐟'}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold">{point.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{point.description}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {point.fish.slice(0, 4).map((f, i) => (
                  <span key={i} className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {f.name}
                  </span>
                ))}
                {point.fish.length > 4 && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    +{point.fish.length - 4}種
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
