import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/data/blog";
import { FileText } from "lucide-react";
import { BlogListClient } from "@/components/blog/blog-list.client";
import { CatchReportSection } from "@/components/blog/catch-report-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";

// ISR: 1時間ごとに再検証
export const revalidate = 3600;

// microCMS API呼び出しのタイムアウト対策
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "釣果レポート・釣りコラム",
  description:
    "最新の釣果レポートと実践的な釣りコラムを多数掲載。実際の釣行記録から堤防釣り・サビキ釣り・ルアーフィッシングのテクニックまで。編集部がわかりやすく解説します。",
  openGraph: {
    title: "釣果レポート・釣りコラム",
    description:
      "最新の釣果レポートと実践的な釣りコラム。実際の釣行記録からテクニック・タックルレビューまでお届けします。",
    type: "website",
    url: "https://tsurispot.com/blog",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/blog",
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
      name: "釣果・コラム",
      item: "https://tsurispot.com/blog",
    },
  ],
};

/** リスト表示に必要なフィールドだけ抽出（server-serialization: content除外で転送量削減） */
function stripContent<T extends { content: string }>(
  posts: T[],
): Omit<T, "content">[] {
  return posts.map(({ content, ...rest }) => rest);
}

export default async function BlogListPage() {
  const posts = await getAllBlogPosts();
  const reportPosts = stripContent(
    posts.filter((p) => p.category === "report"),
  );
  const columnPosts = stripContent(
    posts.filter((p) => p.category !== "report"),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "釣果・コラム" }]} />

      {/* 釣果レポートセクション（目立つ） */}
      <CatchReportSection posts={reportPosts} />

      {/* コラムセクション */}
      <div className="mt-12">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="size-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              釣りコラム
            </h2>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            初心者向けガイドから季節の釣り情報、テクニックまで。役立つ釣りコラムをお届けします。
          </p>
        </div>

        <BlogListClient posts={columnPosts} />
      </div>
    </div>
  );
}
