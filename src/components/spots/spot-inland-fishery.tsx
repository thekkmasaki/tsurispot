import { Ticket, CalendarRange, ScrollText, ExternalLink, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotInlandFishery } from "@/lib/data/inland-fishery";

/** 出典リンクの表示名。同じ県のサイトの別資料が並んでも区別できるよう、PDF はファイル名も出す */
function hostOf(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const file = u.pathname.split("/").pop() ?? "";
    return /\.pdf$/i.test(file) ? `${host}（${file}）` : host;
  } catch {
    return url;
  }
}

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center gap-0.5 text-muted-foreground underline-offset-2 hover:underline"
    >
      {children}
      <ExternalLink className="size-3" />
    </a>
  );
}

/**
 * 河川・湖スポットの「管轄の漁協と遊漁規則」。漁協単位で一次情報を確認したものだけを出す。
 * 料金・期間は毎年変わるので、年度と確認日を必ず添え、断定せず漁協の確認へ誘導する。
 */
export function SpotInlandFisheryCard({ fishery }: { fishery: SpotInlandFishery }) {
  if (fishery.kind === "outside") {
    return (
      <Card className="border-sky-200 bg-sky-50/40">
        <CardContent className="flex items-start gap-2 p-4 text-sm sm:p-5">
          <Info className="mt-0.5 size-4 shrink-0 text-sky-600" />
          <div className="space-y-1">
            <p className="font-bold">内水面の漁協の遊漁券は不要な場所です</p>
            <p className="text-xs text-muted-foreground sm:text-sm">{fishery.link.reason.text}</p>
            <p className="text-xs">
              <SourceLink href={fishery.link.reason.source}>出典：{hostOf(fishery.link.reason.source)}</SourceLink>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { coop, link } = fishery;
  const sources = [...new Set([link.evidence.source, coop.jurisdiction.source, ...coop.fees.map((f) => f.source), ...coop.seasons.map((s) => s.source), ...coop.rules.map((r) => r.source)])];

  return (
    <Card className="border-emerald-200 bg-emerald-50/40">
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start gap-2">
          <Ticket className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold sm:text-base">遊漁券が必要です（{coop.shortName}の漁業権の区域）</p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              管轄：
              <a href={coop.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-primary hover:underline">
                {coop.name}
              </a>
              。{coop.jurisdiction.text}
            </p>
            {link.note && <p className="mt-1 text-xs text-amber-700 sm:text-sm">{link.note}</p>}
          </div>
        </div>

        {coop.fees.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted-foreground">遊漁料（{coop.seasonYear}年）</p>
            <ul className="grid gap-1 text-xs sm:grid-cols-2 sm:text-sm">
              {coop.fees.map((f, i) => (
                <li key={i} className="flex justify-between gap-2 rounded bg-white/70 px-2 py-1">
                  <span>{f.label}</span>
                  <span className="font-medium tabular-nums">
                    {f.price}
                    {f.note && <span className="ml-1 text-[11px] font-normal text-muted-foreground">（{f.note}）</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {coop.seasons.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <CalendarRange className="size-3.5" />釣りができる期間（{coop.seasonYear}年）
            </p>
            <ul className="space-y-0.5 text-xs sm:text-sm">
              {coop.seasons.map((s, i) => (
                <li key={i}>
                  <span className="font-medium">{s.fish}</span>：{s.period}
                </li>
              ))}
            </ul>
          </div>
        )}

        {coop.rules.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <ScrollText className="size-3.5" />主な遊漁規則
            </p>
            <ul className="list-disc space-y-0.5 pl-5 text-xs sm:text-sm">
              {coop.rules.map((r, i) => (
                <li key={i}>{r.text}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-1 border-t border-emerald-200/60 pt-2 text-[11px] text-muted-foreground sm:text-xs">
          <p>
            {coop.verifiedAt.replace(/-/g, "/")} に漁協・県の公式情報で確認。料金や解禁日は毎年変わるため、釣行前に漁協の最新情報を確認してください。
          </p>
          <p className="flex flex-wrap gap-x-3 gap-y-0.5">
            出典：
            {sources.map((u) => (
              <SourceLink key={u} href={u}>{hostOf(u)}</SourceLink>
            ))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/** 河川・湖で、管轄の漁協をまだ確認できていないスポット向けの一文 */
export function SpotInlandFisheryUnknown({ prefecture }: { prefecture: string }) {
  return (
    <p className="flex items-start gap-1.5 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground sm:text-sm">
      <Info className="mt-0.5 size-4 shrink-0" />
      <span>
        このスポットを管轄する漁協は、ツリスポではまだ確認できていません。川や湖の多くは漁協の漁業権の区域で、遊漁券が必要です。
        現地の看板か{prefecture}の漁業権の案内で確認してください。
      </span>
    </p>
  );
}
