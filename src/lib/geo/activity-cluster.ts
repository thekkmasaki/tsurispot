/**
 * 行動圏クラスタ（案③の距離ロジックの中核）。
 *
 * 問題: お気に入りのスコア最大を推すと、横浜在住の人に和歌山90点を推してしまう。
 * 解決: スコアには手を入れず「推薦の枠組み」で解決する。
 *   1. お気に入りを直線距離 60km 目安（日帰り釣行圏＝車で1〜1.5時間）でクラスタ化
 *   2. ホームクラスタを決める（現在地があれば最近傍 / なければ件数＋閲覧履歴）
 *   3. 「今日の1位」と Push 判定はホームクラスタ内のみ。他クラスタは「遠征先」として表示は残す
 * 距離減衰式を使わないのは、③の命である説明可能性（なぜN点か）を壊さないため。
 */
import { haversineKm } from "./distance";

export interface ClusterSpotInput {
  slug: string;
  lat: number;
  lng: number;
}

export interface SpotCluster {
  spotSlugs: string[];
  centroid: { lat: number; lng: number };
}

export const DEFAULT_CLUSTER_RADIUS_KM = 60;

/**
 * 貪欲法クラスタリング。順に見て、重心から radiusKm 以内の最初のクラスタに参加、
 * なければ新クラスタ。お気に入りは高々20件なので計算量は問題にならない。
 */
export function clusterByDistance(
  spots: ClusterSpotInput[],
  radiusKm: number = DEFAULT_CLUSTER_RADIUS_KM,
): SpotCluster[] {
  const clusters: SpotCluster[] = [];
  for (const s of spots) {
    const hit = clusters.find(
      (c) => haversineKm(c.centroid.lat, c.centroid.lng, s.lat, s.lng) <= radiusKm,
    );
    if (hit) {
      const n = hit.spotSlugs.length;
      hit.centroid = {
        lat: (hit.centroid.lat * n + s.lat) / (n + 1),
        lng: (hit.centroid.lng * n + s.lng) / (n + 1),
      };
      hit.spotSlugs.push(s.slug);
    } else {
      clusters.push({ spotSlugs: [s.slug], centroid: { lat: s.lat, lng: s.lng } });
    }
  }
  return clusters;
}

export interface HomePickOptions {
  /** 保存済み現在地（あれば最優先。帰省・遠征にも追従する） */
  location?: { lat: number; lng: number } | null;
  /** 閲覧履歴の slug（新しい順）。普段見ている場所のシグナル */
  recentSlugs?: string[];
}

/**
 * ホームクラスタの index を返す。クラスタが無ければ -1。
 * 優先順位: 現在地の最近傍 > (お気に入り件数 + 閲覧履歴0.5点) > より新しく閲覧 > 大きい方 > 先頭
 */
export function pickHomeClusterIndex(
  clusters: SpotCluster[],
  opts: HomePickOptions = {},
): number {
  if (clusters.length === 0) return -1;
  if (clusters.length === 1) return 0;

  if (opts.location) {
    let best = 0;
    let bestDist = Infinity;
    clusters.forEach((c, i) => {
      const d = haversineKm(
        opts.location!.lat,
        opts.location!.lng,
        c.centroid.lat,
        c.centroid.lng,
      );
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  const recent = opts.recentSlugs ?? [];
  const scored = clusters.map((c, i) => {
    const recentHits = recent.filter((s) => c.spotSlugs.includes(s)).length;
    // 最も新しく閲覧した slug の位置（小さいほど新しい）。無ければ大きな値
    const freshest = recent.findIndex((s) => c.spotSlugs.includes(s));
    return {
      i,
      score: c.spotSlugs.length + recentHits * 0.5,
      freshest: freshest === -1 ? Number.MAX_SAFE_INTEGER : freshest,
      size: c.spotSlugs.length,
    };
  });
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.freshest - b.freshest ||
      b.size - a.size ||
      a.i - b.i,
  );
  return scored[0].i;
}
