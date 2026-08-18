import Link from "next/link";
import { Ban, AlertTriangle, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getSpotBySlug } from "@/lib/data/spots";
import type { FishingBan } from "@/types";

/** "2026-08-17" → "2026年8月17日" */
function formatConfirmedAt(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}

/** 出典URLのホスト名（表示用）。不正なURLはそのまま返す */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * 釣り禁止スポットの警告バナー。
 *
 * ファーストビューに出すことが目的なので、スポット詳細ページのヘッダー直下
 * （SafetyWarning より上）に置く。禁止情報そのものが検索者にとって有益なため、
 * ページは削除せず・noindex にもせず、代替スポットへ誘導する方針。
 */
export function FishingBanNotice({
  ban,
  spotName,
}: {
  ban: FishingBan;
  spotName: string;
}) {
  const isFull = ban.scope === "full";
  const alternatives = (ban.alternativeSpotSlugs ?? [])
    .map((slug) => getSpotBySlug(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <Card
      className={cn(
        "overflow-hidden border-2 py-0",
        isFull ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {isFull ? (
            <Ban className="size-5 shrink-0 text-red-600" />
          ) : (
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
          )}
          <Badge variant={isFull ? "danger" : "warning"} className="text-xs">
            {isFull ? "釣り禁止" : "一部区域が釣り禁止"}
          </Badge>
          <span
            className={cn(
              "text-xs",
              isFull ? "text-red-700/80" : "text-amber-700/80"
            )}
          >
            {formatConfirmedAt(ban.confirmedAt)}時点の情報
          </span>
        </div>

        <h2
          className={cn(
            "text-base font-bold sm:text-lg",
            isFull ? "text-red-900" : "text-amber-900"
          )}
        >
          {isFull
            ? `${spotName}は現在、釣りが禁止されています`
            : `${spotName}には釣り禁止区域があります`}
        </h2>

        <p
          className={cn(
            "mt-2 text-sm leading-relaxed",
            isFull ? "text-red-800" : "text-amber-800"
          )}
        >
          {ban.reason}
        </p>

        {ban.sourceUrls.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span
              className={cn(
                "font-medium",
                isFull ? "text-red-700" : "text-amber-700"
              )}
            >
              出典:
            </span>
            {ban.sourceUrls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1 underline underline-offset-2",
                  isFull
                    ? "text-red-700 hover:text-red-900"
                    : "text-amber-700 hover:text-amber-900"
                )}
              >
                {hostOf(url)}
                <ExternalLink className="size-3" />
              </a>
            ))}
          </p>
        )}

        {alternatives.length > 0 && (
          <div className="mt-4 rounded-md bg-white/70 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">
              近くの釣りができるスポット
            </p>
            <ul className="space-y-1.5">
              {alternatives.map((spot) => (
                <li key={spot.slug}>
                  <Link
                    href={`/spots/${spot.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
                  >
                    <MapPin className="size-4 shrink-0" />
                    {spot.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p
          className={cn(
            "mt-3 text-xs leading-relaxed",
            isFull ? "text-red-700/90" : "text-amber-700/90"
          )}
        >
          規制の状況は変わることがあります。釣行前に必ず現地の看板・管理者の案内をご確認ください。
          情報に誤りがある場合はお問い合わせからご連絡いただけると助かります。
        </p>
      </CardContent>
    </Card>
  );
}
