import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Fish, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { regions } from "@/lib/data/regions";
import { fishingSpots } from "@/lib/data/spots";
import { SpotCard } from "@/components/spots/spot-card";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getRegionBySlug(slug: string) {
  return regions.find((r) => r.slug === slug);
}

function getSpotsForRegion(regionId: string) {
  return fishingSpots.filter((s) => s.region.id === regionId);
}

function getCatchableFishForRegion(regionId: string) {
  const fishMap = new Map<string, { name: string; slug: string; count: number }>();
  for (const spot of fishingSpots) {
    if (spot.region.id !== regionId) continue;
    for (const cf of spot.catchableFish) {
      const existing = fishMap.get(cf.fish.id);
      if (existing) {
        existing.count++;
      } else {
        fishMap.set(cf.fish.id, {
          name: cf.fish.name,
          slug: cf.fish.slug,
          count: 1,
        });
      }
    }
  }
  return Array.from(fishMap.values()).sort((a, b) => b.count - a.count);
}

// Region descriptions for SEO
const regionDescriptions: Record<string, string> = {
  "hokkaido-otaru":
    "小樽・石狩エリアは北海道を代表する釣りスポットが集まる地域です。夏はサバやイワシのサビキ釣り、冬はカレイの投げ釣りが人気。小樽港は観光と合わせて楽しめる手軽な釣り場として知られています。",
  "miyagi-sendai":
    "仙台湾エリアは東北屈指の好漁場です。堤防からのハゼ釣りや投げ釣りでカレイが狙え、夏場はアジやサバの回遊も。仙台港周辺は足場が良く初心者にもおすすめです。",
  niigata:
    "新潟エリアは日本海に面した好釣り場が並びます。春から秋のアジ・サバ狙いや、冬場のメバル・カサゴ釣りが人気。新潟港周辺は通年で楽しめるスポットが揃っています。",
  "chiba-boso":
    "房総半島エリアは東京湾と外房の2つの海に面した釣り天国です。堤防からのアジやイワシのサビキ釣りから、磯のクロダイ狙いまで多彩な釣りが楽しめます。都心からのアクセスも良好です。",
  "tokyo-bay":
    "東京湾エリアは都心に最も近い釣りスポットです。若洲海浜公園をはじめ、足場の良い堤防が多く、ファミリーフィッシングに最適。通年でハゼやシーバス、夏にはアジやサバも狙えます。",
  "kanagawa-yokohama":
    "横浜エリアは都市型の釣りスポットが特徴です。本牧海釣り施設など整備された釣り場が多く、初心者やファミリーに人気。アジ・イワシ・メバルなど多彩な魚種が楽しめます。",
  "kanagawa-shonan":
    "湘南エリアは砂浜と堤防が織りなす多彩な釣り場です。シロギスの投げ釣りや堤防からのアジ・サバ狙いが人気。江の島周辺は観光と合わせて楽しめます。",
  "kanagawa-miura":
    "三浦半島エリアは本格的な磯釣りから手軽な堤防釣りまで幅広く楽しめるエリアです。クロダイやメジナの好ポイントが多く、城ヶ島周辺は上級者にも人気の釣り場です。",
  "shizuoka-izu":
    "伊豆・熱海エリアは温泉と釣りを同時に楽しめる人気エリアです。磯釣りではメジナやクロダイ、堤防からはアジやカサゴが狙えます。相模湾の豊かな海で多彩な魚種に出会えます。",
  "aichi-chita":
    "知多半島エリアは名古屋から近い人気の釣りスポットです。師崎港や豊浜漁港など好漁場が並び、アジやサバのサビキ釣り、クロダイのフカセ釣りが盛んです。",
  "mie-shima":
    "志摩エリアはリアス式海岸の入り組んだ地形が豊かな漁場を形成しています。磯釣りのメッカとして知られ、クロダイやメジナ、アオリイカなど多彩な魚種が狙えます。",
  "wakayama-nanki":
    "南紀エリアは黒潮の恵みを受けた全国屈指の好漁場です。枯木灘や串本の磯はグレ・チヌ釣りの聖地。堤防からもアジ・カマスなど手軽に楽しめます。",
  "hiroshima-setouchi":
    "瀬戸内エリアは穏やかな海で釣りが楽しめます。チヌ（クロダイ）の好漁場として全国的に有名で、アジやメバルも人気のターゲットです。",
  "kochi-tosa":
    "土佐湾エリアは太平洋に面した豊かな漁場です。カツオの一本釣りで有名ですが、堤防からのアジ・サバ釣りや磯のグレ釣りも盛んです。",
  "fukuoka-hakata":
    "博多湾エリアは都市近郊でありながら豊かな漁場を持つ地域です。アジやサバのサビキ釣りが手軽に楽しめ、冬場のメバル・カサゴも人気です。",
  "kagoshima-kinko":
    "錦江湾エリアは桜島を望む雄大な景観とともに釣りが楽しめます。カンパチやブリなどの大物から、アジ・サバなどの手軽な釣りまで楽しめるエリアです。",
  "okinawa-naha":
    "那覇エリアは亜熱帯の豊かな海で独特の釣りが楽しめます。色鮮やかなミーバイ（ハタ）やタマン（フエフキダイ）など、沖縄ならではの魚種が狙えます。",
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return { title: "エリアが見つかりません" };

  const spots = getSpotsForRegion(region.id);
  const fishList = getCatchableFishForRegion(region.id);
  const topFishNames = fishList
    .slice(0, 5)
    .map((f) => f.name)
    .join("・");

  return {
    title: `${region.areaName}の釣りスポット一覧 - ${region.prefecture}の釣り場情報`,
    description: `${region.prefecture}${region.areaName}エリアの釣りスポット${spots.length}件を紹介。${topFishNames}などが狙えます。アクセス・料金・設備情報も掲載。`,
    openGraph: {
      title: `${region.areaName}の釣りスポット一覧 - ${region.prefecture}の釣り場情報`,
      description: `${region.prefecture}${region.areaName}エリアの釣りスポット${spots.length}件。${topFishNames}が釣れます。`,
      type: "website",
      url: `https://tsurispot.jp/area/${region.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.jp/area/${region.slug}`,
    },
  };
}

