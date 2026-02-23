import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Info, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "おもりの種類と選び方 完全ガイド - 形・重さ・素材で釣果が変わる！",
  description:
    "ナス型・中通し・ガン玉・天秤・ブラクリなど12種類のおもりを徹底解説。釣り方別のおすすめおもり早見表、号数とグラムの換算表つき。初心者でも迷わないおもり選びの決定版。",
  openGraph: {
    title: "おもりの種類と選び方 完全ガイド",
    description:
      "形・重さ・素材で釣果が変わる！釣り方に合ったおもり選びを12種類のおもり図鑑で解説。",
    type: "article",
    url: "https://tsurispot.com/guide/sinker",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/sinker",
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
      name: "おもりの種類と選び方",
      item: "https://tsurispot.com/guide/sinker",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "おもりが重すぎるとどうなる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "おもりが重すぎると、竿に過度な負担がかかり折れる原因になります。また、仕掛けの動きが不自然になり魚の食いが悪くなります。ウキ釣りの場合はウキが沈んでしまい、アタリが取れなくなります。竿の適合オモリ号数を必ず確認しましょう。",
      },
    },
    {
      "@type": "Question",
      name: "潮が速い時はどうする？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "潮が速い時は通常より1〜2段階重いおもりに変更します。例えばサビキ釣りで普段8号を使っているなら10〜12号に上げます。また、流線型のおもり（ナス型など）は潮の抵抗を受けにくいので有効です。船釣りでは周囲と号数を揃えるのがマナーです。",
      },
    },
    {
      "@type": "Question",
      name: "ガン玉の付け方のコツは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ガン玉はラインの上に置き、割れ目にラインを挟んでからペンチや専用ツールで軽く潰して固定します。強く潰しすぎるとラインを傷つけるので注意。外す時は割れ目にツメを入れて開くか、ガン玉外し専用ツールを使います。ゴム張りガン玉ならラインを傷つけにくくおすすめです。",
      },
    },
    {
      "@type": "Question",
      name: "鉛のおもりは環境に悪い？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "鉛は有害な重金属であり、水中に残ると環境汚染の原因になります。海外では釣り用鉛おもりの使用が規制されている地域もあります。環境に配慮するなら、タングステンや鉄製のおもりを選ぶのも一つの方法です。また、根掛かりでおもりをロストしないよう工夫することも大切です。",
      },
    },
    {
      "@type": "Question",
      name: "おもりの号数とグラムの換算方法は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "おもりの1号は3.75グラムです。これは日本の尺貫法の「匁（もんめ）」に由来します。計算しやすい目安として、4号=15g、8号=30g、10号=37.5gと覚えておくと便利です。ガン玉はB=0.55g、2B=0.75g、3B=0.95gで、号数のおもりとは別体系です。",
      },
    },
  ],
};

// おもりの号数→グラム換算データ
const SINKER_WEIGHT_DATA = [
  { gou: "1", g: 3.75 },
  { gou: "2", g: 7.5 },
  { gou: "3", g: 11.25 },
  { gou: "4", g: 15 },
  { gou: "5", g: 18.75 },
  { gou: "6", g: 22.5 },
  { gou: "8", g: 30 },
  { gou: "10", g: 37.5 },
  { gou: "12", g: 45 },
  { gou: "15", g: 56.25 },
  { gou: "20", g: 75 },
  { gou: "25", g: 93.75 },
  { gou: "30", g: 112.5 },
  { gou: "40", g: 150 },
  { gou: "50", g: 187.5 },
  { gou: "60", g: 225 },
  { gou: "80", g: 300 },
];

// ガン玉の換算データ
const GANDAMA_DATA = [
  { name: "G8（ジンタン8号）", g: 0.07 },
  { name: "G7（ジンタン7号）", g: 0.09 },
  { name: "G6（ジンタン6号）", g: 0.12 },
  { name: "G5（ジンタン5号）", g: 0.16 },
  { name: "G4（ジンタン4号）", g: 0.2 },
  { name: "G3（ジンタン3号）", g: 0.25 },
  { name: "G2（ジンタン2号）", g: 0.31 },
  { name: "G1（ジンタン1号）", g: 0.4 },
  { name: "B", g: 0.55 },
  { name: "2B", g: 0.75 },
  { name: "3B", g: 0.95 },
  { name: "4B", g: 1.2 },
  { name: "5B", g: 1.75 },
  { name: "6B", g: 2.65 },
];

