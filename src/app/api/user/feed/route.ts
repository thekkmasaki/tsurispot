import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getFollowingList, getUserById } from "@/lib/user-store";

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
  createdAt?: string;
}

interface FeedItem extends CatchReport {
  authorId: string;
  authorNickname: string;
  authorAvatarUrl?: string;
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
  const viewerId = session?.user?.tsuriId;
  if (!viewerId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const followingIds = await getFollowingList(viewerId, 100);
  if (followingIds.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const perUserItems = await Promise.all(
    followingIds.map(async (uid) => {
      const [user, raw] = await Promise.all([
        getUserById(uid),
        redis.lrange(`auth:user_reports:${uid}`, 0, 9) as Promise<unknown[]>,
      ]);
      if (!user) return [] as FeedItem[];
      const reports = parseReports(raw);
      return reports.map(
        (r): FeedItem => ({
          ...r,
          authorId: user.id,
          authorNickname: user.nickname,
          authorAvatarUrl: user.avatarUrl,
        }),
      );
    }),
  );

  const items = perUserItems
    .flat()
    .sort((a, b) => {
      const aTime = (a.createdAt || a.date || "0").localeCompare(
        b.createdAt || b.date || "0",
      );
      return -aTime;
    })
    .slice(0, 50);

  return NextResponse.json({ items });
}
