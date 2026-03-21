import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam, TsuriSpotBox, Analogy } from "@/components/instructor-exam/callouts";
import { ExamQuiz } from "@/components/instructor-exam/exam-quiz";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第5章 釣り具の知識 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第5章。釣りの六物（竿・糸・針・浮き・重り・餌）、ロッド・リール・ラインの種類と特性、針の部位名称、仕掛けの基礎を体系的に解説。章末確認クイズ40問付き。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/tackle`,
  },
};

/* ============================================================
   ページ本体
   ============================================================ */

export default function TacklePage() {
  return (
    <>
      {/* JSON-LD */}
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
                name: "釣り具の知識",
                item: `${baseUrl}/instructor-exam/tackle`,
              },
            ],
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
            <li className="font-medium text-foreground">釣り具の知識</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">第5章</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">釣り具の知識</h1>
          <p className="mt-2 text-sky-200">
            竿・リール・糸・針・仕掛けなど、釣り具の基本構造と選び方を体系的に学びます。
          </p>
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-base font-bold">目次</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec5-1" className="text-sky-700 hover:underline">
                5.1 釣りの六物
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec5-2" className="text-sky-700 hover:underline">
                5.2 竿（ロッド）
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec5-3" className="text-sky-700 hover:underline">
                5.3 リール
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec5-4" className="text-sky-700 hover:underline">
                5.4 糸（ライン）
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec5-5" className="text-sky-700 hover:underline">
                5.5 針（フック）
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec5-6" className="text-sky-700 hover:underline">
                5.6 仕掛け
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#summary" className="text-sky-700 hover:underline">
                章末まとめ &amp; 確認クイズ
              </a>
            </li>
          </ul>
        </div>

        {/* ===== 5.1 釣りの六物 ===== */}
        <h2
          id="sec5-1"
          className="mb-4 mt-10 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          5.1 釣りの六物（ろくもつ）
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          日本では伝統的に、釣りに必要な基本的な道具を<strong>「六物（ろくもつ）」</strong>と呼んでいます。これは釣りの最も基本的な構成要素であり、試験でも出題される基礎知識です。
        </p>

        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">六物</th>
                <th className="px-4 py-2.5 text-left">現代の用語</th>
                <th className="px-4 py-2.5 text-left">役割</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">竿（さお）</td>
                <td className="px-4 py-2.5">ロッド</td>
                <td className="px-4 py-2.5">仕掛けを飛ばし、魚とのやり取りをする</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">糸（いと）</td>
                <td className="px-4 py-2.5">ライン</td>
                <td className="px-4 py-2.5">竿と仕掛けをつなぎ、魚の引きを伝える</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">針（はり）</td>
                <td className="px-4 py-2.5">フック</td>
                <td className="px-4 py-2.5">魚を掛ける</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">浮き（うき）</td>
                <td className="px-4 py-2.5">フロート / ウキ</td>
                <td className="px-4 py-2.5">仕掛けの深さを調整し、アタリを伝える</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">重り（おもり）</td>
                <td className="px-4 py-2.5">シンカー / オモリ</td>
                <td className="px-4 py-2.5">仕掛けを沈め、飛距離を出す</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">餌（えさ）</td>
                <td className="px-4 py-2.5">ベイト / ルアー</td>
                <td className="px-4 py-2.5">魚を誘い、食いつかせる</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Exam>
          <p>
            「釣りの六物とは何か」は基本中の基本として出題されます。<strong>竿・糸・針・浮き・重り・餌</strong>の6つを確実に覚えておきましょう。現代のルアーフィッシングでは浮きや餌を使わない場合もありますが、六物は伝統的な分類として重要です。
          </p>
        </Exam>

        {/* ===== 5.2 竿（ロッド） ===== */}
        <h2
          id="sec5-2"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          5.2 竿（ロッド）
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">素材</h3>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">素材</th>
                <th className="px-4 py-2.5 text-left">特徴</th>
                <th className="px-4 py-2.5 text-left">主な用途</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">カーボン（炭素繊維）</td>
                <td className="px-4 py-2.5">軽量・高感度・反発力が強い。現在の主流素材</td>
                <td className="px-4 py-2.5">ほぼ全ての釣種</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">グラスファイバー</td>
                <td className="px-4 py-2.5">粘り強い・しなやか・丈夫。カーボンよりやや重い</td>
                <td className="px-4 py-2.5">船竿、初心者用、トローリング</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">竹（和竿）</td>
                <td className="px-4 py-2.5">伝統素材。独特のしなりと手触り。職人の手作り</td>
                <td className="px-4 py-2.5">ヘラブナ釣り、テンカラ、ハゼ釣り</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">竿の種類</h3>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">竿の種類</th>
                <th className="px-4 py-2.5 text-left">特徴</th>
                <th className="px-4 py-2.5 text-left">主な対象魚</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">磯竿</td>
                <td className="px-4 py-2.5">長尺（4.5〜5.3m）、柔軟な穂先</td>
                <td className="px-4 py-2.5">グレ、クロダイ</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">投げ竿</td>
                <td className="px-4 py-2.5">遠投性能を重視（3.6〜4.25m）</td>
                <td className="px-4 py-2.5">キス、カレイ</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">船竿</td>
                <td className="px-4 py-2.5">短め（1.5〜2.4m）、パワー重視</td>
                <td className="px-4 py-2.5">マダイ、ブリ、ヒラメ</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">ルアーロッド</td>
                <td className="px-4 py-2.5">感度・操作性重視（1.8〜3m）</td>
                <td className="px-4 py-2.5">スズキ、青物、アジ、メバル</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">渓流竿</td>
                <td className="px-4 py-2.5">リールなしの延べ竿（5〜7m）</td>
                <td className="px-4 py-2.5">ヤマメ、イワナ、アマゴ</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          号数・調子の意味
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          竿の<strong>号数</strong>は竿の硬さ（パワー）を表します。磯竿の場合、1号は柔らかく、5号は硬い竿です。投げ竿では「号数」がオモリの適合範囲を示します（25号=オモリ25号に対応）。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>調子</strong>とは竿の曲がり方のことで、主に以下の2種類があります。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">調子</th>
                <th className="px-4 py-2.5 text-left">曲がり方</th>
                <th className="px-4 py-2.5 text-left">特徴</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">先調子（7:3）</td>
                <td className="px-4 py-2.5">穂先側3割が主に曲がる</td>
                <td className="px-4 py-2.5">感度が良い、アタリを取りやすい、合わせがシャープ</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">胴調子（5:5 / 6:4）</td>
                <td className="px-4 py-2.5">竿全体が均等に曲がる</td>
                <td className="px-4 py-2.5">魚の引きを吸収しやすい、バラシにくい、大物向き</td>
              </tr>
            </tbody>
          </table>
        </div>

        <TsuriSpotBox>
          <p>
            ツリスポの{" "}
            <Link
              href="/gear"
              className="font-medium underline"
            >
              「おすすめ釣り道具」ページ
            </Link>{" "}
            では、初心者向けのロッドやリールの選び方も紹介しています。
          </p>
        </TsuriSpotBox>

        {/* ===== 5.3 リール ===== */}
        <h2
          id="sec5-3"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          5.3 リール
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          スピニングリール vs ベイトリール
        </h3>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">項目</th>
                <th className="px-4 py-2.5 text-left">スピニングリール</th>
                <th className="px-4 py-2.5 text-left">ベイトリール（両軸リール）</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">糸の巻き方</td>
                <td className="px-4 py-2.5">スプールに平行に巻く</td>
                <td className="px-4 py-2.5">スプールの回転で巻き取る</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">扱いやすさ</td>
                <td className="px-4 py-2.5">初心者でも扱いやすい</td>
                <td className="px-4 py-2.5">バックラッシュの恐れがあり慣れが必要</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">飛距離</td>
                <td className="px-4 py-2.5">軽い仕掛けでも飛ばしやすい</td>
                <td className="px-4 py-2.5">重い仕掛け・ルアー向き</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">パワー</td>
                <td className="px-4 py-2.5">中〜軽量</td>
                <td className="px-4 py-2.5">巻き上げ力が強い</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">主な用途</td>
                <td className="px-4 py-2.5">磯、投げ、ライトゲーム全般</td>
                <td className="px-4 py-2.5">船、バス釣り、ジギング</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Analogy>
          <p>
            <strong>自転車に例えると:</strong> スピニングリールはママチャリのようなもの -- 誰でもすぐに使えて汎用性が高い。ベイトリールはロードバイク -- 扱いに慣れれば高性能を発揮するが、初心者には少し難しい。
          </p>
        </Analogy>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ドラグの仕組みと調整
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>ドラグ</strong>とは、魚が強く引いたときに一定の負荷でラインを送り出す機構です。ドラグを適切に調整することで、ラインの破断を防ぎ、魚を安全に取り込むことができます。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>ドラグの設定値は、使用するラインの強度の<strong>1/3〜1/4</strong>程度が一般的</li>
          <li>ドラグが緩すぎると魚が走りすぎてラインを出され切る</li>
          <li>ドラグが締まりすぎるとラインが切れたり、竿が折れたりする</li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ギア比の意味
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          リールのギア比は、ハンドル1回転あたりのローターの回転数を表します。例えばギア比 5.2:1 は、ハンドル1回転でローターが5.2回転することを意味します。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li><strong>ローギア（5.0以下）</strong>: 巻き上げ力が強い。大物とのやり取りに向く</li>
          <li><strong>ハイギア（6.0以上）</strong>: 糸の回収が速い。ルアーの操作性が良い</li>
          <li><strong>ノーマルギア</strong>: バランス型。汎用性が高い</li>
        </ul>

        {/* ===== 5.4 糸（ライン） ===== */}
        <h2
          id="sec5-4"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          5.4 糸（ライン）
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          釣り糸は大きく3種類に分けられます。それぞれの素材の特性を理解することは、適切な仕掛け選びの基本です。
        </p>

        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">素材</th>
                <th className="px-4 py-2.5 text-left">伸び</th>
                <th className="px-4 py-2.5 text-left">比重</th>
                <th className="px-4 py-2.5 text-left">耐摩耗性</th>
                <th className="px-4 py-2.5 text-left">主な用途</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">ナイロン</td>
                <td className="px-4 py-2.5">よく伸びる</td>
                <td className="px-4 py-2.5">1.14（ゆっくり沈む）</td>
                <td className="px-4 py-2.5">普通</td>
                <td className="px-4 py-2.5">道糸全般、初心者向け</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">フロロカーボン</td>
                <td className="px-4 py-2.5">伸びにくい</td>
                <td className="px-4 py-2.5">1.78（速く沈む）</td>
                <td className="px-4 py-2.5">高い</td>
                <td className="px-4 py-2.5">ハリス、リーダー、根ズレ対策</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">PE（ポリエチレン）</td>
                <td className="px-4 py-2.5">ほぼ伸びない</td>
                <td className="px-4 py-2.5">0.97（水に浮く）</td>
                <td className="px-4 py-2.5">低い（根ズレに弱い）</td>
                <td className="px-4 py-2.5">ルアー、ジギング、遠投</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Point>
          <p>
            ラインの<strong>号数</strong>は太さ（断面積）を表す日本独自の単位です。号数が大きいほど太く強い糸です。一方、<strong>lb（ポンド）</strong>は引っ張り強度を表します。同じ号数でも素材によってlb数が異なるため注意が必要です（PEラインは細くても強い）。
          </p>
        </Point>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          リーダーの役割
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          PEラインは根ズレに弱いため、先端にフロロカーボンやナイロンの<strong>リーダー（ショックリーダー）</strong>を結んで使用します。リーダーの役割は以下の通りです。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>根ズレ・歯ズレからPEラインを保護する</li>
          <li>PEラインの高い視認性を軽減する（フロロカーボンは水中で目立ちにくい）</li>
          <li>キャスト時のガイド抜けを良くする</li>
        </ul>

        <Exam>
          <p>
            ナイロン・フロロカーボン・PEの<strong>3種の特性比較</strong>は頻出です。特に「比重」の違い（ナイロン: 沈む、フロロ: 速く沈む、PE: 浮く）と「伸び」の違いは必ず覚えておきましょう。
          </p>
        </Exam>

        {/* ===== 5.5 針（フック） ===== */}
        <h2
          id="sec5-5"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          5.5 針（フック）
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          針の部位名称
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣り針の各部位には専門的な名称があります。インストラクターとして正確に説明できるようにしましょう。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>チモト（耳）</strong>: ハリスを結ぶ部分。環付き（管付き）と平打ちがある
          </li>
          <li>
            <strong>軸（シャンク）</strong>: チモトからフトコロまでの直線部分
          </li>
          <li>
            <strong>フトコロ（ゲイプ）</strong>: 針の曲がった内側の幅。広いほどフッキング率が上がる
          </li>
          <li>
            <strong>先端（ポイント）</strong>: 魚に刺さる尖った部分
          </li>
          <li>
            <strong>カエシ（バーブ）</strong>: 先端近くの突起。刺さった針が抜けにくくする
          </li>
          <li>
            <strong>腰曲げ（ベンド）</strong>: 針の曲がり部分全体
          </li>
        </ul>

        <Point>
          <p>
            <strong>バーブレスフック</strong>（カエシがない針）は、魚へのダメージが少なくリリースしやすいというメリットがあります。キャッチ&amp;リリースの釣りや、子ども向けの釣り教室では安全面からバーブレスフックの使用が推奨されます。
          </p>
        </Point>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          針の種類
        </h3>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">針の種類</th>
                <th className="px-4 py-2.5 text-left">特徴</th>
                <th className="px-4 py-2.5 text-left">主な対象魚</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">丸セイゴ</td>
                <td className="px-4 py-2.5">汎用性が高い万能型</td>
                <td className="px-4 py-2.5">スズキ、クロダイ、カサゴ等</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">チヌ針</td>
                <td className="px-4 py-2.5">フトコロが広く、軸が太い</td>
                <td className="px-4 py-2.5">クロダイ（チヌ）</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">袖針</td>
                <td className="px-4 py-2.5">軸が長く細い、外しやすい</td>
                <td className="px-4 py-2.5">小物（ハゼ、アジ等）、サビキ</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">グレ（メジナ）針</td>
                <td className="px-4 py-2.5">軸が短く、フトコロが深い</td>
                <td className="px-4 py-2.5">グレ（メジナ）</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">伊勢尼</td>
                <td className="px-4 py-2.5">太軸で強い、大物対応</td>
                <td className="px-4 py-2.5">大型魚全般</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">キツネ針</td>
                <td className="px-4 py-2.5">先曲がりが鋭角、口が小さい魚向き</td>
                <td className="px-4 py-2.5">キス、ワカサギ</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== 5.6 仕掛け ===== */}
        <h2
          id="sec5-6"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          5.6 仕掛け
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          完成仕掛けの構成
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          仕掛けは竿・リールのラインの先に取り付ける、釣りの「ビジネスエンド」（実際に魚を釣る部分）です。基本的な構成要素は以下の通りです。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>道糸（メインライン）</strong>: リールに巻いてある糸
          </li>
          <li>
            <strong>ハリス</strong>: 道糸の先に結ぶ細い糸。魚に見破られにくくする
          </li>
          <li>
            <strong>針</strong>: ハリスの先端に結ぶ
          </li>
          <li>
            <strong>オモリ（シンカー）</strong>: 仕掛けを沈め、飛距離を出す
          </li>
          <li>
            <strong>ウキ（フロート）</strong>: 仕掛けの深さを調整し、アタリを視覚的に伝える
          </li>
          <li>
            <strong>サルカン（スイベル）</strong>: 道糸とハリスの接続に使い、糸のヨレを防ぐ
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          天秤・テンビン・小物類
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          仕掛けをより効果的に機能させるための小物類があります。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>天秤（テンビン）</strong>: 投げ釣りで使用。道糸とハリスの絡みを防ぎ、オモリの役割も兼ねる。L型天秤、ジェット天秤などの種類がある
          </li>
          <li>
            <strong>サルカン（スイベル）</strong>: 回転する連結金具。道糸とハリスの間に入れて糸のヨレを防止する
          </li>
          <li>
            <strong>スナップ</strong>: ワンタッチで仕掛けやルアーを交換できる金具
          </li>
          <li>
            <strong>ガン玉・割りビシ</strong>: ハリスに付ける小型のオモリ。仕掛けの沈降速度を微調整する
          </li>
          <li>
            <strong>ウキ止め・シモリ玉</strong>: ウキの移動範囲を制限し、タナ（深さ）を設定する
          </li>
        </ul>

        <Exam>
          <p>
            仕掛けの各パーツの名称と役割は試験で問われやすい分野です。特に<strong>道糸・ハリスの役割の違い</strong>（道糸は竿からの力を伝達、ハリスは魚に見破られにくい細い糸）、<strong>サルカンの役割</strong>（糸ヨレ防止）は頻出です。
          </p>
        </Exam>

        {/* ===== 章末まとめ ===== */}
        <h2
          id="summary"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          章末まとめ
        </h2>

        <div className="mb-8 rounded-xl border-2 border-sky-400 bg-gradient-to-br from-sky-50 to-blue-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-sky-900">
            第5章のポイント
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong>六物</strong>: 竿・糸・針・浮き・重り・餌の6つが釣りの基本構成要素
            </li>
            <li>
              <strong>竿の素材</strong>: カーボン（軽量・高感度）、グラス（粘り強い）、竹（伝統）
            </li>
            <li>
              <strong>竿の調子</strong>: 先調子（感度重視）と胴調子（大物向き）
            </li>
            <li>
              <strong>リール</strong>: スピニング（汎用・初心者向き）とベイト（パワー・精度重視）
            </li>
            <li>
              <strong>ドラグ</strong>: ライン強度の1/3〜1/4程度に設定するのが基本
            </li>
            <li>
              <strong>ライン3種</strong>: ナイロン（伸びる）、フロロ（沈む・硬い）、PE（伸びない・浮く）
            </li>
            <li>
              <strong>針の部位</strong>: チモト、軸、フトコロ、先端、カエシ、腰曲げ
            </li>
            <li>
              <strong>バーブレスフック</strong>: リリースしやすく安全。子ども向け教室に推奨
            </li>
            <li>
              <strong>サルカン</strong>: 糸ヨレ防止の回転連結金具
            </li>
          </ul>
        </div>

        {/* ===== 章末確認クイズ 40問 ===== */}
        <h2 className="mb-4 text-xl font-bold text-sky-900">
          章末確認クイズ（全40問）
        </h2>

        <ExamQuiz
          questions={[
            {
              id: "tackle-5-2",
              question: "先調子の竿の特徴として正しいものはどれか？",
              choices: [
                "竿全体が均等に曲がる",
                "穂先側が主に曲がり、感度が良い",
                "大物の引きを吸収しやすい",
                "遠投に最も適している",
              ],
              correctIndex: 1,
              explanation:
                "先調子（7:3調子）は穂先側3割が主に曲がる竿で、アタリを取りやすく感度に優れています。竿全体が曲がるのは胴調子の特徴です。",
              choiceExplanations: [
                "竿全体が均等に曲がるのは胴調子（5:5 / 6:4）の特徴です。先調子は穂先側が主に曲がる竿です。",
                "先調子（7:3）は穂先側3割が主に曲がる竿で、アタリの伝達が良く感度に優れています。合わせもシャープに決まるため、繊細な釣りに適しています。",
                "大物の引きを吸収しやすいのは胴調子の特徴です。先調子は感度重視で、大物とのやり取りでは胴調子に劣る場合があります。",
                "遠投性能は主に竿の長さやオモリの適合範囲に依存します。先調子であることが直接遠投に最も適しているわけではありません。",
              ],
            },
            {
              id: "tackle-5-3",
              question: "スピニングリールの特徴として正しいものはどれか？",
              choices: [
                "巻き上げ力が最も強い",
                "バックラッシュが起きやすい",
                "初心者でも扱いやすく、軽い仕掛けでも飛ばしやすい",
                "主に船釣り専用のリールである",
              ],
              correctIndex: 2,
              explanation:
                "スピニングリールはバックラッシュ（糸のもつれ）が起きにくく、初心者でも扱いやすいのが最大の特徴です。軽い仕掛けでもキャストしやすく、最も汎用性の高いリールです。",
              choiceExplanations: [
                "巻き上げ力が最も強いのはベイトリール（両軸リール）の特徴です。スピニングリールは中〜軽量のパワーが中心です。",
                "バックラッシュが起きやすいのはベイトリールの弱点です。スピニングリールはスプールが回転しないため、バックラッシュが起きにくい構造です。",
                "スピニングリールは初心者でも扱いやすく、軽い仕掛けでもキャストしやすいのが最大の特徴です。磯釣り、投げ釣り、ライトゲームなど幅広い釣種に対応します。",
                "船釣り専用ではなく、最も汎用性の高いリールです。磯、投げ、ライトゲームなどあらゆる釣種で使用されます。",
              ],
            },
            {
              id: "tackle-5-4",
              question: "PE（ポリエチレン）ラインの特徴として正しいものはどれか？",
              choices: [
                "よく伸びてショックを吸収する",
                "比重が高く速く沈む",
                "ほぼ伸びず感度が高いが、根ズレに弱い",
                "耐摩耗性が最も高い",
              ],
              correctIndex: 2,
              explanation:
                "PEラインは伸びがほぼなく高感度ですが、編み込み構造のため根ズレ（岩や障害物との摩擦）に弱いのが欠点です。比重は0.97で水に浮きます。",
              choiceExplanations: [
                "よく伸びるのはナイロンラインの特徴です。PEラインはほぼ伸びず、ショック吸収力は低いため、リーダーを使用して補います。",
                "比重が高く速く沈むのはフロロカーボン（比重1.78）の特徴です。PEラインの比重は0.97で、水に浮く性質があります。",
                "PEラインは編み込み構造（ブレイデッドライン）でほぼ伸びがなく、高い感度を持ちます。一方、根ズレ（岩や障害物との摩擦）に弱いのが最大の欠点で、リーダーの使用が必須です。",
                "耐摩耗性が最も高いのはフロロカーボンです。PEラインは編み込み構造のため摩擦に弱く、根ズレで簡単に切れることがあります。",
              ],
            },
            {
              id: "tackle-5-5",
              question: "釣り針の「カエシ（バーブ）」の役割として正しいものはどれか？",
              choices: [
                "針の強度を上げる",
                "刺さった針が抜けにくくする",
                "エサを固定しやすくする",
                "糸を結びやすくする",
              ],
              correctIndex: 1,
              explanation:
                "カエシ（バーブ）は針の先端近くにある返しの突起で、一度刺さった針が抜けにくくする役割があります。バーブレスフック（カエシなし）はリリースしやすい反面、魚がバレやすくなります。",
              choiceExplanations: [
                "カエシは針の強度を上げるための構造ではありません。針の強度は主に軸の太さや素材に依存します。",
                "カエシ（バーブ）は針の先端近くにある返しの突起で、一度魚に刺さった針が簡単に抜けないようにする役割があります。これにより魚がバレる（外れる）のを防ぎます。",
                "エサの固定はカエシの主な役割ではありません。エサは主に針の軸やフトコロの形状によって保持されます。",
                "糸を結ぶ部分はチモト（耳）であり、カエシとは異なる部位です。カエシは針先端の近くにある構造です。",
              ],
            },
            {
              id: "tackle-5-6",
              question: "サルカン（スイベル）の主な役割として正しいものはどれか？",
              choices: [
                "仕掛けの飛距離を伸ばす",
                "道糸とハリスの間で糸のヨレを防止する",
                "魚のアタリを増幅させる",
                "ウキの移動範囲を制限する",
              ],
              correctIndex: 1,
              explanation:
                "サルカン（スイベル）は回転する連結金具で、道糸とハリスの間に入れることで糸のヨレ（ねじれ）を防止します。ウキの移動範囲を制限するのはウキ止めの役割です。",
              choiceExplanations: [
                "仕掛けの飛距離を伸ばすのはオモリや天秤の役割です。サルカンは接続部品であり、飛距離向上には直接寄与しません。",
                "サルカン（スイベル）は回転する連結金具で、道糸とハリスの間に入れて糸のヨレ（ねじれ）を防止する役割があります。糸ヨレは仕掛けの絡みやライントラブルの原因になるため、重要な小物です。",
                "サルカンにはアタリを増幅させる機能はありません。アタリの伝達は主にラインの性質（伸びの少なさ等）や竿の感度に依存します。",
                "ウキの移動範囲を制限するのはウキ止め・シモリ玉の役割です。サルカンは糸の接続・ヨレ防止のための金具です。",
              ],
            },
            {
              id: "tackle-end-1",
              question: "釣りの「六物（ろくもつ）」に含まれないものはどれか？",
              choices: [
                "竿",
                "浮き",
                "リール",
                "餌",
              ],
              correctIndex: 2,
              explanation:
                "六物は竿・糸・針・浮き・重り・餌の6つです。リールは六物の時代には存在しなかった近代的な道具であり、伝統的な六物には含まれません。",
              choiceExplanations: [
                "竿（さお）は六物の一つです。仕掛けを飛ばし、魚とのやり取りをする基本的な道具です。",
                "浮き（うき）は六物の一つです。仕掛けの深さを調整し、アタリを伝える役割があります。",
                "リールは近代に発明された道具であり、伝統的な六物（竿・糸・針・浮き・重り・餌）には含まれません。六物の概念が成立した時代にはリールは存在しませんでした。",
                "餌（えさ）は六物の一つです。魚を誘い、食いつかせるための基本構成要素です。",
              ],
            },
            {
              id: "tackle-end-2",
              question: "カーボン素材の竿の特徴として正しいものはどれか？",
              choices: [
                "しなやかで粘り強い",
                "軽量で感度が高い",
                "最も安価で初心者向け",
                "伝統的な素材で和竿に使われる",
              ],
              correctIndex: 1,
              explanation:
                "カーボン（炭素繊維）の竿は軽量で感度が高く反発力に優れ、現在の主流素材です。しなやかで粘り強いのはグラスファイバー、伝統素材は竹の特徴です。",
              choiceExplanations: [
                "しなやかで粘り強いのはグラスファイバー素材の特徴です。カーボンは軽量で反発力が強く、グラスに比べると硬めの性質があります。",
                "カーボン（炭素繊維）は軽量で感度が高く、反発力に優れた現在の主流素材です。ほぼ全ての釣種で使用されています。",
                "カーボンロッドは高品質な素材のため、必ずしも最も安価ではありません。グラスファイバー製の竿の方が一般的に安価です。",
                "伝統的な和竿に使われる素材は竹です。カーボンは近代に開発された合成素材であり、伝統的な素材ではありません。",
              ],
            },
            {
              id: "tackle-end-3",
              question: "「胴調子」の竿の特徴として正しいものはどれか？",
              choices: [
                "穂先だけが曲がり、感度が良い",
                "竿全体が曲がり、魚の引きを吸収しやすい",
                "全く曲がらず、硬い",
                "船釣り専用の調子である",
              ],
              correctIndex: 1,
              explanation:
                "胴調子（5:5 や 6:4）は竿全体が均等に曲がる竿で、魚の引きを吸収しやすくバラシにくい特性があります。穂先だけが曲がるのは先調子の特徴です。",
              choiceExplanations: [
                "穂先だけが曲がり感度が良いのは先調子（7:3）の特徴です。胴調子は竿全体が曲がります。",
                "胴調子（5:5 / 6:4）は竿全体が均等に曲がる竿で、魚の引きを吸収しやすくバラシにくい特性があります。大物とのやり取りに適しています。",
                "竿が全く曲がらないということはありません。胴調子は竿全体がしなやかに曲がる調子です。",
                "胴調子は船釣りだけでなく、磯釣りやルアー釣りなど様々な釣種で採用される調子です。特定の釣り専用ではありません。",
              ],
            },
            {
              id: "tackle-end-4",
              question: "ベイトリール（両軸リール）のデメリットとして正しいものはどれか？",
              choices: [
                "巻き上げ力が弱い",
                "軽い仕掛けを飛ばせない",
                "バックラッシュ（糸のもつれ）が起きやすい",
                "大物とのやり取りに向かない",
              ],
              correctIndex: 2,
              explanation:
                "ベイトリールはスプールが回転してラインを放出するため、スプールの回転速度とラインの放出速度が合わないとバックラッシュ（糸のもつれ）が起きます。扱いに慣れが必要な点がデメリットです。",
              choiceExplanations: [
                "巻き上げ力が弱いのはベイトリールの特徴ではありません。むしろベイトリールは巻き上げ力が強いのがメリットです。",
                "軽い仕掛けを飛ばしにくいのはベイトリールの弱点の一つですが、最も大きなデメリットはバックラッシュです。",
                "ベイトリールはスプールの回転でラインを放出するため、スプール回転速度とライン放出速度が合わないとバックラッシュ（糸のもつれ）が発生します。扱いに慣れが必要な点が最大のデメリットです。",
                "大物とのやり取りに向かないのは誤りです。ベイトリールは巻き上げ力が強く、むしろ大物との勝負に適しています。",
              ],
            },
            {
              id: "tackle-end-5",
              question: "ドラグの設定値として一般的に推奨されるのは、使用ラインの強度の何分の一程度か？",
              choices: [
                "1/2程度",
                "1/3〜1/4程度",
                "2/3程度",
                "同じ強度に設定する",
              ],
              correctIndex: 1,
              explanation:
                "ドラグの設定値はラインの引っ張り強度の1/3〜1/4程度が一般的です。これにより、魚の急な引きでラインが切れることを防ぎつつ、しっかりとフッキングできます。",
              choiceExplanations: [
                "1/2程度では設定が高すぎる場合があり、魚の急な引きでラインが切れるリスクが高まります。",
                "ドラグの設定はラインの引っ張り強度の1/3〜1/4程度が一般的な推奨値です。この設定により、魚の急な引きによるラインブレイクを防ぎつつ、適切なテンションでのやり取りが可能になります。",
                "2/3程度では設定が高すぎます。魚が急に走った際にラインが切れたり、竿が折れたりするリスクがあります。",
                "ラインの強度と同じ値に設定すると、ドラグが機能する前にラインが限界に達してしまい、ラインブレイクの原因になります。",
              ],
            },
            {
              id: "tackle-end-6",
              question: "フロロカーボンラインの比重として正しいものはどれか？",
              choices: [
                "0.97（水に浮く）",
                "1.00（水と同じ）",
                "1.14（ゆっくり沈む）",
                "1.78（速く沈む）",
              ],
              correctIndex: 3,
              explanation:
                "フロロカーボンの比重は約1.78で、3種のラインの中で最も高い比重です。水中で速く沈むため、ハリスや底物釣りのリーダーとして使われます。ナイロンは1.14、PEは0.97です。",
              choiceExplanations: [
                "比重0.97で水に浮くのはPE（ポリエチレン）ラインの特徴です。",
                "比重1.00（水と同じ）のラインは一般的な釣り糸の中にはありません。",
                "比重1.14でゆっくり沈むのはナイロンラインの特徴です。フロロカーボンはナイロンよりも比重が高いです。",
                "フロロカーボンの比重は約1.78で、3種の釣り糸の中で最も高い比重を持ちます。速く沈む性質からハリスや底物釣りのリーダーに適しています。",
              ],
            },
            {
              id: "tackle-end-7",
              question: "PEラインにリーダー（ショックリーダー）を結ぶ主な理由として正しいものはどれか？",
              choices: [
                "PEラインの飛距離を伸ばすため",
                "仕掛けの重量を増やすため",
                "根ズレからPEラインを保護し、視認性を軽減するため",
                "PEラインの伸びを増やすため",
              ],
              correctIndex: 2,
              explanation:
                "PEラインは根ズレ（岩やストラクチャーとの摩擦）に弱く、また水中での視認性が高いため、先端にフロロカーボン等のリーダーを結んで保護と視認性の軽減を図ります。",
              choiceExplanations: [
                "リーダーを結ぶことでPEラインの飛距離が伸びるわけではありません。むしろ結び目がガイドに引っかかると飛距離が落ちる場合もあります。",
                "仕掛けの重量を増やすことがリーダーの目的ではありません。重量調整にはオモリやシンカーを使用します。",
                "PEラインは根ズレ（岩や障害物との摩擦）に弱く、水中での視認性も高いため、フロロカーボン等のリーダーを先端に結んで保護と視認性の軽減を図ります。これがリーダーの主な役割です。",
                "PEラインの伸びを増やすことが主目的ではありません。リーダーにはある程度のショック吸収効果もありますが、それは副次的な効果です。",
              ],
            },
            {
              id: "tackle-end-8",
              question: "釣り針の「フトコロ（ゲイプ）」とは何か？",
              choices: [
                "ハリスを結ぶ部分",
                "針の先端の尖った部分",
                "針の曲がった内側の幅",
                "針が抜けにくくする突起",
              ],
              correctIndex: 2,
              explanation:
                "フトコロ（ゲイプ）は針の曲がった内側の幅のことです。フトコロが広いほどフッキング率が上がります。ハリスを結ぶ部分はチモト、先端はポイント、突起はカエシです。",
              choiceExplanations: [
                "ハリスを結ぶ部分はチモト（耳）と呼ばれます。環付き（管付き）と平打ちの2種類があります。",
                "針の先端の尖った部分はポイント（先端）と呼ばれます。魚に刺さる部分です。",
                "フトコロ（ゲイプ）は針の曲がった内側の幅を指します。フトコロが広いほど魚の口にかかりやすく、フッキング率が向上します。",
                "針が抜けにくくする突起はカエシ（バーブ）です。先端近くに設けられた返しの構造です。",
              ],
            },
            {
              id: "tackle-end-9",
              question: "バーブレスフックのメリットとして正しいものはどれか？",
              choices: [
                "魚が絶対にバレない",
                "刺さりが良くなり、リリース時に魚へのダメージが少ない",
                "エサが外れにくい",
                "針の強度が上がる",
              ],
              correctIndex: 1,
              explanation:
                "バーブレスフック（カエシなし）はカエシがない分だけ刺さりが良く、リリース時に針を外しやすいため魚へのダメージが少ないのがメリットです。ただし、バレやすくなるデメリットもあります。",
              choiceExplanations: [
                "バーブレスフックはカエシがないため、むしろ魚がバレやすくなるデメリットがあります。「絶対にバレない」は誤りです。",
                "バーブレスフックはカエシがない分、針の刺さりが良くなり、リリース時には針を簡単に外せるため魚へのダメージが少ないのがメリットです。キャッチ＆リリースや子ども向けの釣り教室で推奨されます。",
                "バーブレスフックではカエシがないため、エサの保持力はむしろ低下する場合があります。エサの固定しやすさは主な特徴ではありません。",
                "カエシの有無は針の強度にほとんど影響しません。強度は主に軸の太さや素材によって決まります。",
              ],
            },
            {
              id: "tackle-end-10",
              question: "「袖針」が主に使用される対象として正しいものはどれか？",
              choices: [
                "大型のマダイ",
                "クロダイ（チヌ）",
                "ハゼやアジなどの小物",
                "カツオやマグロなどの回遊魚",
              ],
              correctIndex: 2,
              explanation:
                "袖針は軸が長く細い針で、小物釣りに適しています。外しやすい形状のため、サビキ釣りやハゼ釣りなどでよく使われます。大型魚には伊勢尼やチヌ針が適しています。",
              choiceExplanations: [
                "大型のマダイには伊勢尼や専用のマダイ針が使用されます。袖針は小型魚向けの細い針であり、大型魚には強度が不足します。",
                "クロダイ（チヌ）にはフトコロが広く軸が太いチヌ針が適しています。袖針はクロダイには不向きです。",
                "袖針は軸が長く細い針で、ハゼ、アジ、ワカサギなどの小物釣りに最適です。外しやすい形状のためサビキ仕掛けにもよく使われます。",
                "カツオやマグロなどの大型回遊魚には、強度の高い専用の針が必要です。細い袖針では対応できません。",
              ],
            },
            {
              id: "tackle-end-11",
              question: "道糸とハリスの違いについて正しい記述はどれか？",
              choices: [
                "道糸とハリスは同じ太さの同じ糸である",
                "道糸はリールに巻いてある糸で、ハリスは針の近くに使う細い糸である",
                "ハリスは道糸より必ず太い",
                "道糸とハリスは同じ素材でなければならない",
              ],
              correctIndex: 1,
              explanation:
                "道糸（メインライン）はリールに巻いてある糸で、ハリスはその先に結ぶ針に近い部分の糸です。一般にハリスは道糸より細く、魚に見破られにくい素材・太さを使います。素材は異なっても構いません。",
              choiceExplanations: [
                "道糸とハリスは役割が異なり、通常は太さも異なります。ハリスは道糸より細いのが一般的です。",
                "道糸（メインライン）はリールに巻いてある糸で、ハリスはその先に結ぶ針に近い部分の細い糸です。ハリスを細くすることで魚に見破られにくくなります。",
                "ハリスは通常、道糸より細い糸を使います。道糸より太いハリスを使うと、仕掛け全体のバランスが崩れ、根がかり時に道糸から切れてしまうリスクがあります。",
                "道糸とハリスは異なる素材を使うことが一般的です。例えば道糸にPEライン、ハリスにフロロカーボンという組み合わせは非常によく使われます。",
              ],
            },
            {
              id: "tackle-end-12",
              question: "天秤（テンビン）の主な役割として正しいものはどれか？",
              choices: [
                "魚のアタリを大きく伝える",
                "ウキの位置を固定する",
                "道糸とハリスの絡みを防ぐ",
                "リーダーの代わりになる",
              ],
              correctIndex: 2,
              explanation:
                "天秤は主に投げ釣りで使用する金具で、道糸とハリスが絡むのを防ぐ役割があります。同時にオモリとしての機能も兼ねるタイプが多いです（ジェット天秤、L型天秤等）。",
              choiceExplanations: [
                "天秤にはアタリを増幅する機能はありません。アタリの伝達は主に竿の感度やラインの性質に依存します。",
                "ウキの位置を固定するのはウキ止め・シモリ玉の役割です。天秤は主に投げ釣りで使用される金具です。",
                "天秤は主に投げ釣りで使用される金具で、道糸とハリスが絡むのを防ぐ役割があります。L型天秤やジェット天秤などの種類があり、多くはオモリの機能も兼ねています。",
                "天秤はリーダーの代わりにはなりません。リーダーはPEラインの先端に結ぶ保護用の糸であり、天秤とは全く異なる役割を持ちます。",
              ],
            },
            /* ===== ここから23問追加（tackle-end-13〜35） ===== */
            {
              id: "tackle-end-13",
              question: "磯竿の一般的な長さとして最も適切なものはどれか？",
              choices: [
                "1.5〜2.0m",
                "2.5〜3.0m",
                "4.5〜5.3m",
                "7.0〜8.0m",
              ],
              correctIndex: 2,
              explanation:
                "磯竿は4.5〜5.3mが一般的な長さです。長尺で柔軟な穂先を持ち、グレやクロダイなどの磯釣りに使用されます。1.5〜2.0mは船竿、2.5〜3.0mはルアーロッド寄りの長さです。",
              choiceExplanations: [
                "1.5〜2.0mは船竿に多い長さです。磯竿は足場の高い磯場での取り回しを考慮し、もっと長い竿が一般的です。",
                "2.5〜3.0mはルアーロッドやシーバスロッドに多い長さです。磯竿はさらに長いのが標準です。",
                "磯竿は4.5〜5.3mが一般的な長さです。磯場では足場が高く、ウキ仕掛けを操作するために長い竿が必要になります。",
                "7.0〜8.0mはアユの友釣り用の竿や渓流竿の一部に見られる長さで、磯竿としては長すぎます。",
              ],
            },
            {
              id: "tackle-end-14",
              question: "ルアーロッドの硬さ表記で「ML」が意味するものはどれか？",
              choices: [
                "ミドルライト（中間的な柔らかさ）",
                "マキシマムライト（最も柔らかい）",
                "メガライト（超軽量）",
                "ミディアムライト（やや柔らかめ）",
              ],
              correctIndex: 3,
              explanation:
                "MLは「ミディアムライト（Medium Light）」の略で、やや柔らかめの硬さを表します。ルアーロッドの硬さはUL（ウルトラライト）→L→ML→M→MH→H→XHの順に硬くなります。",
              choiceExplanations: [
                "「ミドルライト」という表記は一般的に使われません。正しくは「ミディアムライト（Medium Light）」です。",
                "「マキシマムライト」という表記は存在しません。最も柔らかい表記はUL（ウルトラライト）です。",
                "「メガライト」という表記は釣竿の硬さ分類には存在しません。MLはMedium Lightの略です。",
                "MLは「ミディアムライト（Medium Light）」の略で、UL→L→ML→M→MH→H→XHの硬さランクの中でやや柔らかめに位置します。アジングやメバリングなどのライトゲームに多く使われます。",
              ],
            },
            {
              id: "tackle-end-15",
              question: "グラスファイバー素材の竿が船竿や初心者用に使われる理由として最も適切なものはどれか？",
              choices: [
                "粘り強くしなやかで、急な魚の引きに耐えやすいため",
                "カーボンより軽量で感度が高いため",
                "カーボンより反発力が強く遠投しやすいため",
                "水中での視認性が低いため",
              ],
              correctIndex: 0,
              explanation:
                "グラスファイバーはカーボンに比べて粘り強くしなやかな素材で、急な魚の引きに対してもしっかりと追随して折れにくい特性があります。このため船竿や初心者用に適しています。",
              choiceExplanations: [
                "グラスファイバーは粘り強くしなやかな素材で、急な魚の引きに対しても竿がしっかり追随して折れにくいのが特徴です。このため船釣りの大物狙いや初心者の扱いにも安心感があります。",
                "軽量で感度が高いのはカーボン素材の特徴です。グラスファイバーはカーボンよりやや重く、感度も劣ります。",
                "反発力が強く遠投しやすいのはカーボンの特徴です。グラスファイバーはしなやかさが持ち味であり、反発力ではカーボンに劣ります。",
                "竿の素材と水中での視認性は関係ありません。水中での視認性が問題になるのは主にライン（糸）の特性です。",
              ],
            },
            {
              id: "tackle-end-16",
              question: "投げ竿の「号数」が示すものとして正しいものはどれか？",
              choices: [
                "竿の長さ（メートル）",
                "竿の自重（グラム）",
                "適合するラインの太さ",
                "適合するオモリの号数",
              ],
              correctIndex: 3,
              explanation:
                "投げ竿の号数は適合するオモリの号数を示します。例えば25号の投げ竿はオモリ25号前後に対応しています。磯竿の号数が竿の硬さを示すのとは意味が異なるので注意が必要です。",
              choiceExplanations: [
                "竿の長さはメートルやフィートで表記されます。号数は長さを示すものではありません。",
                "竿の自重はグラムで別途表記されます。号数は自重を示す数値ではありません。",
                "適合するラインの太さはラインの号数やlbで別途表記されます。投げ竿の号数はオモリの適合範囲を示します。",
                "投げ竿の号数は適合するオモリの号数を示します。25号の投げ竿であればオモリ25号前後を使って最も効率よくキャストできます。磯竿の号数（硬さ）とは意味が異なります。",
              ],
            },
            {
              id: "tackle-end-17",
              question: "スピニングリールで「バックラッシュ」が起きにくい理由として正しいものはどれか？",
              choices: [
                "キャスト時にスプールが回転しないため",
                "ドラグ機構が優れているため",
                "ハンドルが左右に切り替えられるため",
                "ラインローラーが高速で回転するため",
              ],
              correctIndex: 0,
              explanation:
                "スピニングリールはキャスト時にスプールが回転せず、ラインがスプールの端から螺旋状に放出される構造です。そのためベイトリールで起きるスプールの過回転によるバックラッシュが発生しません。",
              choiceExplanations: [
                "スピニングリールはキャスト時にスプールが回転せず、ラインがスプールの端から螺旋状に放出されます。ベイトリールのようなスプール過回転によるバックラッシュが構造的に起きないのが大きな利点です。",
                "ドラグ機構はファイト中にラインを送り出す機能であり、バックラッシュとは直接関係がありません。",
                "ハンドルの左右切り替えは利き手に合わせた操作性の問題で、バックラッシュとは無関係です。",
                "ラインローラーはライン巻き取り時に機能する部品であり、キャスト時のバックラッシュ発生とは関係がありません。",
              ],
            },
            {
              id: "tackle-end-18",
              question: "リールのギア比が「6.2:1」であるとき、この数値が意味することはどれか？",
              choices: [
                "ハンドル6.2回転でローターが1回転する",
                "1秒間に6.2m糸を巻き取れる",
                "ドラグ力が6.2kgである",
                "ハンドル1回転でローターが6.2回転する",
              ],
              correctIndex: 3,
              explanation:
                "ギア比6.2:1は「ハンドル1回転でローター（またはスプール）が6.2回転する」ことを意味します。ギア比が高いほど1回転あたりの巻き取り量が多く、糸の回収が速くなります。",
              choiceExplanations: [
                "逆です。ギア比6.2:1はハンドル1回転でローターが6.2回転することを意味します。ハンドル6.2回転でローター1回転では減速ギアになってしまいます。",
                "巻き取り量はギア比だけでなくスプールの径にも依存するため、ギア比の数値だけで巻き取り長さは決まりません。巻き取り長さはスペック上別途記載されます。",
                "ドラグ力はギア比とは別のスペックで、kg単位で別途表記されます。ギア比はハンドルとローターの回転比を表す数値です。",
                "ギア比6.2:1は、ハンドル1回転でローター（またはスプール）が6.2回転することを意味します。このギア比はハイギアに分類され、素早いライン回収やルアーの高速リトリーブに適しています。",
              ],
            },
            {
              id: "tackle-end-19",
              question: "ベイトリール（両軸リール）が得意とする釣りとして最も適切なものはどれか？",
              choices: [
                "超軽量ジグヘッドを使ったアジング",
                "遠投が必要なキス釣り",
                "正確なキャストと巻き上げ力が求められるバス釣り",
                "ウキ釣りによるグレ釣り",
              ],
              correctIndex: 2,
              explanation:
                "ベイトリールは巻き上げ力が強く、サミング（親指でスプールを制御）による正確なキャストが可能なため、バス釣りやジギングなどで重宝されます。軽量ルアーの遠投やウキ釣りにはスピニングリールが適しています。",
              choiceExplanations: [
                "超軽量ジグヘッド（1g前後）のアジングにはスピニングリールが適しています。ベイトリールは軽い仕掛けのキャストが苦手です。",
                "遠投が必要なキス釣りには投げ専用のスピニングリールが最適です。ベイトリールは軽いオモリの遠投に不向きです。",
                "ベイトリールは巻き上げ力が強く、サミング（親指でスプールを抑える）による正確なキャストコントロールが可能です。バス釣りではピンポイントにルアーを投げ込む精度とパワーが求められるため最適です。",
                "ウキ釣りによるグレ釣りには磯竿＋スピニングリールの組み合わせが一般的です。ベイトリールはウキ釣りにはほとんど使用されません。",
              ],
            },
            {
              id: "tackle-end-20",
              question: "リールのドラグが「締まりすぎている」場合に起こり得るトラブルはどれか？",
              choices: [
                "ラインが切れたり竿が折れたりする",
                "魚が走りすぎてラインを出され切る",
                "リールのハンドルが回らなくなる",
                "仕掛けが飛ばなくなる",
              ],
              correctIndex: 0,
              explanation:
                "ドラグが締まりすぎていると、魚が急に走った際にラインを送り出せず、ラインが破断したり竿に過度の負荷がかかって折れたりする危険があります。ドラグはライン強度の1/3〜1/4に設定するのが基本です。",
              choiceExplanations: [
                "ドラグが締まりすぎると、魚の急な引きに対してラインを送り出せず、ラインの引っ張り強度を超えて切れたり、竿に過度の負荷がかかって折れたりするリスクがあります。",
                "魚が走りすぎてラインを出され切るのは、ドラグが「緩すぎる」場合のトラブルです。",
                "ドラグの締め具合はハンドルの回転とは直接関係しません。ドラグはスプールの回転抵抗を調整する機構です。",
                "仕掛けの飛距離はドラグの締め具合ではなく、オモリの重さや竿の反発力、キャスティング技術に依存します。",
              ],
            },
            {
              id: "tackle-end-21",
              question: "ナイロンラインが初心者に推奨される主な理由はどれか？",
              choices: [
                "比重が最も高く沈みやすいため",
                "根ズレに最も強いため",
                "水に浮くため仕掛けが見やすいため",
                "適度な伸びがありショックを吸収し、扱いやすいため",
              ],
              correctIndex: 3,
              explanation:
                "ナイロンラインは適度な伸縮性があるため、魚の引きや合わせのショックを吸収してくれます。また柔軟でトラブルが少なく、結びやすいため初心者に最も推奨される素材です。",
              choiceExplanations: [
                "比重が最も高く沈みやすいのはフロロカーボン（比重1.78）です。ナイロンの比重は1.14でゆっくり沈みます。",
                "根ズレに最も強いのはフロロカーボンラインです。ナイロンの耐摩耗性は普通程度です。",
                "水に浮くのはPEライン（比重0.97）の特性です。ナイロンの比重は1.14で水より重く、ゆっくり沈みます。",
                "ナイロンラインは適度な伸縮性があり、魚の引きや合わせ時のショックを吸収してくれます。柔軟で結びやすく、ライントラブルも少ないため、初心者に最も推奨される素材です。",
              ],
            },
            {
              id: "tackle-end-22",
              question: "フロロカーボンラインがハリス（リーダー）として多用される理由の組み合わせとして正しいものはどれか？",
              choices: [
                "耐摩耗性が高く、水中で目立ちにくい（屈折率が水に近い）ため",
                "伸びが大きくショック吸収に優れ、水に浮くため",
                "最も細くても強度が高く、結びやすいため",
                "最も安価で入手しやすいため",
              ],
              correctIndex: 0,
              explanation:
                "フロロカーボンは耐摩耗性が高く根ズレに強いうえ、光の屈折率が水に近いため水中で目立ちにくい特性があります。この2つの理由からハリスやショックリーダーとして最も多く使われます。",
              choiceExplanations: [
                "フロロカーボンは耐摩耗性が高く根ズレに強いうえ、光の屈折率（約1.42）が水（約1.33）に近いため水中で目立ちにくい特性があります。この2つがハリスやリーダーに多用される主な理由です。",
                "フロロカーボンは伸びにくい素材であり、水に浮くこともありません（比重1.78で速く沈む）。この記述はナイロンやPEの特性と混同しています。",
                "最も細くても強度が高いのはPEラインの特徴です。フロロカーボンは同じ号数ならPEより引っ張り強度が低いです。結びやすさもナイロンに劣ります。",
                "フロロカーボンは一般にナイロンラインより高価です。価格の安さが理由でハリスに使われるわけではありません。",
              ],
            },
            {
              id: "tackle-end-23",
              question: "PEラインの構造として正しいものはどれか？",
              choices: [
                "単一のポリエチレン繊維を押し出し成型したモノフィラメント",
                "ポリエチレンの芯にフロロカーボンをコーティングした複合素材",
                "ナイロンとポリエチレンを撚り合わせた二重構造",
                "複数の極細ポリエチレン繊維を編み込んだブレイデッドライン",
              ],
              correctIndex: 3,
              explanation:
                "PEラインは複数本（4本や8本）の極細ポリエチレン繊維を編み込んで作られるブレイデッドラインです。この構造により細くても高い引っ張り強度を持ちますが、摩擦には弱い性質があります。",
              choiceExplanations: [
                "単一繊維の押し出し成型（モノフィラメント）はナイロンやフロロカーボンの製造方法です。PEラインは編み込み構造です。",
                "ポリエチレン芯にフロロコーティングという構造のラインは一般的なPEラインではありません。一部の特殊コーティングPEは存在しますが、基本構造とは異なります。",
                "ナイロンとポリエチレンの撚り合わせは一般的なPEラインの構造ではありません。PEラインはポリエチレン繊維のみで編まれています。",
                "PEラインは4本撚りや8本撚りなど、複数の極細ポリエチレン繊維を編み込んで作られたブレイデッドラインです。8本撚りの方がより滑らかで飛距離が出やすい特性があります。",
              ],
            },
            {
              id: "tackle-end-24",
              question: "釣り針の「チモト（耳）」の役割として正しいものはどれか？",
              choices: [
                "魚に刺さる部分",
                "針が抜けにくくする部分",
                "ハリスを結ぶ部分",
                "針の曲がりの強度を保つ部分",
              ],
              correctIndex: 2,
              explanation:
                "チモト（耳）は針の上端にあり、ハリスを結び付ける部分です。環付き（管付き）タイプと平打ちタイプがあり、環付きは結びやすく初心者向け、平打ちはハリスとの密着性が高いのが特徴です。",
              choiceExplanations: [
                "魚に刺さる部分は先端（ポイント）と呼ばれる部位です。チモトとは異なる場所にあります。",
                "針が抜けにくくする部分はカエシ（バーブ）です。先端近くにある返しの突起構造です。",
                "チモト（耳）は針の上端にあり、ハリスを結び付ける部分です。環付き（管付き）と平打ちの2種類があります。",
                "針の曲がりの強度は主に素材の太さや焼き入れの品質によって決まります。チモトは結び付け部分であり、曲がり強度を保つ構造ではありません。",
              ],
            },
            {
              id: "tackle-end-25",
              question: "「伊勢尼」針の特徴として正しいものはどれか？",
              choices: [
                "軸が長く細い、小物向けの針",
                "先曲がりが鋭角で口の小さい魚向き",
                "太軸で強度が高く、大型魚全般に対応する",
                "軸が短くフトコロが深い、グレ専用の針",
              ],
              correctIndex: 2,
              explanation:
                "伊勢尼は太軸で強度が高い針で、大型魚全般に対応できる万能型です。軸が長く細いのは袖針、先曲がりが鋭角なのはキツネ針、軸が短くフトコロが深いのはグレ針の特徴です。",
              choiceExplanations: [
                "軸が長く細いのは袖針の特徴です。袖針はハゼやアジなどの小物釣りに使用されます。",
                "先曲がりが鋭角で口の小さい魚向きなのはキツネ針の特徴です。キスやワカサギ釣りに使われます。",
                "伊勢尼は太軸で強度が高い万能型の針です。大型魚全般に対応でき、磯釣りや船釣りなど幅広い釣種で使用されます。",
                "軸が短くフトコロが深いのはグレ（メジナ）針の特徴です。伊勢尼は太軸が特徴で、特定の魚種専用ではありません。",
              ],
            },
            {
              id: "tackle-end-26",
              question: "釣り針の号数について正しい記述はどれか？",
              choices: [
                "号数が大きいほど針は小さくなる",
                "号数が大きいほど針は大きくなる",
                "号数は針の重量をグラムで表したものである",
                "号数は針の材質の硬さを表している",
              ],
              correctIndex: 1,
              explanation:
                "釣り針の号数は針の大きさ（サイズ）を表し、号数が大きくなるほど針も大きくなります。なお、ルアー用フックの番手（#1、#2等）とは逆の関係で、ルアーフックは番号が大きいほど小さくなります。",
              choiceExplanations: [
                "日本の釣り針の号数は数字が大きくなるほど針が大きくなります。号数が大きいほど小さくなるのは海外式のルアーフック番手（#表記）です。",
                "日本の釣り針の号数は大きくなるほど針のサイズも大きくなります。例えばチヌ針1号よりチヌ針5号の方が大きな針です。対象魚のサイズに合わせて選びます。",
                "号数は針の重量ではなく、針のサイズ（大きさ）を段階的に示した規格です。重量はサイズに伴って変わりますが、号数＝グラム数ではありません。",
                "号数は針の材質の硬さとは関係ありません。硬さは素材や焼き入れの処理によって決まります。",
              ],
            },
            {
              id: "tackle-end-27",
              question: "ウキ釣りで「棒ウキ」と「円錐ウキ（どんぐりウキ）」を比較したとき、棒ウキの特徴として正しいものはどれか？",
              choices: [
                "感度が高く、小さなアタリでも見やすい",
                "風や波に強く、荒れた海で使いやすい",
                "遠投性能が最も優れている",
                "深いタナの設定が不可能である",
              ],
              correctIndex: 0,
              explanation:
                "棒ウキは細長い形状のため水面に出るトップ部分が小さく、わずかなアタリでも沈む動きが見やすいのが特徴です。ただし風や波の影響を受けやすく、穏やかな海面や堤防での使用に向いています。",
              choiceExplanations: [
                "棒ウキは細長い形状で水面に出る部分が小さいため、わずかなアタリでも敏感に反応して見やすいのが最大の特徴です。繊細なアタリを捉えるのに優れています。",
                "風や波に強いのは円錐ウキ（どんぐりウキ）の特徴です。棒ウキは細長い形状のため風や波の影響を受けやすく、荒れた海では使いにくいです。",
                "遠投性能は円錐ウキの方が優れています。円錐ウキは空気抵抗が少なく重心が安定しているため遠投に向いています。",
                "棒ウキでも半遊動仕掛けや全遊動仕掛けを使えば深いタナの設定は可能です。タナ設定はウキ止めの位置で調整します。",
              ],
            },
            {
              id: "tackle-end-28",
              question: "磯釣りのウキ仕掛けで「半遊動」とはどのような仕掛けか？",
              choices: [
                "ウキが道糸上を全く移動しない固定式",
                "ウキが道糸上を自由に移動し、ウキ止めで上限の深さを制限する方式",
                "ウキを使わずにオモリだけで沈める方式",
                "2つのウキを使って深さを調整する方式",
              ],
              correctIndex: 1,
              explanation:
                "半遊動仕掛けはウキが道糸上を自由にスライドし、ウキ止めの位置で仕掛けが沈む深さ（タナ）の上限を設定する方式です。タナの変更が容易で、磯釣りで最も一般的な仕掛けです。",
              choiceExplanations: [
                "ウキが全く移動しない固定式は「固定仕掛け」と呼ばれ、半遊動とは異なります。固定仕掛けは竿の長さ以内の浅いタナで使用されます。",
                "半遊動仕掛けはウキが道糸上をスライドし、ウキ止めの位置で深さの上限を制限する方式です。タナの変更が容易で、深いタナにも対応できるため磯釣りで最もポピュラーな仕掛けです。",
                "ウキを使わずにオモリだけで沈めるのは「ぶっこみ釣り」や「投げ釣り」であり、ウキ仕掛けとは異なる釣り方です。",
                "2つのウキを使う仕掛けは一部の特殊な釣法では存在しますが、一般的な「半遊動」の定義ではありません。",
              ],
            },
            {
              id: "tackle-end-29",
              question: "ガン玉（割りビシ）の主な用途として正しいものはどれか？",
              choices: [
                "道糸とハリスの接続",
                "ウキの位置を固定する",
                "魚の口から針が外れるのを防ぐ",
                "仕掛けの沈降速度を微調整する",
              ],
              correctIndex: 3,
              explanation:
                "ガン玉（割りビシ）はハリスに噛ませる小型のオモリで、仕掛けの沈降速度やウキのバランスを微調整するために使用します。状況に応じて追加・除去することでタナや潮馴染みを細かく調整できます。",
              choiceExplanations: [
                "道糸とハリスの接続にはサルカン（スイベル）やノット（結び目）を使用します。ガン玉は接続器具ではありません。",
                "ウキの位置を固定するのはウキ止めやシモリ玉の役割です。ガン玉はウキの位置固定とは関係がありません。",
                "魚の口から針が外れるのを防ぐのはカエシ（バーブ）の役割です。ガン玉は重さを付加するオモリです。",
                "ガン玉（割りビシ）はハリスに取り付ける小型のオモリで、仕掛けの沈降速度やウキの浮力バランスを微調整する役割があります。G1、G2、B、2Bなどのサイズがあります。",
              ],
            },
            {
              id: "tackle-end-30",
              question: "投げ釣りで使われる「ジェット天秤」の特徴として正しいものはどれか？",
              choices: [
                "水中で浮き上がりやすい翼状の形状を持ち、根がかりしにくい",
                "水中で最も速く沈み、深場の釣りに特化している",
                "天秤の中で最も安価で、使い捨てが前提の消耗品である",
                "磯釣り専用の天秤で、投げ釣りには使用しない",
              ],
              correctIndex: 0,
              explanation:
                "ジェット天秤は翼状の形状を持ち、リールを巻くと水中で浮き上がる性質があります。これにより根がかり（海底の岩や障害物に引っかかること）を回避しやすく、投げ釣りでは最もポピュラーな天秤の一つです。",
              choiceExplanations: [
                "ジェット天秤は翼状の形状により、リールを巻くと水中で浮き上がる特性があります。この浮き上がりやすさが根がかり回避に効果的で、投げ釣りで広く使用されています。",
                "ジェット天秤はむしろ浮き上がりやすい特性を持つ天秤であり、深場特化型ではありません。底を重点的に攻める場合はL型天秤の方が適しています。",
                "ジェット天秤は繰り返し使用できる丈夫な金具であり、使い捨てが前提の消耗品ではありません。価格も特に安価というわけではありません。",
                "ジェット天秤は投げ釣りの代表的な天秤です。磯釣り専用ではなく、サーフや堤防からの投げ釣りで最もよく使用されます。",
              ],
            },
            {
              id: "tackle-end-31",
              question: "オモリの「号数」と「重さ」の関係として正しいものはどれか？",
              choices: [
                "1号は約1gである",
                "1号は約3.75gである",
                "1号は約10gである",
                "1号は約28gである",
              ],
              correctIndex: 1,
              explanation:
                "日本の釣りオモリは1号＝1匁（もんめ）＝約3.75gが基準です。この換算を知っていると号数からおおよその重量を計算できます。例えば10号のオモリは約37.5gになります。",
              choiceExplanations: [
                "1号＝1gではありません。1号は1匁（もんめ）に相当し、約3.75gです。",
                "日本の釣りオモリの号数は匁（もんめ）を基準としており、1号＝1匁＝約3.75gです。この基準値を覚えておくと、号数から重量を簡単に計算できます。",
                "1号＝10gではありません。10gに相当するのは約2.7号です。",
                "約28gは1オンス（oz）に相当する重さで、海外の釣りで使われる単位です。日本のオモリ1号は約3.75gです。",
              ],
            },
            {
              id: "tackle-end-32",
              question: "仕掛けの結び方のうち、道糸とハリスをサルカンを介さずに直接結ぶ方法として知られるものはどれか？",
              choices: [
                "クリンチノット",
                "電車結び",
                "パロマーノット",
                "ユニノット",
              ],
              correctIndex: 1,
              explanation:
                "電車結びは2本の糸をそれぞれユニノットで結び合わせる結束方法で、道糸とハリスを直接つなぐ際に広く使われます。クリンチノットやパロマーノット、ユニノットは糸と金具（サルカンやルアー）の結びに使用されることが多いです。",
              choiceExplanations: [
                "クリンチノットは糸とサルカンやスナップなどの金具を結ぶノットです。糸同士を直結するノットではありません。",
                "電車結びは2本の糸をそれぞれユニノット（止め結び）で結び合わせる方法で、道糸とハリスの直結に広く使用されます。簡単で強度もそこそこあり、初心者にも人気のノットです。",
                "パロマーノットは糸を二つ折りにして金具に通す結び方で、主にルアーやスナップとの接続に使います。糸同士の直結には使いません。",
                "ユニノットは汎用性の高い結びで、主にサルカンやルアーアイへの結束に使います。単体では糸同士の直結には使わず、2回組み合わせると電車結びになります。",
              ],
            },
            {
              id: "tackle-end-33",
              question: "PEラインとリーダーを結ぶ結束方法として最も一般的なものはどれか？",
              choices: [
                "外掛け結び",
                "FGノット",
                "漁師結び（完全結び）",
                "内掛け結び",
              ],
              correctIndex: 1,
              explanation:
                "FGノットはPEラインにリーダーを編み込む結束方法で、結び目が小さくガイド抜けが良いのが特徴です。PE＋リーダーの組み合わせで最も広く使われるノットで、強度も高いです。外掛け結びや内掛け結びは主に針とハリスの結びに使います。",
              choiceExplanations: [
                "外掛け結びは針とハリスを結ぶ方法であり、PE＋リーダーの結束には使用しません。",
                "FGノットはPEラインにリーダーを編み込む結束方法で、結び目が小さく滑らかなためガイド抜けに優れています。PE＋リーダーの結束では最も一般的で信頼性の高いノットです。",
                "漁師結び（完全結び）は主にサルカンと糸の結束に使われるノットで、PE＋リーダーの結束方法としては一般的ではありません。",
                "内掛け結びは針とハリスを結ぶ方法であり、PE＋リーダーの結束には適しません。",
              ],
            },
            {
              id: "tackle-end-34",
              question: "針とハリスの結び方として最も基本的で広く使われる結びはどれか？",
              choices: [
                "FGノット",
                "電車結び",
                "外掛け結び",
                "ブラッドノット",
              ],
              correctIndex: 2,
              explanation:
                "外掛け結びは針の軸（シャンク）にハリスを巻き付けて結ぶ最も基本的な方法で、初心者からベテランまで幅広く使われます。FGノットはPE＋リーダー用、電車結びは糸同士の直結、ブラッドノットも糸同士の結びです。",
              choiceExplanations: [
                "FGノットはPEラインとリーダーを結束するためのノットであり、針とハリスの結びには使用しません。",
                "電車結びは道糸とハリスなど糸同士を直結するノットであり、針に糸を結ぶ方法ではありません。",
                "外掛け結びは針の軸（シャンク）にハリスを巻き付けて結ぶ最も基本的な針結びです。簡単で強度も十分あり、釣り針とハリスの結びとして最も広く使われています。",
                "ブラッドノットは同程度の太さの糸同士を結ぶ方法であり、針とハリスの結びには使いません。",
              ],
            },
            {
              id: "tackle-end-35",
              question: "日本の伝統的な和竿に使われる素材として正しいものはどれか？",
              choices: [
                "カーボン（炭素繊維）",
                "グラスファイバー",
                "竹",
                "チタン",
              ],
              correctIndex: 2,
              explanation:
                "和竿は竹を素材とした日本の伝統的な釣竿で、職人が手作りで製作します。布袋竹（ほていちく）や矢竹などが使われ、独特のしなりと手触りが特徴です。ヘラブナ釣り、テンカラ、ハゼ釣りなどで現在も愛好家がいます。",
              choiceExplanations: [
                "カーボン（炭素繊維）は1970年代以降に登場した近代的な素材です。和竿の歴史はそれよりはるかに古く、竹を素材としています。",
                "グラスファイバーも20世紀に登場した合成素材であり、日本の伝統的な和竿の素材ではありません。",
                "和竿は竹（布袋竹、矢竹など）を素材とした日本の伝統的な釣竿です。職人が手作りで製作し、独特のしなりと手触りが魅力です。現在もヘラブナ釣りやテンカラなどの愛好家に使われています。",
                "チタンは一部のリールパーツやガイドフレームに使用される金属であり、竿の素材としては一般的ではなく、和竿の素材でもありません。",
              ],
            },
          ]}
          showNumbers
          startNumber={1}
        />

        {/* ナビ */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Link
            href="/instructor-exam/manners"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            &larr; 第3章 マナーと指導法
          </Link>
          <Link
            href="/instructor-exam"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            目次に戻る
          </Link>
        </div>

        {/* 免責 */}
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <p>
            当サイトは全日本釣り団体協議会とは無関係の非公式学習サイトです。試験の正確な内容については
            <a
              href="https://www.zenturi-jofi.or.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              全釣り協公式サイト
            </a>
            をご確認ください。
          </p>
        </div>
      </div>
    </>
  );
}
