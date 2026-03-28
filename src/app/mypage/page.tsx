"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, Heart, Trash2, Fish, ArrowLeft, MapPin, Calendar, Ruler, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/hooks/use-favorites";
import { getTitle, getNextTier } from "@/lib/titles";

export default function MyPage() {
  const { data: session, status, update } = useSession();
  const { favorites } = useFavorites();
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [catchReports, setCatchReports] = useState<Array<{
    id: string; spotSlug: string; spotName: string; fishName: string;
    date: string; photoUrl?: string; sizeCm?: number; method?: string;
    weather?: string; comment: string;
  }>>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/catch-reports")
        .then((r) => r.json())
        .then((data) => {
          setCatchReports(data.reports || []);
          setReportCount(data.reportCount || data.reports?.length || 0);
        })
        .catch(() => {})
        .finally(() => setReportsLoading(false));
    }
  }, [status]);

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
              <div className="flex items-center gap-1.5">
                <p className="font-bold">{user.nickname}</p>
                {(() => {
                  const title = getTitle(reportCount);
                  if (!title) return null;
                  return (
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs leading-none ${title.className}`}>
                      {title.emoji}{title.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.provider === "line" ? "LINE" : user.provider}でログイン中
              </p>
              {(() => {
                const next = getNextTier(reportCount);
                if (!next) return (
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    🌟 最高ランク到達！
                  </p>
                );
                return (
                  <p className="mt-1 text-xs text-muted-foreground">
                    あと{next.remaining}件で{next.emoji}{next.label}！
                  </p>
                );
              })()}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-ocean-mid" />
              <span className="font-medium">投稿した釣果</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {reportsLoading ? "..." : `${catchReports.length}件`}
            </span>
          </div>

          {reportsLoading ? (
            <div className="mt-3 flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-ocean-mid border-t-transparent" />
            </div>
          ) : catchReports.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              まだ釣果を投稿していません。スポットページから投稿できます。
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {catchReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/spots/${report.spotSlug}`}
                  className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex gap-3">
                    {report.photoUrl && (
                      <img
                        src={report.photoUrl}
                        alt=""
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{report.fishName}</p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {report.spotName}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" />
                          {report.date}
                        </span>
                        {report.sizeCm && (
                          <span className="flex items-center gap-0.5">
                            <Ruler className="h-3 w-3" />
                            {report.sizeCm}cm
                          </span>
                        )}
                        {report.method && <span>{report.method}</span>}
                      </div>
                      {report.comment && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {report.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
