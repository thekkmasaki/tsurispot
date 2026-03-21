import type { Metadata } from "next";
import Link from "next/link";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第5章 釣り具の知識 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第5章。釣りの六物（竿・糸・針・浮き・重り・餌）、ロッド・リール・ラインの種類と特性、針の部位名称、仕掛けの基礎を体系的に解説。確認クイズ12問付き。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/tackle`,
  },
};

/* ============================================================
   コールアウト コンポーネント
   ============================================================ */

function Point({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-blue-300 bg-blue-50 p-5">
      <p className="mb-2 text-base font-bold text-blue-800">
        重要ポイント
      </p>
      <div className="text-sm leading-relaxed text-blue-900">{children}</div>
    </div>
  );
}

function Exam({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
      <p className="mb-2 text-base font-bold text-amber-800">
        試験に出る！
      </p>
      <div className="text-sm leading-relaxed text-amber-900">{children}</div>
    </div>
  );
}

function TsuriSpotBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-green-300 bg-green-50 p-5">
      <p className="mb-2 text-base font-bold text-green-800">
        ツリスポで理解する
      </p>
      <div className="text-sm leading-relaxed text-green-900">{children}</div>
    </div>
  );
}

function Analogy({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-orange-300 bg-orange-50 p-5">
      <p className="mb-2 text-base font-bold text-orange-800">
        身近な例えで理解
      </p>
      <div className="text-sm leading-relaxed text-orange-900">{children}</div>
    </div>
  );
}

function Quiz({
  question,
  options,
  answer,
  explanation,
}: {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}) {
  return (
    <div className="my-6 rounded-xl border border-purple-300 bg-purple-50 p-5">
      <p className="mb-2 text-base font-bold text-purple-700">
        確認クイズ
      </p>
      <p className="mb-3 text-sm font-medium text-purple-900">{question}</p>
      <ol className="mb-3 list-inside list-decimal space-y-1 text-sm text-purple-900">
        {options.map((opt, i) => (
          <li key={i}>{opt}</li>
        ))}
      </ol>
      <details className="text-sm">
        <summary className="cursor-pointer font-semibold text-purple-700">
          解答を見る
        </summary>
        <div className="mt-2 rounded-lg bg-white/60 p-3 text-purple-900">
          <p>
            <strong>正解: {answer}</strong>
          </p>
          <p className="mt-1">{explanation}</p>
        </div>
      </details>
    </div>
  );
}

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

        <Quiz
          question="先調子の竿の特徴として正しいものはどれか？"
          options={[
            "竿全体が均等に曲がる",
            "穂先側が主に曲がり、感度が良い",
            "大物の引きを吸収しやすい",
            "遠投に最も適している",
          ]}
          answer="2. 穂先側が主に曲がり、感度が良い"
          explanation="先調子（7:3調子）は穂先側3割が主に曲がる竿で、アタリを取りやすく感度に優れています。竿全体が曲がるのは胴調子の特徴です。"
        />

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

        <Quiz
          question="スピニングリールの特徴として正しいものはどれか？"
          options={[
            "巻き上げ力が最も強い",
            "バックラッシュが起きやすい",
            "初心者でも扱いやすく、軽い仕掛けでも飛ばしやすい",
            "主に船釣り専用のリールである",
          ]}
          answer="3. 初心者でも扱いやすく、軽い仕掛けでも飛ばしやすい"
          explanation="スピニングリールはバックラッシュ（糸のもつれ）が起きにくく、初心者でも扱いやすいのが最大の特徴です。軽い仕掛けでもキャストしやすく、最も汎用性の高いリールです。"
        />

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

        <Quiz
          question="PE（ポリエチレン）ラインの特徴として正しいものはどれか？"
          options={[
            "よく伸びてショックを吸収する",
            "比重が高く速く沈む",
            "ほぼ伸びず感度が高いが、根ズレに弱い",
            "耐摩耗性が最も高い",
          ]}
          answer="3. ほぼ伸びず感度が高いが、根ズレに弱い"
          explanation="PEラインは伸びがほぼなく高感度ですが、編み込み構造のため根ズレ（岩や障害物との摩擦）に弱いのが欠点です。比重は0.97で水に浮きます。"
        />

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

        <Quiz
          question="釣り針の「カエシ（バーブ）」の役割として正しいものはどれか？"
          options={[
            "針の強度を上げる",
            "刺さった針が抜けにくくする",
            "エサを固定しやすくする",
            "糸を結びやすくする",
          ]}
          answer="2. 刺さった針が抜けにくくする"
          explanation="カエシ（バーブ）は針の先端近くにある返しの突起で、一度刺さった針が抜けにくくする役割があります。バーブレスフック（カエシなし）はリリースしやすい反面、魚がバレやすくなります。"
        />

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

        <Quiz
          question="サルカン（スイベル）の主な役割として正しいものはどれか？"
          options={[
            "仕掛けの飛距離を伸ばす",
            "道糸とハリスの間で糸のヨレを防止する",
            "魚のアタリを増幅させる",
            "ウキの移動範囲を制限する",
          ]}
          answer="2. 道糸とハリスの間で糸のヨレを防止する"
          explanation="サルカン（スイベル）は回転する連結金具で、道糸とハリスの間に入れることで糸のヨレ（ねじれ）を防止します。ウキの移動範囲を制限するのはウキ止めの役割です。"
        />

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

        {/* ===== 章末確認クイズ 12問 ===== */}
        <h2 className="mb-4 text-xl font-bold text-sky-900">
          章末確認クイズ（全12問）
        </h2>

        <Quiz
          question="Q1. 釣りの「六物（ろくもつ）」に含まれないものはどれか？"
          options={[
            "竿",
            "浮き",
            "リール",
            "餌",
          ]}
          answer="3. リール"
          explanation="六物は竿・糸・針・浮き・重り・餌の6つです。リールは六物の時代には存在しなかった近代的な道具であり、伝統的な六物には含まれません。"
        />

        <Quiz
          question="Q2. カーボン素材の竿の特徴として正しいものはどれか？"
          options={[
            "しなやかで粘り強い",
            "軽量で感度が高い",
            "最も安価で初心者向け",
            "伝統的な素材で和竿に使われる",
          ]}
          answer="2. 軽量で感度が高い"
          explanation="カーボン（炭素繊維）の竿は軽量で感度が高く反発力に優れ、現在の主流素材です。しなやかで粘り強いのはグラスファイバー、伝統素材は竹の特徴です。"
        />

        <Quiz
          question="Q3. 「胴調子」の竿の特徴として正しいものはどれか？"
          options={[
            "穂先だけが曲がり、感度が良い",
            "竿全体が曲がり、魚の引きを吸収しやすい",
            "全く曲がらず、硬い",
            "船釣り専用の調子である",
          ]}
          answer="2. 竿全体が曲がり、魚の引きを吸収しやすい"
          explanation="胴調子（5:5 や 6:4）は竿全体が均等に曲がる竿で、魚の引きを吸収しやすくバラシにくい特性があります。穂先だけが曲がるのは先調子の特徴です。"
        />

        <Quiz
          question="Q4. ベイトリール（両軸リール）のデメリットとして正しいものはどれか？"
          options={[
            "巻き上げ力が弱い",
            "軽い仕掛けを飛ばせない",
            "バックラッシュ（糸のもつれ）が起きやすい",
            "大物とのやり取りに向かない",
          ]}
          answer="3. バックラッシュ（糸のもつれ）が起きやすい"
          explanation="ベイトリールはスプールが回転してラインを放出するため、スプールの回転速度とラインの放出速度が合わないとバックラッシュ（糸のもつれ）が起きます。扱いに慣れが必要な点がデメリットです。"
        />

        <Quiz
          question="Q5. ドラグの設定値として一般的に推奨されるのは、使用ラインの強度の何分の一程度か？"
          options={[
            "1/2程度",
            "1/3〜1/4程度",
            "2/3程度",
            "同じ強度に設定する",
          ]}
          answer="2. 1/3〜1/4程度"
          explanation="ドラグの設定値はラインの引っ張り強度の1/3〜1/4程度が一般的です。これにより、魚の急な引きでラインが切れることを防ぎつつ、しっかりとフッキングできます。"
        />

        <Quiz
          question="Q6. フロロカーボンラインの比重として正しいものはどれか？"
          options={[
            "0.97（水に浮く）",
            "1.00（水と同じ）",
            "1.14（ゆっくり沈む）",
            "1.78（速く沈む）",
          ]}
          answer="4. 1.78（速く沈む）"
          explanation="フロロカーボンの比重は約1.78で、3種のラインの中で最も高い比重です。水中で速く沈むため、ハリスや底物釣りのリーダーとして使われます。ナイロンは1.14、PEは0.97です。"
        />

        <Quiz
          question="Q7. PEラインにリーダー（ショックリーダー）を結ぶ主な理由として正しいものはどれか？"
          options={[
            "PEラインの飛距離を伸ばすため",
            "仕掛けの重量を増やすため",
            "根ズレからPEラインを保護し、視認性を軽減するため",
            "PEラインの伸びを増やすため",
          ]}
          answer="3. 根ズレからPEラインを保護し、視認性を軽減するため"
          explanation="PEラインは根ズレ（岩やストラクチャーとの摩擦）に弱く、また水中での視認性が高いため、先端にフロロカーボン等のリーダーを結んで保護と視認性の軽減を図ります。"
        />

        <Quiz
          question="Q8. 釣り針の「フトコロ（ゲイプ）」とは何か？"
          options={[
            "ハリスを結ぶ部分",
            "針の先端の尖った部分",
            "針の曲がった内側の幅",
            "針が抜けにくくする突起",
          ]}
          answer="3. 針の曲がった内側の幅"
          explanation="フトコロ（ゲイプ）は針の曲がった内側の幅のことです。フトコロが広いほどフッキング率が上がります。ハリスを結ぶ部分はチモト、先端はポイント、突起はカエシです。"
        />

        <Quiz
          question="Q9. バーブレスフックのメリットとして正しいものはどれか？"
          options={[
            "魚が絶対にバレない",
            "刺さりが良くなり、リリース時に魚へのダメージが少ない",
            "エサが外れにくい",
            "針の強度が上がる",
          ]}
          answer="2. 刺さりが良くなり、リリース時に魚へのダメージが少ない"
          explanation="バーブレスフック（カエシなし）はカエシがない分だけ刺さりが良く、リリース時に針を外しやすいため魚へのダメージが少ないのがメリットです。ただし、バレやすくなるデメリットもあります。"
        />

        <Quiz
          question="Q10. 「袖針」が主に使用される対象として正しいものはどれか？"
          options={[
            "大型のマダイ",
            "クロダイ（チヌ）",
            "ハゼやアジなどの小物",
            "カツオやマグロなどの回遊魚",
          ]}
          answer="3. ハゼやアジなどの小物"
          explanation="袖針は軸が長く細い針で、小物釣りに適しています。外しやすい形状のため、サビキ釣りやハゼ釣りなどでよく使われます。大型魚には伊勢尼やチヌ針が適しています。"
        />

        <Quiz
          question="Q11. 道糸とハリスの違いについて正しい記述はどれか？"
          options={[
            "道糸とハリスは同じ太さの同じ糸である",
            "道糸はリールに巻いてある糸で、ハリスは針の近くに使う細い糸である",
            "ハリスは道糸より必ず太い",
            "道糸とハリスは同じ素材でなければならない",
          ]}
          answer="2. 道糸はリールに巻いてある糸で、ハリスは針の近くに使う細い糸である"
          explanation="道糸（メインライン）はリールに巻いてある糸で、ハリスはその先に結ぶ針に近い部分の糸です。一般にハリスは道糸より細く、魚に見破られにくい素材・太さを使います。素材は異なっても構いません。"
        />

        <Quiz
          question="Q12. 天秤（テンビン）の主な役割として正しいものはどれか？"
          options={[
            "魚のアタリを大きく伝える",
            "ウキの位置を固定する",
            "道糸とハリスの絡みを防ぐ",
            "リーダーの代わりになる",
          ]}
          answer="3. 道糸とハリスの絡みを防ぐ"
          explanation="天秤は主に投げ釣りで使用する金具で、道糸とハリスが絡むのを防ぐ役割があります。同時にオモリとしての機能も兼ねるタイプが多いです（ジェット天秤、L型天秤等）。"
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
