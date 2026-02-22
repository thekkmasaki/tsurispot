// ユーザー釣果投稿（UGC）データ定義

export interface CatchReport {
  id: string;
  spotSlug: string;
  spotName: string;
  fishName: string;
  userName: string;
  comment: string;
  date: string; // "2026-02-22" 形式
  approved: boolean;
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
 * 指定スポットの承認済み釣果を取得
 */
export function getCatchReportsBySpot(spotSlug: string): CatchReport[] {
  return catchReports
    .filter((r) => r.spotSlug === spotSlug && r.approved)
    .sort((a, b) => b.date.localeCompare(a.date));
}
