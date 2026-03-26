"use client";

import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

/** タブ切替等で非表示→表示になった際に地図サイズを再計算する */
function InvalidateSizeOnVisible() {
  const map = useMap();
  const containerRef = useRef(map.getContainer());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const timer = setTimeout(() => map.invalidateSize(), 200);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(el);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

/** ズームレベル監視 */
function ZoomWatcher({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  useEffect(() => { onZoomChange(map.getZoom()); }, [map, onZoomChange]);
  return null;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ZoneFish {
  name: string;
  method: string;
  season: string;
  difficulty: string;
  probability: number;
}

interface Zone {
  id: string;
  name: string;
  xRange: [number, number];
  structures: string[];
  seaBottomFeatures: string[];
  estimatedDepth: { shore: number; offshore: number };
  currentFlow: number;
  estimatedFish: ZoneFish[];
  rating: "hot" | "good" | "normal";
}

interface Facility {
  id: string;
  name: string;
  icon: string;
  relativePosition: number;
}

interface DetectedTetrapod {
  lat: number;
  lng: number;
  brightness: number;
}

export interface SpotMapAnalysis {
  coordinates: { lat: number; lng: number };
  zones: Zone[];
  facilities: Facility[];
  structureLength: number;
  structureLabel?: string;
  seaLabel?: string;
  structureEndpoints?: {
    west: { lat: number; lng: number };
    east: { lat: number; lng: number };
  };
  detectedTetrapods?: DetectedTetrapod[];
}

// ---------------------------------------------------------------------------
// 座標変換ヘルパー
// ---------------------------------------------------------------------------

const ZONE_HALF_WIDTH = 0.0003; // 約33m

function makeConverters(data: SpotMapAnalysis) {
  const west = data.structureEndpoints?.west ?? { lat: data.coordinates.lat, lng: data.coordinates.lng - 0.003 };
  const east = data.structureEndpoints?.east ?? { lat: data.coordinates.lat, lng: data.coordinates.lng + 0.003 };
  const lngSpan = east.lng - west.lng;
  const latSpan = east.lat - west.lat;

  const len = Math.sqrt(lngSpan * lngSpan + latSpan * latSpan);
  const perpLng = len > 0 ? (-latSpan / len) * ZONE_HALF_WIDTH : 0;
  const perpLat = len > 0 ? (lngSpan / len) * ZONE_HALF_WIDTH : ZONE_HALF_WIDTH;

  return {
    west, east, lngSpan, latSpan,
    xToLng: (x: number) => west.lng + x * lngSpan,
    xToLat: (x: number) => west.lat + x * latSpan,
    perpLng,
    perpLat,
  };
}

// ---------------------------------------------------------------------------
// 海底地物の日本語変換
// ---------------------------------------------------------------------------

const BOTTOM_FEATURE_LABELS: Record<string, string> = {
  tetrapod: "テトラポッド",
  "reef-stone": "捨て石魚礁",
  "reef-concrete": "コンクリ魚礁",
  "reef-hex": "六角錐魚礁",
  sandy: "砂地",
  rocky: "岩場",
  muddy: "泥底",
  seagrass: "藻場",
};

// ---------------------------------------------------------------------------
// Rating スタイル
// ---------------------------------------------------------------------------

const RATING_STYLE: Record<
  string,
  { color: string; fillColor: string; label: string; emoji: string }
> = {
  hot: {
    color: "#dc2626",
    fillColor: "rgba(220, 38, 38, 0.35)",
    label: "激アツ",
    emoji: "\uD83D\uDD25",
  },
  good: {
    color: "#2563eb",
    fillColor: "rgba(37, 99, 235, 0.25)",
    label: "おすすめ",
    emoji: "\uD83D\uDC4D",
  },
  normal: {
    color: "#6b7280",
    fillColor: "rgba(107, 114, 128, 0.2)",
    label: "普通",
    emoji: "\u25CE",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SpotLeafletMap({ data }: { data: SpotMapAnalysis }) {
  const [zoom, setZoom] = useState(16);
  const handleZoom = useCallback((z: number) => setZoom(z), []);

  const { xToLng, xToLat, perpLng, perpLat, west, east } = useMemo(
    () => makeConverters(data),
    [data]
  );

  // 構造物ラインの座標（護岸を線で表示）
  const structureLine: [number, number][] = useMemo(
    () => [[west.lat, west.lng], [east.lat, east.lng]],
    [west, east]
  );

  // Zone polygons
  const zoneBounds = useMemo(
    () =>
      data.zones.map((zone) => {
        const x0 = zone.xRange[0];
        const x1 = zone.xRange[1];

        const wLat = xToLat(x0);
        const wLng = xToLng(x0);
        const eLat = xToLat(x1);
        const eLng = xToLng(x1);

        // 海側に多めにオフセット（陸側30%:海側70%）→ 護岸の上にゾーンが乗る
        const landFactor = 0.3;
        const seaFactor = 0.7;
        const positions: [number, number][] = [
          [wLat + perpLat * landFactor, wLng + perpLng * landFactor],
          [eLat + perpLat * landFactor, eLng + perpLng * landFactor],
          [eLat - perpLat * seaFactor, eLng - perpLng * seaFactor],
          [wLat - perpLat * seaFactor, wLng - perpLng * seaFactor],
        ];

        const center: [number, number] = [
          (wLat + eLat) / 2,
          (wLng + eLng) / 2,
        ];

        return { zone, positions, center };
      }),
    [data.zones, xToLng, xToLat, perpLng, perpLat]
  );

  // Facility markers（陸側に配置）
  const facilityMarkers = useMemo(
    () =>
      data.facilities.map((fac) => {
        const x = fac.relativePosition;
        const lat = xToLat(x) + ZONE_HALF_WIDTH + 0.00025; // 陸側に少しオフセット
        const lng = xToLng(x);
        return { fac, position: [lat, lng] as [number, number] };
      }),
    [data.facilities, xToLat, xToLng, perpLat, perpLng]
  );

  // ズームレベルに応じたラベル表示制御
  const showZoneNames = zoom >= 16;
  const showFishLabels = zoom >= 17;

  return (
    <div className="overflow-hidden rounded-lg border">
      <MapContainer
        center={[data.coordinates.lat, data.coordinates.lng]}
        zoom={16}
        style={{ height: "480px", width: "100%" }}
        scrollWheelZoom={true}
      >
        <InvalidateSizeOnVisible />
        <ZoomWatcher onZoomChange={handleZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* 構造物ライン（護岸を太線で表示） */}
        <Polyline
          positions={structureLine}
          pathOptions={{ color: "#92400e", weight: 4, opacity: 0.7, dashArray: "8, 4" }}
        >
          <Tooltip direction="top" sticky>
            <span className="text-xs font-bold">{data.structureLabel || "護岸"}</span>
          </Tooltip>
        </Polyline>

        {/* ゾーンポリゴン */}
        {zoneBounds.map(({ zone, positions, center }, idx) => {
          const style = RATING_STYLE[zone.rating] || RATING_STYLE.normal;
          const topFish = [...zone.estimatedFish]
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5);

          return (
            <Polygon
              key={zone.id}
              positions={positions}
              pathOptions={{
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity: 0.5,
                weight: 2,
              }}
            >
              {/* ゾーン名: zoom>=16で表示、コンパクトに */}
              {showZoneNames && (
                <Tooltip direction="center" permanent className="zone-tooltip">
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: style.color,
                    textShadow: "0 0 3px white, 0 0 3px white, 0 0 3px white",
                    whiteSpace: "nowrap",
                  }}>
                    {zone.rating === "hot" ? "\uD83D\uDD25" : ""}{zone.name.replace("エリア", "")}
                  </span>
                </Tooltip>
              )}
              <Popup maxWidth={320}>
                <div className="min-w-[260px] space-y-2 p-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{zone.name}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: style.color }}
                    >
                      {style.emoji} {style.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 rounded bg-gray-50 p-2 text-[11px]">
                    <div><span className="text-gray-500">水深(手前):</span> {zone.estimatedDepth.shore}m</div>
                    <div><span className="text-gray-500">水深(沖):</span> {zone.estimatedDepth.offshore}m</div>
                    <div><span className="text-gray-500">潮通し:</span> {Math.round(zone.currentFlow * 100)}%</div>
                    {zone.seaBottomFeatures.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-gray-500">海底:</span>{" "}
                        {zone.seaBottomFeatures.map((f) => BOTTOM_FEATURE_LABELS[f] || f).join("・")}
                      </div>
                    )}
                  </div>

                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-1 pr-2">魚種</th>
                        <th className="py-1 pr-2">釣り方</th>
                        <th className="py-1">時期</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFish.map((f) => (
                          <tr key={f.name} className="border-b border-gray-100">
                            <td className="py-1 pr-2 font-medium">{f.name}</td>
                            <td className="py-1 pr-2 text-gray-600">{f.method}</td>
                            <td className="py-1 text-gray-500">{f.season}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 魚名ラベル: zoom>=17でhotゾーンのみ表示（重なり防止） */}
        {showFishLabels && zoneBounds
          .filter(({ zone }) => zone.rating === "hot")
          .map(({ zone, center }) => {
            const topFish = zone.estimatedFish
              .filter((f) => f.probability >= 0.7)
              .sort((a, b) => b.probability - a.probability)
              .slice(0, 4)
              .map((f) => f.name);
            if (topFish.length === 0) return null;

            const fishLabelPos: [number, number] = [
              center[0] - perpLat * 1.5,
              center[1] - perpLng * 1.5,
            ];

            return (
              <Marker
                key={`fish-${zone.id}`}
                position={fishLabelPos}
                interactive={false}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="white-space:nowrap;font-size:10px;font-weight:600;color:#1e40af;background:rgba(255,255,255,0.92);padding:2px 8px;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.15);pointer-events:none;text-align:center;border:1px solid rgba(37,99,235,0.3)">${topFish.join(" / ")}</div>`,
                  iconSize: [180, 22],
                  iconAnchor: [90, 11],
                })}
              />
            );
          })}

        {/* 施設マーカー */}
        {facilityMarkers.map(({ fac, position }) => (
          <Marker
            key={fac.id}
            position={position}
            icon={L.divIcon({
              className: "",
              html: `<div style="font-size:24px;text-align:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));line-height:1;background:rgba(255,255,255,0.9);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid #e5e7eb">${fac.icon}</div>`,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            })}
          >
            <Tooltip direction="top" offset={[0, -14]}>
              <span className="text-xs font-bold">{fac.name}</span>
            </Tooltip>
          </Marker>
        ))}

        {/* テトラポッド検出マーカー: zoom>=17で表示 */}
        {showFishLabels && data.detectedTetrapods?.map((tp, idx) => (
          <Marker
            key={`tetra-${idx}`}
            position={[tp.lat, tp.lng]}
            interactive={false}
            icon={L.divIcon({
              className: "",
              html: `<div style="width:10px;height:10px;background:rgba(255,140,0,0.8);border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
              iconSize: [10, 10],
              iconAnchor: [5, 5],
            })}
          />
        ))}
      </MapContainer>

      {/* 凡例 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t bg-muted/30 px-4 py-2.5">
        <span className="text-xs font-semibold text-muted-foreground">凡例:</span>
        {Object.entries(RATING_STYLE).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block size-3.5 rounded-sm border-2"
              style={{ backgroundColor: val.fillColor, borderColor: val.color }}
            />
            <span className="font-medium">{val.emoji} {val.label}</span>
          </span>
        ))}
        {data.facilities.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-base">🏪</span> 施設
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: "#92400e" }} />
          {data.structureLabel || "護岸"}
        </span>
        {(data.detectedTetrapods?.length ?? 0) > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-2.5 rounded-full border-2 border-white" style={{ backgroundColor: "rgba(255,140,0,0.8)" }} />
            テトラポッド
          </span>
        )}
      </div>
    </div>
  );
}
