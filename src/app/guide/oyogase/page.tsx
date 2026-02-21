import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Fish, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "泳がせ釣り入門ガイド - 生きエサで大物を狙う方法",
  description:
    "泳がせ釣り（のませ釣り）の完全ガイド。サビキで釣ったアジやイワシを生きエサにして、ヒラメ・シーバス・ブリなどの大型魚を狙う方法を解説。仕掛け、タックル、エサの付け方、やり取りのコツまで初心者向けに紹介。",
  openGraph: {
    title: "泳がせ釣り入門ガイド - 生きエサで大物を狙う方法",
    description:
      "サビキで釣った小魚を生きエサにして大物を狙う泳がせ釣りの方法を初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/guide/oyogase",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/oyogase",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
    { "@type": "ListItem", position: 2, name: "釣りの始め方ガイド", item: "https://tsurispot.com/guide" },
    { "@type": "ListItem", position: 3, name: "泳がせ釣り入門ガイド", item: "https://tsurispot.com/guide/oyogase" },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "泳がせ釣りの始め方",
  description: "サビキで釣った小魚を生きエサにして大型魚を狙う泳がせ釣りの方法を解説。",
  totalTime: "PT4H",
  supply: [
    { "@type": "HowToSupply", name: "生きエサ（アジ・イワシなど）" },
    { "@type": "HowToSupply", name: "泳がせ用仕掛け（ハリス5〜8号）" },
    { "@type": "HowToSupply", name: "活かしバケツ" },
  ],
  tool: [
    { "@type": "HowToTool", name: "磯竿3〜4号 4.5〜5.3m またはシーバスロッド" },
    { "@type": "HowToTool", name: "中型スピニングリール 3000〜4000番" },
  ],
  step: [
    { "@type": "HowToStep", name: "エサを確保する", text: "まずサビキ釣りでアジやイワシなどの小魚を確保。活かしバケツでエアレーションして生かしておく。" },
    { "@type": "HowToStep", name: "仕掛けをセットする", text: "泳がせ用の仕掛けをセット。エレベーター式・ウキ式・ぶっこみ式から選ぶ。" },
    { "@type": "HowToStep", name: "エサを付けて投入", text: "アジの背中や鼻にハリを掛け、そっと投入。エサが弱らないよう丁寧に扱う。" },
    { "@type": "HowToStep", name: "アタリを待つ", text: "竿先の変化やドラグの音に注意。最初のアタリで合わせず、しっかり食い込むまで待つ。" },
    { "@type": "HowToStep", name: "やり取りと取り込み", text: "大物がかかったら慌てずドラグを利かせてやり取り。タモ網で取り込む。" },
  ],
};

