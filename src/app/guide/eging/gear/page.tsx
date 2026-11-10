import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductList } from "@/components/affiliate/product-list";
import { ShakurhythmPromo } from "@/components/promo/shakurhythm-promo";
import { InArticleAd } from "@/components/ads/ad-unit";
import { products } from "@/lib/data/products";

const TITLE = "明石海峡でアオリイカを釣った道具、全部見せます｜初心者のエギングロッド・エギの選び方";
const DESC =
  "エギングロッドの長さ・硬さ・価格帯、エギの号数・カラー・沈下速度の選び方を初心者向けに解説。編集部おすすめのロッド・エギ・ヘッドライト・ギャフ、実釣写真、平磯海づり公園での釣果も紹介。";
const URL = "https://tsurispot.com/guide/eging/gear";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TITLE,
    description: DESC,
    type: "article",
    url: URL,
    siteName: "ツリスポ",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("明石海峡で釣れたエギング道具 全公開")}&emoji=${encodeURIComponent("🦑")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: { canonical: URL },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
    { "@type": "ListItem", position: 2, name: "釣りの始め方ガイド", item: "https://tsurispot.com/guide" },
    { "@type": "ListItem", position: 3, name: "エギング入門ガイド", item: "https://tsurispot.com/guide/eging" },
    { "@type": "ListItem", position: 4, name: "エギングロッド・エギの選び方", item: URL },
  ],
};

const pick = (ids: string[]) =>
  ids.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
const rods = pick(["p41", "p42", "p43"]);
const egis = pick(["p44", "p45", "p27"]);

const catchPhotos = [
  { src: "aoriika-night-egi", alt: "エギに掛かって釣り上げられたアオリイカ（夜の堤防）", cap: "夜の堤防でエギに乗ったアオリイカ" },
  { src: "aoriika-hanging", alt: "堤防で吊り下げたアオリイカ", cap: "堤防で釣れたアオリイカ。胴の斑点模様がはっきり出ています" },
  { src: "aoriika-size-iphone", alt: "iPhoneとナイフの横に並べたアオリイカ", cap: "iPhoneと並べたサイズ感（胴長はスマホより少し長いくらい）" },
  { src: "aoriika-ground", alt: "堤防に置いたアオリイカ", cap: "昼間に釣れたアオリイカ。胴の斑点と大きなヒレが特徴です" },
];
const foodPhotos = [
  { src: "ika-sashimi", alt: "イカ刺し", cap: "刺身。釣りたては透明感が違います" },
  { src: "ika-nigiri", alt: "イカの握り寿司", cap: "握りにしても甘みが際立ちます" },
  { src: "yaki-ika", alt: "焼きイカ", cap: "炙り・焼きイカ" },
  { src: "ika-tempura", alt: "イカの天ぷら", cap: "天ぷら" },
  { src: "geso-ponzu", alt: "ゲソのポン酢和え", cap: "ゲソもポン酢で美味しくいただけます" },
];

