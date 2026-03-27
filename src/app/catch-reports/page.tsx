import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/data/blog";
import { CatchReportSection } from "@/components/blog/catch-report-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";

// ISR: 1時間ごとに再検証
export const revalidate = 3600;

export const maxDuration = 60;

export const metadata: Metadata = {
  title: "編集部の釣行レポート｜リアルな釣果記録",
  description:
    "ツリスポ編集部の実釣レポート。釣り場の状況やポイント、使ったタックル、釣果をリアルにお届けします。初心者目線からベテランの本気釣行まで。",
  openGraph: {
    title: "編集部の釣行レポート｜リアルな釣果記録",
    description:
      "ツリスポ編集部の実釣レポート。釣り場の状況やポイント、釣果をリアルにお届けします。",
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
    </div>
  );
}
