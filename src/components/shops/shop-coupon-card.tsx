"use client";

import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffectivePlan, type EffectivePlan } from "./use-effective-plan";

interface Coupon {
  title: string;
  description: string;
  validUntil: string;
}

/**
 * プロプラン限定クーポン。実効プランが pro かつクーポンデータがある場合のみ表示。
 * 実店舗は課金状態(DynamoDB)に連動。サンプルは静的 planLevel を使う。
 */
export function ShopCouponCard({
  shopSlug,
  isSample,
  staticPlan,
  coupon,
}: {
  shopSlug: string;
  isSample: boolean;
  staticPlan: EffectivePlan;
  coupon?: Coupon;
}) {
  const plan = useEffectivePlan(shopSlug, isSample, staticPlan);

  if (plan !== "pro" || !coupon) return null;

  return (
    <Card className="mb-6 border-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-600" />
          クーポン
          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
            プロ限定
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border-2 border-dashed border-amber-300 bg-white dark:bg-background p-4 text-center">
          <p className="text-lg font-bold text-amber-700">{coupon.title}</p>
          <p className="mt-1 text-sm">{coupon.description}</p>
          <p className="mt-2 text-xs text-muted-foreground">有効期限: {coupon.validUntil}</p>
        </div>
      </CardContent>
    </Card>
  );
}
