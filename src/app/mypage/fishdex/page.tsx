"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Fish, CheckCircle2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface FishEntry {
  slug: string;
  name: string;
  imageUrl: string;
  caught: boolean;
  maxSizeCm: number | null;
  firstCaughtAt: string | null;
}

interface FishdexData {
  total: number;
  caughtCount: number;
  completionRate: number;
  fish: FishEntry[];
}

export default function FishdexPage() {
  const { status } = useSession();
  const [data, setData] = useState<FishdexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "caught" | "uncaught">("all");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/fishdex")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">ログインが必要です。</p>
        <Link
          href="/login"
          className="mt-3 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          ログイン
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-destructive">データの取得に失敗しました</p>
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? data.fish
      : filter === "caught"
        ? data.fish.filter((f) => f.caught)
        : data.fish.filter((f) => !f.caught);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "マイページ", href: "/mypage" },
          { label: "魚種図鑑" },
        ]}
      />

      <Link
        href="/mypage"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        マイページに戻る
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <Fish className="h-6 w-6 text-primary" />
          魚種図鑑
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          全{data.total}種のうち <span className="font-bold text-primary">{data.caughtCount}種</span> 釣りました ({data.completionRate}%)
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${data.completionRate}%` }}
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {[
          { key: "all" as const, label: `全て (${data.total})` },
          { key: "caught" as const, label: `釣った (${data.caughtCount})` },
          { key: "uncaught" as const, label: `未挑戦 (${data.total - data.caughtCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
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

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {filtered.map((f) => (
          <Link
            key={f.slug}
            href={`/fish/${f.slug}`}
            className={`relative rounded-lg border bg-card p-2 text-center transition-all hover:shadow-md ${
              f.caught ? "border-emerald-300 bg-emerald-50/30" : "opacity-60 grayscale"
            }`}
          >
            {f.caught && (
              <CheckCircle2 className="absolute right-1 top-1 h-4 w-4 text-emerald-500" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.imageUrl}
              alt={f.name}
              className="mx-auto h-16 w-16 rounded object-cover sm:h-20 sm:w-20"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p className="mt-1 text-xs font-medium">{f.name}</p>
            {f.caught && f.maxSizeCm && (
              <p className="text-[10px] text-emerald-700">{f.maxSizeCm}cm</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
