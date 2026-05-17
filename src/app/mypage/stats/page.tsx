"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { StatsCharts } from "@/components/mypage/stats-charts";

interface ChartsData {
  monthly: { month: string; count: number; label: string }[];
  byFish: { fishName: string; count: number }[];
  bySpot: { spotSlug: string; spotName: string; count: number }[];
  byMethod: { method: string; count: number }[];
  sizeTrend: { date: string; sizeCm: number; fishName: string }[];
  totalReports: number;
}

export default function StatsPage() {
  const { status } = useSession();
  const [data, setData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/charts")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === "loading") {
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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "マイページ", href: "/mypage" },
          { label: "釣果統計" },
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
          <BarChart3 className="h-6 w-6 text-primary" />
          釣果統計
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          月別・魚種別・スポット別の釣果データをグラフで振り返り
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !data ? (
        <p className="text-sm text-destructive">データの取得に失敗しました</p>
      ) : (
        <StatsCharts data={data} />
      )}
    </div>
  );
}
