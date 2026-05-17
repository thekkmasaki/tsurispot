"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User, Heart, Trash2, Fish, ArrowLeft, MapPin, Calendar, Ruler,
  Edit3, Check, X, Trophy, Sparkles, Waves, Moon, Bookmark, Anchor, Bell,
  Flame,
} from "lucide-react";
import { NotificationSubscribeButton } from "@/components/notification-subscribe-button";
import { CalendarHeatmap } from "@/components/mypage/calendar-heatmap";
import { PersonalBestCard } from "@/components/mypage/personal-best-card";
import { CatchReportCard } from "@/components/mypage/catch-report-card";
import { OnThisDay } from "@/components/mypage/on-this-day";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/hooks/use-favorites";
import { getTitle, getNextTier } from "@/lib/titles";

interface Stats {
  reportCount: number;
  uniqueFishCount: number;
  uniqueSpotCount: number;
  fishingDayCount: number;
  uniqueMethodCount: number;
  maxSizeCm: number;
  photoCount: number;
}

interface Badge {
  code: string;
  label: string;
  emoji: string;
  className: string;
  earned: boolean;
  progress: number;
  description: string;
  currentValue: number;
  targetValue: number;
}

interface BadgesResponse {
  tierBadges: Badge[];
  extraBadges: Badge[];
  summary: { earnedCount: number; totalCount: number };
}

interface CatchReport {
  id: string;
  spotSlug: string;
  spotName: string;
  fishName: string;
  date: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  weather?: string;
  comment: string;
}

interface ProfileData {
  bio?: string;
  headerImage?: string;
  createdAt?: string;
  bestCatchId?: string;
  styles?: string[];
}

interface FeedItem {
  id?: string;
  spotSlug?: string;
  spotName?: string;
  fishName?: string;
  date?: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  comment?: string;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl?: string;
}

const STYLE_OPTIONS = [
  "磯",
  "堤防",
  "沖",
  "船",
  "管理釣場",
  "ルアー",
  "エサ",
  "投げ",
  "夜釣り",
  "ファミリー",
] as const;

interface DashboardItem {
  slug: string;
  name: string;
  prefecture: string;
  spotType: string;
  tideLabel: string;
  tideType: string;
  fishingScore: number;
  highTides: string[];
  lowTides: string[];
  description: string;
}

interface DashboardData {
  items: DashboardItem[];
  moonAge: number;
  date: string;
}

interface WishlistItem {
  slug: string;
  name: string;
  prefecture: string;
  spotType: string;
  memo: string;
}

interface CheckinItem {
  id: string;
  spotSlug: string;
  spotName?: string;
  date: string;
  memo?: string;
  createdAt: string;
}

interface StreakData {
  streak: {
    current: number;
    longest: number;
    lastDate: string | null;
    totalDays: number;
  };
  dailyCounts: Record<string, number>;
}

interface StatsExt {
  reportCount: number;
  uniqueFishCount: number;
  uniqueSpotCount: number;
  fishingDayCount: number;
  uniqueMethodCount: number;
  maxSizeCm: number;
  photoCount: number;
  maxByFish?: Record<string, number>;
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  signinwithapple: "Apple",
  apple: "Apple",
  cognito: "メールアドレス",
  line: "LINE",
};

