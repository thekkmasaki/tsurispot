import type { Metadata } from "next";
import Link from "next/link";
import { Train } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { getAllTrainSpots, getTrainRegions } from "@/lib/data/train-spots";
import { TRAIN_WALK_MAX_MINUTES } from "@/lib/data/station-access";
import { CITY_ORIGINS, getIndexableCities } from "@/lib/data/city-origins";
import { safeJsonLd } from "@/lib/safe-json-ld";

export const dynamic = "force-static";
export const revalidate = 604800;

const PAGE_URL = "https://tsurispot.com/fishing-spots/by-train";

export function generateMetadata(): Metadata {
  const total = getAllTrainSpots().length;
  const title = `電車で行ける釣り場 全国${total}か所｜駅から徒歩${TRAIN_WALK_MAX_MINUTES}分以内【地域別】`;
  const description = `車がなくても行ける、駅から徒歩${TRAIN_WALK_MAX_MINUTES}分以内の釣り場を全国${total}か所掲載。北海道から九州・沖縄まで地域別に、最寄り駅と徒歩の目安、釣れる魚を一覧で確認できます。`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", url: PAGE_URL, siteName: "ツリスポ" },
    alternates: { canonical: PAGE_URL },
  };
}

export default function ByTrainHubPage() {
  const regions = getTrainRegions();
  const total = getAllTrainSpots().length;
  const indexable = new Set(getIndexableCities().map((c) => c.slug));
  const cities = CITY_ORIGINS.filter((c) => indexable.has(c.slug));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "近くの釣り場を探す", item: "https://tsurispot.com/fishing-spots/near-me" },
      { "@type": "ListItem", position: 3, name: "電車で行ける釣り場", item: PAGE_URL },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "近くの釣り場を探す", href: "/fishing-spots/near-me" },
          { label: "電車で行ける釣り場" },
        ]}
      />

      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <Train className="size-5 text-primary sm:size-6" />
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">電車で行ける釣り場</h1>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          車がなくても行ける、駅から徒歩{TRAIN_WALK_MAX_MINUTES}分以内の釣り場を全国{total}か所掲載しています。
          各スポットのアクセス情報に記載された「〇〇駅から徒歩◯分」をもとにしています（掲載時点の目安）。
          竿やクーラーボックスを持って歩くので、徒歩10分以内の釣り場から選ぶと楽です。
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold sm:text-xl">地域から選ぶ</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {regions.map(({ region, count }) => (
            <Link prefetch={false} key={region.slug} href={`/fishing-spots/by-train/${region.slug}`}>
              <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <p className="font-semibold group-hover:text-primary">{region.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{count}か所</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold sm:text-xl">都市から近い釣り場</h2>
        <div className="flex flex-wrap gap-2">
          {cities.map((c) => (
            <Link
              prefetch={false}
              key={c.slug}
              href={`/fishing-spots/near/${c.slug}`}
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
            >
              {c.name}から近い釣り場
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
