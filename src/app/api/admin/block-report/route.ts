import { NextResponse } from "next/server";
import { dbPut } from "@/lib/dynamodb";
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
    await dbPut(`REPORT#${reportId}`, "FLAGGED", "1");

    // 写真削除（オプション）
    if (deletePhoto) {
      try {
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
