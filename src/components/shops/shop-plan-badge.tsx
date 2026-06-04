"use client";

import { Badge } from "@/components/ui/badge";
import { useEffectivePlan, type EffectivePlan } from "./use-effective-plan";

/**
 * 実効プランに応じた「公式掲載店 / プロ掲載店」バッジ。
 * 実店舗は課金状態(DynamoDB)に連動して表示され、無料/未課金なら何も表示しない。
 * サンプル店舗は静的 planLevel をそのまま使う。
 */
export function ShopPlanBadge({
  shopSlug,
  isSample,
  staticPlan,
}: {
  shopSlug: string;
  isSample: boolean;
  staticPlan: EffectivePlan;
}) {
  const plan = useEffectivePlan(shopSlug, isSample, staticPlan);

  if (plan === "pro") {
    return (
      <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
        プロ掲載店
      </Badge>
    );
  }
  if (plan === "basic") {
    return (
      <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
        公式掲載店
      </Badge>
    );
  }
  return null;
}