// おもりの種類データ
const SINKER_TYPES = [
  {
    id: 1,
    name: "ナス型おもり（六角おもり）",
    shape: "ナスの実のような涙滴型。六角形の断面を持つタイプもある。底面が平らで安定性が高い。",
    fishing: "サビキ釣り（カゴ下）、ちょい投げ、胴付き仕掛け、ヘチ釣り",
    weight: "1〜30号（サビキなら6〜10号が標準）",
    pros: ["最も安価で入手しやすい", "汎用性が高くどんな釣りにも使える", "六角タイプは転がりにくい"],
    cons: ["投げ釣りでは飛距離が出にくい", "根掛かりしやすい形状", "潮に流されやすい"],
    color: "border-gray-300",
    bgColor: "bg-gray-50",
  },
  {
    id: 2,
    name: "中通しおもり（丸型・ナツメ型）",
    shape: "丸型やナツメ（楕円）型で、中心に穴が空いており道糸を通して使う。",
    fishing: "ぶっこみ釣り、ミャク釣り、泳がせ釣りの遊動仕掛け",
    weight: "1〜30号（ぶっこみなら10〜20号）",
    pros: ["魚がエサを咥えた時に違和感が少ない（遊動式）", "道糸に通すだけで簡単にセット可能", "底物狙いに最適"],
    cons: ["糸ヨレが起きやすい", "サルカンで止める必要がある", "横風に弱い"],
    color: "border-amber-300",
    bgColor: "bg-amber-50",
  },
  {
    id: 3,
    name: "ガン玉（ジンタン）",
    shape: "小さな球形で、割れ目が入っている。ラインを挟んで潰して固定する。ジンタンはガン玉より小さいサイズの呼称。",
    fishing: "ウキ釣り（浮力調整）、フカセ釣り、ヘチ釣り、川釣り",
    weight: "G8（0.07g）〜6B（2.65g）",
    pros: ["微細な浮力調整が可能", "付け外しが簡単", "仕掛けの沈み方をコントロールできる"],
    cons: ["紛失しやすい（小さい）", "強く潰すとラインを傷つける", "重い仕掛けには不向き"],
    color: "border-green-300",
    bgColor: "bg-green-50",
  },
  {
    id: 4,
    name: "割りビシ",
    shape: "木の葉のような扁平形。ガン玉と同様に割れ目にラインを挟んで使う。",
    fishing: "ウキ釣り、渓流釣り、小物釣り",
    weight: "小〜大（0.3g〜1.5g程度）",
    pros: ["ガン玉より扁平で水の抵抗が少ない", "流れの中で仕掛けが安定する", "付け外しが容易"],
    cons: ["号数体系がメーカーで異なる", "大きいサイズが少ない", "ガン玉ほど種類が豊富でない"],
    color: "border-teal-300",
    bgColor: "bg-teal-50",
  },
  {
    id: 5,
    name: "天秤おもり（L型天秤）",
    shape: "L字型の金属アームの先におもりがついた形。道糸側とハリス側を分離する構造。",
    fishing: "ちょい投げ、投げ釣り全般",
    weight: "5〜15号（ちょい投げ）、15〜30号（本格投げ釣り）",
    pros: ["仕掛けが絡みにくい（道糸とハリスを分離）", "アタリが竿先に直接伝わる", "投げ釣りの定番"],
    cons: ["仕掛けが大きくなる", "魚がエサを咥えた時に違和感を与えやすい", "足元の釣りには不向き"],
    color: "border-blue-300",
    bgColor: "bg-blue-50",
  },
  {
    id: 6,
    name: "ジェット天秤",
    shape: "天秤にプラスチック製のウイング（羽）がついた形状。回収時に浮き上がる特性を持つ。",
    fishing: "投げ釣り（砂浜メイン）、ちょい投げ",
    weight: "8〜30号",
    pros: ["回収時に浮き上がるので根掛かりしにくい", "海藻帯や岩場混じりのポイントで有効", "飛距離が出る"],
    cons: ["潮が速い場所では流されやすい", "転がりやすくポイントが定まりにくい", "仕掛けを動かさず置いておく釣りには不向き"],
    color: "border-sky-300",
    bgColor: "bg-sky-50",
  },
  {
    id: 7,
    name: "カゴ付きおもり（下カゴ）",
    shape: "おもりの中にコマセ（撒き餌）を入れるカゴが一体になった形。網目から餌が出る。",
    fishing: "サビキ釣り",
    weight: "6〜12号",
    pros: ["おもりとコマセカゴが一体で仕掛けがシンプル", "コマセが効率よく拡散する", "初心者でも使いやすい"],
    cons: ["カゴ部分が壊れると使えない", "おもりの重さ調整ができない", "ナス型+別カゴより割高な場合がある"],
    color: "border-emerald-300",
    bgColor: "bg-emerald-50",
  },
  {
    id: 8,
    name: "ホゴおもり（棒おもり）",
    shape: "細長い棒状のおもり。上部にサルカンが付いているものが多い。",
    fishing: "船釣り（胴付き仕掛け）、カワハギ釣り、タコ釣り",
    weight: "20〜100号（船釣りの水深・潮で変わる）",
    pros: ["細長い形状で潮の抵抗が少ない", "仕掛けが真っ直ぐ落ちやすい", "船釣りの胴付き仕掛けの定番"],
    cons: ["堤防釣りではあまり使わない", "重いものが多い", "根掛かりすると回収が難しい"],
    color: "border-indigo-300",
    bgColor: "bg-indigo-50",
  },
  {
    id: 9,
    name: "タル付きおもり",
    shape: "おもりにサルカン（ヨリモドシ）が一体化した形状。タル型サルカンが上下に付いている。",
    fishing: "胴付き仕掛け、ちょい投げ、カゴ釣り",
    weight: "3〜20号",
    pros: ["サルカン一体で糸ヨレを防ぐ", "仕掛けの接続が楽", "スイベル機能で絡みにくい"],
    cons: ["サルカン部分が壊れると使えない", "単体のおもりより割高", "重いサイズは選択肢が少ない"],
    color: "border-violet-300",
    bgColor: "bg-violet-50",
  },
  {
    id: 10,
    name: "ブラクリ",
    shape: "赤いおもりに針が直結された一体型仕掛け。目立つ赤色で魚の興味を引く。",
    fishing: "穴釣り（テトラポッド・岩の隙間）",
    weight: "2〜5号（3号が標準）",
    pros: ["おもりと針が一体でセットが超簡単", "赤い色が魚にアピール", "穴釣り専用で根魚に効果抜群"],
    cons: ["穴釣り以外では使いにくい", "針が1本なので掛け損ねやすい", "根掛かりでロストしやすい"],
    color: "border-red-300",
    bgColor: "bg-red-50",
  },
  {
    id: 11,
    name: "タングステンシンカー",
    shape: "様々な形状あり（バレット型、ラウンド型、スティック型など）。鉛より小さく高密度。",
    fishing: "バス釣り（テキサスリグ等）、ロックフィッシュ、チニング",
    weight: "1/16oz（1.8g）〜1oz（28g）",
    pros: ["鉛の約1.7倍の比重で小さく感度が良い", "硬いので底質の変化がわかりやすい", "根掛かりしにくい（すり抜けが良い）", "環境に優しい"],
    cons: ["鉛の3〜5倍の価格", "硬いためラインを傷つけることがある", "ロストすると金銭的ダメージが大きい"],
    color: "border-orange-300",
    bgColor: "bg-orange-50",
  },
  {
    id: 12,
    name: "テンヤ",
    shape: "おもりと大きな針が一体化した和製ルアー。エサ（イワシ・エビ等）を針金やワイヤーで固定して使う。",
    fishing: "タチウオテンヤ（船）、一つテンヤマダイ、タコテンヤ",
    weight: "タチウオ用：30〜60号 / マダイ用：3〜15号",
    pros: ["おもりと針一体でシンプル", "エサの動きが自然でアピール力が高い", "ダイレクトな引きを楽しめる"],
    cons: ["専用タックルが必要な場合が多い", "エサの付け方にコツがいる", "船釣りが中心で堤防では使いにくい"],
    color: "border-pink-300",
    bgColor: "bg-pink-50",
  },
];

