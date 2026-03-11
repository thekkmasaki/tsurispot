"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ShopListingForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [closedDays, setClosedDays] = useState("");
  const [services, setServices] = useState("");
  const [email, setEmail] = useState("");
  const [nearbySpots, setNearbySpots] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      setErrorMessage("店舗名を入力してください");
      setStatus("error");
      return;
    }
    if (!address.trim()) {
      setErrorMessage("住所を入力してください");
      setStatus("error");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("電話番号を入力してください");
      setStatus("error");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("連絡先メールアドレスを入力してください");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/shop-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: shopName.trim(),
          address: address.trim(),
          phone: phone.trim(),
          businessHours: businessHours.trim(),
          closedDays: closedDays.trim(),
          services: services.trim(),
          email: email.trim(),
          nearbySpots: nearbySpots.trim(),
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

  if (!isOpen) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-green-600" />
            無料でお店を掲載しませんか？
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">
            ツリスポでは釣具店の基本情報を<strong>無料</strong>で掲載しています。
            下のフォームから申請するだけで、確認後すぐに掲載されます。初期費用・月額費用は一切かかりません。
          </p>
          <div className="rounded-lg border bg-background p-4 space-y-2">
            <p className="text-sm font-bold">掲載に必要な情報</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-green-500" />
                <span><strong>店舗名</strong>と<strong>住所</strong>（必須）</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-green-500" />
                <span>電話番号・営業時間・定休日</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-green-500" />
                <span>エサの在庫は掲載後に専用画面で設定OK</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground pt-1">※ わかる範囲で大丈夫です。後から追加・修正もできます。</p>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
          >
            <Send className="size-4" />
            無料掲載を申し込む
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle className="size-10 text-green-600" />
            <p className="font-bold text-green-800 text-lg">申請ありがとうございます！</p>
            <p className="text-sm text-green-700">
              内容を確認のうえ、掲載を進めます。<br />
              通常1〜3営業日以内に掲載が完了します。
            </p>
            {email && (
              <p className="text-xs text-muted-foreground">
                掲載完了時に {email} にご連絡いたします。
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Store className="w-5 h-5 text-green-600" />
          無料掲載の申し込み
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="sl-shopname" className="mb-1 block text-sm font-medium">
              店舗名 <span className="text-destructive">*</span>
            </label>
            <Input
              id="sl-shopname"
              placeholder="例: ○○釣具店"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          <div>
            <label htmlFor="sl-address" className="mb-1 block text-sm font-medium">
              住所 <span className="text-destructive">*</span>
            </label>
            <Input
              id="sl-address"
              placeholder="例: 〒000-0000 ○○県○○市○○町1-2-3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sl-phone" className="mb-1 block text-sm font-medium">
                電話番号 <span className="text-destructive">*</span>
              </label>
              <Input
                id="sl-phone"
                placeholder="例: 078-000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                required
              />
            </div>
            <div>
              <label htmlFor="sl-email" className="mb-1 block text-sm font-medium">
                連絡先メール <span className="text-destructive">*</span>
              </label>
              <Input
                id="sl-email"
                type="email"
                placeholder="掲載完了のご連絡先"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sl-hours" className="mb-1 block text-sm font-medium">営業時間</label>
              <Input
                id="sl-hours"
                placeholder="例: 6:00〜20:00"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                maxLength={50}
              />
            </div>
            <div>
              <label htmlFor="sl-closed" className="mb-1 block text-sm font-medium">定休日</label>
              <Input
                id="sl-closed"
                placeholder="例: 毎週水曜日"
                value={closedDays}
                onChange={(e) => setClosedDays(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>

          <div>
            <label htmlFor="sl-services" className="mb-1 block text-sm font-medium">その他サービス</label>
            <Input
              id="sl-services"
              placeholder="例: レンタルロッドあり、駐車場5台"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <label htmlFor="sl-nearby" className="mb-1 block text-sm font-medium">
              近くのおすすめ釣りポイント
            </label>
            <Input
              id="sl-nearby"
              placeholder="例: ○○堤防、△△漁港、□□海釣り公園"
              value={nearbySpots}
              onChange={(e) => setNearbySpots(e.target.value)}
              maxLength={200}
            />
            <p className="mt-0.5 text-xs text-muted-foreground">お店の近くでお客様におすすめしている釣り場があれば教えてください</p>
          </div>

          {status === "error" && errorMessage && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5">
            <p className="text-sm font-medium text-blue-800">取り扱いエサについて</p>
            <p className="mt-0.5 text-xs text-blue-700">
              エサの在庫情報は、掲載後に専用の管理画面から簡単に設定・更新できます。
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground">
            送信することで、お預かりした情報をツリスポの店舗掲載のために使用することに同意いただいたものとします。情報は掲載目的以外には使用いたしません。
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              disabled={status === "submitting"}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="size-4" />
              {status === "submitting" ? "送信中..." : "申請する（無料）"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setStatus("idle");
                setErrorMessage("");
              }}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
