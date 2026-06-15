// スポット情報の共同編集UGC（ユーザー投稿の「釣り場メモ/コツ」等）。
// スポット本体は静的TS(spots-*.ts)で不変。ユーザー投稿は DynamoDB にオーバーレイ保存し、
// スポット詳細(force-dynamic)の描画時にマージして「みんなが教える釣り場情報」として表示する。
// 釣果UGC(catch-reports.ts)と同じ合流パターン。canonicalデータは上書きしない（追記型）。

export type ContributionType = "tip" | "fish";

export interface SpotContribution {
  id: string; // "contrib-{ts}-{rand}" 。通報flagは REPORT#{id}/FLAGGED を共用
  spotSlug: string;
  type: ContributionType; // MVPは "tip"。将来 "fish"（釣れる魚の追加）等に拡張
  text: string; // 釣り場メモ/コツ本文（または魚追加時の一言）
  fishSlug?: string; // type==="fish" のとき（将来）
  fishName?: string; // 解決済みの魚名（将来）
  userName: string; // 表示名（ニックネーム）
  tsuriId?: string; // ログインユーザー。/users/[tsuriId] への導線・本人性(E-E-A-T)
  date: string; // "2026-06-06" 形式
  approved: boolean;
  submittedAt?: string; // ISO日時
}

/**
 * 指定スポットのユーザー投稿（承認済み・未通報）を取得。
 * Server Component専用（dbGetを使うため）。catch-reports.getCatchReportsBySpotAsync と同型。
 */
export async function getSpotContributionsAsync(
  spotSlug: string,
): Promise<SpotContribution[]> {
  // SSGビルド時はDynamoDBを叩かない（全スポット完全SSG化でビルド時I/Oを排除）。
  // ユーザー投稿はランタイムISR再生成時にマージされる。
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  const { dbGet, dbBatchGet } = await import("@/lib/dynamodb");

  let contributions: SpotContribution[] = [];
  try {
    const raw = await dbGet<SpotContribution[]>(`SPOT#${spotSlug}`, "SPOT_CONTRIB");
    if (Array.isArray(raw) && raw.length > 0) {
      const parsed = raw.slice(0, 50).filter((c) => c.approved);
      if (parsed.length > 0) {
        // 通報3回で立つ FLAGGED を除外（/api/report-flag が REPORT#{id}/FLAGGED を立てる）
        const flagKeys = parsed.map((c) => ({ pk: `REPORT#${c.id}`, sk: "FLAGGED" }));
        const flags = await dbBatchGet(flagKeys);
        contributions = parsed.filter((_, i) => flags[i] === null);
      }
    }
  } catch (err) {
    console.error("[spot-contributions] DynamoDB fetch error:", err);
  }

  return contributions.sort((a, b) =>
    (b.submittedAt || b.date).localeCompare(a.submittedAt || a.date),
  );
}
