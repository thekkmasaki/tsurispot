import type { Metadata } from "next";
import Link from "next/link";
import { Hash } from "lucide-react";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { SocialCatchCard } from "@/components/social/social-catch-card";
import {
  normalizeTag,
  getTagFeedRefs,
  getTagCount,
  resolveFeedPosts,
  getLikesBulk,
  getCommentCountsBulk,
  getRepostsBulk,
} from "@/lib/social-store";

// タグ別釣果一覧: UGC由来のためnoindex・ISR不使用
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const norm = normalizeTag(decodeURIComponent(tag));
  return {
    title: `#${norm} の釣果`,
    description: `ハッシュタグ #${norm} が付いた釣果投稿の一覧です。`,
    robots: { index: false, follow: false },
  };
}

async function getPopularTags(): Promise<string[]> {
  try {
    const tags = await redis.zrange<string[]>("tags:popular", 0, 19, { rev: true });
    return (tags ?? []).filter((t): t is string => typeof t === "string");
  } catch {
    return [];
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const norm = normalizeTag(decodeURIComponent(tag));

  const session = await auth();
  const viewerId = session?.user?.tsuriId;

  const [refs, total, popularTags] = await Promise.all([
    norm ? getTagFeedRefs(norm, 30) : Promise.resolve([]),
    norm ? getTagCount(norm) : Promise.resolve(0),
    getPopularTags(),
  ]);
  const posts = await resolveFeedPosts(refs);
  const ids = posts.map((p) => p.id);
  const [{ counts, likedIds }, commentCounts, reposts] = await Promise.all([
    getLikesBulk(ids, viewerId),
    getCommentCountsBulk(ids),
    getRepostsBulk(ids, viewerId),
  ]);
  const likedSet = new Set(likedIds);
  const repostedSet = new Set(reposts.repostedIds);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-1.5 text-xl font-bold">
        <Hash className="size-5 text-sky-700" aria-hidden="true" />
        {norm || tag}
        <span className="text-sm font-normal text-muted-foreground">（{total}件）</span>
      </h1>

      {popularTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="人気タグ">
          {popularTags.map((t) => (
            <Link
              prefetch={false}
              key={t}
              href={`/tags/${encodeURIComponent(t)}`}
              className={
                t === norm
                  ? "rounded-full bg-ocean-deep px-3 py-1 text-xs font-semibold text-white"
                  : "rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-sky-700"
              }
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              このタグが付いた釣果はまだありません。
            </p>
            <Link prefetch={false} href="/timeline" className="mt-2 inline-block text-sm text-sky-700 hover:underline">
              タイムラインを見る
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <SocialCatchCard
              key={post.id}
              post={post}
              likeCount={counts[post.id] ?? 0}
              commentCount={commentCounts[post.id] ?? 0}
              likedByViewer={likedSet.has(post.id)}
              repostCount={reposts.counts[post.id] ?? 0}
              repostedByViewer={repostedSet.has(post.id)}
              viewerTsuriId={viewerId}
            />
          ))
        )}
      </div>
    </main>
  );
}
