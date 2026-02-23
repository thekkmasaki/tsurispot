import type { Metadata } from "next";
import Link from "next/link";
import { Map, MapPin, Fish, BookOpen, Anchor, ShieldCheck, Store, Globe, Building } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { regions } from "@/lib/data/regions";
import { tackleShops } from "@/lib/data/shops";
import { prefectures } from "@/lib/data/prefectures";

export const metadata: Metadata = {
  title: "サイトマップ - ツリスポ",
  description:
    "ツリスポの全ページ一覧。釣りスポット、魚種図鑑、エリア別ページ、ガイド記事、釣具店など、すべてのコンテンツに簡単にアクセスできます。",
  openGraph: {
    title: "サイトマップ - ツリスポ",
    description: "ツリスポの全ページ一覧。すべてのコンテンツに簡単にアクセスできます。",
    type: "website",
    url: "https://tsurispot.com/sitemap-page",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/sitemap-page",
  },
};

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
      name: "サイトマップ",
      item: "https://tsurispot.com/sitemap-page",
    },
  ],
};

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  links: { href: string; label: string }[];
  groupByPrefecture?: boolean;
}

const methodSlugs = [
  { slug: "sabiki", name: "サビキ釣り" },
  { slug: "ajing", name: "アジング" },
  { slug: "eging", name: "エギング" },
  { slug: "mebaring", name: "メバリング" },
  { slug: "shore-jigging", name: "ショアジギング" },
  { slug: "choi-nage", name: "ちょい投げ" },
  { slug: "uki-zuri", name: "ウキ釣り" },
  { slug: "ana-zuri", name: "穴釣り" },
];

// 都道府県別スポットグルーピング
const spotsByPrefecture = fishingSpots.reduce<Record<string, typeof fishingSpots>>((acc, spot) => {
  const pref = spot.region.prefecture;
  if (!acc[pref]) acc[pref] = [];
  acc[pref].push(spot);
  return acc;
}, {});

export default function SitemapPage() {
  const sections: SitemapSection[] = [
    {
      title: "メインページ",
      icon: <Globe className="size-5 text-primary" />,
      links: [
        { href: "/", label: "ホーム" },
        { href: "/spots", label: "釣りスポット一覧" },
        { href: "/fish", label: "魚種図鑑" },
        { href: "/map", label: "地図で探す" },
        { href: "/catchable-now", label: "今釣れる魚" },
        { href: "/area", label: "エリアから探す" },
        { href: "/shops", label: "釣具店一覧" },
        { href: "/fishing-calendar", label: "月別釣りカレンダー" },
      ],
    },
    {
      title: "ガイド・学ぶ",
      icon: <BookOpen className="size-5 text-primary" />,
      links: [
        { href: "/guide", label: "釣りの始め方ガイド" },
        { href: "/guide/setup", label: "竿とリールのセッティング方法" },
        { href: "/guide/knots", label: "釣り糸の結び方" },
        { href: "/guide/sabiki", label: "サビキ釣り完全ガイド" },
        { href: "/guide/casting", label: "投げ方（キャスティング）の基本" },
        { href: "/guide/budget", label: "釣りの費用ガイド" },
        { href: "/guide/family", label: "ファミリーフィッシングガイド" },
        { href: "/beginner-checklist", label: "持ち物チェックリスト" },
        { href: "/glossary", label: "釣り用語集" },
        { href: "/seasonal", label: "季節別釣りガイド" },
        { href: "/fishing-rules", label: "釣りのルールとマナー" },
        { href: "/safety", label: "釣りの安全ガイド" },
        { href: "/faq", label: "よくある質問（FAQ）" },
        { href: "/tides", label: "潮汐情報" },
      ],
    },
    {
      title: "釣り方・釣法",
      icon: <Anchor className="size-5 text-primary" />,
      links: [
        { href: "/methods", label: "釣り方・釣法ガイド" },
        ...methodSlugs.map((m) => ({
          href: `/methods/${m.slug}`,
          label: m.name,
        })),
      ],
    },
    {
      title: "釣りスポット（都道府県別）",
      icon: <MapPin className="size-5 text-primary" />,
      links: fishingSpots.map((spot) => ({
        href: `/spots/${spot.slug}`,
        label: `${spot.name}（${spot.region.prefecture}）`,
      })),
      groupByPrefecture: true,
    },
    {
      title: "都道府県別ページ",
      icon: <Building className="size-5 text-primary" />,
      links: prefectures.map((pref) => ({
        href: `/prefecture/${pref.slug}`,
        label: pref.name,
      })),
    },
    {
      title: "魚種図鑑",
      icon: <Fish className="size-5 text-primary" />,
      links: fishSpecies.map((fish) => ({
        href: `/fish/${fish.slug}`,
        label: fish.name,
      })),
    },
    {
      title: "エリア別",
      icon: <Map className="size-5 text-primary" />,
      links: regions.map((region) => ({
        href: `/area/${region.slug}`,
        label: `${region.prefecture} ${region.areaName}`,
      })),
    },
    {
      title: "釣具店",
      icon: <Store className="size-5 text-primary" />,
      links: tackleShops.map((shop) => ({
        href: `/shops/${shop.slug}`,
        label: shop.name,
      })),
    },
    {
      title: "その他",
      icon: <ShieldCheck className="size-5 text-primary" />,
      links: [
        { href: "/about", label: "ツリスポについて" },
        { href: "/contact", label: "お問い合わせ" },
        { href: "/partner", label: "パートナー募集" },
        { href: "/privacy", label: "プライバシーポリシー" },
        { href: "/terms", label: "利用規約" },
        { href: "/recommendation", label: "おすすめスポット" },
      ],
    },
  ];

  const totalPages = sections.reduce((sum, s) => sum + s.links.length, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            サイトマップ
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            ツリスポの全ページ一覧（全{totalPages}ページ）
          </p>
        </div>

        {/* セクション一覧 */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <div className="mb-3 flex items-center gap-2 border-b pb-2">
                {section.icon}
                <h2 className="text-lg font-bold">
                  {section.title}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({section.links.length}件)
                  </span>
                </h2>
              </div>
              {section.groupByPrefecture ? (
                <div className="space-y-4">
                  {Object.entries(spotsByPrefecture).map(([pref, spots]) => (
                    <div key={pref}>
                      <h3 className="mb-1 text-sm font-semibold text-foreground">{pref}（{spots.length}件）</h3>
                      <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                        {spots.map((spot) => (
                          <li key={spot.slug}>
                            <Link
                              href={`/spots/${spot.slug}`}
                              className="inline-block py-0.5 text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                            >
                              {spot.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block py-0.5 text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
