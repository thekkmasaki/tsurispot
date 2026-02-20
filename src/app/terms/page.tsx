import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollText } from "lucide-react";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "ツリスポの利用規約です。サービス内容、免責事項、禁止事項、著作権について定めています。",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      {/* ヘッダーセクション */}
      <section className="border-b bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <ScrollText className="size-4" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            利用規約
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            最終更新日: 2026年2月20日
          </p>
        </div>
      </section>

      {/* 本文 */}
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Card className="border">
          <CardContent className="space-y-10 p-6 sm:p-10">
            {/* 前文 */}
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                本利用規約（以下「本規約」といいます）は、ツリスポ（以下「当サイト」といいます）が提供するすべてのサービスおよびコンテンツの利用条件を定めるものです。
                ユーザーが当サイトを利用した時点で、本規約に同意したものとみなします。
              </p>
            </div>

            <Separator />

            {/* 1. サービス内容 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第1条
                </Badge>
                <h2 className="text-lg font-semibold">サービス内容</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>当サイトは、以下のサービスを提供する情報サイトです。</p>
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>
                    釣りスポットに関する情報の掲載（場所、設備、アクセス等）
                  </li>
                  <li>
                    魚種に関する情報の掲載（釣れる時期、釣り方、おすすめの仕掛け等）
                  </li>
                  <li>釣り初心者向けのガイド・解説コンテンツの提供</li>
                  <li>釣具・釣り関連商品のアフィリエイトリンクによる紹介</li>
                </ul>
                <p>
                  当サイトは、サービスの内容を予告なく変更・追加・削除することがあります。
                </p>
              </div>
            </div>

            <Separator />

            {/* 2. 免責事項 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第2条
                </Badge>
                <h2 className="text-lg font-semibold">免責事項</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトに掲載されている情報は、正確性を期しておりますが、その完全性・正確性・有用性を保証するものではありません。
                  特に以下の点についてご了承ください。
                </p>
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>
                    釣りスポットの情報（営業時間、料金、設備等）は変更されている場合があります。
                    最新の情報は各施設の公式サイト等でご確認ください。
                  </li>
                  <li>
                    魚の釣果情報は、天候・潮汐・水温等の自然条件により大きく変動します。
                    当サイトの情報は目安であり、釣果を保証するものではありません。
                  </li>
                  <li>
                    当サイトを利用したことによって生じた損害（釣り場での事故、釣果不良、交通トラブル等）について、
                    当サイトは一切の責任を負いません。
                  </li>
                  <li>
                    当サイトからリンクされた外部サイト（アフィリエイトリンク先を含む）の内容について、
                    当サイトは責任を負いません。
                  </li>
                </ul>
                <p>
                  釣りは自然を相手にするアクティビティです。安全には十分ご注意いただき、
                  ライフジャケットの着用など適切な安全対策を講じてください。
                </p>
              </div>
            </div>

            <Separator />

            {/* 3. 禁止事項 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第3条
                </Badge>
                <h2 className="text-lg font-semibold">禁止事項</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトの利用にあたり、以下の行為を禁止します。
                </p>
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>
                    当サイトのコンテンツを無断で複製・転載・改変・再配布する行為
                  </li>
                  <li>
                    当サイトの運営を妨害する行為（不正アクセス、大量リクエスト等）
                  </li>
                  <li>当サイトの情報を商業目的で無断利用する行為</li>
                  <li>
                    他のユーザーまたは第三者の権利を侵害する行為
                  </li>
                  <li>法令または公序良俗に反する行為</li>
                  <li>
                    当サイトを利用して虚偽の情報を流布する行為
                  </li>
                  <li>その他、当サイト運営者が不適切と判断する行為</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* 4. 著作権 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第4条
                </Badge>
                <h2 className="text-lg font-semibold">著作権・知的財産権</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトに掲載されているすべてのコンテンツ（テキスト、画像、デザイン、ロゴ、プログラム等）の著作権は、
                  当サイト運営者または正当な権利を有する第三者に帰属します。
                </p>
                <p>
                  私的使用の範囲を超えた複製・転載・改変・公衆送信等は、著作権法その他の法令により禁止されています。
                  コンテンツの引用を行う場合は、適切な出典の明記をお願いいたします。
                </p>
              </div>
            </div>

            <Separator />

            {/* 5. リンクについて */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第5条
                </Badge>
                <h2 className="text-lg font-semibold">リンクについて</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトへのリンクは、原則として自由に設置いただけます。
                  ただし、以下の場合はリンクをお断りすることがあります。
                </p>
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>当サイトの信用を損なう形でのリンク</li>
                  <li>フレーム内でのコンテンツ表示を行うリンク</li>
                  <li>法令に違反するサイトからのリンク</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* 6. 規約の変更 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第6条
                </Badge>
                <h2 className="text-lg font-semibold">利用規約の変更</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトは、必要に応じて本規約を変更することがあります。
                  変更後の利用規約は、当サイトに掲載した時点から効力を生じるものとします。
                  重要な変更がある場合は、当サイト上でお知らせいたします。
                </p>
              </div>
            </div>

            <Separator />

            {/* 7. 準拠法・管轄 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第7条
                </Badge>
                <h2 className="text-lg font-semibold">
                  準拠法および管轄裁判所
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  本規約の解釈にあたっては、日本法を準拠法とします。
                  当サイトに関して紛争が生じた場合には、当サイト運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
                </p>
              </div>
            </div>

            <Separator />

            {/* お問い合わせ */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold">お問い合わせ</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  本規約に関するお問い合わせは、当サイトのお問い合わせフォームよりご連絡ください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
