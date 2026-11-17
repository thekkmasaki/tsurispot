import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { safeJsonLd } from "@/lib/safe-json-ld";
import { facilityLabel } from "@/lib/managed-pond";
import {
  getManagedSpots,
  getManagedByPrefecture,
  topFishOf,
  MIN_MANAGED_PER_PREF,
} from "@/lib/managed-pond-hub";

export const revalidate = 86400;

const URL = "https://tsurispot.com/managed-ponds";

export function generateMetadata(): Metadata {
  const total = getManagedSpots().length;
  const prefs = getManagedByPrefecture().length;
  const title = "全国の管理釣り場・釣り堀一覧【料金・営業時間つき】";
  const description = `全国${prefs}都道府県の管理釣り場・釣り堀${total}件を、都道府県別に掲載。エリアトラウト・渓流の管理釣り場・鯉やヘラブナの釣り堀・海上釣り堀を、料金・営業時間・定休日・釣れる魚で探せます。`;
  return {
    title,
    description,
    alternates: { canonical: URL },
    openGraph: { title, description, type: "website", url: URL, siteName: "ツリスポ" },
  };
}

export default function ManagedPondsPage() {
  const spots = getManagedSpots();
  const groups = getManagedByPrefecture();
  const kinds = new Map<string, number>();
  for (const s of spots) kinds.set(facilityLabel(s), (kinds.get(facilityLabel(s)) ?? 0) + 1);
  const fish = topFishOf(spots, 10);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
        { "@type": "ListItem", position: 2, name: "管理釣り場・釣り堀", item: URL },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "都道府県別の管理釣り場・釣り堀",
      numberOfItems: groups.filter((g) => g.spots.length >= MIN_MANAGED_PER_PREF).length,
      itemListElement: groups
        .filter((g) => g.spots.length >= MIN_MANAGED_PER_PREF)
        .map((g, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${g.pref.name}の管理釣り場・釣り堀`,
          url: `${URL}/${g.pref.slug}`,
        })),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "管理釣り場・釣り堀" }]} />
      <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">全国の管理釣り場・釣り堀一覧</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        ツリスポには、全国{groups.length}都道府県の管理釣り場・釣り堀を{spots.length}件掲載しています（
        {[...kinds.entries()].map(([k, n]) => `${k}${n}件`).join("、")}
        ）。料金・営業時間・定休日は各施設の公式情報で確認した内容で、ページごとに確認日を載せています。料金は改定されることがあるため、釣行前に公式サイトもご確認ください。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">都道府県から探す</h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {groups.map((g) => (
            <li key={g.pref.slug}>
              {g.spots.length >= MIN_MANAGED_PER_PREF ? (
                <Link
                  prefetch={false}
                  href={`/managed-ponds/${g.pref.slug}`}
                  className="flex min-h-[44px] items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                >
                  <span>{g.pref.name}</span>
                  <span className="text-muted-foreground">{g.spots.length}件</span>
                </Link>
              ) : (
                <span className="flex min-h-[44px] items-center justify-between rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                  <span>{g.pref.name}</span>
                  <span>{g.spots.length}件</span>
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          {MIN_MANAGED_PER_PREF}件未満の県は一覧ページを作らず、各施設ページと
          <Link prefetch={false} href="/spot-type/pond" className="text-primary underline">管理釣り場（池）一覧</Link>
          から探せます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">狙える魚から探す</h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          {fish.map((f) => (
            <li key={f.slug}>
              <Link prefetch={false} href={`/fish/${f.slug}`} className="rounded-full border px-3 py-1.5 hover:bg-muted">
                {f.name}（{f.count}施設）
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
