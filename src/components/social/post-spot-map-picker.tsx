"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Loader2, Navigation } from "lucide-react";
import { markerIconHtml } from "@/lib/map-marker";
import { SPOT_TYPE_LABELS } from "@/types";
import type { FishingSpot } from "@/types";

const JAPAN_CENTER: [number, number] = [37.6, 137.5];
const JAPAN_ZOOM = 5;
const LOCATE_ZOOM = 11;

/** /api/spots/coords の 1 レコード（use-nearby-spots と同じ短縮キー）。 */
interface RawCoord {
  s: string;
  n: string;
  la: number;
  lo: number;
  t: FishingSpot["spotType"];
  r: number;
  p: string;
  a: string;
  f: boolean;
}

export interface PickedSpot {
  slug: string;
  name: string;
}

// 現在地マーカー（青丸）。home-map-view と同じ divIcon（Leaflet 既定マーカー画像は使わない）。
const userIcon = new L.DivIcon({
  html: '<div style="width:16px;height:16px;background:#2f7cf6;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

/**
 * 全スポットを markercluster で描画し、ピンのポップアップ「この釣り場で投稿」で選択させる。
 * 7,000件超のためポップアップ DOM は bindPopup(factory) で開いた時にだけ生成する。
 */
function ClusteredSpotMarkers({
  spots,
  onSelect,
}: {
  spots: RawCoord[];
  onSelect: (spot: PickedSpot) => void;
}) {
  const map = useMap();
  // onSelect が再レンダーで変わってもクラスタを作り直さないよう ref 経由で呼ぶ
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      chunkedLoading: true, // 7,000件超を UI ブロックせず段階追加
    });

    for (const s of spots) {
      const marker = L.marker([s.la, s.lo], {
        icon: L.divIcon({
          html: markerIconHtml(s.t, null),
          className: "",
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -10],
        }),
      });
      marker.bindPopup(() => {
        const div = document.createElement("div");
        div.style.minWidth = "160px";
        const title = document.createElement("p");
        title.style.cssText = "margin:0;font-weight:700;font-size:13px";
        title.textContent = s.n;
        const sub = document.createElement("p");
        sub.style.cssText = "margin:2px 0 8px;font-size:11px;color:#6b7280";
        sub.textContent = `${s.p} ${s.a}・${SPOT_TYPE_LABELS[s.t]}`;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.style.cssText =
          "display:block;width:100%;text-align:center;padding:7px 12px;border-radius:8px;background:#0369a1;color:#fff;font-size:12px;font-weight:700;border:none;cursor:pointer";
        btn.textContent = "この釣り場で投稿する";
        btn.addEventListener("click", () => {
          onSelectRef.current({ slug: s.s, name: s.n });
        });
        div.append(title, sub, btn);
        return div;
      });
      cluster.addLayer(marker);
    }

    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
    };
  }, [spots, map]);
  return null;
}

/** モバイル（coarse pointer）は初期ドラッグ無効（home-map-view と同じ縦スクロール保護）。 */
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
 * 釣果投稿の地図ピッカー（/post）。
 * 全スポット座標（/api/spots/coords・CDN配信）を開いた時に 1 回だけ取得し、
 * ホーム地図と同じ CARTO タイル + markercluster で表示。ピン→「この釣り場で投稿」で選択。
 */
export function PostSpotMapPicker({ onSelect }: { onSelect: (spot: PickedSpot) => void }) {
  const [spots, setSpots] = useState<RawCoord[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [gate, setGate] = useState(false);
  const [locating, setLocating] = useState(false);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    let aborted = false;
    fetch("/api/spots/coords")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((items: RawCoord[]) => {
        if (!aborted) setSpots(items || []);
      })
      .catch(() => {
        if (!aborted) setLoadError(true);
      });
    return () => {
      aborted = true;
    };
  }, []);

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

  const locate = useCallback(() => {
    if (!map || locating || typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const center: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        userMarkerRef.current?.remove();
        userMarkerRef.current = L.marker(center, { icon: userIcon }).addTo(map);
        map.setView(center, LOCATE_ZOOM);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [map, locating]);

  if (loadError) {
    return (
      <p className="rounded-xl border bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
        地図データの取得に失敗しました。時間をおいて再度お試しください。
      </p>
    );
  }

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-xl border sm:h-80">
      <MapContainer
        center={JAPAN_CENTER}
        zoom={JAPAN_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GestureInit onReady={handleReady} />
        {spots && <ClusteredSpotMarkers spots={spots} onSelect={onSelect} />}
      </MapContainer>

      {/* 現在地へ移動 */}
      <button
        type="button"
        onClick={locate}
        disabled={locating}
        className="absolute right-2 top-2 z-[500] inline-flex items-center gap-1 rounded-full border bg-white/95 px-3 py-1.5 text-xs font-medium text-sky-800 shadow-sm transition-colors hover:bg-white"
      >
        {locating ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Navigation className="size-3.5" aria-hidden="true" />
        )}
        現在地へ
      </button>

      {/* 座標ロード中インジケータ */}
      {!spots && !loadError && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-[500] flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-white">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            釣り場を読み込み中...
          </span>
        </div>
      )}

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
