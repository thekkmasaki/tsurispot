import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts, BLOG_CATEGORIES, type BlogPost } from "@/lib/data/blog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight, Tag } from "lucide-react";

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

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group h-full transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs"
            >
              {BLOG_CATEGORIES[post.category]}
            </Badge>
            <span className="text-xs text-muted-foreground">{post.publishedAt}</span>
          </div>
          <h2 className="text-base font-semibold leading-snug group-hover:text-primary sm:text-lg">
            {post.title}
          </h2>
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                <Tag className="size-2.5" />
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            続きを読む
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // Next.js 16ではsearchParamsは直接使わず、クライアント側でフィルタ
  // SSGではすべての記事を表示し、フィルタはクライアント側
  const allCategories = Object.entries(BLOG_CATEGORIES);

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
        <div className="flex items-center gap-3 mb-2">
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

      {/* カテゴリフィルター */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/blog">
          <Badge
            variant="outline"
            className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            すべて
          </Badge>
        </Link>
        {allCategories.map(([key, label]) => {
          const count = blogPosts.filter((p) => p.category === key).length;
          return (
            <Badge
              key={key}
              variant="outline"
              className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary/10"
            >
              {label}
              <span className="ml-1 text-muted-foreground">({count})</span>
            </Badge>
          );
        })}
      </div>

      {/* 記事一覧 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {blogPosts.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <FileText className="mx-auto mb-4 size-12 opacity-30" />
          <p>まだ記事がありません。</p>
        </div>
      )}
    </div>
  );
}
