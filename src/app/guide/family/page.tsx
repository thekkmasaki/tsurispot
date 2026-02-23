import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import {
  ChevronLeft,
  Baby,
  Users,
  Shield,
  Heart,
  MapPin,
  Backpack,
  Clock,
  Fish,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "ファミリーフィッシングガイド - 子供と楽しむ釣りの始め方",
  description:
    "子供と一緒に釣りを楽しむための完全ガイド。年齢別のおすすめ釣り、安全対策チェックリスト、持ち物リスト、子供が飽きないコツまで、ファミリーフィッシングのすべてを解説。",
  openGraph: {
    title: "ファミリーフィッシングガイド - 子供と楽しむ釣りの始め方",
    description:
      "子供と一緒に釣りを楽しむための完全ガイド。年齢別おすすめや安全対策を解説。",
    type: "article",
    url: "https://tsurispot.com/guide/family",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/family",
  },
};

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
      name: "釣りの始め方ガイド",
      item: "https://tsurispot.com/guide",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "ファミリーフィッシングガイド",
      item: "https://tsurispot.com/guide/family",
    },
  ],
};

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Icon className="size-5 text-primary" />
          {title}
        </h2>
        {children}
      </CardContent>
    </Card>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
      <span className="font-medium">ヒント：</span>
      {children}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span className="font-medium">注意：</span>
      {children}
    </div>
  );
}

