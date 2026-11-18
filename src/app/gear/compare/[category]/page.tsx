import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InArticleAd } from "@/components/ads/ad-unit";
import { CompareTable } from "@/components/gear/compare-table";
import { GEAR_COMPARE_CATEGORIES, getGearCompareCategory } from "@/lib/data/gear-compare/categories";
import { RAKUTEN_ITEMS } from "@/lib/data/gear-compare/rakuten-items";
import { REGION_GROUPS } from "@/lib/data/regions-group";
import { getMethodBySlug } from "@/lib/data/fishing-methods";
import { safeJsonLd } from "@/lib/safe-json-ld";

export const dynamicParams = false;

export function generateStaticParams() {
  return GEAR_COMPARE_CATEGORIES.map((c) => ({ category: c.slug }));
}

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = getGearCompareCategory(category);
  if (!c) return {};
  const url = `https://tsurispot.com/gear/compare/${c.slug}`;
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: url },
    openGraph: { title: c.title, description: c.description, url, type: "article", siteName: "ツリスポ" },
    // 機種データが入るまでは薄いページなので索引させない
    ...(c.models.length === 0 && { robots: { index: false, follow: true } }),
  };
}

/** 楽天データの取得日のうち最新（価格の時点表示用） */
function latestFetchedAt(ids: string[]): string | null {
  const dates = ids.map((id) => RAKUTEN_ITEMS[id]?.fetchedAt).filter((d): d is string => !!d);
  return dates.length ? dates.sort().at(-1)! : null;
}

export default async function GearComparePage({ params }: Props) {
  const { category } = await params;
  const c = getGearCompareCategory(category);
  if (!c) notFound();
  const method = getMethodBySlug(c.methodSlug);
  const fetchedAt = latestFetchedAt(c.models.map((m) => m.id));
  const items = Object.fromEntries(c.models.filter((m) => RAKUTEN_ITEMS[m.id]).map((m) => [m.id, RAKUTEN_ITEMS[m.id]]));

  const url = `https://tsurispot.com/gear/compare/${c.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
        { "@type": "ListItem", position: 2, name: "おすすめ釣り道具", item: "https://tsurispot.com/gear" },
        { "@type": "ListItem", position: 3, name: `${c.name}比較`, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${c.name}のスペック比較`,
      numberOfItems: c.models.length,
      itemListElement: c.models.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${m.maker} ${m.series} ${m.model}`,
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "おすすめ釣り道具", href: "/gear" },
          { label: `${c.name}比較` },
        ]}
      />

      <p className="mb-2 inline-block rounded bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">PR</p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.name}をスペックで比較</h1>
      <p className="mt-3 text-sm leading-relaxed">{c.lead}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        ※ このページには楽天市場・Amazonのアフィリエイトリンクが含まれます。購入による追加費用は発生しません。
        スペックは各メーカー公式サイトの値です。
        {fetchedAt && `価格は楽天市場の${fetchedAt.replace(/-/g, "/")}時点の参考価格で、変動します。`}
      </p>

      <section aria-labelledby="table" className="mt-6">
        <h2 id="table" className="sr-only">
          {c.name}のスペック比較表
        </h2>
        {c.models.length > 0 ? (
          <CompareTable categoryName={c.name} models={c.models} items={items} />
        ) : (
          <p className="rounded-xl border p-4 text-sm text-muted-foreground">比較表を準備中です。</p>
        )}
      </section>

      <InArticleAd className="my-8" />

      <section aria-labelledby="guide" className="mt-8">
        <h2 id="guide" className="mb-3 text-xl font-bold">
          {c.name}の選び方
        </h2>
        <div className="space-y-5">
          {c.guide.map((g) => (
            <div key={g.heading}>
              <h3 className="text-base font-bold">{g.heading}</h3>
              <p className="mt-1 text-sm leading-relaxed">{g.body}</p>
            </div>
          ))}
        </div>
      </section>

      {method && (
        <section aria-labelledby="spots" className="mt-10 rounded-2xl border border-sky-200 bg-sky-50/50 p-4 sm:p-6">
          <h2 id="spots" className="flex items-center gap-2 text-lg font-bold">
            <MapPin className="size-5 text-sky-600" />
            {method.name}ができる釣り場を探す
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ロッドを選んだら、{method.name}ができる釣り場を地方別に確認できます。
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {REGION_GROUPS.map((r) => (
              <li key={r.slug}>
                <Link
                  prefetch={false}
                  href={`/fishing/${method.slug}/area/${r.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm hover:border-sky-300"
                >
                  {r.name}
                  <ChevronRight className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
          <Link prefetch={false} href={`/fishing/${method.slug}`} className="mt-3 inline-block text-sm text-sky-700 underline">
            {method.name}の始め方・釣れる魚
          </Link>
        </section>
      )}
    </div>
  );
}
