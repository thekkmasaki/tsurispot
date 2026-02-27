import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { PlannerClient } from "./planner-client";

export const metadata: Metadata = {
  title: "釣行プランナー | ツリスポ",
  description:
    "複数の釣りスポットを選んで釣行計画を作成。ルートや釣れる魚を一覧で確認して、効率的な釣行プランを立てましょう。",
  openGraph: {
    title: "釣行プランナー | ツリスポ",
    description:
      "複数の釣りスポットを選んで釣行計画を作成。効率的な釣行プランを立てましょう。",
    type: "website",
    url: "https://tsurispot.com/planner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/planner",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
    { "@type": "ListItem", position: 2, name: "釣行プランナー", item: "https://tsurispot.com/planner" },
  ],
};

// SSGでスポットの軽量サマリーだけ渡す
const spotSummaries = fishingSpots.map((s) => ({
  slug: s.slug,
  name: s.name,
  prefecture: s.region.prefecture,
  area: s.region.areaName,
  spotType: s.spotType,
  fish: s.catchableFish.slice(0, 5).map((cf) => cf.fish.name),
  hasParking: s.hasParking,
  hasToilet: s.hasToilet,
  isFree: s.isFree,
  rating: s.rating,
}));

export type SpotSummary = (typeof spotSummaries)[number];

export default function PlannerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="mb-6 text-sm text-muted-foreground" aria-label="パンくず">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground">ホーム</Link></li>
          <li>/</li>
          <li className="font-medium text-foreground">釣行プランナー</li>
        </ol>
      </nav>

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="size-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            釣行プランナー
          </h1>
        </div>
        <p className="text-sm text-muted-foreground sm:text-base">
          行きたい釣りスポットを追加して、釣行計画を作成しましょう。プランはURLで共有できます。
        </p>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-muted-foreground">読み込み中...</div>}>
        <PlannerClient spots={spotSummaries} />
      </Suspense>
    </div>
  );
}
