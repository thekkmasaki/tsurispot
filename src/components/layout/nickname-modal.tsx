"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NicknameModal() {
  const { data: session, update } = useSession();
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 新規ユーザーでない or 未ログインなら何も表示しない
  if (!session?.user?.isNewUser) return null;

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("ニックネームを入力してください");
      return;
    }
    if (trimmed.length > 20) {
      setError("20文字以内で入力してください");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      });
      if (res.ok) {
        await update({ nickname: trimmed });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "保存に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    }
    setSaving(false);
  };

  const handleSkip = async () => {
    // 現在のニックネーム（LINE名）をそのまま確定
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: session.user.nickname }),
      });
      await update({ nickname: session.user.nickname });
    } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <span className="text-4xl">🎣</span>
          <h2 className="mt-2 text-lg font-bold">ようこそ、ツリスポへ！</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            釣果投稿で使うニックネームを設定しましょう
          </p>
        </div>

        <div className="mt-5">
          <Input
            placeholder="ニックネーム（20文字以内）"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          {error && (
            <p className="mt-1 text-xs text-red-500">{error}</p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "この名前にする"}
          </Button>
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            「{session.user.nickname}」のままにする
          </button>
        </div>
      </div>
    </div>
  );
}
