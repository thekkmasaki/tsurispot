"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, MapPin, CheckCircle2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface PrefEntry {
  slug: string;
  name: string;
  nameShort: string;
  regionGroup: string;
  visited: boolean;
  catchCount: number;
}

interface PrefMapData {
  total: number;
  visitedCount: number;
  completionRate: number;
  prefectures: PrefEntry[];
}

const REGION_ORDER = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州",
  "沖縄",
];

export default function PrefectureMapPage() {
  const { status } = useSession();
  const [data, setData] = useState<PrefMapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/prefecture-map")
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
        <Link prefetch={false}
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

  // 地域別グルーピング
  const byRegion = REGION_ORDER.map((rg) => ({
    regionGroup: rg,
    prefectures: data.prefectures.filter((p) => p.regionGroup === rg),
  }));

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "マイページ", href: "/mypage" },
          { label: "都道府県マップ" },
        ]}
      />

      <Link prefetch={false}
        href="/mypage"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        マイページに戻る
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <MapPin className="h-6 w-6 text-primary" />
          都道府県マップ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          全{data.total}県のうち{" "}
          <span className="font-bold text-primary">{data.visitedCount}県</span>{" "}
          で釣果あり ({data.completionRate}%)
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${data.completionRate}%` }}
          />
        </div>
      </div>

      <div className="space-y-5">
        {byRegion.map(({ regionGroup, prefectures }) => (
          <section key={regionGroup}>
            <h2 className="mb-2 text-sm font-bold text-muted-foreground sm:text-base">
              {regionGroup}
              <span className="ml-2 text-xs font-normal">
                ({prefectures.filter((p) => p.visited).length}/{prefectures.length})
              </span>
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {prefectures.map((p) => (
                <Link prefetch={false}
                  key={p.slug}
                  href={`/prefecture/${p.slug}`}
                  className={`relative rounded-lg border px-2 py-2 text-center transition-all hover:shadow-md ${
                    p.visited
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "bg-muted/30 opacity-60"
                  }`}
                >
                  {p.visited && (
                    <CheckCircle2 className="absolute right-1 top-1 h-3 w-3 text-emerald-500" />
                  )}
                  <p className="text-xs font-medium">{p.nameShort}</p>
                  {p.visited && (
                    <p className="text-[10px] text-emerald-700">{p.catchCount}件</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
