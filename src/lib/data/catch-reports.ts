// ユーザー釣果投稿（UGC）データ定義

export interface CatchReport {
  id: string;
  spotSlug: string;
  spotName: string;
  fishName: string;
  userName: string;
  tsuriId?: string; // ログインユーザー投稿時に設定。公開プロフィール /users/[tsuriId] への導線用
  comment: string;
  date: string; // "2026-02-22" 形式
  approved: boolean;
  photoUrl?: string;
  sizeCm?: number;
  method?: string; // 釣法
  weather?: string; // 天候
  submittedAt?: string; // 投稿日時(ISO)。UGC投稿時に設定。型と実値の整合用
}

// サンプル釣果データ（承認済み）
export const catchReports: CatchReport[] = [
  {
    id: "cr-001",
    spotSlug: "daikoku-fishing",
    spotName: "大黒海釣り施設",
    fishName: "アジ",
    userName: "釣りキチ太郎",
    comment: "朝マヅメにサビキで20匹ほど釣れました！型は15〜20cmで良型揃い。",
    date: "2026-02-15",
    approved: true,
  },
  {
    id: "cr-002",
    spotSlug: "honmoku-fishing",
    spotName: "本牧海づり施設",
    fishName: "サバ",
    userName: "横浜アングラー",
    comment: "昼過ぎから回遊が始まり、サビキで入れ食い状態でした。30cm超えも混じりました。",
    date: "2026-02-18",
    approved: true,
  },
  {
    id: "cr-003",
    spotSlug: "umikaze-park",
    spotName: "うみかぜ公園",
    fishName: "カサゴ",
    userName: "夜釣り好き",
    comment: "夜のヘチ釣りで5匹キャッチ。20cm前後が中心でした。根がかりに注意。",
    date: "2026-02-20",
    approved: true,
  },
  {
    id: "cr-004",
    spotSlug: "enoshima-breakwater",
    spotName: "江ノ島湘南大堤防",
    fishName: "メジナ",
    userName: "湘南フィッシャー",
    comment: "ウキフカセで30cmのメジナが釣れました！冬は水温が低いですが活性は悪くなかったです。",
    date: "2026-02-19",
    approved: true,
  },
  {
    id: "cr-005",
    spotSlug: "otaru-port",
    spotName: "小樽港",
    fishName: "カレイ",
    userName: "北海道釣り部",
    comment: "投げ釣りでマガレイ3枚。寒かったけどアタリは定期的にありました。",
    date: "2026-02-10",
    approved: true,
  },
];

/**
 * 指定スポットの承認済み釣果を取得 (静的データのみ)
 */
export function getCatchReportsBySpot(spotSlug: string): CatchReport[] {
  return catchReports
    .filter((r) => r.spotSlug === spotSlug && r.approved)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 指定スポットの承認済み釣果を取得 (静的データ + DynamoDB UGC を merge)
 * Server Component専用。client から呼ぶと dbGet が動かない。
 */
export async function getCatchReportsBySpotAsync(
  spotSlug: string,
): Promise<CatchReport[]> {
  const hardcoded = getCatchReportsBySpot(spotSlug);
  // SSGビルド時はDynamoDBを叩かない（全スポット完全SSG化でビルド時I/Oを排除）。
  // UGC釣果はランタイムISR再生成時にマージされる。
  if (process.env.NEXT_PHASE === "phase-production-build") return hardcoded;
  const { dbGet, dbBatchGet } = await import("@/lib/dynamodb");

  let ugcReports: CatchReport[] = [];
  try {
    const raw = await dbGet<CatchReport[]>(`SPOT#${spotSlug}`, "UGC_REPORTS");
    if (Array.isArray(raw) && raw.length > 0) {
      const parsed = raw.slice(0, 50).filter((r) => r.approved);
      if (parsed.length > 0) {
        const flagKeys = parsed.map((r) => ({ pk: `REPORT#${r.id}`, sk: "FLAGGED" }));
        const flags = await dbBatchGet(flagKeys);
        ugcReports = parsed.filter((_, i) => flags[i] === null);
      }
    }
  } catch (err) {
    console.error("[catch-reports] DynamoDB fetch error:", err);
  }

  const idSet = new Set(hardcoded.map((r) => r.id));
  const merged = [...hardcoded];
  for (const r of ugcReports) {
    if (idSet.has(r.id)) continue;
    idSet.add(r.id);
    merged.push(r);
  }
  return merged.sort((a, b) => b.date.localeCompare(a.date));
}
