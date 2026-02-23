import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  blogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
  BLOG_CATEGORIES,
} from "@/lib/data/blog";
import { fishSpecies } from "@/lib/data/fish";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Tag, Calendar, FileText, MapPin, Fish, Search } from "lucide-react";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | 釣りコラム | ツリスポ`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://tsurispot.com/blog/${post.slug}`,
      siteName: "ツリスポ",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
    },
    alternates: {
      canonical: `https://tsurispot.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post);
  const { prev, next } = getAdjacentPosts(post);

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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://tsurispot.com/blog/${post.slug}`,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: "ツリスポ",
      url: "https://tsurispot.com",
    },
    publisher: {
      "@type": "Organization",
      name: "ツリスポ",
      url: "https://tsurispot.com",
      logo: {
        "@type": "ImageObject",
        url: "https://tsurispot.com/logo.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://tsurispot.com/blog/${post.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* パンくずリスト */}
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="パンくず">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link href="/" className="hover:text-foreground">
              ホーム
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/blog" className="hover:text-foreground">
              コラム
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
            {post.title}
          </li>
        </ol>
      </nav>

      {/* 記事ヘッダー */}
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary">{BLOG_CATEGORIES[post.category]}</Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            {post.publishedAt}
          </span>
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <span className="text-xs text-muted-foreground">
              (更新: {post.updatedAt})
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {post.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {post.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              <Tag className="size-2.5" />
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* 記事本文 */}
      <article
        className="prose prose-gray max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-xl prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-3 prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg prose-p:leading-relaxed prose-p:text-gray-700 prose-li:text-gray-700 prose-ul:my-4 prose-li:my-1 sm:prose-h2:text-2xl sm:prose-h3:text-xl"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* 関連魚種リンク */}
      {post.relatedFish && post.relatedFish.length > 0 && (() => {
        const relatedFishData = post.relatedFish
          .map((slug) => fishSpecies.find((f) => f.slug === slug))
          .filter(Boolean);
        return relatedFishData.length > 0 ? (
          <section className="mt-10 rounded-xl border bg-blue-50/50 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
              <Fish className="size-5 text-primary" />
              この記事に関連する魚種
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedFishData.map((fish) => (
                <Link
                  key={fish!.slug}
                  href={`/fish/${fish!.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {fish!.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null;
      })()}

      {/* CTA: サイト誘導 */}
      <section className="mt-10 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-sky-50 p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-bold tracking-tight sm:text-xl">
          近くの釣りスポットを探してみよう
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          ツリスポでは全国1,000か所以上の釣りスポット情報を掲載。今釣れる魚・混雑予想・アクセス情報をまとめてチェックできます。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/spots"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <MapPin className="size-4" />
            釣りスポットを探す
          </Link>
          <Link
            href="/fish"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            <Fish className="size-4" />
            魚図鑑を見る
          </Link>
          <Link
            href="/catchable-now"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            <Search className="size-4" />
            今釣れる魚を調べる
          </Link>
        </div>
      </section>

      {/* 前後の記事ナビゲーション */}
      <nav className="mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2" aria-label="前後の記事">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group flex items-start gap-2 rounded-xl border p-4 transition-colors hover:bg-muted/50"
          >
            <ChevronLeft className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">前の記事</p>
              <p className="mt-1 text-sm font-medium leading-snug group-hover:text-primary line-clamp-2">
                {prev.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex items-start justify-end gap-2 rounded-xl border p-4 text-right transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">次の記事</p>
              <p className="mt-1 text-sm font-medium leading-snug group-hover:text-primary line-clamp-2">
                {next.title}
              </p>
            </div>
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <div />
        )}
      </nav>

      {/* 関連記事 */}
      {relatedPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold tracking-tight sm:text-xl">
            関連記事
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedPosts.map((related) => (
              <Link key={related.id} href={`/blog/${related.slug}`}>
                <Card className="group h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <Badge variant="secondary" className="w-fit text-xs">
                      {BLOG_CATEGORIES[related.category]}
                    </Badge>
                    <h3 className="text-sm font-semibold leading-snug group-hover:text-primary">
                      {related.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {related.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* コラム一覧へのリンク */}
      <div className="mt-10 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
        >
          <FileText className="size-4" />
          コラム一覧に戻る
        </Link>
      </div>
    </div>
  );
}
