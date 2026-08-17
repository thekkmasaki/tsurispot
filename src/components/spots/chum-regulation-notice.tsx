import Link from "next/link";
import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PrefectureFishingRule } from "@/lib/data/fishing-rules-data";

/**
 * 都道府県のまき餌（コマセ）規制の告知。
 *
 * まき餌の可否は都道府県ごとに大きく違う（茨城は指定2箇所のみ可、青森は地先単位で禁止、
 * 新潟佐渡はオキアミ限定、広島・愛媛は陸にも区域規制…）。サビキ釣りはアミエビ＝まき餌を
 * 使うため、規制県では「サビキが楽しめる」と書くこと自体が違法行為の推奨になる。
 *
 * `chumRegulation` は fishing-rules-data.ts に型とこの表示UIだけが存在してデータが空だったため、
 * 全国どの県のページでも一度も表示されていなかった。スポット個別の rules の有無に関わらず
 * 県の規制は適用されるので、SpotRulesCard / SpotRulesPrefectureFallback とは独立に表示する。
 */
export function ChumRegulationNotice({
  rule,
}: {
  rule: PrefectureFishingRule;
}) {
  const chum = rule.seaRules?.chumRegulation;
  if (!chum) return null;

  return (
    <Card className="border-orange-200 bg-orange-50/60">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-orange-600" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-orange-900 sm:text-base">
              {rule.prefName}のまき餌（コマセ）規制
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-orange-900/90">
              {chum}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <Link
                prefetch={false}
                href={`/fishing-rules/${rule.prefSlug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {rule.prefName}の釣りルール詳細
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
