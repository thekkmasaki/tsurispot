"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Camera, Loader2, MapPin, Navigation, Check } from "lucide-react";
import { SPOT_TYPE_LABELS } from "@/types";
import type { WantedSpot } from "@/lib/photo-wanted";
import { distanceKm, NEAR_KM } from "./geo";

const PAGE_SIZE = 30;

/**
 * 写真募集一覧（/photo-wanted）。
 * 初期 HTML は人気順30件。現在地・都道府県で絞るときに /api/photo-wanted/list を1回取得する。
 * 表示中のスポットは /api/spot-photo/counts で「みんなの投稿写真」の有無を確認して印を出す。
 */
export function PhotoWantedClient({
  initialSpots,
  totalCount,
  prefectures,
}: {
  initialSpots: WantedSpot[];
  totalCount: number;
  /** [県名, 件数]（件数の多い順） */
  prefectures: [string, number][];
}) {
  const [all, setAll] = useState<WantedSpot[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [pref, setPref] = useState("");
  const [loc, setLoc] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadAll = useCallback(() => {
    if (all || busy) return;
    setBusy(true);
    fetch("/api/photo-wanted/list")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((list: WantedSpot[]) => setAll(list))
      .catch(() => setError("一覧を読み込めませんでした。時間をおいてお試しください。"))
      .finally(() => setBusy(false));
  }, [all, busy]);

  const locate = () => {
    loadAll();
    if (!navigator.geolocation) {
      setError("お使いのブラウザは位置情報に対応していません");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLoc([p.coords.latitude, p.coords.longitude]);
        setPref("");
        setLimit(PAGE_SIZE);
        setLocating(false);
      },
      () => {
        setError("位置情報を取得できませんでした。都道府県から選んでください。");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const list = useMemo(() => {
    const src = all ?? initialSpots;
    if (loc) {
      return src
        .map((s) => ({ ...s, dist: distanceKm(loc[0], loc[1], s.lat, s.lng) }))
        .sort((a, b) => a.dist - b.dist);
    }
    const filtered = pref ? src.filter((s) => s.prefecture === pref) : src;
    return filtered.map((s) => ({ ...s, dist: undefined as number | undefined }));
  }, [all, initialSpots, loc, pref]);

  const nearCount = loc ? list.filter((s) => (s.dist ?? Infinity) <= NEAR_KM).length : null;
  const resultCount = all || loc || pref ? list.length : totalCount;
  const visible = list.slice(0, limit);
  const visibleKey = visible.map((s) => s.slug).join(",");

  // 表示中のスポットに、みんなの投稿写真があるか（あれば「投稿あり」）
  useEffect(() => {
    const need = visibleKey.split(",").filter((s) => s && !(s in counts)).slice(0, 30);
    if (need.length === 0) return;
    let active = true;
    fetch(`/api/spot-photo/counts?slugs=${need.join(",")}`)
      .then((r) => (r.ok ? r.json() : { counts: {} }))
      .catch(() => ({ counts: {} }))
      .then((d: { counts?: Record<string, number> }) => {
        if (!active) return;
        // 取得できなかった slug も 0 で埋めて、同じ slug を何度も問い合わせないようにする
        const filled = Object.fromEntries(need.map((s) => [s, d.counts?.[s] ?? 0]));
        setCounts((prev) => ({ ...prev, ...filled }));
      });
    return () => {
      active = false;
    };
  }, [visibleKey, counts]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl bg-muted p-4 sm:flex-row sm:items-end">
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
        >
          {locating ? <Loader2 className="size-4 animate-spin" /> : <Navigation className="size-4" />}
          {loc ? "現在地から近い順に表示中" : "現在地の近くで探す"}
        </button>
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-bold text-muted-foreground">都道府県から探す</span>
          <select
            value={pref}
            onChange={(e) => {
              setPref(e.target.value);
              setLoc(null);
              setLimit(PAGE_SIZE);
              if (e.target.value) loadAll();
            }}
            className="h-11 w-full rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">全国（人気順）</option>
            {prefectures.map(([name, n]) => (
              <option key={name} value={name}>
                {name}（残り{n}）
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <p className="mt-5 text-sm" aria-live="polite">
        {busy && !all ? (
          "読み込み中..."
        ) : nearCount !== null ? (
          <>
            あなたの近く{NEAR_KM}km以内で <span className="text-2xl font-black text-primary">残り{nearCount}</span> スポット
          </>
        ) : (
          <>
            {pref || "全国"}で <span className="text-2xl font-black text-primary">残り{resultCount.toLocaleString()}</span> スポット
          </>
        )}
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((s) => {
          const posted = (counts[s.slug] ?? 0) > 0;
          return (
            <li key={s.slug} className="flex flex-col rounded-xl border bg-card p-4">
              <Link prefetch={false} href={`/spots/${s.slug}`} className="font-bold leading-snug hover:text-primary hover:underline">
                {s.name}
              </Link>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" aria-hidden="true" />
                {SPOT_TYPE_LABELS[s.spotType]} − {s.prefecture} {s.areaName}
                {s.dist !== undefined && <span className="font-bold text-primary">・約{s.dist.toFixed(1)}km</span>}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                {posted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    <Check className="size-3.5" aria-hidden="true" />
                    投稿あり（{counts[s.slug]}枚）
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600">写真なし</span>
                )}
                <Link
                  prefetch={false}
                  href={`/spots/${s.slug}#spot-photo-upload`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                >
                  <Camera className="size-3.5" aria-hidden="true" />
                  写真を投稿する
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {resultCount > limit && (
        <button
          type="button"
          onClick={() => {
            loadAll();
            setLimit((n) => n + PAGE_SIZE);
          }}
          className="mt-6 flex h-[52px] w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 sm:mx-auto sm:w-80"
        >
          もっと見る
        </button>
      )}
    </div>
  );
}
