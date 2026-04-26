"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Crown, ArrowUpRight, AlertTriangle, Loader2 } from "lucide-react";
import type { SubscriptionData } from "@/types";

interface PlanManagementProps {
  shopSlug: string;
  token: string;
}

export function PlanManagement({ shopSlug, token }: PlanManagementProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/stripe/subscription?shop=${shopSlug}&token=${token}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.subscription) setSubscription(data.subscription);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shopSlug, token]);

  const handleManagePlan = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopSlug, token }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silent fail
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mt-6 gap-0 py-0">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";
  const planName = subscription?.plan === "pro" ? "プロ" : "ベーシック";
  const planColor = subscription?.plan === "pro"
    ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
    : "bg-blue-100 text-blue-700 hover:bg-blue-100";

  return (
    <Card className="mt-6 gap-0 py-0">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />
          <h2 className="text-base font-bold">プラン管理</h2>
        </div>

        {isPastDue && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">お支払いに問題があります</p>
              <p className="mt-1 text-xs text-red-600">カード情報を更新してください。</p>
            </div>
          </div>
        )}

        {isActive || isPastDue ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={planColor}>
                <Crown className="mr-1 size-3" />
                {planName}プラン
              </Badge>
              <Badge variant="outline" className={isPastDue ? "border-red-200 text-red-600" : "border-green-200 text-green-600"}>
                {isPastDue ? "支払い要確認" : "有効"}
              </Badge>
            </div>
            {subscription?.currentPeriodEnd && (
              <p className="text-xs text-muted-foreground">
                次回更新日: {new Date(subscription.currentPeriodEnd).toLocaleDateString("ja-JP")}
                {subscription.cancelAtPeriodEnd && "（解約予定）"}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManagePlan}
              disabled={portalLoading}
              className="gap-1.5"
            >
              {portalLoading ? <Loader2 className="size-3 animate-spin" /> : <ArrowUpRight className="size-3" />}
              {isPastDue ? "支払い情報を更新" : "プランを管理"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">無料プラン</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              有料プランにアップグレードすると、公式バッジ・検索優先表示・写真掲載などの機能が使えます。
            </p>
            <Link href={`/subscribe/basic?shop=${shopSlug}&token=${token}`}>
              <Button size="sm" className="gap-1.5">
                <Crown className="size-3" />
                有料プランにアップグレード
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
