import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/data/blog";
import { FileText } from "lucide-react";
import { BlogListClient } from "@/components/blog/blog-list-client";

export const metadata: Metadata = {
  title: "釣りコラム・ブログ | ツリスポ",
  description:
    "釣り初心者向けの道具選びから、季節ごとの釣り方テクニックまで。堤防釣り・サビキ釣りなど実践的な釣りコラムをお届けします。",
  openGraph: {
    title: "釣りコラム・ブログ | ツリスポ",
    description:
      "釣り初心者向けの道具選びから、季節ごとの釣り方テクニックまで。実践的な釣りコラムをお届けします。",
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
      name: "コラム",
      item: "https://tsurispot.com/blog",
    },
  ],
};

export default function BlogListPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* パンくずリスト */}
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="パンくず">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              ホーム
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-foreground">コラム</li>
        </ol>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="size-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            釣りコラム
          </h1>
        </div>
        <p className="text-sm text-muted-foreground sm:text-base">
          初心者向けガイドから季節の釣り情報、テクニックまで。役立つ釣りコラムをお届けします。
        </p>
      </div>

      {/* クライアントサイドフィルター付き記事一覧 */}
      <BlogListClient posts={blogPosts} />
    </div>
  );
}
