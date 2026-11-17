import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ManagedPondTable } from "@/components/spots/managed-pond-table";
import { safeJsonLd } from "@/lib/safe-json-ld";
import { getPrefectureBySlug } from "@/lib/data/prefectures";
import { facilityLabel, feeShortText, openingHoursText } from "@/lib/managed-pond";
import { getManagedByPrefecture, topFishOf, MIN_MANAGED_PER_PREF } from "@/lib/managed-pond-hub";

export const revalidate = 86400;

type PageProps = { params: Promise<{ prefecture: string }> };

export function generateStaticParams() {
  return getManagedByPrefecture().map((g) => ({ prefecture: g.pref.slug }));
}

function load(slug: string) {
  const pref = getPrefectureBySlug(slug);
  if (!pref) return null;
  const group = getManagedByPrefecture().find((g) => g.pref.slug === slug);
  if (!group) return null;
  // 料金・営業時間のある施設を上に（比較表として役立つ順）
  const spots = [...group.spots].sort((a, b) => {
    const score = (s: typeof a) => (feeShortText(s) ? 2 : 0) + (openingHoursText(s) ? 1 : 0);
    return score(b) - score(a) || a.name.localeCompare(b.name, "ja");
  });
  return { pref, spots };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { prefecture } = await params;
  const d = load(prefecture);
  if (!d) return { title: "ページが見つかりません" };
  const { pref, spots } = d;
  const url = `https://tsurispot.com/managed-ponds/${pref.slug}`;
  const title = `${pref.name}の管理釣り場・釣り堀${spots.length}件【料金・営業時間つき】`;
  const fish = topFishOf(spots, 3).map((f) => f.name).join("・");
  const description = `${pref.name}の管理釣り場・釣り堀${spots.length}件を、料金・営業時間・定休日・釣れる魚の一覧表で比較。${fish ? `${fish}などが狙えます。` : ""}各施設の詳細ページで公式情報の確認日も掲載しています。`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: "website", url, siteName: "ツリスポ" },
    robots: spots.length < MIN_MANAGED_PER_PREF ? { index: false, follow: true } : undefined,
  };
}

export default async function ManagedPondsPrefecturePage({ params }: PageProps) {
  const { prefecture } = await params;
  const d = load(prefecture);
  if (!d) permanentRedirect("/managed-ponds");
  const { pref, spots } = d;
  const url = `https://tsurispot.com/managed-ponds/${pref.slug}`;
  const kinds = new Map<string, number>();
  for (const s of spots) kinds.set(facilityLabel(s), (kinds.get(facilityLabel(s)) ?? 0) + 1);
  const fish = topFishOf(spots, 6);
  const withFee = spots.filter((s) => feeShortText(s)).length;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
        { "@type": "ListItem", position: 2, name: "管理釣り場・釣り堀", item: "https://tsurispot.com/managed-ponds" },
        { "@type": "ListItem", position: 3, name: pref.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${pref.name}の管理釣り場・釣り堀`,
      numberOfItems: spots.length,
      itemListElement: spots.slice(0, 50).map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: `https://tsurispot.com/spots/${s.slug}`,
      })),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "管理釣り場・釣り堀", href: "/managed-ponds" },
          { label: pref.name },
        ]}
      />
      <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">{pref.name}の管理釣り場・釣り堀一覧</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {pref.name}の管理釣り場・釣り堀を{spots.length}件掲載しています（
        {[...kinds.entries()].map(([k, n]) => `${k}${n}件`).join("、")}）。
        {fish.length > 0 && `釣れる魚は${fish.map((f) => f.name).join("・")}など。`}
        {withFee > 0 && `料金を確認できた施設は${withFee}件です。`}
        料金は改定されることがあるため、釣行前に各施設の公式サイトもご確認ください。
      </p>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">{pref.name}の管理釣り場・釣り堀 比較表</h2>
        <ManagedPondTable spots={spots} caption={`${pref.name}の管理釣り場・釣り堀の料金・営業時間・定休日・釣れる魚`} />
        <p className="mt-2 text-xs text-muted-foreground">「—」は公式情報で確認できていない項目です。</p>
      </section>

      <nav className="mt-8 flex flex-wrap gap-3 text-sm" aria-label="関連ページ">
        <Link prefetch={false} href="/managed-ponds" className="text-primary underline">全国の管理釣り場・釣り堀</Link>
        <Link prefetch={false} href={`/prefecture/${pref.slug}`} className="text-primary underline">{pref.name}の釣りスポット</Link>
        {fish.slice(0, 4).map((f) => (
          <Link key={f.slug} prefetch={false} href={`/fish/${f.slug}`} className="text-primary underline">
            {f.name}の釣り方
          </Link>
        ))}
      </nav>
    </div>
  );
}
