import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  MapPin,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  QrCode,
  ArrowRight,
  Fish,

  Smartphone,
  UserCheck,
  CalendarDays,
  BookOpen,
  Globe,
  Map,
  Compass,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";

const spotCount = fishingSpots.length;
const fishCount = fishSpecies.length;

export const metadata: Metadata = {
  title: "釣具店様向け QRコード設置のご案内 - ツリスポ パートナー",
  description: `全国${spotCount}+釣りスポット・${fishCount}魚種を掲載する釣り情報サイト「ツリスポ」のQRコードを店頭に設置しませんか？完全無料で、お客様の「どこで釣れる？」を解決します。`,
  openGraph: {
    title: "釣具店様向け QRコード設置のご案内 - ツリスポ パートナー",
    description: `QRコード1枚で、店員さんの負担を軽減。全国${spotCount}+スポット・${fishCount}魚種の情報をお客様のスマホに。設置完全無料。`,
    type: "website",
    url: "https://tsurispot.com/partner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/partner",
  },
};

const BEFORE_AFTER = [
  {
    before: "「どこで釣れますか？」",
    after: "スマホで近くのスポットを即検索",
    icon: MapPin,
  },
  {
    before: "「何が必要ですか？」",
    after: "釣り方・道具リストを自動表示",
    icon: Fish,
  },
  {
    before: "「今何が釣れますか？」",
    after: "季節別の釣れる魚カレンダー",
    icon: CalendarDays,
  },
  {
    before: "「初心者ですが...」",
    after: "初心者ガイドが完備",
    icon: BookOpen,
  },
];

