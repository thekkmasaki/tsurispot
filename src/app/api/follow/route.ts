import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  follow,
  unfollow,
  isFollowing,
  getFollowingCount,
  getFollowersCount,
  getUserById,
} from "@/lib/auth-redis";

export async function POST(request: Request) {
  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  if (!viewerId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tsuriId?: string };
  const targetId = body.tsuriId;
  if (!targetId || typeof targetId !== "string") {
    return NextResponse.json({ error: "tsuriIdが必要です" }, { status: 400 });
  }
  if (targetId === viewerId) {
    return NextResponse.json({ error: "自分自身はフォローできません" }, { status: 400 });
  }

  const ok = await follow(viewerId, targetId);
  if (!ok) {
    return NextResponse.json({ error: "フォロー対象が見つかりません" }, { status: 404 });
  }

  const followingCount = await getFollowingCount(viewerId);
  const followersCount = await getFollowersCount(targetId);
  return NextResponse.json({ following: true, followingCount, followersCount });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  if (!viewerId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tsuriId?: string };
  const targetId = body.tsuriId;
  if (!targetId || typeof targetId !== "string") {
    return NextResponse.json({ error: "tsuriIdが必要です" }, { status: 400 });
  }

  await unfollow(viewerId, targetId);
  const followingCount = await getFollowingCount(viewerId);
  const followersCount = await getFollowersCount(targetId);
  return NextResponse.json({ following: false, followingCount, followersCount });
}

export async function GET(request: Request) {
  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("tsuriId");
  if (!targetId) {
    return NextResponse.json({ error: "tsuriIdが必要です" }, { status: 400 });
  }

  const target = await getUserById(targetId);
  if (!target) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const followingCount = await getFollowingCount(targetId);
  const followersCount = await getFollowersCount(targetId);
  const viewerFollowing = viewerId ? await isFollowing(viewerId, targetId) : false;

  return NextResponse.json({
    following: viewerFollowing,
    followingCount,
    followersCount,
  });
}
