import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam, TsuriSpotBox, Warn } from "@/components/instructor-exam/callouts";
import { ArrowRight } from "lucide-react";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第2章 気象海象と安全対策 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第2章。天気図の読み方、潮汐・潮流、波浪判断、落水事故対処、落雷・熱中症対策、救命胴衣の種類を体系的に解説。確認クイズ40問付き。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/safety`,
  },
  openGraph: {
    title: "第2章 気象海象と安全対策 | 公認釣りインストラクター試験対策 | ツリスポ",
    description: "天気図・潮汐・波浪・落水事故対処・救命胴衣の知識を体系的に解説。確認クイズ40問付き。",
    url: `${baseUrl}/instructor-exam/safety`,
    type: "article",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=気象海象と安全対策&emoji=🌊", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "第2章 気象海象と安全対策 | 釣りインストラクター試験対策",
    description: "天気図・潮汐・波浪・安全装備の知識を体系的に解説。確認クイズ40問付き。",
    images: ["https://tsurispot.com/api/og?title=気象海象と安全対策&emoji=🌊"],
  },
  keywords: ["天気図", "潮汐", "波浪", "落水事故", "救命胴衣", "釣りインストラクター"],
};

/* ============================================================
   ページ本体
   ============================================================ */

export default function SafetyPage() {
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
                name: "気象海象と安全対策",
                item: `${baseUrl}/instructor-exam/safety`,
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
            headline: "第2章 気象海象と安全対策 | 公認釣りインストラクター試験対策",
            description: "天気図・潮汐・波浪・落水事故対処・救命胴衣の知識を体系的に解説。確認クイズ40問付き。",
            url: `${baseUrl}/instructor-exam/safety`,
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
            <li className="font-medium text-foreground">気象海象と安全対策</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">第2章</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">気象海象と安全対策</h1>
          <p className="mt-2 text-sky-200">
            天気図・潮汐・波浪の基礎知識から、落水事故防止・救命胴衣の選び方まで、安全な釣りに欠かせない知識を体系的に学びます。
          </p>
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-base font-bold">目次</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec2-1" className="text-sky-700 hover:underline">
                2.1 天気図の読み方と気象情報の活用
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec2-2" className="text-sky-700 hover:underline">
                2.2 潮汐・潮流の基礎知識
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec2-3" className="text-sky-700 hover:underline">
                2.3 波浪と海象の判断
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec2-4" className="text-sky-700 hover:underline">
                2.4 落水事故の予防と対処
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec2-5" className="text-sky-700 hover:underline">
                2.5 落雷・熱中症・低体温症対策
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec2-6" className="text-sky-700 hover:underline">
                2.6 救命胴衣と安全装備
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#summary" className="text-sky-700 hover:underline">
                章末まとめ &amp; 確認クイズ
              </a>
            </li>
          </ul>
        </div>

        {/* ===== 2.1 天気図の読み方と気象情報の活用 ===== */}
        <h2
          id="sec2-1"
          className="mb-4 mt-10 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          2.1 天気図の読み方と気象情報の活用
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          天気図記号の基本
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          天気図は大気の状態を平面的に表した地図であり、釣行計画を立てる際に欠かせない情報源です。地上天気図には<strong>等圧線</strong>（4hPaごとに引かれる）が描かれ、等圧線の間隔が狭いほど風が強いことを示します。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">記号</th>
                <th className="px-4 py-2.5 text-left">意味</th>
                <th className="px-4 py-2.5 text-left">釣りへの影響</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">高（H）</td>
                <td className="px-4 py-2.5">高気圧。下降気流が支配的で晴天</td>
                <td className="px-4 py-2.5">好天で釣日和になりやすい</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">低（L）</td>
                <td className="px-4 py-2.5">低気圧。上昇気流で雲が発達</td>
                <td className="px-4 py-2.5">風雨が強まり、海が荒れやすい</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">温暖前線</td>
                <td className="px-4 py-2.5">暖気が寒気の上に乗り上げる。赤い半円の記号</td>
                <td className="px-4 py-2.5">広い範囲で長時間の雨になりやすい</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">寒冷前線</td>
                <td className="px-4 py-2.5">寒気が暖気の下に潜り込む。青い三角の記号</td>
                <td className="px-4 py-2.5">通過時に突風・雷雨のおそれ</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">閉塞前線</td>
                <td className="px-4 py-2.5">寒冷前線が温暖前線に追いついた状態</td>
                <td className="px-4 py-2.5">低気圧が最も発達しやすい段階</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">停滞前線</td>
                <td className="px-4 py-2.5">前線がほぼ動かない状態。梅雨前線が代表例</td>
                <td className="px-4 py-2.5">長期間の降雨。増水に注意</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          気圧配置と天候の関係
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          日本の天候に大きな影響を与える代表的な気圧配置を理解することは、釣行の安全管理に直結します。
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>西高東低（冬型）</strong>: 大陸の高気圧と東方海上の低気圧の配置。日本海側で雪、太平洋側で乾燥した晴天。等圧線が南北に密に並び、北西の季節風が強い。沿岸部では波が高くなる。
          </li>
          <li>
            <strong>南高北低（夏型）</strong>: 太平洋高気圧が張り出し、日本列島を覆う。晴天が続くが、午後に局地的な雷雨（熱雷）が発生しやすい。
          </li>
          <li>
            <strong>南岸低気圧</strong>: 日本の南岸を通過する低気圧。太平洋側で大雨や大雪をもたらすことがある。発達すると暴風にもなるため、春先は特に注意が必要。
          </li>
          <li>
            <strong>台風</strong>: 中心気圧が低いほど強い。進行方向右側（北半球）は「危険半円」と呼ばれ、風が特に強い。
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          気象庁の海上予報・注意報の活用法
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          気象庁は<strong>海上警報・海上予報</strong>を発表しており、「海上風警報」「海上濃霧警報」「海上暴風警報」などがあります。また、沿岸部の天気予報では「波の高さ」「風速」が発表されます。波の高さが1.5mを超える場合は磯釣りを控え、2.5mを超える場合は沿岸部での釣りも危険です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          釣行前のチェックポイント
        </h3>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>天気予報だけでなく天気図で気圧配置の変化を確認する</li>
          <li>風向き・風速の予報を確認し、釣り場の地形との関係を考慮する</li>
          <li>波浪予報で波の高さ・うねりの周期を確認する</li>
          <li>注意報・警報が発表されていないか確認する</li>
          <li>天候が急変した場合の退避ルートをあらかじめ決めておく</li>
        </ul>

        <Point>
          <p>
            天気図で特に注意すべきパターンは、<strong>等圧線の間隔が急に狭くなっている箇所</strong>（強風域）、<strong>低気圧が急速に発達中の場合</strong>（爆弾低気圧）、<strong>寒冷前線の通過前後</strong>（突風・雷）です。「天気図は3時間おきに更新される」と覚えておきましょう。
          </p>
        </Point>

        {/* ===== 2.2 潮汐・潮流の基礎知識 ===== */}
        <h2
          id="sec2-2"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          2.2 潮汐・潮流の基礎知識
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          潮汐の仕組み
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          潮汐（ちょうせき）とは、月と太陽の引力によって海面が周期的に上下する現象です。主に<strong>月の引力</strong>の影響が大きく、月に面した側とその反対側の海面が盛り上がることで、1日に約2回の満潮と干潮が起こります（半日周潮）。満潮と干潮の間隔は約6時間12分です。
        </p>

        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">潮の種類</th>
                <th className="px-4 py-2.5 text-left">月齢の目安</th>
                <th className="px-4 py-2.5 text-left">干満差</th>
                <th className="px-4 py-2.5 text-left">特徴</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">大潮</td>
                <td className="px-4 py-2.5">新月・満月の前後</td>
                <td className="px-4 py-2.5">大きい</td>
                <td className="px-4 py-2.5">潮の動きが最も活発。魚の活性が上がりやすい</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">中潮</td>
                <td className="px-4 py-2.5">大潮と小潮の間</td>
                <td className="px-4 py-2.5">中程度</td>
                <td className="px-4 py-2.5">比較的安定した潮の動き</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">小潮</td>
                <td className="px-4 py-2.5">上弦・下弦の月の前後</td>
                <td className="px-4 py-2.5">小さい</td>
                <td className="px-4 py-2.5">潮の動きが鈍い。魚の活性が低くなりがち</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">長潮</td>
                <td className="px-4 py-2.5">小潮の翌日ごろ</td>
                <td className="px-4 py-2.5">非常に小さい</td>
                <td className="px-4 py-2.5">満潮・干潮の変化がだらだらと長く続く</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">若潮</td>
                <td className="px-4 py-2.5">長潮の翌日</td>
                <td className="px-4 py-2.5">やや回復</td>
                <td className="px-4 py-2.5">潮が「若返る」時期。大潮に向けて干満差が増加</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          潮見表の読み方
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          潮見表（タイドグラフ）は、特定の港や観測点における潮位の時間変化をグラフまたは数値で示したものです。横軸が時刻、縦軸が潮位（cm）で表され、1日の満潮・干潮の時刻と潮位を読み取ることができます。気象庁や海上保安庁が各地の潮汐予測を公表しています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          上げ潮・下げ潮と魚の活性
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          干潮から満潮に向かう時間帯を<strong>上げ潮（込み潮）</strong>、満潮から干潮に向かう時間帯を<strong>下げ潮（引き潮）</strong>と呼びます。一般に、潮が動いている時間帯は魚の活性が高くなる傾向があります。特に<strong>上げ七分・下げ三分</strong>（満潮の7割方まで潮が上がった時と、干潮に向けて3割ほど潮が引いた時）は釣れやすいとされます。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          潮目と釣果の関係
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          潮目とは、異なる水温や塩分濃度の海水がぶつかる境界線のことです。海面に泡やゴミが帯状に集まっている場所が潮目であることが多く、プランクトンや小魚が集まるため、大型魚のエサ場になりやすい好ポイントです。
        </p>

        <Exam>
          <p>
            <strong>潮汐の試験頻出ポイント:</strong>
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>大潮は<strong>新月と満月</strong>の前後に起こる（月と太陽が一直線に並ぶため）</li>
            <li>小潮は<strong>上弦の月と下弦の月</strong>の前後に起こる（月と太陽が直角に位置するため）</li>
            <li>潮汐の周期は約<strong>12時間25分</strong>（半日周潮）</li>
            <li>日本沿岸の干満差は平均1〜2m程度（有明海は最大約6mで日本一）</li>
          </ul>
        </Exam>

        {/* ===== 2.3 波浪と海象の判断 ===== */}
        <h2
          id="sec2-3"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          2.3 波浪と海象の判断
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          風浪とうねりの違い
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          波浪は大きく<strong>風浪</strong>と<strong>うねり</strong>に分けられます。風浪は風が吹いている海域で直接発生する波で、波頭が不規則に砕けるのが特徴です。一方、うねりは遠方の風域で発生した波が伝わってきたもので、波長が長く規則的です。うねりは風がなくても押し寄せるため、「今は穏やかだから大丈夫」と油断すると危険です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ダグラス波浪階級
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          国際的に使われる波浪の階級で、波の高さに応じて0〜9の10段階に分類されます。気象庁の海上予報でも活用されます。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">階級</th>
                <th className="px-4 py-2.5 text-left">波の高さ</th>
                <th className="px-4 py-2.5 text-left">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">0</td>
                <td className="px-4 py-2.5">0m</td>
                <td className="px-4 py-2.5">鏡のような海面</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">1</td>
                <td className="px-4 py-2.5">0〜0.1m</td>
                <td className="px-4 py-2.5">穏やか</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">2</td>
                <td className="px-4 py-2.5">0.1〜0.5m</td>
                <td className="px-4 py-2.5">なめらか</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">3</td>
                <td className="px-4 py-2.5">0.5〜1.25m</td>
                <td className="px-4 py-2.5">やや波がある</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">4</td>
                <td className="px-4 py-2.5">1.25〜2.5m</td>
                <td className="px-4 py-2.5">波がやや高い</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">5</td>
                <td className="px-4 py-2.5">2.5〜4m</td>
                <td className="px-4 py-2.5">波が高い</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">6〜9</td>
                <td className="px-4 py-2.5">4m〜14m以上</td>
                <td className="px-4 py-2.5">しけ〜異常な状態</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          波高と安全判断の基準
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          天気予報で発表される波の高さは「有義波高」（一定時間に観測された波のうち、高い方から3分の1の波の平均値）です。実際には有義波高の約<strong>1.5〜2倍</strong>の波が時折来ることがあり、最大波高はさらに大きくなります。堤防釣りでは有義波高1.5m以下、磯釣りでは1m以下を安全の目安としましょう。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          三角波の危険性
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          三角波とは、潮流と風浪が異なる方向からぶつかった時に生じる不規則な波のことです。波頭が三角形に尖り、予測困難な大きな波が突発的に発生します。河口付近、海峡、岬の先端など、潮流の速い場所で起きやすく、小型船舶にとって非常に危険です。
        </p>

        <Warn>
          <p>
            磯釣りでの波浪判断は命に関わります。<strong>「波は7回に1回大きいのが来る」</strong>という言い伝えは科学的にも一定の根拠があり、周期的に大きな波が押し寄せることがあります。釣り場に到着したら、すぐに竿を出さず、<strong>最低10分間は波の様子を観察</strong>してから安全を判断しましょう。
          </p>
        </Warn>

        {/* ===== 2.4 落水事故の予防と対処 ===== */}
        <h2
          id="sec2-4"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          2.4 落水事故の予防と対処
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          主な落水事故の原因
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          海上保安庁の統計によると、釣り中の海難事故は毎年多数発生しており、その多くが落水（海中転落）事故です。主な原因は以下の通りです。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li><strong>高波・うねりによる被波</strong>: 磯やテトラポッド上で波をかぶり、バランスを崩す</li>
          <li><strong>足場の滑り</strong>: 濡れた岩場、苔が付いた堤防、テトラポッドの表面で滑る</li>
          <li><strong>転倒</strong>: 夜釣りでの視界不良、荷物を持っての移動中の転倒</li>
          <li><strong>無理な姿勢</strong>: 魚のやり取り中に身を乗り出しすぎる</li>
          <li><strong>体調不良</strong>: 疲労、飲酒後の釣りによる判断力低下</li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          落水時の対処法
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          万が一落水した場合、パニックにならず冷静に行動することが生存率を大きく左右します。
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>HELP姿勢（Heat Escape Lessening Posture）</strong>: 両腕を胸の前で組み、膝を胸に引き寄せて体を丸める姿勢。体温の放散を防ぐ効果がある。ライフジャケット着用時に有効。
          </li>
          <li>
            <strong>背浮き（仰向け浮き）</strong>: ライフジャケットがない場合、仰向けになり大の字に手足を広げて浮力を確保する。呼吸を確保しながら体力の消耗を抑える。
          </li>
          <li>
            <strong>衣服を脱がない</strong>: 衣服には保温効果と浮力がある。靴も脱がない方がよい（足の保護）。
          </li>
          <li>
            <strong>岸に向かって泳ぐ際の注意</strong>: 離岸流に逆らって泳がず、岸と平行に移動してから岸に向かう。
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          人が落水した場合の救助手順
        </h3>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li><strong>「人が落ちた!」と大声で知らせる</strong>。周囲の人に助けを求める。</li>
          <li><strong>浮くものを投げ入れる</strong>: クーラーボックス、ペットボトル、ロープなど。</li>
          <li><strong>118番（海上保安庁）に通報</strong>: 落水場所、人数、状況を伝える。</li>
          <li><strong>自分は飛び込まない</strong>: 二次災害を防ぐため、泳いで助けに行くのは最後の手段。</li>
        </ol>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          通報の手順
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          海での事故は<strong>118番（海上保安庁）</strong>に通報します。携帯電話からでもかけられます。河川や湖沼での事故は119番（消防）または110番（警察）に通報します。通報時には<strong>場所（地名・目印）、事故の内容、けが人の有無、通報者の氏名と連絡先</strong>を伝えましょう。
        </p>

        <Warn>
          <p>
            <strong>テトラポッドでの釣りは非常に危険です。</strong>テトラポッドの隙間に落ちると、複雑な形状のために自力での脱出がほぼ不可能になります。波をかぶると隙間に引き込まれるおそれもあります。多くの漁港でテトラポッド上での釣りは禁止されています。テトラポッドには絶対に乗らないことが最善の安全対策です。
          </p>
        </Warn>

        {/* ===== 2.5 落雷・熱中症・低体温症対策 ===== */}
        <h2
          id="sec2-5"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          2.5 落雷・熱中症・低体温症対策
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          落雷のメカニズムと危険な状況
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          雷は積乱雲（入道雲）の中で氷の粒がぶつかり合うことで静電気が発生し、地上との間で放電する現象です。特に<strong>夏の午後</strong>に発生しやすく、寒冷前線の通過時にも多発します。雷は高い所に落ちやすい性質がありますが、平坦な場所では人間が最も高い突起物になるため危険です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          釣竿が雷を引きやすい理由と対処法
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣竿はカーボン（炭素繊維）製が主流であり、カーボンは電気を通します。長さが5〜6mにもなる釣竿を持ち上げた状態は、避雷針のように雷を引き寄せる危険があります。<strong>雷鳴が聞こえたら直ちに釣竿を置き</strong>、安全な場所に退避してください。車の中は比較的安全です。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>雷鳴が聞こえたら即座に退避。「まだ遠い」は禁物（雷は10km以上離れた場所にも落ちる）</li>
          <li>建物や車の中に退避する。木の下は側撃雷の危険があるため避ける</li>
          <li>退避できない場合は、姿勢を低くし、両足を揃えてしゃがむ（地面に伏せない）</li>
          <li>金属を身から外す必要はない（金属が雷を「引く」というのは誤解）</li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          熱中症の症状と予防策
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          夏場の釣りでは熱中症のリスクが非常に高くなります。堤防や磯は日陰がなく、照り返しも強いため、気温以上に体感温度が上がります。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">重症度</th>
                <th className="px-4 py-2.5 text-left">症状</th>
                <th className="px-4 py-2.5 text-left">対応</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">I度（軽症）</td>
                <td className="px-4 py-2.5">めまい、立ちくらみ、筋肉のけいれん（こむら返り）</td>
                <td className="px-4 py-2.5">涼しい場所に移動、水分・塩分補給</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">II度（中等症）</td>
                <td className="px-4 py-2.5">頭痛、吐き気、倦怠感、判断力の低下</td>
                <td className="px-4 py-2.5">体を冷やし、経口補水液を摂取。改善しなければ医療機関へ</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">III度（重症）</td>
                <td className="px-4 py-2.5">意識障害、けいれん、高体温（40度以上）</td>
                <td className="px-4 py-2.5">直ちに119番通報。全身を冷やす応急処置</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-sm leading-relaxed">
          予防策としては、<strong>こまめな水分補給</strong>（喉が渇く前に飲む）、<strong>帽子・日焼け止め</strong>の使用、<strong>定期的な休憩</strong>（日陰で体を冷やす）、<strong>単独釣行を避ける</strong>（体調悪化時に助けを求められるように）が挙げられます。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          低体温症のリスク
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          低体温症は体の深部体温が35度以下に下がった状態で、冬場の釣りや落水後に特に危険です。水中では空気中の約<strong>25倍</strong>の速さで体温が奪われるため、落水後はたとえ水温が高めでも急速に体温が低下します。症状は震え→判断力低下→意識障害と進行し、最終的に心停止に至ることがあります。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          冬の釣りでは防寒着を重ね着し、風を通さないアウターを着用することが重要です。濡れた衣服はすぐに着替え、温かい飲み物を摂るようにしましょう。
        </p>

        <Warn>
          <p>
            <strong>雷鳴が聞こえたら即座に退避してください。</strong>「光ってから音が聞こえるまで何秒」で距離を測る方法がありますが、安全のためには<strong>雷鳴が聞こえた時点で既に落雷圏内</strong>と考えるべきです。釣竿は直ちに寝かせ、堤防や磯から離れて安全な場所に移動しましょう。
          </p>
        </Warn>

        {/* ===== 2.6 救命胴衣と安全装備 ===== */}
        <h2
          id="sec2-6"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          2.6 救命胴衣と安全装備
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          救命胴衣（ライフジャケット）の種類
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          救命胴衣は大きく<strong>固型式（浮力体式）</strong>と<strong>膨脹式</strong>に分けられます。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">種類</th>
                <th className="px-4 py-2.5 text-left">仕組み</th>
                <th className="px-4 py-2.5 text-left">メリット</th>
                <th className="px-4 py-2.5 text-left">デメリット</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">固型式（浮力体式）</td>
                <td className="px-4 py-2.5">発泡素材による浮力</td>
                <td className="px-4 py-2.5">確実に浮く。メンテナンス不要。衝撃吸収効果あり</td>
                <td className="px-4 py-2.5">かさばる。動きにくい</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">膨脹式（自動）</td>
                <td className="px-4 py-2.5">水を感知して自動でCO2ガスが充填</td>
                <td className="px-4 py-2.5">コンパクト。動きやすい</td>
                <td className="px-4 py-2.5">定期的なボンベ交換が必要。岩場での破損リスク</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">膨脹式（手動）</td>
                <td className="px-4 py-2.5">紐を引いてCO2ガスを充填</td>
                <td className="px-4 py-2.5">意図しない膨張がない。コンパクト</td>
                <td className="px-4 py-2.5">意識を失った場合に膨張しない</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          桜マーク（型式承認）の意味
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          国土交通省が定める安全基準に適合した救命胴衣には<strong>桜マーク</strong>（型式承認マーク）が付いています。桜マークにはタイプA〜Dまであり、タイプによって使用できる航行区域が異なります。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li><strong>タイプA</strong>: すべての航行区域で使用可能（浮力7.5kg以上）</li>
          <li><strong>タイプD</strong>: 平水区域のみ（浮力5.85kg以上）</li>
          <li><strong>タイプF</strong>: 浮力補助具（法定要件を満たさないが安全性あり）</li>
          <li><strong>タイプG</strong>: 小型船舶用（浮力が少なめで動きやすい設計）</li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          小型船舶でのライフジャケット着用義務化
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          2018年（平成30年）2月から、小型船舶の乗船者は<strong>桜マーク付きのライフジャケットの着用が義務化</strong>されました（船舶職員及び小型船舶操縦者法）。違反した場合、船長に違反点数が付けられます。遊漁船を利用する際も乗客全員が着用義務の対象です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          その他の安全装備
        </h3>
        <ul className="mb-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>スパイクシューズ・フェルトスパイクシューズ</strong>: 滑りやすい磯場では必須。フェルトのみのシューズは濡れた平面で滑りやすいため、スパイク付きが望ましい。
          </li>
          <li>
            <strong>フローティングベスト（ゲームベスト）</strong>: 浮力を持ちつつ、ルアーケースなどの収納も兼ねた機能的なベスト。磯やサーフでの釣りに適している。
          </li>
          <li>
            <strong>ホイッスル</strong>: 落水時や緊急時に周囲に知らせるための必携品。救命胴衣に付属しているものもある。
          </li>
          <li>
            <strong>ヘッドライト</strong>: 夜釣りでの視界確保に必須。赤色フィルター付きなら魚を驚かせにくい。
          </li>
          <li>
            <strong>携帯電話の防水ケース</strong>: 緊急通報手段を確保するため、防水ケースに入れて携帯する。
          </li>
        </ul>

        <Point>
          <p>
            桜マーク付きライフジャケットの重要性: 2018年の義務化以降、<strong>小型船舶（遊漁船含む）ではタイプA以上の桜マーク付きライフジャケット</strong>の着用が必須です。CE認証など外国規格のみの製品は法的要件を満たしません。購入時は必ず桜マークの有無を確認しましょう。
          </p>
        </Point>

        <TsuriSpotBox>
          <p>
            ツリスポの{" "}
            <Link
              href="/safety"
              className="font-medium underline"
            >
              「安全ガイド」ページ
            </Link>{" "}
            では、釣り場での安全対策や装備の選び方をより詳しく解説しています。初心者の方はぜひ合わせてご確認ください。
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
            第2章のポイント
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong>天気図の基本</strong>: 等圧線の間隔が狭い=風が強い。前線の種類と特徴を理解する
            </li>
            <li>
              <strong>気圧配置</strong>: 西高東低（冬型）は北西の季節風、南岸低気圧は太平洋側で荒天
            </li>
            <li>
              <strong>潮汐の種類</strong>: 大潮（新月・満月）、小潮（上弦・下弦）、周期は約12時間25分
            </li>
            <li>
              <strong>有義波高</strong>: 実際には1.5〜2倍の波が来ることがある。磯は波高1m以下が目安
            </li>
            <li>
              <strong>落水時の対処</strong>: HELP姿勢・背浮き。通報は海なら118番、川は119番
            </li>
            <li>
              <strong>落雷対策</strong>: 雷鳴が聞こえたら即退避。釣竿は避雷針代わりになる
            </li>
            <li>
              <strong>救命胴衣</strong>: 桜マーク付き必須。2018年から小型船舶で着用義務化
            </li>
          </ul>
        </div>

        {/* ===== 章末確認クイズ CTA ===== */}
        <div className="mt-8 rounded-xl border-2 border-purple-200 bg-purple-50 p-6 text-center">
          <h2 className="text-xl font-bold text-purple-800">確認クイズに挑戦</h2>
          <p className="mt-2 text-sm text-purple-600">全40問の4択クイズで理解度をチェック</p>
          <Link
            href="/instructor-exam/safety/quiz"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700"
          >
            クイズを始める
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* ナビ */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Link
            href="/instructor-exam/law"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            &larr; 第1章 漁業関連法規
          </Link>
          <Link
            href="/instructor-exam/manners"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            第3章 マナーと指導法 &rarr;
          </Link>
        </div>

        {/* 免責 */}
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <p>
            本ページの情報は2025年時点の内容に基づいています。最新の改正については各法令の原文または
            <a
              href="https://www.zenturi-jofi.or.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              全釣り協公式サイト
            </a>
            をご確認ください。当サイトは全日本釣り団体協議会とは無関係の非公式学習サイトです。
          </p>
        </div>
      </div>
    </>
  );
}
