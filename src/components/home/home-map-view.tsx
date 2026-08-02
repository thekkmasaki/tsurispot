"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { markerIconHtml } from "@/lib/map-marker";
import { SPOT_TYPE_LABELS } from "@/types";
import type { NearbySpot } from "./use-nearby-spots";
import type { AreaMarker } from "@/lib/geo/home-area-markers";

const JAPAN_CENTER: [number, number] = [37.6, 137.5];
const JAPAN_ZOOM = 5;
const NEARBY_ZOOM = 11;

// 現在地マーカー（青丸）。カスタム divIcon のため Leaflet 既定マーカー画像(CDN)は不要。
const userIcon = new L.DivIcon({
  html: '<div style="width:16px;height:16px;background:#2f7cf6;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// エリアマーカー（件数入りの丸ピン・サンセットコーラル）。
function areaIcon(count: number): L.DivIcon {
  const label = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  return new L.DivIcon({
    html:
      '<div style="width:34px;height:34px;border-radius:50%;background:#ef5a48;border:2.5px solid #fff;' +
      "box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;" +
      `color:#fff;font-weight:800;font-size:11px;font-variant-numeric:tabular-nums">${label}</div>`,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

const popupLinkStyle: React.CSSProperties = {
  display: "block",
  textAlign: "center",
  padding: "6px 12px",
  borderRadius: 8,
  background: "#0369a1",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  textDecoration: "none",
};

/** center/zoom が変わったら地図を移動（overview ↔ nearby の切替）。 */
function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

/**
 * モバイル（coarse pointer）では初期にドラッグ/ピンチを無効化して縦スクロールを奪わない。
 * 親には map インスタンスと coarse 判定を渡し、「タップで操作」オーバーレイで有効化させる。
 */
function GestureInit({ onReady }: { onReady: (map: L.Map, coarse: boolean) => void }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    if (coarse) {
      map.dragging.disable();
      map.touchZoom.disable();
    }
    onReady(map, coarse);
  }, [map, onReady]);
  return null;
}

/**
 * ホーム地図バンドの実地図（CARTO light_all）。
 * ボタン押下後ではなく「スクロールで近づいた時」に dynamic(ssr:false) で遅延マウントされる
 * （＝本物の地図が常にそこにある。ファサードにしない）。
 * mode="overview": 日本全体＋エリアマーカー。mode="nearby": 現在地＋近い順スポット。
 */
export function HomeMapView({
  mode,
  areaMarkers,
  center,
  nearbySpots,
}: {
  mode: "overview" | "nearby";
  areaMarkers: AreaMarker[];
  center: [number, number] | null;
  nearbySpots: NearbySpot[];
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [gate, setGate] = useState(false);

  const handleReady = useCallback((m: L.Map, coarse: boolean) => {
    setMap(m);
    setGate(coarse);
  }, []);

  const activate = useCallback(() => {
    if (map) {
      map.dragging.enable();
      map.touchZoom.enable();
    }
    setGate(false);
  }, [map]);

  const viewCenter = mode === "nearby" && center ? center : JAPAN_CENTER;
  const viewZoom = mode === "nearby" ? NEARBY_ZOOM : JAPAN_ZOOM;

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-xl sm:h-80">
      <MapContainer
        center={viewCenter}
        zoom={viewZoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GestureInit onReady={handleReady} />
        <Recenter center={viewCenter} zoom={viewZoom} />

        {mode === "overview" &&
          areaMarkers.map((a) => (
            <Marker key={a.slug} position={[a.lat, a.lng]} icon={areaIcon(a.count)}>
              <Popup>
                <div style={{ minWidth: 150 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{a.name}</p>
                  <p style={{ margin: "2px 0 6px", fontSize: 11, color: "#6b7280" }}>
                    {a.count.toLocaleString()}件の釣り場
                  </p>
                  <a href={`/prefecture/${a.slug}`} style={popupLinkStyle}>
                    エリアを見る →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

        {mode === "nearby" && center && (
          <Marker position={center} icon={userIcon}>
            <Popup>
              <span style={{ fontSize: 13, fontWeight: 600 }}>現在地</span>
            </Popup>
          </Marker>
        )}
        {mode === "nearby" &&
          nearbySpots.map((s) => (
            <Marker
              key={s.slug}
              position={[s.lat, s.lng]}
              icon={L.divIcon({
                html: markerIconHtml(s.spotType, null),
                className: "",
                iconSize: [18, 18],
                iconAnchor: [9, 9],
                popupAnchor: [0, -10],
              })}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{s.name}</p>
                  <p style={{ margin: "2px 0 6px", fontSize: 11, color: "#6b7280" }}>
                    {s.prefecture} {s.areaName}・{SPOT_TYPE_LABELS[s.spotType]}・約
                    {s.distanceKm < 10 ? s.distanceKm.toFixed(1) : Math.round(s.distanceKm)}km
                  </p>
                  <a href={`/spots/${s.slug}`} style={popupLinkStyle}>
                    詳細を見る →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {gate && (
        <button
          type="button"
          onClick={activate}
          className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-900/5"
          style={{ touchAction: "pan-y" }}
          aria-label="地図を操作する"
        >
          <span className="rounded-full bg-slate-900/70 px-4 py-1.5 text-xs font-medium text-white">
            タップで地図を操作
          </span>
        </button>
      )}
    </div>
  );
}
