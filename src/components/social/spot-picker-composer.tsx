"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CatchReportForm } from "@/components/spots/catch-report-form";

interface SpotHit {
  type: string;
  name: string;
  slug: string; // "/spots/{slug}"
  sub?: string;
}

interface SelectedSpot {
  slug: string;
  name: string;
}

// タイムライン発の投稿導線: スポットを検索で選んでから既存の釣果フォームを開く。
// フォーム本体は spots 詳細と同じ CatchReportForm を共用（バリデーション・写真・タグ全部そのまま）
export function SpotPickerComposer() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SpotHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SelectedSpot | null>(null);
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
              {selected.name}
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

  return (
    <Card>
      <CardContent className="px-4 py-4">
        <p className="text-sm font-semibold">どこで釣りましたか？</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          釣り場の名前や地名で検索して選んでください（例: 舞子、平磯、閖上）
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

        {searching && <p className="mt-3 text-center text-xs text-muted-foreground">検索中...</p>}
        {!searching && query.trim() && hits.length === 0 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            見つかりませんでした。別の名前・地名でお試しください。
          </p>
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
