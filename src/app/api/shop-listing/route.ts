import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const GAS_URL = process.env.GAS_CATCH_REPORT_URL;

// 簡易メールバリデーション
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// IPベースのレート制限（1IP 1分間に5回まで）
async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `shoplisting_rl:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 60);
    }
    return count <= 5;
  } catch {
    return true; // Redis障害時は通す
  }
}

export async function POST(request: Request) {
  if (!GAS_URL) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // レート制限
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "送信回数の上限に達しました。しばらくしてからお試しください。" }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { type } = body as Record<string, string | undefined>;

    // 有料プラン問い合わせ
    if (type === "paid_inquiry_basic" || type === "paid_inquiry_pro") {
      const { shopName, contactName, email, phone, message, plan } =
        body as Record<string, string | undefined>;

      if (!shopName || typeof shopName !== "string" || shopName.length > 50) {
        return NextResponse.json({ error: "店舗名を入力してください" }, { status: 400 });
      }
      if (!email || typeof email !== "string" || !isValidEmail(email)) {
        return NextResponse.json({ error: "正しいメールアドレスを入力してください" }, { status: 400 });
      }
      if (!phone || typeof phone !== "string") {
        return NextResponse.json({ error: "電話番号を入力してください" }, { status: 400 });
      }

      const payload = {
        type,
        shopName: shopName.trim(),
        contactName: (contactName || "").trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: (message || "").trim(),
        plan: plan || (type === "paid_inquiry_basic" ? "basic" : "pro"),
      };

      try {
        await fetch(GAS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("[有料プラン問い合わせ] GAS送信エラー:", err);
      }

      return NextResponse.json({
        ok: true,
        message: "お問い合わせありがとうございます！",
      });
    }

    // 無料掲載申請
    const { shopName, address, phone, businessHours, closedDays, services, email, nearbySpots } =
      body as Record<string, string | undefined>;

    if (!shopName || typeof shopName !== "string" || shopName.length > 50) {
      return NextResponse.json({ error: "店舗名を入力してください（50文字以内）" }, { status: 400 });
    }
    if (!address || typeof address !== "string" || address.length > 200) {
      return NextResponse.json({ error: "住所を入力してください" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "電話番号を入力してください" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "正しいメールアドレスを入力してください" }, { status: 400 });
    }

    const payload = {
      type: "shop_listing",
      shopName: shopName.trim(),
      address: (address || "").trim(),
      phone: (phone || "").trim(),
      businessHours: (businessHours || "").trim(),
      closedDays: (closedDays || "").trim(),
      services: (services || "").trim(),
      email: (email || "").trim(),
      nearbySpots: (nearbySpots || "").trim(),
    };

    try {
      await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("[店舗掲載申請] GAS送信エラー:", err);
    }

    return NextResponse.json({
      ok: true,
      message: "申請ありがとうございます！確認後にご連絡いたします。",
    });
  } catch {
    return NextResponse.json({ error: "送信中にエラーが発生しました" }, { status: 500 });
  }
}
