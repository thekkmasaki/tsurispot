import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam, TsuriSpotBox, Warn, Analogy } from "@/components/instructor-exam/callouts";
import { ArrowRight } from "lucide-react";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第3章 釣りマナーと指導法 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第3章。先行者優先の原則、ゴミの持ち帰り、漁業者との共存、初心者への指導法、JOFI地域機構での活動を解説。確認クイズ40問付き。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/manners`,
  },
  openGraph: {
    title: "第3章 釣りマナーと指導法 | 公認釣りインストラクター試験対策 | ツリスポ",
    description: "先行者優先・ゴミ問題・漁業者との共存・指導法の知識を解説。章末確認クイズ40問付き。",
    url: `${baseUrl}/instructor-exam/manners`,
    type: "article",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=釣りマナーと指導法&emoji=📝", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "第3章 釣りマナーと指導法 | 釣りインストラクター試験対策",
    description: "先行者優先・ゴミ問題・漁業者との共存・指導法を解説。確認クイズ40問付き。",
    images: ["https://tsurispot.com/api/og?title=釣りマナーと指導法&emoji=📝"],
  },
  keywords: ["釣りマナー", "先行者優先", "指導法", "JOFI", "釣りインストラクター", "試験対策"],
};

/* ============================================================
   ページ本体
   ============================================================ */

export default function MannersPage() {
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
                name: "釣りマナーと指導法",
                item: `${baseUrl}/instructor-exam/manners`,
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
            headline: "第3章 釣りマナーと指導法 | 公認釣りインストラクター試験対策",
            description: "先行者優先・ゴミ問題・漁業者との共存・指導法の知識を解説。確認クイズ40問付き。",
            url: `${baseUrl}/instructor-exam/manners`,
            datePublished: "2025-12-01",
            dateModified: "2026-03-01",
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
            <li className="font-medium text-foreground">釣りマナーと指導法</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">第3章</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            釣りマナーと指導法
          </h1>
          <p className="mt-2 text-sky-200">
            先行者優先の原則から初心者への指導法まで、インストラクターに求められるマナーと指導スキルを学びます。
          </p>
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-base font-bold">目次</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec3-1" className="text-sky-700 hover:underline">
                3.1 釣り場でのルール
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec3-2" className="text-sky-700 hover:underline">
                3.2 環境への配慮
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec3-3" className="text-sky-700 hover:underline">
                3.3 周辺住民・漁業者への配慮
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec3-4" className="text-sky-700 hover:underline">
                3.4 インストラクターとしての指導法
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#summary" className="text-sky-700 hover:underline">
                章末まとめ &amp; 確認クイズ
              </a>
            </li>
          </ul>
        </div>

        {/* ===== 3.1 釣り場でのルール ===== */}
        <h2
          id="sec3-1"
          className="mb-4 mt-10 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          3.1 釣り場でのルール
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          先行者優先の原則
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣り場では<strong>先に来た人が優先</strong>という暗黙のルールがあります。これは法律ではありませんが、釣り人の間で広く共有されている最も基本的なマナーです。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>先行者が釣っている場所の近くに無断で入らない</li>
          <li>割り込みを避け、十分な間隔を取る</li>
          <li>場所を確保するために道具だけ置いて離れる「場所取り」も好ましくない</li>
          <li>声をかけて空いているスペースを確認してから釣り座を構える</li>
        </ul>

        <Point>
          <p>
            インストラクターとして指導する際は、「先行者優先」が単なるマナーではなく、<strong>トラブルや事故の予防策</strong>でもあることを伝えましょう。お互いの仕掛けが絡んだり、投げ釣りの際に他人に針が当たる事故を防ぐ意味があります。
          </p>
        </Point>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          投げ釣りの安全距離
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          投げ釣り・キャスティングを行う際は、周囲に十分な安全距離を確保する必要があります。後方・側方に人がいないことを必ず確認してからキャストしてください。特に堤防では、通行人や他の釣り人に仕掛けが当たる危険があります。
        </p>

        <Warn>
          <p>
            釣り針が人に当たると重大な事故（眼の負傷等）につながる場合があります。キャスト前の後方確認は絶対に怠らないよう指導しましょう。ルアーの場合も同様に、バックスイングの範囲に人がいないか確認が必要です。
          </p>
        </Warn>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          コマセ（まき餌）の後始末
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          サビキ釣りやウキ釣りで使用するコマセ（まき餌）は、釣りが終わったら<strong>必ず水で洗い流す</strong>のがマナーです。放置すると悪臭の原因となり、釣り場の利用禁止につながることがあります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ゴミの持ち帰り
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          自分が出したゴミは<strong>全て持ち帰る</strong>のが大原則です。釣り糸の切れ端、仕掛けのパッケージ、飲食物の容器など、釣り場にゴミを残さないようにしましょう。加えて、落ちているゴミを拾って帰る姿勢も釣り人のイメージ向上に貢献します。
        </p>

        <TsuriSpotBox>
          <p>
            ツリスポの{" "}
            <Link
              href="/fishing-rules"
              className="font-medium underline"
            >
              「釣りのルールとマナー」ページ
            </Link>{" "}
            では、各釣り場の固有ルール（立入禁止区域、コマセ禁止等）もまとめています。指導の際の参考にしてください。
          </p>
        </TsuriSpotBox>

        {/* ===== 3.2 環境への配慮 ===== */}
        <h2
          id="sec3-2"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          3.2 環境への配慮
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          釣り糸の回収（野鳥被害防止）
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          切れた釣り糸や使い古した糸を放置すると、<strong>野鳥や海洋生物が絡まって死亡する</strong>原因となります。ナイロンラインやPEラインは自然分解に数百年かかると言われています。使わなくなった糸は必ず回収し、釣具店に設置されている「釣り糸回収ポスト」に入れるか、一般ゴミとして適切に処理しましょう。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          釣り針の処理
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          使い終わった釣り針や折れた針は、<strong>ペットボトルなどの密閉容器に入れて持ち帰り</strong>ましょう。砂浜や堤防に落ちた針は裸足の人や動物に刺さる危険があります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          外来魚のリリース問題
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          第1章でも触れた通り、ブラックバスやブルーギルなどの特定外来生物は生きたままの移動が法律で禁止されています。インストラクターとしては、外来魚問題について釣り人に正しい知識を伝え、在来種の生態系保全の重要性を説明する必要があります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          プラスチックゴミ削減
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣り具のパッケージや飲食物の容器など、釣り場で発生するプラスチックゴミは海洋汚染の原因の一つです。マイボトルの持参、ゴミ袋の携帯、ソフトルアーのロスト軽減など、一人ひとりの心がけが大切です。
        </p>

        <Exam>
          <p>
            環境配慮は論文試験でも頻出テーマです。「釣りインストラクターとして環境保全のためにできること」を論じる問題が出されることがあります。<strong>釣り糸の回収・ゴミの持ち帰り・外来種問題</strong>の3点は必ず押さえておきましょう。
          </p>
        </Exam>

        {/* ===== 3.3 周辺住民・漁業者への配慮 ===== */}
        <h2
          id="sec3-3"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          3.3 周辺住民・漁業者への配慮
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          駐車マナー
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣り場近くでの路上駐車は近隣住民の迷惑になるだけでなく、緊急車両の通行を妨げる危険があります。必ず<strong>指定された駐車場</strong>を利用するか、有料駐車場に停めましょう。漁港内の駐車は漁業者の作業の妨げになるため、漁協の許可がない限り避けるべきです。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          騒音（早朝・深夜）
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          朝マズメ狙いの早朝や夜釣りの際、車のドアの開閉音、大声での会話、車のエンジン音などが近隣住民の迷惑になることがあります。<strong>住宅地に近い釣り場では特に注意</strong>が必要です。
        </p>

        <Analogy>
          <p>
            自分の家の隣で毎朝4時にドアをバタンバタン閉めて大声で話している人がいたらどう思うか? 釣り人がそうした行為を繰り返すと、やがて「釣り禁止」の看板が立つことになります。マナーを守ることは、<strong>釣り場を守ること</strong>です。
          </p>
        </Analogy>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          漁港での釣り（漁業者との共存）
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          漁港は本来<strong>漁業者の作業場所</strong>であり、釣り人が利用させてもらっている立場です。漁業者との共存のために以下の点を心がけましょう。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>船の出入りの際は仕掛けを上げて通行を妨げない</li>
          <li>ロープや係留設備に釣り糸を引っかけない</li>
          <li>漁具や網に触らない</li>
          <li>作業中の漁業者に声をかけられたら速やかに従う</li>
          <li>「釣り禁止」や「関係者以外立入禁止」の表示は必ず守る</li>
        </ul>

        <Warn>
          <p>
            全国的に漁港での釣り禁止区域が増加しています。主な原因は、ゴミの放置、路上駐車、漁業者の作業妨害です。マナー違反は<strong>釣り場の喪失</strong>に直結することを強く認識しましょう。
          </p>
        </Warn>

        {/* ===== 3.4 インストラクターとしての指導法 ===== */}
        <h2
          id="sec3-4"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          3.4 インストラクターとしての指導法
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          初心者への声かけ方法
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣りインストラクターの最も大切な役割の一つは、<strong>初心者に釣りの楽しさを伝えること</strong>です。初めて釣りをする人は不安を感じていることが多いため、以下のポイントを意識しましょう。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>まず笑顔であいさつし、緊張をほぐす</li>
          <li>専門用語を避け、わかりやすい言葉で説明する</li>
          <li>「やってみましょう」と実際に体験させることを重視する</li>
          <li>失敗しても怒らず、改善点を前向きに伝える</li>
          <li>小さな成功（エサ付けができた、仕掛けが飛んだ等）をほめる</li>
        </ul>

        <Point>
          <p>
            インストラクターの指導で最も大切なのは、<strong>相手の立場に立った声かけ</strong>です。釣りの経験が長い人ほど「当たり前」のことが初心者には難しいことを忘れがちです。「知っていて当然」という態度は禁物です。
          </p>
        </Point>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          子ども・高齢者への安全配慮
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣り教室では、参加者の年齢・体力に応じた安全配慮が求められます。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">対象</th>
                <th className="px-4 py-2.5 text-left">主な注意点</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">子ども</td>
                <td className="px-4 py-2.5">
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>ライフジャケットの着用を徹底</li>
                    <li>針のカエシを潰した安全針の使用を検討</li>
                    <li>水際には必ず大人が付き添う</li>
                    <li>熱中症対策（帽子・水分補給）</li>
                    <li>飽きやすいので短時間で切り上げる工夫</li>
                  </ul>
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">高齢者</td>
                <td className="px-4 py-2.5">
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>足場の良い場所を選ぶ（テトラ上は避ける）</li>
                    <li>ライフジャケットの着用</li>
                    <li>体力に合った無理のないスケジュール</li>
                    <li>休憩・水分補給のこまめな声かけ</li>
                    <li>持病・服薬の事前確認</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          釣り教室の運営方法
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣りインストラクターが釣り教室を開催する際の基本的な流れは以下の通りです。
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>事前準備</strong>: 釣り場の下見、天候確認、道具・仕掛けの準備、保険の加入確認
          </li>
          <li>
            <strong>安全説明</strong>: ライフジャケットの着用方法、釣り場の危険箇所、緊急連絡先の共有
          </li>
          <li>
            <strong>ルール説明</strong>: 釣り場のルール・マナー、漁業権に関する注意事項
          </li>
          <li>
            <strong>実技指導</strong>: エサの付け方、仕掛けの投入、合わせ方、魚の外し方
          </li>
          <li>
            <strong>後片付け</strong>: ゴミの回収、コマセの清掃、道具の片付け
          </li>
          <li>
            <strong>振り返り</strong>: 感想の共有、次回の案内
          </li>
        </ol>

        <Exam>
          <p>
            釣り教室の運営では、<strong>安全管理が最優先</strong>です。試験では「釣り教室の運営で最も重要なことは何か」という問題が出ることがあります。答えは「参加者の安全確保」です。楽しさや釣果よりも安全が第一であることを常に意識してください。
          </p>
        </Exam>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          JOFI地域機構での活動
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          公認釣りインストラクターは、<strong>JOFI（Japan Outdoor Fishing Instructors）</strong>と呼ばれ、各地域に地域機構（JOFI地域機構）が設置されています。主な活動内容は以下の通りです。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>地域での釣り教室・体験イベントの開催</li>
          <li>釣り場清掃活動（クリーンアップ）への参加・主催</li>
          <li>水辺の安全啓発活動</li>
          <li>子ども・青少年への釣り体験活動の支援</li>
          <li>漁協・自治体との連携による地域貢献</li>
          <li>インストラクター同士の研修・情報共有</li>
        </ul>

        <Point>
          <p>
            JOFIの活動は「<strong>釣りの健全な普及と水辺環境の保全</strong>」を目的としています。試験の論文で「インストラクターとしてどのような活動を行いたいか」を問われた場合は、地域での具体的な取り組みを述べると評価が高くなります。
          </p>
        </Point>

        {/* ===== 章末まとめ ===== */}
        <h2
          id="summary"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          章末まとめ
        </h2>

        <div className="mb-8 rounded-xl border-2 border-sky-400 bg-gradient-to-br from-sky-50 to-blue-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-sky-900">
            第3章のポイント
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong>先行者優先</strong>: 釣り場の最も基本的なマナー。トラブル・事故防止の意味もある
            </li>
            <li>
              <strong>安全距離の確保</strong>: キャスト前の後方確認は絶対に怠らない
            </li>
            <li>
              <strong>コマセの後始末</strong>: 釣り終わりに水で洗い流すのがマナー
            </li>
            <li>
              <strong>ゴミは全て持ち帰り</strong>: 釣り糸の放置は野鳥被害の原因に
            </li>
            <li>
              <strong>漁港は漁業者の作業場</strong>: 船の出入りの際は仕掛けを上げて通行確保
            </li>
            <li>
              <strong>マナー違反は釣り場喪失に直結</strong>: 全国で漁港の釣り禁止区域が増加中
            </li>
            <li>
              <strong>指導の基本</strong>: 相手の立場に立ち、わかりやすい言葉で、失敗を責めない
            </li>
            <li>
              <strong>釣り教室は安全管理が最優先</strong>: ライフジャケット着用の徹底
            </li>
            <li>
              <strong>JOFI地域機構</strong>: 釣り教室・清掃活動・安全啓発が主な活動
            </li>
          </ul>
        </div>

        {/* ===== 章末確認クイズ CTA ===== */}
        <div className="mt-8 rounded-xl border-2 border-purple-200 bg-purple-50 p-6 text-center">
          <h2 className="text-xl font-bold text-purple-800">確認クイズに挑戦</h2>
          <p className="mt-2 text-sm text-purple-600">全40問の4択クイズで理解度をチェック</p>
          <Link
            href="/instructor-exam/manners/quiz"
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
            href="/instructor-exam/tackle"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            第5章 釣り具の知識 &rarr;
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
