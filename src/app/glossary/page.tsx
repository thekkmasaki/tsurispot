import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, Fish, Anchor, Waves, Moon, Cable } from "lucide-react";
import { GlossaryClient } from "./glossary-client";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "釣り用語集 - 初心者が知っておきたい釣りの基本用語",
  description:
    "釣り初心者が知っておきたい基本用語を50以上収録。釣法、仕掛け、魚の部位、潮汐関連など、カテゴリ別にわかりやすく解説します。",
  openGraph: {
    title: "釣り用語集 - 初心者が知っておきたい釣りの基本用語",
    description:
      "釣り初心者が知っておきたい基本用語を50以上収録。カテゴリ別にわかりやすく解説。",
    type: "article",
    url: "https://tsurispot.com/glossary",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/glossary",
  },
};

interface GlossaryTerm {
  term: string;
  reading?: string;
  description: string;
  link?: { href: string; label: string };
}

interface GlossaryCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  terms: GlossaryTerm[];
}

const glossaryData: GlossaryCategory[] = [
  {
    id: "basic",
    title: "基本用語",
    icon: <BookOpenText className="size-5 text-primary" />,
    terms: [
      { term: "ボウズ", description: "魚が1匹も釣れなかったこと。「オデコ」とも言う。" },
      { term: "坊主逃れ", reading: "ぼうずのがれ", description: "ボウズを避けるために、比較的釣れやすい魚を狙うこと。" },
      { term: "釣果", reading: "ちょうか", description: "釣りの成果・結果のこと。釣れた魚の種類や数量を指す。" },
      { term: "外道", reading: "げどう", description: "狙っていた魚以外の魚が釣れること。またはその魚。" },
      { term: "本命", reading: "ほんめい", description: "その日のメインターゲットとして狙っている魚のこと。" },
      { term: "入れ食い", reading: "いれぐい", description: "仕掛けを入れるたびに魚が釣れる、非常によく釣れている状態。" },
      { term: "バラす", description: "掛かった魚が針から外れて逃げてしまうこと。" },
      { term: "アタリ", description: "魚が餌やルアーに食いつき、竿先や糸に変化が出ること。「バイト」とも言う。" },
      { term: "アワセ", description: "アタリがあったときに竿を立てて針を魚に掛ける動作。「フッキング」とも言う。" },
      { term: "取り込み", reading: "とりこみ", description: "掛けた魚を最終的に手元まで引き寄せてキャッチすること。「ランディング」とも言う。" },
      { term: "根掛かり", reading: "ねがかり", description: "仕掛けやルアーが海底の岩やゴミに引っ掛かって動かなくなること。" },
      { term: "キャスト", description: "竿を振って仕掛けやルアーを投げる動作のこと。" },
      { term: "リリース", description: "釣った魚を海や川に逃がすこと。小さい魚はリリースがマナー。" },
    ],
  },
  {
    id: "method",
    title: "釣法（釣り方）",
    icon: <Anchor className="size-5 text-primary" />,
    terms: [
      {
        term: "サビキ釣り",
        description: "複数の疑似餌がついた仕掛けでアジ・サバ・イワシなどを狙う釣法。初心者に最もおすすめ。",
        link: { href: "/fish/aji", label: "アジの釣り情報" },
      },
      { term: "ウキ釣り", description: "ウキ（浮き）を使って仕掛けを一定の深さに漂わせる釣法。アタリがウキの動きでわかりやすい。" },
      { term: "投げ釣り", reading: "なげつり", description: "オモリを遠くに投げて海底付近の魚を狙う釣法。キスやカレイがターゲット。", link: { href: "/fish/kisu", label: "キスの釣り情報" } },
      { term: "穴釣り", reading: "あなづり", description: "テトラポッドや岩の隙間に仕掛けを落として根魚を狙う釣法。", link: { href: "/fish/kasago", label: "カサゴの釣り情報" } },
      { term: "ルアー釣り", description: "疑似餌（ルアー）を使って魚を狙う釣法の総称。シーバスやヒラメなどが対象。", link: { href: "/fish/seabass", label: "シーバスの釣り情報" } },
      { term: "アジング", description: "小型ルアー（ジグヘッド＋ワーム）でアジを狙うルアーフィッシング。", link: { href: "/fish/aji", label: "アジの釣り情報" } },
      { term: "メバリング", description: "小型ルアーでメバルを狙うルアーフィッシング。", link: { href: "/fish/mebaru", label: "メバルの釣り情報" } },
      { term: "エギング", description: "エギ（餌木）というルアーでイカを狙う釣法。アオリイカが人気ターゲット。", link: { href: "/fish/aoriika", label: "アオリイカの釣り情報" } },
      { term: "ショアジギング", description: "岸からメタルジグを投げて青物を狙う釣法。", link: { href: "/fish/inada", label: "イナダの釣り情報" } },
      { term: "泳がせ釣り", reading: "およがせつり", description: "生きた小魚をエサにして大型魚を狙う釣法。ヒラメやスズキが対象。", link: { href: "/fish/hirame", label: "ヒラメの釣り情報" } },
      { term: "ちょい投げ", description: "軽いオモリで近距離に投げる手軽な投げ釣り。ハゼやキスが狙える。", link: { href: "/fish/haze", label: "ハゼの釣り情報" } },
      { term: "フカセ釣り", description: "軽い仕掛けを潮に乗せて自然に流す釣法。クロダイやメジナが対象。", link: { href: "/fish/kurodai", label: "クロダイの釣り情報" } },
    ],
  },
  {
    id: "tackle",
    title: "仕掛け・道具",
    icon: <Cable className="size-5 text-primary" />,
    terms: [
      { term: "ロッド", description: "釣り竿のこと。対象魚や釣法によって長さや硬さが異なる。" },
      { term: "リール", description: "釣り糸を巻き取るための器具。スピニングリールが初心者向け。" },
      { term: "ウキ", description: "水面に浮かべて仕掛けの深さを調整し、アタリを視覚的に知らせる道具。" },
      { term: "オモリ", description: "仕掛けを沈めるために使う重り。号数で重さを表す。" },
      { term: "ハリス", description: "針に直結する糸。メインの道糸より細いものを使うのが一般的。" },
      { term: "道糸", reading: "みちいと", description: "リールに巻いてあるメインのライン。PE・フロロ・ナイロンなどの素材がある。" },
      { term: "PE ライン", description: "ポリエチレン製の編み糸。細くて強度が高いが、風に弱く扱いにコツがいる。" },
      { term: "フロロカーボン", description: "フッ化炭素製の糸。水中で見えにくく、根ズレに強い。ハリスとしてよく使われる。" },
      { term: "ナイロンライン", description: "最も一般的な釣り糸。扱いやすく初心者向け。伸びがありショック吸収に優れる。" },
      { term: "スナップ", description: "仕掛けやルアーを素早く交換するための小さな金具。" },
      { term: "サルカン", description: "道糸とハリスをつなぐ回転金具。糸のヨレ（ねじれ）を防ぐ。「スイベル」とも言う。" },
      { term: "ジグヘッド", description: "オモリと針が一体になったルアー用の仕掛け。ワームを装着して使う。" },
      { term: "タモ", description: "魚を取り込むための網。大きな魚を引き上げるときに使う。「玉網」とも言う。" },
      { term: "プライヤー", description: "魚から針を外したり、ラインを切ったりするための工具。" },
      { term: "エギ", description: "イカ釣り専用のルアー（餌木）。エビに似せた形状で、イカを誘う。" },
      { term: "メタルジグ", description: "金属製のルアー。遠投性に優れ、青物やヒラメなどを狙える。" },
      { term: "ブラクリ", description: "穴釣り専用の仕掛け。オモリと針が一体になっており、根魚狙いに使う。" },
    ],
  },
  {
    id: "fish-parts",
    title: "魚の部位・状態",
    icon: <Fish className="size-5 text-primary" />,
    terms: [
      { term: "エラ", description: "魚の呼吸器官。魚を締めるときにエラを切って血抜きする。" },
      { term: "ナブラ", description: "小魚の群れが大型魚に追われて海面にバシャバシャと跳ねている状態。チャンスタイム。" },
      { term: "ボイル", description: "魚が水面で小魚を追い回している状態。ナブラと似ているが、より広範囲。" },
      { term: "活性", reading: "かっせい", description: "魚のエサへの反応の良さ。「活性が高い」＝よく食う、「活性が低い」＝食いが渋い。" },
      { term: "スレ", description: "魚が釣り人の仕掛けに警戒して食わなくなること。人気ポイントで起こりやすい。" },
      { term: "回遊", reading: "かいゆう", description: "魚が群れで移動すること。回遊魚（アジ・サバなど）は潮の流れに沿って移動する。" },
      { term: "居着き", reading: "いつき", description: "特定の場所に定住している魚。回遊魚の対義語。根魚に多い。" },
      { term: "締める", reading: "しめる", description: "釣った魚を新鮮に持ち帰るために、脳締めや血抜きで即死させる処理。" },
    ],
  },
  {
    id: "tide",
    title: "潮汐・時間帯",
    icon: <Waves className="size-5 text-primary" />,
    terms: [
      { term: "マヅメ", description: "日の出前後の「朝マヅメ」と日の入り前後の「夕マヅメ」の総称。魚の活性が上がる最も釣れやすい時間帯。" },
      { term: "朝マヅメ", reading: "あさまづめ", description: "日の出前後1〜2時間。プランクトンが活発になり、食物連鎖が始まる最高の時間帯。" },
      { term: "夕マヅメ", reading: "ゆうまづめ", description: "日の入り前後1〜2時間。朝マヅメ同様に魚の活性が高まるゴールデンタイム。" },
      { term: "潮目", reading: "しおめ", description: "異なる潮流がぶつかるライン。プランクトンやエサが集まり、魚が集まりやすいポイント。" },
      { term: "上げ潮", reading: "あげしお", description: "干潮から満潮に向かう潮の流れ。外海の栄養豊富な水が入り、魚の活性が上がりやすい。" },
      { term: "下げ潮", reading: "さげしお", description: "満潮から干潮に向かう潮の流れ。湾内のエサが外に流れるため、それを狙う魚が活発になる。" },
      { term: "大潮", reading: "おおしお", description: "満月・新月の前後に起こる、潮の干満差が最も大きい状態。魚の活性が上がりやすい。" },
      { term: "小潮", reading: "こしお", description: "半月の前後に起こる、潮の干満差が小さい状態。潮の動きが少なく、釣果が出にくいことも。" },
      { term: "中潮", reading: "なかしお", description: "大潮と小潮の間の状態。適度な潮の動きがあり、安定した釣果が期待できる。" },
      { term: "長潮", reading: "ながしお", description: "小潮の翌日。潮の動きが最も小さく、釣りには厳しい潮回り。" },
      { term: "若潮", reading: "わかしお", description: "長潮の翌日。潮が再び大きく動き始める転換期。" },
      { term: "潮止まり", reading: "しおどまり", description: "満潮・干潮の前後で潮の流れが止まる時間帯。魚の活性が落ちやすい。" },
    ],
  },
  {
    id: "spot",
    title: "釣り場・ポイント",
    icon: <Moon className="size-5 text-primary" />,
    terms: [
      { term: "堤防", reading: "ていぼう", description: "港や海岸にある防波堤。足場がよく初心者に最適な釣り場。", link: { href: "/spots", label: "スポットを探す" } },
      { term: "テトラ", description: "堤防の外側に積まれたテトラポッド（消波ブロック）。根魚の好ポイントだが足場注意。" },
      { term: "サーフ", description: "砂浜のこと。ヒラメ・キスなどが狙え、遠投が基本。", link: { href: "/fish/hirame", label: "ヒラメの釣り情報" } },
      { term: "地磯", reading: "じいそ", description: "陸続きの磯。歩いて行けるが足場が悪いため上級者向け。" },
      { term: "沖磯", reading: "おきいそ", description: "渡船で渡る磯。大物が狙えるが、装備と経験が必要。" },
      { term: "ミオ筋", reading: "みおすじ", description: "港内の船が通る深い溝。魚の通り道になることが多い好ポイント。" },
      { term: "カケアガリ", description: "海底が急に浅くなる場所。魚がエサを捕食するポイントになりやすい。" },
      { term: "シモリ", description: "海中にある沈み根（岩礁）。魚の隠れ家になり、好ポイントとなる。" },
    ],
  },
];

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: glossaryData.flatMap((category) =>
    category.terms.map((term) => ({
      "@type": "Question",
      name: `${term.term}とは？`,
      acceptedAnswer: {
        "@type": "Answer",
        text: term.description,
      },
    }))
  ),
};

export default function GlossaryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="mb-4">
          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "用語集" }]} />
        </div>
        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣り用語集
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            初心者が知っておきたい釣りの基本用語をカテゴリ別に解説
          </p>
        </div>

        {/* Client-side search and glossary content */}
        <GlossaryClient glossaryData={glossaryData} />

        {/* Internal links */}
        <div className="mt-12 rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">関連ページ</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/guide"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">釣りの始め方ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                初心者向けステップバイステップ解説
              </p>
            </Link>
            <Link
              href="/seasonal"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">季節別釣りガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                春夏秋冬のおすすめ釣り
              </p>
            </Link>
            <Link
              href="/beginner-checklist"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">持ち物チェックリスト</p>
              <p className="mt-1 text-xs text-muted-foreground">
                忘れ物防止チェックリスト
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
