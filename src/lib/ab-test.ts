/**
 * 軽量A/Bテスト基盤
 *
 * 外部サービス不使用。localStorage にユーザーのバケット割当を固定保存し、GA4 イベントに
 * ab_<key> として載せて施策の効果（収益×CWV）を比較する。広告計測(PR#85)と組み合わせて
 * 「どの配置バリアントが viewability/RPM を伸ばすか」をデータで検証するための土台。
 *
 * 現状はフレームワークのみ（実験定義 EXPERIMENTS は空）。実配置の出し分けは GA4 データが
 * 溜まってから別PRで追加する。
 *
 * 重要: SSG/ISR ページでのハイドレーションミスマッチを避けるため、サーバーは中立
 * （バケット未確定 = control 相当の見た目）で描画し、クライアントのマウント後に getBucket を
 * 呼んで差し込むこと（LazyAd の isVisible 遅延挿入と同じ思想）。
 */

export type Variant = "control" | "treatment";

const STORAGE_PREFIX = "tsurispot-ab-";

/** 既知の実験キー（追加するごとにここへ定義し、利用側はこの型で参照する）。 */
export type ExperimentKey = "ranking_infeed";

/**
 * 実験キーに対するバケットを返す。初回はランダムに割当てて localStorage に固定保存し、
 * 以降は同じバケットを返す（同一ユーザーの体験を安定させる）。
 * SSR では null を返す（クライアントでのみ確定）。利用側は null を control 扱いにすること。
 */
export function getBucket(experimentKey: string): Variant | null {
  if (typeof window === "undefined") return null;
  const storageKey = STORAGE_PREFIX + experimentKey;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "control" || saved === "treatment") return saved;
    const variant: Variant = Math.random() < 0.5 ? "control" : "treatment";
    localStorage.setItem(storageKey, variant);
    // GA4 にバケットを user プロパティとして記録し、広告/CWVイベントと突合可能にする。
    if (typeof window.gtag === "function") {
      window.gtag("set", "user_properties", { [`ab_${experimentKey}`]: variant });
    }
    return variant;
  } catch {
    return null;
  }
}