// 釣り方別おすすめおもりデータ
const METHOD_SINKER_DATA = [
  { method: "サビキ釣り", sinker: "ナス型 or カゴ付き", weight: "6〜10号", point: "足元に沈めるだけ。カゴ付きならコマセも一緒に入れられて便利。" },
  { method: "ちょい投げ", sinker: "ナス型 or L型天秤", weight: "5〜10号", point: "20〜40m投げる。天秤を使うと仕掛けが絡みにくい。" },
  { method: "投げ釣り", sinker: "ジェット天秤", weight: "15〜30号", point: "遠投が必要。根掛かり軽減のためジェット天秤が有利。" },
  { method: "ウキ釣り", sinker: "ガン玉", weight: "B〜3B", point: "ウキの浮力に合わせて微調整。数個に分けて打つのがコツ。" },
  { method: "ぶっこみ釣り", sinker: "中通し（丸型）", weight: "10〜20号", point: "遊動式でアタリを逃さない。潮の速さで重さを調整。" },
  { method: "穴釣り", sinker: "ブラクリ", weight: "2〜5号", point: "針一体型で隙間に落とすだけ。3号が最も汎用的。" },
  { method: "船釣り", sinker: "ホゴおもり", weight: "30〜80号", point: "水深と潮に合わせる。船長の指示号数に従うのが鉄則。" },
  { method: "バス釣り", sinker: "タングステン", weight: "1/8〜1/2oz", point: "感度重視ならタングステン一択。テキサスリグやダウンショットに。" },
];

