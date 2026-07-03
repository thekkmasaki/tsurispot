import Link from "next/link";
import { Shield, Fish, Ruler, AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PrefectureFishingRule } from "@/lib/data/fishing-rules-data";

/**
 * スポット個別の rules が未設定のときに表示する「県レベルの釣りルール」フォールバック。
 * 推測のスポット固有ルールは出さず、公式の県規制（禁漁期・サイズ制限・漁業権）だけを
 * 県全体の情報として明示し、詳細ページ /fishing-rules/[prefSlug] へ誘導する。
 */
export function SpotRulesPrefectureFallback({
  rule,
}: {
  rule: PrefectureFishingRule;
}) {
  const closed = rule.closedSeasons?.slice(0, 3) ?? [];
  const sizes = rule.sizeLimits?.slice(0, 4) ?? [];
  const rightsNote = rule.seaRules?.fishingRightsNotes?.[0];

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold sm:text-base">
              {rule.prefName}の釣りルール（県全体の規制）
            </p>
            <p className="text-xs text-muted-foreground">
              このスポット固有の掲示が優先されます。下記は{rule.prefName}全域に関わる公的なルールです。
            </p>
          </div>
        </div>

        {rightsNote && (
          <div className="flex items-start gap-2 rounded-md bg-white/70 p-2.5 text-xs sm:text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <span>{rightsNote}</span>
          </div>
        )}

        {closed.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Fish className="size-3.5" />禁漁期間（主なもの）
            </p>
            <ul className="space-y-1 text-xs sm:text-sm">
              {closed.map((c, i) => (
                <li key={i}>
                  <span className="font-medium">{c.fish}</span>：{c.period}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sizes.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Ruler className="size-3.5" />サイズ制限（リリース目安）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {s.fish} {s.minSize}〜
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-amber-200/60 pt-3">
          <Link prefetch={false}
            href={`/fishing-rules/${rule.prefSlug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {rule.prefName}の釣りルール詳細を見る
            <ArrowRight className="size-4" />
          </Link>
          {rule.referenceUrl && (
            <a
              href={rule.referenceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
            >
              出典：{rule.authority}
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
