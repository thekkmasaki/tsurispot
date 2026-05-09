import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import {
  getUserById,
  isFollowing,
  getFollowingCount,
  getFollowersCount,
} from "@/lib/auth-redis";
import { ALL_TIERS } from "@/lib/titles";

interface CatchReport {
  id?: string;
  spotSlug?: string;
  spotName?: string;
  fishName?: string;
  date?: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  comment?: string;
}

function parseReports(raw: unknown[]): CatchReport[] {
  return (raw || [])
    .map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item) as CatchReport;
        } catch {
          return null;
        }
      }
      return item as CatchReport;
    })
    .filter((r): r is CatchReport => Boolean(r));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tsuriId: string }> },
) {
  const { tsuriId } = await params;
  const target = await getUserById(tsuriId);
  if (!target) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  const isSelf = viewerId === tsuriId;

  const allRaw = await redis.lrange(`auth:user_reports:${tsuriId}`, 0, 499);
  const allReports = parseReports(allRaw as unknown[]);
  const recentReports = allReports.slice(0, 10);

  const reportCount = target.reportCount ?? allReports.length;
  const uniqueFishCount = new Set(allReports.map((r) => r.fishName).filter(Boolean)).size;
  const uniqueSpotCount = new Set(allReports.map((r) => r.spotSlug).filter(Boolean)).size;
  const sizes = allReports
    .map((r) => r.sizeCm)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  const maxSizeCm = sizes.length > 0 ? Math.max(...sizes) : 0;

  const earnedBadges = ALL_TIERS.filter((tier) => reportCount >= tier.min).map((tier) => ({
    code: `tier_${tier.min}`,
    label: tier.label,
    emoji: tier.emoji,
    className: tier.className,
  }));

  const followingCount = await getFollowingCount(tsuriId);
  const followersCount = await getFollowersCount(tsuriId);
  const viewerFollowing =
    viewerId && !isSelf ? await isFollowing(viewerId, tsuriId) : false;

  return NextResponse.json({
    user: {
      tsuriId: target.id,
      nickname: target.nickname,
      avatarUrl: target.avatarUrl,
      bio: target.bio,
      headerImage: target.headerImage,
      createdAt: target.createdAt,
      reportCount,
    },
    stats: {
      reportCount,
      uniqueFishCount,
      uniqueSpotCount,
      maxSizeCm,
    },
    badges: {
      earned: earnedBadges,
      total: ALL_TIERS.length,
    },
    reports: recentReports,
    follow: {
      followingCount,
      followersCount,
      viewerFollowing,
      isSelf,
    },
  });
}
