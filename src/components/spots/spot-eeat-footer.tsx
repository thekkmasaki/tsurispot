import Link from "next/link";
import { ShieldCheck, FileText } from "lucide-react";

type Props = {
  spotName: string;
  prefecture: string;
  /** 管理団体名（spot.managementInfo.organizationName）。無ければ非表示 */
  managementOrg?: string;
  /** 県の公的釣りルール or スポット個別ルールが存在するか */
  hasPublicRules: boolean;
  /** 実ユーザー釣果報告の件数（サンプル cr-* 除外済み） */
  catchReportCount: number;
  /** 衛星画像解析(structureTypes)があるか */
  hasSatellite: boolean;
};

/**
 * スポット詳細末尾の E-E-A-T（情報の出典・編集体制）ブロック。
 * Google コアアップデート対策として「このページの情報が何に基づくか／誰が編集しているか」を明示する。
 * 表示するのは実在する出典のみ（誇張・虚偽なし。件数0の出典は出さない）。揮発的な現在日時は使わない。
 */
export function SpotEeatFooter({
  spotName,
  prefecture,
  managementOrg,
  hasPublicRules,
  catchReportCount,
  hasSatellite,
}: Props) {
  const sources: string[] = ["GPS実測座標に基づくアクセス・地図情報"];
  if (managementOrg) sources.push(`管理団体「${managementOrg}」の公開情報`);
  if (hasPublicRules) sources.push(`${prefecture}の公的な釣りルール情報`);
  if (catchReportCount > 0) sources.push(`利用者から寄せられた釣果報告 ${catchReportCount}件`);
  if (hasSatellite) sources.push("衛星画像による地形・構造物の解析");

  return (
    <section className="mt-8 rounded-xl border bg-muted/20 p-4 text-xs text-muted-foreground">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
        <ShieldCheck className="size-4 text-primary" />
        この情報について
      </h2>
      <p className="mb-3 leading-relaxed">
        {spotName}の釣り場情報は、釣り場データベース「ツリスポ」編集部（編集長: 正木 家康）が
        実データをもとに編集・管理しています。最新の現地状況・釣り禁止区域は必ず現地表示や管理者にご確認ください。{" "}
        <Link prefetch={false} href="/about" className="text-primary underline underline-offset-2">
          運営者情報
        </Link>
      </p>
      <p className="mb-1 font-medium text-foreground/80">情報の根拠</p>
      <ul className="space-y-1">
        {sources.map((text, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <FileText className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
