import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam, Analogy, TsuriSpotBox } from "@/components/instructor-exam/callouts";
import { ArrowRight } from "lucide-react";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第4章 釣りの文化史 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第4章。日本の釣り文化の起源から江戸時代の釣り文化、和竿の伝統技法、テンカラ釣り、釣り文学の名作まで体系的に解説。章末確認クイズ40問付き。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/history`,
  },
  openGraph: {
    title: "第4章 釣りの文化史 | 公認釣りインストラクター試験対策 | ツリスポ",
    description: "日本の釣り文化の起源・江戸時代の釣り文化・和竿・テンカラ・釣り文学を体系的に解説。確認クイズ40問付き。",
    url: `${baseUrl}/instructor-exam/history`,
    type: "article",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=釣りの文化史&emoji=📜", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "第4章 釣りの文化史 | 釣りインストラクター試験対策",
    description: "日本の釣り文化の起源・江戸時代の釣り・和竿・テンカラ・釣り文学を体系的に解説。確認クイズ40問付き。",
    images: ["https://tsurispot.com/api/og?title=釣りの文化史&emoji=📜"],
  },
  keywords: ["釣りの文化史", "和竿", "テンカラ", "何羨録", "釣り文学", "釣りインストラクター"],
};

/* ============================================================
   ページ本体
   ============================================================ */

export default function HistoryPage() {
  return (
    <>
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "ホーム", item: baseUrl },
              {
                "@type": "ListItem",
                position: 2,
                name: "試験対策",
                item: `${baseUrl}/instructor-exam`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "釣りの文化史",
                item: `${baseUrl}/instructor-exam/history`,
              },
            ],
          }),
        }}
      />
      {/* JSON-LD: Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "第4章 釣りの文化史 | 公認釣りインストラクター試験対策",
            description: "日本の釣り文化の起源・江戸時代の釣り文化・和竿・テンカラ・釣り文学を体系的に解説。確認クイズ40問付き。",
            url: `${baseUrl}/instructor-exam/history`,
            datePublished: "2026-03-21",
            dateModified: "2026-03-21",
            author: {
              "@type": "Organization",
              name: "ツリスポ編集部",
              url: "https://tsurispot.com/about",
            },
            publisher: {
              "@type": "Organization",
              name: "ツリスポ",
              url: "https://tsurispot.com",
            },
            isPartOf: {
              "@type": "Course",
              name: "公認釣りインストラクター試験対策ガイド",
              url: `${baseUrl}/instructor-exam`,
            },
            inLanguage: "ja",
          }),
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* パンくず */}
        <nav aria-label="パンくずリスト" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-foreground">ホーム</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/instructor-exam" className="hover:text-foreground">
                試験対策
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">釣りの文化史</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">第4章</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">釣りの文化史</h1>
          <p className="mt-2 text-sky-200">
            日本の釣り文化の起源から江戸時代の発展、和竿やテンカラの伝統技法、そして近代の釣り文学まで、釣りインストラクターが知るべき文化的背景を学びます。
          </p>
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-base font-bold">目次</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec4-1" className="text-sky-700 hover:underline">
                4.1 日本の釣り文化の起源
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec4-2" className="text-sky-700 hover:underline">
                4.2 江戸時代の釣り文化
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec4-3" className="text-sky-700 hover:underline">
                4.3 和竿とその技法
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec4-4" className="text-sky-700 hover:underline">
                4.4 テンカラ釣りの伝統
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec4-5" className="text-sky-700 hover:underline">
                4.5 釣り文学の名作
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#summary" className="text-sky-700 hover:underline">
                章末まとめ &amp; 確認クイズ
              </a>
            </li>
          </ul>
        </div>

        {/* ===== 4.1 日本の釣り文化の起源 ===== */}
        <h2
          id="sec4-1"
          className="mb-4 mt-10 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          4.1 日本の釣り文化の起源
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          旧石器時代・縄文時代の釣り
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          日本列島における釣りの歴史は非常に古く、考古学的な遺物からその起源をたどることができます。沖縄県南城市のサキタリ洞遺跡からは、約2万3千年前（旧石器時代）の貝製釣り針が出土しており、これは世界最古級の釣り針のひとつとされています。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          縄文時代に入ると、釣り針は骨角器として広く製作されるようになりました。動物の骨や鹿の角を削って作られた釣り針は、全国各地の貝塚から数多く出土しています。特に千葉県の加曽利貝塚や福井県の鳥浜貝塚などが有名です。これらの遺跡からはマダイ、クロダイ、スズキ、フグなどの骨も見つかっており、縄文の人々が多様な魚種を釣っていたことが分かっています。
        </p>

        <Point>
          <p>
            日本最古級の釣り針は、沖縄県サキタリ洞遺跡から出土した<strong>約2万3千年前の貝製釣り針</strong>です。世界的にも最古級の発見であり、日本列島の人々が旧石器時代からすでに釣りを行っていたことを示す重要な証拠です。
          </p>
        </Point>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          弥生時代の鉄製釣り針
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          弥生時代（紀元前3世紀頃〜）になると、大陸から鉄の加工技術が伝わり、<strong>鉄製の釣り針</strong>が登場しました。骨角製に比べて強度が格段に上がり、より大きな魚を狙えるようになりました。また、この時代には網を使った漁法も普及し、釣りと網漁が併用されるようになっています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          古事記・日本書紀に見る釣り
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          日本最古の歴史書である『古事記』（712年）と『日本書紀』（720年）には、<strong>海幸彦・山幸彦</strong>の神話が記されています。海幸彦（兄）は釣り針で海の幸を獲り、山幸彦（弟）は弓矢で山の幸を獲って暮らしていました。ある日、兄弟が互いの道具を交換したところ、山幸彦は兄の大切な釣り針を海で失くしてしまいます。この物語は、古代日本において釣り針が非常に貴重な道具であったことを物語っています。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          また、『万葉集』には釣りに関する歌がいくつか収録されており、奈良時代にはすでに釣りが文学の題材になっていたことが分かります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          貝塚から分かる古代の釣り文化
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          貝塚は古代人の「ゴミ捨て場」であると同時に、当時の食生活を知る貴重な手がかりです。貝殻だけでなく、魚骨・釣り針・土器なども出土します。東京湾沿岸の大森貝塚（東京都）はモースによる1877年の発掘で知られ、日本の考古学の出発点となりました。貝塚からの魚骨の分析により、縄文時代の人々がマダイやスズキなどを好んで食べていたことが明らかになっています。
        </p>

        <Exam>
          <p>
            <strong>試験で問われやすいポイント:</strong>
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>日本最古級の釣り針 = サキタリ洞遺跡（沖縄県）の貝製釣り針（約2万3千年前）</li>
            <li>縄文時代の釣り針 = 骨角器（動物の骨や角で製作）</li>
            <li>弥生時代 = 鉄製釣り針の登場</li>
            <li>海幸彦・山幸彦の神話 = 古事記・日本書紀に記載</li>
          </ul>
        </Exam>

        {/* ===== 4.2 江戸時代の釣り文化 ===== */}
        <h2
          id="sec4-2"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          4.2 江戸時代の釣り文化
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          「太公望」の由来
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣り好きの人を「太公望（たいこうぼう）」と呼ぶ慣習は、<strong>中国の故事</strong>に由来します。太公望とは、古代中国・周の時代の軍師<strong>呂尚（りょしょう）</strong>のことです。呂尚は渭水（いすい）のほとりで釣り糸を垂れていたところを周の文王に見出され、軍師として迎えられました。この故事から「釣りをする人」の代名詞として「太公望」が使われるようになりました。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          日本では江戸時代に太公望の故事が広く知られるようになり、釣り好きの人を「太公望」と呼ぶ文化が定着しました。なお、呂尚は文王の父・太公が待ち望んだ人物であったことから「太公望」と称されるようになったと伝えられています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          「何羨録」と津軽采女
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          享保8年（1723年）、旗本の<strong>津軽采女（つがる うねめ）</strong>が著した<strong>『何羨録（かせんろく）』</strong>は、<strong>日本最古の釣り専門書</strong>とされています。書名は中国の詩人・張志和の詩句「煙波釣叟何ぞ羨まん」に由来し、「釣りの老人は何を羨むことがあろうか（何も羨むものはない）」という意味です。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          『何羨録』は上下2巻から成り、釣り場・仕掛け・餌・釣り方などを詳細に記録しています。江戸近郊の釣り場案内としての性格も持ち、品川沖や隅田川、江戸湾での船釣りの様子などが生き生きと描かれています。
        </p>

        <Exam>
          <p>
            <strong>超頻出!</strong> 『何羨録』に関する問題は試験での出題頻度が非常に高いです。<strong>著者: 津軽采女</strong>、<strong>成立年: 1723年（享保8年）</strong>、<strong>日本最古の釣り専門書</strong>という3点セットは確実に覚えましょう。
          </p>
        </Exam>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          武士の教養としての釣り
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          江戸時代、釣りは武士の間で<strong>教養や精神修養</strong>のひとつとして位置づけられていました。戦のない泰平の世において、武士は釣りを通じて忍耐力や集中力を養い、自然との対話を楽しんでいました。特に大名や旗本の間では「太公望の故事」にならい、釣りは単なる遊びではなく「風雅な趣味」として尊重されていました。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          庶民の釣り文化
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          江戸時代後期になると、釣りは武士だけでなく<strong>庶民にも広く普及</strong>しました。江戸の町人たちは、隅田川や品川沖での船釣り、神田川や小石川での小物釣りを楽しみました。ハゼ釣り・キス釣り・フナ釣りなどは江戸庶民の代表的な娯楽であり、釣り道具を扱う専門店も現れました。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          浮世絵にも釣りの場面がしばしば描かれており、歌川広重の「名所江戸百景」などには釣り人の姿が見られます。こうした文化的広がりが、日本の釣り文化の裾野を大きく拡げました。
        </p>

        <Analogy>
          <p>
            江戸時代の釣りは、現代でいう「ゴルフ」のような位置づけでした。もともとは上流階級の嗜みでしたが、やがて庶民にも広がり、道具の専門店が生まれ、ガイドブック（何羨録）まで登場する ── この流れは、現代のレジャー産業の発展とよく似ています。
          </p>
        </Analogy>

        {/* ===== 4.3 和竿とその技法 ===== */}
        <h2
          id="sec4-3"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          4.3 和竿とその技法
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          和竿の素材
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          和竿（わざお）は、日本の伝統的な釣り竿であり、<strong>天然の竹</strong>を素材として手作りで製作されます。使用される竹の種類には以下のものがあります。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">竹の種類</th>
                <th className="px-4 py-2.5 text-left">特徴</th>
                <th className="px-4 py-2.5 text-left">主な用途</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">真竹（まだけ）</td>
                <td className="px-4 py-2.5">太くて丈夫、弾力がある</td>
                <td className="px-4 py-2.5">竿の元（手元側）の部分</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">矢竹（やだけ）</td>
                <td className="px-4 py-2.5">まっすぐで節間が長い</td>
                <td className="px-4 py-2.5">中通し竿、延べ竿</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">布袋竹（ほていちく）</td>
                <td className="px-4 py-2.5">根元の節が独特のふくらみを持つ</td>
                <td className="px-4 py-2.5">手元（握り）部分の装飾的利用</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">高野竹（こうやちく）</td>
                <td className="px-4 py-2.5">細くてしなやか、粘りがある</td>
                <td className="px-4 py-2.5">穂先（先端）部分</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          和竿の製作工程
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          和竿の製作は高度な技術と長い時間を要する工芸です。主な工程は以下の通りです。
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>竹の選定と伐採</strong>: 秋から冬にかけて竹を伐採し、3〜5年以上自然乾燥させます。水分が抜けて繊維が締まり、強度が増します。
          </li>
          <li>
            <strong>矯め（ため）</strong>: 炭火や専用の「矯め木」を使い、竹の曲がりや反りを丁寧に修正します。この工程が竿のまっすぐさと調子を決める最も重要な作業です。
          </li>
          <li>
            <strong>継ぎ</strong>: 複数の竹を組み合わせて1本の竿に仕立てます。「並継ぎ」や「印籠継ぎ」などの方式があり、継ぎ目の精度が竿の性能を左右します。
          </li>
          <li>
            <strong>漆塗り</strong>: 竿の表面に漆（うるし）を何層にも塗り重ねて仕上げます。漆は防水性・耐久性を高めるとともに、美しい光沢を生み出します。
          </li>
        </ol>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          江戸和竿の名工
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          江戸時代後期から明治・大正にかけて、江戸（東京）では和竿作りが大きく発展し、多くの名工が活躍しました。代表的な名跡として<strong>「東作（とうさく）」</strong>があり、江戸和竿の始祖とされています。また、<strong>「竿忠（さおちゅう）」</strong>は幕末から続く老舗の名跡で、ハゼ竿やキス竿の名手として知られました。これらの名跡は弟子に受け継がれ、現在も江戸和竿の伝統を守る職人が活動しています。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          江戸和竿は2002年に<strong>東京都の伝統工芸品</strong>に指定されており、その技術と文化的価値が公的にも認められています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          和竿と洋竿の違い
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          明治以降、西洋から<strong>グラスファイバー竿</strong>（1950年代〜）や<strong>カーボン竿</strong>（1970年代〜）が導入され、現在の釣り竿の主流となっています。洋竿は大量生産が可能で均一な品質が得られますが、和竿は1本1本の竹の個性を活かした唯一無二の「味」があるのが特徴です。
        </p>

        <Analogy>
          <p>
            和竿の「調子」は、楽器のチューニングに例えると分かりやすいです。竿師は竹の特性を見極め、穂先から手元までのしなり方を意図通りに調整します。同じ素材でも職人によって全く異なる「音色」が生まれる点は、バイオリン職人の仕事と共通するものがあります。
          </p>
        </Analogy>

        <Point>
          <p>
            和竿に使われる4つの竹: <strong>真竹（元）</strong>・<strong>矢竹（中）</strong>・<strong>布袋竹（手元装飾）</strong>・<strong>高野竹（穂先）</strong>。素材の組み合わせと「矯め」「継ぎ」「漆塗り」の3工程が和竿の品質を決めます。
          </p>
        </Point>

        {/* ===== 4.4 テンカラ釣りの伝統 ===== */}
        <h2
          id="sec4-4"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          4.4 テンカラ釣りの伝統
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          テンカラ釣りとは
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          テンカラ釣りは、日本に古くから伝わる<strong>リールを使わない毛鉤（けばり）釣り</strong>です。竿とライン（テーパーライン）と毛鉤だけというシンプルな道具構成が最大の特徴で、西洋のフライフィッシングとは異なり、リールもフライラインのような複雑な仕掛けも使用しません。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          職漁師の技法としての起源
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          テンカラ釣りの起源は、<strong>山間部の職漁師（しょくりょうし）</strong>にあるとされています。江戸時代から明治・大正にかけて、日本の山村には渓流魚を釣って生計の足しにする職漁師がおり、彼らが効率よくイワナやアマゴを釣るために発展させた技法がテンカラです。簡素な道具で山深い渓流を機動的に移動しながら釣るスタイルは、まさに実用から生まれた合理的な漁法でした。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          テンカラの基本構成
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          テンカラ釣りの道具は非常にシンプルで、以下の3つだけで成り立ちます。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>竿</strong>: 3〜4メートル程度の軽い延べ竿（もともとは和竿、現在はカーボン竿も使われる）
          </li>
          <li>
            <strong>ライン</strong>: テーパーライン（先端に向かって細くなるライン）を竿先に直接結ぶ。竿と同じくらいの長さ
          </li>
          <li>
            <strong>毛鉤</strong>: 鳥の羽根などを巻いて作った疑似餌。逆さ毛鉤が伝統的な形状
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          現代のテンカラブーム
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          テンカラ釣りは長らく日本の山間部の限られた地域で受け継がれてきましたが、2000年代以降、そのシンプルさが海外で注目を集め、<strong>「Tenkara」</strong>として世界的なブームとなりました。特にアメリカでは、フライフィッシングの愛好家がテンカラの簡潔さに魅せられ、専門ブランドや愛好団体が数多く設立されています。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          こうした海外での評価を受けて、日本国内でもテンカラ釣りが再評価される動きが広がっています。入門のハードルが低く、自然との一体感を味わえる釣りとして、初心者からベテランまで幅広い層に支持されています。
        </p>

        <Analogy>
          <p>
            テンカラのシンプルさは「引き算の美学」そのものです。フライフィッシングが多彩なフライパターンやリール操作で「足し算」をしていくのに対し、テンカラは道具を極限まで減らすことで、釣り人の技術と感覚だけで魚と対峙します。まさに日本的な「少ないことの豊かさ」を体現する釣りです。
          </p>
        </Analogy>

        {/* ===== 4.5 釣り文学の名作 ===== */}
        <h2
          id="sec4-5"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          4.5 釣り文学の名作
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          日本には、優れた文学者が釣りを題材に名作を残してきた豊かな伝統があります。釣りインストラクターとして、日本の釣り文化を語るうえで知っておくべき主要な作品を紹介します。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          佐藤垢石（さとう こうせき）
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          佐藤垢石（1888〜1956年）は、<strong>日本の釣り随筆の第一人者</strong>として知られています。本名は佐藤亀吉。新聞記者出身で、鮎釣りの名手として名を馳せました。代表作<strong>『たぬき汁』</strong>は、釣りの楽しみを軽妙洒脱な文章で綴った随筆集で、釣り文学の古典として高く評価されています。その他にも『香魚つり』『釣人・漁夫』など多くの釣りに関する作品を残しました。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          井伏鱒二（いぶせ ますじ）
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          井伏鱒二（1898〜1993年）は、『山椒魚』『黒い雨』などで知られる文豪ですが、生涯を通じて熱心な釣り人でもありました。代表的な釣り作品には<strong>『川釣り』</strong>や<strong>『釣師・釣場』</strong>があり、山梨県の渓流や荻窪の善福寺川での釣りの様子が情緒豊かに描かれています。特に『川釣り』はハヤ（ウグイ）釣りの楽しみを繊細な筆致で綴った名作として、釣り愛好家に長く読み継がれています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          開高健（かいこう たけし）
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          開高健（1930〜1989年）は、芥川賞作家であると同時に、世界を旅して大魚を追い求めた<strong>冒険的釣り紀行の大家</strong>です。代表作<strong>『オーパ!』</strong>（1978年）はブラジル・アマゾン川での釣行記で、巨大魚との格闘を躍動感あふれる文章で描いた傑作として広く知られています。また<strong>『フィッシュ・オン』</strong>はアラスカでのキングサーモンとの闘いを記録した作品です。釣りを通じて人間と自然の関係を深く掘り下げた開高健の作品群は、今なお多くの釣り人にインスピレーションを与えています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          幸田露伴と釣り
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          幸田露伴（1867〜1947年）は、明治から昭和にかけて活躍した文豪で、自身も釣りを愛好していました。小説『連環記』や随筆の中で釣りに関する描写を残しています。また、露伴は釣りに限らず遊芸全般に造詣が深く、その博識は広く知られていました。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          釣り文化と文学の関わり
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          日本の釣り文学に共通するのは、単に「どう釣るか」という技術論にとどまらず、<strong>釣りを通じた自然観察や人生の省察</strong>が作品の核になっている点です。佐藤垢石の軽妙な随筆、井伏鱒二の静謐な渓流描写、開高健のダイナミックな冒険紀行 ── それぞれのスタイルは異なりますが、いずれも釣りという行為を通じて日本の風土や人間の本質を描き出しています。
        </p>

        <Exam>
          <p>
            <strong>主要な釣り文学作品と著者の対応:</strong>
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>佐藤垢石</strong> ── 『たぬき汁』『香魚つり』（釣り随筆の大家、鮎釣り名人）</li>
            <li><strong>井伏鱒二</strong> ── 『川釣り』『釣師・釣場』（渓流釣り文学の名作）</li>
            <li><strong>開高健</strong> ── 『オーパ!』『フィッシュ・オン』（世界の大魚を追った紀行文学）</li>
          </ul>
          <p className="mt-2">
            著者と作品名の組み合わせを正確に覚えましょう。
          </p>
        </Exam>

        <TsuriSpotBox>
          <p>
            ツリスポの{" "}
            <Link href="/fish" className="font-medium underline">
              魚種図鑑
            </Link>{" "}
            では、文学作品にも登場するアユやイワナなどの渓流魚の生態や釣り方を詳しく紹介しています。また{" "}
            <Link href="/glossary" className="font-medium underline">
              釣り用語集
            </Link>{" "}
            では、テンカラや和竿など本章に登場する伝統的な用語も解説しています。
          </p>
        </TsuriSpotBox>

        {/* ===== 章末まとめ ===== */}
        <h2
          id="summary"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          章末まとめ
        </h2>

        <div className="mb-8 rounded-xl border-2 border-sky-400 bg-gradient-to-br from-sky-50 to-blue-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-sky-900">
            第4章のポイント
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong>日本最古級の釣り針</strong>: 沖縄県サキタリ洞遺跡の貝製釣り針（約2万3千年前）
            </li>
            <li>
              <strong>時代ごとの素材変遷</strong>: 骨角器（縄文） → 鉄製（弥生） → 竹竿（江戸） → グラス・カーボン（近代）
            </li>
            <li>
              <strong>太公望の由来</strong>: 中国・周の軍師 呂尚の故事。日本で釣り好きの代名詞に
            </li>
            <li>
              <strong>何羨録</strong>: 津軽采女著、1723年（享保8年）、日本最古の釣り専門書
            </li>
            <li>
              <strong>和竿の素材</strong>: 真竹・矢竹・布袋竹・高野竹。江戸和竿は東京都伝統工芸品
            </li>
            <li>
              <strong>テンカラ</strong>: リールを使わない毛鉤釣り。職漁師起源。海外で &quot;Tenkara&quot; ブーム
            </li>
            <li>
              <strong>釣り文学3大著者</strong>: 佐藤垢石『たぬき汁』、井伏鱒二『川釣り』、開高健『オーパ!』
            </li>
          </ul>
        </div>

        {/* ===== 章末確認クイズ CTA ===== */}
        <div className="mt-8 rounded-xl border-2 border-purple-200 bg-purple-50 p-6 text-center">
          <h2 className="text-xl font-bold text-purple-800">確認クイズに挑戦</h2>
          <p className="mt-2 text-sm text-purple-600">全40問の4択クイズで理解度をチェック</p>
          <Link
            href="/instructor-exam/history/quiz"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700"
          >
            クイズを始める
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* ナビ */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Link
            href="/instructor-exam/manners"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            &larr; 第3章 マナーと指導法
          </Link>
          <Link
            href="/instructor-exam/tackle"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            第5章 釣り具の知識 &rarr;
          </Link>
        </div>

        {/* 免責 */}
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <p>
            本ページの情報は2025年時点の知見に基づいています。歴史的事実の解釈については諸説ある場合があります。最新情報や試験の出題範囲については{" "}
            <a
              href="https://www.zenturi-jofi.or.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              全釣り協公式サイト
            </a>{" "}
            をご確認ください。当サイトは全日本釣り団体協議会とは無関係の非公式学習サイトです。
          </p>
        </div>
      </div>
    </>
  );
}
