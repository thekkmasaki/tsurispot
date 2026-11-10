"use client";

import Link from "next/link";
import { Fish, Calendar, MapPin, Ruler, MessageCircle } from "lucide-react";
import { CatchPhoto } from "@/components/ui/spot-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/social/like-button";
import { RepostButton } from "@/components/social/repost-button";
import { FollowButton } from "@/components/social/follow-button";
import { cn } from "@/lib/utils";
import type { PostMeta } from "@/lib/social-store";

interface SocialCatchCardProps {
  post: PostMeta;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
  repostCount?: number;
  repostedByViewer?: boolean;
  viewerTsuriId?: string;
  /**
   * 閲覧者がフォロー中のIDの集合。渡すとフォローボタンが状態取得の fetch を省略する。
   * 未指定の場合はボタン側が個別に取得する（カード枚数の少ない画面向け）。
   */
  viewerFollowingIds?: Set<string>;
  /** フォロー状態が変わったときに親へ通知する（一覧側の集合を最新に保つ用） */
  onFollowChange?: (tsuriId: string, following: boolean) => void;
}

const WEATHER_ICONS: Record<string, string> = {
  "晴れ": "☀️",
  "曇り": "☁️",
  "雨": "🌧️",
  "風強い": "💨",
};

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-indigo-100 text-indigo-800",
  "bg-teal-100 text-teal-800",
];

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${Number(parts[0])}年${Number(parts[1])}月${Number(parts[2])}日`;
}

// 投稿メタに画像が無いため、名前の頭文字＋ID由来の固定色でアバターを出す
function InitialAvatar({ name, seed }: { name: string; seed: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const initial = Array.from(name.trim() || "釣")[0];
  return (
    <span
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-base font-bold sm:size-11",
        AVATAR_COLORS[h % AVATAR_COLORS.length],
      )}
    >
      {initial}
    </span>
  );
}

// タイムライン・タグページ共用の釣果カード（いいね/コメント導線つき）
// レイアウト: 左にアバター列、右に本文列（SNS定番の2列）。写真は本文幅いっぱいに表示
export function SocialCatchCard({
  post,
  likeCount,
  commentCount,
  likedByViewer,
  repostCount = 0,
  repostedByViewer = false,
  viewerTsuriId,
  viewerFollowingIds,
  onFollowChange,
}: SocialCatchCardProps) {
  const permalink = `/posts/${encodeURIComponent(post.id)}`;
  const profileHref = post.tsuriId ? `/users/${post.tsuriId}` : undefined;
  // 投稿者が自分でない場合だけフォロー導線を出す（未ログイン時は押すとログインへ誘導される）
  const followTargetId =
    post.tsuriId && post.tsuriId !== viewerTsuriId ? post.tsuriId : undefined;
  const avatar = <InitialAvatar name={post.userName} seed={post.tsuriId || post.userName} />;
  const hasMeta = Boolean(post.method || post.weather || (post.tags && post.tags.length > 0));

  return (
    <Card className="gap-0 py-0 transition-shadow hover:shadow-md">
      <CardContent className="flex gap-3 px-3 py-3.5 sm:gap-4 sm:px-5 sm:py-4">
        {profileHref ? (
          <Link prefetch={false} href={profileHref} className="shrink-0" tabIndex={-1} aria-hidden="true">
            {avatar}
          </Link>
        ) : (
          <div className="shrink-0" aria-hidden="true">
            {avatar}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* ヘッダー行: 名前・日付・スポット。フォローボタンは右端固定 */}
          <div className="flex items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground sm:text-[13px]">
              {profileHref ? (
                <Link
                  prefetch={false}
                  href={profileHref}
                  className="max-w-full truncate text-sm font-bold text-foreground hover:underline sm:text-[15px]"
                >
                  {post.userName}
                </Link>
              ) : (
                <span className="max-w-full truncate text-sm font-bold text-foreground sm:text-[15px]">
                  {post.userName}
                </span>
              )}
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <Calendar className="size-3" aria-hidden="true" />
                {formatDate(post.date)}
              </span>
              {post.spotSlug && (
                <Link
                  prefetch={false}
                  href={`/spots/${post.spotSlug}`}
                  className="inline-flex min-w-0 max-w-full items-center gap-0.5 text-sky-700 hover:underline"
                >
                  <MapPin className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{post.spotName || post.spotSlug}</span>
                </Link>
              )}
            </div>
            {followTargetId && (
              <FollowButton
                tsuriId={followTargetId}
                initialFollowing={viewerFollowingIds?.has(followTargetId)}
                onFollowChange={(next) => onFollowChange?.(followTargetId, next)}
                className="shrink-0 px-3 py-0.5"
              />
            )}
          </div>

          {post.type === "tweet" ? (
            /* つぶやき: 本文が主役。写真は本文の下に大きめ表示 */
            <div className="mt-1.5">
              <Link prefetch={false} href={permalink} className="block hover:opacity-90">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{post.comment}</p>
              </Link>
              {post.fishName && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <Fish className="size-3" aria-hidden="true" />
                  {post.fishName}
                  {post.sizeCm ? ` ${post.sizeCm}cm` : ""}
                </span>
              )}
              <CatchPhoto variant="wide" src={post.photoUrl} alt="投稿写真" href={permalink} />
            </div>
          ) : (
            <div className="mt-1.5">
              <Link
                prefetch={false}
                href={permalink}
                className="group inline-flex flex-wrap items-center gap-2"
              >
                <span className="inline-flex items-center gap-1.5 text-base font-bold group-hover:underline sm:text-lg">
                  <Fish className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  {post.fishName}
                </span>
                {post.sizeCm ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <Ruler className="size-3" aria-hidden="true" />
                    {post.sizeCm}cm
                  </span>
                ) : null}
              </Link>
              {post.comment && (
                <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85 sm:text-[15px]">
                  {post.comment}
                </p>
              )}
              <CatchPhoto
                variant="wide"
                src={post.photoUrl}
                alt={`${post.fishName}の釣果写真`}
                href={permalink}
              />
              {hasMeta && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {post.method && (
                    <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                      {post.method}
                    </Badge>
                  )}
                  {post.weather && (
                    <span className="text-xs text-muted-foreground">
                      <span aria-hidden="true">{WEATHER_ICONS[post.weather] || ""}</span> {post.weather}
                    </span>
                  )}
                  {post.tags?.map((tag) => (
                    <Link
                      prefetch={false}
                      key={tag}
                      href={`/tags/${encodeURIComponent(tag)}`}
                      className="text-xs text-sky-700 hover:underline"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* アクション行: 本文列に揃えて等間隔配置（区切り線なしで縦の圧迫感を減らす） */}
          <div className="-ml-2 mt-2 flex max-w-xs items-center justify-between sm:max-w-sm">
            <LikeButton
              reportId={post.id}
              initialCount={likeCount}
              initialLiked={likedByViewer}
            />
            <Link
              prefetch={false}
              href={permalink}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-sky-700"
              aria-label="コメントを見る"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              <span className="tabular-nums">{commentCount > 0 ? commentCount : "コメント"}</span>
            </Link>
            <RepostButton
              reportId={post.id}
              initialCount={repostCount}
              initialReposted={repostedByViewer}
              disabled={Boolean(post.tsuriId && viewerTsuriId && post.tsuriId === viewerTsuriId)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