function PhotoGrid({ photos, cols = 3 }: { photos: { src: string; alt: string; cap: string }[]; cols?: 3 | 4 }) {
  return (
    <div className={`mt-4 grid grid-cols-2 gap-3 ${cols === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
      {photos.map((p) => (
        <figure key={p.src}>
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            <Image
              src={`/images/eging/${p.src}.webp`}
              alt={p.alt}
              fill
              sizes="(min-width: 640px) 220px, 45vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-1 text-xs leading-snug text-muted-foreground">{p.cap}</figcaption>
        </figure>
      ))}
    </div>
  );
}

const smallGearIds = ["p48", "p49", "p28", "p29", "p11"];
const smallGear = pick(smallGearIds);

const faqs = [
  {
    q: "エギングロッドは何フィートを選べばいい？",
    a: "堤防からのエギングなら8フィート台（約2.4〜2.7m）、硬さはML〜Mが標準です。迷ったら8.3ft前後のエギング専用ロッドから選ぶと、キャストのしやすさとシャクリやすさのバランスが取れます。",
  },
  {
    q: "エギは何号を買えばいい？",
    a: "堤防エギングでは3.0〜3.5号が基本です。秋の新子（小型）が多い時期は2.5〜3.0号、サイズが育つ晩秋〜春は3.5号が目安です。",
  },
  {
    q: "エギのカラーはどう選ぶ？",
    a: "自然系と目立つ系の2色を基本に、夜は夜光系を足すとよいです。編集部のおすすめは、ヤマシタ エギ王 Kの昼「ムラムラチェリー」、夜「軍艦グリーン」です。",
  },
  {
    q: "夜エギングのヘッドライトは赤色がいい？",
    a: "赤色LEDは白色光より魚やイカを警戒させにくいと言われています。手元を照らすなら赤色LED搭載の釣り用ヘッドライトがおすすめです。",
  },
  {
    q: "エギングにギャフは必要？",
    a: "秋〜春に釣れるイカは大きく育つため、足場の高い堤防ではギャフがあると取り込みが安全で確実です。抜き上げはバラシの原因になります。",
  },
  {
    q: "シャクリのリズムが分からないときは？",
    a: "ツリスポ公式アプリ「シャクリズム」（iPhone・Apple Watch、無料）が、フォールの秒数を数えて振動で知らせてくれます。",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "釣り歴2年目の編集長が明石海峡でアオリイカを釣った道具、全部見せます｜エギングロッド・エギの選び方",
  description: DESC,
  datePublished: "2026-11-10",
  dateModified: "2026-11-10",
  image: ["https://tsurispot.com/images/eging/aoriika-hanging.webp"],
  author: { "@type": "Organization", name: "ツリスポ編集部", url: "https://tsurispot.com/about" },
  publisher: {
    "@type": "Organization",
    name: "ツリスポ",
    url: "https://tsurispot.com",
    logo: { "@type": "ImageObject", url: "https://tsurispot.com/logo.svg" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": URL },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-10 text-xl font-bold sm:text-2xl">{children}</h2>;
}

export default function EgingGearPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Link prefetch={false} href="/guide/eging" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        エギング入門ガイドへ
      </Link>

      <h1 className="text-2xl font-bold sm:text-3xl">釣り歴2年目の編集長が明石海峡でアオリイカを釣った道具、全部見せます｜エギングロッド・エギの選び方</h1>
      <p className="page-description mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        エギングは道具選びで釣りやすさが大きく変わります。このページでは「ロッド」と「エギ」に絞って、初心者が迷いやすいポイントを整理しました。
        最後に、シャクリのリズム作りを助けるアプリ「シャクリズム」も紹介します。
      </p>

      <p className="mt-3 text-xs text-muted-foreground">
        文：ツリスポ編集部（実釣経験をもとに執筆）｜最終更新：2026年11月10日
      </p>

      <Card className="guide-summary mt-6">
        <CardContent className="pt-6 text-sm leading-relaxed">
          <p className="font-bold">3行まとめ</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>エギングの道具は「8フィート台・ML〜Mのロッド」「3.0〜3.5号のエギ」「リーダー付きPEライン」が基本セット</li>
            <li>ロッドは「8フィート台・ML〜M」のエギング専用がまず1本目の基準</li>
            <li>エギは堤防なら3.0〜3.5号が基本。秋は小さめ、春〜冬は大きめが目安</li>
            <li>シャクリとフォールのリズムは、振動で知らせてくれるアプリで再現しやすくなる</li>
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6">
        <ShakurhythmPromo source="eging_gear_top" />
      </div>

      <H2>実際に釣れたイカ</H2>
      <p className="text-sm leading-relaxed sm:text-base">
        ツリスポ編集部が2026年10月に、堤防からエギで釣ったアオリイカたちです。サイズ感の参考にしてください。
      </p>
      <PhotoGrid photos={catchPhotos} cols={4} />
      <p className="mt-4 text-sm leading-relaxed sm:text-base">
        釣れた場所は、兵庫県神戸市の
        <Link prefetch={false} href="/spots/hiraiso-fishing-park" className="font-semibold text-primary hover:underline">
          平磯海づり公園
        </Link>
        。全域が柵付きで足場がよく、売店・トイレもそろうので、初めてのエギングにも向いています。エギングロッドのレンタルはないため、竿は持参してください。
      </p>

      <H2>時期別の難しさ：10月は好機、11月から冬は難易度アップ</H2>
      <p className="text-sm leading-relaxed sm:text-base">
        上の写真は10月の釣果です。秋はアオリイカの数が多く、エギへの反応もよい、エギング入門にいちばん向いた時期です。
        11月に入って水温が下がり始めると、イカの活性とポイントが落ち着き、冬にかけて釣るのが難しくなっていきます。
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="p-2 font-semibold">時期</th>
              <th className="p-2 font-semibold">難易度</th>
              <th className="p-2 font-semibold">ポイント</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">9〜10月（秋）</td>
              <td className="p-2">やさしい</td>
              <td className="p-2">数が出やすい。2.5〜3.0号から試す</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">11月〜冬</td>
              <td className="p-2">難しくなる</td>
              <td className="p-2">水温低下で活性ダウン。3.5号・深場やゆっくりしたフォールを意識</td>
            </tr>
            <tr>
              <td className="p-2">春</td>
              <td className="p-2">ふつう</td>
              <td className="p-2">大型が狙える季節。3.5号中心</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        難しい時期ほど、フォールの秒数を一定にして丁寧に誘う釣りが効きます。振動でリズムを刻むアプリ「シャクリズム」は、まさにそんな場面で役立ちます。
      </p>

      <H2>1. エギングロッドの選び方</H2>
      <p className="text-sm leading-relaxed sm:text-base">
        エギングは、エギを跳ね上げる「シャクリ」を一日中くり返す釣りです。そのため、シーバス用やルアー兼用の竿より、
        軽さと反発力を考えて作られたエギング専用ロッドのほうが疲れにくく、エギの動きも出しやすくなります。
      </p>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed sm:text-base">
        <li>
          <span className="font-semibold">長さ：8フィート台（約2.4〜2.7m）</span>
          <br />
          堤防で扱いやすく、キャストの飛距離とシャクリやすさのバランスが良い長さです。迷ったら8.3ft前後から。
        </li>
        <li>
          <span className="font-semibold">硬さ：ML〜M</span>
          <br />
          2.5〜3.5号のエギを使う堤防エギングなら、ML（ミディアムライト）〜M（ミディアム）が標準的です。
        </li>
        <li>
          <span className="font-semibold">価格帯の目安</span>
          <br />
          入門は5,000〜10,000円、シリーズものの定番は1〜1.5万円台、こだわり派は2万円以上が目安です。まずは入門価格帯で十分に楽しめます。
        </li>
        <li>
          <span className="font-semibold">リールは2500番クラス</span>
          <br />
          PEライン0.6〜0.8号を150m巻ける2500番前後が目安です。
        </li>
      </ul>
      <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed">
        <p className="font-bold">編集部のおすすめは「シマノ 25ソルティーアドバンス ショアモデル エギング S83ML」</p>
        <p className="mt-1">
          エギングロッドは軽さが正義。約100gの軽さで1万円台前半というコスパは頭ひとつ抜けています。
          8.3ft・MLなので、堤防からのアオリイカ狙いにそのまま使える1本です。
        </p>
      </div>
      <div className="mt-6">
        <ProductList
          products={rods}
          title="エギングロッドのおすすめ"
          description="入門 → 定番 → 本格の順に並べています。"
          pageType="guide"
        />
      </div>

      <InArticleAd className="my-8" />

      <H2>2. エギの選び方</H2>
      <p className="text-sm leading-relaxed sm:text-base">
        エギは「号数」「沈下速度」「カラー」の3つで選びます。最初は定番の3.5号を数本、カラーを変えて揃えるのが基本です。
      </p>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed sm:text-base">
        <li>
          <span className="font-semibold">号数：2.5〜3.5号</span>
          <br />
          秋の新子（小型）が多い時期は2.5〜3.0号、サイズが育つ晩秋〜春は3.5号が目安です。
        </li>
        <li>
          <span className="font-semibold">沈下速度：水深とフォール秒数で決める</span>
          <br />
          浅場はゆっくり沈むシャロータイプ、深場や潮が速い場所は重めのタイプ。沈下速度は商品ごとに公表されているので、
          「底までの秒数」を把握しておくとシャクリのリズムが組み立てやすくなります。
        </li>
        <li>
          <span className="font-semibold">カラー：ベース2色＋アピール1色</span>
          <br />
          自然系（ナチュラル）と目立つ系（ピンク・オレンジ）を基本に、夜や濁りには夜光系を足すと対応の幅が広がります。
        </li>
      </ul>
      <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed">
        <p className="font-bold">編集部のおすすめは「ヤマシタ エギ王 K」</p>
        <p className="mt-1">
          エギはやっぱりヤマシタ。カラー選びは、昼は「ムラムラチェリー」、夜は「軍艦グリーン」から始めるのがおすすめです。
        </p>
      </div>
      <div className="mt-6">
        <ProductList
          products={egis}
          title="エギのおすすめ"
          description="まずは定番2種＋お得なセットでローテーションを組むのがおすすめです。"
          pageType="guide"
        />
      </div>

      <H2>あると差が出る小物（ライト・ギャフ・安全装備）</H2>
      <p className="text-sm leading-relaxed sm:text-base">
        夜エギングで手元を照らすなら、赤色LEDのヘッドライトがおすすめです。白色光は魚やイカを警戒させやすく、赤色のほうが逃げにくいと言われています。
        秋〜春のイカは大きく育つので、取り込み用のギャフも必須です（抜き上げはバラシのもと）。
        ラインはPE＋フロロのリーダー、そして堤防ではライフジャケットも忘れずに。
      </p>
      <div className="mt-4">
        <ProductList products={smallGear} pageType="guide" />
      </div>

      <H2>釣った後はイカ料理を満喫</H2>
      <p className="text-sm leading-relaxed sm:text-base">
        エギングの楽しみは釣るだけではありません。刺身、握り、天ぷら、ゲソのポン酢和えなど、イカ料理のごちそうが待っています。
        締め方や持ち帰り方は
        <Link prefetch={false} href="/guide/eging" className="text-primary hover:underline">エギング入門ガイド</Link>
        で解説しています。
      </p>
      <PhotoGrid photos={foodPhotos} />

      <H2>3. シャクリのリズムは「シャクリズム」で安定させる</H2>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        初心者がつまずきやすいのが、シャクったあとの「フォール（沈める時間）」の長さです。数えているうちに集中が切れたり、
        ラインから目を離したりしがち。ツリスポ公式アプリ「シャクリズム」は、そのフォールの秒数をアプリに任せられます。
      </p>
      <ShakurhythmPromo source="eging_gear" />

      <H2>よくある質問</H2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="rounded-lg border p-4 text-sm">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-2 leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-lg border p-4 text-sm">
        <p className="font-semibold">あわせて読みたい</p>
        <ul className="mt-2 space-y-1">
          <li>
            <Link prefetch={false} href="/guide/eging" className="text-primary hover:underline">
              エギング入門ガイド（シャクリ方・季節別攻略・締め方）
            </Link>
          </li>
          <li>
            <Link prefetch={false} href="/spots/hiraiso-fishing-park" className="text-primary hover:underline">
              平磯海づり公園（神戸・垂水）の釣り場情報
            </Link>
          </li>
          <li>
            <Link prefetch={false} href="/fish/aoriika" className="text-primary hover:underline">
              アオリイカの釣り方と釣れるスポット
            </Link>
          </li>
          <li>
            <Link prefetch={false} href="/guide/night-fishing" className="text-primary hover:underline">
              夜釣り入門ガイド（ナイトエギング）
            </Link>
          </li>
        </ul>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        ※ 本ページにはアフィリエイトリンクが含まれます。価格は目安で、変動する場合があります。
      </p>
    </div>
  );
}
