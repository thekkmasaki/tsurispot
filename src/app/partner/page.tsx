import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  MapPin,
  BarChart3,
  Users,
  Mail,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "事業者様向け掲載のご案内 - ツリスポ パートナー",
  description:
    "全国960+釣りスポット・80魚種を掲載する釣り情報サイト「ツリスポ」への掲載をご案内。釣具店・管理釣り場・遊漁船など釣り関連事業者様の集客を支援します。",
  openGraph: {
    title: "事業者様向け掲載のご案内 - ツリスポ パートナー",
    description:
      "全国960+釣りスポット掲載の「ツリスポ」に釣具店・管理釣り場・遊漁船を掲載しませんか。",
    type: "website",
    url: "https://tsurispot.com/partner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/partner",
  },
};

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "全国960+スポット・80魚種を掲載する成長中メディア",
    description:
      "ツリスポは全国の釣りスポット情報を網羅し、1,200+ページをSEO最適化済み。Google検索からの流入が増加中で、釣り人が情報収集する場に貴店を掲載できます。",
  },
  {
    icon: MapPin,
    title: "地域密着 - 近くの釣り場ページからダイレクト誘導",
    description:
      "お店の近くにある釣りスポットページに店舗情報を表示。釣りに行く前に情報収集しているユーザーへ、最も効果的なタイミングでPRできます。",
  },
  {
    icon: Users,
    title: "初心者からベテランまで幅広い釣り人にリーチ",
    description:
      "ツリスポは初めて釣りをする方から経験豊富なアングラーまで幅広い層が利用。海釣り・川釣り両方をカバーし、新規顧客の獲得からリピート促進まで対応できます。",
  },
  {
    icon: BarChart3,
    title: "掲載効果を可視化",
    description:
      "掲載後の閲覧数やクリック数など、効果をデータでご報告。数字を見ながら集客の改善につなげていただけます。",
  },
];

const SERVICES = [
  "店舗・施設情報の掲載",
  "地図上へのピン表示",
  "近隣スポットページからの誘導",
  "トップページ・エリアページでのPR",
  "バナー広告の掲載",
  "釣果レポートの代行更新",
  "掲載効果のレポート",
];

const FAQS = [
  {
    q: "掲載開始までの流れを教えてください。",
    a: "お問い合わせ → ヒアリング・ご提案 → 掲載内容のご確認 → 掲載開始、という流れです。お問い合わせから掲載まで最短1週間程度です。",
  },
  {
    q: "掲載内容はあとから変更できますか？",
    a: "はい、いつでも変更可能です。営業時間・料金・在庫情報・写真などの更新は随時対応いたします。",
  },
  {
    q: "どのような事業者が対象ですか？",
    a: "釣具店・管理釣り場・釣り堀・レンタルボート・遊漁船・釣り船など、釣りに関連するすべての事業者様が対象です。まずはお気軽にお問い合わせください。",
  },
  {
    q: "費用はどのくらいですか？",
    a: "ご要望や掲載内容に応じて個別にご案内しております。まずはお問い合わせいただき、ご希望をお聞かせください。",
  },
];