export default function OyogasePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      {/* パンくず */}
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">ホーム</Link>
        <span className="mx-1">/</span>
        <Link href="/guide" className="hover:text-primary">ガイド</Link>
        <span className="mx-1">/</span>
        <span>泳がせ釣り</span>
      </nav>

      <Link href="/guide" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        ガイド一覧に戻る
      </Link>

      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
        泳がせ釣り入門ガイド
      </h1>
      <p className="mb-8 text-sm text-muted-foreground sm:text-base">
        サビキで釣ったアジやイワシをそのまま生きエサに！
        ヒラメ・シーバス・ブリクラスの大物が堤防から狙える、ロマン溢れる釣り方です。
      </p>

      {/* なぜおすすめ？ */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">泳がせ釣りがおすすめな理由</h2>
        <Card className="border-green-200 bg-green-50/50 py-0">
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                <span><strong>サビキ釣りの延長で大物が狙える</strong> — サビキで釣ったアジをそのまま使うので、追加の餌代がほぼゼロ</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                <span><strong>生きエサの食わせ力は最強</strong> — ルアーでは食わない魚も、本物の魚には反応する。食い渋りの日でも釣果が出やすい</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                <span><strong>テクニック不要で待つだけ</strong> — エサを投入したらあとは待つだけ。ルアーのアクション技術は不要</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                <span><strong>堤防からでも大型が狙える</strong> — ヒラメ60cm、シーバス80cm、ブリ(メジロ)クラスも現実的なターゲット</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 狙える魚 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">泳がせ釣りで狙える魚</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { name: "ヒラメ", slug: "hirame", desc: "砂地底の高級魚" },
            { name: "シーバス", slug: "seabass", desc: "港湾・河口で狙える" },
            { name: "ブリ・イナダ", slug: "buri", desc: "回遊次第で大物" },
            { name: "マゴチ", slug: "magochi", desc: "砂底のフラットフィッシュ" },
            { name: "アオリイカ", slug: "aoriika", desc: "ウキ泳がせで狙う" },
            { name: "ハタ類", slug: "hata", desc: "根周りの高級根魚" },
          ].map((fish) => (
            <Link key={fish.slug} href={`/fish/${fish.slug}`} className="group">
              <Card className="h-full py-0 transition-shadow hover:shadow-md">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Fish className="size-4 text-blue-500" />
                    <span className="text-sm font-bold group-hover:text-primary">{fish.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{fish.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 必要なタックル */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">必要なタックル・道具</h2>
        <Card className="py-0">
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-4 font-semibold">道具</th>
                    <th className="pb-2 font-semibold">おすすめスペック</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">竿</td>
                    <td className="py-2.5">磯竿3〜4号 4.5〜5.3m（万能竿でもOK）</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">リール</td>
                    <td className="py-2.5">中型スピニング 3000〜4000番（ドラグ性能重視）</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">道糸</td>
                    <td className="py-2.5">ナイロン4〜5号 または PE1.5〜2号</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">ハリス</td>
                    <td className="py-2.5">フロロカーボン 5〜8号（1〜1.5m）</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">ハリ</td>
                    <td className="py-2.5">チヌ針4〜6号 or 泳がせ専用針</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">活かしバケツ</td>
                    <td className="py-2.5">エアポンプ付き（エサを元気に保つため必須）</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">タモ網</td>
                    <td className="py-2.5">5m以上の柄が理想（堤防の高さに合わせる）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 仕掛けの種類 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">泳がせ釣りの仕掛け3タイプ</h2>
        <div className="space-y-4">
          <Card className="border-blue-200 py-0">
            <CardContent className="p-4 sm:p-6">
              <h3 className="mb-2 text-base font-bold text-blue-800">1. ウキ泳がせ式（初心者おすすめ）</h3>
              <p className="mb-2 text-sm text-gray-700">
                大きめのウキを使ってエサの動きを目視で確認できる方式。アタリが一目でわかるので初心者に最適。
                タナ（水深）の調整も自由にできます。
              </p>
              <p className="text-xs text-muted-foreground">
                おすすめ状況：中層を回遊するシーバスやブリ系、アオリイカ狙い
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 py-0">
            <CardContent className="p-4 sm:p-6">
              <h3 className="mb-2 text-base font-bold text-green-800">2. エレベーター式（万能型）</h3>
              <p className="mb-2 text-sm text-gray-700">
                オモリを先に投入してから、スナップサルカンにエサ付き仕掛けを後付けして道糸を滑らせて送り込む方式。
                エサを弱らせずに遠くのポイントまで送れるのが最大の利点。
              </p>
              <p className="text-xs text-muted-foreground">
                おすすめ状況：テトラ際や沖のポイントを狙う場合。ヒラメ・マゴチに有効
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 py-0">
            <CardContent className="p-4 sm:p-6">
              <h3 className="mb-2 text-base font-bold text-amber-800">3. ぶっこみ式（シンプル）</h3>
              <p className="mb-2 text-sm text-gray-700">
                中通しオモリとハリだけのシンプルな仕掛け。エサを底付近で泳がせる。
                仕掛けが最もシンプルなのでトラブルが少なく、ヒラメ・マゴチなどの底物に特化。
              </p>
              <p className="text-xs text-muted-foreground">
                おすすめ状況：砂底の堤防でヒラメ・マゴチを狙う場合
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* エサの付け方 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">エサの付け方</h2>
        <Card className="py-0">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="space-y-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm font-bold text-blue-900">鼻掛け（おすすめ）</p>
                <p className="mt-1 text-xs text-blue-800">
                  アジの鼻の穴にハリを通す方法。エサが自然に泳ぎやすく長持ちする。最も一般的な付け方。
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-sm font-bold text-green-900">背掛け</p>
                <p className="mt-1 text-xs text-green-800">
                  背ビレの下にハリを刺す方法。エサが暴れにくく、フッキング率が高い。ただし弱りやすい。
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-sm font-bold text-amber-900">尾掛け</p>
                <p className="mt-1 text-xs text-amber-800">
                  尾ビレの付け根にハリを刺す方法。エサが逃げようと必死に泳ぐためアピール力大。ただし外れやすい。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 釣り方のコツ */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">泳がせ釣りのコツ</h2>
        <Card className="border-amber-200 bg-amber-50/30 py-0">
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">1.</span>
                <span><strong>エサは元気なものを使う</strong> — 弱ったエサは大型魚の反応が悪い。こまめにエサを交換し、活かしバケツの水も定期的に入れ替える</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">2.</span>
                <span><strong>最初のアタリで合わせない</strong> — 大型魚はまずエサを咥えて走り、止まってから飲み込む。「走って止まった」タイミングで大きく合わせる</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">3.</span>
                <span><strong>ドラグは緩めにセット</strong> — 大物がかかった時にラインが切れないよう、ドラグは手で引っ張ってジワッと出るくらいに設定</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">4.</span>
                <span><strong>サビキ竿と泳がせ竿を2本出す</strong> — サビキでエサを確保しながら、もう1本で泳がせ。効率的に釣果を上げるコツ</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">5.</span>
                <span><strong>朝マズメ・夕マズメが最もチャンス</strong> — フィッシュイーターの活性が上がる時間帯。この時間にエサが準備できているように逆算する</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 注意点 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">注意点</h2>
        <Card className="border-red-200 bg-red-50/30 py-0">
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <span><strong>タモ網は必ず用意する</strong> — 大物は抜き上げると竿が折れるかラインが切れます</span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <span><strong>置き竿にする場合はドラグフリーで</strong> — 突然の大物に竿ごと海に引き込まれる事故があります。尻手ロープも必須</span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <span><strong>周囲の釣り人に配慮</strong> — エサが横に走って隣の方の仕掛けと絡むことがあるので、混雑時は控えめに</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 関連ガイド */}
      <div className="rounded-xl border bg-muted/30 p-6">
        <h2 className="mb-4 text-lg font-bold">関連ガイド</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guide/sabiki" className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md">
            <p className="font-semibold group-hover:text-primary">サビキ釣りガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">エサ確保の基本</p>
          </Link>
          <Link href="/guide/rigs" className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md">
            <p className="font-semibold group-hover:text-primary">仕掛け図解ガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">基本仕掛けの作り方</p>
          </Link>
          <Link href="/guide/handling" className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md">
            <p className="font-semibold group-hover:text-primary">魚の締め方ガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">大物を美味しく持ち帰る</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
