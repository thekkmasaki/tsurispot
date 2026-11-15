import Link from "next/link";
import { ListChecks, Ban } from "lucide-react";
import type { PrefectureFishingRule } from "@/lib/data/fishing-rules-data";
import type { RestrictedSpotEntry } from "@/lib/data/prefecture-restricted-spots";
import { sourceHostOf } from "@/lib/spot-restrictions";

const MAX_SPOT_ROWS = 40;

function joinLimited(items: string[], n: number): string {
  return items.length > n ? `${items.slice(0, n).join("、")} ほか${items.length - n}件` : items.join("、");
}

/**
 * 県別ルールページ冒頭の「答えファースト」要約文。FAQ・meta と同じ数値を使うため関数で生成する。
 */
export function buildPrefectureRulesSummary(
  prefName: string,
  rule: PrefectureFishingRule | undefined,
  restricted: RestrictedSpotEntry[],
): string {
  const banCount = restricted.filter((r) => r.restriction.level.startsWith("ban")).length;
  const parts: string[] = [];
  parts.push(
    restricted.length > 0
      ? `ツリスポ掲載スポットのうち、${prefName}で釣り禁止・制限の情報があるスポットは${restricted.length}件${banCount > 0 ? `（うち自治体等の公的情報で釣り禁止を確認したもの${banCount}件）` : ""}です。`
      : `ツリスポ掲載スポットには、${prefName}で釣り禁止・制限の情報が登録されたスポットはまだありません（禁止が無いという意味ではありません）。`,
  );
  const areaCount = rule?.seaRules?.restrictedAreas.length ?? 0;
  if (areaCount > 0) parts.push(`県の海面ルールとして釣り禁止・注意区域${areaCount}件をまとめています。`);
  const closed = [...(rule?.seaRules?.closedSeasons ?? []), ...(rule?.closedSeasons ?? [])].map((c) => c.fish);
  if (closed.length > 0) parts.push(`禁漁期間がある主な魚は${joinLimited([...new Set(closed)], 4)}です。`);
  if (rule?.lastVerified) parts.push(`公式情報の確認日は${rule.lastVerified}です。`);
  return parts.join("");
}

