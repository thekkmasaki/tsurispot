import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, MapPin, Star } from "lucide-react";
import {
  getAccommodationsByPrefecture,
  ACCOMMODATION_FEATURE_LABELS,
} from "@/lib/data/accommodations";
import { getPrefectureBySlug, prefectures } from "@/lib/data/prefectures";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { HeaderBannerAd, InArticleAd, InFeedAd } from "@/components/ads/ad-unit";

export const revalidate = 21600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return prefectures.map((p) => ({ prefecture: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}): Promise<Metadata> {
  const { prefecture } = await params;
  const pref = getPrefectureBySlug(prefecture);
  if (!pref) return { title: "Not Found" };
  return {
    title: `${pref.name}の釣り宿・釣り客向け宿泊施設 おすすめ｜ツリスポ`,
    description: `${pref.name}で釣り客に人気の宿・旅館・民宿を紹介。 早朝出船・釣果料理対応・タックルレンタル可など、 釣り旅行に最適な宿を厳選して掲載。`,
    alternates: { canonical: `https://tsurispot.com/accommodations/${prefecture}` },
    openGraph: {
      title: `${pref.name}の釣り宿・釣り客向け宿泊施設`,
      description: `${pref.name}で釣り客に人気の宿を紹介。`,
      type: "website",
      url: `https://tsurispot.com/accommodations/${prefecture}`,
      siteName: "ツリスポ",
    },
  };
}

export default async function PrefectureAccommodationsPage({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture } = await params;
  const pref = getPrefectureBySlug(prefecture);
  if (!pref) notFound();
  const list = getAccommodationsByPrefecture(pref.name).filter(
    (a) => (a.rakutenUrl && a.rakutenUrl !== "#") || (a.jalanUrl && a.jalanUrl !== "#")
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣り宿", href: "/accommodations" },
          { label: pref.name },
        ]}
      />

      <HeaderBannerAd />

      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <BedDouble className="size-4" />
          {pref.regionGroup}
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">{pref.name}の釣り宿・宿泊施設</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          釣り客向けの宿・旅館・ゲストハウスを {pref.name} 内から厳選。
          早朝出船・釣果料理・タックルレンタルなどの条件で探せます。
        </p>
      </header>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {pref.name}の釣り宿は準備中です。 近隣の都道府県もご参照ください。
          </p>
          <Link
            href="/accommodations"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            全国の釣り宿一覧へ
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((a, index) => (
            <Fragment key={a.id}>
              <Link
                href={`/accommodations/${prefecture}/${a.slug}`}
                className="group rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <h2 className="text-base font-semibold leading-snug group-hover:text-primary sm:text-lg">
                  {a.name}
                </h2>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {a.areaName}
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {a.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {a.features.slice(0, 4).map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {ACCOMMODATION_FEATURE_LABELS[f]}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  {a.priceRange}/泊
                </div>
              </Link>
              {index === 1 && (
                <div className="col-span-full">
                  <InFeedAd />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}

      <InArticleAd />
    </div>
  );
}
