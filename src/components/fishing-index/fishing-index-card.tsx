"use client";
/**
 * 今日の釣行指数カード（案③）。トップと /me に置く。
 * - 入力は匿名シグナル: お気に入り(localStorage) + 閲覧履歴 + 保存済み現在地
 * - 行動圏クラスタで「ホーム / 遠征先」を分け、1位表示と通知はホーム内だけ。
 *   遠征先の高得点はスコアを歪めず一行で伝える（横浜の人に和歌山を推さない）
 * - 30分の sessionStorage キャッシュで外部API負荷と表示を安定させる
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Gauge, MapPin, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/use-favorites";
import { IndexPushButton } from "./index-push-button";
import type { FishingIndexResult } from "@/lib/weather/fishing-index";

interface SpotIndex {
  slug: string;
  name: string;
  prefecture: string;
  scores: (number | null)[];
  dates: string[];
  today: FishingIndexResult | null;
  weatherOk: boolean;
}

interface IndexResponse {
  dates: string[];
  spots: SpotIndex[];
  clusters: { spotSlugs: string[]; label: string; isHome: boolean }[];
}

const CACHE_PREFIX = "tsurispot-fidx:";
const CACHE_TTL_MS = 30 * 60 * 1000;

function scoreTextClass(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-sky-700";
  if (score >= 55) return "text-amber-600";
  if (score >= 40) return "text-orange-700";
  return "text-red-700";
}

function readRecentSlugs(): string[] {
  try {
    const raw = localStorage.getItem("tsurispot-recently-viewed");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr)
      ? arr
          .map((s: { slug?: string }) => s?.slug)
          .filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}

function readSavedLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem("tsurispot_user_location");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.latitude === "number" &&
      typeof parsed?.longitude === "number" &&
      Date.now() - (parsed.timestamp ?? 0) < 3600000
    ) {
      return { lat: parsed.latitude, lng: parsed.longitude };
    }
  } catch {
    // noop
  }
  return null;
}

function formatDateChip(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export function FishingIndexCard({ className }: { className?: string }) {
  const { favorites } = useFavorites();
  const [data, setData] = useState<IndexResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState(0);

  useEffect(() => {
    if (favorites.length === 0) {
      setData(null);
      return;
    }
    const cacheKey = CACHE_PREFIX + [...favorites].sort().join(",");
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.t < CACHE_TTL_MS) {
          setData(parsed.data);
          return;
        }
      }
    } catch {
      // noop
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/fishing-index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slugs: favorites,
        recentSlugs: readRecentSlugs(),
        location: readSavedLocation(),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res: IndexResponse | null) => {
        if (cancelled || !res) return;
        setData(res);
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ t: Date.now(), data: res }),
          );
        } catch {
          // noop
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [favorites]);

  const { homeSpots, awaySpots, awayLabel } = useMemo(() => {
    if (!data) {
      return { homeSpots: [] as SpotIndex[], awaySpots: [] as SpotIndex[], awayLabel: "" };
    }
    const home = data.clusters.find((c) => c.isHome);
    const homeSet = new Set(home?.spotSlugs ?? data.spots.map((s) => s.slug));
    const homeSpots = data.spots
      .filter((s) => homeSet.has(s.slug))
      .sort((a, b) => (b.today?.score ?? -1) - (a.today?.score ?? -1));
    const awaySpots = data.spots
      .filter((s) => !homeSet.has(s.slug))
      .sort((a, b) => (b.today?.score ?? -1) - (a.today?.score ?? -1));
    const awayLabel = data.clusters
      .filter((c) => !c.isHome)
      .map((c) => c.label)
      .filter(Boolean)
      .join("・");
    return { homeSpots, awaySpots, awayLabel };
  }, [data]);

  // 選択スポット: デフォルトはホームの1位
  const selected =
    data?.spots.find((s) => s.slug === selectedSlug) ?? homeSpots[0] ?? null;

  if (favorites.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-ocean-mid" />
            <span className="font-medium">今日の釣行指数</span>
            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              NEW
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            行く場所を1ヶ所お気に入りに入れると、潮・マヅメ・風・天気から毎日の指数（0-100点）が出ます。ログインは要りません。
          </p>
          <Link
            prefetch={false}
            href="/fishing-spots/near-me"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-ocean-mid"
          >
            <MapPin className="h-4 w-4" />
            近くのスポットから選ぶ
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (loading && !data) {
    return (
      <Card className={className}>
        <CardContent className="min-h-[180px] p-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-ocean-mid" />
            <span className="font-medium">今日の釣行指数</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            お気に入りの今日の条件を計算中…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !selected) return null;

  const dayScore = selected.scores[dayIdx] ?? null;
  const isToday = dayIdx === 0;
  const today = selected.today;
  const homeTopScore = homeSpots[0]?.today?.score ?? null;
  const awayTop = awaySpots[0];
  const showAwayNote =
    awayTop?.today &&
    homeTopScore !== null &&
    awayTop.today.score > homeTopScore;

  const chip = (s: SpotIndex, muted = false) => (
    <button
      key={s.slug}
      onClick={() => {
        setSelectedSlug(s.slug);
        setDayIdx(0);
      }}
      aria-pressed={selected.slug === s.slug}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        selected.slug === s.slug
          ? "border-ocean-mid bg-ocean-mid text-white"
          : muted
            ? "bg-background text-muted-foreground hover:bg-muted"
            : "bg-background hover:bg-muted",
      )}
    >
      {s.name}
      {s.today ? (
        <span className={cn("ml-1 font-bold", selected.slug === s.slug ? "" : scoreTextClass(s.today.score))}>
          {s.today.score}
        </span>
      ) : null}
    </button>
  );

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Gauge className="h-5 w-5 text-ocean-mid" />
          <span className="font-medium">今日の釣行指数</span>
          <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
            NEW
          </span>
          {today && (
            <span className="ml-auto text-xs text-muted-foreground">
              {formatDateChip(selected.dates[0] ?? "")} ・ {today.tide.tideLabel} ・
              月齢{today.tide.moonAge.toFixed(1)}
            </span>
          )}
        </div>

        {/* スポットチップ（ホーム → 遠征先の順。距離ロジックの見せ場） */}
        <div className="mt-3 overflow-x-auto pb-1">
          <div className="flex w-max items-center gap-1.5">
            {homeSpots.map((s) => chip(s))}
            {awaySpots.length > 0 && (
              <span className="ml-1 shrink-0 text-[10px] text-muted-foreground">
                遠征先{awayLabel ? `（${awayLabel}）` : ""}
              </span>
            )}
            {awaySpots.map((s) => chip(s, true))}
          </div>
        </div>

        {!selected.weatherOk || !today ? (
          <p className="mt-3 text-sm text-muted-foreground">
            天気データを取得できませんでした。潮回りは
            {today?.tide.tideLabel ?? "—"}です。時間をおいて再度お試しください。
          </p>
        ) : (
          <>
            {/* スコア */}
            <div className="mt-3 flex items-center gap-4">
              <div className="text-center">
                <div
                  className={cn(
                    "text-4xl font-bold leading-none",
                    dayScore !== null ? scoreTextClass(dayScore) : "",
                  )}
                >
                  {dayScore ?? "—"}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">／100</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">
                  {dayScore !== null && today
                    ? isToday
                      ? today.label
                      : ""
                    : ""}
                  {!isToday && dayScore !== null && (
                    <span>{formatDateChip(selected.dates[dayIdx] ?? "")} の指数</span>
                  )}
                  {isToday && homeSpots[0]?.slug === selected.slug && (
                    <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                      お気に入り{data.spots.length}ヶ所で今日の1位
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {selected.name}（{selected.prefecture}）
                </div>
                {isToday && today.best && (
                  <div className="mt-1 text-xs">
                    <span className="font-medium text-ocean-mid">
                      今日のベスト {String(today.best.startHour).padStart(2, "0")}:00〜
                      {String(today.best.endHour).padStart(2, "0")}:00
                    </span>
                    <span className="ml-1 text-muted-foreground">
                      {today.best.detail}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 内訳（今日のみ。合計は必ず総合点に一致する） */}
            {isToday && (
              <details className="group mt-3">
                <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-muted-foreground">
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                  なぜ{today.score}点か（内訳を見る）
                </summary>
                <div className="mt-2 space-y-2">
                  {today.breakdown.map((row) => (
                    <div key={row.key}>
                      <div className="flex items-center justify-between text-xs">
                        <span>{row.label}</span>
                        <span className="font-medium tabular-nums">
                          {row.value}/{row.max}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-ocean-mid"
                          style={{ width: `${(row.value / row.max) * 100}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {row.reason}
                      </p>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground">
                    {today.profile === "no-sea-temp"
                      ? "※ このスポットは海面水温が取得できないため、配点は 潮35・マヅメ25・風20・天気20。"
                      : "※ 配点は 潮35・マヅメ25・風20・天気15・水温5。"}
                    潮汐は月齢からの概算です。
                  </p>
                </div>
              </details>
            )}

            {/* 7日ストリップ */}
            {selected.scores.length > 1 && (
              <div className="mt-3 overflow-x-auto pb-1">
                <div className="flex w-max gap-1.5">
                  {selected.dates.map((d, i) => {
                    const v = selected.scores[i];
                    return (
                      <button
                        key={d}
                        onClick={() => setDayIdx(i)}
                        aria-pressed={dayIdx === i}
                        className={cn(
                          "flex w-[52px] shrink-0 flex-col items-center rounded-lg border px-1 py-1.5",
                          dayIdx === i ? "border-ocean-mid" : "border-border",
                        )}
                      >
                        <span className="text-[10px] text-muted-foreground">
                          {i === 0 ? "今日" : formatDateChip(d)}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            v !== null ? scoreTextClass(v) : "",
                          )}
                        >
                          {v ?? "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 遠征先の高得点は一行で（1位表示は歪めない） */}
            {showAwayNote && awayTop.today && (
              <p className="mt-2 text-xs text-muted-foreground">
                遠征先の{awayTop.name}は今日
                <span className={cn("mx-0.5 font-bold", scoreTextClass(awayTop.today.score))}>
                  {awayTop.today.score}点
                </span>
                。行動圏（60km目安）ごとに分けて表示しています。
              </p>
            )}

            <div className="mt-3">
              <IndexPushButton favorites={favorites} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
