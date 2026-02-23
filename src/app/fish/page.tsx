import { Metadata } from "next";
import { Fish } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getFishSpeciesWithSpots } from "@/lib/data";
import { FishCard } from "@/components/fish/fish-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "魚種図鑑 - 釣りで狙える魚の旬・釣り方・食べ方ガイド",
  description:
    "釣りで狙える海水魚・淡水魚を図鑑形式で紹介。魚ごとの旬の時期、初心者でも釣りやすい難易度、おすすめの食べ方まで網羅。アジ・サバ・カサゴなど人気ターゲットの釣り情報が満載です。",
  openGraph: {
    title: "魚種図鑑 - 釣りで狙える魚の旬・釣り方・食べ方ガイド",
    description:
      "釣りで狙える海水魚・淡水魚を図鑑形式で紹介。旬の時期、難易度、おすすめの食べ方まで網羅。",
    type: "website",
    url: "https://tsurispot.com/fish",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/fish",
  },
};

export default function FishListPage() {
  return <FishListContent />;
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://tsurispot.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "魚種図鑑",
      item: "https://tsurispot.com/fish",
    },
  ],
};

// 釣れやすい順ソート（初心者向け→中級→上級、同難易度内は人気順）
function sortByEase<T extends { difficulty: string; popularity?: number }>(list: T[]): T[] {
  const diffOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
  return [...list].sort((a, b) => {
    const dDiff = (diffOrder[a.difficulty] ?? 2) - (diffOrder[b.difficulty] ?? 2);
    if (dDiff !== 0) return dDiff;
    return (a.popularity ?? 999) - (b.popularity ?? 999);
  });
}

function FishListContent() {
  const currentMonth = new Date().getMonth() + 1;
  const fishSpecies = getFishSpeciesWithSpots();

  const seaFish = sortByEase(fishSpecies.filter((f) => f.category === "sea"));
  const brackishFish = sortByEase(fishSpecies.filter((f) => f.category === "brackish"));
  const freshwaterFish = sortByEase(fishSpecies.filter((f) => f.category === "freshwater"));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "魚図鑑" },
        ]}
      />
      {/* ページヘッダー */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100">
            <Fish className="size-5 text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            魚種図鑑
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          釣りで狙える魚{fishSpecies.length}種を人気順に紹介。タップして詳しい情報を見よう。
        </p>
      </div>

      {/* 海水魚セクション */}
      {seaFish.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-sky-100 text-sm text-sky-700 hover:bg-sky-100">
              海水魚
            </Badge>
            <span className="text-sm text-muted-foreground">
              {seaFish.length}種
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {seaFish.map((fish) => (
              <FishCard
                key={fish.id}
                fish={fish}
                showPeakBadge={fish.peakMonths.includes(currentMonth)}
                showSpots
              />
            ))}
          </div>
        </section>
      )}

      {/* 汽水魚セクション */}
      {brackishFish.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-teal-100 text-sm text-teal-700 hover:bg-teal-100">
              汽水魚
            </Badge>
            <span className="text-sm text-muted-foreground">
              {brackishFish.length}種
            </span>
            <span className="text-xs text-muted-foreground">
              — 海と川の両方で釣れる魚
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {brackishFish.map((fish) => (
              <FishCard
                key={fish.id}
                fish={fish}
                showPeakBadge={fish.peakMonths.includes(currentMonth)}
                showSpots
              />
            ))}
          </div>
        </section>
      )}

      {/* 淡水魚セクション */}
      {freshwaterFish.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-emerald-100 text-sm text-emerald-700 hover:bg-emerald-100">
              淡水魚
            </Badge>
            <span className="text-sm text-muted-foreground">
              {freshwaterFish.length}種
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {freshwaterFish.map((fish) => (
              <FishCard
                key={fish.id}
                fish={fish}
                showPeakBadge={fish.peakMonths.includes(currentMonth)}
                showSpots
              />
            ))}
          </div>
        </section>
      )}

      {seaFish.length === 0 && freshwaterFish.length === 0 && brackishFish.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          魚種データがありません。
        </p>
      )}
    </div>
  );
}
