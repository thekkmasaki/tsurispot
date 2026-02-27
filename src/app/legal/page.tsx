import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description:
    "ツリスポの特定商取引法に基づく表記です。事業者情報、サービス内容、返品・キャンセルについて記載しています。",
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
            最終更新日: 2026年2月27日
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
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>釣りスポット情報の提供（無料）</li>
                  <li>魚種・釣り方に関する情報の提供（無料）</li>
                  <li>アフィリエイトリンクによる釣具・関連商品の紹介</li>
                </ul>
                <p>
                  当サイトは情報提供を目的としたメディアサイトであり、商品の直接販売は行っておりません。
                  アフィリエイトリンクを通じて外部のECサイト（Amazon.co.jp、楽天市場等）で商品をご購入いただく形となります。
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
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトは商品の直接販売を行っていないため、販売価格の設定はございません。
                  リンク先の各ECサイトにおける価格が適用されます。
                </p>
              </div>
            </div>

            <Separator />

            {/* 返品・キャンセル */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  7
                </Badge>
                <h2 className="text-lg font-semibold">
                  返品・キャンセルについて
                </h2>
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトは商品の直接販売を行っていないため、返品・交換・キャンセルの対象外となります。
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
