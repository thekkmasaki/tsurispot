import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { deleteFromS3 } from "@/lib/s3";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(request: Request) {
  // 認証チェック
  const auth = request.headers.get("Authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { reportId, deletePhoto } = body as {
      reportId?: string;
      deletePhoto?: boolean;
    };

    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json({ error: "reportId is required" }, { status: 400 });
    }

    // 非表示フラグをセット
    await redis.set(`report_flagged:${reportId}`, "1");

    // 写真削除（オプション）
    if (deletePhoto) {
      // Redisからレポートデータを探して写真URLを取得
      // ugc_reports:* のリストを走査するのはコストが高いため、
      // 写真URLを直接指定する方式に変更可能だが、簡易実装として
      // reportIdからレポートを特定する
      try {
        // reportIdの形式: ugc-{timestamp}-{random}
        // スポットslugは不明なため、管理者がphotoUrlも指定できるよう拡張
        const { photoUrl } = body as { photoUrl?: string };
        if (photoUrl && typeof photoUrl === "string" && photoUrl.startsWith("https://")) {
          await deleteFromS3(photoUrl);
        }
      } catch (err) {
        console.error("[admin/block-report] 写真削除エラー:", err);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `レポート ${reportId} をブロックしました`,
    });
  } catch {
    return NextResponse.json(
      { error: "処理中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
