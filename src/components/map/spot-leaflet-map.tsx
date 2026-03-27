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

interface SpotInfo {
  name: string;
  address: string;
  spotType: string;
  isFree: boolean;
  feeDetail?: string;
  managementInfo?: {
    organizationName: string;
    contactPhone?: string;
    openingHours?: string;
    closedDays?: string;
    fishingFee?: string;
  };
}

interface SpotFacilities {
  hasParking: boolean;
  parkingDetail?: string;
  parkingGuide?: { parkingLatitude?: number; parkingLongitude?: number };
  hasToilet: boolean;
  hasConvenienceStore: boolean;
  hasFishingShop: boolean;
  hasRentalRod: boolean;
  rentalDetail?: string;
}

interface NearbySpotPin {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  spotType: string;
  distanceKm: number;
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
  spotInfo?: SpotInfo;
  spotFacilities?: SpotFacilities;
  restrictedAreas?: string[];
  nearbySpots?: NearbySpotPin[];
}

// ---------------------------------------------------------------------------
// 座標変換ヘルパー
// ---------------------------------------------------------------------------

const ZONE_HALF_WIDTH = 0.0009; // 約100m — ゾーンを視認可能な幅にする

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
  { color: string; fillColor: string; label: string; emoji: string; borderColor: string }
> = {
  hot: {
    color: "#dc2626",
    fillColor: "rgba(220, 38, 38, 0.45)",
    label: "激アツ",
    emoji: "\uD83D\uDD25",
    borderColor: "#dc2626",
  },
  good: {
    color: "#2563eb",
    fillColor: "rgba(37, 99, 235, 0.35)",
    label: "おすすめ",
    emoji: "\uD83D\uDC4D",
    borderColor: "#2563eb",
  },
  normal: {
    color: "#6b7280",
    fillColor: "rgba(107, 114, 128, 0.25)",
    label: "普通",
    emoji: "\u25CE",
    borderColor: "#6b7280",
  },
};

// ---------------------------------------------------------------------------
// スポットタイプラベル
// ---------------------------------------------------------------------------

