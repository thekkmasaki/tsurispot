import type { Metadata } from "next";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redis } from "@/lib/redis";
import {
  getUserById,
  getFollowingCount,
  getFollowersCount,
} from "@/lib/auth-redis";
import { ALL_TIERS, getTitle } from "@/lib/titles";
import { ProfileClient } from "./profile-client";

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

interface ProfileFetchResult {
  user: {
    tsuriId: string;
    nickname: string;
    avatarUrl?: string;
    bio?: string;
    headerImage?: string;
    createdAt?: string;
    reportCount: number;
  };
  stats: {
    reportCount: number;
    uniqueFishCount: number;
    uniqueSpotCount: number;
    maxSizeCm: number;
  };
  badges: {
    earned: Array<{ code: string; label: string; emoji: string; className: string }>;
    total: number;
  };
  reports: CatchReport[];
  bestCatch: CatchReport | null;
  follow: { followingCount: number; followersCount: number };
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

async function fetchProfile(tsuriId: string): Promise<ProfileFetchResult | null> {
  const target = await getUserById(tsuriId);
  if (!target) return null;

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

  const bestCatch = target.bestCatchId
    ? allReports.find((r) => r.id === target.bestCatchId) || null
    : null;

  return {
    user: {
      tsuriId: target.id,
      nickname: target.nickname,
      avatarUrl: target.avatarUrl,
      bio: target.bio,
      headerImage: target.headerImage,
      createdAt: target.createdAt,
      reportCount,
    },
    stats: { reportCount, uniqueFishCount, uniqueSpotCount, maxSizeCm },
    badges: { earned: earnedBadges, total: ALL_TIERS.length },
    reports: recentReports,
    bestCatch,
    follow: { followingCount, followersCount },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tsuriId: string }>;
}): Promise<Metadata> {
  const { tsuriId } = await params;
  const profile = await fetchProfile(tsuriId);
  if (!profile) {
    return {
      title: "ユーザーが見つかりません｜ツリスポ",
      robots: { index: false, follow: false },
    };
  }

  const { user, stats } = profile;
  const title = getTitle(stats.reportCount);
  const titleLabel = `${title.emoji}${title.label}`;
  const ogTitle = `${user.nickname}さん｜${titleLabel}`;
  const description = user.bio
    ? `${user.bio.slice(0, 80)}${user.bio.length > 80 ? "…" : ""}`
    : `${user.nickname}さんの釣果プロフィール｜釣果${stats.reportCount}件・魚種${stats.uniqueFishCount}種・最大${stats.maxSizeCm}cm。ツリスポで釣り仲間をフォローしよう。`;
  const canonical = `https://tsurispot.com/users/${tsuriId}`;
  const ogImage = `https://tsurispot.com/api/og?type=profile&nickname=${encodeURIComponent(
    user.nickname,
  )}&title=${encodeURIComponent(title.label)}&emoji=${encodeURIComponent(
    title.emoji,
  )}&reportCount=${stats.reportCount}&fishCount=${stats.uniqueFishCount}&maxSize=${stats.maxSizeCm}`;

  return {
    title: `${ogTitle}｜ツリスポ`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title: ogTitle,
      description,
      siteName: "ツリスポ",
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ tsuriId: string }>;
}) {
  const { tsuriId } = await params;
  const profile = await fetchProfile(tsuriId);

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">ユーザーが見つかりません</h1>
        <Link href="/">
          <Button className="mt-4">トップへ戻る</Button>
        </Link>
      </div>
    );
  }

  const shareUrl = `https://tsurispot.com/users/${tsuriId}`;

  return (
    <ProfileClient
      data={{
        user: profile.user,
        stats: profile.stats,
        badges: profile.badges,
        reports: profile.reports,
        bestCatch: profile.bestCatch,
        follow: {
          followingCount: profile.follow.followingCount,
          followersCount: profile.follow.followersCount,
          isSelf: false,
        },
      }}
      shareUrl={shareUrl}
    />
  );
}
