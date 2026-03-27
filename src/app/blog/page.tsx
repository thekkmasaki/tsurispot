import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/data/blog";
import { MapPin } from "lucide-react";
import { BlogListClient } from "@/components/blog/blog-list.client";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Link from "next/link";

// ISR: 1時間ごとに再検証
export const revalidate = 3600;

// microCMS API呼び出しのタイムアウト対策
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "エリア釣果レポート｜全国の最新釣果情報",
  description:
    "全国各エリアの最新釣果情報をお届け。エリアごとの釣果週報、今釣れている魚、おすすめタックル情報を毎週更新。釣り場選びの参考に。",
  openGraph: {
    title: "エリア釣果レポート｜全国の最新釣果情報",
    description:
      "全国各エリアの最新釣果情報をお届け。エリアごとの釣果週報を毎週更新。",
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
      name: "エリア釣果レポート",
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
  // 個人釣行レポートは /catch-reports に分離、ここではそれ以外を表示
  const areaPosts = stripContent(
    posts.filter((p) => p.category !== "report"),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "エリア釣果レポート" }]} />

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md">
            <MapPin className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              エリア釣果レポート
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              全国各エリアの最新釣果情報
            </p>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          エリアごとの釣果週報、釣り場ガイド、テクニック情報をお届けします。
        </p>
        <div className="mt-3">
          <Link
            href="/catch-reports"
            className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
          >
            🎣 編集部の釣行レポートはこちら
          </Link>
        </div>
      </div>

      <BlogListClient posts={areaPosts} />
    </div>
  );
}
