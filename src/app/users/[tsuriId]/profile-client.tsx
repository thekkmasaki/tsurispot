"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Calendar, Ruler,
  Fish, Sparkles, UserPlus, UserMinus, Trophy, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareButtons } from "@/components/ui/share-buttons";
import { getTitle } from "@/lib/titles";

interface CatchReportItem {
  id?: string;
  spotSlug?: string;
  spotName?: string;
  fishName?: string;
  date?: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  comment?: string;
}

interface ProfileData {
  user: {
    tsuriId: string;
    nickname: string;
    avatarUrl?: string;
    bio?: string;
    headerImage?: string;
    createdAt?: string;
    reportCount: number;
    styles?: string[];
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
  reports: CatchReportItem[];
  bestCatch: CatchReportItem | null;
  follow: {
    followingCount: number;
    followersCount: number;
    isSelf: boolean;
  };
}

interface Props {
  data: ProfileData;
  shareUrl: string;
}

export function ProfileClient({ data, shareUrl }: Props) {
  const { status: authStatus, data: session } = useSession();
  const [follow, setFollow] = useState({
    followingCount: data.follow.followingCount,
    followersCount: data.follow.followersCount,
    viewerFollowing: false,
    isSelf: data.follow.isSelf,
  });
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated" || data.follow.isSelf) return;
    const viewerId = session?.user?.tsuriId;
    if (!viewerId) return;
    setFollow((prev) => ({ ...prev, isSelf: viewerId === data.user.tsuriId }));
    fetch(`/api/follow?tsuriId=${data.user.tsuriId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res && typeof res.following === "boolean") {
          setFollow((prev) => ({ ...prev, viewerFollowing: res.following }));
        }
      })
      .catch(() => {});
  }, [authStatus, session?.user?.tsuriId, data.user.tsuriId, data.follow.isSelf]);

  const handleFollow = async () => {
    if (follow.isSelf) return;
    if (authStatus !== "authenticated") {
      window.location.href = "/login";
      return;
    }
    setFollowLoading(true);
    const method = follow.viewerFollowing ? "DELETE" : "POST";
    try {
      const res = await fetch("/api/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tsuriId: data.user.tsuriId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFollow((prev) => ({
          ...prev,
          viewerFollowing: updated.following,
          followersCount: updated.followersCount,
        }));
      }
    } catch {
      /* ignore */
    }
    setFollowLoading(false);
  };

  const { user, stats, badges, reports, bestCatch } = data;
  const title = getTitle(stats.reportCount);
  const joinDate = formatJoinDate(user.createdAt);

  return (
    <div className="mx-auto max-w-2xl pb-8">
      <div
        className={`relative h-24 bg-gradient-to-r ${title.headerClass}`}
        style={
          user.headerImage
            ? {
                backgroundImage: `url(${user.headerImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <Link prefetch={false}
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
            <Link prefetch={false}
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

        {user.styles && user.styles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {user.styles.map((s) => (
              <span
                key={s}
                className="rounded-full border border-ocean-mid/30 bg-ocean-mid/5 px-2 py-0.5 text-xs text-ocean-mid"
              >
                {s}
              </span>
            ))}
          </div>
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

        {bestCatch && (
          <Card className="mt-6 overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-100/60 px-4 py-2">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">Best Catch</span>
              </div>
              <Link prefetch={false}
                href={bestCatch.spotSlug ? `/spots/${bestCatch.spotSlug}` : "#"}
                className="flex gap-3 p-4 transition-colors hover:bg-amber-100/40"
              >
                {bestCatch.photoUrl && (
                  <img
                    src={bestCatch.photoUrl}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-md object-cover shadow"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-amber-900">{bestCatch.fishName}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-amber-800">
                    {bestCatch.spotName && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {bestCatch.spotName}
                      </span>
                    )}
                    {bestCatch.date && (
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        {bestCatch.date}
                      </span>
                    )}
                    {bestCatch.sizeCm && (
                      <span className="flex items-center gap-0.5 font-semibold">
                        <Ruler className="h-3 w-3" />
                        {bestCatch.sizeCm}cm
                      </span>
                    )}
                    {bestCatch.method && <span>{bestCatch.method}</span>}
                  </div>
                  {bestCatch.comment && (
                    <p className="mt-1.5 text-xs leading-relaxed text-amber-900/80">
                      {bestCatch.comment}
                    </p>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

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
                  <Link prefetch={false}
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

        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-500" />
              <span className="font-medium">
                {follow.isSelf ? "自分のプロフィールを共有" : `${user.nickname}さんを紹介`}
              </span>
            </div>
            <ShareButtons
              url={shareUrl}
              title={`${user.nickname}さんの釣りプロフィール｜ツリスポ`}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              SNSでシェアして、釣り仲間とつながろう
            </p>
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
