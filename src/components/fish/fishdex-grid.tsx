"use client";
/**
 * 魚図鑑の共通表示（進捗バー・フィルタ・グリッド）。
 * /mypage/fishdex（読み取り専用・サイズ表示あり）と /fishdex（匿名・その場トグルあり）で共用する。
 * 見た目は旧 /mypage/fishdex の実装をそのまま移設（emerald枠・grayscale・sky→emeraldグラデ）。
 */
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

export interface FishdexEntry {
  slug: string;
  name: string;
  imageUrl: string;
  caught: boolean;
  maxSizeCm?: number | null;
}

interface FishdexGridProps {
  entries: FishdexEntry[];
  /** 指定すると各セル右上にその場トグルの○を出す */
  onToggle?: (slug: string) => void;
}

export function FishdexGrid({ entries, onToggle }: FishdexGridProps) {
  const [filter, setFilter] = useState<"all" | "caught" | "uncaught">("all");

  const total = entries.length;
  const caughtCount = entries.filter((f) => f.caught).length;
  const completionRate =
    total > 0 ? Math.round((caughtCount / total) * 100) : 0;

  const filtered =
    filter === "all"
      ? entries
      : filter === "caught"
        ? entries.filter((f) => f.caught)
        : entries.filter((f) => !f.caught);

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        全{total}種のうち{" "}
        <span className="font-bold text-primary">{caughtCount}種</span>{" "}
        釣りました ({completionRate}%)
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      <div className="mb-4 mt-4 flex gap-2">
        {[
          { key: "all" as const, label: `全て (${total})` },
          { key: "caught" as const, label: `釣った (${caughtCount})` },
          { key: "uncaught" as const, label: `未挑戦 (${total - caughtCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === key
                ? "bg-primary text-primary-foreground"
                : "border bg-background hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {caughtCount === 0 && (
        <p className="mb-3 text-xs text-muted-foreground">
          釣ったことのある魚を{onToggle ? "タップ" : "記録"}すると、ここに図鑑ができます
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {filtered.map((f) => (
          <div
            key={f.slug}
            className={`relative rounded-lg border bg-card p-2 text-center transition-all hover:shadow-md ${
              f.caught
                ? "border-emerald-300 bg-emerald-50/30"
                : "opacity-60 grayscale"
            }`}
          >
            {onToggle ? (
              <button
                onClick={() => onToggle(f.slug)}
                aria-pressed={f.caught}
                aria-label={
                  f.caught
                    ? `${f.name} の記録を取り消す`
                    : `${f.name} を釣ったことある`
                }
                title={f.caught ? "記録を取り消す" : "釣ったことある！"}
                className="absolute -right-1 -top-1 z-10 grid h-9 w-9 place-items-center"
              >
                {f.caught ? (
                  <CheckCircle2 className="h-5 w-5 rounded-full bg-card text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 rounded-full bg-card text-muted-foreground/60" />
                )}
              </button>
            ) : (
              f.caught && (
                <CheckCircle2 className="absolute right-1 top-1 h-4 w-4 text-emerald-500" />
              )
            )}
            <Link prefetch={false} href={`/fish/${f.slug}`} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.imageUrl}
                alt={f.name}
                loading="lazy"
                className="mx-auto h-16 w-16 rounded object-cover sm:h-20 sm:w-20"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <p className="mt-1 text-xs font-medium">{f.name}</p>
              {f.caught && f.maxSizeCm ? (
                <p className="text-[10px] text-emerald-700">{f.maxSizeCm}cm</p>
              ) : null}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
