/**
 * 軽量A/Bテスト基盤
 *
 * 外部サービス不使用。localStorage にユーザーのバケット割当を固定保存し、GA4 イベントに
 * ab_<key> として載せて施策の効果（収益×CWV）を比較する。広告計測(PR#85)と組み合わせて
 * 「どの配置バリアントが viewability/RPM を伸ばすか」をデータで検証するための土台。
 *
 * 重要: SSG/ISR ページでのハイドレーションミスマッチを避けるため、サーバーは中立
 * （バケット未確定 = control 相当の見た目）で描画し、クライアントのマウント後に getBucket を
 * 呼んで差し込むこと（AdExperimentGate がこのパターンを実装している）。
 */

export type Variant = "control" | "treatment";

const STORAGE_PREFIX = "tsurispot-ab-";

/** 既知の実験キー（追加するごとに EXPERIMENTS へ定義し、利用側はこの型で参照する）。 */
export type ExperimentKey =
  | "ranking_infeed"
  | "fish_sidebar_reposition"
  | "prefooter_lazy"
  | "spots_deep_lazy"
  | "spot_mobile_header";

/**
 * 実験レジストリ。enabled=false の実験は全ユーザー control 固定（割当保存も GA4 送信もしない）
 * ため、コードを配線したまま 1 行で実験の開始/停止/ロールバックができる。
 */
export const EXPERIMENTS: Record<ExperimentKey, { enabled: boolean; description: string }> = {
  ranking_infeed: {
    enabled: true,
    description: "ランキング中盤への InFeedAd 挿入(index 2/6)",
  },
  fish_sidebar_reposition: {
    enabled: true,
    description: "fish詳細PC: 最深部の StickySidebarAd をスポット一覧直後へ上方移動",
  },
  prefooter_lazy: {
    enabled: true,
    description: "PreFooterAd の push を IntersectionObserver(800px手前)まで遅延。#216交絡の切り分けを兼ねる",
  },
  spots_deep_lazy: {
    enabled: false, // prefooter_lazy 合格(キュー汚染なし・viewable imps/PV非減)後に有効化
    description: "スポット詳細の深部3枠(InArticle×2/NativeAdBreak)の push を 1000px 手前まで遅延",
  },
  spot_mobile_header: {
    // 【有効化ブロッカー】現行実装(AdExperimentGate によるマウント後ATF挿入・高さ予約なし)の
    // まま enabled にすると、treatment のモバイル全PVで約59pxの挿入シフト=CLS約+0.09 が発生し、
    // 実験のguardrail(CLS p75 +0.02未満)を開始前から必ず割る。有効化前に (1)両バケット共通の
    // SSR固定高プレースホルダ帯を敷きゲートは中身のみ出し分ける等の挿入方式変更、
    // (2) docs/VIGNETTE-STEP0.md の「ATFヘッダー広告❌」方針の改訂PR、の両方が必須。
    enabled: false,
    description: "スポット詳細モバイルATFバナー(MobileHeaderBannerAd)の再導入(70%未達時のみ)",
  },
};

/**
 * GA4 の user プロパティにバケットを記録する。GA(gtag)は遅延ロードされるため、未ロード時は
 * リトライして取りこぼしを防ぐ（従来は保存済みバケットの再送がなく、初回割当時に gtag 未ロード
 * だと全期間セグメント不能になるバグがあった）。
 */
function sendBucketUserProperty(experimentKey: string, variant: Variant, attempt = 0) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("set", "user_properties", { [`ab_${experimentKey}`]: variant });
    return;
  }
  if (attempt >= 10) return; // 最大10秒待って諦める（ボット/gtag無効環境）
  setTimeout(() => sendBucketUserProperty(experimentKey, variant, attempt + 1), 1000);
}

/**
 * 実験キーに対するバケットを返す。初回はランダムに割当てて localStorage に固定保存し、
 * 以降は同じバケットを返す（同一ユーザーの体験を安定させる）。
 * SSR では null を返す（クライアントでのみ確定）。利用側は null を control 扱いにすること。
 * enabled=false の実験は常に "control"（割当・送信なし）。
 */
export function getBucket(experimentKey: ExperimentKey): Variant | null {
  if (typeof window === "undefined") return null;
  if (!EXPERIMENTS[experimentKey]?.enabled) return "control";
  const storageKey = STORAGE_PREFIX + experimentKey;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "control" || saved === "treatment") {
      // 保存済みでも毎PVで再送する: gtag の user_properties はページ単位で揮発するため、
      // 再送しないと2PV目以降のイベントがセグメント不能になる。
      sendBucketUserProperty(experimentKey, saved);
      return saved;
    }
    const variant: Variant = Math.random() < 0.5 ? "control" : "treatment";
    localStorage.setItem(storageKey, variant);
    // GA4 にバケットを user プロパティとして記録し、広告/CWVイベントと突合可能にする。
    sendBucketUserProperty(experimentKey, variant);
    return variant;
  } catch {
    return null;
  }
}
