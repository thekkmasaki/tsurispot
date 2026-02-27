import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "ツリスポのプライバシーポリシーです。個人情報の取り扱い、Cookie、アクセス解析、広告配信について説明しています。",
  alternates: {
    canonical: "https://tsurispot.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      {/* ヘッダーセクション */}
      <section className="border-b bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Shield className="size-4" />
            <span>Privacy Policy</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            プライバシーポリシー
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
                ツリスポ（以下「当サイト」といいます）は、ユーザーの個人情報の保護を重要視しています。
                本プライバシーポリシーでは、当サイトにおける個人情報の取り扱いについて説明いたします。
                当サイトをご利用いただくことで、本ポリシーに同意したものとみなします。
              </p>
            </div>

            <Separator />

            {/* 1. 収集する情報 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第1条
                </Badge>
                <h2 className="text-lg font-semibold">収集する情報</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>当サイトでは、以下の情報を自動的に収集する場合があります。</p>
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>
                    アクセスログ情報（IPアドレス、ブラウザの種類、アクセス日時、参照元URL等）
                  </li>
                  <li>Cookie及び類似技術により取得される情報</li>
                  <li>
                    お問い合わせ時にご入力いただく情報（メールアドレス、お名前等）
                  </li>
                </ul>
                <p>
                  なお、当サイトは会員登録機能を提供しておらず、ユーザーの氏名・住所・電話番号等の個人情報を直接収集することは原則としてありません。
                </p>
              </div>
            </div>

            <Separator />

            {/* 2. Cookieの使用 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第2条
                </Badge>
                <h2 className="text-lg font-semibold">Cookieの使用</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトでは、ユーザーの利便性向上、アクセス解析、広告配信の目的でCookie（クッキー）を使用しています。
                </p>
                <p>
                  Cookieとは、ウェブサイトがユーザーのブラウザに保存する小さなテキストファイルです。
                  ユーザーはブラウザの設定によりCookieの受け取りを拒否することができますが、その場合、当サイトの一部機能が正常に動作しない可能性があります。
                </p>
              </div>
            </div>

            <Separator />

            {/* 3. アクセス解析ツール */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第3条
                </Badge>
                <h2 className="text-lg font-semibold">
                  アクセス解析ツールについて
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトでは、Googleによるアクセス解析ツール「Google
                  Analytics」を使用する場合があります。 Google
                  Analyticsはデータの収集のためにCookieを使用しています。
                  このデータは匿名で収集されており、個人を特定するものではありません。
                </p>
                <p>
                  この機能はCookieを無効にすることで収集を拒否することができますので、
                  お使いのブラウザの設定をご確認ください。Google
                  Analyticsの利用規約については、
                  Google Analyticsのサービス利用規約をご参照ください。
                </p>
              </div>
            </div>

            <Separator />

            {/* 4. 広告配信 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第4条
                </Badge>
                <h2 className="text-lg font-semibold">広告配信について</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトでは、第三者配信の広告サービス（Google
                  AdSense等）を利用する場合があります。
                  広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
                </p>
                <p>
                  ユーザーは、広告設定ページでパーソナライズ広告を無効にすることができます。
                </p>
              </div>
            </div>

            <Separator />

            {/* 5. アフィリエイト */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第5条
                </Badge>
                <h2 className="text-lg font-semibold">
                  アフィリエイトリンクについて
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトは、Amazon.co.jpアソシエイト、楽天アフィリエイト、その他のアフィリエイトプログラムに参加しています。
                  当サイト内のリンクを経由して商品を購入された場合、当サイトに紹介料が支払われることがあります。
                </p>
                <p>
                  アフィリエイトリンクを使用することで、ユーザーに追加費用が発生することはありません。
                  当サイトでは、実際に釣りに役立つと判断した商品のみを紹介しています。
                </p>
              </div>
            </div>

            <Separator />

            {/* 6. 情報の利用目的 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第6条
                </Badge>
                <h2 className="text-lg font-semibold">情報の利用目的</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>収集した情報は、以下の目的で利用いたします。</p>
                <ul className="ml-4 list-disc space-y-1.5">
                  <li>当サイトのコンテンツ改善およびサービス向上</li>
                  <li>アクセス状況の分析</li>
                  <li>
                    お問い合わせに対する回答（個別に連絡先をいただいた場合）
                  </li>
                  <li>不正アクセスの防止</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* 7. 第三者提供 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第7条
                </Badge>
                <h2 className="text-lg font-semibold">第三者への情報提供</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトでは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
                  ただし、前述のアクセス解析ツールおよび広告配信サービスにおいて、
                  各サービス提供者がCookie等を通じて情報を収集する場合があります。
                </p>
              </div>
            </div>

            <Separator />

            {/* 8. ポリシーの変更 */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  第8条
                </Badge>
                <h2 className="text-lg font-semibold">
                  プライバシーポリシーの変更
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
                  変更後のプライバシーポリシーは、当サイトに掲載した時点から効力を生じるものとします。
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
                  本ポリシーに関するお問い合わせは、当サイトのお問い合わせフォームよりご連絡ください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