export default function FamilyGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* パンくず */}
        <div className="mb-6">
          <Link
            href="/guide"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 size-4" />
            釣りの始め方ガイドに戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            ファミリーフィッシングガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            子供と一緒に楽しむ釣り。安全に、楽しく、思い出に残る体験を。
          </p>
        </div>

        <div className="space-y-6">
          {/* ファミリーフィッシングの魅力 */}
          <SectionCard title="ファミリーフィッシングの魅力" icon={Heart}>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    自然とふれあう教育体験
                  </span>
                  <br />
                  海や川の生き物を間近で観察でき、子供の好奇心や探究心を育みます。命の大切さを学ぶ機会にもなります。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    家族の絆を深める
                  </span>
                  <br />
                  一緒にエサを付けたり、魚が釣れた喜びを共有したり。日常では味わえない特別な時間を過ごせます。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    忍耐力と集中力が身につく
                  </span>
                  <br />
                  魚が釣れるまで待つことで、子供の忍耐力が自然と養われます。アタリを待つ集中力も身につきます。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    食育にもつながる
                  </span>
                  <br />
                  自分で釣った魚を食べる体験は、食べ物への感謝の気持ちを育てます。「釣った魚は残さず食べる」という約束も良い教育に。
                </div>
              </li>
            </ul>
          </SectionCard>

          {/* 子供の年齢別おすすめ */}
          <SectionCard title="子供の年齢別おすすめ" icon={Baby}>
            <div className="space-y-4">
              {/* 3〜5歳 */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-pink-500 text-white">3〜5歳</Badge>
                  <span className="text-sm font-medium text-foreground">
                    はじめてのおさかな体験
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-pink-500" />
                    海釣り公園でサビキ釣り（親が操作、子供は見る＆触る）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-pink-500" />
                    タッチプール付きの海釣り施設がおすすめ
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-pink-500" />
                    短時間（1〜2時間）で切り上げる
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-pink-500" />
                    魚を触る、バケツで観察するだけでも十分楽しい
                  </li>
                </ul>
              </div>

              {/* 6〜9歳 */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white">6〜9歳</Badge>
                  <span className="text-sm font-medium text-foreground">
                    自分で釣ってみよう
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    堤防でサビキ釣り（自分で竿を持てる）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    ハゼ釣り（簡単な仕掛けで確実に釣れる）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    管理釣り場（ニジマスなど確実に釣れて楽しい）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    エサ付けにもチャレンジしてみよう
                  </li>
                </ul>
              </div>

              {/* 10歳〜 */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-green-600 text-white">10歳〜</Badge>
                  <span className="text-sm font-medium text-foreground">
                    いろんな釣りに挑戦
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                    ちょい投げ釣り（キャスティングの練習に最適）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                    ルアー釣り入門（ワームやメタルジグから）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                    自分で仕掛けを作ってみよう
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                    釣りの計画（場所・潮の調査）も一緒に
                  </li>
                </ul>
              </div>
            </div>
          </SectionCard>

          {/* 安全対策チェックリスト */}
          <SectionCard title="安全対策チェックリスト" icon={Shield}>
            <div className="space-y-2">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <div>
                    <span className="font-medium text-foreground">
                      ライフジャケット必須
                    </span>
                    <br />
                    子供用のサイズを選び、正しく着用させましょう。堤防や岸壁では必ず着用してください。
                  </div>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <div>
                    <span className="font-medium text-foreground">
                      日焼け止めをしっかり塗る
                    </span>
                    <br />
                    水辺は紫外線が強いです。SPF30以上を2時間おきに塗り直しましょう。
                  </div>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <div>
                    <span className="font-medium text-foreground">
                      帽子を被る
                    </span>
                    <br />
                    熱中症予防と、万が一の針飛び防止のためにも帽子は必須です。
                  </div>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <div>
                    <span className="font-medium text-foreground">
                      滑りにくい靴を履く
                    </span>
                    <br />
                    堤防や岩場は濡れると滑ります。サンダルはNG。滑り止め付きのスニーカーや長靴を。
                  </div>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <div>
                    <span className="font-medium text-foreground">
                      虫除けスプレー
                    </span>
                    <br />
                    特に夕方は蚊が多くなります。子供用の虫除けを持参しましょう。
                  </div>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <div>
                    <span className="font-medium text-foreground">
                      絆創膏・救急セット
                    </span>
                    <br />
                    針でのケガや擦り傷に備えて、絆創膏と消毒液を用意しておきましょう。
                  </div>
                </li>
              </ul>
            </div>

            <Warning>
              子供から目を離さないでください。特に水辺では一瞬の油断が事故につながります。必ず大人が付き添い、手の届く距離にいましょう。
            </Warning>
          </SectionCard>

          {/* おすすめの釣り場タイプ */}
          <SectionCard title="おすすめの釣り場タイプ" icon={MapPin}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="mb-1 font-medium text-foreground">
                  海釣り公園・海釣り施設
                </p>
                <p className="text-sm text-muted-foreground">
                  柵やフェンスがあり安全性が高く、トイレ・売店・自動販売機が完備されています。スタッフが常駐していて、釣り方を教えてもらえることも。子連れファミリーに一番おすすめです。
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="secondary">柵あり</Badge>
                  <Badge variant="secondary">トイレ完備</Badge>
                  <Badge variant="secondary">売店あり</Badge>
                  <Badge variant="secondary">レンタル竿あり</Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-1 font-medium text-foreground">管理釣り場</p>
                <p className="text-sm text-muted-foreground">
                  ニジマスやイワナなどの放流魚が確実に釣れるので、子供も飽きません。スタッフが常駐しており、道具のレンタルも充実。BBQ施設を併設している場所もあります。
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="secondary">スタッフ常駐</Badge>
                  <Badge variant="secondary">確実に釣れる</Badge>
                  <Badge variant="secondary">BBQ可能な施設も</Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-1 font-medium text-foreground">穏やかな漁港</p>
                <p className="text-sm text-muted-foreground">
                  波が穏やかで足場が安定した漁港もファミリーにおすすめ。ただし柵がない場所も多いので、ライフジャケットの着用と子供の見守りは必須です。事前に釣り禁止でないか確認しましょう。
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="secondary">波が穏やか</Badge>
                  <Badge variant="secondary">足場が安定</Badge>
                  <Badge variant="secondary">無料が多い</Badge>
                </div>
              </div>
            </div>

            {/* 手ぶらOKヒント */}
            <div className="mt-4 rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-medium">
                    海釣り施設なら手ぶらOK！レンタル竿あり
                  </p>
                  <p className="mt-1 text-sm">
                    多くの海釣り公園ではレンタル竿セットを用意しています。エサも現地で購入できるので、初めてのファミリーフィッシングは手ぶらで行ける施設がおすすめです。
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 持ち物リスト（子連れ版） */}
          <SectionCard title="持ち物リスト（子連れ版）" icon={Backpack}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="mb-2 font-medium text-foreground">釣り道具</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    竿・リール（またはレンタル）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    仕掛け（予備も含めて）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    エサ
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    バケツ
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    ハサミ・プライヤー
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    クーラーボックス
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-2 font-medium text-foreground">安全・衛生</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    ライフジャケット
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    日焼け止め
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    帽子
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    虫除けスプレー
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    絆創膏・消毒液
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    ウェットティッシュ
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-2 font-medium text-foreground">子連れ必需品</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    着替え一式（汚れ・濡れ対策）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    おやつ・軽食
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    飲み物（多めに）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    レジャーシート
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    タオル（多めに）
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-2 font-medium text-foreground">あると便利</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    ゴミ袋（複数枚）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    折りたたみ椅子
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    日よけ（パラソル・テント）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    カメラ（思い出を残そう）
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    図鑑（魚を調べる楽しみ）
                  </li>
                </ul>
              </div>
            </div>
          </SectionCard>

          {/* 子供が飽きないコツ */}
          <SectionCard title="子供が飽きないコツ" icon={Clock}>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    短時間で切り上げる（2〜3時間が目安）
                  </span>
                  <br />
                  子供が「もっとやりたい！」と思うくらいで帰るのがベスト。長時間は疲れて嫌な思い出になりがちです。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    エサ付けを体験させる
                  </span>
                  <br />
                  虫エサが苦手な子にはアミエビやオキアミから。エサ付けも立派な「釣りの楽しみ」です。練りエサなら手軽です。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    魚に触れる体験を大切に
                  </span>
                  <br />
                  釣った魚をバケツに入れて観察したり、触ってみたり。「ヌルヌルする！」「動いてる！」という感動が大切な思い出になります。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    写真をたくさん撮る
                  </span>
                  <br />
                  魚を持った写真、エサ付けしている写真、景色の写真。帰ってから一緒に見返すのも楽しみのひとつです。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    無理強いしない
                  </span>
                  <br />
                  子供が飽きたら、磯遊びや貝拾い、散歩に切り替えてもOK。「釣り＝楽しい」という記憶が次回につながります。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    釣れた魚を一緒に料理する
                  </span>
                  <br />
                  帰宅後に一緒に調理すれば、釣りの体験が「食べる」までつながります。唐揚げや塩焼きなら子供にも大人気。
                </div>
              </li>
            </ul>

            <Hint>
              子供の集中力は意外と短いもの。おやつタイムを挟んだり、「あと3匹釣ったら帰ろう」と目標を決めると、メリハリのある楽しい時間になります。
            </Hint>
          </SectionCard>

          {/* 釣れやすい魚と仕掛け */}
          <SectionCard title="釣れやすい魚と仕掛け" icon={Fish}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">サビキ釣り</Badge>
                  <span className="text-sm font-medium text-foreground">
                    アジ・サバ・イワシ
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  堤防から足元に落とすだけの簡単な釣り方。コマセで魚を寄せるので、回遊魚がいれば高確率で釣れます。一度に複数匹かかることもあり、子供が大興奮する釣りです。
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">時期：</span>
                  5月〜11月がベストシーズン
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">ハゼ釣り</Badge>
                  <span className="text-sm font-medium text-foreground">
                    マハゼ
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  河口や浅い砂地で楽しめる釣り。ウキ釣りやちょい投げで狙えます。ハゼはエサに素直に食いつくので、子供でも釣りやすい魚の代表格。天ぷらにすると絶品です。
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">時期：</span>
                  7月〜11月がベストシーズン
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">管理釣り場</Badge>
                  <span className="text-sm font-medium text-foreground">
                    ニジマス・ヤマメ
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  放流された魚を狙うので、ほぼ確実に釣れます。練りエサやイクラで簡単に釣れ、その場で塩焼きにして食べられる施設も。一年中楽しめるのも魅力です。
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">時期：</span>
                  通年OK（夏場は涼しい渓流タイプがおすすめ）
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            家族で行く釣り場を探してみましょう！
          </p>
          <Link
            href="/spots"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ファミリー向けスポットを探す
          </Link>
        </div>
      {/* LINE登録バナー */}
      <div className="mt-8 sm:mt-12">
        <LineBanner variant="compact" />
      </div>
      </main>
    </>
  );
}
