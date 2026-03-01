import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/data/blog";
import { FileText } from "lucide-react";
import { BlogListClient } from "@/components/blog/blog-list-client";
import { Breadcrumb } from "@/components/ui/breadcrumb";

// ISR: 60秒ごとに再検証
export const revalidate = 60;

export const metadata: Metadata = {
  title: "釣りコラム・ブログ | ツリスポ",
  description:
    "釣り初心者の道具選びから上級者のテクニックまで、実践的なコラムを多数掲載。堤防釣り・サビキ釣り・ルアー・季節別攻略法を編集部が解説。最新の釣り情報をチェック。",
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

export default async function BlogListPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "コラム" }]} />

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
      <BlogListClient posts={posts} />
    </div>
  );
}
