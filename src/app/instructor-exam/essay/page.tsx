import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam } from "@/components/instructor-exam/callouts";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "論文対策 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験の論文対策。頻出テーマ5選、800字論文の構成フレームワーク、テーマ別のポイント整理。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/essay`,
  },
  openGraph: {
    title: "論文対策 | 公認釣りインストラクター試験対策 | ツリスポ",
    description:
      "頻出テーマ5選、800字論文の構成フレームワーク、テーマ別のポイント整理。",
    url: `${baseUrl}/instructor-exam/essay`,
    type: "article",
    siteName: "ツリスポ",
    images: [
      {
        url: "https://tsurispot.com/api/og?title=論文対策&emoji=✍️",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "論文対策 | 釣りインストラクター試験対策",
    description:
      "頻出テーマ5選と800字論文の構成フレームワークを解説。",
    images: ["https://tsurispot.com/api/og?title=論文対策&emoji=✍️"],
  },
  keywords: [
    "釣りインストラクター",
    "論文対策",
    "試験対策",
    "800字論文",
    "頻出テーマ",
  ],
};

/* ============================================================
   ページ本体
   ============================================================ */

export default function EssayPage() {
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
                name: "論文対策",
                item: `${baseUrl}/instructor-exam/essay`,
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
            headline: "論文対策 | 公認釣りインストラクター試験対策",
            description:
              "公認釣りインストラクター試験の論文対策。頻出テーマ5選、800字論文の構成フレームワーク、テーマ別のポイント整理。",
            url: `${baseUrl}/instructor-exam/essay`,
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
            <li className="font-medium text-foreground">論文対策</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">論文対策</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">論文対策</h1>
          <p className="mt-2 text-sky-200">
            800字・60分の論文試験を攻略する
          </p>
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-base font-bold">目次</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#overview" className="text-sky-700 hover:underline">
                論文試験の概要
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#themes" className="text-sky-700 hover:underline">
                頻出テーマ5選
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#framework" className="text-sky-700 hover:underline">
                論文の構成フレームワーク
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#tips" className="text-sky-700 hover:underline">
                書き方のコツ
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#checklist" className="text-sky-700 hover:underline">
                テーマ別チェックリスト
              </a>
            </li>
          </ul>
        </div>

        {/* ===== 論文試験の概要 ===== */}
        <h2
          id="overview"
          className="mb-4 mt-10 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          論文試験の概要
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          公認釣りインストラクター試験の論文試験では、釣りに関連するテーマについて<strong>800字程度</strong>の論文を<strong>60分</strong>の制限時間内に作成します。複数のテーマが提示され、その中から1つを選択して論述します。
        </p>

        <div className="mb-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">項目</th>
                <th className="px-4 py-2.5 text-left">内容</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">出題形式</td>
                <td className="px-4 py-2.5">複数テーマから1つ選択</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">文字数</td>
                <td className="px-4 py-2.5">800字程度</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">制限時間</td>
                <td className="px-4 py-2.5">60分</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">評価基準</td>
                <td className="px-4 py-2.5">
                  内容の正確性、論理構成、インストラクターとしての視点
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mb-4 text-sm leading-relaxed">
          合格のポイントは、<strong>テーマへの理解</strong>に加え、<strong>自分の考え</strong>を明確にし、<strong>具体例</strong>を交えて論じることです。単なる知識の羅列ではなく、インストラクターとしてどう行動するかという視点が求められます。
        </p>

        {/* ===== 頻出テーマ5選 ===== */}
        <h2
          id="themes"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          頻出テーマ5選
        </h2>

        {/* テーマ1 */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          1. 釣りにおける安全管理とインストラクターの役割
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          釣りは自然の中で行うレジャーであり、落水事故・落雷・熱中症など多くのリスクが伴います。インストラクターは参加者の安全を最優先に考え、事前の安全教育やリスク管理を徹底する立場にあります。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>ライフジャケット着用の義務化と指導方法</li>
          <li>天候・潮汐の事前確認と中止判断の基準</li>
          <li>釣り場ごとの危険箇所の把握と参加者への周知</li>
          <li>事故発生時の応急処置と通報手順</li>
        </ul>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>使える具体例:</strong> 水産庁の事故統計（釣り中の死亡事故は年間約200件前後）、ライフジャケット着用による生存率の向上データ、テトラポッドや磯場での滑落事故事例。
        </p>

        {/* テーマ2 */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          2. 釣りマナーの向上と地域社会との共生
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          釣り場でのゴミ放置、違法駐車、騒音などが社会問題となり、各地で釣り禁止区域が増加しています。インストラクターは釣り人のマナー向上を指導し、地域住民との良好な関係構築に努める必要があります。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>ゴミの持ち帰り運動と清掃活動の推進</li>
          <li>地域ルール（駐車場所、立入禁止区域）の周知</li>
          <li>漁業者・地元住民との相互理解と協力関係</li>
          <li>SNSでの釣り場情報拡散による問題と対策</li>
        </ul>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>使える具体例:</strong> 全国各地で増加する釣り禁止区域の事例、釣り場清掃イベントの効果、漁港での釣り人と漁業者のトラブル事例。
        </p>

        {/* テーマ3 */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          3. 水辺の環境保全と釣り人の責任
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          健全な水辺環境は釣りの基盤であり、釣り人自身が環境保全に取り組むことが持続可能な釣り文化の維持に不可欠です。外来種問題、水質汚染、海洋プラスチック問題など、多角的な視点が求められます。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>外来生物法と特定外来生物（ブラックバス等）の問題</li>
          <li>釣り糸・仕掛けの放置による野生生物への被害</li>
          <li>キャッチ&amp;リリースの意義と適切な方法</li>
          <li>稚魚放流事業への参加と資源管理への協力</li>
        </ul>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>使える具体例:</strong> 外来生物法による規制内容、鉛製おもりの環境影響、生分解性釣り糸の普及、漁協と連携した清掃・放流活動。
        </p>

        {/* テーマ4 */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          4. 青少年への釣り指導の意義と方法
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          釣り人口の減少と高齢化が進む中、次世代の育成は釣り文化の存続に関わる重要課題です。青少年への釣り指導を通じて、自然への関心、忍耐力、命の大切さなど多くのことを伝えることができます。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>年齢に応じた段階的な指導プログラムの設計</li>
          <li>安全管理の徹底（子どもの特性を考慮した対策）</li>
          <li>「釣れた喜び」を体験させる工夫（簡単な仕掛け、釣れやすい魚種の選定）</li>
          <li>自然観察や生態系学習との組み合わせ</li>
        </ul>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>使える具体例:</strong> レジャー白書に見る釣り人口の推移、学校教育における体験学習としての釣り、子ども向け釣り教室の運営事例。
        </p>

        {/* テーマ5 */}
        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          5. 釣り文化の継承と発展
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          日本の釣りには和竿や毛鉤（テンカラ）など独自の伝統技法があり、地域ごとの釣り文化も多様です。これらを次世代に伝えつつ、現代のテクノロジーや多様な楽しみ方とも融合させていくことが求められます。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>和竿・テンカラ等の伝統釣法の保存と普及</li>
          <li>地域の釣り文化（郷土の釣り方、祭事との関わり）の記録と発信</li>
          <li>釣りツーリズムによる地域活性化</li>
          <li>デジタル技術（アプリ、SNS）を活用した釣り文化の発信</li>
        </ul>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>使える具体例:</strong> 各地の伝統漁法（鵜飼い、やな漁等）の文化財指定、釣り博物館やイベントの開催実績、海外での日本式釣り文化への関心の高まり。
        </p>

        <Exam>
          <p>
            論文テーマは毎年変わりますが、上記5つのテーマは過去の出題傾向から特に重要です。すべてのテーマに共通するのは「インストラクターとしての視点」が問われること。単なる一般論ではなく、<strong>指導者としてどう考え、どう行動するか</strong>を論じましょう。
          </p>
        </Exam>

        {/* ===== 論文の構成フレームワーク ===== */}
        <h2
          id="framework"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          論文の構成フレームワーク
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          800字の論文を効率よく書くには、あらかじめ構成を決めてから書き始めることが重要です。以下の3部構成を基本とします。
        </p>

        <div className="mb-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">パート</th>
                <th className="px-4 py-2.5 text-left">文字数目安</th>
                <th className="px-4 py-2.5 text-left">内容</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">序論</td>
                <td className="px-4 py-2.5">約100字</td>
                <td className="px-4 py-2.5">
                  テーマの背景を述べ、自分の立場（主張）を明示する
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">本論</td>
                <td className="px-4 py-2.5">約550字</td>
                <td className="px-4 py-2.5">
                  3つの論点を段落分けして展開。各論点に具体例を添える
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">結論</td>
                <td className="px-4 py-2.5">約150字</td>
                <td className="px-4 py-2.5">
                  主張のまとめと、インストラクターとしての今後の展望
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          序論の書き方
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          序論では、テーマに対する社会的背景や現状の課題を簡潔に述べ、自分がその問題に対してどのような立場を取るかを明示します。「近年、〜が問題となっている」「インストラクターとして、〜が重要であると考える」といった形で書き出すと導入しやすいです。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          本論の書き方
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          本論は3つの段落に分け、それぞれ1つの論点を展開します。各段落は「主張→根拠→具体例」の順で組み立てます。段落間のつながりを意識し、「第一に」「次に」「さらに」といった接続表現を使うと論理的な流れが生まれます。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          結論の書き方
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          結論では本論の内容を簡潔にまとめた上で、インストラクターとして今後どのように取り組んでいくかという展望を述べます。「以上の理由から〜」で始め、「インストラクターとして〜に努めていきたい」で締めくくるのが定番の形です。
        </p>

        {/* ===== 書き方のコツ ===== */}
        <h2
          id="tips"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          書き方のコツ
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          具体例を入れる
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          法令名（漁業法、外来生物法等）、事故事例や統計データ、自身の釣り経験を具体例として盛り込むと説得力が増します。「例えば」「実際に」というフレーズで具体例を挿入しましょう。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          インストラクターとしての視点
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          論文で最も重要なのは、一般の釣り人としてではなく、<strong>指導者としての視点</strong>で論じることです。「自分が教える立場として何ができるか」「参加者にどう伝えるか」を必ず含めましょう。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          一般論で終わらせない
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          「安全は大事です」「マナーを守りましょう」だけでは高い評価は得られません。具体的に<strong>「自分はどう行動するか」</strong>を書くことが合格のカギです。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          時間配分を守る
        </h3>
        <div className="mb-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">工程</th>
                <th className="px-4 py-2.5 text-left">時間</th>
                <th className="px-4 py-2.5 text-left">内容</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">構成</td>
                <td className="px-4 py-2.5">5分</td>
                <td className="px-4 py-2.5">テーマ選定、3つの論点を箇条書きでメモ</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">執筆</td>
                <td className="px-4 py-2.5">45分</td>
                <td className="px-4 py-2.5">序論→本論→結論の順に記述</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">見直し</td>
                <td className="px-4 py-2.5">10分</td>
                <td className="px-4 py-2.5">誤字脱字、文字数の確認、論理の飛躍チェック</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Point>
          <p>
            論文は「知識」だけでなく「インストラクターとしての自覚」が問われます。テーマの知識を示した上で、<strong>指導者として具体的にどう行動するか</strong>を書くことが合格への最短ルートです。
          </p>
        </Point>

        {/* ===== テーマ別チェックリスト ===== */}
        <h2
          id="checklist"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          テーマ別チェックリスト
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          各テーマで論文に含めるべき要素をチェックリスト形式でまとめました。論文の下書き後に確認しましょう。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          安全管理
        </h3>
        <ul className="mb-4 space-y-1.5 pl-1 text-sm leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            ライフジャケット着用の重要性に触れている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            具体的な事故事例または統計を挙げている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            インストラクターとしての安全管理体制に言及している
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            天候判断・中止基準について述べている
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          マナー向上
        </h3>
        <ul className="mb-4 space-y-1.5 pl-1 text-sm leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            釣り禁止区域増加の現状に触れている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            ゴミ問題・駐車問題など具体的なマナー違反を挙げている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            地域住民・漁業者との共生の視点がある
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            インストラクターとしての啓発活動に言及している
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          環境保全
        </h3>
        <ul className="mb-4 space-y-1.5 pl-1 text-sm leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            外来生物法や特定外来生物に言及している
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            釣り具（糸・おもり等）の環境影響に触れている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            キャッチ&amp;リリースや資源管理に触れている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            具体的な保全活動（清掃、放流等）を提案している
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          青少年指導
        </h3>
        <ul className="mb-4 space-y-1.5 pl-1 text-sm leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            釣り人口の減少・高齢化の現状に触れている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            年齢に応じた指導方法の工夫を述べている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            釣りを通じた教育的意義（自然体験、忍耐力等）に言及している
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            安全面での特別な配慮について述べている
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          文化の継承
        </h3>
        <ul className="mb-4 space-y-1.5 pl-1 text-sm leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            日本の伝統的な釣り文化の具体例を挙げている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            地域固有の釣り文化に触れている
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            現代技術との融合やSNS活用に言及している
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">&#10003;</span>
            インストラクターとしての文化発信の取り組みを述べている
          </li>
        </ul>

        {/* ナビ */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Link
            href="/instructor-exam"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            目次に戻る
          </Link>
          <Link
            href="/instructor-exam/practical"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            実技対策 &rarr;
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