export function PrefectureRulesOverview({
  prefName,
  rule,
  restricted,
}: {
  prefName: string;
  rule: PrefectureFishingRule | undefined;
  restricted: RestrictedSpotEntry[];
}) {
  const sea = rule?.seaRules;
  const ruleRows: { label: string; value: React.ReactNode }[] = [];
  if (sea && sea.restrictedAreas.length > 0)
    ruleRows.push({ label: "釣り禁止・注意区域（海）", value: `${sea.restrictedAreas.length}件（下の「釣り禁止・注意区域」に一覧）` });
  if (sea && sea.fishingRightsNotes.length > 0) ruleRows.push({ label: "漁業権（採取禁止）", value: sea.fishingRightsNotes[0] });
  if (sea?.chumRegulation) ruleRows.push({ label: "撒き餌（コマセ）", value: sea.chumRegulation });
  if (sea && sea.closedSeasons.length > 0)
    ruleRows.push({ label: "禁漁期間（海）", value: sea.closedSeasons.map((c) => `${c.fish}: ${c.period}`).join("／") });
  if (sea && sea.sizeLimits.length > 0)
    ruleRows.push({ label: "サイズ制限（海）", value: sea.sizeLimits.map((s) => `${s.fish} ${s.minSize}`).join("、") });
  if (rule && rule.yugyokenRivers.length > 0)
    ruleRows.push({ label: "遊漁券が必要な主な河川", value: joinLimited(rule.yugyokenRivers, 6) });
  if (rule && rule.closedSeasons.length > 0)
    ruleRows.push({ label: "禁漁期間（川・湖）", value: rule.closedSeasons.map((c) => `${c.fish}: ${c.period}`).join("／") });
  if (rule && rule.sizeLimits.length > 0)
    ruleRows.push({ label: "サイズ制限（川・湖）", value: rule.sizeLimits.map((s) => `${s.fish} ${s.minSize}`).join("、") });
  if (rule)
    ruleRows.push({
      label: "出典・確認日",
      value: (
        <>
          {rule.authority}
          {rule.referenceUrl && (
            <>
              {"（"}
              <a href={rule.referenceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                {sourceHostOf(rule.referenceUrl)}
              </a>
              {"）"}
            </>
          )}
          <span className="ml-1 text-xs text-muted-foreground">
            {rule.lastVerified ? `確認日 ${rule.lastVerified}` : "確認日未記録"}
          </span>
        </>
      ),
    });

  const shown = restricted.slice(0, MAX_SPOT_ROWS);

  return (
    <div className="space-y-8">
      {/* 答えファーストの要約 */}
      <section aria-label={`${prefName}の釣り禁止・ルールの要点`} className="rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed sm:p-5">
        <p className="font-medium">{buildPrefectureRulesSummary(prefName, rule, restricted)}</p>
      </section>

      {ruleRows.length > 0 && (
        <section aria-labelledby="pref-rules-table-heading">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="pref-rules-table-heading" className="text-xl font-bold sm:text-2xl">{prefName}の主な釣りルール（一覧表）</h2>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <caption className="sr-only">{prefName}の釣りルールの区分と内容・出典</caption>
              <tbody className="divide-y">
                {ruleRows.map((r) => (
                  <tr key={r.label} className="align-top">
                    <th scope="row" className="w-36 bg-muted/40 px-3 py-2 text-left text-xs font-medium text-muted-foreground sm:w-44 sm:text-sm">
                      {r.label}
                    </th>
                    <td className="px-3 py-2">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section aria-labelledby="pref-restricted-spots-heading">
        <div className="mb-3 flex items-center gap-2">
          <Ban className="h-5 w-5 text-red-500" aria-hidden="true" />
          <h2 id="pref-restricted-spots-heading" className="text-xl font-bold sm:text-2xl">
            {prefName}の釣り禁止・制限情報があるスポット
          </h2>
        </div>
        {shown.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[520px] text-sm">
                <caption className="sr-only">{prefName}の釣り禁止・制限情報があるスポットと内容・出典・確認日</caption>
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">スポット</th>
                    <th scope="col" className="px-3 py-2 font-medium">内容</th>
                    <th scope="col" className="px-3 py-2 font-medium">出典・確認日</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {shown.map(({ spot, restriction }) => (
                    <tr key={spot.slug} className="align-top">
                      <th scope="row" className="px-3 py-2 text-left font-medium">
                        <Link prefetch={false} href={`/spots/${spot.slug}`} className="text-primary underline-offset-2 hover:underline">
                          {spot.name}
                        </Link>
                        <span className="block text-xs font-normal text-muted-foreground">{spot.region.areaName}</span>
                      </th>
                      <td className="px-3 py-2">
                        <span className={restriction.level.startsWith("ban") ? "font-bold text-destructive" : "font-medium"}>
                          {restriction.label}
                        </span>
                        {restriction.detail && (
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{restriction.detail}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {restriction.sourceUrls.length > 0 ? (
                          <>
                            {restriction.sourceUrls.slice(0, 2).map((u) => (
                              <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block text-primary underline underline-offset-2">
                                {sourceHostOf(u)}
                              </a>
                            ))}
                            {restriction.confirmedAt && <span className="text-muted-foreground">確認日 {restriction.confirmedAt}</span>}
                          </>
                        ) : (
                          <span className="text-muted-foreground">ツリスポ掲載情報（出典未記載・現地掲示で要確認）</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {restricted.length > shown.length && (
              <p className="mt-1.5 text-xs text-muted-foreground">ほか{restricted.length - shown.length}件は各スポットページをご確認ください。</p>
            )}
          </>
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            現在、{prefName}の掲載スポットで個別の釣り禁止・制限情報は登録されていません。立入禁止の柵・看板がある場所や、上の「釣り禁止・注意区域」に該当する場所では釣りをしないでください。
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          「釣り禁止」は自治体・港湾管理者などの一次情報で確認したもののみ表示しています。規制は変更されることがあるため、釣行前に現地の掲示と管理者の案内を必ずご確認ください。
        </p>
      </section>
    </div>
  );
}
