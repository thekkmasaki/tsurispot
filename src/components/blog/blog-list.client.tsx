"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Tag, FileText, Search, X } from "lucide-react";
import { BLOG_CATEGORIES, type BlogPost } from "@/lib/data/blog";

/** リスト表示用の軽量型（content除外） */
type BlogPostSummary = Omit<BlogPost, "content">;

/** カテゴリ別のデフォルトサムネイル画像パス */
const CATEGORY_DEFAULT_IMAGE: Record<BlogPost["category"], string> = {
  beginner: "/images/blog/defaults/beginner.svg",
  gear: "/images/blog/defaults/gear.svg",
  seasonal: "/images/blog/defaults/seasonal.svg",
  technique: "/images/blog/defaults/technique.svg",
  "spot-guide": "/images/blog/defaults/spot-guide.svg",
  manner: "/images/blog/defaults/manner.svg",
  knowledge: "/images/blog/defaults/knowledge.svg",
  report: "/images/blog/defaults/report.svg",
};

function BlogThumbnail({ post }: { post: BlogPostSummary }) {
  const imageSrc = post.image || CATEGORY_DEFAULT_IMAGE[post.category];

  return (
    <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-[120px]">
      <Image
        src={imageSrc}
        alt={post.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 120px"
      />
    </div>
  );
}

function BlogCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="flex h-full flex-col sm:flex-row">
          <BlogThumbnail post={post} />
          <CardContent className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {BLOG_CATEGORIES[post.category]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {post.publishedAt}
              </span>
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
        </div>
      </Card>
    </Link>
  );
}

/** 初期表示タグ数 */
const INITIAL_TAG_COUNT = 15;

const EMPTY_SET = () => new Set<string>();

export function BlogListClient({ posts }: { posts: BlogPostSummary[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<Set<string>>(EMPTY_SET);
  const [showAllTags, setShowAllTags] = useState(false);

  const allCategories = Object.entries(BLOG_CATEGORIES) as [
    BlogPost["category"],
    string,
  ][];

  // カテゴリ別件数をメモ化（レンダー毎の .filter() 排除）
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    }
    return counts;
  }, [posts]);

  // タグ一覧を出現回数順にソート
  const sortedTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
    return [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const visibleTags = showAllTags
    ? sortedTags
    : sortedTags.slice(0, INITIAL_TAG_COUNT);

  // フィルタリング: テキスト AND カテゴリ AND タグ（OR）
  const filteredPosts = useMemo(() => {
    let result = posts;

    // テキスト検索
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // カテゴリフィルター
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }

    // タグフィルター（OR: いずれかのタグを含む）
    if (activeTags.size > 0) {
      result = result.filter((p) =>
        p.tags.some((t) => activeTags.has(t)),
      );
    }

    return result;
  }, [posts, searchQuery, activeCategory, activeTags]);

  const hasActiveFilter =
    searchQuery.trim() !== "" ||
    activeCategory !== null ||
    activeTags.size > 0;

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setActiveCategory(null);
    setActiveTags(new Set());
  }, []);

  return (
    <>
      {/* フィルターセクション */}
      <div className="mb-8 space-y-4">
        {/* 検索ボックス */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="記事を検索（例: サビキ、初心者、冬）"
            className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-10 sm:text-sm"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {/* カテゴリフィルター */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className="min-h-[40px] focus:outline-none"
          >
            <Badge
              variant={activeCategory === null ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              すべて
              <span className="ml-1 opacity-70">({posts.length})</span>
            </Badge>
          </button>
          {allCategories.map(([key, label]) => {
            const count = categoryCounts.get(key) ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() =>
                  setActiveCategory(activeCategory === key ? null : key)
                }
                className="min-h-[40px] focus:outline-none"
              >
                <Badge
                  variant={activeCategory === key ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary/10"
                >
                  {label}
                  <span className="ml-1 opacity-70">({count})</span>
                </Badge>
              </button>
            );
          })}
        </div>

        {/* タグフィルター */}
        {sortedTags.length > 0 ? (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Tag className="size-3" />
              タグで絞り込み
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={activeTags.has(tag) ? "default" : "outline"}
                    className="cursor-pointer px-2.5 py-1 text-xs transition-colors hover:bg-primary/10"
                  >
                    {tag}
                    <span className="ml-1 opacity-60">({count})</span>
                  </Badge>
                </button>
              ))}
              {sortedTags.length > INITIAL_TAG_COUNT ? (
                <button
                  onClick={() => setShowAllTags((prev) => !prev)}
                  className="px-2 py-1 text-xs font-medium text-primary hover:underline focus:outline-none"
                >
                  {showAllTags
                    ? "閉じる"
                    : `+${sortedTags.length - INITIAL_TAG_COUNT}件を表示`}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* 件数表示 + リセット */}
      <div className="mb-4 flex items-center gap-2">
        <FileText className="size-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {hasActiveFilter ? (
            <>
              <span className="font-semibold text-foreground">
                {filteredPosts.length}件
              </span>
              の記事がヒット
              {filteredPosts.length !== posts.length ? (
                <span className="ml-1">（全{posts.length}件中）</span>
              ) : null}
            </>
          ) : (
            <>
              全
              <span className="font-semibold text-foreground">
                {posts.length}件
              </span>
              の記事
            </>
          )}
        </p>
        {hasActiveFilter ? (
          <button
            onClick={resetFilters}
            className="ml-auto text-xs font-medium text-primary hover:underline"
          >
            フィルターをリセット
          </button>
        ) : null}
      </div>

      {/* 記事一覧 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <FileText className="mx-auto mb-4 size-12 opacity-30" />
          <p className="mb-2">条件に一致する記事が見つかりませんでした</p>
          <p className="text-sm">
            検索ワードやフィルター条件を変更してみてください
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            フィルターをリセット
          </button>
        </div>
      ) : null}
    </>
  );
}
