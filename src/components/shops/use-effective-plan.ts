"use client";

import { useState, useEffect } from "react";

export type EffectivePlan = "free" | "basic" | "pro";

/**
 * 店舗の「実効プラン」を取得する Client フック。
 * - サンプル店舗(isSample)は静的 planLevel をそのまま使う（API を叩かない＝デモ表示を固定）
 * - 実店舗は公開API /api/shop-plan から取得し、課金状態(DynamoDB)を反映する
 * 取得失敗時は静的プランのまま（有料機能を勝手に出さない安全側）。
 */
export function useEffectivePlan(
  shopSlug: string,
  isSample: boolean,
  staticPlan: EffectivePlan
): EffectivePlan {
  const [plan, setPlan] = useState<EffectivePlan>(staticPlan);

  useEffect(() => {
    if (isSample || !shopSlug) return;
    let active = true;
    fetch(`/api/shop-plan?shop=${encodeURIComponent(shopSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d?.plan) setPlan(d.plan as EffectivePlan);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [shopSlug, isSample]);

  return plan;
}
