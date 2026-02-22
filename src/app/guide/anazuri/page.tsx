import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Waves,
  Package,
  Footprints,
  Lightbulb,
  HelpCircle,
  MapPin,
  Fish,
  ShieldAlert,
  Anchor,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fishingSpots } from "@/lib/data/spots";
import { ProductList } from "@/components/affiliate/product-list";
import { getProductsByMethod } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "穴釣り完全ガイド - カサゴ・メバルの釣り方と仕掛け【初心者向け】",
  description:
    "穴釣りの仕掛け、ポイント選び、釣り方を初心者向けに完全解説。テトラポッドや岩の隙間でカサゴやメバルを狙う穴釣りは、道具が少なく年中楽しめる手軽な釣り。安全対策も含めて丁寧に解説します。",
  openGraph: {
    title: "穴釣り完全ガイド - カサゴ・メバルの釣り方と仕掛け",
    description:
      "テトラの穴でカサゴ・メバルを釣る穴釣り入門。仕掛け・ポイント選び・安全対策を解説。",
    type: "article",
    url: "https://tsurispot.com/guide/anazuri",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/anazuri",
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
      name: "穴釣り完全ガイド",
      item: "https://tsurispot.com/guide/anazuri",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "穴釣りの始め方 - テトラの穴で根魚を釣る手順",
  description:
    "テトラポッドや岩の隙間にいるカサゴやメバルを狙う穴釣り。仕掛けの準備から実釣、安全対策まで初心者向けに解説。",
  totalTime: "PT2H",
  supply: [
    { "@type": "HowToSupply", name: "ブラクリ仕掛け（3〜5号）" },
    { "@type": "HowToSupply", name: "エサ（青イソメまたはオキアミ）" },
  ],
  tool: [
    { "@type": "HowToTool", name: "穴釣り用ロッド（1〜1.5m）またはコンパクトロッド" },
    { "@type": "HowToTool", name: "小型スピニングリールまたはベイトリール" },
    { "@type": "HowToTool", name: "フィッシングプライヤー（針外し）" },
    { "@type": "HowToTool", name: "滑り止め付きの靴" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "ブラクリ仕掛けをセットする",
      text: "道糸の先にブラクリ仕掛けを結びます。ブラクリはオモリと針が一体になった穴釣り専用の仕掛けで、セットが非常に簡単です。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "エサを針に付ける",
      text: "青イソメを2〜3cm、またはオキアミを1匹針に付けます。エサが大きすぎると穴の奥に入りにくいので、コンパクトに付けましょう。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "テトラの隙間を探す",
      text: "テトラポッドの間にある暗い穴や隙間を探します。海面に近い穴よりも、少し奥まった暗い穴の方が魚がいる確率が高いです。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "仕掛けを穴に落とす",
      text: "穴の上から仕掛けをそっと落とします。底に着くまでゆっくり糸を出し、底に着いたら少し糸を張ります。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "軽く誘って待つ",
      text: "仕掛けを底で2〜3回小さく上下に動かして誘います。そのまま10〜20秒待って、アタリがなければ次の穴に移動します。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "アタリがあったら素早く抜き上げる",
      text: "ゴツゴツとした明確なアタリがあったら、すかさず竿を上げて合わせます。根魚は穴に潜ろうとするので、素早く抜き上げることが重要です。",
      position: 6,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "穴釣りにはどんな竿が必要ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1〜1.5mの短い穴釣り専用ロッドが最適です。テトラの上で取り回しやすい短さが重要。100均の竿やコンパクトロッドでも代用できます。高価な竿は不要で、1,000〜3,000円程度のもので十分です。",
      },
    },
    {
      "@type": "Question",
      name: "穴釣りで使うエサは何がいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "青イソメが最も万能です。他にはオキアミ、サバの切り身、鶏のささみなども効果があります。根魚は雑食性が強いので、さまざまなエサで反応します。虫エサが苦手な方は、パワーイソメなどの人工エサも使えます。",
      },
    },
    {
      "@type": "Question",
      name: "穴釣りのベストシーズンはいつですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "穴釣りは年中楽しめるのが大きな魅力です。特に秋から冬（10〜2月）がベストシーズンで、カサゴやメバルの活性が高くなります。他の釣りが難しくなる冬場でも釣果が期待できる貴重な釣り方です。",
      },
    },
    {
      "@type": "Question",
      name: "テトラポッドでの穴釣りは危険ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "テトラポッドは足場が不安定で、滑りやすいため注意が必要です。滑り止め付きのスパイクシューズを履き、両手が使えるようリュックタイプのバッグを使いましょう。雨の日や波が高い日は絶対に避けること。単独行動は控え、必ず誰かに行き先を伝えてから釣りに出かけましょう。",
      },
    },
    {
      "@type": "Question",
      name: "ブラクリ仕掛けは何号がおすすめ？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "3〜5号が標準です。穴が小さい場合は3号、やや広い穴や潮の流れがある場所では5号を使います。最初は3号と5号を1つずつ用意しておけば対応できます。根掛かりでロストすることもあるので、予備を2〜3個持っていきましょう。",
      },
    },
  ],
};

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          {Icon && <Icon className="size-5 text-primary" />}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
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

