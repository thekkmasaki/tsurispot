import { NextResponse } from "next/server";
import { dbIncr } from "@/lib/dynamodb";

const GAS_URL = process.env.GAS_CATCH_REPORT_URL;

// 簡易メールバリデーション
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// IPベースのレート制限（1IP 1分間に5回まで）
async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const count = await dbIncr(`RATELIMIT#${ip}`, "CONTACT", 1, 60);
    return count <= 5;
  } catch {
    return true; // DB障害時は通す
  }
}

export async function POST(request: Request) {
  if (!GAS_URL) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // Cloudflare 前段のため cf-connecting-ip を優先
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "送信回数の上限に達しました。しばらくしてからお試しください。" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, category, message } = body as Record<string, string | undefined>;

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "正しいメールアドレスを入力してください" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "メッセージが長すぎます（5000文字以内）" }, { status: 400 });
    }

    const payload = {
      type: "contact",
      name: (name || "").toString().slice(0, 100).trim(),
      email: email.trim(),
      category: (category || "").toString().slice(0, 50).trim(),
      message: message.toString().slice(0, 5000).trim(),
    };

    try {
      await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        redirect: "follow",
      });
    } catch (err) {
      console.error("[お問い合わせ] GAS送信エラー:", err);
      // 送信失敗は呼び出し側で mailto フォールバックを提示できるよう明示的にエラーを返す
      return NextResponse.json({ error: "送信に失敗しました" }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      message: "お問い合わせを送信しました。通常1〜3営業日以内に返信いたします。",
    });
  } catch {
    return NextResponse.json({ error: "送信中にエラーが発生しました" }, { status: 500 });
  }
}
