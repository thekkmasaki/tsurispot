import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  getWishlist,
  getWishMemo,
  setWishMemo,
} from "@/lib/auth-redis";
import { getSpotBySlug } from "@/lib/data/spots";
import { checkNgWords } from "@/lib/moderation";

const MEMO_MAX = 200;

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const checkSlug = searchParams.get("slug");

  // 個別状態チェック（slugパラメータあり）
  if (checkSlug) {
    const inWishlist = await isInWishlist(userId, checkSlug);
    const memo = inWishlist ? await getWishMemo(userId, checkSlug) : "";
    return NextResponse.json({ inWishlist, memo });
  }

  // 一覧取得
  const slugs = await getWishlist(userId, 100);
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const spot = getSpotBySlug(slug);
      const memo = await getWishMemo(userId, slug);
      return spot
        ? {
            slug: spot.slug,
            name: spot.name,
            prefecture: spot.region?.prefecture ?? "",
            spotType: spot.spotType,
            memo,
          }
        : null;
    }),
  );

  return NextResponse.json({
    items: items.filter((x): x is NonNullable<typeof x> => x !== null),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    memo?: string;
  };
  if (!body.slug || typeof body.slug !== "string") {
    return NextResponse.json({ error: "slugが必要です" }, { status: 400 });
  }
  const spot = getSpotBySlug(body.slug);
  if (!spot) {
    return NextResponse.json({ error: "スポットが見つかりません" }, { status: 404 });
  }

  await addToWishlist(userId, body.slug);
  if (body.memo !== undefined) {
    if (typeof body.memo !== "string" || body.memo.length > MEMO_MAX) {
      return NextResponse.json(
        { error: `メモは${MEMO_MAX}文字以内で入力してください` },
        { status: 400 },
      );
    }
    if (body.memo.trim().length > 0) {
      const mod = checkNgWords([body.memo]);
      if (!mod.ok) {
        return NextResponse.json({ error: mod.reason }, { status: 400 });
      }
    }
    await setWishMemo(userId, body.slug, body.memo);
  }

  return NextResponse.json({ inWishlist: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!body.slug || typeof body.slug !== "string") {
    return NextResponse.json({ error: "slugが必要です" }, { status: 400 });
  }
  await removeFromWishlist(userId, body.slug);
  return NextResponse.json({ inWishlist: false });
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    memo?: string;
  };
  if (!body.slug || typeof body.slug !== "string") {
    return NextResponse.json({ error: "slugが必要です" }, { status: 400 });
  }
  if (typeof body.memo !== "string" || body.memo.length > MEMO_MAX) {
    return NextResponse.json(
      { error: `メモは${MEMO_MAX}文字以内で入力してください` },
      { status: 400 },
    );
  }
  if (body.memo.trim().length > 0) {
    const mod = checkNgWords([body.memo]);
    if (!mod.ok) {
      return NextResponse.json({ error: mod.reason }, { status: 400 });
    }
  }

  // wishlistにあるかチェック（メモのみで存在しないとデータ整合性壊れる）
  const exists = await isInWishlist(userId, body.slug);
  if (!exists) {
    return NextResponse.json(
      { error: "行きたいスポットに登録されていません" },
      { status: 404 },
    );
  }
  await setWishMemo(userId, body.slug, body.memo);
  return NextResponse.json({ ok: true, memo: body.memo });
}
