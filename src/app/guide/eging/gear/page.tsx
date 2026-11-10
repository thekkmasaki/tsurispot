import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductList } from "@/components/affiliate/product-list";
import { ShakurhythmPromo } from "@/components/promo/shakurhythm-promo";
import { InArticleAd } from "@/components/ads/ad-unit";
import { products } from "@/lib/data/products";

const TITLE = "エギング道具の選び方特集｜ロッド・エギの選び方とおすすめ";
const DESC =
  "エギング初心者向けに、ロッドの長さ・硬さ・価格帯の選び方と、エギの号数・カラー・沈下速度の選び方を解説。おすすめロッドとエギ、シャクリのリズムを振動で刻むアプリ「シャクリズム」も紹介。";
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
        url: `/api/og?title=${encodeURIComponent("エギング道具の選び方特集")}&emoji=${encodeURIComponent("🦑")}`,
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
    { "@type": "ListItem", position: 4, name: "エギング道具の選び方特集", item: URL },
  ],
};

const rods = products.filter((p) => p.relatedMethods.includes("eging") && p.category === "rod");
const egis = products.filter(
  (p) => p.relatedMethods.includes("eging") && p.category === "tackle" && /エギ/.test(p.name)
);

const catchPhotos = [
  { src: "aoriika-night-egi", alt: "エギに掛かって釣り上げられたアオリイカ（夜の堤防）", cap: "夜の堤防でエギに乗ったアオリイカ" },
  { src: "aoriika-hanging", alt: "堤防で吊り下げたアオリイカ", cap: "堤防で釣れたアオリイカ。胴の斑点模様がはっきり出ています" },
  { src: "aoriika-size-iphone", alt: "iPhoneとナイフの横に並べたアオリイカ", cap: "iPhoneと並べたサイズ感（胴長はスマホより少し長いくらい）" },
  { src: "kouika", alt: "堤防に置いたコウイカ", cap: "エギには時々コウイカも掛かります" },
];
const foodPhotos = [
  { src: "ika-sashimi", alt: "イカ刺し", cap: "刺身。釣りたては透明感が違います" },
  { src: "ika-nigiri", alt: "イカの握り寿司", cap: "握りにしても甘みが際立ちます" },
  { src: "yaki-ika", alt: "焼きイカ", cap: "炙り・焼きイカ" },
  { src: "ika-tempura", alt: "イカの天ぷら", cap: "天ぷら" },
  { src: "geso-ponzu", alt: "ゲソのポン酢和え", cap: "ゲソもポン酢で美味しくいただけます" },
];

function PhotoGrid({ photos }: { photos: { src: string; alt: string; cap: string }[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
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

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-10 text-xl font-bold sm:text-2xl">{children}</h2>;
}

export default function EgingGearPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <Link prefetch={false} href="/guide/eging" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        エギング入門ガイドへ
      </Link>

      <h1 className="text-2xl font-bold sm:text-3xl">エギング道具の選び方特集｜ロッドとエギ</h1>
      <p className="page-description mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        エギングは道具選びで釣りやすさが大きく変わります。このページでは「ロッド」と「エギ」に絞って、初心者が迷いやすいポイントを整理しました。
        最後に、シャクリのリズム作りを助けるアプリ「シャクリズム」も紹介します。
      </p>

      <Card className="guide-summary mt-6">
        <CardContent className="pt-6 text-sm leading-relaxed">
          <p className="font-bold">3行まとめ</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ロッドは「8フィート台・ML〜M」のエギング専用がまず1本目の基準</li>
            <li>エギは堤防なら3.0〜3.5号が基本。秋は小さめ、春〜冬は大きめが目安</li>
            <li>シャクリとフォールのリズムは、振動で知らせてくれるアプリで再現しやすくなる</li>
          </ul>
        </CardContent>
      </Card>

      <H2>実際に釣れたイカ</H2>
      <p className="text-sm leading-relaxed sm:text-base">
        ツリスポ編集部の釣行で、堤防からエギで釣れたイカたちです。サイズ感の参考にしてください。
      </p>
      <PhotoGrid photos={catchPhotos} />

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

      <div className="mt-10 rounded-lg border p-4 text-sm">
        <p className="font-semibold">あわせて読みたい</p>
        <ul className="mt-2 space-y-1">
          <li>
            <Link prefetch={false} href="/guide/eging" className="text-primary hover:underline">
              エギング入門ガイド（シャクリ方・季節別攻略・締め方）
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
