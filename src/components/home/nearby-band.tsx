"use client";

import { useState, useCallback } from "react";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import {
  Navigation,
  Loader2,
  MapPin,
  Star,
  ArrowRight,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SPOT_TYPE_LABELS } from "@/types";
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

// 実地図は「現在地を許可して探す」を押した後にだけ読み込む（初期ホームには乗せない）。
const NearbyMiniMap = nextDynamic(
  () => import("./nearby-mini-map").then((m) => m.NearbyMiniMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-xl bg-muted sm:h-72" />
    ),
  }
);

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

type Status = "idle" | "locating" | "ready" | "error";

/**
 * ホーム ヒーロー直下の「近くの釣り場」バンド。
 * idle 状態（＝ボタン＋説明）はサーバーレンダリングされ初期 HTML に含まれる（CLS・初期表示を確保）。
 * ボタン押下 → 位置取得 → 静的座標 API を 1 回 fetch → 近い順を算出し、実地図＋リストを表示する。
 */
export function HomeNearbyBand() {
  const [status, setStatus] = useState<Status>("idle");
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
          const res = await fetch("/api/spots/coords");
          if (!res.ok) throw new Error("fetch failed");
          const raw = (await res.json()) as RawCoord[];
          const nearest: NearbySpot[] = raw
            .map((c) => ({
              slug: c.s,
              name: c.n,
              lat: c.la,
              lng: c.lo,
              spotType: c.t,
              rating: c.r,
              prefecture: c.p,
              areaName: c.a,
              isFree: c.f,
              distanceKm: haversineKm(lat, lng, c.la, c.lo),
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 5);
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
  }, []);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100">
            <Compass className="size-5 text-sky-600" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold text-sky-900 sm:text-lg">
              近くの釣り場をすぐ探す
            </h2>
            <p className="text-xs text-sky-700 sm:text-sm">
              現在地から近い順に、今すぐ行ける釣り場を地図で表示します。
            </p>
          </div>
        </div>

        {status !== "ready" ? (
          <div className="flex flex-col items-start gap-2">
            <Button
              onClick={locate}
              disabled={status === "locating"}
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sm transition-transform hover:scale-[1.01] sm:w-auto"
            >
              {status === "locating" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Navigation className="size-5" />
              )}
              {status === "locating" ? "現在地を取得中..." : "現在地を許可して探す"}
            </Button>
            {status === "error" && (
              <p className="text-xs text-red-500" role="alert">
                {errorMsg}
              </p>
            )}
            {status === "idle" && (
              <p className="text-xs text-sky-600">
                位置情報はお使いの端末内で処理され、ツリスポが保存することはありません。
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {center && <NearbyMiniMap center={center} spots={spots} />}

            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {spots.map((s) => (
                <li key={s.slug}>
                  <Link
                    prefetch={false}
                    href={`/spots/${s.slug}`}
                    className="flex h-full flex-col gap-1 rounded-xl border bg-white p-3 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-semibold">
                        {s.name}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-sky-600">
                        <Navigation className="size-3" />約{formatDistance(s.distanceKm)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">
                        {s.prefecture} {s.areaName}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {SPOT_TYPE_LABELS[s.spotType]}
                      </Badge>
                      <span className="flex items-center gap-0.5 text-xs text-amber-600">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {s.rating.toFixed(1)}
                      </span>
                      {s.isFree && (
                        <Badge className="bg-emerald-600 text-[10px] hover:bg-emerald-600">
                          無料
                        </Badge>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex justify-center">
              <Link prefetch={false} href="/map">
                <Button variant="outline" className="min-h-[44px] gap-1">
                  全部を地図で見る
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
