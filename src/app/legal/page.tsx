import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description:
    "ツリスポの特定商取引法に基づく表記です。運営者情報、所在地、サービス内容（無料掲載・有料プラン）、販売価格、支払い方法、返品・キャンセルポリシーなどの法定情報を記載しています。",
  alternates: {
    canonical: "https://tsurispot.com/legal",
  },
};

export default function LegalPage() {
  return (
    <div className="flex flex-col">
      {/* ヘッダーセクション */}
      <section className="border-b bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <FileText className="size-4" />
            <span>Legal Notice</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            特定商取引法に基づく表記
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            最終更新日: 2026年4月26日
          </p>
        </div>
      </section>

      {/* 本文 */}
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Card className="border">
          <CardContent className="space-y-10 p-6 sm:p-10">
            {/* 事業者の名称 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  1
                </Badge>
                <h2 className="text-lg font-semibold">事業者の名称</h2>
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p>ツリスポ運営者（個人事業）</p>
              </div>
            </div>

            <Separator />

            {/* 代表者名 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  2
                </Badge>
                <h2 className="text-lg font-semibold">代表者名</h2>
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p>正木 家康</p>
              </div>
            </div>

            <Separator />

            {/* 所在地 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  3
                </Badge>
                <h2 className="text-lg font-semibold">所在地</h2>
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  お問い合わせフォームからお問い合わせください。
                </p>
                <p className="mt-2">
                  <Link prefetch={false}
                    href="/contact"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    お問い合わせフォームはこちら
                  </Link>
                </p>
              </div>
            </div>

            <Separator />

            {/* 連絡先 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  4
                </Badge>
                <h2 className="text-lg font-semibold">連絡先</h2>
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  <Link prefetch={false}
                    href="/contact"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    お問い合わせフォーム
                  </Link>
                  よりご連絡ください。
                </p>
              </div>
            </div>

            <Separator />

            {/* サービス内容 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  5
                </Badge>
                <h2 className="text-lg font-semibold">サービス内容</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">無料サービス</p>
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>釣りスポット情報の提供</li>
                  <li>魚種・釣り方に関する情報の提供</li>
                  <li>釣具店の基本情報掲載（無料プラン）</li>
                  <li>アフィリエイトリンクによる釣具・関連商品の紹介</li>
                </ul>
                <p className="font-medium text-foreground">有料サービス（釣具店向け）</p>
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>ベーシックプラン（初年度 月額500円・2年目以降 月額980円・税込）― 公式バッジ、検索優先表示、写真3枚、Googleのお店情報を整備</li>
                  <li>プロプラン（初年度 月額1,980円・2年目以降 月額2,980円・税込）― ベーシック全機能に加え、写真20枚、店主メッセージ、エサ在庫1日50回更新、クーポン配信、商品PR、Googleのお店情報を整備</li>
                </ul>
                <p>
                  アフィリエイトリンクを通じて外部のECサイト（Amazon.co.jp、楽天市場等）で商品をご購入いただく形となり、当サイトが商品を直接販売することはありません。
                </p>
              </div>
            </div>

            <Separator />

            {/* 販売価格 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  6
                </Badge>
                <h2 className="text-lg font-semibold">販売価格について</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">有料掲載プラン</p>
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>ベーシックプラン: 初年度 月額500円 / 2年目以降 月額980円（税込）</li>
                  <li>プロプラン: 初年度 月額1,980円 / 2年目以降 月額2,980円（税込）</li>
                </ul>
                <p>
                  上記は全て税込価格です。アフィリエイトリンク先の商品価格については、各ECサイトの表示価格が適用されます。
                </p>
              </div>
            </div>

            <Separator />

            {/* 支払方法 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  7
                </Badge>
                <h2 className="text-lg font-semibold">お支払い方法</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  クレジットカード（Visa / Mastercard / American Express / JCB）
                  <br />
                  ※ Stripe決済を利用しています。カード情報は当サイトでは保持せず、Stripeが安全に管理します。
                </p>
              </div>
            </div>

            <Separator />

            {/* 支払時期・提供時期 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  8
                </Badge>
                <h2 className="text-lg font-semibold">
                  お支払い時期・サービス提供時期
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  お申し込み時に初回課金が行われ、以降毎月同日に自動課金されます。決済完了後、即時サービスが開始されます。
                </p>
              </div>
            </div>

            <Separator />

            {/* 解約・返品・キャンセル */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  9
                </Badge>
                <h2 className="text-lg font-semibold">
                  解約・返品・キャンセルについて
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">有料掲載プラン</p>
                <p>
                  有料プランは管理画面からいつでも即時解約可能です。解約後も現在の課金期間終了までサービスをご利用いただけます。日割り計算による返金は行っておりません。
                </p>
                <p className="font-medium text-foreground">アフィリエイト商品</p>
                <p>
                  アフィリエイトリンク経由でご購入された商品に関する返品・交換については、
                  各購入先のECサイト（Amazon.co.jp、楽天市場等）の規約に従ってご対応ください。
                </p>
              </div>
            </div>

            <Separator />

            {/* サブスクリプション自動更新 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  10
                </Badge>
                <h2 className="text-lg font-semibold">
                  サブスクリプション自動更新に関する事項
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>有料プランは月額制のサブスクリプションサービスです。</li>
                  <li>毎月自動的にクレジットカードへの課金が行われます。</li>
                  <li>解約手続きを行わない限り、自動更新されます。</li>
                  <li>解約は管理画面の「プランを管理」からいつでも可能です。</li>
                  <li>初年度割引: ベーシックプラン 月額500円→980円（13ヶ月目から通常価格）、プロプラン 月額1,980円→2,980円（13ヶ月目から通常価格）。</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* お問い合わせ */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold">お問い合わせ</h2>
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  本表記に関するお問い合わせは、
                  <Link prefetch={false}
                    href="/contact"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    お問い合わせフォーム
                  </Link>
                  よりご連絡ください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
