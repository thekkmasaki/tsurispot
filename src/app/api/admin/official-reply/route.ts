import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { purgeCloudflareUrls } from "@/lib/cloudflare";
import { getPostMeta, setOfficialReply } from "@/lib/social-store";

/**
 * UGC釣果投稿への運営公式返信を登録する管理API。
 * body: { reportId: string, text: string }
 * 認可: Bearer ADMIN_SECRET（/api/admin/block-report と同方式）。
 *
 * 保存先は REPORT#{reportId}/OFFICIAL_REPLY（1投稿1件・再実行で上書き）。
 * 表示はスポット詳細の釣果一覧（catch-report-list.tsx）が取得時に付与する。
 * 書込後、該当スポットページの ISR 再生成と Cloudflare purge を行い即時反映する。
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const MAX_TEXT_LENGTH = 500;

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      reportId?: unknown;
      text?: unknown;
    };
    const reportId = typeof body.reportId === "string" ? body.reportId.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!reportId || reportId.length > 100) {
      return NextResponse.json({ error: "reportId is required" }, { status: 400 });
    }
    if (!text || text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `text is required (1-${MAX_TEXT_LENGTH}文字)` },
        { status: 400 },
      );
    }

    // 投稿の実在確認（spotSlug の取得も兼ねる）
    const post = await getPostMeta(reportId);
    if (!post) {
      return NextResponse.json({ error: "post not found" }, { status: 404 });
    }

    const reply = await setOfficialReply(reportId, text);

    // 該当スポットページへ即時反映（ISR再生成 + CFエッジpurge）
    if (post.spotSlug) {
      revalidatePath(`/spots/${post.spotSlug}`);
      await purgeCloudflareUrls([`/spots/${post.spotSlug}`]);
    }

    return NextResponse.json({
      ok: true,
      reportId,
      spotSlug: post.spotSlug || null,
      reply,
    });
  } catch (err) {
    console.error("[admin/official-reply] error:", err);
    return NextResponse.json(
      { error: "処理中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
