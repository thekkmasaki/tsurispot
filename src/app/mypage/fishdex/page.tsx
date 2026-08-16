"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Fish } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FishdexGrid } from "@/components/fish/fishdex-grid";

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

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "マイページ", href: "/mypage" },
          { label: "魚種図鑑" },
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
          <Fish className="h-6 w-6 text-primary" />
          魚種図鑑
        </h1>
      </div>

      <FishdexGrid entries={data.fish} />
    </div>
  );
}
