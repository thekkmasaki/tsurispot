import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam } from "@/components/instructor-exam/callouts";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "実技対策 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験の実技対策。キャスティング、結び方、仕掛け作りの手順と減点ポイントを解説。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/practical`,
  },
  openGraph: {
    title: "実技対策 | 公認釣りインストラクター試験対策 | ツリスポ",
    description:
      "キャスティング、結び方（ノット）、仕掛け作りの手順と減点ポイントを解説。",
    url: `${baseUrl}/instructor-exam/practical`,
    type: "article",
    siteName: "ツリスポ",
    images: [
      {
        url: "https://tsurispot.com/api/og?title=実技対策&emoji=🎯",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "実技対策 | 釣りインストラクター試験対策",
    description:
      "キャスティング・結び方・仕掛け作りの実技試験を攻略する。",
    images: ["https://tsurispot.com/api/og?title=実技対策&emoji=🎯"],
  },
  keywords: [
    "釣りインストラクター",
    "実技対策",
    "キャスティング",
    "ノット",
    "結び方",
    "仕掛け",
    "試験対策",
  ],
};

/* ============================================================
   ページ本体
   ============================================================ */

export default function PracticalPage() {
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
                name: "実技対策",
                item: `${baseUrl}/instructor-exam/practical`,
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
            headline: "実技対策 | 公認釣りインストラクター試験対策",
            description:
              "公認釣りインストラクター試験の実技対策。キャスティング、結び方、仕掛け作りの手順と減点ポイントを解説。",
            url: `${baseUrl}/instructor-exam/practical`,
            datePublished: "2026-03-21",
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
            <li className="font-medium text-foreground">実技対策</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">実技対策</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">実技対策</h1>
          <p className="mt-2 text-sky-200">
            キャスティング・結び方・仕掛け作りの実技試験を攻略する
          </p>
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-base font-bold">目次</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#overview" className="text-sky-700 hover:underline">
                実技試験の概要
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#casting" className="text-sky-700 hover:underline">
                キャスティングの基本フォームと注意点
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#knots" className="text-sky-700 hover:underline">
                必須の結び方（ノット）
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#rigs" className="text-sky-700 hover:underline">
                仕掛け作りの手順
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#deductions" className="text-sky-700 hover:underline">
                よくある減点ポイント
              </a>
            </li>
          </ul>
        </div>

        {/* ===== 実技試験の概要 ===== */}
        <h2
          id="overview"
          className="mb-4 mt-10 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          実技試験の概要
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          公認釣りインストラクター試験の実技試験では、<strong>キャスティング</strong>、<strong>結び方（ノット）</strong>、<strong>仕掛け作り</strong>の3つの科目が出題されます。正確性・安全性・手際の良さが評価の基準となります。
        </p>

        <div className="mb-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">科目</th>
                <th className="px-4 py-2.5 text-left">内容</th>
                <th className="px-4 py-2.5 text-left">評価基準</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">キャスティング</td>
                <td className="px-4 py-2.5">正しいフォームでの投げ方</td>
                <td className="px-4 py-2.5">フォーム・安全確認・飛距離</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">結び方（ノット）</td>
                <td className="px-4 py-2.5">指定された結び方の実演</td>
                <td className="px-4 py-2.5">正確性・結び目の強度・端糸処理</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">仕掛け作り</td>
                <td className="px-4 py-2.5">指定された仕掛けの組み立て</td>
                <td className="px-4 py-2.5">パーツの順序・結びの正確性・手際</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mb-4 text-sm leading-relaxed">
          受験区分は<strong>海面区分</strong>と<strong>内水面区分</strong>があり、海面区分では投げ釣りやサビキ仕掛けが中心、内水面区分では渓流仕掛けやフライキャスティングが含まれるなど、出題内容に違いがあります。ここでは両区分に共通する基本的な技術を中心に解説します。
        </p>

        {/* ===== キャスティング ===== */}
        <h2
          id="casting"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          キャスティングの基本フォームと注意点
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          オーバーヘッドキャストの手順
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          最も基本的な投げ方であるオーバーヘッドキャストの手順を確認しましょう。
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>後方確認</strong>: 竿を振り上げる前に必ず後方を確認し、人や障害物がないことを確かめる
          </li>
          <li>
            <strong>竿を後方に振り上げる</strong>: 竿先を前方に向けた状態から、肘を支点にして竿を頭上後方へ振り上げる。手首を使いすぎず、腕全体で動かす
          </li>
          <li>
            <strong>一瞬止める（タメを作る）</strong>: 竿が後方で最も曲がった状態で一瞬止め、竿のしなりにエネルギーを蓄える
          </li>
          <li>
            <strong>前方へ振り出す</strong>: タメを活かして竿を前方へ振り出す。力まず、竿の弾力を利用してスムーズに加速する
          </li>
          <li>
            <strong>リリースポイントで糸を放す</strong>: 竿が前方45度付近に来たタイミングで人差し指にかけていた糸（またはサミング）を放す
          </li>
        </ol>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          注意点
        </h3>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>後方確認は必須</strong>: 試験では後方確認をしないだけで大きく減点される
          </li>
          <li>
            <strong>力まない</strong>: 力任せに振ると制御が乱れる。竿のしなりを活用することが重要
          </li>
          <li>
            <strong>肘を支点にする</strong>: 手首だけで振ると精度が落ち、竿への負担も大きくなる
          </li>
          <li>
            <strong>リリースタイミング</strong>: 早すぎると上に飛び、遅すぎると手前に落ちる
          </li>
        </ul>

        <Point>
          <p>
            すべての実技で<strong>「安全確認」</strong>が採点項目に含まれます。特にキャスティングでは、投げる前の後方確認と、周囲の人との安全距離の確保が最重要です。技術が完璧でも安全確認を怠れば不合格になり得ます。
          </p>
        </Point>

        {/* ===== 結び方（ノット） ===== */}
        <h2
          id="knots"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          必須の結び方（ノット）
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          実技試験では複数の結び方の中から指定されたものを実演します。以下の5つは出題頻度が高く、確実にマスターしておく必要があります。
        </p>

        <div className="mb-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">結び方</th>
                <th className="px-4 py-2.5 text-left">用途</th>
                <th className="px-4 py-2.5 text-left">難易度</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">ユニノット</td>
                <td className="px-4 py-2.5">糸と金具（スナップ・サルカン等）の接続</td>
                <td className="px-4 py-2.5">&#9733;&#9733;&#9734;</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">クリンチノット</td>
                <td className="px-4 py-2.5">糸とスナップ・サルカンの接続</td>
                <td className="px-4 py-2.5">&#9733;&#9733;&#9734;</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">電車結び</td>
                <td className="px-4 py-2.5">糸と糸の接続</td>
                <td className="px-4 py-2.5">&#9733;&#9733;&#9733;</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">外掛け結び</td>
                <td className="px-4 py-2.5">ハリスと針の接続</td>
                <td className="px-4 py-2.5">&#9733;&#9733;&#9733;</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">八の字結び</td>
                <td className="px-4 py-2.5">チチワ（ループ）作り</td>
                <td className="px-4 py-2.5">&#9733;&#9734;&#9734;</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ユニノット */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ユニノットの手順
        </h3>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>糸の先端を金具（アイ）に通し、15cmほどの余り糸を作る</li>
          <li>余り糸を本線側に折り返し、ループを作る</li>
          <li>余り糸の先端をループの中に通しながら、本線と余り糸に4〜5回巻きつける</li>
          <li>余り糸の先端をゆっくり引いて結び目を締める</li>
          <li>本線を引いて結び目を金具まで移動させ、しっかり締め込む。余り糸を2mm程度残してカットする</li>
        </ol>

        {/* クリンチノット */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          クリンチノットの手順
        </h3>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>糸の先端を金具（アイ）に通し、15cmほどの余り糸を作る</li>
          <li>余り糸を本線に5〜6回巻きつける</li>
          <li>巻きつけた後、金具のすぐ上にできたループ（アイと最初の巻きの間）に余り糸を通す</li>
          <li>さらに余り糸を、手順3で通したことでできた大きなループにも通す（改良クリンチノットの場合）</li>
          <li>糸を湿らせてから、本線と余り糸をゆっくり引いて締め込む。余り糸を2mm程度残してカットする</li>
        </ol>

        {/* 電車結び */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          電車結びの手順
        </h3>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>接続する2本の糸を10cmほど重ねて並べる</li>
          <li>糸Aの先端で、糸Bの周りにループを作る</li>
          <li>糸Aの先端をそのループの中に3〜4回通して巻きつけ、締め込む（ユニノットと同じ要領）</li>
          <li>次に糸Bの先端で、同様に糸Aの周りにループを作る</li>
          <li>糸Bの先端をループの中に3〜4回通して巻きつけ、締め込む</li>
          <li>両方の本線をそれぞれ引いて、2つの結び目を中央でぶつけるように寄せ、しっかり締め込む</li>
        </ol>

        {/* 外掛け結び */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          外掛け結びの手順
        </h3>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>針の軸にハリスを沿わせ、針先側にハリスの先端を向ける。チモト（針の上端の輪や平打ち部分）からハリスが出るように持つ</li>
          <li>ハリスの先端で折り返してループを作り、針の軸とハリスの本線を一緒に、チモト側から針先方向へ5〜7回巻きつける</li>
          <li>巻き終わったら、ハリスの先端をループに通す</li>
          <li>ハリスの本線をゆっくり引いてループを縮め、巻きを整える</li>
          <li>しっかり締め込み、余り糸を2mm程度残してカットする。ハリスが針の内側（針先側）から出ていることを確認する</li>
        </ol>

        {/* 八の字結び */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          八の字結びの手順
        </h3>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>糸を二つ折りにして必要な大きさのループを作る</li>
          <li>ループの付け根をひねって8の字の形にする（1回ひねる）</li>
          <li>ループの先端を、ひねってできた輪の中に通し、ゆっくり締め込む</li>
        </ol>

        <Exam>
          <p>
            試験で特に問われる3つのノットは<strong>ユニノット</strong>・<strong>クリンチノット</strong>・<strong>電車結び</strong>です。これら3つは確実に素早く結べるようになるまで練習しましょう。結び目の完成形が正しいかどうかは、力を入れて引っ張ったときにすっぽ抜けないかで確認できます。
          </p>
        </Exam>

        {/* ===== 仕掛け作り ===== */}
        <h2
          id="rigs"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          仕掛け作りの手順
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          サビキ仕掛けの準備手順
        </h3>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>竿にリールをセットし、ガイドに道糸を通す</li>
          <li>道糸の先端にスナップ付きサルカンを結ぶ（ユニノットまたはクリンチノット）</li>
          <li>サビキ仕掛けの上部のサルカンにスナップを接続する</li>
          <li>仕掛けの下部にコマセカゴ（アミカゴ）をセットする</li>
          <li>各接続部がしっかり結ばれているか確認し、仕掛け全体のねじれや絡みがないことを確認する</li>
        </ol>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ウキ釣り仕掛けの基本構成
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          ウキ釣り仕掛けは上から順に以下のパーツで構成されます。パーツの順序を正確に覚えることが重要です。
        </p>
        <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          <li><strong>道糸</strong>（リールからの本線）</li>
          <li><strong>ウキ止め</strong>（ウキの移動を制限する結び目またはゴム）</li>
          <li><strong>シモリ玉</strong>（ウキ止めがウキの穴を通り抜けるのを防ぐビーズ）</li>
          <li><strong>ウキ</strong>（棒ウキまたは円錐ウキ）</li>
          <li><strong>からまん棒</strong>（ウキがサルカン側に落ちるのを防ぐストッパー）</li>
          <li><strong>サルカン</strong>（道糸とハリスの接続具）</li>
          <li><strong>ハリス</strong>（サルカンから針までの糸）</li>
          <li><strong>ガン玉</strong>（ハリスの中間付近に打つおもり）</li>
          <li><strong>針</strong>（ハリスの先端に外掛け結び等で結ぶ）</li>
        </ol>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          投げ釣り仕掛けの基本構成
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          投げ釣り仕掛けの基本構成は以下のとおりです。
        </p>
        <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          <li><strong>道糸</strong>（リールからの本線。投げ釣り用の太めのライン）</li>
          <li><strong>力糸</strong>（道糸の先に接続する太い糸。キャスト時の高切れを防止）</li>
          <li><strong>テンビン</strong>（ジェット天秤やL字天秤。仕掛けの絡み防止）</li>
          <li><strong>おもり</strong>（テンビン一体型、または別付け）</li>
          <li><strong>スナップサルカン</strong>（テンビンと仕掛けの接続部）</li>
          <li><strong>幹糸</strong>（複数の枝バリを出す場合の軸となる糸）</li>
          <li><strong>枝ス（エダス）</strong>（幹糸から分岐するハリス）</li>
          <li><strong>針</strong>（各枝スの先端に結ぶ。流線針やキス針など対象魚に合わせる）</li>
        </ol>

        {/* ===== よくある減点ポイント ===== */}
        <h2
          id="deductions"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          よくある減点ポイント
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          キャスティングでの減点
        </h3>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li><strong>後方確認の省略</strong>: 最も重大な減点項目。安全意識の欠如と判断される</li>
          <li><strong>フォームの乱れ</strong>: 手首だけで振る、体が開きすぎる等</li>
          <li><strong>安全距離の不足</strong>: 周囲の人と十分な距離を取っていない</li>
          <li><strong>リリースタイミングの不安定</strong>: 明後日の方向に飛ぶ、手前に落ちる等</li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          結び方での減点
        </h3>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li><strong>結び目の不完全</strong>: 巻き数の不足、ループの通し忘れ</li>
          <li><strong>端糸の処理忘れ</strong>: 余り糸を長く残したまま、またはカットし忘れ</li>
          <li><strong>締め込み不足</strong>: 結び目がゆるく、引っ張ると抜ける</li>
          <li><strong>糸を湿らせない</strong>: 摩擦熱で糸が傷み、結節強度が低下する</li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          仕掛け作りでの減点
        </h3>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li><strong>パーツの順序間違い</strong>: ウキ止めとシモリ玉の順番を逆にする等</li>
          <li><strong>ガン玉の位置が不適切</strong>: 針のすぐ上に打つ、サルカンの直下に打つ等</li>
          <li><strong>結びの不完全</strong>: 各接続部の結びがゆるい、結び方が違う</li>
          <li><strong>仕掛けの絡み</strong>: 完成した仕掛けが絡まっている</li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          全科目共通の減点
        </h3>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li><strong>手際の悪さ（時間切れ）</strong>: 制限時間内に完了できない</li>
          <li><strong>安全意識の欠如</strong>: 針の扱いが危険、周囲への配慮がない</li>
          <li><strong>道具の扱いが雑</strong>: 竿やリールの取り扱いが不適切</li>
        </ul>

        <Point>
          <p>
            実技試験の対策で最も大切なのは<strong>繰り返しの練習</strong>です。結び方は目を閉じてもできるレベルまで反復し、キャスティングは実際の釣り場やキャスティング練習場で体に染み込ませましょう。試験本番の緊張下でも確実に遂行できることが合格の条件です。
          </p>
        </Point>

        {/* ナビ */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Link
            href="/instructor-exam/essay"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            &larr; 論文対策
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
            本ページの内容は公認釣りインストラクター試験の一般的な出題傾向に基づく学習参考情報です。最新の試験情報は{" "}
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
