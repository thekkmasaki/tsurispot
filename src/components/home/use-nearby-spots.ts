"use client";

import { useCallback, useState } from "react";
import type { FishingSpot } from "@/types";

export interface NearbySpot {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  spotType: FishingSpot["spotType"];
  rating: number;
  prefecture: string;
  areaName: string;
  isFree: boolean;
  distanceKm: number;
}

/** /api/spots/coords の 1 レコード（payload 削減で短縮キー）。 */
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

export type SpotCoord = Omit<NearbySpot, "distanceKm">;

let coordsPromise: Promise<SpotCoord[]> | null = null;

/**
 * /api/spots/coords を取得して復元する（モジュール内で 1 回だけ。現在地検索と地図の拡大表示で共有）。
 * 失敗時はキャッシュを捨てて次回再試行できるようにする。
 */
export function loadSpotCoords(): Promise<SpotCoord[]> {
  if (!coordsPromise) {
    coordsPromise = fetch("/api/spots/coords")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json() as Promise<RawCoord[]>;
      })
      .then((raw) =>
        raw.map((c) => ({
          slug: c.s,
          name: c.n,
          lat: c.la,
          lng: c.lo,
          spotType: c.t,
          rating: c.r,
          prefecture: c.p,
          areaName: c.a,
          isFree: c.f,
        }))
      )
      .catch((e) => {
        coordsPromise = null;
        throw e;
      });
  }
  return coordsPromise;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

export type NearbyStatus = "idle" | "locating" | "ready" | "error";

/**
 * 「現在地から探す」の共通ロジック（旧 HomeNearbyBand から抽出）。
 * ボタン押下 → geolocation → 静的座標 API を 1 回 fetch → 近い順を算出。
 * ※ getCurrentPosition は明示的な呼び出し時のみ（初期に自動発火しない）。
 * ※ /api/spots/coords（184KB）の取得も「押した人だけ・1 回だけ」（loadSpotCoords で地図拡大時と共有）。
 */
export function useNearbySpots(limit = 5) {
  const [status, setStatus] = useState<NearbyStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [spots, setSpots] = useState<NearbySpot[]>([]);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setErrorMsg("お使いのブラウザは位置情報に対応していません。");
      return;
    }
    setStatus("locating");
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const all = await loadSpotCoords();
          const nearest: NearbySpot[] = all
            .map((c) => ({ ...c, distanceKm: haversineKm(lat, lng, c.lat, c.lng) }))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, limit);
          setCenter([lat, lng]);
          setSpots(nearest);
          setStatus("ready");
        } catch {
          setStatus("error");
          setErrorMsg(
            "スポット情報の取得に失敗しました。時間をおいて再度お試しください。"
          );
        }
      },
      (err) => {
        setStatus("error");
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? "位置情報の使用が許可されていません。ブラウザの設定から位置情報を許可してください。"
            : "位置情報を取得できませんでした。しばらくしてからお試しください。"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [limit]);

  return { status, errorMsg, center, spots, locate };
}
