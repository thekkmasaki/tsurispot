"use client";

import { useMemo, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/** タブ切替等で非表示→表示になった際に地図サイズを再計算する */
function InvalidateSizeOnVisible() {
  const map = useMap();
  const containerRef = useRef(map.getContainer());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 初回描画とリサイズで再計算
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

// ---------------------------------------------------------------------------
// Types (patent/data/structures/*.json の部分型)
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
}

// ---------------------------------------------------------------------------
// xRange [0,1] → 実座標変換ヘルパー（データ駆動）
// ---------------------------------------------------------------------------

// ゾーン矩形の幅（護岸の南北幅を表現）
const ZONE_HALF_WIDTH = 0.0003; // 約33m

function makeConverters(data: SpotMapAnalysis) {
  const west = data.structureEndpoints?.west ?? { lat: data.coordinates.lat, lng: data.coordinates.lng - 0.003 };
  const east = data.structureEndpoints?.east ?? { lat: data.coordinates.lat, lng: data.coordinates.lng + 0.003 };
  const lngSpan = east.lng - west.lng;
  const latSpan = east.lat - west.lat;

  // 構造物方向の単位ベクトルと垂直ベクトル
  const len = Math.sqrt(lngSpan * lngSpan + latSpan * latSpan);
  const perpLng = len > 0 ? (-latSpan / len) * ZONE_HALF_WIDTH : 0;
  const perpLat = len > 0 ? (lngSpan / len) * ZONE_HALF_WIDTH : ZONE_HALF_WIDTH;

  return {
    xToLng: (x: number) => west.lng + x * lngSpan,
    xToLat: (x: number) => west.lat + x * latSpan,
    perpLng,
    perpLat,
  };
}

// ---------------------------------------------------------------------------
// Rating スタイル
// ---------------------------------------------------------------------------

const RATING_STYLE: Record<
  string,
  { color: string; fillColor: string; label: string; emoji: string }
> = {
  hot: {
    color: "#dc2626",
    fillColor: "#dc262660",
    label: "激アツ",
    emoji: "\uD83D\uDD25",
  },
  good: {
    color: "#2563eb",
    fillColor: "#2563eb50",
    label: "おすすめ",
    emoji: "\uD83D\uDC4D",
  },
  normal: {
    color: "#6b7280",
    fillColor: "#6b728040",
    label: "普通",
    emoji: "\u25CB",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SpotLeafletMap({ data }: { data: SpotMapAnalysis }) {
  const { xToLng, xToLat, perpLng, perpLat } = useMemo(() => makeConverters(data), [data]);

  // Zone polygons (rotated to match structure direction)
  const zoneBounds = useMemo(
    () =>
      data.zones.map((zone) => {
        const x0 = zone.xRange[0];
        const x1 = zone.xRange[1];
        const midX = (x0 + x1) / 2;

        // 構造物ライン上の4つのコーナー座標
        const wLat = xToLat(x0);
        const wLng = xToLng(x0);
        const eLat = xToLat(x1);
        const eLng = xToLng(x1);

        // 構造物方向に垂直なオフセットで回転ポリゴンを構成
        // 海側に多めにオフセット（陸側30%:海側70%）→ 護岸の上にゾーンが乗る
        const landFactor = 0.3;
        const seaFactor = 0.7;
        const positions: L.LatLngExpression[] = [
          [wLat + perpLat * landFactor, wLng + perpLng * landFactor],  // NW（陸側）
          [eLat + perpLat * landFactor, eLng + perpLng * landFactor],  // NE（陸側）
          [eLat - perpLat * seaFactor, eLng - perpLng * seaFactor],    // SE（海側）
          [wLat - perpLat * seaFactor, wLng - perpLng * seaFactor],    // SW（海側）
        ];

        const center: [number, number] = [
          (wLat + eLat) / 2,
          (wLng + eLng) / 2,
        ];

        return { zone, positions, center };
      }),
    [data.zones, xToLng, xToLat, perpLng, perpLat]
  );

  // Facility markers
  const facilityMarkers = useMemo(
    () =>
      data.facilities.map((fac) => {
        const x = fac.relativePosition;
        const lat = xToLat(x) + ZONE_HALF_WIDTH + 0.00025; // 陸側に少しオフセット
        const lng = xToLng(x);
        return { fac, position: [lat, lng] as [number, number] };
      }),
    [data.facilities, xToLat, xToLng]
  );

  return (
    <div className="overflow-hidden rounded-lg border">
      <MapContainer
        center={[data.coordinates.lat, data.coordinates.lng]}
        zoom={17}
        style={{ height: "450px", width: "100%" }}
        scrollWheelZoom={true}
      >
        <InvalidateSizeOnVisible />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* ゾーンポリゴン（構造物方向に回転） */}
        {zoneBounds.map(({ zone, positions, center }) => {
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
                fillOpacity: 0.4,
                weight: 2,
              }}
            >
              <Tooltip direction="center" permanent className="zone-tooltip">
                <span className="text-[10px] font-bold leading-none">
                  {zone.rating !== "normal" ? `${style.emoji}` : ""}{zone.name.replace(/エリア/, "").replace(/（.*）/, "")}
                </span>
              </Tooltip>
              <Popup maxWidth={300}>
                <div className="min-w-[240px] space-y-2 p-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{zone.name}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: style.color }}
                    >
                      {style.emoji} {style.label}
                    </span>
                  </div>

                  <div className="flex gap-3 text-[11px] text-gray-600">
                    <span>
                      水深: 手前{zone.estimatedDepth.shore}m / 沖
                      {zone.estimatedDepth.offshore}m
                    </span>
                    <span>
                      潮通し: {Math.round(zone.currentFlow * 100)}%
                    </span>
                  </div>

                  {zone.seaBottomFeatures.length > 0 && (
                    <div className="text-[11px] text-gray-500">
                      海底:{" "}
                      {zone.seaBottomFeatures
                        .map((f) =>
                          f === "tetrapod"
                            ? "テトラポッド"
                            : f === "reef-stone"
                              ? "捨て石魚礁"
                              : f === "reef-concrete"
                                ? "コンクリ魚礁"
                                : f === "reef-hex"
                                  ? "六角錐魚礁"
                                  : f
                        )
                        .join("・")}
                    </div>
                  )}

                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-1 pr-2">魚種</th>
                        <th className="py-1 pr-2">釣り方</th>
                        <th className="py-1 pr-2">時期</th>
                        <th className="py-1 text-right">おすすめ度</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFish.map((f) => {
                        const stars = f.probability >= 0.9 ? 5 : f.probability >= 0.7 ? 4 : f.probability >= 0.5 ? 3 : f.probability >= 0.3 ? 2 : 1;
                        return (
                          <tr key={f.name} className="border-b border-gray-100">
                            <td className="py-1 pr-2 font-medium">{f.name}</td>
                            <td className="py-1 pr-2 text-gray-600">
                              {f.method}
                            </td>
                            <td className="py-1 pr-2 text-gray-500">
                              {f.season}
                            </td>
                            <td className="py-1 text-right text-[11px] tracking-tight text-amber-500">
                              {"★".repeat(stars)}{"☆".repeat(5 - stars)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* ゾーン魚名ラベル（海側に常時表示） */}
        {zoneBounds.map(({ zone, center }) => {
          const topFish = zone.estimatedFish
            .filter((f) => f.probability >= 0.7)
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5)
            .map((f) => f.name);
          if (topFish.length === 0) return null;

          const fishLabelPos: [number, number] = [
            center[0] - perpLat * 1.8,
            center[1] - perpLng * 1.8,
          ];

          return (
            <Marker
              key={`fish-${zone.id}`}
              position={fishLabelPos}
              interactive={false}
              icon={L.divIcon({
                className: "",
                html: `<div style="white-space:nowrap;font-size:11px;font-weight:700;color:#1e293b;background:rgba(255,255,255,0.88);padding:2px 6px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.18);pointer-events:none;text-align:center">${topFish.join("・")}</div>`,
                iconSize: [200, 24],
                iconAnchor: [100, 12],
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
              html: `<div style="font-size:22px;text-align:center;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4));line-height:1">${fac.icon}</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            })}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <span className="text-xs font-medium">{fac.name}</span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* 凡例 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t bg-muted/30 px-4 py-2.5">
        <span className="text-xs font-semibold text-muted-foreground">
          凡例:
        </span>
        {Object.entries(RATING_STYLE).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block size-3 rounded-sm border"
              style={{
                backgroundColor: val.fillColor,
                borderColor: val.color,
              }}
            />
            {val.emoji} {val.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-base">🏪</span> 施設
        </span>
      </div>
    </div>
  );
}
