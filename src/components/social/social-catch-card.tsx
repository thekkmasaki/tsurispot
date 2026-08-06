"use client";

import Link from "next/link";
import Image from "next/image";
import { Fish, Calendar, MapPin, Ruler, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/social/like-button";
import { RepostButton } from "@/components/social/repost-button";
import type { PostMeta } from "@/lib/social-store";

interface SocialCatchCardProps {
  post: PostMeta;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
  repostCount?: number;
  repostedByViewer?: boolean;
  viewerTsuriId?: string;
}

const WEATHER_ICONS: Record<string, string> = {
  "晴れ": "☀️",
  "曇り": "☁️",
  "雨": "🌧️",
  "風強い": "💨",
};

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${Number(parts[0])}年${Number(parts[1])}月${Number(parts[2])}日`;
}

// タイムライン・タグページ共用の釣果カード（いいね/コメント導線つき）
export function SocialCatchCard({
  post,
  likeCount,
  commentCount,
  likedByViewer,
  repostCount = 0,
  repostedByViewer = false,
  viewerTsuriId,
}: SocialCatchCardProps) {
  const permalink = `/posts/${encodeURIComponent(post.id)}`;

  return (
    <Card className="py-3">
      <CardContent className="px-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {post.tsuriId ? (
            <Link
              prefetch={false}
              href={`/users/${post.tsuriId}`}
              className="text-sm font-semibold text-foreground hover:underline"
            >
              {post.userName}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-foreground">{post.userName}</span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="size-3" aria-hidden="true" />
            {formatDate(post.date)}
          </span>
          <Link
            prefetch={false}
            href={`/spots/${post.spotSlug}`}
            className="flex items-center gap-0.5 text-sky-700 hover:underline"
          >
            <MapPin className="size-3" aria-hidden="true" />
            {post.spotName || post.spotSlug}
          </Link>
        </div>

        <div className="mt-2 flex items-start gap-3">
          {post.photoUrl ? (
            <Link prefetch={false} href={permalink} className="shrink-0">
              <Image
                src={post.photoUrl}
                alt={`${post.fishName}の釣果写真`}
                width={80}
                height={80}
                className="size-20 rounded-lg border object-cover"
                unoptimized
              />
            </Link>
          ) : (
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Fish className="size-4 text-emerald-600" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link prefetch={false} href={permalink} className="hover:underline">
              <p className="text-sm font-bold">
                {post.fishName}
                {post.sizeCm ? (
                  <span className="ml-2 inline-flex items-center gap-0.5 text-xs font-semibold text-muted-foreground">
                    <Ruler className="size-3" aria-hidden="true" />
                    {post.sizeCm}cm
                  </span>
                ) : null}
              </p>
            </Link>
            {post.comment && (
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {post.comment}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {post.method && (
                <Badge variant="outline" className="px-1.5 py-0 text-xs font-normal">
                  {post.method}
                </Badge>
              )}
              {post.weather && (
                <span className="text-xs text-muted-foreground">
                  <span aria-hidden="true">{WEATHER_ICONS[post.weather] || ""}</span> {post.weather}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 border-t pt-2">
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
      </CardContent>
    </Card>
  );
}
