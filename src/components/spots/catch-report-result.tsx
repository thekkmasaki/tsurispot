"use client";

/**
 * 投稿リザルト画面（投稿促進①）
 *
 * 投稿1件の裏で起きること（図鑑+1・自己ベスト・称号前進・カレンダー点灯・掲載）は
 * 全部サーバーで起きているのに、従来の成功画面は「ありがとうございます」一文だけだった。
 * ここでは API が返す差分（PostCatchResult）を条件分岐の行として見せる。
 *
 * 匿名は称号・カレンダーが貯まらないため「端末に保存された事実」と「掲載」を主役にし、
 * ログイン訴求は図鑑シートと同じ原則（煽らず事実だけ・「あとで」で記録は消えない）に従う。
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getTitle, getNextTier, ALL_TIERS } from "@/lib/titles";
import { todayJST } from "@/lib/activity";
import { trackPostResultView } from "@/lib/analytics";
import type { PostCatchResult } from "@/lib/catch-result";

interface CatchReportResultProps {
  spotSlug: string;
  spotName: string;
  /** 投稿した魚名（「アジ、サバ」形式のまま） */
  fishName: string;
  /** 投稿した釣行日（YYYY-MM-DD） */
  date: string;
  /** 投稿パーマリンク用ID（API応答の id） */
  postId?: string;
  /** ログイン時のみ入るリザルト差分 */
  result?: PostCatchResult;
  /** 匿名時: 端末図鑑（localStorage）へ新規保存できたか */
  anonSaved: boolean;
  /** スポット初投稿（開拓者）になったか。匿名・ログイン共通 */
  pioneer: boolean;
  isLoggedIn: boolean;
  onClose: () => void;
  onPostAnother: () => void;
}

