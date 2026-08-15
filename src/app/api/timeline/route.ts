import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFollowingList } from "@/lib/user-store";
import { getEditorialCards, type EditorialCard } from "@/lib/editorial-feed";
import {
  getGlobalFeedRefs,
  resolveFeedPosts,
  getLikesBulk,
  getCommentCountsBulk,
  getRepostsBulk,
  type PostMeta,
} from "@/lib/social-store";

export interface TimelineItem {
  post: PostMeta;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
  repostCount: number;
  repostedByViewer: boolean;
}

// カーソルは "yyyymm:sk" を base64url で包む
function encodeCursor(c: { month: string; sk: string }): string {
  return Buffer.from(`${c.month}:${c.sk}`).toString("base64url");
}
function decodeCursor(s: string | null): { month: string; sk: string } | undefined {
  if (!s) return undefined;
  try {
    const raw = Buffer.from(s, "base64url").toString();
    const idx = raw.indexOf(":");
    if (idx !== 6) return undefined;
    const month = raw.slice(0, 6);
    const sk = raw.slice(7);
    if (!/^\d{6}$/.test(month) || !sk.startsWith("TS#")) return undefined;
    return { month, sk };
  } catch {
    return undefined;
  }
}

// GET /api/timeline?tab=all|following&cursor= — 20件/頁
// 読み往復: refs(1-2) + posts/FLAGGED(2) + like/comment/liked(3) ≒ 5-6回でキャップ
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") === "following" ? "following" : "all";
  const cursor = decodeCursor(searchParams.get("cursor"));

  const session = await auth();
  const viewerId = session?.user?.tsuriId;

  // フォロー中IDは following タブの絞り込みだけでなく、カード上のフォローボタンの初期状態にも使う。
  // ここでまとめて返すことで、クライアントがカード1枚ごとに /api/follow を叩くのを防ぐ（Redis ZRANGE 1回で済む）
  const followingIds = viewerId ? await getFollowingList(viewerId, 100) : [];

  let filter: ((ref: { tsuriId?: string }) => boolean) | undefined;
  if (tab === "following") {
    if (!viewerId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    if (followingIds.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null, followingIds: [] });
    }
    const following = new Set(followingIds);
    filter = (ref) => Boolean(ref.tsuriId && following.has(ref.tsuriId));
  }

  const { refs, nextCursor } = await getGlobalFeedRefs(20, cursor, filter);
  const posts = await resolveFeedPosts(refs);
  const ids = posts.map((p) => p.id);
  const [{ counts, likedIds }, commentCounts, reposts] = await Promise.all([
    getLikesBulk(ids, viewerId),
    getCommentCountsBulk(ids),
    getRepostsBulk(ids, viewerId),
  ]);
  const likedSet = new Set(likedIds);
  const repostedSet = new Set(reposts.repostedIds);

  const items: TimelineItem[] = posts.map((post) => ({
    post,
    likeCount: counts[post.id] ?? 0,
    commentCount: commentCounts[post.id] ?? 0,
    likedByViewer: likedSet.has(post.id),
    repostCount: reposts.counts[post.id] ?? 0,
    repostedByViewer: repostedSet.has(post.id),
  }));

  // 編集部カード（コールドスタート対策）: 全体タブの1ページ目のみ添付。
  // UGCが増えるほど比率は自然に低下（挿入はクライアント側でUGC4件ごとに1枚）
  let editorial: EditorialCard[] = [];
  if (tab === "all" && !cursor) {
    try {
      editorial = await getEditorialCards();
    } catch (err) {
      console.error("[timeline] 編集部カード取得エラー:", err);
    }
  }

  return NextResponse.json({
    items,
    nextCursor: nextCursor ? encodeCursor(nextCursor) : null,
    editorial,
    followingIds,
  });
}
