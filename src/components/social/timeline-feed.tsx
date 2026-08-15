"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Fish, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeAdBreak } from "@/components/ads/ad-unit";
import { SocialCatchCard } from "@/components/social/social-catch-card";
import { EditorialCard } from "@/components/social/editorial-card";
import { cn } from "@/lib/utils";
import type { PostMeta } from "@/lib/social-store";
import type { EditorialCard as EditorialCardData } from "@/lib/editorial-feed";

interface TimelineItem {
  post: PostMeta;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
  repostCount: number;
  repostedByViewer: boolean;
}

type Tab = "all" | "following";

// タイムライン本体。タブ切替・カーソルページング・広告5件毎（即ロード=lazy化禁忌）
export function TimelineFeed() {
  const { data: session, status } = useSession();
  const viewerTsuriId = session?.user?.tsuriId;
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [editorial, setEditorial] = useState<EditorialCardData[]>([]);
  // カードのフォローボタン初期状態。API がまとめて返すのでカードごとの状態取得は発生しない
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (targetTab: Tab, cursor?: string | null) => {
    const params = new URLSearchParams({ tab: targetTab });
    if (cursor) params.set("cursor", cursor);
    const res = await fetch(`/api/timeline?${params.toString()}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "タイムラインの取得に失敗しました");
    return data as {
      items: TimelineItem[];
      nextCursor: string | null;
      editorial?: EditorialCardData[];
      followingIds?: string[];
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    load(tab)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setEditorial(data.editorial ?? []);
        setNextCursor(data.nextCursor);
        setFollowingIds(new Set(data.followingIds ?? []));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "取得に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, load]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await load(tab, nextCursor);
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      // 追加読み込み失敗は無視（ボタン再押下で再試行）
    } finally {
      setLoadingMore(false);
    }
  };

  // カード上でフォロー状態が変わったら集合も更新する。
  // これをしないと「もっと見る」で追加したカードが古い状態で初期化されて表示がズレる
  const handleFollowChange = useCallback((tsuriId: string, following: boolean) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (following) next.add(tsuriId);
      else next.delete(tsuriId);
      return next;
    });
  }, []);

  return (
    <div>
      <div className="flex gap-1 rounded-full border bg-card p-1" role="tablist" aria-label="タイムライン切替">
        {(
          [
            { key: "all", label: "全体" },
            { key: "following", label: "フォロー中" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-full py-1.5 text-sm transition-colors",
              tab === t.key
                ? "bg-ocean-deep font-semibold text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">読み込み中...</p>
        ) : error ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{error}</p>
        ) : tab === "following" && status !== "authenticated" ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            フォロー中タブは
            <Link prefetch={false} href="/login" className="mx-1 underline hover:text-foreground">
              ログイン
            </Link>
            すると使えます。
          </p>
        ) : items.length === 0 ? (
          <>
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center">
              <Fish className="mx-auto size-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted-foreground">
                {tab === "following"
                  ? "フォロー中のユーザーの釣果がここに流れます。気になる釣り人をフォローしてみましょう。"
                  : "まだ釣果がありません。最初の投稿者になりましょう！"}
              </p>
              {tab === "all" ? (
                <Link
                  prefetch={false}
                  href="/post"
                  className="mt-3 inline-block rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800"
                >
                  釣果を投稿する
                </Link>
              ) : (
                /* フォロー先が居ないと永久に空のままなので、探す導線をここに出す */
                <Link
                  prefetch={false}
                  href="/users"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800"
                >
                  <Users className="size-4" aria-hidden="true" />
                  釣り人を探す
                </Link>
              )}
            </div>
            {/* UGCゼロでもフィードが空にならないよう編集部カードで埋める */}
            {tab === "all" &&
              editorial.map((card, i) => (
                <Fragment key={`ed-${card.href}`}>
                  <EditorialCard card={card} />
                  {(i + 1) % 5 === 0 && <NativeAdBreak className="py-2" />}
                </Fragment>
              ))}
          </>
        ) : (
          items.map((item, idx) => {
            // UGC4件ごとに編集部カードを1枚挿入（UGCが増えるほど比率は自然に低下）
            const edIdx = (idx + 1) % 4 === 0 ? Math.floor((idx + 1) / 4) - 1 : -1;
            const ed = edIdx >= 0 && editorial.length > 0 ? editorial[edIdx % editorial.length] : null;
            return (
              <Fragment key={item.post.id}>
                <SocialCatchCard
                  post={item.post}
                  likeCount={item.likeCount}
                  commentCount={item.commentCount}
                  likedByViewer={item.likedByViewer}
                  repostCount={item.repostCount}
                  repostedByViewer={item.repostedByViewer}
                  viewerTsuriId={viewerTsuriId}
                  viewerFollowingIds={followingIds}
                  onFollowChange={handleFollowChange}
                />
                {ed && <EditorialCard card={ed} />}
                {/* フィード5件毎に広告（即ロード。lazy化はRPM半減の前歴があり禁忌） */}
                {(idx + 1) % 5 === 0 && <NativeAdBreak className="py-2" />}
              </Fragment>
            );
          })
        )}
      </div>

      {nextCursor && !loading && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "読み込み中..." : "もっと見る"}
          </Button>
        </div>
      )}
    </div>
  );
}
