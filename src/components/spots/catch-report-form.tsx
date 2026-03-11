"use client";

import { useState, useRef } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// そのスポットで釣れる魚名 + 汎用的な人気魚種
const COMMON_FISH = ["アジ", "サバ", "イワシ", "メバル", "カサゴ", "シーバス", "クロダイ", "アオリイカ"];

interface CatchReportFormProps {
  spotSlug: string;
  spotName: string;
  catchableFishNames?: string[];
}

export function CatchReportForm({ spotSlug, spotName, catchableFishNames = [] }: CatchReportFormProps) {
  const fishInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [fishName, setFishName] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // クライアント側バリデーション
    if (!userName.trim()) {
      setErrorMessage("ニックネームを入力してください");
      setStatus("error");
      return;
    }
    if (!fishName.trim()) {
      setErrorMessage("釣った魚を入力してください");
      setStatus("error");
      return;
    }
    if (!comment.trim()) {
      setErrorMessage("ひとことを入力してください");
      setStatus("error");
      return;
    }
    if (comment.length > 100) {
      setErrorMessage("ひとことは100文字以内で入力してください");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/catch-report-ugc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotSlug,
          spotName,
          fishName: fishName.trim(),
          userName: userName.trim(),
          comment: comment.trim(),
          date,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        // フォームリセット
        setUserName("");
        setFishName("");
        setComment("");
      } else {
        setErrorMessage(data.error || "送信に失敗しました");
        setStatus("error");
      }
    } catch {
      setErrorMessage("ネットワークエラーが発生しました。もう一度お試しください。");
      setStatus("error");
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="mt-3 gap-2"
      >
        <Send className="size-4" />
        釣果を報告する
      </Button>
    );
  }

  if (status === "success") {
    return (
      <Card className="mt-3 border-emerald-200 bg-emerald-50/50 py-4">
        <CardContent className="px-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">
                投稿ありがとうございます！
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                管理者の承認後に表示されます。
              </p>
              <Button
                onClick={() => {
                  setStatus("idle");
                  setIsOpen(false);
                }}
                variant="ghost"
                size="sm"
                className="mt-2 text-emerald-700 hover:text-emerald-800"
              >
                閉じる
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-3 py-4">
      <CardContent className="px-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="cr-username" className="mb-1 block text-sm font-medium">
              ニックネーム <span className="text-destructive">*</span>
            </label>
            <Input
              id="cr-username"
              type="text"
              placeholder="例: 釣りキチ太郎"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={20}
              required
            />
          </div>

          <div>
            <label htmlFor="cr-fishname" className="mb-1 block text-sm font-medium">
              釣った魚 <span className="text-destructive">*</span>
            </label>
            {(() => {
              // スポットの魚を優先、足りなければ汎用魚種で補完（重複排除）
              const seen = new Set<string>();
              const buttons: string[] = [];
              for (const name of [...catchableFishNames, ...COMMON_FISH]) {
                if (!seen.has(name) && buttons.length < 8) {
                  seen.add(name);
                  buttons.push(name);
                }
              }
              // 現在選択中の魚名を配列で管理
              const selected = fishName ? fishName.split("、").map(s => s.trim()).filter(Boolean) : [];
              const selectedSet = new Set(selected);
              const toggle = (name: string) => {
                if (selectedSet.has(name)) {
                  setFishName(selected.filter(s => s !== name).join("、"));
                } else {
                  setFishName([...selected, name].join("、"));
                }
              };
              return buttons.length > 0 ? (
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {buttons.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggle(name)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        selectedSet.has(name)
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-muted-foreground/20 text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setTimeout(() => fishInputRef.current?.focus(), 0);
                    }}
                    className="rounded-full border border-muted-foreground/20 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
                  >
                    その他
                  </button>
                </div>
              ) : null;
            })()}
            <Input
              ref={fishInputRef}
              id="cr-fishname"
              type="text"
              placeholder="例: アジ、サバ"
              value={fishName}
              onChange={(e) => setFishName(e.target.value)}
              maxLength={30}
              required
            />
          </div>

          <div>
            <label htmlFor="cr-date" className="mb-1 block text-sm font-medium">
              釣った日 <span className="text-destructive">*</span>
            </label>
            <Input
              id="cr-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <label htmlFor="cr-comment" className="mb-1 block text-sm font-medium">
              ひとこと <span className="text-destructive">*</span>
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {comment.length}/100
              </span>
            </label>
            <textarea
              id="cr-comment"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="例: 朝マヅメにサビキで20匹釣れました！"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {status === "error" && errorMessage && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              disabled={status === "submitting"}
              className="gap-2"
            >
              <Send className="size-4" />
              {status === "submitting" ? "送信中..." : "釣果を投稿する"}
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
