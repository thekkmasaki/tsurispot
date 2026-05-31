"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Core Web Vitals (CLS/LCP/INP 等) を GA4 へ送信する。
 *
 * 広告の増減が CWV に与える影響を監視し、過去の ATF バナー削除
 * （CLS 悪化 → 検索順位下落）のような事態を早期検知するための計測網。
 * 依存追加不要の Next.js 組込みフック useReportWebVitals を使用する。
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    // web-vital メトリクスは rating（good/needs-improvement/poor）を持つが
    // custom メトリクスには無いため存在チェックしてから送る。
    const rating = "rating" in metric ? (metric as { rating?: string }).rating : undefined;
    window.gtag("event", "web_vitals", {
      metric_name: metric.name,
      // CLS は 0〜1 の小数なので 1000 倍して整数化（GA4 の集計精度・可読性のため）。
      metric_value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      ...(rating ? { metric_rating: rating } : {}),
      metric_id: metric.id,
      page_path: window.location.pathname,
    });
  });
  return null;
}
