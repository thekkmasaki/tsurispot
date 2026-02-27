import type { Metadata } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { CompareClient } from "./compare-client";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "スポット比較",
  description: "釣りスポットを並べて比較。施設、釣れる魚、難易度などを一覧で確認できます。",
  robots: { index: false },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>;
}) {
  const params = await searchParams;
  const slugList = (params.slugs || "").split(",").filter(Boolean);
  const spots = slugList
    .map((s) => fishingSpots.find((sp) => sp.slug === s))
    .filter(Boolean) as typeof fishingSpots;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣りスポット", href: "/spots" },
          { label: "スポット比較" },
        ]}
      />
      <h1 className="mb-6 text-xl font-bold sm:text-2xl">スポット比較</h1>
      <CompareClient spots={spots} />
    </div>
  );
}
