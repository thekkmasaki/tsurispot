import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam, TsuriSpotBox, Warn, Analogy } from "@/components/instructor-exam/callouts";
import { ExamQuiz } from "@/components/instructor-exam/exam-quiz";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第3章 釣りマナーと指導法 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第3章。先行者優先の原則、ゴミの持ち帰り、漁業者との共存、初心者への指導法、JOFI地域機構での活動を解説。確認クイズ10問付き。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/manners`,
  },
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

        <ExamQuiz
          questions={[
            {
              id: "manners-3-1",
              question: "釣り場でのマナーとして最も不適切なものはどれか？",
              choices: [
                "先行者に声をかけてから隣で釣りを始める",
                "空いている堤防に自分の道具を置いて場所を確保してから車に戻る",
                "コマセで汚れた堤防を水で洗い流してから帰る",
                "自分が出したゴミを全て持ち帰る",
              ],
              correctIndex: 1,
              explanation:
                "道具だけ置いて離れる「場所取り」は他の釣り人の迷惑になるためマナー違反とされています。その他はいずれも適切なマナーです。",
              choiceExplanations: [
                "先行者に声をかけてから隣で釣りを始めるのは正しいマナーです。コミュニケーションを取ることでトラブルを未然に防げます。",
                "道具だけ置いて場所を確保する「場所取り」は、他の釣り人が使えるスペースを不当に占有する行為であり、マナー違反です。実際に釣りをしていない間は場所を空けるべきです。",
                "コマセで汚れた堤防を水で洗い流すのは基本的なマナーです。放置すると悪臭やシミの原因となり、釣り場の利用禁止につながることがあります。",
                "自分が出したゴミを全て持ち帰るのは釣り場マナーの大原則です。釣り場の環境を守る最も基本的な行動です。",
              ],
            },
          ]}
          showNumbers={false}
        />

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

        <ExamQuiz
          questions={[
            {
              id: "manners-3-2",
              question: "釣り場での環境配慮として正しいものはどれか？",
              choices: [
                "ナイロンラインは自然に分解されるので放置してよい",
                "切れた釣り糸は回収して適切に処理する",
                "余ったコマセは海に捨てれば魚のエサになるので問題ない",
                "ソフトルアーは生分解性なのでロストしても問題ない",
              ],
              correctIndex: 1,
              explanation:
                "ナイロンラインの自然分解には数百年かかります。切れた糸や使い古した糸は必ず回収しましょう。余ったコマセの投棄やソフトルアーのロスト（多くは生分解性ではない）も環境負荷の原因になります。",
              choiceExplanations: [
                "ナイロンラインの自然分解には数百年かかると言われており、放置は厳禁です。野鳥や海洋生物が絡まって死亡する原因にもなります。",
                "切れた釣り糸を回収して適切に処理するのは正しい環境配慮です。釣具店の釣り糸回収ポストを利用するか、一般ゴミとして処理しましょう。",
                "余ったコマセを大量に海に投棄すると水質汚染の原因になります。余ったコマセは持ち帰るのがマナーです。",
                "市販のソフトルアーの多くは生分解性ではなく、プラスチック素材です。ロストすると海洋プラスチックゴミとなり環境負荷になります。",
              ],
            },
          ]}
          showNumbers={false}
        />

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

        <ExamQuiz
          questions={[
            {
              id: "manners-3-3",
              question: "漁港での釣りについて、最も適切な行動はどれか？",
              choices: [
                "漁船が出入りする時はそのまま釣りを続ける",
                "「関係者以外立入禁止」の場所でも釣りなら許される",
                "船の出入りの際は仕掛けを上げて通行を妨げないようにする",
                "漁港は公共の場所なので漁業者よりも先に来た釣り人が優先である",
              ],
              correctIndex: 2,
              explanation:
                "漁港は漁業者の作業場所です。船の出入りの際は仕掛けを上げて通行を確保するのが基本マナーです。立入禁止区域には絶対に入ってはいけません。",
              choiceExplanations: [
                "漁船の出入り時にそのまま釣りを続けると、仕掛けがスクリューに巻き込まれたり、船の航行を妨げたりする危険があります。必ず仕掛けを上げましょう。",
                "「関係者以外立入禁止」の表示がある場所は、安全上または漁業上の理由で立入が制限されています。釣り人も例外ではなく、絶対に入ってはいけません。",
                "船の出入りの際に仕掛けを上げて通行を確保するのは、漁港での釣りにおける最も基本的なマナーです。漁業者の作業を妨げないことが共存の第一歩です。",
                "漁港は本来漁業者の作業場所であり、釣り人は利用させてもらっている立場です。先行者優先のルールは漁業者の作業には適用されません。",
              ],
            },
          ]}
          showNumbers={false}
        />

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

        {/* ===== 章末確認クイズ 10問 ===== */}
        <h2 className="mb-4 text-xl font-bold text-sky-900">
          章末確認クイズ（全10問）
        </h2>

        <ExamQuiz
          questions={[
            {
              id: "manners-end-1",
              question: "釣り場における「先行者優先」の原則について正しいものはどれか？",
              choices: [
                "法律で定められた義務である",
                "先行者がいても上手な人が優先される",
                "釣り人の間で広く共有されているマナーであり、トラブル防止にもなる",
                "先行者優先は海釣りのみに適用される",
              ],
              correctIndex: 2,
              explanation:
                "先行者優先は法律ではありませんが、釣り人の間で広く共有されている最も基本的なマナーです。海釣り・川釣りを問わず適用されます。",
              choiceExplanations: [
                "先行者優先は法律で定められた義務ではなく、釣り人同士の暗黙のルール・マナーです。ただし、マナーであっても守ることが大切です。",
                "釣りの技術レベルに関係なく、先に来た人が優先されます。腕前で優先順位が変わることはありません。",
                "先行者優先は法律ではないものの、釣り人の間で広く共有されている基本マナーです。仕掛けの絡みや針による事故などのトラブル防止にも直結します。",
                "先行者優先は海釣りだけでなく、川釣り・湖釣りなど全ての釣りに共通して適用されるマナーです。",
              ],
            },
            {
              id: "manners-end-2",
              question: "投げ釣りの安全対策として最も重要なものはどれか？",
              choices: [
                "できるだけ遠くに飛ばす技術の習得",
                "キャスト前に後方・側方に人がいないか確認する",
                "重いオモリを使わないようにする",
                "風向きを読んで投げる方向を決める",
              ],
              correctIndex: 1,
              explanation:
                "キャスト前の周囲確認は事故防止の最も基本的な対策です。釣り針が人に当たると重大な事故につながる可能性があります。",
              choiceExplanations: [
                "遠投技術の習得は釣果向上には有効ですが、安全対策としては最も重要な項目ではありません。",
                "キャスト前に後方・側方に人がいないか確認することは、針が人に当たる重大事故を防ぐ最も基本的かつ最重要の安全対策です。インストラクターとして必ず指導すべき項目です。",
                "オモリの重さは飛距離や仕掛けの安定性に関わるもので、安全対策の最優先事項ではありません。",
                "風向きの把握はキャスティングの精度向上には役立ちますが、安全対策として最も重要なのは周囲の確認です。",
              ],
            },
            {
              id: "manners-end-3",
              question: "ナイロンラインの自然分解にかかる時間として最も近いものはどれか？",
              choices: [
                "数日",
                "数か月",
                "数十年",
                "数百年",
              ],
              correctIndex: 3,
              explanation:
                "ナイロンラインの自然分解には数百年かかると言われています。切れた釣り糸は必ず回収し適切に処理する必要があります。",
              choiceExplanations: [
                "数日で分解される素材ではありません。ナイロンは合成樹脂であり、自然環境下では非常に長い時間が必要です。",
                "数か月でも分解されません。ナイロンの耐久性は高く、自然環境下での分解速度は極めて遅いです。",
                "数十年でもまだ短い見積もりです。ナイロンラインは数百年レベルの分解期間が必要とされています。",
                "ナイロンラインの自然分解には数百年かかると言われています。この長さを理解することで、釣り糸回収の重要性がより明確になります。",
              ],
            },
            {
              id: "manners-end-4",
              question: "釣り場の環境保全のために釣り人ができることとして不適切なものはどれか？",
              choices: [
                "釣り糸回収ポストに使い古した糸を入れる",
                "余ったコマセを海に全て撒いてから帰る",
                "落ちているゴミを拾って帰る",
                "使用済みの針をペットボトルに入れて持ち帰る",
              ],
              correctIndex: 1,
              explanation:
                "余ったコマセの大量投棄は水質汚染の原因になります。余ったコマセは持ち帰るか、釣りに使う分だけにとどめ、使わなかった分は持ち帰りましょう。",
              choiceExplanations: [
                "釣り糸回収ポストの利用は適切な環境配慮です。釣具店やメーカーが設置しているポストを積極的に活用しましょう。",
                "余ったコマセを海に全て撒く行為は水質汚染の原因になります。必要量だけ使い、余った分は持ち帰るのが正しいマナーです。",
                "落ちているゴミを拾って帰るのは釣り人のイメージ向上にもつながる素晴らしい行動です。自分が出したゴミ以外も積極的に回収しましょう。",
                "使用済みの針をペットボトル等の密閉容器に入れて持ち帰るのは正しい処理方法です。砂浜や堤防に落ちた針は人や動物に刺さる危険があります。",
              ],
            },
            {
              id: "manners-end-5",
              question: "漁港での釣りについて正しいものはどれか？",
              choices: [
                "漁港は公共施設なので釣り人にも優先使用権がある",
                "漁港は漁業者の作業場所であり、釣り人は利用させてもらっている立場である",
                "漁業者の作業中でもそのまま釣りを続けてよい",
                "漁港内の駐車は漁業者の邪魔にならなければ自由に停めてよい",
              ],
              correctIndex: 1,
              explanation:
                "漁港は本来漁業者の作業場所です。釣り人は利用させてもらっている立場であることを常に意識し、漁業者の作業を妨げないようにしましょう。",
              choiceExplanations: [
                "漁港は漁業のための施設であり、釣り人に優先使用権はありません。漁業者の作業が常に優先されます。",
                "漁港は本来漁業者の作業場所であり、釣り人は利用させてもらっている立場です。この認識を持つことが漁業者との共存の第一歩です。",
                "漁業者の作業中は仕掛けを上げ、通行を確保するなどの配慮が必要です。そのまま釣りを続ける行為は作業妨害になります。",
                "漁港内の駐車は漁協の許可がない限り避けるべきです。漁業者の車両や作業の妨げになるためです。",
              ],
            },
            {
              id: "manners-end-6",
              question: "釣りインストラクターが初心者を指導する際の心構えとして最も適切なものはどれか？",
              choices: [
                "専門用語を積極的に使って知識レベルを上げる",
                "失敗した際はすぐに正しい方法を厳しく指導する",
                "相手の立場に立ち、わかりやすい言葉で、小さな成功をほめる",
                "できるだけ早く大物を釣らせて成功体験を積ませる",
              ],
              correctIndex: 2,
              explanation:
                "初心者指導では専門用語を避け、わかりやすい言葉で説明し、エサ付けなど小さな成功をほめることが大切です。失敗しても前向きな声かけで改善を促しましょう。",
              choiceExplanations: [
                "初心者に専門用語を多用すると混乱や不安を招きます。まずはわかりやすい平易な言葉で説明し、理解が進んでから徐々に用語を紹介するのが適切です。",
                "失敗を厳しく指摘すると初心者の意欲を削いでしまいます。失敗を責めず、改善点を前向きに伝えることで楽しい体験を提供しましょう。",
                "相手の立場に立ち、わかりやすい言葉で説明し、小さな成功をほめることがインストラクターの指導の基本です。釣りの楽しさを伝えることが最も大切な役割です。",
                "大物を釣らせること自体は悪くありませんが、最優先ではありません。まずは基本的な動作（エサ付け、キャスト等）の成功体験を積み重ねることが重要です。",
              ],
            },
            {
              id: "manners-end-7",
              question: "子ども向けの釣り教室で最も優先すべきことはどれか？",
              choices: [
                "できるだけ多くの魚を釣らせること",
                "参加者の安全確保（ライフジャケット着用の徹底等）",
                "高度な釣り技術を教えること",
                "長時間の釣りで持久力をつけさせること",
              ],
              correctIndex: 1,
              explanation:
                "釣り教室の運営で最も優先すべきは参加者の安全確保です。特に子どもの場合はライフジャケットの着用を徹底し、水際には必ず大人が付き添いましょう。",
              choiceExplanations: [
                "魚を釣らせることは楽しい体験につながりますが、安全確保よりも優先されるものではありません。",
                "参加者の安全確保は釣り教室運営の最優先事項です。特に子どもはライフジャケット着用を徹底し、水際には必ず大人が付き添うことが不可欠です。",
                "高度な技術の指導は初心者の子どもには適切ではありません。まずは安全に楽しく釣りの基本を体験させることが大切です。",
                "子どもは体力が限られており、飽きやすい傾向があります。長時間ではなく、短時間で切り上げる工夫が必要です。",
              ],
            },
            {
              id: "manners-end-8",
              question: "釣り教室の運営手順として正しい順番はどれか？",
              choices: [
                "実技指導 → 安全説明 → 後片付け",
                "安全説明 → ルール説明 → 実技指導 → 後片付け",
                "ルール説明 → 実技指導 → 安全説明",
                "実技指導 → ルール説明 → 後片付け → 安全説明",
              ],
              correctIndex: 1,
              explanation:
                "釣り教室ではまず安全説明（ライフジャケット着用、危険箇所の説明等）を行い、次にルール説明、そして実技指導、最後に後片付けという流れが基本です。",
              choiceExplanations: [
                "実技指導の前に安全説明とルール説明を行う必要があります。安全を確保してから実技に入るのが正しい順序です。",
                "安全説明 → ルール説明 → 実技指導 → 後片付けが正しい順番です。安全管理が最優先であるため、実技指導よりも前に安全・ルールの説明を行います。",
                "安全説明を最後に持ってくる順序は不適切です。安全説明は実技指導の前に必ず行わなければなりません。",
                "安全説明を後片付けの後に行うのは意味がありません。安全に関する説明は全ての活動に先立って行う必要があります。",
              ],
            },
            {
              id: "manners-end-9",
              question: "JOFI（公認釣りインストラクター）の主な活動に含まれないものはどれか？",
              choices: [
                "地域での釣り教室の開催",
                "釣り場清掃活動への参加",
                "漁業権の取り締まり",
                "水辺の安全啓発活動",
              ],
              correctIndex: 2,
              explanation:
                "漁業権の取り締まりは漁業監督官や海上保安官等の権限であり、JOFIの活動には含まれません。JOFIの活動は釣り教室、清掃活動、安全啓発などの普及・啓発が中心です。",
              choiceExplanations: [
                "釣り教室の開催はJOFIの主要な活動の一つです。地域での釣り体験イベントや初心者向け教室を企画・運営します。",
                "釣り場清掃活動（クリーンアップ）への参加・主催はJOFIの重要な活動です。水辺環境の保全に貢献します。",
                "漁業権の取り締まりは漁業監督官や海上保安官など、法的な権限を持つ公務員の職務です。JOFIは普及・啓発活動が中心であり、取り締まりの権限はありません。",
                "水辺の安全啓発活動はJOFIの主要な活動の一つです。ライフジャケットの着用推進や水難事故防止の啓発などを行います。",
              ],
            },
            {
              id: "manners-end-10",
              question: "全国で漁港の釣り禁止区域が増加している主な原因として正しいものはどれか？",
              choices: [
                "魚の個体数が減少したため",
                "漁業者の高齢化が進んだため",
                "釣り人のマナー違反（ゴミ放置、路上駐車、作業妨害等）",
                "釣り具の値段が高騰したため",
              ],
              correctIndex: 2,
              explanation:
                "漁港の釣り禁止区域増加の主な原因は、釣り人のゴミ放置、路上駐車、漁業者の作業妨害などのマナー違反です。マナーを守ることは釣り場を守ることに直結します。",
              choiceExplanations: [
                "魚の個体数の変動は釣り禁止の直接的な原因ではありません。漁港の釣り禁止は主に釣り人のマナー問題に起因しています。",
                "漁業者の高齢化は漁業全体の課題ですが、漁港の釣り禁止区域増加の主な原因ではありません。",
                "釣り人のゴミ放置、路上駐車、漁業者の作業妨害などのマナー違反が漁港の釣り禁止区域増加の主な原因です。一人ひとりのマナーが釣り場の存続に直結します。",
                "釣り具の価格は釣り禁止区域の増加とは無関係です。マナー違反が最大の原因です。",
              ],
            },
          ]}
          showNumbers
          startNumber={1}
        />

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