export default function PartnerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="mb-5 inline-flex min-h-[44px] items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary sm:mb-6"
      >
        <ArrowLeft className="size-4" />
        トップに戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-12 text-center sm:mb-16">
        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
          <Store className="mr-1 size-3" />
          釣具店・船宿・管理釣り場 向け
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          ツリスポで、あなたのお店を
          <br className="hidden sm:block" />
          もっと多くの釣り人に届けませんか？
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          釣り情報サイト「ツリスポ」は全国<strong>960+スポット</strong>・<strong>80魚種</strong>・
          <strong>1,200+ページ</strong>を掲載し、SEO最適化済みのコンテンツで成長中。
          掲載することでGoogle検索からの新規顧客獲得をサポートします。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>全国960+スポット掲載</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>SEO最適化済み</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>海釣り・川釣り両対応</span>
          </div>
        </div>
        <div className="mt-8">
          <a href="mailto:fishingspotjapan@gmail.com">
            <Button size="lg" className="min-h-[48px] gap-2 bg-blue-600 px-8 text-white hover:bg-blue-700">
              <Mail className="size-4" />
              まずはお問い合わせ
            </Button>
          </a>
        </div>
      </div>

      {/* 掲載メリット */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          掲載のメリット
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          ツリスポだからこそできる集客支援
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title} className="gap-0 py-0">
              <CardContent className="flex gap-4 p-5 sm:p-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <benefit.icon className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-snug sm:text-base">
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 掲載でできること */}
      <section id="plans" className="mb-14 scroll-mt-20 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          掲載でできること
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          ご要望に応じて最適なプランをご提案します
        </p>
        <Card className="gap-0 py-0">
          <CardContent className="p-6 sm:p-8">
            <ul className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((service) => (
                <li key={service} className="flex items-center gap-3 text-sm sm:text-base">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                掲載内容・費用はご要望に応じて個別にご案内しております
              </p>
              <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">
                まずはお気軽にお問い合わせください
              </p>
              <a href="mailto:fishingspotjapan@gmail.com" className="mt-4 inline-block">
                <Button className="min-h-[44px] gap-2 bg-blue-600 text-white hover:bg-blue-700">
                  <MessageSquare className="size-4" />
                  お問い合わせ
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 対象事業者 */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-4 text-center text-xl font-bold sm:text-2xl">
          こんな事業者様を募集しています
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "釣具店・釣具チェーン",
            "管理釣り場",
            "釣り堀",
            "レンタルボート店",
            "遊漁船・釣り船",
            "エサ・仕掛け販売店",
            "マリーナ・港湾施設",
            "釣り関連メーカー",
            "アウトドア用品店",
            "観光協会・自治体",
          ].map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="px-3 py-1.5 text-sm"
            >
              {type}
            </Badge>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-8 text-center text-xl font-bold sm:text-2xl">
          よくある質問
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <Card key={faq.q} className="gap-0 py-0">
              <CardContent className="p-5 sm:p-6">
                <p className="flex items-start gap-3 text-sm font-bold sm:text-base">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Q
                  </span>
                  {faq.q}
                </p>
                <p className="mt-3 flex items-start gap-3 text-xs text-muted-foreground sm:text-sm leading-relaxed">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    A
                  </span>
                  {faq.a}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="scroll-mt-20">
        <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-blue-700 to-blue-900 py-0">
          <CardContent className="flex flex-col items-center gap-6 px-5 py-10 text-center sm:px-12 sm:py-14">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
              <Zap className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white sm:text-3xl">
                掲載についてのご相談はこちら
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100 sm:text-base">
                ご要望をお聞きした上で、最適な掲載プランをご提案いたします。
                まずはお気軽にメールでご連絡ください。
              </p>
            </div>
            <a href="mailto:fishingspotjapan@gmail.com">
              <Button
                size="lg"
                className="min-h-[48px] gap-2 bg-white px-8 text-blue-800 hover:bg-blue-50"
              >
                <Mail className="size-4" />
                fishingspotjapan@gmail.com
              </Button>
            </a>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>返信2営業日以内</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="size-3.5" />
                <span>ご相談無料</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>件名「掲載希望」でスムーズ</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* コラボ歓迎 */}
      <div className="mt-8 rounded-xl border border-dashed p-5 text-center sm:p-6">
        <p className="text-sm font-medium">
          釣りメディア・YouTuber・ブロガーの方へ
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          相互リンク・コンテンツコラボ・取材協力なども随時受け付けています。
          お気軽に{" "}
          <a
            href="mailto:fishingspotjapan@gmail.com"
            className="text-primary underline"
          >
            fishingspotjapan@gmail.com
          </a>{" "}
          までご連絡ください。
        </p>
      </div>
    </div>
  );
}
