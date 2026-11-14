"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, Loader2, MapPin, Navigation, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** 都道府県ページの一覧カードに必要な最小フィールド（サーバーから直列化して渡す） */
export interface AreaShopItem {
  id: string;
  slug: string;
  name: string;
  areaName: string;
  prefecture: string;
  address: string;
  phone: string;
  businessHours: string;
  description: string;
  latitude: number;
  longitude: number;
  hasLiveBait: boolean;
  hasFrozenBait: boolean;
  hasRentalRod: boolean;
  hasParking: boolean;
  is24h: boolean;
  early: boolean;
  lateNight: boolean;
  hoursLabels: string[];
  planLevel: "free" | "basic" | "pro";
}

type FilterKey = "is24h" | "early" | "lateNight" | "hasLiveBait" | "hasFrozenBait" | "hasParking";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "is24h", label: "24時間営業" },
  { key: "early", label: "早朝営業" },
  { key: "lateNight", label: "夜22時以降も営業" },
  { key: "hasLiveBait", label: "活きエサあり" },
  { key: "hasFrozenBait", label: "冷凍エサあり" },
  { key: "hasParking", label: "駐車場あり" },
];

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; lat: number; lng: number }
  | { status: "error"; message: string };

export function AreaShopList({ shops, prefName }: { shops: AreaShopItem[]; prefName: string }) {
  const [active, setActive] = useState<Set<FilterKey>>(new Set());
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  const counts = useMemo(() => {
    const c = {} as Record<FilterKey, number>;
    for (const f of FILTERS) c[f.key] = shops.filter((s) => s[f.key]).length;
    return c;
  }, [shops]);

  const visible = useMemo(() => {
    const filtered = shops.filter((s) => [...active].every((k) => s[k]));
    const withDist = filtered.map((s) => ({
      shop: s,
      dist: geo.status === "ok" ? distanceKm(geo.lat, geo.lng, s.latitude, s.longitude) : null,
    }));
    if (geo.status === "ok") withDist.sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0));
    return withDist;
  }, [shops, active, geo]);

  const toggle = (key: FilterKey) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "error", message: "このブラウザは現在地の取得に対応していません。" });
      return;
    }
    setGeo({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ status: "ok", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () =>
        setGeo({
          status: "error",
          message: "現在地を取得できませんでした。ブラウザの位置情報の許可を確認してください。",
        }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <div>
      {/* 近い順・絞り込み */}
      <div className="mb-4 space-y-3 rounded-xl border bg-muted/30 p-3 sm:p-4">
        <button
          type="button"
          onClick={locate}
          disabled={geo.status === "loading"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70 sm:w-auto"
        >
          {geo.status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Navigation className="size-4" />
          )}
          {geo.status === "ok" ? "現在地から近い順に並べています（再取得）" : "現在地から近い順に並べる"}
        </button>
        {geo.status === "error" && <p className="text-xs text-red-600">{geo.message}</p>}
        <div className="flex flex-wrap gap-2" role="group" aria-label="釣具店の絞り込み">
          {FILTERS.filter((f) => counts[f.key] > 0).map((f) => {
            const on = active.has(f.key);
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(f.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {f.label}
                <span className="ml-1 opacity-70">{counts[f.key]}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {prefName}の{visible.length}件を表示中
          {geo.status === "ok" && "（直線距離の目安）"}。営業時間は変わることがあるため、来店前に店舗へご確認ください。
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border bg-muted/30 py-10 text-center text-sm text-muted-foreground">
          条件に合う店舗がありません。絞り込みを外してください。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {visible.map(({ shop, dist }) => {
            const isPro = shop.planLevel === "pro";
            const isPaid = isPro || shop.planLevel === "basic";
            return (
              <Link prefetch={false} key={shop.id} href={`/shops/${shop.slug}`} className="group block">
                <Card className="h-full transition-shadow hover:shadow-md group-hover:border-primary/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-snug transition-colors group-hover:text-primary">
                        {shop.name}
                      </CardTitle>
                      <ChevronRight className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shop.prefecture} · {shop.areaName}エリア
                      {dist !== null && (
                        <span className="ml-2 font-bold text-primary">約{dist < 10 ? dist.toFixed(1) : Math.round(dist)}km</span>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="size-4 shrink-0 text-muted-foreground" />
                      <span className="line-clamp-1">{shop.address}</span>
                    </div>
                    {shop.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="size-4 shrink-0 text-muted-foreground" />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4 shrink-0 text-muted-foreground" />
                      <span className="line-clamp-1">{shop.businessHours}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {shop.hoursLabels.map((l) => (
                        <Badge
                          key={l}
                          variant="secondary"
                          className="bg-violet-100 text-xs text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300"
                        >
                          {l}
                        </Badge>
                      ))}
                      {shop.hasLiveBait && (
                        <Badge variant="secondary" className="bg-green-100 text-xs text-green-700 hover:bg-green-100">
                          活きエサ
                        </Badge>
                      )}
                      {shop.hasFrozenBait && (
                        <Badge variant="secondary" className="bg-blue-100 text-xs text-blue-700 hover:bg-blue-100">
                          冷凍エサ
                        </Badge>
                      )}
                      {shop.hasRentalRod && (
                        <Badge variant="secondary" className="bg-indigo-100 text-xs text-indigo-700 hover:bg-indigo-100">
                          レンタルロッド
                        </Badge>
                      )}
                      {shop.hasParking && (
                        <Badge variant="secondary" className="bg-amber-100 text-xs text-amber-700 hover:bg-amber-100">
                          駐車場あり
                        </Badge>
                      )}
                      {isPaid && (
                        <Badge
                          className={
                            isPro
                              ? "bg-amber-100 text-xs text-amber-700 hover:bg-amber-100"
                              : "bg-blue-100 text-xs text-blue-700 hover:bg-blue-100"
                          }
                        >
                          {isPro ? "公式（プロ）" : "公式"}
                        </Badge>
                      )}
                    </div>

                    <p className="line-clamp-2 pt-1 text-sm text-muted-foreground">{shop.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
