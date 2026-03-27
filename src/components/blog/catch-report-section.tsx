"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  Fish,
  MapPin,
  Calendar,
  ChevronDown,
} from "lucide-react";
import type { BlogPost } from "@/lib/data/blog";

/** リスト表示用の軽量型（content除外） */
type BlogPostSummary = Omit<BlogPost, "content">;

const INITIAL_SHOW = 4;

function ReportCard({ post, featured }: { post: BlogPostSummary; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card
        className={`group h-full overflow-hidden border-0 py-0 transition-all hover:shadow-lg ${
          featured
            ? "bg-gradient-to-br from-sky-50 to-blue-50 ring-1 ring-sky-200/60 dark:from-sky-950/30 dark:to-blue-950/30 dark:ring-sky-800/40"
            : "bg-white ring-1 ring-gray-200/60 dark:bg-gray-900 dark:ring-gray-700/40"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* サムネイル */}
          <div className="relative h-44 w-full overflow-hidden sm:h-48">
            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-400 to-cyan-500">
                <Fish className="size-14 text-white/30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_60%)]" />
              </div>
            )}
            {featured ? (
              <div className="absolute left-3 top-3">
                <Badge className="bg-orange-500 text-white shadow-md hover:bg-orange-500">
                  NEW
                </Badge>
              </div>
            ) : null}
          </div>

          <CardContent className="flex flex-1 flex-col gap-2 p-4">
            {/* 日付・スポット */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" />
                {post.publishedAt}
              </span>
              {post.relatedSpots && post.relatedSpots.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400">
                  <MapPin className="size-3" />
                  {post.relatedSpots[0].replace(/-/g, " ")}
                </span>
              ) : null}
            </div>

            {/* タイトル */}
            <h3 className="text-sm font-bold leading-snug group-hover:text-sky-600 sm:text-base">
              {post.title.replace(/^【釣行レポート】/, "")}
            </h3>

            {/* 釣れた魚タグ */}
            {post.relatedFish && post.relatedFish.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {post.relatedFish.slice(0, 3).map((fish) => (
                  <Badge
                    key={fish}
                    variant="secondary"
                    className="bg-sky-100 px-2 py-0.5 text-[10px] text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                  >
                    <Fish className="mr-0.5 size-2.5" />
                    {fish}
                  </Badge>
                ))}
              </div>
            ) : null}

            {/* 説明 */}
            <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {post.description}
            </p>

            <div className="flex items-center gap-1 text-sm font-medium text-sky-600 dark:text-sky-400">
              レポートを読む
              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function CatchReportSection({ posts, showAll: initialShowAll = false }: { posts: BlogPostSummary[]; showAll?: boolean }) {
  const [showAll, setShowAll] = useState(initialShowAll);
  const visiblePosts = showAll ? posts : posts.slice(0, INITIAL_SHOW);

  if (posts.length === 0) return null;

  return (
    <section>
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md">
            <Fish className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              釣果レポート
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {posts.length}件の釣行記録
            </p>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          編集部の実釣レポート。釣り場の状況やポイント、使ったタックル、釣果をリアルにお届けします。
        </p>
      </div>

      {/* カード一覧 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {visiblePosts.map((post, i) => (
          <ReportCard key={post.id} post={post} featured={i === 0} />
        ))}
      </div>

      {/* もっと見るボタン */}
      {posts.length > INITIAL_SHOW ? (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-5 py-2.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:bg-sky-900/40"
          >
            {showAll ? (
              "閉じる"
            ) : (
              <>
                すべての釣果レポートを見る（{posts.length}件）
                <ChevronDown className="size-4" />
              </>
            )}
          </button>
        </div>
      ) : null}
    </section>
  );
}
