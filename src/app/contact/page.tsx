"use client";

import { useState } from "react";
import {
  Mail,
  Send,
  MapPin,
  Bug,
  PlusCircle,
  MessageCircle,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CONTACT_EMAIL = "fishingspotjapan@gmail.com";

const categories = [
  {
    value: "spot-correction",
    label: "スポット情報の修正",
    icon: MapPin,
    description: "住所・営業時間・料金などの間違い",
  },
  {
    value: "spot-request",
    label: "新しいスポットの追加",
    icon: PlusCircle,
    description: "掲載されていない釣り場を教えてください",
  },
  {
    value: "bug-report",
    label: "不具合の報告",
    icon: Bug,
    description: "表示がおかしい・動かないなど",
  },
  {
    value: "other",
    label: "その他・ご意見",
    icon: MessageCircle,
    description: "サイトへのご要望やご感想",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedCategory = categories.find((c) => c.value === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `[ツリスポ] ${selectedCategory?.label || "お問い合わせ"}`
    );
    const bodyParts = [];
    if (name) bodyParts.push(`お名前: ${name}`);
    bodyParts.push(`返信先: ${email}`);
    if (selectedCategory) bodyParts.push(`カテゴリ: ${selectedCategory.label}`);
    bodyParts.push("", message);
    const body = encodeURIComponent(bodyParts.join("\n"));

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValid = email.trim() !== "" && message.trim() !== "";

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* ヘッダー */}
      <div className="mb-8 text-center sm:mb-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Send className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
          ご意見・ご要望をお寄せください
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
          釣り場の情報修正、新しいスポットの追加要望、サイトの不具合など
          <br className="hidden sm:block" />
          なんでもお気軽にご連絡ください。
        </p>
      </div>

      {/* カテゴリ選択 */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium">
          どんな内容ですか？
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(isSelected ? "" : cat.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all sm:p-4 ${
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-medium sm:text-sm">{cat.label}</span>
                <span className="hidden text-[10px] text-muted-foreground sm:block">
                  {cat.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* フォーム */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* お名前 */}
            <div>
              <label
                htmlFor="contact-name"
                className="mb-1.5 block text-sm font-medium"
              >
                お名前（ニックネームでもOK）
              </label>
              <Input
                id="contact-name"
                type="text"
                placeholder="つりたろう"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label
                htmlFor="contact-email"
                className="mb-1.5 block text-sm font-medium"
              >
                メールアドレス
                <span className="ml-1 text-xs text-red-500">*必須</span>
              </label>
              <Input
                id="contact-email"
                type="email"
                required
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                返信が必要な場合に使用します
              </p>
            </div>

            {/* メッセージ本文 */}
            <div>
              <label
                htmlFor="contact-message"
                className="mb-1.5 block text-sm font-medium"
              >
                メッセージ
                <span className="ml-1 text-xs text-red-500">*必須</span>
              </label>
              <textarea
                id="contact-message"
                required
                rows={6}
                placeholder={
                  category === "spot-correction"
                    ? "例：「○○港」の駐車場情報が古いです。現在は無料で利用できます。"
                    : category === "spot-request"
                      ? "例：△△市の□□堤防を追加してほしいです。アジやサバがよく釣れます。"
                      : category === "bug-report"
                        ? "例：地図ページが表示されません。使用ブラウザはChromeです。"
                        : "お気軽にメッセージをお書きください"
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] placeholder:text-muted-foreground"
              />
            </div>

            {/* 送信ボタン */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={!isValid}
                className="w-full min-h-[48px] gap-2"
              >
                <Mail className="h-4 w-4" />
                メールアプリで送信する
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                ボタンを押すとメールアプリが開きます。内容を確認して送信してください。
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* メールアプリが開かない場合 */}
      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            メールアプリが開かない場合は、下記アドレスに直接送信してください
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <code className="rounded bg-muted px-3 py-1.5 text-sm font-medium">
              {CONTACT_EMAIL}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyEmail}
              className="min-h-[36px] gap-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  コピー済み
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  コピー
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          通常1〜3営業日以内に返信いたします
        </p>
      </div>
    </main>
  );
}
