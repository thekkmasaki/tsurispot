"use client";

import { useEffect, useRef, useState } from "react";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import {
  Navigation,
  Loader2,
  ArrowRight,
  Compass,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SPOT_TYPE_LABELS } from "@/types";
import { useNearbySpots, formatDistance } from "./use-nearby-spots";
import type { AreaMarker } from "@/lib/geo/home-area-markers";

// 実地図（Leaflet + CARTO タイル）は「スクロールで近づいた時」にだけ読み込む（初期バンドル/初期HTMLに乗せない）。
const HomeMapView = nextDynamic(
  () => import("./home-map-view").then((m) => m.HomeMapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full animate-pulse rounded-xl bg-muted sm:h-80" />
    ),
  }
);

/**
 * ホーム ヒーロー直下の地図バンド（旧「近くの釣り場をすぐ探す」カードを置換）。
 * - 外枠・見出し・主要エリアリンク・コントロールは SSR され初期 HTML に含まれる（即表示・SEO内部リンク）。
 * - 実地図は IntersectionObserver で可視接近時に遅延マウント（軽さの担保）。
 * - 「現在地から探す」押下時のみ geolocation ＋ /api/spots/coords を 1 回取得し nearby 表示へ。
 */
export function HomeMapBand({ areaMarkers }: { areaMarkers: AreaMarker[] }) {
  const [inView, setInView] = useState(false);
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const { status, errorMsg, center, spots, locate } = useNearbySpots();

  useEffect(() => {
    if (inView) return;
    const el = mapAreaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  const mode = status === "ready" && center ? "nearby" : "overview";

  // チップを地方ごとにグルーピング（areaMarkers は prefectures 順＝地方順で来る）。
  const chipGroups: { region: string; items: AreaMarker[] }[] = [];
  for (const a of areaMarkers) {
    let g = chipGroups.find((x) => x.region === a.regionGroup);
    if (!g) {
      g = { region: a.regionGroup, items: [] };
      chipGroups.push(g);
    }
    g.items.push(a);
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100">
            <Compass className="size-5 text-sky-600" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold text-sky-900 sm:text-lg">
              地図で釣り場を探す
            </h2>
            <p className="text-xs text-sky-700 sm:text-sm">
              エリアのピンをタップ、または現在地から近い順に。
            </p>
          </div>
        </div>

        {/* 実地図（スクロールで近づいた時だけ遅延ロード） */}
        <div ref={mapAreaRef} className="relative">
          {inView ? (
            <HomeMapView
              mode={mode}
              areaMarkers={areaMarkers}
              center={center}
              nearbySpots={spots}
            />
          ) : (
            <div
              className="h-72 w-full animate-pulse rounded-xl bg-muted sm:h-80"
              aria-hidden="true"
            />
          )}
        </div>

        {/* 全都道府県（SSR される実リンク＝内部リンク/SEO・JS 無しでも辿れる）。地方ごとにグルーピング。 */}
        <nav aria-label="都道府県から探す" className="mt-3 space-y-1.5">
          {chipGroups.map((g) => (
            <div key={g.region} className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 shrink-0 text-[11px] font-bold text-sky-900/60">
                {g.region}
              </span>
              {g.items.map((a) => (
                <Link
                  key={a.slug}
                  prefetch={false}
                  href={`/prefecture/${a.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white/70 px-2.5 py-1 text-xs font-medium text-sky-800 transition-colors hover:bg-white"
                >
                  {a.nameShort}
                  <span className="text-[10px] text-sky-500">
                    {a.count.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* 現在地の近い順リスト（取得後のみ） */}
        {status === "ready" && spots.length > 0 && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                      <Navigation className="size-3" />約
                      {formatDistance(s.distanceKm)}
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
        )}

        {/* コントロール */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
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
            {status === "locating"
              ? "現在地を取得中..."
              : status === "ready"
                ? "現在地から近い順に表示中"
                : "現在地から探す"}
          </Button>
          <Link prefetch={false} href="/map" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full min-h-[44px] gap-1 sm:w-auto"
            >
              全国を地図で見る
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <p className="text-xs text-sky-600 sm:ml-auto">
            位置情報は端末内で処理され、保存されません。
          </p>
        </div>
        {status === "error" && (
          <p className="mt-2 text-xs text-red-500" role="alert">
            {errorMsg}
          </p>
        )}
      </div>
    </section>
  );
}
