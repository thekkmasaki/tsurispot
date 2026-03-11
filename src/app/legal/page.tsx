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
            最終更新日: 2026年3月11日
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
                  <Link
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
                  <Link
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
                  <li>ベーシックプラン（初年度 月額500円・2年目〜月額980円・税込）― 公式バッジ、検索優先表示、写真3枚</li>
                  <li>プロプラン（初年度 月額1,980円・2年目〜月額2,980円・税込）― ベーシック全機能に加え、写真20枚、店主メッセージ、エサ在庫1日50回更新、クーポン配信、商品PR、Googleビジネスプロフィール初期設定サポート</li>
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
                  <li>ベーシックプラン: 初年度 月額500円 / 2年目〜月額980円（税込）</li>
                  <li>プロプラン: 初年度 月額1,980円 / 2年目〜月額2,980円（税込）</li>
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
                  有料掲載プランのお支払い方法は、お問い合わせ後に個別にご案内いたします（銀行振込等）。
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
                  お支払い時期はお申し込み後に個別にご案内いたします。サービスはお支払い確認後、1〜3営業日以内に開始いたします。
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
                  有料プランはいつでも解約可能です。解約のお申し出は月末までにご連絡いただければ、翌月から課金が停止されます。日割り計算による返金は行っておりません。
                </p>
                <p className="font-medium text-foreground">アフィリエイト商品</p>
                <p>
                  アフィリエイトリンク経由でご購入された商品に関する返品・交換については、
                  各購入先のECサイト（Amazon.co.jp、楽天市場等）の規約に従ってご対応ください。
                </p>
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
                  <Link
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
