import { Metadata } from "next";
import { Fish } from "lucide-react";
import { getFishSpeciesWithSpots } from "@/lib/data";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FishListClient } from "@/components/fish/fish-list-client";

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

function FishListContent() {
  const fishSpecies = getFishSpeciesWithSpots();

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
          釣りで狙える魚{fishSpecies.length}種を図鑑形式で紹介。名前・難易度・旬でかんたん絞り込み。
        </p>
      </div>

      {/* クライアントサイドのフィルター＋一覧 */}
      <FishListClient fishSpecies={fishSpecies} />
    </div>
  );
}