function getProviderLabel(provider: string, upstream?: string): string {
  if (upstream) {
    const key = upstream.toLowerCase();
    if (PROVIDER_LABELS[key]) return PROVIDER_LABELS[key];
  }
  if (provider) {
    const key = provider.toLowerCase();
    if (PROVIDER_LABELS[key]) return PROVIDER_LABELS[key];
  }
  return provider || "アカウント";
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

export default function MyPage() {
  const { data: session, status, update } = useSession();
  // 認証直後の cookie 反映タイミングで一瞬 unauthenticated が返るケースがある。
  // 1度だけ 1.2秒後に session を再取得する。これで「ログイン1回目失敗」誤表示を抑止。
  const [authRetried, setAuthRetried] = useState(false);
  useEffect(() => {
    if (status === "unauthenticated" && !authRetried) {
      setAuthRetried(true);
      const t = setTimeout(() => {
        update();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [status, authRetried, update]);
  const { favorites } = useFavorites();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [headerImage, setHeaderImage] = useState("");
  const [bestCatchId, setBestCatchId] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState<StatsExt | null>(null);
  const [badgesData, setBadgesData] = useState<BadgesResponse | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [catchReports, setCatchReports] = useState<CatchReport[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [showAllBadges, setShowAllBadges] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/user/catch-reports").then((r) => (r.ok ? r.json() : { reports: [] })),
      fetch("/api/user/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/user/badges").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/user/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/user/dashboard").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/user/wishlist").then((r) => (r.ok ? r.json() : { items: [] })),
      fetch("/api/user/checkins").then((r) => (r.ok ? r.json() : { checkins: [] })),
      fetch("/api/user/streak").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([reportsRes, statsRes, badgesRes, profileRes, dashboardRes, wishlistRes, checkinsRes, streakRes]) => {
        setCatchReports(reportsRes.reports || []);
        setStats(statsRes);
        setBadgesData(badgesRes);
        setDashboard(dashboardRes);
        setWishlist(wishlistRes?.items || []);
        setCheckins(checkinsRes?.checkins || []);
        setStreakData(streakRes);
        const u = profileRes?.user;
        if (u) {
          setProfile({
            bio: u.bio,
            headerImage: u.headerImage,
            createdAt: u.createdAt,
            bestCatchId: u.bestCatchId,
            styles: u.styles,
          });
          setBio(u.bio || "");
          setHeaderImage(u.headerImage || "");
          setBestCatchId(u.bestCatchId || "");
          setStyles(Array.isArray(u.styles) ? u.styles : []);
        }
      })
      .catch(() => {})
      .finally(() => setReportsLoading(false));

    fetch("/api/user/feed")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setFeedItems(data.items || []))
      .catch(() => {});
  }, [status]);

  const handleRemoveWish = async (slug: string) => {
    setWishlist((prev) => prev.filter((w) => w.slug !== slug));
    try {
      await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    } catch {
      /* ignore */
    }
  };

  const handleRemoveCheckin = async (id: string) => {
    setCheckins((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch("/api/user/checkins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      /* ignore */
    }
  };

  // retry 中 (status==unauthenticated && !authRetried) もスピナー表示で session 確立を待つ
  if (status === "loading" || (status === "unauthenticated" && !authRetried)) {
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
  const reportCountForTier = stats?.reportCount ?? user.reportCount ?? 0;
  const title = getTitle(reportCountForTier);
  const nextTier = getNextTier(reportCountForTier);
  const providerLabel = getProviderLabel(user.provider, user.upstreamProvider);

  const startEdit = () => {
    setNickname(user.nickname || "");
    setBio(profile?.bio || "");
    setHeaderImage(profile?.headerImage || "");
    setBestCatchId(profile?.bestCatchId || "");
    setStyles(Array.isArray(profile?.styles) ? profile.styles : []);
    setProfileMsg(null);
    setEditing(true);
  };

  const toggleStyle = (tag: string) => {
    setStyles((prev) =>
      prev.includes(tag)
        ? prev.filter((s) => s !== tag)
        : prev.length >= 5
          ? prev
          : [...prev, tag],
    );
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "ファイルサイズは20MB以下にしてください" });
      return;
    }
    setUploadingCover(true);
    setProfileMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cover-photo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setHeaderImage(data.url);
        setProfileMsg({ type: "success", text: "カバー画像をアップロードしました" });
      } else {
        setProfileMsg({ type: "error", text: data.error || "アップロードに失敗しました" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "通信エラー" });
    }
    setUploadingCover(false);
  };

  const handleSaveProfile = async () => {
    const trimmedNick = nickname.trim();
    if (!trimmedNick || trimmedNick.length > 20) {
      setProfileMsg({ type: "error", text: "ニックネームは1〜20文字で入力してください" });
      return;
    }
    if (bio.length > 140) {
      setProfileMsg({ type: "error", text: "自己紹介は140文字以内で入力してください" });
      return;
    }
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: trimmedNick,
          bio,
          headerImage,
          bestCatchId,
          styles,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await update({ nickname: trimmedNick });
        setProfile((prev) => ({ ...(prev || {}), bio, headerImage, bestCatchId, styles }));
        setProfileMsg({ type: "success", text: "保存しました" });
        setTimeout(() => {
          setEditing(false);
          setProfileMsg(null);
        }, 1200);
      } else {
        setProfileMsg({ type: "error", text: data.error || "保存に失敗しました" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "通信エラー" });
    }
    setSavingProfile(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } catch {
      /* ignore */
    }
    setDeleting(false);
  };

  const allBadges: Badge[] = [
    ...(badgesData?.tierBadges || []),
    ...(badgesData?.extraBadges || []),
  ];
  const earnedBadges = allBadges.filter((b) => b.earned);
  const inProgressBadges = allBadges.filter((b) => !b.earned);
  const visibleBadges = showAllBadges
    ? [...earnedBadges, ...inProgressBadges]
    : earnedBadges.length > 0
      ? earnedBadges.slice(0, 8)
      : inProgressBadges.slice(0, 4);

  return (
    <div className="mx-auto max-w-2xl pb-8">
      {/* グラデーションカバー or カスタムカバー画像 */}
      <div
        className={`relative h-24 bg-gradient-to-r ${title.headerClass}`}
        style={
          profile?.headerImage
            ? {
                backgroundImage: `url(${profile.headerImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
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
          <button
            onClick={() => (editing ? setEditing(false) : startEdit())}
            className="mt-2 inline-flex items-center gap-1 rounded-full border bg-white/95 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-white"
          >
            {editing ? (
              <>
                <X className="h-3.5 w-3.5" /> キャンセル
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5" /> プロフィール編集
              </>
            )}
          </button>
        </div>

        {!editing && (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{user.nickname}</h1>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs leading-none ${title.className}`}
              >
                {title.emoji}
                {title.label}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {providerLabel}でログイン中
              {profile?.createdAt && <> ・ {formatJoinDate(profile.createdAt)}</>}
            </p>

            {profile?.bio && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {profile.bio}
              </p>
            )}

            {profile?.styles && profile.styles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {profile.styles.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-ocean-mid/30 bg-ocean-mid/5 px-2 py-0.5 text-xs text-ocean-mid"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {nextTier ? (
              <p className="mt-3 text-xs text-muted-foreground">
                次の称号「{nextTier.emoji}
                {nextTier.label}」まであと{nextTier.remaining}件
                <Link href="/titles" className="ml-1 underline hover:text-foreground">
                  全称号
                </Link>
              </p>
            ) : (
              <p className="mt-3 text-xs font-medium text-amber-600">
                🌟 最高ランク到達！
                <Link href="/titles" className="ml-1 underline hover:text-amber-700">
                  全称号
                </Link>
              </p>
            )}
          </>
        )}

        {editing && (
          <Card className="mt-4">
            <CardContent className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-xs font-medium">
                  ニックネーム（{nickname.length}/20）
                </label>
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  placeholder={user.nickname}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  自己紹介（{bio.length}/140）
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={140}
                  rows={3}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-mid"
                  placeholder="得意な釣り方・狙う魚種・ホームの海など"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">カバー画像</label>
                {headerImage && (
                  <div
                    className="mb-2 h-20 rounded-md border bg-cover bg-center"
                    style={{ backgroundImage: `url(${headerImage})` }}
                  />
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-ocean-mid file:px-2 file:py-1 file:text-xs file:text-white"
                  />
                  {headerImage && (
                    <button
                      type="button"
                      onClick={() => setHeaderImage("")}
                      className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      削除
                    </button>
                  )}
                </div>
                {uploadingCover && (
                  <p className="mt-1 text-xs text-muted-foreground">アップロード中...</p>
                )}
              </div>
              {catchReports.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Best Catch (プロフィール最上部に表示)
                  </label>
                  <select
                    value={bestCatchId}
                    onChange={(e) => setBestCatchId(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-mid"
                  >
                    <option value="">設定しない</option>
                    {catchReports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fishName}
                        {r.sizeCm ? ` ${r.sizeCm}cm` : ""}
                        {r.spotName ? ` @${r.spotName}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium">
                  釣行スタイル ({styles.length}/5)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_OPTIONS.map((tag) => {
                    const active = styles.includes(tag);
                    const disabled = !active && styles.length >= 5;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleStyle(tag)}
                        disabled={disabled}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          active
                            ? "border-ocean-mid bg-ocean-mid text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              {profileMsg && (
                <p
                  className={`text-xs ${
                    profileMsg.type === "success" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {profileMsg.text}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  size="sm"
                  className="gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  {savingProfile ? "保存中..." : "保存"}
                </Button>
                <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 釣行ストリーク */}
        {streakData && streakData.streak.current > 0 && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
            <Flame className="h-8 w-8 shrink-0 text-orange-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-orange-900">
                {streakData.streak.current}日連続 釣行中！
              </div>
              <div className="text-xs text-orange-700">
                最長記録 {streakData.streak.longest}日 / 通算 {streakData.streak.totalDays}日
              </div>
            </div>
          </div>
        )}

        {/* 統計 */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Fish className="h-4 w-4 text-ocean-mid" />}
            label="釣果数"
            value={stats?.reportCount ?? 0}
            unit="件"
          />
          <StatCard
            icon={<Sparkles className="h-4 w-4 text-cyan-500" />}
            label="魚種"
            value={stats?.uniqueFishCount ?? 0}
            unit="種"
          />
          <StatCard
            icon={<MapPin className="h-4 w-4 text-amber-500" />}
            label="スポット"
            value={stats?.uniqueSpotCount ?? 0}
            unit="箇所"
          />
          <StatCard
            icon={<Ruler className="h-4 w-4 text-rose-500" />}
            label="最大サイズ"
            value={stats?.maxSizeCm ?? 0}
            unit="cm"
          />
        </div>

        {/* 今日の好機（お気に入りスポット潮汐ダッシュボード） */}
        {!dashboard ? (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Waves className="h-5 w-5 text-ocean-mid" />
                <span className="font-medium">今日の好機</span>
              </div>
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Waves className="h-5 w-5 text-ocean-mid" />
                <span className="font-medium">今日の好機</span>
                <span className="text-xs text-muted-foreground">
                  <Moon className="mr-0.5 inline h-3 w-3" />
                  {dashboard.items[0]?.tideLabel
                    ? `${dashboard.items[0].tideLabel}（月齢${dashboard.moonAge.toFixed(1)}）`
                    : `月齢 ${dashboard.moonAge.toFixed(1)}`}
                </span>
              </div>
              {dashboard.items.length === 0 ? (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    お気に入りスポットを登録すると、今日の潮汐とおすすめ度が一覧で見られます。
                    <Link href="/spots" className="ml-1 underline hover:text-foreground">
                      スポットを探す
                    </Link>
                  </p>
                  <p>
                    ツリスポに無いスポットは
                    <Link href="/spots/submit" className="ml-1 underline hover:text-foreground">
                      投稿
                    </Link>
                    できます。
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {dashboard.items.slice(0, 5).map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/spots/${item.slug}`}
                        className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.prefecture}・{item.tideLabel}・月齢{dashboard.moonAge.toFixed(1)}
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                              item.fishingScore >= 80
                                ? "bg-rose-100 text-rose-700"
                                : item.fishingScore >= 60
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            ★{Math.max(1, Math.round(item.fishingScore / 20))}
                          </span>
                        </div>
                        {(item.highTides.length > 0 || item.lowTides.length > 0) && (
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            {item.highTides.length > 0 && (
                              <span>満潮 {item.highTides.join(" / ")}</span>
                            )}
                            {item.lowTides.length > 0 && (
                              <span>干潮 {item.lowTides.join(" / ")}</span>
                            )}
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {/* スポット投稿導線（リスト有無に関わらず常時表示） */}
              <div className="mt-3 border-t pt-3 text-center">
                <Link
                  href="/spots/submit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ocean-mid/30 bg-ocean-mid/5 px-3 py-1.5 text-xs font-medium text-ocean-mid hover:bg-ocean-mid/10"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  ツリスポにないスポットを投稿する
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 自己ベスト */}
        {stats?.maxByFish && Object.keys(stats.maxByFish).length > 0 && (
          <PersonalBestCard maxByFish={stats.maxByFish} />
        )}

        {/* 釣行カレンダー（半年分） */}
        {streakData && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">釣行カレンダー</span>
                <span className="text-xs text-muted-foreground">
                  直近半年・色が濃いほど釣行多数
                </span>
              </div>
              <div className="overflow-x-auto pb-1">
                <CalendarHeatmap dailyCounts={streakData.dailyCounts} weeks={26} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* バッジ */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="font-medium">バッジ</span>
                {badgesData && (
                  <span className="text-xs text-muted-foreground">
                    {badgesData.summary.earnedCount} / {badgesData.summary.totalCount}
                  </span>
                )}
              </div>
              {badgesData && allBadges.length > 8 && (
                <button
                  onClick={() => setShowAllBadges(!showAllBadges)}
                  className="text-xs text-ocean-mid underline hover:text-ocean-deep"
                >
                  {showAllBadges ? "閉じる" : "すべて見る"}
                </button>
              )}
            </div>
            {!badgesData ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 rounded-lg border p-3"
                  >
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {visibleBadges.map((badge) => (
                  <div
                    key={badge.code}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-opacity ${
                      badge.earned ? "" : "opacity-40"
                    }`}
                    title={badge.description}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${badge.className}`}
                    >
                      {badge.emoji}
                    </div>
                    <span className="text-xs font-medium leading-tight">{badge.label}</span>
                    {!badge.earned && (
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-ocean-mid"
                          style={{ width: `${Math.round(badge.progress * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* お気に入り */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <Link href="/favorites" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-medium">お気に入りスポット</span>
              </div>
              <span className="text-sm text-muted-foreground">{favorites.length}件</span>
            </Link>
          </CardContent>
        </Card>

        {/* プッシュ通知 */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Bell className="h-5 w-5 text-ocean-mid" />
              <span className="font-medium">プッシュ通知</span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              お気に入りスポットの今日の好機（潮汐ベスト時刻）をプッシュ通知で受け取れます。
            </p>
            <NotificationSubscribeButton />
          </CardContent>
        </Card>

        {/* フォロー中の新着釣果 */}
        {feedItems.length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-500" />
                <span className="font-medium">フォロー中の新着</span>
                <span className="text-xs text-muted-foreground">
                  ({feedItems.length}件)
                </span>
              </div>
              <ul className="space-y-2">
                {feedItems.slice(0, 10).map((item, idx) => (
                  <li
                    key={`${item.authorId}-${item.id || idx}`}
                    className="flex gap-3 rounded-lg border p-3"
                  >
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted text-2xl">
                        🐟
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/users/${item.authorId}`}
                          className="text-xs font-medium text-ocean-mid hover:underline"
                        >
                          {item.authorNickname}
                        </Link>
                        {item.date && (
                          <span className="text-xs text-muted-foreground">
                            ・{item.date}
                          </span>
                        )}
                      </div>
                      <Link
                        href={item.spotSlug ? `/spots/${item.spotSlug}` : "#"}
                        className="block"
                      >
                        <p className="text-sm font-medium">{item.fishName}</p>
                        <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                          {item.spotName && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {item.spotName}
                            </span>
                          )}
                          {item.sizeCm && (
                            <span className="flex items-center gap-0.5">
                              <Ruler className="h-3 w-3" />
                              {item.sizeCm}cm
                            </span>
                          )}
                          {item.method && <span>{item.method}</span>}
                        </div>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 過去の釣行（プライベート） */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">過去の釣行</span>
                <span className="text-xs text-muted-foreground">公開されません</span>
              </div>
              <span className="text-sm text-muted-foreground">{checkins.length}件</span>
            </div>
            {checkins.length === 0 ? (
              <div>
                <p className="text-sm text-muted-foreground">
                  スポット詳細ページの「ここに行った」ボタンで記録できます。
                </p>
                <Link
                  href="/map"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  <MapPin className="h-4 w-4" />
                  スポットを探す
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {checkins.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-2 rounded-lg border p-3"
                  >
                    <Link
                      href={`/spots/${c.spotSlug}`}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-medium">
                          {c.spotName || c.spotSlug}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.date}
                        </span>
                      </div>
                      {c.memo && (
                        <p className="mt-1 whitespace-pre-wrap text-xs text-foreground">
                          {c.memo}
                        </p>
                      )}
                    </Link>
                    <button
                      onClick={() => handleRemoveCheckin(c.id)}
                      className="shrink-0 rounded-md p-1 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="釣行記録を削除"
                      title="削除"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 行きたいスポット */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-amber-500" />
                <span className="font-medium">行きたいスポット</span>
              </div>
              <span className="text-sm text-muted-foreground">{wishlist.length}件</span>
            </div>
            {wishlist.length === 0 ? (
              <div>
                <p className="text-sm text-muted-foreground">
                  スポット詳細ページの「行きたい」ボタンで登録できます。
                </p>
                <Link
                  href="/map"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                >
                  <MapPin className="h-4 w-4" />
                  スポットを探す
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {wishlist.map((item) => (
                  <li
                    key={item.slug}
                    className="flex items-start gap-2 rounded-lg border p-3"
                  >
                    <Link href={`/spots/${item.slug}`} className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.prefecture}
                      </div>
                      {item.memo && (
                        <p className="mt-1 whitespace-pre-wrap text-xs text-foreground">
                          {item.memo}
                        </p>
                      )}
                    </Link>
                    <button
                      onClick={() => handleRemoveWish(item.slug)}
                      className="shrink-0 rounded-md p-1 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="行きたいリストから外す"
                      title="外す"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 振り返り (On This Day / 同月過去 / 直近1週間) */}
        <OnThisDay />

        {/* 釣果 */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fish className="h-5 w-5 text-ocean-mid" />
                <span className="font-medium">投稿した釣果</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/mypage/stats"
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  📊 統計
                </Link>
                <span className="text-sm text-muted-foreground">
                  {reportsLoading ? "..." : `${catchReports.length}件`}
                </span>
              </div>
            </div>

            {reportsLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-ocean-mid border-t-transparent" />
              </div>
            ) : catchReports.length === 0 ? (
              <div>
                <p className="text-sm text-muted-foreground">
                  まだ釣果を投稿していません。スポットページから投稿できます。
                </p>
                <Link
                  href="/map"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  <MapPin className="h-4 w-4" />
                  スポットを探す
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {catchReports.map((report) => (
                  <CatchReportCard
                    key={report.id}
                    report={report}
                    onUpdate={(updated) =>
                      setCatchReports((prev) =>
                        prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
                      )
                    }
                    onDelete={(id) =>
                      setCatchReports((prev) => prev.filter((r) => r.id !== id))
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* アカウント削除 */}
        <div className="mt-8 border-t pt-6">
          <h2 className="mb-2 text-xs font-medium text-muted-foreground">アカウント管理</h2>
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
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)}>
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </div>
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
