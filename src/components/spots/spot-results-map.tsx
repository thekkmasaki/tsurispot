"use client";

/**
 * /spots の「地図」タブ: 絞り込み結果をそのまま地図に出す（UI/UX刷新Phase3）。
 * - 地図タブを開いたときだけ next/dynamic(ssr:false) で読み込む（初期HTML・LCPに影響しない）
 * - 件数が多いので markercluster でまとめる
 * - ポップアップからスポット詳細へリンク
 */
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { SPOT_TYPE_LABELS, type ListSpot } from "@/types";

const JAPAN_CENTER: L.LatLngExpression = [37.6, 137.5];

const pinIcon = new L.DivIcon({
  html: '<div style="width:14px;height:14px;background:oklch(52% 0.165 242);border:2.5px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8],
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function SpotResultsMap({ spots }: { spots: ListSpot[] }) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { center: JAPAN_CENTER, zoom: 5, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layerRef.current?.remove();
    const cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 50 });
    const points: L.LatLngExpression[] = [];
    for (const s of spots) {
      if (!Number.isFinite(s.latitude) || !Number.isFinite(s.longitude)) continue;
      const ll: L.LatLngExpression = [s.latitude, s.longitude];
      points.push(ll);
      cluster.addLayer(
        L.marker(ll, { icon: pinIcon }).bindPopup(
          `<div style="min-width:160px">` +
            `<div style="font-weight:700;font-size:13px;margin-bottom:2px">${escapeHtml(s.name)}</div>` +
            `<div style="font-size:11px;color:#667">${escapeHtml(SPOT_TYPE_LABELS[s.spotType])} − ${escapeHtml(s.region.prefecture)} ${escapeHtml(s.region.areaName)}</div>` +
            `<a href="/spots/${encodeURIComponent(s.slug)}" style="display:block;margin-top:6px;text-align:center;padding:5px 10px;border-radius:999px;background:oklch(47% 0.15 242);color:#fff;font-size:12px;font-weight:700;text-decoration:none">詳しく見る</a>` +
            `</div>`,
        ),
      );
    }
    cluster.addTo(map);
    layerRef.current = cluster;
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [24, 24], maxZoom: 12 });
    } else {
      map.setView(JAPAN_CENTER, 5);
    }
  }, [spots]);

  return (
    <div
      ref={elRef}
      className="h-[60vh] min-h-[360px] w-full overflow-hidden rounded-xl border"
      style={{ isolation: "isolate" }}
      role="region"
      aria-label="絞り込み結果の地図"
    />
  );
}
