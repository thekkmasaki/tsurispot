import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/user-store";
import { ALL_TIERS } from "@/lib/titles";

interface CatchReport {
  spotSlug?: string;
  fishName?: string;
  date?: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
}

interface Badge {
  code: string;
  label: string;
  emoji: string;
  className: string;
  earned: boolean;
  progress: number;
  description: string;
  currentValue: number;
  targetValue: number;
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

export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const raw = await redis.lrange(`auth:user_reports:${userId}`, 0, 499);
  const reports = parseReports(raw as unknown[]);

  const user = await getUserById(userId);
  const reportCount = user?.reportCount ?? reports.length;
  const uniqueFishCount = new Set(reports.map((r) => r.fishName).filter(Boolean)).size;
  const uniqueSpotCount = new Set(reports.map((r) => r.spotSlug).filter(Boolean)).size;
  const uniqueMethodCount = new Set(reports.map((r) => r.method).filter(Boolean)).size;
  const photoCount = reports.filter((r) => r.photoUrl).length;
  const sizes = reports
    .map((r) => r.sizeCm)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  const maxSize = sizes.length > 0 ? Math.max(...sizes) : 0;

  const tierBadges: Badge[] = ALL_TIERS.map((tier) => ({
    code: `tier_${tier.min}`,
    label: tier.label,
    emoji: tier.emoji,
    className: tier.className,
    earned: reportCount >= tier.min,
    progress: tier.min === 0 ? 1 : Math.min(reportCount / tier.min, 1),
    description: tier.min === 0 ? "ようこそ！" : `釣果を${tier.min}件以上投稿`,
    currentValue: reportCount,
    targetValue: tier.min,
  }));

  const extraBadges: Badge[] = [
    {
      code: "first_catch",
      label: "初釣果",
      emoji: "🎉",
      className: "bg-emerald-500 text-white",
      earned: reportCount >= 1,
      progress: Math.min(reportCount, 1),
      description: "初めての釣果を投稿",
      currentValue: Math.min(reportCount, 1),
      targetValue: 1,
    },
    {
      code: "fish_collector_5",
      label: "魚種コレクター",
      emoji: "🐠",
      className: "bg-cyan-500 text-white",
      earned: uniqueFishCount >= 5,
      progress: Math.min(uniqueFishCount / 5, 1),
      description: "5種類以上の魚を釣る",
      currentValue: uniqueFishCount,
      targetValue: 5,
    },
    {
      code: "fish_collector_20",
      label: "魚種マスター",
      emoji: "🦑",
      className: "bg-indigo-500 text-white",
      earned: uniqueFishCount >= 20,
      progress: Math.min(uniqueFishCount / 20, 1),
      description: "20種類以上の魚を釣る",
      currentValue: uniqueFishCount,
      targetValue: 20,
    },
    {
      code: "spot_explorer_10",
      label: "スポット探検家",
      emoji: "🗺️",
      className: "bg-amber-500 text-white",
      earned: uniqueSpotCount >= 10,
      progress: Math.min(uniqueSpotCount / 10, 1),
      description: "10箇所以上のスポットを訪問",
      currentValue: uniqueSpotCount,
      targetValue: 10,
    },
    {
      code: "photo_lover_10",
      label: "撮影派",
      emoji: "📸",
      className: "bg-pink-500 text-white",
      earned: photoCount >= 10,
      progress: Math.min(photoCount / 10, 1),
      description: "写真付き釣果を10件投稿",
      currentValue: photoCount,
      targetValue: 10,
    },
    {
      code: "method_variety_3",
      label: "オールラウンダー",
      emoji: "🎯",
      className: "bg-violet-500 text-white",
      earned: uniqueMethodCount >= 3,
      progress: Math.min(uniqueMethodCount / 3, 1),
      description: "3種類以上の釣法で釣る",
      currentValue: uniqueMethodCount,
      targetValue: 3,
    },
    {
      code: "big_catch_50",
      label: "大物ハンター",
      emoji: "🐡",
      className: "bg-rose-500 text-white",
      earned: maxSize >= 50,
      progress: Math.min(maxSize / 50, 1),
      description: "50cm以上の大物を釣る",
      currentValue: maxSize,
      targetValue: 50,
    },
  ];

  const allBadges = [...tierBadges, ...extraBadges];
  const earnedCount = allBadges.filter((b) => b.earned).length;

  return NextResponse.json({
    tierBadges,
    extraBadges,
    summary: {
      reportCount,
      uniqueFishCount,
      uniqueSpotCount,
      photoCount,
      maxSizeCm: maxSize,
      earnedCount,
      totalCount: allBadges.length,
    },
  });
}
