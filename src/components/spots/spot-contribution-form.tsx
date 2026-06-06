"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, Lightbulb, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

interface SpotContributionFormProps {
  spotSlug: string;
  spotName: string;
}

const MIN = 8;
const MAX = 200;

export function SpotContributionForm({ spotSlug, spotName }: SpotContributionFormProps) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [userName, setUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.nickname) {
      setUserName(session.user.nickname);
    }
  }, [authStatus, session?.user?.nickname]);

  // 未ログイン: ログイン導線（投稿は荒らし抑制のためログイン必須）
  if (authStatus !== "authenticated") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
          <Lightbulb className="size-6 text-amber-500" aria-hidden="true" />
          <p className="text-sm font-medium">この釣り場のコツ・情報を共有しませんか？</p>
          <p className="text-xs text-muted-foreground">ログインすると釣り場メモを投稿できます（貢献バッジが貯まります）</p>
          <Button asChild size="sm" className="mt-1 gap-1.5">
            <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
              <LogIn className="size-4" aria-hidden="true" />
              ログインして投稿
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full gap-1.5" onClick={() => setOpen(true)}>
        <Lightbulb className="size-4 text-amber-500" aria-hidden="true" />
        この釣り場のコツ・情報を投稿する
      </Button>
    );
  }

  const trimmed = text.trim();
  const valid = trimmed.length >= MIN && trimmed.length <= MAX && userName.trim().length > 0;

  async function handleSubmit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/spot-contribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotSlug, type: "tip", text: trimmed, userName: userName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const n = typeof data.contributionCount === "number" ? data.contributionCount : 0;
        toast.success(n > 0 ? `投稿しました！あなたの${n}件目の貢献です🎣` : (data.message || "投稿しました！"));
        setText("");
        setOpen(false);
        router.refresh(); // 自動公開UGCを一覧へ即反映
      } else {
        toast.error(data.error || "投稿に失敗しました。もう一度お試しください。");
      }
    } catch {
      toast.error("投稿に失敗しました。もう一度お試しください。");
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="size-4 text-amber-500" aria-hidden="true" />
          {spotName}のコツ・釣り場情報を投稿
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={MAX}
          placeholder="例: 南側の堤防先端が潮通し良し。朝マヅメはアジの回遊が入りやすい。駐車は港入口の空きスペースに。"
          className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3">
          <span className={`text-xs ${trimmed.length < MIN || trimmed.length > MAX ? "text-muted-foreground" : "text-emerald-600"}`}>
            {trimmed.length}/{MAX}（{MIN}文字以上）
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={submitting}>
              キャンセル
            </Button>
            <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={!valid || submitting}>
              <Send className="size-4" aria-hidden="true" />
              {submitting ? "投稿中..." : "投稿する"}
            </Button>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          実際に訪れた体験・コツを共有してください。宣伝・誹謗・他サイトのコピーは禁止です。投稿は公開され、{userName || "あなた"}の貢献として記録されます。
        </p>
      </CardContent>
    </Card>
  );
}
