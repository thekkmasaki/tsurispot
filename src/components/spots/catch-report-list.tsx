"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Fish, Calendar, User, Ruler, Flag, Share2, MessageCircle } from "lucide-react";
import { CatchPhoto } from "@/components/ui/spot-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { LikeButton } from "@/components/social/like-button";
import type { CatchReport, SpotPioneer } from "@/lib/data/catch-reports";

interface CatchReportListProps {
  spotSlug: string;
  initialReports: CatchReport[];
  /** スポット開拓者（最初の投稿者）の永続レコード。遡及なしのため大半のスポットでは null */
  pioneer?: SpotPioneer | null;
  /** 釣り禁止スポット(fishingBan full)では false。空状態の投稿CTAを出さない */
  allowPosting?: boolean;
}

/** 空状態のCTAから投稿フォーム（別コンポーネント）を開くためのイベント名 */
export const OPEN_CATCH_REPORT_EVENT = "tsurispot:open-catch-report";

const WEATHER_ICONS: Record<string, string> = {
  "晴れ": "☀️",
  "曇り": "☁️",
  "雨": "🌧️",
  "風強い": "💨",
};

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${Number(parts[0])}年${Number(parts[1])}月${Number(parts[2])}日`;
}

function getSessionId(): string {
  const key = "tsurispot_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

// ── UGCシェア（バイラルループ: 訪問者が釣果を拡散→スポットページへ新規流入） ──
const SITE_URL = "https://tsurispot.com";

function ugcSpotUrl(report: CatchReport, source: string): string {
  return `${SITE_URL}/spots/${report.spotSlug}?utm_source=${source}&utm_medium=social&utm_campaign=ugc-share`;
}

function xShareUrl(report: CatchReport): string {
  const size = report.sizeCm ? ` ${report.sizeCm}cm` : "";
  const text = `${report.fishName}${size}が釣れた！🎣`;
  const url = ugcSpotUrl(report, "twitter");
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
    url,
  )}&hashtags=${encodeURIComponent("ツリスポ釣果,釣り")}`;
}

function lineShareUrl(report: CatchReport): string {
  const url = ugcSpotUrl(report, "line");
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
}

