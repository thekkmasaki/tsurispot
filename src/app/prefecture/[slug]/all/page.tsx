import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { fishingSpots } from "@/lib/data/spots";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import type { FishingSpot } from "@/types";

type SpotType = FishingSpot["spotType"];

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return prefectures.map((pref) => ({ slug: pref.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pref = getPrefectureBySlug(slug);
  if (!pref) return { title: "ページが見つかりません" };

  const spotCount = fishingSpots.filter((s) => s.region.prefecture === pref.name).length;
  const title = `${pref.name}の釣り場全${spotCount}件【完全リスト】| ツリスポ`;
  const description = `${pref.name}の釣り場全${spotCount}件を釣り場タイプ別・難易度別に一覧。漁港・堤防・磯・サーフ・河川のスポットを評価順で網羅。地元の釣り場探しに。`;
  const pageUrl = `https://tsurispot.com/prefecture/${slug}/all`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      siteName: "ツリスポ",
    },
    alternates: { canonical: pageUrl },
  };
}

function groupBySpotType(spots: FishingSpot[]): Map<SpotType, FishingSpot[]> {
  const map = new Map<SpotType, FishingSpot[]>();
  for (const s of spots) {
    const list = map.get(s.spotType) ?? [];
    list.push(s);
    map.set(s.spotType, list);
  }
  // 各グループを rating 降順にソート
  for (const [k, v] of map) {
    map.set(k, v.sort((a, b) => b.rating - a.rating));
  }
  return map;
}

export default async function PrefectureAllSpotsPage({ params }: PageProps) {
  const { slug } = await params;
  const pref = getPrefectureBySlug(slug);
  if (!pref) notFound();

  const prefSpots = fishingSpots.filter((s) => s.region.prefecture === pref.name);
  if (prefSpots.length === 0) notFound();

  const grouped = groupBySpotType(prefSpots);
  const totalCount = prefSpots.length;

  // 釣り場タイプ別件数（ヘッダー表示用）
  const typeStats: { type: SpotType; count: number }[] = [];
  for (const [type, spots] of grouped) {
    typeStats.push({ type, count: spots.length });
  }
  typeStats.sort((a, b) => b.count - a.count);

  const pageUrl = `https://tsurispot.com/prefecture/${slug}/all`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "都道府県一覧", item: "https://tsurispot.com/prefecture" },
      { "@type": "ListItem", position: 3, name: pref.name, item: `https://tsurispot.com/prefecture/${pref.slug}` },
      { "@type": "ListItem", position: 4, name: "全スポット一覧", item: pageUrl },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "都道府県一覧", href: "/prefecture" },
          { label: pref.name, href: `/prefecture/${pref.slug}` },
          { label: "全スポット一覧" },
        ]}
      />

      <Link prefetch={false}
        href={`/prefecture/${pref.slug}`}
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        {pref.name}トップに戻る
      </Link>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {pref.name}の釣り場 全{totalCount}件
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {pref.name}の釣り場を釣り場タイプ別に評価順で網羅したリストです。気になるスポットをクリックして詳細を確認してください。
        </p>

        {/* 釣り場タイプ別件数 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {typeStats.map(({ type, count }) => (
            <a
              key={type}
              href={`#type-${type}`}
              className="rounded-full border bg-card px-3 py-1 text-xs hover:bg-muted"
            >
              {SPOT_TYPE_LABELS[type]} {count}
            </a>
          ))}
        </div>
      </div>

      {/* spotType 別セクション */}
      {typeStats.map(({ type }) => {
        const spots = grouped.get(type) ?? [];
        return (
          <section key={type} id={`type-${type}`} className="mb-8 sm:mb-10 scroll-mt-20">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
              <MapPin className="size-5 text-primary" />
              {pref.name}の{SPOT_TYPE_LABELS[type]}（{spots.length}件）
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">スポット名</th>
                    <th className="hidden px-3 py-2 text-left font-medium sm:table-cell">エリア</th>
                    <th className="hidden px-3 py-2 text-left font-medium md:table-cell">難易度</th>
                    <th className="px-3 py-2 text-left font-medium">評価</th>
                  </tr>
                </thead>
                <tbody>
                  {spots.map((spot) => (
                    <tr key={spot.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2">
                        <Link prefetch={false}
                          href={`/spots/${spot.slug}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {spot.name}
                        </Link>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {spot.region.areaName}
                        </p>
                      </td>
                      <td className="hidden px-3 py-2 sm:table-cell">
                        <span className="text-xs text-muted-foreground">{spot.region.areaName}</span>
                      </td>
                      <td className="hidden px-3 py-2 md:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {DIFFICULTY_LABELS[spot.difficulty]}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 text-yellow-600">
                          <Star className="size-3 fill-current" />
                          {spot.rating.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {/* 関連リンク */}
      <section className="mt-8 sm:mt-12">
        <h2 className="mb-3 text-base font-bold sm:text-lg">関連リンク</h2>
        <div className="flex flex-wrap gap-2">
          <Link prefetch={false}
            href={`/prefecture/${pref.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {pref.name}トップ
          </Link>
          <Link prefetch={false}
            href="/prefecture"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            都道府県から探す
          </Link>
          <Link prefetch={false}
            href="/spots"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            全国の釣り場
          </Link>
        </div>
      </section>

      <Card className="mt-8">
        <CardContent className="p-4 text-xs text-muted-foreground">
          ※ 評価はユーザーレビュー・運営評価を総合した参考値です。釣り場の最新情報や禁止事項は各スポットの詳細ページで必ずご確認ください。
        </CardContent>
      </Card>
    </div>
  );
}
