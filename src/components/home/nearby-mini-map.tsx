"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { markerIconHtml } from "@/lib/map-marker";
import { SPOT_TYPE_LABELS } from "@/types";
import type { NearbySpot } from "./nearby-band";

// 現在地マーカー（青丸）。カスタム divIcon のため、Leaflet 既定マーカー画像(CDN)は不要。
const userIcon = new L.DivIcon({
  html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

/**
 * ホーム「近くの釣り場」バンドのミニ地図。
 * ユーザーがボタンを押した後にだけ dynamic(ssr:false) で遅延マウントされる（初期ホームには乗らない）。
 * 現在地を中心に、近い順の数件をピン表示する。
 */
export function NearbyMiniMap({
  center,
  spots,
}: {
  center: [number, number];
  spots: NearbySpot[];
}) {
  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      className="h-64 w-full rounded-xl sm:h-72"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={userIcon}>
        <Popup>
          <span className="text-sm font-medium">現在地</span>
        </Popup>
      </Marker>
      {spots.map((s) => (
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
              <a
                href={`/spots/${s.slug}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "#1d4ed8",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                詳細を見る →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