// 素材比較データ
const MATERIAL_DATA = [
  { name: "鉛（なまり）", density: "11.3", price: "安い", feel: "柔らかい", eco: "有害", note: "最も一般的。柔らかいため加工しやすく安価。" },
  { name: "タングステン", density: "19.3", price: "高い", feel: "硬い", eco: "無害", note: "鉛の1.7倍の比重。感度が良く環境にも優しい。" },
  { name: "鉄（アイアン）", density: "7.9", price: "安い", feel: "硬い", eco: "無害", note: "鉛より軽い分サイズが大きくなる。環境対応品に使用。" },
];

export default function SinkerGuidePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "初心者ガイド", href: "/guide" },
          { label: "おもりの種類と選び方" },
        ]}
      />
      <Link
        href="/guide"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        ガイド一覧に戻る
      </Link>

      {/* ヒーロー */}
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
        おもりの種類と選び方 完全ガイド
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
        形・重さ・素材で釣果が変わる！釣り方に合ったおもり選びを解説します。初心者が迷わない号数の見方から、12種類のおもりの特徴と使い分けまで。
      </p>

      {/* セクション1: おもりの基本 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">おもりの基本</h2>

        <Card className="mb-4 py-0">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 font-bold">おもりの3つの役割</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">沈める</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  仕掛けを水中の狙ったタナ（深さ）まで沈める
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">飛ばす</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  投げ釣りで遠くのポイントまで仕掛けを飛ばす
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">安定</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  潮の流れに負けず仕掛けを安定させる
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 号数の見方 */}
        <Card className="mb-4 py-0">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-2 font-bold">号数の見方</h3>
            <div className="mb-3 rounded-lg bg-amber-50 p-3">
              <p className="text-center text-lg font-bold text-amber-700">
                1号 = 3.75g（1匁）
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                日本の尺貫法の単位「匁（もんめ）」に由来。号数 x 3.75 = グラム数
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              覚えやすい目安：<strong>4号=15g</strong>、<strong>8号=30g</strong>、<strong>10号=37.5g</strong>。
              4号単位で覚えると暗算しやすいです。ガン玉だけは別の体系（B/G表記）を使います。
            </p>
          </CardContent>
        </Card>

        {/* 素材の違い */}
        <Card className="py-0">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 font-bold">素材の違い</h3>
            <div className="space-y-2">
              {MATERIAL_DATA.map((m) => (
                <div
                  key={m.name}
                  className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex items-center gap-2 sm:w-36 shrink-0">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {m.name}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      比重 <strong>{m.density}</strong> / 価格{m.price} / 感触{m.feel} / 環境{m.eco}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* セクション2: おもりの種類一覧 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">おもりの種類一覧（12種類）</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          形状・使い方・メリデメをそれぞれ解説。自分の釣り方に合ったおもりを見つけましょう。
        </p>

        <div className="space-y-4">
          {SINKER_TYPES.map((sinker) => (
            <Card key={sinker.id} className={`${sinker.color} py-0`}>
              <CardContent className="p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {sinker.id}
                  </span>
                  <h3 className="text-lg font-bold">{sinker.name}</h3>
                </div>

                <div className="mb-3 space-y-2">
                  <div className={`rounded-lg ${sinker.bgColor} p-3`}>
                    <p className="text-sm">
                      <span className="font-medium">形状の特徴：</span>
                      {sinker.shape}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <p className="font-medium">使う釣り方</p>
                      <p className="text-muted-foreground">{sinker.fishing}</p>
                    </div>
                    <div>
                      <p className="font-medium">号数の目安</p>
                      <p className="text-muted-foreground">{sinker.weight}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-sm font-medium text-green-700">メリット</p>
                    <ul className="ml-4 list-disc text-sm text-muted-foreground">
                      {sinker.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-red-700">デメリット</p>
                    <ul className="ml-4 list-disc text-sm text-muted-foreground">
                      {sinker.cons.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* セクション3: 釣り方別おすすめおもり早見表 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">釣り方別おすすめおもり早見表</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          釣り方ごとに最適なおもりを一覧にしました。迷ったらここを参考にしてください。
        </p>

        {/* モバイル対応のgridテーブル */}
        <Card className="py-0">
          <CardContent className="p-0">
            {/* ヘッダー（PC） */}
            <div className="hidden border-b bg-muted/50 sm:grid sm:grid-cols-4 sm:gap-2 sm:px-4 sm:py-3">
              <p className="text-sm font-bold">釣り方</p>
              <p className="text-sm font-bold">おすすめおもり</p>
              <p className="text-sm font-bold">号数目安</p>
              <p className="text-sm font-bold">ポイント</p>
            </div>
            {/* データ行 */}
            <div className="divide-y">
              {METHOD_SINKER_DATA.map((row) => (
                <div
                  key={row.method}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-4 sm:items-center sm:gap-2"
                >
                  <div>
                    <span className="sm:hidden text-xs font-medium text-muted-foreground">釣り方: </span>
                    <Badge variant="outline" className="text-xs">
                      {row.method}
                    </Badge>
                  </div>
                  <div>
                    <span className="sm:hidden text-xs font-medium text-muted-foreground">おもり: </span>
                    <span className="text-sm font-medium">{row.sinker}</span>
                  </div>
                  <div>
                    <span className="sm:hidden text-xs font-medium text-muted-foreground">号数: </span>
                    <span className="text-sm text-primary font-medium">{row.weight}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{row.point}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* セクション4: FAQ */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">よくある質問</h2>
        <div className="space-y-3">
          <Card className="py-0">
            <CardContent className="p-4 sm:p-5">
              <h3 className="mb-2 font-bold text-foreground">
                Q. おもりが重すぎるとどうなる？
              </h3>
              <p className="text-sm text-muted-foreground">
                竿に過度な負担がかかり、最悪の場合折れる原因になります。また、仕掛けの動きが不自然になり魚の食いが悪くなります。ウキ釣りの場合はウキが沈んでしまい、アタリが取れなくなります。<strong>竿に記載されている「適合オモリ号数」を必ず確認しましょう。</strong>
              </p>
            </CardContent>
          </Card>
          <Card className="py-0">
            <CardContent className="p-4 sm:p-5">
              <h3 className="mb-2 font-bold text-foreground">
                Q. 潮が速い時はどうする？
              </h3>
              <p className="text-sm text-muted-foreground">
                通常より<strong>1〜2段階重いおもりに変更</strong>します。例えばサビキ釣りで普段8号を使っているなら10〜12号に上げます。流線型のおもり（ナス型など）は潮の抵抗を受けにくいので有効です。船釣りでは周囲の人とおもりの号数を揃えるのがマナーです（おまつり防止）。
              </p>
            </CardContent>
          </Card>
          <Card className="py-0">
            <CardContent className="p-4 sm:p-5">
              <h3 className="mb-2 font-bold text-foreground">
                Q. ガン玉の付け方のコツは？
              </h3>
              <p className="text-sm text-muted-foreground">
                ラインの上にガン玉を置き、割れ目にラインを挟んでから<strong>ペンチや専用ツールで軽く潰して固定</strong>します。強く潰しすぎるとラインが傷つくので注意。外す時は割れ目にツメを入れて開くか、専用のガン玉外しを使います。<strong>ゴム張りガン玉</strong>ならラインを傷つけにくくおすすめです。
              </p>
            </CardContent>
          </Card>
          <Card className="py-0">
            <CardContent className="p-4 sm:p-5">
              <h3 className="mb-2 font-bold text-foreground">
                Q. 鉛のおもりは環境に悪い？
              </h3>
              <p className="text-sm text-muted-foreground">
                鉛は有害な重金属で、水中に残ると環境汚染の原因になります。海外では釣り用鉛おもりの使用が規制されている地域もあります。環境に配慮するなら<strong>タングステンや鉄製のおもりを選ぶ</strong>のも一つの方法です。また、根掛かりでおもりをロストしないよう工夫することも大切です。
              </p>
            </CardContent>
          </Card>
          <Card className="py-0">
            <CardContent className="p-4 sm:p-5">
              <h3 className="mb-2 font-bold text-foreground">
                Q. 号数とgの換算表が知りたい
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {/* おもり号数 → グラム換算表 */}
                <div>
                  <p className="mb-2 text-sm font-medium">おもり（号数 → グラム）</p>
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-2 gap-0 border-b bg-muted/50 px-3 py-1.5">
                      <p className="text-xs font-bold">号数</p>
                      <p className="text-xs font-bold text-right">重さ (g)</p>
                    </div>
                    <div className="divide-y">
                      {SINKER_WEIGHT_DATA.map((row) => (
                        <div key={row.gou} className="grid grid-cols-2 gap-0 px-3 py-1">
                          <p className="text-xs">{row.gou}号</p>
                          <p className="text-xs text-right font-medium text-primary">{row.g}g</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* ガン玉 → グラム換算表 */}
                <div>
                  <p className="mb-2 text-sm font-medium">ガン玉・ジンタン（名称 → グラム）</p>
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-2 gap-0 border-b bg-muted/50 px-3 py-1.5">
                      <p className="text-xs font-bold">名称</p>
                      <p className="text-xs font-bold text-right">重さ (g)</p>
                    </div>
                    <div className="divide-y">
                      {GANDAMA_DATA.map((row) => (
                        <div key={row.name} className="grid grid-cols-2 gap-0 px-3 py-1">
                          <p className="text-xs">{row.name}</p>
                          <p className="text-xs text-right font-medium text-green-700">{row.g}g</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    ※ ジンタン（G表記）は数字が大きいほど軽い。B表記は数字が大きいほど重い。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* おすすめのおもりセット */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">おすすめのおもりセット</h2>
        <Card className="border-blue-200 py-0">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Badge className="mb-2 bg-blue-600">初心者におすすめ</Badge>
                <h3 className="mb-1 font-bold">おもりセット（各種号数入り）</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  複数の号数がセットになったおもりセットなら、釣り場の状況に合わせて使い分けができます。サビキ釣り、ちょい投げ、ぶっこみ釣りなど、さまざまな釣り方に対応。最初の一つとしておすすめです。
                </p>
              </div>
              <a
                href="https://amzn.to/4cFGDbl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FF9900] px-6 py-3 text-sm font-bold text-white shadow transition-all hover:bg-[#e88b00] hover:shadow-md active:scale-95 min-h-[44px]"
              >
                <ExternalLink className="size-4" />
                Amazonで見る
              </a>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              ※ 上記はアフィリエイトリンクです。購入による追加費用は発生しません。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* セクション5: 関連ガイドへのリンク */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/guide/rigs">
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold hover:text-primary">仕掛けの種類</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  サビキ・ウキ・投げ・ルアーの5つの基本仕掛けを図解
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/guide/casting">
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold hover:text-primary">投げ釣りガイド</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  ちょい投げから本格投げ釣りまでの基本を解説
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/guide/float-fishing">
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold hover:text-primary">ウキ釣りガイド</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  ウキの種類と釣り方の基本をわかりやすく解説
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/guide/anazuri">
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold hover:text-primary">穴釣りガイド</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  ブラクリを使ったテトラ穴釣りの始め方
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* LINE登録バナー */}
      <div className="mt-8 sm:mt-12">
        <LineBanner variant="compact" />
      </div>
    </div>
  );
}
