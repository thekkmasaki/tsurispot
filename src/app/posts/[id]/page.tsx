import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Fish, Calendar, MapPin, Ruler, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/social/like-button";
import { auth } from "@/lib/auth";
import {
  getPostMeta,
  isPostFlagged,
  getLikeCount,
  hasLiked,
  type PostMeta,
} from "@/lib/social-store";

// 釣果パーマリンク: 通知・シェアの着地点。
// ISRは使わない(キャッシュ肥大回避)・検索インデックスにも載せない(UGC単体はnoindex一貫)
export const dynamic = "force-dynamic";

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

async function fetchPost(id: string): Promise<PostMeta | null> {
  if (!id || id.length > 100) return null;
  try {
    const [post, flagged] = await Promise.all([getPostMeta(id), isPostFlagged(id)]);
    if (!post || flagged) return null;
    return post;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPost(decodeURIComponent(id));
  if (!post) {
    return { title: "釣果が見つかりません", robots: { index: false, follow: false } };
  }
  const size = post.sizeCm ? ` ${post.sizeCm}cm` : "";
  return {
    title: `${post.fishName}${size}｜${post.spotName || post.spotSlug}の釣果`,
    description: `${post.userName}さんの釣果: ${post.comment.slice(0, 60)}`,
    robots: { index: false, follow: false },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(decodeURIComponent(id));
  if (!post) notFound();

  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  const [likeCount, liked] = await Promise.all([
    getLikeCount(post.id),
    viewerId ? hasLiked(post.id, viewerId) : Promise.resolve(false),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="size-4" aria-hidden="true" />
            {post.tsuriId ? (
              <Link
                href={`/users/${post.tsuriId}`}
                className="font-medium text-foreground hover:underline"
              >
                {post.userName}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{post.userName}</span>
            )}
            <span aria-hidden="true">·</span>
            <Calendar className="size-4" aria-hidden="true" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>

          <h1 className="mt-3 flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <Fish className="size-6 text-sky-700" aria-hidden="true" />
            {post.fishName}
            {post.sizeCm ? (
              <span className="flex items-center gap-1 text-lg font-semibold text-muted-foreground">
                <Ruler className="size-4" aria-hidden="true" />
                {post.sizeCm}cm
              </span>
            ) : null}
          </h1>

          {post.photoUrl ? (
            <Image
              src={post.photoUrl}
              alt={`${post.fishName}の釣果写真`}
              width={640}
              height={480}
              className="mt-4 w-full rounded-xl border object-cover"
              unoptimized
            />
          ) : null}

          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">
            {post.comment}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {post.method ? <Badge variant="secondary">{post.method}</Badge> : null}
            {post.weather ? (
              <Badge variant="outline">
                {WEATHER_ICONS[post.weather] ?? ""} {post.weather}
              </Badge>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
            <Link
              href={`/spots/${post.spotSlug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:underline"
            >
              <MapPin className="size-4" aria-hidden="true" />
              {post.spotName || post.spotSlug} のスポット情報を見る
            </Link>
            <LikeButton reportId={post.id} initialCount={likeCount} initialLiked={liked} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