const QR_TYPES = [
  {
    name: "全国版",
    url: "tsurispot.com",
    description: "トップページへ誘導。全国どこの店舗でも使える汎用タイプ。",
    icon: Globe,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    name: "都道府県版",
    url: "tsurispot.com/prefecture/XXX",
    description:
      "ご希望の都道府県ページへ直行。地元の釣りスポット一覧が表示されます。",
    icon: Map,
    color:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  {
    name: "初心者版",
    url: "tsurispot.com/for-beginners",
    description: "完全初心者向けガイドへ誘導。道具・マナー・釣り方を網羅。",
    icon: UserCheck,
    color:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  {
    name: "診断版",
    url: "tsurispot.com/fish-finder",
    description:
      "「何を釣りたいか」診断ページへ。お客様の好みに合った魚種を提案。",
    icon: Compass,
    color:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  },
];

const STEPS = [
  {
    step: "1",
    icon: Mail,
    title: "お問い合わせ",
    description:
      "下記のメールアドレスまたはお問い合わせフォームからご連絡ください。",
  },
  {
    step: "2",
    icon: MapPin,
    title: "都道府県を指定",
    description:
      "ご希望のQRコードの種類と、都道府県版の場合は対象地域をお伝えください。",
  },
  {
    step: "3",
    icon: QrCode,
    title: "QRコードをお届け",
    description:
      "メールでPDFファイルをお送りします。印刷してすぐにご利用いただけます。",
  },
  {
    step: "4",
    icon: Zap,
    title: "店頭に設置するだけ",
    description:
      "レジ横やカウンター、入口など目立つ場所に掲示。お客様がスマホで読み取れます。",
  },
];

const FAQS = [
  {
    q: "費用はかかりますか？",
    a: "いいえ、現在QRコードの作成・設置は完全無料でご提供しています。追加費用も一切かかりません。",
  },
  {
    q: "QRコードはどのように届きますか？",
    a: "メールでPDFファイルをお送りします。A4やポストカードサイズなど、ご希望のサイズで印刷してお使いいただけます。",
  },
  {
    q: "掲載されている情報は定期的に更新されますか？",
    a: "はい、釣りスポット情報・季節の魚種データ・釣り方ガイドなどは継続的に更新しています。QRコードの差し替えは不要で、常に最新情報が表示されます。",
  },
  {
    q: "自分の店舗もサイトに掲載できますか？",
    a: "はい、釣具店・船宿・管理釣り場などの店舗情報の掲載も承っています。お気軽にご相談ください。",
  },
  {
    q: "複数の種類のQRコードを設置できますか？",
    a: "はい、全国版・都道府県版・初心者版・診断版など、複数のQRコードを組み合わせてお使いいただけます。すべて無料です。",
  },
  {
    q: "QRコードのデザインをカスタマイズできますか？",
    a: "基本デザインでのご提供となりますが、店舗名の記載など簡単なカスタマイズには対応可能です。お問い合わせ時にご相談ください。",
  },
];

export default function PartnerPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: "https://tsurispot.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "パートナー（釣具店様向け）",
        item: "https://tsurispot.com/partner",
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Link
        href="/"
        className="mb-5 inline-flex min-h-[44px] items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary sm:mb-6"
      >
        <ArrowLeft className="size-4" />
        トップに戻る
      </Link>

      {/* ===== ヒーローセクション ===== */}
      <section className="mb-14 text-center sm:mb-20">
        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
          <Store className="mr-1 size-3" />
          釣具店・船宿・管理釣り場 向け
        </Badge>

        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          お客様の「よく聞かれる質問」
          <br />
          減らしませんか？
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          <strong>QRコード1枚</strong>で、店員さんの負担を軽減。
          <br className="hidden sm:block" />
          「どこで釣れる？」「何が必要？」をお客様自身のスマホで解決できます。
        </p>

        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
          <QrCode className="size-10 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-left">
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
              設置完全無料
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              QRコードの作成から送付まで、費用は一切かかりません
            </p>
          </div>
        </div>

        {/* 数字で訴求 */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            {
              value: `${spotCount.toLocaleString()}+`,
              label: "掲載スポット数",
            },
            { value: `${fishCount}+`, label: "対応魚種" },
            { value: "47", label: "都道府県カバー" },
            { value: "1,500+", label: "総ページ数" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-gradient-to-b from-white to-blue-50/50 p-4 dark:from-gray-900 dark:to-blue-950/20"
            >
              <p className="text-2xl font-bold text-blue-600 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a href="mailto:fishingspotjapan@gmail.com?subject=QRコード設置希望">
            <Button
              size="lg"
              className="min-h-[52px] gap-2 bg-blue-600 px-10 text-base text-white hover:bg-blue-700"
            >
              <Mail className="size-5" />
              まずはお気軽にご相談ください
            </Button>
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            fishingspotjapan@gmail.com
          </p>
        </div>
      </section>

      {/* ===== Before → After セクション ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          QRコード設置で変わること
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          お客様の疑問を、スマホ1つで解決
        </p>
        <div className="space-y-3 sm:space-y-4">
          {BEFORE_AFTER.map((item) => (
            <Card key={item.before} className="gap-0 py-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <item.icon className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        Before
                      </span>
                      <span className="text-sm font-medium line-through decoration-red-300 sm:text-base">
                        {item.before}
                      </span>
                    </div>
                    <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                        After
                      </span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 sm:text-base">
                        {item.after}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== QRコードの種類 ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          選べるQRコードの種類
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          お店のニーズに合わせて、複数のタイプをご用意しています
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {QR_TYPES.map((qr) => (
            <Card key={qr.name} className="gap-0 py-0">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${qr.color}`}
                  >
                    <qr.icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold sm:text-base">
                        {qr.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal"
                      >
                        無料
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {qr.url}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {qr.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== 設置の流れ ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          設置までの流れ
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          かんたん4ステップで設置完了
        </p>
        <div className="grid gap-4 sm:grid-cols-4">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="relative rounded-xl border p-5 text-center"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {item.step}
                </span>
              </div>
              <div className="mt-2 flex justify-center">
                <item.icon className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-3 text-sm font-bold">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 費用について ===== */}
      <section className="mb-14 sm:mb-20">
        <Card className="gap-0 overflow-hidden border-2 border-blue-200 py-0 dark:border-blue-800">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-10">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
              <Shield className="size-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                QRコード設置は完全無料
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                現在、QRコードの作成・デザイン・送付はすべて
                <strong>無料</strong>
                でご提供しています。
                <br />
                初期費用・月額料金・追加費用は一切かかりません。
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>初期費用 0円</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>月額料金 0円</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>追加費用 なし</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ※将来的にプレミアム掲載プランなどをご用意する場合がございますが、QRコード設置は引き続き無料です。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ===== サイトの特徴 ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          ツリスポの特徴
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          お客様が安心して使える釣り情報サイト
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Search,
              title: "SEO最適化済み",
              description:
                "Google検索で釣り情報を探すユーザーに届く設計。すべてのページが検索エンジンに最適化されています。",
            },
            {
              icon: Smartphone,
              title: "スマホ完全対応",
              description:
                "スマホでの閲覧に最適化。釣り場で見ても読みやすいレスポンシブデザインです。",
            },
            {
              icon: CalendarDays,
              title: "季節情報が充実",
              description:
                "月別の釣れる魚・混雑予想・旬の情報など、季節に応じた情報を自動更新しています。",
            },
            {
              icon: MapPin,
              title: "現在地から検索",
              description:
                "GPSで現在地から近い釣りスポットを自動表示。来店したお客様の地元情報がすぐ見つかります。",
            },
            {
              icon: Fish,
              title: "魚種別ガイド",
              description: `${fishCount}種以上の魚種別に、釣り方・道具・料理法まで網羅。「何を釣りたいか」から情報を探せます。`,
            },
            {
              icon: BookOpen,
              title: "初心者ガイド完備",
              description:
                "釣り初心者向けの入門ガイド・チェックリスト・用語集を用意。初めてのお客様にも安心です。",
            },
          ].map((feature) => (
            <Card key={feature.title} className="gap-0 py-0">
              <CardContent className="p-5 sm:p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <feature.icon className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-3 text-sm font-bold">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== 対象事業者 ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-4 text-center text-xl font-bold sm:text-2xl">
          こんな事業者様におすすめ
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          釣りに関わるすべての事業者様が対象です
        </p>
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

      {/* ===== FAQ ===== */}
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
                <p className="mt-3 flex items-start gap-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
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

      {/* ===== CTA ===== */}
      <section id="contact" className="scroll-mt-20">
        <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-blue-700 to-blue-900 py-0">
          <CardContent className="flex flex-col items-center gap-6 px-5 py-10 text-center sm:px-12 sm:py-14">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
              <QrCode className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white sm:text-3xl">
                まずはお気軽にご相談ください
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100 sm:text-base">
                QRコード設置は完全無料。
                <br />
                メール1通で、お客様の満足度を上げる第一歩を踏み出せます。
              </p>
            </div>
            <a href="mailto:fishingspotjapan@gmail.com?subject=QRコード設置希望">
              <Button
                size="lg"
                className="min-h-[52px] gap-2 bg-white px-10 text-base text-blue-800 hover:bg-blue-50"
              >
                <Mail className="size-5" />
                メールで問い合わせる
              </Button>
            </a>
            <p className="text-sm font-medium text-blue-100">
              fishingspotjapan@gmail.com
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>返信2営業日以内</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="size-3.5" />
                <span>設置完全無料</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>複数QR対応可</span>
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