export function CatchReportList({ spotSlug, initialReports, pioneer = null, allowPosting = true }: CatchReportListProps) {
  // initialReports を useState で固定すると router.refresh() 後も古い一覧のままになるため、
  // prop を直接使う（投稿成功時の router.refresh() で新しい釣果が反映される）。
  const reports = initialReports;
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // いいね状態はISR/SSGページのHTMLに焼き込めないため、mount時に一括取得する（1リクエスト）
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [likesLoaded, setLikesLoaded] = useState(false);
  useEffect(() => {
    const ids = initialReports.slice(0, 100).map((r) => r.id);
    if (ids.length === 0) return;
    fetch(`/api/reports/likes?ids=${ids.map(encodeURIComponent).join(",")}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setLikeCounts(data.counts ?? {});
        setLikedIds(new Set(data.likedIds ?? []));
        setCommentCounts(data.commentCounts ?? {});
        setLikesLoaded(true);
      })
      .catch(() => {
        // いいね表示は付加情報のため、取得失敗しても一覧は通常表示
      });
  }, [initialReports]);

  // ネイティブ confirm()/alert() を排除し、インライン確認 + 二重送信ガード + トースト通知に置換。
  const submitFlag = useCallback(async (reportId: string) => {
    setSubmittingId(reportId);
    try {
      const res = await fetch("/api/report-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, sessionId: getSessionId() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || "通報を受け付けました");
        setFlaggedIds((prev) => new Set(prev).add(reportId));
      } else {
        toast.error(data.message || "通報に失敗しました。もう一度お試しください。");
      }
    } catch {
      toast.error("通報に失敗しました。もう一度お試しください。");
    }
    setSubmittingId(null);
    setConfirmingId(null);
  }, []);

  // 開拓者の常設表示（投稿本体がTTLで消えても永続レコードで残り続ける）
  const pioneerLine = pioneer ? (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <span aria-hidden="true">🏴</span>
      <span>
        このスポットの開拓者:{" "}
        {pioneer.tsuriId ? (
          <Link prefetch={false} href={`/users/${pioneer.tsuriId}`} className="font-bold hover:underline">
            {pioneer.userName} さん
          </Link>
        ) : (
          <b>{pioneer.userName} さん</b>
        )}
      </span>
      <span className="text-xs text-amber-800/80">{formatDate(pioneer.date)} ・ 最初の釣果を投稿</span>
    </div>
  ) : null;

  if (reports.length === 0) {
    if (!allowPosting) {
      // 釣り禁止スポット等では投稿を促さない（従来の中立文言のみ）
      return (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
          <Fish className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">まだ釣果報告がありません。</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {pioneerLine}
        <div className="flex flex-col items-center gap-2.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
          <span className="text-2xl" aria-hidden="true">🏴</span>
          <p className="text-sm font-bold">このスポット、まだ誰も投稿していません</p>
          <p className="max-w-md text-xs text-muted-foreground">
            最初の投稿者は<b className="text-foreground">開拓者</b>として、このページに表示され続けます。
            匿名OK・タップだけで投稿できます。
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_CATCH_REPORT_EVENT))}
            className="mt-1 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-ocean-mid px-5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:brightness-110 active:scale-[.98]"
          >
            🏴 開拓者になる — 釣果を投稿
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pioneerLine}
      {reports.map((report) => (
        <Card key={report.id} className="group relative py-3">
          <CardContent className="px-4">
            {/* 通報ボタン（インライン確認方式） */}
            {!flaggedIds.has(report.id) && (
              confirmingId === report.id ? (
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <button
                    onClick={() => submitFlag(report.id)}
                    disabled={submittingId === report.id}
                    className="rounded-md bg-destructive px-2 py-0.5 text-xs font-medium text-white transition-opacity disabled:opacity-50"
                  >
                    {submittingId === report.id ? "送信中..." : "通報する"}
                  </button>
                  <button
                    onClick={() => setConfirmingId(null)}
                    className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingId(report.id)}
                  className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/30 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  title="不適切な投稿を通報"
                  aria-label="通報"
                >
                  <Flag className="size-3.5" aria-hidden="true" />
                </button>
              )
            )}
            <div className="flex items-start gap-3">
              <CatchPhoto src={report.photoUrl} alt={`${report.fishName}の釣果写真`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">
                  {report.tsuriId ? (
                    <Link prefetch={false}
                      href={`/users/${report.tsuriId}`}
                      className="text-emerald-700 hover:underline"
                    >
                      {report.userName}
                    </Link>
                  ) : (
                    <span className="text-emerald-700">{report.userName}</span>
                  )}
                  さんが
                  <span className="font-bold text-foreground">{report.fishName}</span>
                  を釣りました！
                  {report.pioneer && (
                    <span className="ml-1.5 inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 align-middle text-[10px] font-bold text-amber-800">
                      🏴 開拓者
                    </span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(report.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {report.tsuriId ? (
                      <Link prefetch={false}
                        href={`/users/${report.tsuriId}`}
                        className="hover:underline hover:text-foreground"
                      >
                        {report.userName}
                      </Link>
                    ) : (
                      report.userName
                    )}
                  </span>
                  {report.sizeCm && (
                    <Badge variant="secondary" className="gap-0.5 px-1.5 py-0 text-xs font-normal">
                      <Ruler className="size-3" />
                      {report.sizeCm}cm
                    </Badge>
                  )}
                  {report.method && (
                    <Badge variant="outline" className="px-1.5 py-0 text-xs font-normal">
                      {report.method}
                    </Badge>
                  )}
                  {report.weather && (
                    <span className="flex items-center gap-0.5">
                      <span aria-hidden="true">{WEATHER_ICONS[report.weather] || ""}</span> {report.weather}
                    </span>
                  )}
                </div>
                {report.comment && (
                  <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                    {report.comment}
                  </p>
                )}
              </div>
            </div>
            {/* シェア（バイラルループ: 訪問者が釣果を拡散→新規流入） */}
            <div className="mt-2 flex items-center gap-2 border-t pt-2 text-xs text-muted-foreground/70">
              <LikeButton
                key={`${report.id}-${likesLoaded}`}
                reportId={report.id}
                initialCount={likeCounts[report.id] ?? 0}
                initialLiked={likedIds.has(report.id)}
              />
              <Link
                prefetch={false}
                href={`/posts/${encodeURIComponent(report.id)}`}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-sky-700"
                aria-label="コメントを見る"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                <span className="tabular-nums">
                  {commentCounts[report.id] ? commentCounts[report.id] : "コメント"}
                </span>
              </Link>
              <span>この釣果をシェア:</span>
              <a
                href={xShareUrl(report)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium text-foreground/70 hover:bg-muted"
                aria-label="Xでシェア"
              >
                <Share2 className="size-3" aria-hidden="true" /> X
              </a>
              <a
                href={lineShareUrl(report)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border px-2 py-0.5 font-medium text-foreground/70 hover:bg-muted"
                aria-label="LINEでシェア"
              >
                LINE
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