export function generateStaticParams() {
  return regions.map((region) => ({ slug: region.slug }));
}

export default async function AreaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  const spots = getSpotsForRegion(region.id);
  const catchableFish = getCatchableFishForRegion(region.id);
  const description = regionDescriptions[slug] || "";

  // Find other regions in the same prefecture for internal linking
  const samePreRegions = regions.filter(
    (r) => r.prefecture === region.prefecture && r.id !== region.id
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${region.prefecture} ${region.areaName}`,
    description:
      description ||
      `${region.prefecture}${region.areaName}エリアの釣りスポット情報`,
    address: {
      "@type": "PostalAddress",
      addressRegion: region.prefecture,
      addressCountry: "JP",
    },
    containsPlace: spots.map((spot) => ({
      "@type": "TouristAttraction",
      name: spot.name,
      url: `https://tsurispot.jp/spots/${spot.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: "https://tsurispot.jp",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "釣りエリア",
        item: "https://tsurispot.jp/area",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${region.areaName}（${region.prefecture}）`,
        item: `https://tsurispot.jp/area/${region.slug}`,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Back link */}
      <Link
        href="/area"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        エリア一覧に戻る
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary sm:size-6" />
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
            {region.areaName}の釣りスポット
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {region.prefecture} - {spots.length}件の釣りスポット
        </p>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Catchable fish in this region */}
      {catchableFish.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Fish className="size-5" />
            {region.areaName}で釣れる魚
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {catchableFish.map((f) => (
              <Link key={f.slug} href={`/fish/${f.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {f.name}
                  <span className="ml-1 text-muted-foreground">
                    ({f.count})
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Spots list */}
      <section>
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          釣りスポット一覧（{spots.length}件）
        </h2>
        {spots.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            このエリアの釣りスポットは現在準備中です。
          </p>
        )}
      </section>

      {/* Same prefecture regions for internal linking */}
      {samePreRegions.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
            {region.prefecture}の他のエリア
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {samePreRegions.map((r) => {
              const count = fishingSpots.filter(
                (s) => s.region.id === r.id
              ).length;
              return (
                <Link key={r.id} href={`/area/${r.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                        <MapPin className="mr-1 inline size-4" />
                        {r.areaName}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {count}件のスポット
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
