"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { markerIconHtml } from "@/lib/map-marker";
import { SPOT_TYPE_LABELS } from "@/types";
import { loadSpotCoords, type NearbySpot } from "./use-nearby-spots";
import type { AreaMarker } from "@/lib/geo/home-area-markers";

const JAPAN_CENTER: [number, number] = [37.6, 137.5];
const JAPAN_ZOOM = 5;
const NEARBY_ZOOM = 11;
// これ以上拡大したら都道府県ピン → スポット単位のピンに切り替える。
const SPOT_LEVEL_ZOOM = 8;

// 現在地マーカー（青丸）。カスタム divIcon のため Leaflet 既定マーカー画像(CDN)は不要。
const userIcon = new L.DivIcon({
  html: '<div style="width:16px;height:16px;background:#2f7cf6;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// エリアマーカー（件数入りの丸ピン・サンセットコーラル）。クラスタ展開時の個別ピンに使う。
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

/**
 * 全都道府県のエリアマーカーを markercluster で表示（密集は合計件数のクラスタにまとまる）。
 * 初回マウント時は全マーカーが収まるよう fitBounds（北海道〜沖縄まで見切れない）。
 * ※ 個別マーカーは imperative に追加するため、popup は HTML 文字列でリンクを埋める。
 */
function ClusteredAreaMarkers({
  markers,
  fittedRef,
}: {
  markers: AreaMarker[];
  fittedRef: React.MutableRefObject<boolean>;
}) {
  const map = useMap();
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 45,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      iconCreateFunction: (c: any) => {
        // クラスタは「配下の県のスポット合計」を表示（＋何県か）。
        const total = c
          .getAllChildMarkers()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .reduce((s: number, mk: any) => s + (mk.spotCount || 0), 0);
        const label = total >= 1000 ? `${(total / 1000).toFixed(1)}k` : String(total);
        const n = c.getChildCount();
        return L.divIcon({
          html:
            '<div style="width:44px;height:44px;border-radius:50%;background:#ef5a48;border:3px solid #fff;' +
            "box-shadow:0 2px 10px rgba(0,0,0,0.4);display:flex;flex-direction:column;align-items:center;" +
            'justify-content:center;color:#fff;font-weight:800;line-height:1;font-variant-numeric:tabular-nums">' +
            `<span style="font-size:12px">${label}</span>` +
            `<span style="font-size:8px;opacity:.85;font-weight:600">${n}県</span></div>`,
          className: "",
          iconSize: [44, 44],
        });
      },
    });

    for (const a of markers) {
      const marker = L.marker([a.lat, a.lng], { icon: areaIcon(a.count) });
      // クラスタ合計を出すため各マーカーにスポット件数を持たせる。
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (marker as any).spotCount = a.count;
      marker.bindPopup(
        '<div style="min-width:150px">' +
          `<p style="margin:0;font-weight:700;font-size:13px">${a.name}</p>` +
          `<p style="margin:2px 0 6px;font-size:11px;color:#6b7280">${a.count.toLocaleString()}件の釣り場</p>` +
          `<a href="/prefecture/${a.slug}" style="display:block;text-align:center;padding:6px 12px;border-radius:8px;background:#0369a1;color:#fff;font-size:12px;font-weight:700;text-decoration:none">エリアを見る →</a>` +
          "</div>"
      );
      cluster.addLayer(marker);
    }

    map.addLayer(cluster);
    // 全国 fitBounds は初回だけ（ズームアウトで都道府県ピンに戻った時に視点を飛ばさない）。
    if (!fittedRef.current) {
      fittedRef.current = true;
      const bounds = cluster.getBounds();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [28, 28] });
      }
    }
    return () => {
      map.removeLayer(cluster);
    };
  }, [markers, map, fittedRef]);
  return null;
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

/**
 * 拡大時のスポット単位ピン（markercluster。密集は件数クラスタ、ズーム15以上で全件ばらす）。
 * 座標は /api/spots/coords をマウント時に 1 回だけ取得（ズーム8未満の人は取得しない）。
 */
