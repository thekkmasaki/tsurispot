"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, Heart, Trash2, Fish, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/hooks/use-favorites";

export default function MyPage() {
  const { data: session, status, update } = useSession();
  const { favorites } = useFavorites();
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-mid border-t-transparent" />
      </div>
    );
  }

  if (!session?.user?.tsuriId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <User className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">ログインが必要です</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          マイページを利用するにはログインしてください
        </p>
        <Link href="/login">
          <Button className="mt-4">ログインする</Button>
        </Link>
      </div>
    );
  }

  const user = session.user;

  const handleSaveNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || trimmed.length > 20) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      });
      if (res.ok) {
        await update(); // セッションを更新
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } catch { /* ignore */ }
    setDeleting(false);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        トップに戻る
      </Link>

      <h1 className="mb-6 text-2xl font-bold">マイページ</h1>

      {/* プロフィール */}
      <Card className="mb-4">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ocean-mid text-lg font-bold text-white">
                {user.nickname.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold">{user.nickname}</p>
              <p className="text-xs text-muted-foreground">
                {user.provider === "line" ? "LINE" : user.provider}でログイン中
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="nickname" className="mb-1 block text-sm font-medium">
              ニックネーム変更
            </label>
            <div className="flex gap-2">
              <Input
                id="nickname"
                placeholder={user.nickname}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
              <Button
                onClick={handleSaveNickname}
                disabled={saving || !nickname.trim()}
                size="sm"
              >
                {saved ? "保存済み" : saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* お気に入り */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Link
            href="/favorites"
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-medium">お気に入りスポット</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {favorites.length}件
            </span>
          </Link>
        </CardContent>
      </Card>

      {/* 釣果レポート */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Fish className="h-5 w-5 text-ocean-mid" />
            <span className="font-medium">投稿した釣果</span>
            <span className="text-xs text-muted-foreground">（近日実装）</span>
          </div>
        </CardContent>
      </Card>

      {/* アカウント削除 */}
      <div className="mt-8 border-t pt-6">
        <h2 className="mb-2 text-sm font-medium text-destructive">危険な操作</h2>
        {!deleteConfirm ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteConfirm(true)}
            className="gap-1 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            アカウントを削除
          </Button>
        ) : (
          <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm">
              本当に削除しますか？お気に入り・投稿データがすべて失われます。
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "削除中..." : "はい、削除する"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirm(false)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
