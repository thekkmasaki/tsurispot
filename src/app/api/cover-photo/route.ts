import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { readMultipartFile, validateAndUploadImage } from "@/lib/image-upload";
import { rejectInactiveUser } from "@/lib/user-status";

export async function POST(request: NextRequest) {
  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  if (!viewerId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const inactive = await rejectInactiveUser(viewerId);
  if (inactive) return inactive;

  if (!(await checkRateLimit(viewerId, "COVER_PHOTO", 10, 3600))) {
    return NextResponse.json(
      { error: "アップロード回数の上限に達しました。しばらくしてからお試しください。" },
      { status: 429 },
    );
  }

  const parsed = await readMultipartFile(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const result = await validateAndUploadImage(parsed.file, `covers/${viewerId}`, "cover-photo");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, url: result.url });
}