function SpotClusterMarkers({ onStatus }: { onStatus: (s: "loading" | "ready" | "error") => void }) {
  const map = useMap();
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cluster: any = null;
    onStatus("loading");
    loadSpotCoords()
      .then((spots) => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cluster = (L as any).markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 50,
          disableClusteringAtZoom: 15,
          showCoverageOnHover: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction: (c: any) => {
            const n = c.getChildCount();
            const label = n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
            const size = n >= 100 ? 40 : n >= 10 ? 34 : 28;
            return L.divIcon({
              html:
                `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#ef5a48;border:2.5px solid #fff;` +
                "box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;" +
                `color:#fff;font-weight:800;font-size:11px;font-variant-numeric:tabular-nums">${label}</div>`,
              className: "",
              iconSize: [size, size],
            });
          },
        });
        const layers = spots.map((s) => {
          const m = L.marker([s.lat, s.lng], {
            icon: L.divIcon({
              html: markerIconHtml(s.spotType, null),
              className: "",
              iconSize: [18, 18],
              iconAnchor: [9, 9],
              popupAnchor: [0, -10],
            }),
          });
          m.bindPopup(
            '<div style="min-width:160px">' +
              `<p style="margin:0;font-weight:700;font-size:13px">${escapeHtml(s.name)}</p>` +
              `<p style="margin:2px 0 6px;font-size:11px;color:#6b7280">${escapeHtml(s.prefecture)} ${escapeHtml(s.areaName)}・${SPOT_TYPE_LABELS[s.spotType] ?? ""}</p>` +
              `<a href="/spots/${encodeURIComponent(s.slug)}" style="display:block;text-align:center;padding:6px 12px;border-radius:8px;background:#0369a1;color:#fff;font-size:12px;font-weight:700;text-decoration:none">詳細を見る →</a>` +
              "</div>"
          );
          return m;
        });
        cluster.addLayers(layers);
        map.addLayer(cluster);
        onStatus("ready");
      })
      .catch(() => {
        if (!cancelled) onStatus("error");
      });
    return () => {
      cancelled = true;
      if (cluster) map.removeLayer(cluster);
    };
  }, [map, onStatus]);
  return null;
}

/**
 * overview モード: ズーム8未満は都道府県ピン、8以上はスポット単位ピンに切り替える。
 * 初回だけ全国に fitBounds し、以降の切替では視点を動かさない。
 */
function OverviewLayers({ areaMarkers }: { areaMarkers: AreaMarker[] }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [spotStatus, setSpotStatus] = useState<"loading" | "ready" | "error">("loading");
  const fitted = useRef(false);
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const spotLevel = zoom >= SPOT_LEVEL_ZOOM;

  let hint: string | null = null;
  if (!spotLevel) hint = "拡大すると釣り場を1件ずつ表示";
  else if (spotStatus === "loading") hint = "釣り場を読み込み中…";
  else if (spotStatus === "error") hint = "釣り場の読み込みに失敗しました";

  return (
    <>
      {spotLevel ? (
        <SpotClusterMarkers onStatus={setSpotStatus} />
      ) : (
        <ClusteredAreaMarkers markers={areaMarkers} fittedRef={fitted} />
      )}
      {hint && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-[400] rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow">
          {hint}
        </div>
      )}
    </>
  );
}

/** center/zoom が変わったら地図を移動（nearby 表示への切替）。 */
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
 * ホーム地図バンドの実地図（国土地理院 淡色地図）。
 * 「スクロールで近づいた時」に dynamic(ssr:false) で遅延マウントされる。
 * mode="overview": 全都道府県のエリアマーカーを markercluster + fitBounds で表示。ズーム8以上でスポット単位ピンに切替。
 * mode="nearby": 現在地＋近い順スポットを表示。
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

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-xl sm:h-80">
      <MapContainer
        center={JAPAN_CENTER}
        zoom={JAPAN_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">国土地理院</a>'
          url="https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
          maxNativeZoom={18}
        />
        <GestureInit onReady={handleReady} />

        {mode === "overview" && <OverviewLayers areaMarkers={areaMarkers} />}

        {mode === "nearby" && center && (
          <>
            <Recenter center={center} zoom={NEARBY_ZOOM} />
            <Marker position={center} icon={userIcon}>
              <Popup>
                <span style={{ fontSize: 13, fontWeight: 600 }}>現在地</span>
              </Popup>
            </Marker>
            {nearbySpots.map((s) => (
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
          </>
        )}
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
