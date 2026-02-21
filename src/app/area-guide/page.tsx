import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Fish, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { areaGuides } from "@/lib/data/area-guides";
import { fishingSpots } from "@/lib/data/spots";

export const metadata: Metadata = {
  title: "エリア別釣り場ガイド｜全国おすすめ釣りスポット完全攻略｜ツリスポ",
  description:
    "東京湾・大阪湾・三浦半島など全国の主要釣りエリアを完全ガイド。エリアごとのおすすめ釣り場・釣れる魚・ベストシーズンを詳しく解説。初心者から上級者まで対応。",
  openGraph: {
    title: "エリア別釣り場ガイド｜全国おすすめ釣りスポット完全攻略｜ツリスポ",
    description:
      "東京湾・大阪湾など全国の主要釣りエリアをガイド。おすすめスポット・釣れる魚・ベストシーズンを詳解。",
    type: "website",
    url: "https://tsurispot.com/area-guide",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/area-guide",
  },
};

function getSpotCountForArea(prefectures: string[]): number {
  return fishingSpots.filter((s) => prefectures.includes(s.region.prefecture))
    .length;
}

export default function AreaGuidePage() {
  const breadcrumbItems = [
    { label: "ホーム", href: "/" },
    { label: "エリアガイド" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "エリアガイド", item: "https://tsurispot.com/area-guide" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12">
          <div className="mx-auto max-w-7xl px-4">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MapPin className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">エリア別釣り場ガイド</h1>
                <p className="mt-1 text-muted-foreground">
                  全国{areaGuides.length}エリアの釣り場を完全攻略
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              東京湾・大阪湾・三浦半島など、日本全国の主要釣りエリアをエキスパートが詳しく解説。
              各エリアの特徴・釣れる魚・ベストシーズン・おすすめスポットを一挙紹介します。
            </p>
          </div>
        </div>

        {/* Guide Cards */}
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {areaGuides.map((guide) => {
              const spotCount = getSpotCountForArea(guide.prefectures);
              return (
                <Link key={guide.slug} href={`/area-guide/${guide.slug}`}>
                  <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <h2 className="text-lg font-bold">{guide.name}</h2>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{spotCount}スポット</span>
                        </div>
                      </div>
                      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                        {guide.description}
                      </p>
                      <div className="mb-4">
                        <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Fish className="h-3.5 w-3.5" />
                          <span>メインターゲット</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {guide.mainFish.slice(0, 4).map((f) => (
                            <Badge key={f} variant="secondary" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>ベストシーズン: {guide.bestSeason}</span>
                        <ChevronRight className="h-4 w-4 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
