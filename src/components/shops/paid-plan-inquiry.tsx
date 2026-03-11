"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Mail, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaidPlanInquiryProps {
  plan: "basic" | "pro";
}

const PLAN_INFO = {
  basic: {
    name: "ベーシック",
    price: "初年度 月額500円（2年目〜980円）",
    color: "blue",
    features: ["公式バッジ表示", "検索結果の優先表示", "写真3枚まで掲載"],
  },
  pro: {
    name: "プロ",
    price: "初年度 月額1,980円（2年目〜2,980円）",
    color: "amber",
    features: ["ベーシックの全機能", "写真20枚・店主メッセージ", "1日50回エサ在庫更新", "クーポン配信・商品PR", "Googleビジネスプロフィール設定サポート"],
  },
} as const;

export function PaidPlanInquiry({ plan }: PaidPlanInquiryProps) {
  const info = PLAN_INFO[plan];
  const [isOpen, setIsOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) { setErrorMessage("店舗名を入力してください"); setStatus("error"); return; }
    if (!email.trim()) { setErrorMessage("メールアドレスを入力してください"); setStatus("error"); return; }
    if (!phone.trim()) { setErrorMessage("電話番号を入力してください"); setStatus("error"); return; }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/shop-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: `paid_inquiry_${plan}`,
          shopName: shopName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          plan,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setErrorMessage(data.error || "送信に失敗しました");
        setStatus("error");
      }
    } catch {
      setErrorMessage("ネットワークエラーが発生しました");
      setStatus("error");
    }
  };

  const borderColor = plan === "pro" ? "border-amber-200" : "border-blue-200";
  const bgGradient = plan === "pro"
    ? "bg-gradient-to-br from-amber-50/50 to-transparent"
    : "bg-gradient-to-br from-blue-50/50 to-transparent";
  const iconColor = plan === "pro" ? "text-amber-500" : "text-blue-500";
  const btnClass = plan === "pro"
    ? "bg-amber-500 hover:bg-amber-600"
    : "bg-blue-600 hover:bg-blue-700";

  if (status === "success") {
    return (
      <Card className={`${borderColor} bg-green-50/50`}>
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle className="size-10 text-green-600" />
            <p className="font-bold text-green-800 text-lg">お問い合わせありがとうございます！</p>
            <p className="text-sm text-green-700">
              {info.name}プランについて、<strong>1〜2営業日以内</strong>にメールでご連絡いたします。
            </p>
            <p className="text-xs text-muted-foreground">
              連絡先: {email}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isOpen) {
    return (
      <Card className={`${borderColor} ${bgGradient}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${iconColor}`} />
            {info.name}プラン（{info.price}）に興味がありますか？
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <Gift className="size-4" />
              今なら3ヶ月無料キャンペーン中！
            </div>
            <p className="mt-1 text-xs text-red-600">
              お申し込みから3ヶ月間は無料でお試しいただけます。無料期間中の解約もOK、費用は一切発生しません。4ヶ月目から通常料金が適用されます。
            </p>
          </div>
          <p className="text-sm leading-relaxed">
            {info.name}プランでは、無料プランにはない集客機能をご利用いただけます。
            まずはお気軽にお問い合わせください。
          </p>
          <ul className="space-y-1.5">
            {info.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className={`mt-0.5 size-3.5 shrink-0 ${iconColor}`} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button onClick={() => setIsOpen(true)} className={`w-full gap-2 ${btnClass}`}>
            <Mail className="size-4" />
            {info.name}プランについて問い合わせる
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={borderColor}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className={`w-5 h-5 ${iconColor}`} />
          {info.name}プラン お問い合わせ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="pi-shop" className="mb-1 block text-sm font-medium">
              店舗名 <span className="text-destructive">*</span>
            </label>
            <Input id="pi-shop" placeholder="例: ○○釣具店" value={shopName} onChange={(e) => setShopName(e.target.value)} maxLength={50} required />
          </div>
          <div>
            <label htmlFor="pi-name" className="mb-1 block text-sm font-medium">ご担当者名</label>
            <Input id="pi-name" placeholder="例: 山田太郎" value={contactName} onChange={(e) => setContactName(e.target.value)} maxLength={30} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="pi-email" className="mb-1 block text-sm font-medium">
                メールアドレス <span className="text-destructive">*</span>
              </label>
              <Input id="pi-email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={100} required />
            </div>
            <div>
              <label htmlFor="pi-phone" className="mb-1 block text-sm font-medium">
                電話番号 <span className="text-destructive">*</span>
              </label>
              <Input id="pi-phone" placeholder="例: 078-000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} required />
            </div>
          </div>
          <div>
            <label htmlFor="pi-msg" className="mb-1 block text-sm font-medium">ご質問・ご要望</label>
            <textarea
              id="pi-msg"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
              placeholder="例: 掲載開始までの流れを教えてほしい"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
            />
          </div>

          {status === "error" && errorMessage && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />{errorMessage}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            送信することで、お預かりした情報をツリスポのサービス提供のために使用することに同意いただいたものとします。
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" disabled={status === "submitting"} className={`gap-2 ${btnClass}`}>
              <Send className="size-4" />
              {status === "submitting" ? "送信中..." : "問い合わせを送信"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setIsOpen(false); setStatus("idle"); setErrorMessage(""); }}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