function GainRow({
  icon,
  title,
  sub,
  extra,
  index,
  shown,
  highlight = false,
}: {
  icon: string;
  title: string;
  sub?: React.ReactNode;
  extra?: React.ReactNode;
  index: number;
  shown: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-all duration-500 ${
        highlight ? "border-amber-300 bg-amber-50" : "border-border bg-card"
      } ${shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      style={{ transitionDelay: `${150 + index * 140}ms` }}
    >
      <span className="text-xl leading-none" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
        {extra}
      </div>
    </div>
  );
}

export function CatchReportResult({
  spotSlug,
  spotName,
  fishName,
  date,
  postId,
  result,
  anonSaved,
  pioneer,
  isLoggedIn,
  onClose,
  onPostAnother,
}: CatchReportResultProps) {
  // マウント後に true にして、行のフェードイン + バーの伸長を transition で起こす
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShown(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  // 称号（ログイン + リザルトありのときだけ意味を持つ）
  const count = result?.reportCount ?? 0;
  const title = getTitle(count);
  const prevTitle = getTitle(Math.max(0, count - 1));
  const promoted = !!result && count > 0 && title.label !== prevTitle.label;
  const next = getNextTier(count);

  // 進捗バー: 現ティアの開始件数 → 次ティアの開始件数 を 0-100% に写像
  const tiersAsc = [...ALL_TIERS].sort((a, b) => a.min - b.min);
  const currentMin = [...tiersAsc].reverse().find((t) => count >= t.min)?.min ?? 0;
  const nextMin = tiersAsc.find((t) => t.min > count)?.min ?? null;
  const cap = nextMin ?? Math.max(count, currentMin + 1);
  const clampPct = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
  const pctFrom = clampPct(((count - 1 - currentMin) / (cap - currentMin)) * 100);
  const pctTo = clampPct(((count - currentMin) / (cap - currentMin)) * 100);

  const postedToday = date === todayJST();
  const permalink = postId ? `/posts/${postId}` : `/spots/${spotSlug}`;

  useEffect(() => {
    trackPostResultView({
      promoted,
      anonymous: !isLoggedIn,
      newDexCount: result?.newDexSpecies.length ?? 0,
      pioneer,
    });
    // 表示は1回だけ計測する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 行の組み立て（index は表示順のスタガー用）
  const rows: React.ReactNode[] = [];
  let i = 0;

  // 開拓者行は最上段（匿名にとって唯一の「サイトに名前が残る」報酬でもある）
  if (pioneer) {
    rows.push(
      <GainRow
        key="pioneer"
        icon="🏴"
        title={`「${spotName}」の開拓者になりました`}
        sub="このスポット最初の投稿者として、ページに表示され続けます"
        index={i++}
        shown={shown}
        highlight
      />,
    );
  }

  if (result) {
    for (const species of result.newDexSpecies) {
      rows.push(
        <GainRow
          key={`dex-${species}`}
          icon="📖"
          title={`図鑑に「${species}」を登録`}
          sub={
            <>
              {result.dexCount}種目。あなたの図鑑が育ちました{" "}
              <Link prefetch={false} href="/fishdex" className="underline hover:text-foreground">
                図鑑を見る
              </Link>
            </>
          }
          index={i++}
          shown={shown}
        />,
      );
    }
    if (result.best) {
      rows.push(
        <GainRow
          key="best"
          icon="📏"
          title={
            result.best.prevBest !== null
              ? `自己ベスト更新 ${result.best.fishName} ${result.best.sizeCm}cm`
              : `自己ベスト登録 ${result.best.fishName} ${result.best.sizeCm}cm`
          }
          sub={
            result.best.prevBest !== null
              ? `これまでの記録 ${result.best.prevBest}cm を更新`
              : "この魚の初記録です"
          }
          index={i++}
          shown={shown}
        />,
      );
    }
    rows.push(
      <GainRow
        key="title"
        icon={promoted ? title.emoji : "🏅"}
        title={
          promoted
            ? `称号が ${prevTitle.emoji}${prevTitle.label} → ${title.emoji}${title.label} に`
            : `${count}件目の釣果`
        }
        sub={next ? `あと${next.remaining}件で ${next.emoji}${next.label}` : "最高位です"}
        extra={
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${shown ? pctTo : pctFrom}%`, transitionDelay: `${400 + i * 140}ms` }}
            />
          </div>
        }
        index={i++}
        shown={shown}
        highlight={promoted}
      />,
    );
    if (postedToday) {
      rows.push(
        <GainRow
          key="calendar"
          icon="🗓"
          title="活動カレンダーが今日「行った」に"
          sub="見た → 動いた → 行った（いちばん濃い緑）"
          extra={
            <span className="mt-1.5 flex gap-1" aria-hidden="true">
              <i className="size-3 rounded-sm bg-emerald-300" />
              <i className="size-3 rounded-sm bg-emerald-500" />
              <i className="size-3 rounded-sm bg-emerald-700" />
            </span>
          }
          index={i++}
          shown={shown}
        />,
      );
    }
  } else if (anonSaved) {
    rows.push(
      <GainRow
        key="anon-save"
        icon="📖"
        title={`この端末の図鑑に「${fishName}」を記録しました`}
        sub={
          <>
            <Link prefetch={false} href="/fishdex" className="underline hover:text-foreground">
              魚図鑑
            </Link>
            でいつでも見られます
          </>
        }
        index={i++}
        shown={shown}
      />,
    );
  }

  rows.push(
    <GainRow
      key="published"
      icon="🏠"
      title={`トップと${spotName}のページに掲載されました`}
      sub={
        <>
          「みんなの最近の釣果」に載っています{" "}
          <Link prefetch={false} href={permalink} className="underline hover:text-foreground">
            投稿を見る
          </Link>
        </>
      }
      index={i++}
      shown={shown}
    />,
  );

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
        <div className="mx-auto w-full max-w-lg px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <SheetHeader className="items-center px-0 pb-2 text-center">
            <span className="text-4xl" aria-hidden="true">
              {promoted ? title.emoji : "🎉"}
            </span>
            <SheetTitle className="text-lg">
              {promoted ? `「${title.label}」に昇格！` : "投稿しました！"}
            </SheetTitle>
            <SheetDescription>
              {promoted
                ? `${count}件目の釣果で称号が上がりました`
                : "この投稿で、こうなりました"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-2">{rows}</div>

          {!isLoggedIn && (
            <div className="mt-3 rounded-lg border border-dashed p-3 text-center">
              <Link
                prefetch={false}
                href="/login"
                className="text-sm font-semibold text-primary underline"
              >
                この記録をアカウントに残す（無料）
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                称号・図鑑・カレンダーに引き継げます。あとでOK、この投稿と端末の記録は消えません。
              </p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button onClick={onPostAnother} variant="outline" className="flex-1">
              もう1匹投稿する
            </Button>
            <Button onClick={onClose} variant="ghost" className="flex-1">
              閉じる
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