function Danger({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
      <span className="font-medium">重要：</span>
      {children}
    </div>
  );
}

export default function AnazuriGuidePage() {
  // 穴釣り向けスポット（堤防・漁港の初心者〜中級者向け）
  const anazuriSpots = fishingSpots
    .filter(
      (s) =>
        (s.spotType === "breakwater" || s.spotType === "port" || s.spotType === "rocky") &&
        (s.difficulty === "beginner" || s.difficulty === "intermediate")
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
            穴釣り完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            テトラや岩の隙間に潜む根魚を狙う穴釣り。
            <br className="hidden sm:inline" />
            道具が少なく、年中楽しめる手軽な釣りスタイルです。
          </p>
        </div>

        {/* 穴釣りとは */}
        <div className="mb-6 rounded-lg border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">穴釣りとは？</p>
          <p className="mt-1">
            穴釣りは、テトラポッド（消波ブロック）や岩場の隙間に仕掛けを落として、穴の中に潜んでいるカサゴやメバルなどの根魚（ロックフィッシュ）を釣る方法です。専用の短い竿とブラクリ仕掛けだけで手軽に始められ、他の釣り方では釣れない厳寒期でも安定した釣果が期待できます。1〜1.5mの短い竿を使うので荷物が少なく、機動力が高いのも魅力。穴を次々と探っていくゲーム性の高さにハマる釣り人も多く、一度始めるとやみつきになる釣りです。
          </p>
        </div>

        <div className="space-y-6">
          {/* 必要な道具 */}
          <SectionCard title="必要な道具" icon={Package}>
            <p className="mb-4 text-sm text-muted-foreground">
              穴釣りは必要な道具が少なく、最もコンパクトに始められる釣りのひとつです。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">竿：</span>
                1〜1.5mの穴釣り専用ロッドが最適。テトラの上で取り回しやすい短さが重要です。1,000〜3,000円程度のもので十分。コンパクトロッドや100均の竿でも代用可能です。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">リール：</span>
                小型のスピニングリール（1000〜2000番）またはベイトリール。ベイトリールの方が穴に落とす操作がしやすいですが、スピニングでも問題ありません。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">ブラクリ仕掛け：</span>
                オモリと針が一体になった穴釣り専用の仕掛け。赤やオレンジ色のオモリが多く、アピール力があります。3〜5号が標準。1個100〜200円程度。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">エサ：</span>
                青イソメが最も万能。他にオキアミ、サバの切り身、鶏のささみでもOK。根魚は雑食性なのでさまざまなエサに反応します。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">ライン：</span>
                ナイロンライン3〜4号。根擦れ（岩に糸が当たること）が多いので、やや太めの糸を使います。フロロカーボンラインなら耐摩耗性が高くおすすめ。
              </li>
            </ul>
            <Hint>
              穴釣りセット（竿・リール・仕掛け付き）なら2,000〜4,000円程度で一式揃います。ブラクリ仕掛けは根掛かりでなくすことが多いので、予備を3〜5個用意しておきましょう。
            </Hint>

            <div className="rounded-lg border p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                あると便利なアイテム
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>フィッシングプライヤー（針外しに必須。根魚は飲み込むことが多い）</li>
                <li>フィッシンググローブ（テトラを掴む際の手の保護に）</li>
                <li>スパイクシューズまたは滑り止め付きの靴</li>
                <li>ヘッドライト（テトラの暗い穴を照らす）</li>
                <li>小型のクーラーバッグ（荷物をコンパクトに）</li>
              </ul>
            </div>
          </SectionCard>

          {/* 釣り方の手順 */}
          <SectionCard title="釣り方の手順" icon={Footprints}>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ブラクリ仕掛けをセットする
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸の先にスナップサルカンを結び、ブラクリ仕掛けを取り付けます。ブラクリはオモリと針が一体になっているので、セットが非常に簡単。結ぶだけで準備完了です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    エサを針に付ける
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    青イソメを2〜3cm、またはオキアミを1匹針に付けます。エサが大きすぎると穴の奥に入りにくくなるので、コンパクトに付けるのがポイントです。サバの切り身なら1cm角程度にカット。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    良さそうな穴を見つける
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    テトラポッドの間にある暗い穴や隙間を探します。海面に近い位置で、潮が当たっている穴がベスト。穴の奥が暗くて見えないところほど、魚が隠れている可能性が高いです。海水が入っている穴を選びましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    仕掛けを穴に静かに落とす
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    穴の上からブラクリをそっと落とします。ベイルを起こして糸を出し、仕掛けの重さで自然に沈めます。途中で引っかかったら軽く揺すって奥まで落としましょう。底に着いたら糸を軽く張ります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    軽く誘ってアタリを待つ
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    仕掛けを底で2〜3回小さく上下に動かして（5〜10cm程度）魚にアピールします。その後10〜20秒ほどアタリを待ちます。根魚は穴の中でエサが来るのを待ち構えているので、反応がある場合はすぐにアタリが出ます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  6
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    アタリがあったら素早く抜き上げる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ゴツゴツ、ゴンゴンという明確なアタリがあったら、間髪入れずに竿を上げて合わせます。根魚は針がかりすると穴の奥に潜ろうとするので、もたもたしていると根に潜られて出てこなくなります。躊躇せず、一気に穴から引き出しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  7
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    反応がなければ次の穴へ移動
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ひとつの穴で20〜30秒待ってアタリがなければ、すぐに次の穴に移動します。穴釣りは「数撃ちゃ当たる」方式。たくさんの穴を探るほど釣果が上がります。テトラを移動しながらテンポよく探っていきましょう。
                  </p>
                </div>
              </li>
            </ol>

            <Hint>
              根魚は一度釣り上げた穴でも、しばらくすると別の魚が入ってくることがあります。時間を空けて同じ穴を再チェックするのも有効です。
            </Hint>
          </SectionCard>

          {/* 安全対策 */}
          <SectionCard title="安全対策（テトラでの注意点）" icon={ShieldAlert}>
            <Danger>
              テトラポッドは足場が不安定で滑りやすく、毎年転落事故が発生しています。安全対策を万全にして、無理のない範囲で楽しみましょう。
            </Danger>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-red-500">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    滑り止め付きの靴を必ず履く
                  </span>
                  <br />
                  スパイクシューズやフェルトスパイクが理想。スニーカーやサンダルは厳禁です。テトラの表面は海藻やコケで非常に滑りやすくなっています。
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-red-500">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    両手が使えるようにする
                  </span>
                  <br />
                  荷物はリュックやショルダーバッグに入れ、テトラを移動する際は必ず両手を空けましょう。竿は短いものを使い、口にくわえるか腰のホルダーに差して移動します。
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-red-500">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    悪天候時は絶対にやらない
                  </span>
                  <br />
                  雨の日はテトラが非常に滑りやすくなります。波が高い日や風が強い日も危険です。天候が悪化しそうな場合は早めに撤退しましょう。
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-red-500">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    単独行動は避ける
                  </span>
                  <br />
                  可能であれば2人以上で行動しましょう。単独の場合は、必ず家族や友人に行き先と帰宅予定時間を伝えてから出かけてください。
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-red-500">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    ライフジャケットを着用する
                  </span>
                  <br />
                  テトラからの転落に備えて、膨張式のライフジャケットを着用しましょう。万が一の際に命を守る最重要アイテムです。
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href="/safety"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                釣りの安全ガイドを詳しく見る
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
            </div>
          </SectionCard>

          {/* 釣れる魚 */}
          <SectionCard title="穴釣りで釣れる魚" icon={Fish}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">カサゴ（ガシラ）</h3>
                  <Badge variant="secondary" className="text-xs">
                    穴釣りの主役
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  穴釣りの代表的なターゲット。赤褐色の体に斑点模様が特徴的な根魚です。岩やテトラの隙間に住み着いており、エサが来ると素早く食いつきます。最大30cm程度になり、煮付けや唐揚げ、味噌汁にすると抜群に美味しい魚です。年中釣れますが、特に秋〜冬が狙い目。15cm以下の小さなカサゴはリリースして資源を守りましょう。
                </p>
                <Link
                  href="/fish/kasago"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  カサゴの詳細を見る
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">メバル</h3>
                  <Badge variant="secondary" className="text-xs">
                    冬〜春がベスト
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  大きな目が特徴の根魚で、「春告げ魚」とも呼ばれます。カサゴに比べてやや上の層（中層〜底層）にいることが多く、穴の入り口付近で釣れることもあります。煮付けが定番料理で、上品な白身が楽しめます。シーズンは11月〜4月で、特に冬から早春にかけてが最盛期。メバリング（ルアーでメバルを狙う釣り）にステップアップする人も多いです。
                </p>
                <Link
                  href="/fish/mebaru"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  メバルの詳細を見る
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  その他にもこんな魚が釣れることも
                </p>
                <p className="mt-1">
                  ソイ、アイナメ、ハタ類、ベラ、タケノコメバル、ムラソイなど。穴の中にはさまざまな魚が潜んでいます。大物が釣れたときの興奮はたまりません。
                </p>
              </div>
            </div>
          </SectionCard>

          {/* 釣果アップのコツ */}
          <SectionCard title="釣果アップのコツ" icon={Lightbulb}>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    とにかく多くの穴を探る
                  </span>
                  <br />
                  穴釣りは「ラン&ガン」スタイル。ひとつの穴に固執せず、アタリがなければ20〜30秒で次の穴に移動しましょう。100個の穴を探れば必ず魚に出会えます。テンポよく穴から穴へ移動するのが釣果アップの最大のコツです。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    暗くて深い穴を選ぶ
                  </span>
                  <br />
                  根魚は暗い場所を好みます。テトラの隙間でも、奥が見えないような暗い穴ほど有望。海面に近く、潮が出入りしている穴はさらに期待大。逆に、浅くて明るい穴には魚がいない可能性が高いです。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    合わせは即座に、力強く
                  </span>
                  <br />
                  根魚はエサを咥えるとすぐに穴の奥に潜ろうとします。ゴツッというアタリを感じたら、0.5秒以内に竿を上げて合わせましょう。一瞬の迷いが根掛かり（根に潜られること）を招きます。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    潮位が高い時間帯を狙う
                  </span>
                  <br />
                  満潮前後はテトラの穴に海水がたっぷり入り、魚の活性が上がります。干潮時は穴が干上がって魚がいないこともあるので、潮位が高い時間帯を選んで釣行しましょう。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    エサを変えてみる
                  </span>
                  <br />
                  イソメで反応がなければ、オキアミやサバの切り身に変えてみましょう。日によって魚の好みが変わることがあります。複数のエサを用意しておくと対応力が上がります。
                </div>
              </li>
            </ul>
          </SectionCard>

          {/* おすすめスポット */}
          <SectionCard title="おすすめスポット" icon={MapPin}>
            <p className="mb-4 text-sm text-muted-foreground">
              テトラポッドが設置されている堤防や漁港が穴釣りの主なフィールドです。岩場でも隙間があれば穴釣りが楽しめます。初心者は足場の良い場所から始めましょう。
            </p>

            {anazuriSpots.length > 0 && (
              <div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {anazuriSpots.map((spot) => (
                    <Link
                      key={spot.id}
                      href={`/spots/${spot.slug}`}
                      className="group flex items-center gap-2 rounded-lg border p-3 transition-colors hover:border-primary"
                    >
                      <MapPin className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium group-hover:text-primary">
                          {spot.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {spot.region.prefecture} {spot.region.areaName}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/spots">
                      すべてのスポットを見る
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </SectionCard>

          {/* よくある質問 */}
          <SectionCard title="よくある質問（FAQ）" icon={HelpCircle}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. 穴釣りにはどんな竿が必要ですか？
                </h3>
                <p className="text-sm text-muted-foreground">
                  1〜1.5mの短い穴釣り専用ロッドが最適です。テトラの上で取り回しやすい短さが重要。コンパクトロッドや安価な竿でも代用できます。高価な竿は不要で、1,000〜3,000円程度のもので十分です。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. 穴釣りで使うエサは何がいい？
                </h3>
                <p className="text-sm text-muted-foreground">
                  青イソメが最も万能です。他にはオキアミ、サバの切り身、鶏のささみなども効果があります。根魚は雑食性が強いので、さまざまなエサで反応します。虫エサが苦手な方は、パワーイソメなどの人工エサも使えます。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. 穴釣りのベストシーズンはいつですか？
                </h3>
                <p className="text-sm text-muted-foreground">
                  穴釣りは年中楽しめるのが大きな魅力です。特に秋から冬（10〜2月）がベストシーズンで、
                  <Link
                    href="/fish/kasago"
                    className="text-primary hover:underline"
                  >
                    カサゴ
                  </Link>
                  や
                  <Link
                    href="/fish/mebaru"
                    className="text-primary hover:underline"
                  >
                    メバル
                  </Link>
                  の活性が高くなります。他の釣りが難しくなる冬場でも釣果が期待できる貴重な釣り方です。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. テトラポッドでの穴釣りは危険ですか？
                </h3>
                <p className="text-sm text-muted-foreground">
                  テトラポッドは足場が不安定で、滑りやすいため注意が必要です。滑り止め付きのスパイクシューズを履き、両手が使えるようリュックタイプのバッグを使いましょう。雨の日や波が高い日は絶対に避けること。詳しくは
                  <Link
                    href="/safety"
                    className="text-primary hover:underline"
                  >
                    安全ガイド
                  </Link>
                  をご覧ください。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. ブラクリ仕掛けは何号がおすすめ？
                </h3>
                <p className="text-sm text-muted-foreground">
                  3〜5号が標準です。穴が小さい場合は3号、やや広い穴や潮の流れがある場所では5号を使います。最初は3号と5号を1つずつ用意しておけば対応できます。根掛かりでロストすることもあるので、予備を2〜3個持っていきましょう。
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* 道具を揃えるなら */}
        <section className="mt-8 sm:mt-10">
          <ProductList
            products={getProductsByMethod("anazuri")}
            title="穴釣りに必要な道具"
            description="穴釣りを始めるなら、まずはブラクリ仕掛けと短い竿を揃えましょう。"
          />
        </section>

        {/* 関連ガイド */}
        <section className="mt-8 sm:mt-10">
          <h2 className="mb-4 text-center text-xl font-bold">
            関連ガイド
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guide/sabiki" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Anchor className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    サビキ釣り完全ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    堤防でアジ・サバを釣るサビキ入門
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/beginner" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Fish className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    釣り初心者完全ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    釣りの基本から道具選びまで完全網羅
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            穴釣りができるスポットを探してみよう
          </p>
          <Button asChild size="lg" className="min-h-[48px] rounded-full px-8">
            <Link href="/spots">スポットを探す</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