const SPOT_TYPE_ICONS: Record<string, string> = {
  port: "\u2693",
  beach: "\uD83C\uDFD6\uFE0F",
  river: "\uD83C\uDF0A",
  lake: "\uD83C\uDFDE\uFE0F",
  pier: "\uD83C\uDF09",
  reef: "\uD83E\uDEB8",
  breakwater: "\uD83C\uDF0A",
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

        const landFactor = 0.1;
        const seaFactor = 0.9;
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

  // Facility markers（陸側に配置）— analysis JSONから
  const facilityMarkers = useMemo(
    () =>
      data.facilities.map((fac) => {
        const x = fac.relativePosition;
        const lat = xToLat(x) + perpLat * 0.2 + 0.0003;
        const lng = xToLng(x) + perpLng * 0.2;
        return { fac, position: [lat, lng] as [number, number] };
      }),
    [data.facilities, xToLat, xToLng, perpLat, perpLng]
  );

  // 追加施設マーカー（spotFacilitiesから補完）
  const extraFacilityMarkers = useMemo(() => {
    const markers: Array<{ icon: string; name: string; position: [number, number] }> = [];
    const sf = data.spotFacilities;
    if (!sf) return markers;

    const existingNames = new Set(data.facilities.map((f) => f.icon));

    // 駐車場の実座標
    if (sf.hasParking && sf.parkingGuide?.parkingLatitude && sf.parkingGuide?.parkingLongitude) {
      markers.push({
        icon: "\uD83C\uDD7F\uFE0F",
        name: sf.parkingDetail || "駐車場",
        position: [sf.parkingGuide.parkingLatitude, sf.parkingGuide.parkingLongitude],
      });
    }

    // コンビニ（既存になければ）
    if (sf.hasConvenienceStore && !existingNames.has("\uD83C\uDFEA")) {
      markers.push({
        icon: "\uD83C\uDFEA",
        name: "コンビニ",
        position: [data.coordinates.lat + 0.0005, data.coordinates.lng + 0.0003],
      });
    }

    // トイレ（既存になければ）
    if (sf.hasToilet && !existingNames.has("\uD83D\uDEBB")) {
      markers.push({
        icon: "\uD83D\uDEBB",
        name: "トイレ",
        position: [data.coordinates.lat + 0.0004, data.coordinates.lng - 0.0002],
      });
    }

    // 釣具店
    if (sf.hasFishingShop && !existingNames.has("\uD83C\uDFA3")) {
      markers.push({
        icon: "\uD83C\uDFA3",
        name: "釣具店",
        position: [data.coordinates.lat + 0.0006, data.coordinates.lng + 0.0005],
      });
    }

    return markers;
  }, [data.spotFacilities, data.facilities, data.coordinates]);

  // 全ゾーンで同じ魚種かチェック（同じなら個別ラベル不要）
  const allZoneFishKeys = useMemo(() => {
    return data.zones.map((z) =>
      z.estimatedFish
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 3)
        .map((f) => f.name)
        .join(",")
    );
  }, [data.zones]);
  const allFishSame = allZoneFishKeys.length > 1 && allZoneFishKeys.every((k) => k === allZoneFishKeys[0]);

  // 各ゾーンのおすすめ釣法（最頻出メソッド）
  const zoneTopMethod = useMemo(() => {
    const map = new Map<string, string>();
    for (const z of data.zones) {
      if (z.estimatedFish.length > 0) {
        const best = z.estimatedFish.reduce((a, b) => b.probability > a.probability ? b : a);
        map.set(z.id, best.method);
      }
    }
    return map;
  }, [data.zones]);

  // ズームレベルに応じたラベル表示制御
  const showZoneNames = zoom >= 15;
  const showFishLabels = zoom >= 17;
  const showNearbySpots = zoom <= 14;

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="relative h-[360px] sm:h-[480px]">
      <MapContainer
        center={[data.coordinates.lat, data.coordinates.lng]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <InvalidateSizeOnVisible />
        <ZoomWatcher onZoomChange={handleZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={20}
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
        {zoneBounds.map(({ zone, positions }) => {
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
                fillOpacity: 0.6,
                weight: 3,
              }}
            >
              {/* ゾーン名バッジ+釣法+水深: zoom>=15で表示 */}
              {showZoneNames && (() => {
                const method = zoneTopMethod.get(zone.id);
                const depth = zone.estimatedDepth.shore === zone.estimatedDepth.offshore
                  ? `${zone.estimatedDepth.shore}m`
                  : `${zone.estimatedDepth.shore}-${zone.estimatedDepth.offshore}m`;
                return (
                  <Tooltip direction="center" permanent className="zone-tooltip">
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1px",
                      pointerEvents: "none",
                    }}>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        background: style.color,
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                        lineHeight: "1.3",
                      }}>
                        {style.emoji} {zone.name.replace("エリア", "")}{method ? ` ${method}` : ""}
                      </div>
                      <div style={{
                        fontSize: "9px",
                        fontWeight: 600,
                        color: "#0369a1",
                        background: "rgba(224,242,254,0.9)",
                        padding: "0px 5px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                      }}>
                        水深{depth}
                      </div>
                    </div>
                  </Tooltip>
                );
              })()}
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
                        {zone.seaBottomFeatures.map((f) => BOTTOM_FEATURE_LABELS[f] || f).join("\u30FB")}
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

        {/* 魚種ラベル: zoom>=17で表示。全ゾーン同じ魚種ならhotのみ */}
        {showFishLabels && zoneBounds
          .filter(({ zone }) => !allFishSame || zone.rating === "hot")
          .map(({ zone, center }) => {
            const topFish = zone.estimatedFish
              .sort((a, b) => b.probability - a.probability)
              .slice(0, 3)
              .map((f) => f.name);
            if (topFish.length === 0) return null;

            const style = RATING_STYLE[zone.rating] || RATING_STYLE.normal;
            const fishLabelPos: [number, number] = [
              center[0] - perpLat * 0.7,
              center[1] - perpLng * 0.7,
            ];

            return (
              <Marker
                key={`fish-${zone.id}`}
                position={fishLabelPos}
                interactive={false}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="white-space:nowrap;font-size:10px;font-weight:600;color:#1e3a5f;background:rgba(255,255,255,0.92);padding:2px 8px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.12);pointer-events:none;text-align:center;border:1.5px solid ${style.borderColor}">\uD83D\uDC1F ${topFish.join("\u30FB")}</div>`,
                  iconSize: [180, 22],
                  iconAnchor: [90, 11],
                })}
              />
            );
          })}

        {/* 施設マーカー（analysis JSONからの既存分） */}
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

        {/* 追加施設マーカー（spotFacilitiesから補完） */}
        {extraFacilityMarkers.map((m, idx) => (
          <Marker
            key={`extra-fac-${idx}`}
            position={m.position}
            icon={L.divIcon({
              className: "",
              html: `<div style="font-size:24px;text-align:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));line-height:1;background:rgba(255,255,255,0.9);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid #e5e7eb">${m.icon}</div>`,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            })}
          >
            <Tooltip direction="top" offset={[0, -14]}>
              <span className="text-xs font-bold">{m.name}</span>
            </Tooltip>
          </Marker>
        ))}

        {/* テトラポッド検出マーカー: zoom>=17で表示 */}
        {zoom >= 17 && data.detectedTetrapods?.map((tp, idx) => (
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

        {/* 近くの釣り場ピン: zoom<=14で表示 */}
        {showNearbySpots && data.nearbySpots?.map((ns) => (
          <Marker
            key={`nearby-${ns.slug}`}
            position={[ns.latitude, ns.longitude]}
            icon={L.divIcon({
              className: "",
              html: `<div style="width:14px;height:14px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            })}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="text-xs font-bold">{ns.name}</span>
              <span className="ml-1 text-[10px] text-gray-500">{ns.distanceKm.toFixed(1)}km</span>
            </Tooltip>
            <Popup>
              <div className="space-y-1 p-1">
                <div className="text-sm font-bold">{ns.name}</div>
                <div className="text-xs text-gray-500">
                  {SPOT_TYPE_ICONS[ns.spotType] || ""} {ns.distanceKm.toFixed(1)}km
                </div>
                <a
                  href={`/spots/${ns.slug}`}
                  className="inline-block mt-1 text-xs text-blue-600 hover:underline font-medium"
                >
                  詳細を見る →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 釣り禁止エリア警告バナー（地図右上オーバーレイ） */}
      {data.restrictedAreas && data.restrictedAreas.length > 0 && (
        <div
          className="absolute right-2 top-2 z-[1000] max-w-[260px] rounded-lg border-2 border-red-400 bg-red-50/95 px-3 py-2 shadow-lg backdrop-blur-sm"
        >
          <div className="mb-1 flex items-center gap-1 text-xs font-bold text-red-700">
            <span>\u26D4</span> 釣り禁止・制限エリア
          </div>
          <ul className="space-y-0.5 text-[11px] text-red-600">
            {data.restrictedAreas.map((area, i) => (
              <li key={i}>\u30FB{area}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 情報パネル（左下オーバーレイ） */}
      {data.spotInfo && (
        <div
          className="absolute bottom-2 left-2 z-[1000] max-w-[200px] rounded-lg border bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm sm:max-w-[260px]"
        >
          <div className="mb-1 text-sm font-bold leading-tight">{data.spotInfo.name}</div>
          <div className="mb-1 text-[10px] text-gray-500 leading-tight">{data.spotInfo.address}</div>
          {data.spotInfo.isFree && (
            <span className="inline-block mb-1 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
              無料
            </span>
          )}
          {data.spotInfo.feeDetail && !data.spotInfo.isFree && (
            <div className="mb-1 text-[10px] text-gray-600">{data.spotInfo.feeDetail}</div>
          )}
          {data.spotInfo.managementInfo && (
            <div className="space-y-0.5 border-t pt-1 mt-1 text-[10px] text-gray-600">
              {data.spotInfo.managementInfo.openingHours && (
                <div>\uD83D\uDD52 {data.spotInfo.managementInfo.openingHours}</div>
              )}
              {data.spotInfo.managementInfo.fishingFee && (
                <div>\uD83D\uDCB0 {data.spotInfo.managementInfo.fishingFee}</div>
              )}
              {data.spotInfo.managementInfo.contactPhone && (
                <div>\uD83D\uDCDE {data.spotInfo.managementInfo.contactPhone}</div>
              )}
              {data.spotInfo.managementInfo.closedDays && (
                <div>\uD83D\uDEAB {data.spotInfo.managementInfo.closedDays}</div>
              )}
            </div>
          )}
        </div>
      )}
      </div>{/* end relative wrapper */}

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
        {(data.facilities.length > 0 || extraFacilityMarkers.length > 0) && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-base">{"\uD83C\uDFEA"}</span> 施設
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
        {data.restrictedAreas && data.restrictedAreas.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
            <span>{"\u26D4"}</span> 禁止エリアあり
          </span>
        )}
        {data.nearbySpots && data.nearbySpots.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
            近くの釣り場
          </span>
        )}
      </div>
    </div>
  );
}
