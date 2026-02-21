import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Fish,
  BookOpen,
  Heart,
  ChevronRight,
  Waves,
  Users,
  Shield,
  Calendar,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ツリスポについて",
  description:
    "ツリスポは釣りスポット総合情報サイトです。地図で直感的に釣り場を探せ、今の時期に釣れる魚やおすすめの仕掛け情報を提供しています。",
};

const features = [
  {
    icon: MapPin,
    title: "地図で探せる",
    description:
      "地図上で直感的に釣りスポットを検索。近くの釣り場がすぐに見つかります。",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Fish,
    title: "今釣れる魚がわかる",
    description:
      "時期ごとに釣れる魚を表示。旬の魚やベストな時間帯もチェックできます。",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: BookOpen,
    title: "誰でも安心",
    description:
      "道具の選び方から釣り場でのマナーまで、必要な情報を丁寧に解説しています。",
    color: "bg-emerald-100 text-emerald-600",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 right-0 h-32">
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              className="absolute bottom-0 w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z"
                fill="white"
                fillOpacity="0.3"
              />
            </svg>
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
              <Heart className="size-4" />
              <span>About Us</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              ツリスポについて
            </h1>
            <p className="max-w-lg text-base text-blue-100 sm:text-lg">
              みんなのための、いちばん使いやすい釣りスポット情報サイト
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* 創業ストーリー・ミッション */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2">
            <Waves className="size-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              コンセプト
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            「釣りを始めたいけど、どこに行けばいいか分からない」
            <br />
            「今の時期、何が釣れるの？」
            <br />
            <br />
            ツリスポは、そんな疑問をすべて解決するために生まれました。
            地図で直感的に釣り場を探し、季節ごとに釣れる魚やおすすめの仕掛けまで、
            釣りに必要な情報をワンストップで提供します。
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <Card className="border">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
                  <Calendar className="size-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold">創業ストーリー</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ツリスポは2025年に「釣り初心者がもっと気軽に釣りを始められる世界を作りたい」という想いから誕生しました。
                創業メンバー自身が釣りを始めた際、「どこで何が釣れるのか」「どんな道具が必要なのか」といった
                基本的な情報がバラバラに散らばっていて、なかなか一歩を踏み出せなかった経験がきっかけです。
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                「誰でも、いつでも、すぐに釣り場の情報にアクセスできるサイトがあれば」
                ――その思いを形にしたのがツリスポです。
                全国の釣りスポット情報を地図上に集約し、季節・魚種・難易度など多角的な視点から
                最適な釣り場を見つけられるサービスを目指しています。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3つの特徴 */}
      <section className="bg-muted/50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            3つの特徴
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full border">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div
                    className={`flex size-14 items-center justify-center rounded-full ${feature.color}`}
                  >
                    <feature.icon className="size-7" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 編集チーム */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              ツリスポ編集部
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            ツリスポ編集部は、釣り歴10年以上の経験者を中心に構成されたチームです。
            堤防釣りからオフショアまで幅広いジャンルに精通したメンバーが、
            初心者にもわかりやすい情報発信を心がけています。
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
          <Card className="h-full border">
            <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-sky-100">
                <MapPin className="size-6 text-sky-600" />
              </div>
              <h3 className="text-sm font-semibold">現地取材</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                編集部メンバーが実際に釣り場を訪問し、アクセス・設備・釣果情報を確認しています。
              </p>
            </CardContent>
          </Card>
          <Card className="h-full border">
            <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
                <BookOpen className="size-6 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold">初心者目線</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                専門用語にはすべて解説を付け、釣り未経験者でも理解できる記事作成を徹底しています。
              </p>
            </CardContent>
          </Card>
          <Card className="h-full border">
            <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100">
                <Fish className="size-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold">定期更新</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                季節ごとの釣果情報や釣り場の変化を定期的にチェックし、常に最新の情報を提供しています。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 情報の信頼性について */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                情報の信頼性について
              </h2>
            </div>
          </div>

          <div className="mx-auto max-w-2xl space-y-4">
            <Card className="border">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold">明石・播磨エリアは実釣経験に基づく情報</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      運営者自身が明石・播磨周辺をホームグラウンドとして定期的に釣行しています。
                      明石港、林崎漁港、大蔵海岸、翼港などの釣り場情報は、実際の釣行経験をもとに作成しています。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold">その他エリアの情報について</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      明石エリア以外のスポット情報は、公開されている釣果情報サイト・釣り場紹介記事・
                      地図情報などを参考に作成しています。情報に誤りがあった場合は、お問い合わせよりご連絡いただければ修正いたします。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 運営情報 */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          運営情報
        </h2>

        <Card className="mx-auto max-w-2xl border">
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  運営形態
                </Badge>
                <span className="text-sm">個人運営</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  サイト名
                </Badge>
                <span className="text-sm">ツリスポ</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  設立年
                </Badge>
                <span className="text-sm">2025年</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  編集チーム
                </Badge>
                <span className="text-sm">ツリスポ編集部</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  サイトURL
                </Badge>
                <span className="text-sm">https://tsurispot.com</span>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="shrink-0 text-xs">
                  サイト概要
                </Badge>
                <span className="text-sm text-muted-foreground">
                  全国の釣りスポット情報・魚種情報を提供する総合情報サイトです。
                  アフィリエイトリンクを含む場合があります。
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 shadow-sm">
            <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-12 sm:py-14">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                さっそく釣りスポットを探してみよう
              </h2>
              <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                あなたにぴったりの釣り場がきっと見つかります。
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/spots">
                  <Button size="lg" className="min-h-[44px] gap-1.5 px-6">
                    スポット一覧を見る
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/map">
                  <Button
                    variant="outline"
                    size="lg"
                    className="min-h-[44px] gap-1.5 px-6"
                  >
                    地図で探す
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
