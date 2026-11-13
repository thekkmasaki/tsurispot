import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendToInbox } from "@/lib/gas-inbox";

const GAS_URL = process.env.GAS_CATCH_REPORT_URL;

// 簡易メールバリデーション
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 任意文字列項目の検証: 未指定は ""、文字列以外/上限超過は null
function optStr(v: unknown, max: number): string | null {
  if (v === undefined || v === null) return "";
  if (typeof v !== "string" || v.length > max) return null;
  return v.trim();
}

export async function POST(request: Request) {
  if (!GAS_URL) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // レート制限
  const allowed = await checkRateLimit(getClientIp(request), "SHOPLISTING", 5, 60);
  if (!allowed) {
    return NextResponse.json({ error: "送信回数の上限に達しました。しばらくしてからお試しください。" }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { type } = body as Record<string, unknown>;

    // 有料プラン問い合わせ
    if (type === "paid_inquiry_basic" || type === "paid_inquiry_pro") {
      const { shopName, contactName, email, phone, message } =
        body as Record<string, unknown>;

      if (!shopName || typeof shopName !== "string" || shopName.length > 50) {
        return NextResponse.json({ error: "店舗名を入力してください" }, { status: 400 });
      }
      if (!email || typeof email !== "string" || email.length > 100 || !isValidEmail(email)) {
        return NextResponse.json({ error: "正しいメールアドレスを入力してください" }, { status: 400 });
      }
      if (!phone || typeof phone !== "string" || phone.length > 30) {
        return NextResponse.json({ error: "電話番号を入力してください" }, { status: 400 });
      }
      const contactNameClean = optStr(contactName, 50);
      const messageClean = optStr(message, 1000);
      if (contactNameClean === null || messageClean === null) {
        return NextResponse.json({ error: "入力内容が長すぎます" }, { status: 400 });
      }

      const payload = {
        type,
        shopName: shopName.trim(),
        contactName: contactNameClean,
        email: email.trim(),
        phone: phone.trim(),
        message: messageClean,
        plan: type === "paid_inquiry_basic" ? "basic" : "pro",
      };

      try {
        await sendToInbox(GAS_URL, {
          type,
          summary: payload.shopName,
          senderName: payload.contactName || payload.shopName,
          details: [
            ["店舗名", payload.shopName],
            ["担当者", payload.contactName],
            ["メール", payload.email],
            ["電話", payload.phone],
            ["プラン", payload.plan],
            ["内容", payload.message],
          ],
          fields: payload,
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
      body as Record<string, unknown>;

    if (!shopName || typeof shopName !== "string" || shopName.length > 50) {
      return NextResponse.json({ error: "店舗名を入力してください（50文字以内）" }, { status: 400 });
    }
    if (!address || typeof address !== "string" || address.length > 200) {
      return NextResponse.json({ error: "住所を入力してください" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || phone.length > 30) {
      return NextResponse.json({ error: "電話番号を入力してください" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || email.length > 100 || !isValidEmail(email)) {
      return NextResponse.json({ error: "正しいメールアドレスを入力してください" }, { status: 400 });
    }
    const hoursClean = optStr(businessHours, 100);
    const closedClean = optStr(closedDays, 100);
    const servicesClean = optStr(services, 300);
    const nearbyClean = optStr(nearbySpots, 300);
    if (hoursClean === null || closedClean === null || servicesClean === null || nearbyClean === null) {
      return NextResponse.json({ error: "入力内容が長すぎます" }, { status: 400 });
    }

    const payload = {
      type: "shop_listing",
      shopName: shopName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      businessHours: hoursClean,
      closedDays: closedClean,
      services: servicesClean,
      email: email.trim(),
      nearbySpots: nearbyClean,
    };

    try {
      await sendToInbox(GAS_URL, {
        type: "shop_listing",
        summary: payload.shopName,
        senderName: payload.shopName,
        details: [
          ["店舗名", payload.shopName],
          ["住所", payload.address],
          ["電話", payload.phone],
          ["メール", payload.email],
          ["営業時間", payload.businessHours],
          ["定休日", payload.closedDays],
          ["サービス", payload.services],
          ["近くの釣り場", payload.nearbySpots],
        ],
        fields: payload,
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
