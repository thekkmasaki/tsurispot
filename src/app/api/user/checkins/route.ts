import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  addCheckin,
  getCheckins,
  removeCheckin,
  type Checkin,
} from "@/lib/user-store";
import { getSpotBySlug } from "@/lib/data/spots";
import { checkNgWords } from "@/lib/moderation";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const checkins = await getCheckins(userId, 50);
  return NextResponse.json({ checkins });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    spotSlug?: string;
    date?: string;
    memo?: string;
  };

  if (!body.spotSlug || typeof body.spotSlug !== "string") {
    return NextResponse.json({ error: "spotSlugが必要です" }, { status: 400 });
  }
  const spot = getSpotBySlug(body.spotSlug);
  if (!spot) {
    return NextResponse.json({ error: "スポットが見つかりません" }, { status: 404 });
  }

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({ error: "日付の形式が不正です（YYYY-MM-DD）" }, { status: 400 });
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (new Date(body.date) > today) {
    return NextResponse.json({ error: "未来の日付は指定できません" }, { status: 400 });
  }

  if (body.memo !== undefined) {
    if (typeof body.memo !== "string" || body.memo.length > 200) {
      return NextResponse.json(
        { error: "メモは200文字以内で入力してください" },
        { status: 400 },
      );
    }
    if (body.memo.trim().length > 0) {
      const mod = checkNgWords([body.memo]);
      if (!mod.ok) {
        return NextResponse.json({ error: mod.reason }, { status: 400 });
      }
    }
  }

  const checkin: Checkin = {
    id: `ck-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    spotSlug: spot.slug,
    spotName: spot.name,
    date: body.date,
    memo: body.memo || undefined,
    createdAt: new Date().toISOString(),
  };
  await addCheckin(userId, checkin);
  return NextResponse.json({ checkin });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "idが必要です" }, { status: 400 });
  }
  const removed = await removeCheckin(userId, body.id);
  return NextResponse.json({ ok: removed });
}
