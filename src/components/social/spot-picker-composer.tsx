"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { Map, MapPin, PlusCircle, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CatchReportForm } from "@/components/spots/catch-report-form";
import type { PickedSpot } from "./post-spot-map-picker";

// 地図（Leaflet + 全スポット座標184KB）は「地図から選ぶ」を開いた時にだけ読み込む
const PostSpotMapPicker = nextDynamic(
  () => import("./post-spot-map-picker").then((m) => m.PostSpotMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full animate-pulse rounded-xl bg-muted sm:h-80" />
    ),
  }
);

interface SpotHit {
  type: string;
  name: string;
  slug: string; // "/spots/{slug}"
  sub?: string;
}

// タイムライン発の投稿導線: スポットを検索 or 地図で選んでから既存の釣果フォームを開く。
// フォーム本体は spots 詳細と同じ CatchReportForm を共用（バリデーション・写真・タグ全部そのまま）
export function SpotPickerComposer() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SpotHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<PickedSpot | null>(null);
  const [showMap, setShowMap] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    if (!q || selected) {
      setHits([]);
      return;
    }
    timerRef.current = setTimeout(() => {
      setSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((items: SpotHit[]) => {
          setHits((items || []).filter((i) => i.type === "spot").slice(0, 8));
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, selected]);

  if (selected) {
    return (
      <Card>
        <CardContent className="px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <MapPin className="size-4 text-sky-700" aria-hidden="true" />
              {selected.slug ? selected.name : "場所を選ばず投稿"}
            </p>
            <button
              onClick={() => {
                setSelected(null);
                setQuery("");
              }}
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              <X className="size-3" aria-hidden="true" />
              スポットを変更
            </button>
          </div>
          <CatchReportForm spotSlug={selected.slug} spotName={selected.name} />
        </CardContent>
      </Card>
    );
  }

  const notFound = !searching && query.trim() !== "" && hits.length === 0;

  return (
    <Card>
      <CardContent className="px-4 py-4">
        <p className="text-sm font-semibold">どこで釣りましたか？</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          釣り場の名前や地名で検索するか、地図から選んでください（例: 舞子、平磯、閖上）
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-full border bg-background px-4 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="スポット名・地名で検索"
            aria-label="スポット検索"
            maxLength={50}
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            aria-expanded={showMap}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-sky-800 transition-colors hover:bg-sky-50"
          >
            <Map className="size-3.5" aria-hidden="true" />
            {showMap ? "地図を閉じる" : "地図から選ぶ"}
          </button>
          {/* 場所なし投稿: タイムライン・マイページにのみ載る（スポットページには出ない） */}
          <button
            type="button"
            onClick={() => setSelected({ slug: "", name: "" })}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            場所を選ばずに投稿する
          </button>
        </div>

        {showMap && (
          <div className="mt-3">
            <PostSpotMapPicker
              onSelect={(spot) => {
                setSelected(spot);
                setShowMap(false);
              }}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              ピンをタップ →「この釣り場で投稿する」で選択できます。
            </p>
          </div>
        )}

        {searching && <p className="mt-3 text-center text-xs text-muted-foreground">検索中...</p>}
        {notFound && (
          <div className="mt-3 rounded-xl border bg-muted/30 px-4 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              「{query.trim()}」に一致する釣り場が見つかりませんでした。
              <br />
              別の名前・地名で検索するか、地図から探してみてください。
            </p>
            <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
              {!showMap && (
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5 text-xs font-medium text-sky-800 transition-colors hover:bg-sky-50"
                >
                  <Map className="size-3.5" aria-hidden="true" />
                  地図から探す
                </button>
              )}
              <Link
                prefetch={false}
                href={`/contact?from=spot-request&q=${encodeURIComponent(query.trim())}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-sky-800"
              >
                <PlusCircle className="size-3.5" aria-hidden="true" />
                この釣り場の追加をリクエスト
              </Link>
            </div>
          </div>
        )}
        {hits.length > 0 && (
          <ul className="mt-3 divide-y rounded-xl border">
            {hits.map((h) => (
              <li key={h.slug}>
                <button
                  onClick={() =>
                    setSelected({
                      slug: h.slug.replace(/^\/spots\//, ""),
                      name: h.name,
                    })
                  }
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                >
                  <MapPin className="size-4 shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{h.name}</span>
                    {h.sub && (
                      <span className="block text-xs text-muted-foreground">{h.sub}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
