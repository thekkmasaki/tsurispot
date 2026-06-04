"use client";

import { useEffect } from "react";
import { useEffectivePlan, type EffectivePlan } from "@/components/shops/use-effective-plan";

/**
 * 有料店舗ページなど、広告を非表示にしたいページでレンダリングする。
 * body に data-no-ads="true" を付与し、全広告コンポーネントを抑制する。
 * 実効プラン(課金状態)に連動: 実店舗は basic/pro で広告非表示、サンプルは静的プランで判定。
 */
export function NoAdsSignal({
  shopSlug,
  isSample,
  staticPlan,
}: {
  shopSlug: string;
  isSample: boolean;
  staticPlan: EffectivePlan;
}) {
  const plan = useEffectivePlan(shopSlug, isSample, staticPlan);
  const noAds = isSample || plan === "basic" || plan === "pro";

  useEffect(() => {
    if (!noAds) return;
    document.body.setAttribute("data-no-ads", "true");
    return () => {
      document.body.removeAttribute("data-no-ads");
    };
  }, [noAds]);

  return null;
}
