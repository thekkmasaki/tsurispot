import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { SubscribeButton } from "./subscribe-button";
import { PLAN_PRICING, formatYen } from "@/lib/data/plans";

const PLAN_DETAILS = {
  basic: {
    name: "ベーシック",
    priceFirst: `月額${formatYen(PLAN_PRICING.basic.firstYear)}円（税込）`,
    priceAfter: `月額${formatYen(PLAN_PRICING.basic.afterYear)}円（税込）`,
    badgeColor: "bg-blue-100 text-blue-700",
  },
  pro: {
    name: "プロ",
    priceFirst: `月額${formatYen(PLAN_PRICING.pro.firstYear)}円（税込）`,
    priceAfter: `月額${formatYen(PLAN_PRICING.pro.afterYear)}円（税込）`,
    badgeColor: "bg-amber-100 text-amber-700",
  },
} as const;

type PlanKey = keyof typeof PLAN_DETAILS;

export async function generateStaticParams() {
  return [{ plan: "basic" }, { plan: "pro" }];
}

export async function generateMetadata({ params }: { params: Promise<{ plan: string }> }): Promise<Metadata> {
  const { plan } = await params;
  const details = PLAN_DETAILS[plan as PlanKey];
  if (!details) return {};
  return {
    title: `${details.name}プランに申し込む - ツリスポ`,
    description: `ツリスポの${details.name}プランのお申し込み確認画面です。`,
  };
}

export default async function SubscribePage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params;
  const details = PLAN_DETAILS[plan as PlanKey];
  if (!details) notFound();

  const items = [
    { label: "商品名", value: `ツリスポ ${details.name}プラン` },
    { label: "料金", value: `初年度 ${details.priceFirst} / 2年目以降 ${details.priceAfter}` },
    { label: "支払方法", value: "クレジットカード（Stripe決済）" },
    { label: "支払時期", value: "申込時に初回課金、以降毎月自動課金" },
    { label: "提供期間", value: "解約手続き完了まで毎月自動更新" },
    { label: "解約方法", value: "管理画面「プランを管理」→「キャンセル」（いつでも即時解約可能）" },
    { label: "返品・返金", value: "デジタルサービスのため返品不可。日割り返金なし。" },
  ];

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <Link href="/partner" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        パートナーページに戻る
      </Link>

      <div className="mb-6 text-center">
        <Badge className={`mb-3 ${details.badgeColor}`}>
          <ShieldCheck className="mr-1 size-3" />
          お申し込み確認
        </Badge>
        <h1 className="text-2xl font-bold">{details.name}プランに申し込む</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          以下の内容をご確認のうえ、お申し込みください
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={item.label}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <span className="shrink-0 text-sm font-medium sm:w-28">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Suspense fallback={<div className="flex-1"><Button disabled className="w-full gap-2">読み込み中...</Button></div>}>
          <SubscribeButton plan={plan as "basic" | "pro"} />
        </Suspense>
        <Link href="/partner" className="flex-1">
          <Button variant="outline" className="w-full">キャンセル</Button>
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        お申し込みにより、
        <Link href="/legal" className="text-primary underline underline-offset-4 hover:text-primary/80">
          特定商取引法に基づく表記
        </Link>
        に同意したものとみなされます。
      </p>
    </div>
  );
}
