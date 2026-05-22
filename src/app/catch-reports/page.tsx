import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/data/blog";
import { CatchReportSection } from "@/components/blog/catch-report-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InArticleAd } from "@/components/ads/ad-unit";

// ISR: 1時間ごとに再検証
export const revalidate = 7200;

export const maxDuration = 60;

export const metadata: Metadata = {
  title: "編集部の釣行レポート｜リアルな釣果記録",
  description:
    "ツリスポ編集部による全国の実釣レポート。 釣り場の状況・ポイントの選び方、 使用タックルと仕掛け、 釣果 (魚種・サイズ・時間帯) をリアルに記録。 初心者の手探り釣行からベテランの本気釣行まで、 真似できる行動パターンを解説しています。",
  openGraph: {
    title: "編集部の釣行レポート｜リアルな釣果記録",
    description:
      "ツリスポ編集部による全国の実釣レポート。 ポイント選び・タックル・釣果を初心者の参考になる形でリアルに記録します。",
    type: "website",
    url: "https://tsurispot.com/catch-reports",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/catch-reports",
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
      name: "釣行レポート",
      item: "https://tsurispot.com/catch-reports",
    },
  ],
};

/** content除外で転送量削減 */
function stripContent<T extends { content: string }>(
  posts: T[],
): Omit<T, "content">[] {
  return posts.map(({ content, ...rest }) => rest);
}

export default async function CatchReportsPage() {
  const posts = await getAllBlogPosts();
  const reportPosts = stripContent(
    posts.filter((p) => p.category === "report"),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb
        items={[{ label: "ホーム", href: "/" }, { label: "釣行レポート" }]}
      />

      <CatchReportSection posts={reportPosts} showAll />

      <InArticleAd />
    </div>
  );
}
