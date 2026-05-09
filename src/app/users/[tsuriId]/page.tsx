"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Calendar, Ruler, User as UserIcon,
  Fish, Sparkles, UserPlus, UserMinus, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTitle } from "@/lib/titles";

interface ProfileResponse {
  user: {
    tsuriId: string;
    nickname: string;
    avatarUrl?: string;
    bio?: string;
    headerImage?: string;
    createdAt?: string;
    reportCount: number;
  };
  stats: {
    reportCount: number;
    uniqueFishCount: number;
    uniqueSpotCount: number;
    maxSizeCm: number;
  };
  badges: {
    earned: Array<{
      code: string;
      label: string;
      emoji: string;
      className: string;
    }>;
    total: number;
  };
  reports: Array<{
    id?: string;
    spotSlug?: string;
    spotName?: string;
    fishName?: string;
    date?: string;
    photoUrl?: string;
    sizeCm?: number;
    method?: string;
    comment?: string;
  }>;
  follow: {
    followingCount: number;
    followersCount: number;
    viewerFollowing: boolean;
    isSelf: boolean;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const tsuriId = String(params?.tsuriId || "");
  const { status: authStatus } = useSession();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!tsuriId) return;
    setLoading(true);
    fetch(`/api/users/${tsuriId}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((res) => {
        if (res) setData(res as ProfileResponse);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tsuriId]);

  const handleFollow = async () => {
    if (!data || data.follow.isSelf) return;
    if (authStatus !== "authenticated") {
      window.location.href = "/login";
      return;
    }
    setFollowLoading(true);
    const method = data.follow.viewerFollowing ? "DELETE" : "POST";
    try {
      const res = await fetch("/api/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tsuriId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData((prev) =>
          prev
            ? {
                ...prev,
                follow: {
                  ...prev.follow,
                  viewerFollowing: updated.following,
                  followersCount: updated.followersCount,
                },
              }
            : prev,
        );
      }
    } catch {
      /* ignore */
    }
    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-mid border-t-transparent" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">ユーザーが見つかりません</h1>
        <Link href="/">
          <Button className="mt-4">トップへ戻る</Button>
        </Link>
      </div>
    );
  }

  const { user, stats, badges, reports, follow } = data;
  const title = getTitle(stats.reportCount);
  const joinDate = formatJoinDate(user.createdAt);

  return (
    <div className="mx-auto max-w-2xl pb-8">
      <div className={`relative h-24 bg-gradient-to-r ${title.headerClass}`}>
        <Link
          href="/"
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs text-foreground backdrop-blur-sm hover:bg-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          トップ
        </Link>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-ocean-mid text-3xl font-bold text-white shadow-md">
              {user.nickname.charAt(0)}
            </div>
          )}
          {follow.isSelf ? (
            <Link
              href="/mypage"
              className="mt-2 inline-flex items-center gap-1 rounded-full border bg-white/95 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-white"
            >
              自分のページ
            </Link>
          ) : (
            <Button
              onClick={handleFollow}
              disabled={followLoading}
              size="sm"
              variant={follow.viewerFollowing ? "outline" : "default"}
              className="mt-2 gap-1"
            >
              {follow.viewerFollowing ? (
                <>
                  <UserMinus className="h-3.5 w-3.5" />
                  フォロー中
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  フォロー
                </>
              )}
            </Button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{user.nickname}</h1>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs leading-none ${title.className}`}
          >
            {title.emoji}
            {title.label}
          </span>
        </div>
        {joinDate && <p className="mt-0.5 text-xs text-muted-foreground">{joinDate}</p>}
        {user.bio && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {user.bio}
          </p>
        )}

        <div className="mt-3 flex gap-4 text-sm">
          <span>
            <strong className="font-bold tabular-nums">{follow.followingCount}</strong>
            <span className="ml-1 text-muted-foreground">フォロー中</span>
          </span>
          <span>
            <strong className="font-bold tabular-nums">{follow.followersCount}</strong>
            <span className="ml-1 text-muted-foreground">フォロワー</span>
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Fish className="h-4 w-4 text-ocean-mid" />}
            label="釣果数"
            value={stats.reportCount}
            unit="件"
          />
          <StatCard
            icon={<Sparkles className="h-4 w-4 text-cyan-500" />}
            label="魚種"
            value={stats.uniqueFishCount}
            unit="種"
          />
          <StatCard
            icon={<MapPin className="h-4 w-4 text-amber-500" />}
            label="スポット"
            value={stats.uniqueSpotCount}
            unit="箇所"
          />
          <StatCard
            icon={<Ruler className="h-4 w-4 text-rose-500" />}
            label="最大サイズ"
            value={stats.maxSizeCm}
            unit="cm"
          />
        </div>

        {badges.earned.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="font-medium">獲得バッジ</span>
                <span className="text-xs text-muted-foreground">
                  {badges.earned.length} / {badges.total}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {badges.earned.map((badge) => (
                  <div
                    key={badge.code}
                    className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${badge.className}`}
                    >
                      {badge.emoji}
                    </div>
                    <span className="text-xs font-medium leading-tight">{badge.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Fish className="h-5 w-5 text-ocean-mid" />
              <span className="font-medium">最近の釣果</span>
              <span className="text-xs text-muted-foreground">({reports.length}件)</span>
            </div>
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">まだ釣果はありません</p>
            ) : (
              <div className="space-y-3">
                {reports.map((report, idx) => (
                  <Link
                    key={report.id || idx}
                    href={report.spotSlug ? `/spots/${report.spotSlug}` : "#"}
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
                          {report.spotName && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {report.spotName}
                            </span>
                          )}
                          {report.date && (
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              {report.date}
                            </span>
                          )}
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
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex w-full items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function formatJoinDate(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月から利用`;
  } catch {
    return "";
  }
}
