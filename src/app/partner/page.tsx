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
  Megaphone,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "事業者様向け掲載のご案内 - ツリスポ",
  description:
    "釣具店・管理釣り場・釣り堀・レンタルボート・遊漁船など釣り関連事業者様向けの掲載案内。地図上への店舗掲載やスポットページでのPRなど、お問い合わせベースでご案内しています。",
  openGraph: {
    title: "事業者様向け掲載のご案内 - ツリスポ",
    description:
      "釣具店・管理釣り場・釣り堀・遊漁船など釣り関連事業者様向けの掲載をご案内します。",
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
    icon: MapPin,
    title: "地図上で見つけてもらえる",
    description:
      "釣りスポット周辺を探しているユーザーに、あなたの店舗・施設が自然に表示されます。",
  },
  {
    icon: Users,
    title: "幅広い釣り人にリーチ",
    description:
      "ツリスポは初心者からベテランまで幅広い釣り人が利用。新規顧客の獲得につながります。",
  },
  {
    icon: TrendingUp,
    title: "エサ在庫をリアルタイム発信",
    description:
      "エサの在庫状況やレンタル竿の有無など、来店前に知りたい情報をお客様に届けられます。",
  },
  {
    icon: Megaphone,
    title: "スポットページでPR",
    description:
      "近隣の釣りスポットページに店舗情報が表示され、釣りに行く前のユーザーに自然にアピールできます。",
  },
];

const CASE_STUDIES = [
  {
    type: "釣具店",
    description: "地図上に店舗表示 + 近隣スポットページにエサ在庫情報を掲載。来店前の在庫確認が可能に。",
  },
  {
    type: "管理釣り場・釣り堀",
    description: "施設の詳細ページを作成し、料金・営業時間・対象魚種などの情報を掲載。初めての方も安心して来場。",
  },
  {
    type: "遊漁船・レンタルボート",
    description: "出船スケジュールや料金を掲載。近隣スポットページからの送客で予約増加に貢献。",
  },
];

export default function PartnerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="mb-5 inline-flex min-h-[44px] items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary sm:mb-6"
      >
        <ArrowLeft className="size-4" />
        トップに戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-8 text-center sm:mb-12">
        <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/10">
          <Store className="mr-1 size-3" />
          事業者様向け
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
          ツリスポに掲載しませんか？
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          全国の釣りスポット情報サイト「ツリスポ」で、
          あなたの釣具店・管理釣り場・釣り堀・サービスを釣り人に届けましょう。
        </p>
      </div>

      {/* メリット */}
      <section className="mb-10 sm:mb-14">
        <h2 className="mb-6 text-center text-lg font-bold sm:text-xl">
          掲載のメリット
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title} className="gap-0 py-0">
              <CardContent className="flex gap-4 p-4 sm:p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold sm:text-base">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 掲載事例 */}
      <section className="mb-10 sm:mb-14">
        <h2 className="mb-6 text-center text-lg font-bold sm:text-xl">
          掲載イメージ
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {CASE_STUDIES.map((cs) => (
            <Card key={cs.type} className="gap-0 py-0">
              <CardContent className="p-5">
                <Badge variant="secondary" className="mb-3">
                  {cs.type}
                </Badge>
                <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed">
                  {cs.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 掲載できる内容 */}
      <section className="mb-10 sm:mb-14">
        <h2 className="mb-4 text-center text-lg font-bold sm:text-xl">
          掲載で表示される内容
        </h2>
        <Card className="gap-0 py-0">
          <CardContent className="p-5 sm:p-6">
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                "地図上に店舗・施設アイコンを表示",
                "店舗専用の詳細ページを作成",
                "住所・電話番号・営業時間の掲載",
                "エサの在庫情報をリアルタイム更新",
                "近隣スポットページにPR表示",
                "レンタル竿・サービス情報の掲載",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 対象事業者 */}
      <section className="mb-10 sm:mb-14">
        <h2 className="mb-4 text-center text-lg font-bold sm:text-xl">
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

      {/* お問い合わせCTA */}
      <section id="contact" className="scroll-mt-20">
        <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-slate-800 to-slate-900 py-0">
          <CardContent className="flex flex-col items-center gap-5 px-5 py-8 text-center sm:px-12 sm:py-12">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/10">
              <Mail className="size-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                まずはお問い合わせください
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
                掲載内容や料金は事業の種類・規模に合わせてご提案いたします。
                まずはお気軽にご相談ください。担当者より2営業日以内にご返信いたします。
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <a href="mailto:partner@tsurispot.com">
                <Button
                  size="lg"
                  className="min-h-[44px] gap-2 bg-white px-8 text-slate-900 hover:bg-slate-100"
                >
                  <Mail className="size-4" />
                  partner@tsurispot.com
                </Button>
              </a>
              <p className="text-xs text-slate-400">
                メール件名に「掲載希望」とご記入いただくとスムーズです
              </p>
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
            href="mailto:partner@tsurispot.com"
            className="text-primary underline"
          >
            partner@tsurispot.com
          </a>{" "}
          までご連絡ください。
        </p>
      </div>
    </div>
  );
}
