import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam, TsuriSpotBox, Warn } from "@/components/instructor-exam/callouts";
import { ExamQuiz } from "@/components/instructor-exam/exam-quiz";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第1章 漁業関連法規 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第1章。漁業法、漁業権の3種類、都道府県漁業調整規則、遊漁船業法、水産資源保護法、罰則を体系的に解説。確認クイズ15問付き。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/law`,
  },
};

/* ============================================================
   ページ本体
   ============================================================ */

export default function LawPage() {
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
                name: "漁業関連法規",
                item: `${baseUrl}/instructor-exam/law`,
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
            <li className="font-medium text-foreground">漁業関連法規</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">第1章</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">漁業関連法規</h1>
          <p className="mt-2 text-sky-200">
            漁業法・遊漁船業法・水産資源保護法など、釣りインストラクターに必要な法規知識を体系的に学びます。
          </p>
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-base font-bold">目次</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec1-1" className="text-sky-700 hover:underline">
                1.1 漁業法の基本
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec1-2" className="text-sky-700 hover:underline">
                1.2 都道府県漁業調整規則
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec1-3" className="text-sky-700 hover:underline">
                1.3 遊漁船業法
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec1-4" className="text-sky-700 hover:underline">
                1.4 水産資源保護法
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec1-5" className="text-sky-700 hover:underline">
                1.5 罰則
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#summary" className="text-sky-700 hover:underline">
                章末まとめ &amp; 確認クイズ
              </a>
            </li>
          </ul>
        </div>

        {/* ===== 1.1 漁業法の基本 ===== */}
        <h2
          id="sec1-1"
          className="mb-4 mt-10 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          1.1 漁業法の基本
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          漁業法の目的
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          漁業法（昭和24年法律第267号、令和2年12月施行の改正法が現行）は、<strong>水産資源の持続的な利用を確保する</strong>とともに、水面の総合的な利用を図り、漁業の発展と漁業者の福祉の増進を目的としています。2020年（令和2年）の大改正により、資源管理が強化され、罰則も大幅に引き上げられました。
        </p>

        <Point>
          <p>
            2020年改正漁業法の最大のポイントは、<strong>「水産資源の持続的な利用の確保」</strong>が法の目的に明記されたことです。旧法では「漁業の民主化」が中心でしたが、現行法では資源管理が第一の柱になっています。
          </p>
        </Point>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          漁業権の3種類
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          漁業権は都道府県知事が漁業協同組合（漁協）等に免許するもので、以下の3種類があります。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">漁業権の種類</th>
                <th className="px-4 py-2.5 text-left">内容</th>
                <th className="px-4 py-2.5 text-left">具体例</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">共同漁業権</td>
                <td className="px-4 py-2.5">
                  一定の水域で漁協の組合員が共同で営む漁業の権利
                </td>
                <td className="px-4 py-2.5">
                  アワビ・サザエ・ウニ・ナマコ等の採捕
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">区画漁業権</td>
                <td className="px-4 py-2.5">
                  一定の区画で養殖業を営む権利
                </td>
                <td className="px-4 py-2.5">
                  のり養殖、カキ養殖、ハマチ養殖
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">定置漁業権</td>
                <td className="px-4 py-2.5">
                  一定の場所に定置網を設置して営む漁業の権利
                </td>
                <td className="px-4 py-2.5">大型定置網（ブリ・サケ等）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          遊漁者と漁業権の関係
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          一般の釣り人（遊漁者）は漁業権を持っていないため、<strong>共同漁業権の対象となっている水産動植物を採捕することはできません</strong>。具体的には、アワビ・サザエ・ウニ・ナマコ・ワカメ・イセエビなどは、漁業権が設定されている水域で遊漁者が採捕すると漁業権侵害に該当します。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          ただし、<strong>竿釣りや手釣りで魚を釣ること自体は、一般に漁業権侵害には該当しません</strong>。漁業権は主に「定着性の水産動植物」や「養殖物」を保護対象としているためです。
        </p>

        <Exam>
          <p>
            <strong>漁業権侵害の具体例:</strong>
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>磯でアワビやサザエを素潜りで採る</li>
            <li>岩場でウニを採集する</li>
            <li>海岸でワカメやヒジキを刈り取る</li>
            <li>ナマコを拾って持ち帰る</li>
            <li>イセエビを網やカゴで捕獲する</li>
          </ul>
          <p className="mt-2">
            これらはすべて共同漁業権の侵害に該当し得ます。「知らなかった」は通用しません。
          </p>
        </Exam>

        <ExamQuiz
          questions={[
            {
              id: "law-inline-1",
              question: "次のうち、一般の遊漁者が漁業権の設定されている海域で採捕すると漁業権侵害になるものはどれか？",
              choices: [
                "サビキ釣りで釣ったアジ",
                "投げ釣りで釣ったキス",
                "素潜りで採ったアワビ",
                "ルアーで釣ったスズキ",
              ],
              correctIndex: 2,
              explanation: "アワビは共同漁業権の対象となる定着性の水産動物であり、遊漁者による採捕は漁業権侵害に該当します。竿釣りで釣ったアジ・キス・スズキは回遊性の魚であり、一般的に漁業権侵害には該当しません。",
              choiceExplanations: [
                "サビキ釣りで釣ったアジは回遊魚であり、竿釣りによる採捕は漁業権侵害に該当しません。",
                "投げ釣りで釣ったキスも一般的な遊漁の範囲であり、漁業権の対象となる定着性水産動物ではないため問題ありません。",
                "アワビは共同漁業権の対象となる代表的な定着性水産動物です。漁業権が設定された水域で遊漁者が素潜り等で採捕すると漁業法に基づく漁業権侵害となり、罰則の対象になります。",
                "ルアーで釣ったスズキは竿釣りの範囲であり、スズキは回遊魚なので漁業権侵害にはなりません。",
              ],
            },
          ]}
          showNumbers={false}
        />

        {/* ===== 1.2 都道府県漁業調整規則 ===== */}
        <h2
          id="sec1-2"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          1.2 都道府県漁業調整規則
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          各都道府県は、漁業法に基づいて独自の<strong>漁業調整規則</strong>を定めています。遊漁者にも適用される重要な規制が多く含まれており、釣りインストラクターはこの内容を理解し、指導する必要があります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          体長制限（小型魚の再放流）
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          多くの都道府県では、水産資源保護のために一定サイズ以下の魚の採捕を禁止しています。規制の内容は都道府県によって異なります。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">魚種</th>
                <th className="px-4 py-2.5 text-left">体長制限の例</th>
                <th className="px-4 py-2.5 text-left">規制例</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5">マダイ</td>
                <td className="px-4 py-2.5">13cm以下</td>
                <td className="px-4 py-2.5">採捕禁止（瀬戸内海関係県等）</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5">ヒラメ</td>
                <td className="px-4 py-2.5">30cm以下</td>
                <td className="px-4 py-2.5">採捕禁止（多くの都道府県）</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5">クロダイ</td>
                <td className="px-4 py-2.5">15cm以下</td>
                <td className="px-4 py-2.5">採捕禁止（一部県）</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5">アユ</td>
                <td className="px-4 py-2.5">河川によって異なる</td>
                <td className="px-4 py-2.5">遊漁券が必要な場合が多い</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          禁止漁具・漁法
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          遊漁者に対しても使用が禁止されている漁具・漁法があります。代表的なものは以下の通りです。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>水中銃・もり（やす）</strong>: 多くの県で遊漁者の使用を禁止
          </li>
          <li>
            <strong>刺し網・投網</strong>: 知事の許可なく使用不可（一部地域は遊漁者の使用を全面禁止）
          </li>
          <li>
            <strong>まき餌（コマセ）</strong>: 一部の港湾・河川では使用が禁止されている場所がある
          </li>
          <li>
            <strong>電気・薬品を使った採捕</strong>: 全面禁止
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">禁漁期間</h3>
        <p className="mb-4 text-sm leading-relaxed">
          産卵期の魚を保護するため、特定の魚種に禁漁期間が設定されています。例えば、アユは産卵期にあたる秋から冬にかけて禁漁となる河川が多く、渓流魚（イワナ・ヤマメ・アマゴ等）にも10月〜翌2月頃の禁漁期間が設定されているのが一般的です。
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
            では、都道府県別の漁業調整規則に基づく規制情報をまとめています。体長制限・禁漁期間・使用禁止漁具などを確認できます。
          </p>
        </TsuriSpotBox>

        <ExamQuiz
          questions={[
            {
              id: "law-inline-2",
              question: "都道府県漁業調整規則で、遊漁者に一般的に禁止されていないものはどれか？",
              choices: [
                "電気を使った採捕",
                "サビキ釣り",
                "水中銃の使用",
                "無許可での刺し網の使用",
              ],
              correctIndex: 1,
              explanation: "サビキ釣りは一般的な遊漁の方法であり、都道府県漁業調整規則で禁止されていません。ただし、一部の港湾では撒き餌（コマセ）が禁止されている場所もあるため注意が必要です。",
              choiceExplanations: [
                "電気を使った水産動植物の採捕は、都道府県漁業調整規則において全面的に禁止されています。生態系に甚大な被害を与えるため例外はありません。",
                "サビキ釣りは竿と仕掛けを使った一般的な釣り方であり、遊漁者が広く認められている漁法です。ただし、場所によってはコマセの使用制限がある場合があります。",
                "水中銃は多くの都道府県の漁業調整規則で遊漁者の使用が禁止されています。危険性が高く、水産資源への影響も大きいためです。",
                "刺し網は都道府県知事の許可なく使用することが禁止されており、無許可での使用は違法です。一部地域では遊漁者の使用が全面禁止されています。",
              ],
            },
          ]}
          showNumbers={false}
        />

        {/* ===== 1.3 遊漁船業法 ===== */}
        <h2
          id="sec1-3"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          1.3 遊漁船業法
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          遊漁船業法（平成15年法律第99号）は、遊漁船業（釣り船・乗合船）の適正な運営を確保し、利用者の安全を守るための法律です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          遊漁船業の登録制度
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          遊漁船業を営むには、<strong>都道府県知事への登録</strong>が必要です（遊漁船業法第3条）。無登録で営業した場合は<strong>3年以下の懲役又は300万円以下の罰金</strong>が科されます。登録の有効期間は<strong>5年</strong>で、更新が必要です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          業務主任者の設置義務
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          遊漁船業者は、<strong>業務主任者</strong>を選任しなければなりません（遊漁船業法第12条）。業務主任者になるためには、都道府県知事が実施する<strong>業務主任者講習</strong>を修了する必要があります。業務主任者は、乗客の安全管理、気象情報の確認、出航判断などの責任を負います。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          安全管理規程
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          遊漁船業者は利用者の安全のために以下の義務を負います。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>出航前に気象・海象情報を確認し、安全な航行が困難な場合は出航を中止する</li>
          <li>利用者へのライフジャケット着用の指示（船舶職員及び小型船舶操縦者法でも義務化）</li>
          <li>利用者への漁場のルール・マナーの説明</li>
          <li>事故発生時の連絡体制の整備</li>
          <li>損害賠償保険への加入</li>
        </ul>

        <Exam>
          <p>
            遊漁船業法の頻出ポイント: <strong>登録制</strong>（許可制ではない）、有効期間 <strong>5年</strong>、<strong>業務主任者の設置義務</strong>、安全管理規程の策定義務。試験では「許可制」と「登録制」を混同させる選択肢が出やすいです。
          </p>
        </Exam>

        <ExamQuiz
          questions={[
            {
              id: "law-inline-3",
              question: "遊漁船業法に関する記述として正しいものはどれか？",
              choices: [
                "遊漁船業を営むには国土交通大臣の許可が必要である",
                "遊漁船業の登録の有効期間は3年である",
                "遊漁船業者は業務主任者を選任しなければならない",
                "遊漁船業者に損害賠償保険への加入義務はない",
              ],
              correctIndex: 2,
              explanation: "遊漁船業法第12条により、遊漁船業者は業務主任者を選任する法定義務があります。業務主任者は所定の講習を修了した者から選任し、乗客の安全管理等の責任を担います。",
              choiceExplanations: [
                "遊漁船業は「国土交通大臣の許可」ではなく「都道府県知事への登録」制です。管轄省庁も制度の種類も異なるため、明確に誤りです。",
                "遊漁船業の登録の有効期間は3年ではなく5年です（遊漁船業法第4条）。有効期間満了後は更新手続きが必要です。",
                "遊漁船業法第12条により、遊漁船業者は業務主任者を選任しなければなりません。業務主任者は都道府県知事が実施する講習を修了した者である必要があり、利用者の安全管理について責任を負います。",
                "遊漁船業者には損害賠償措置を講じる義務があります（遊漁船業法第11条）。利用者の安全を確保するため、保険加入等の措置が法的に求められています。",
              ],
            },
          ]}
          showNumbers={false}
        />

        {/* ===== 1.4 水産資源保護法 ===== */}
        <h2
          id="sec1-4"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          1.4 水産資源保護法
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          水産資源保護法（昭和26年法律第313号）は、水産資源の保護培養を図り、漁業の発展に寄与することを目的としています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          保護水面の指定
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          農林水産大臣または都道府県知事は、水産動植物の繁殖保護のために<strong>保護水面</strong>を指定できます。保護水面では、指定された水産動植物の採捕が制限されたり禁止されたりします。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          さけ・ますの特別規制
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          さけ（シロザケ）は水産資源保護法により、<strong>河川での採捕が原則禁止</strong>されています。これは、さけのふ化放流事業を保護するためです。ただし、北海道など一部地域では、知事の許可を受けた区域でさけ釣りが認められています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          外来生物法との関係
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          水産資源保護法とは別に、<strong>外来生物法</strong>（特定外来生物による生態系等に係る被害の防止に関する法律）により、ブラックバス（オオクチバス・コクチバス）やブルーギルなどは<strong>特定外来生物</strong>に指定されています。これらの魚は生きたままの移動（運搬・放流）が禁止されています。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          ただし、その場で釣ったブラックバスを<strong>キャッチ&amp;リリース</strong>すること自体は外来生物法上は違法ではありません（一部自治体の条例で禁止している場合があります）。
        </p>

        <Point>
          <p>
            外来生物法のポイント: 特定外来生物は<strong>飼養・運搬・放出が禁止</strong>されています。「釣ったバスを別の池に放す」のは違法です。「釣った場所でリリース」は法律上は可能ですが、自治体条例を必ず確認しましょう。
          </p>
        </Point>

        <ExamQuiz
          questions={[
            {
              id: "law-inline-4",
              question: "さけ（シロザケ）について正しい記述はどれか？",
              choices: [
                "全国どこの河川でも自由に釣ることができる",
                "河川での採捕は原則として禁止されている",
                "海での釣りも一切禁止されている",
                "体長制限のみが設定されている",
              ],
              correctIndex: 1,
              explanation: "さけは水産資源保護法に基づき、河川での採捕が原則禁止されています。これはさけのふ化放流事業を保護するための措置であり、違反した場合は罰則の対象となります。",
              choiceExplanations: [
                "さけの河川での採捕は水産資源保護法により原則禁止されており、全国どこでも自由に釣れるわけではありません。北海道の一部河川で知事許可により認められているに過ぎません。",
                "水産資源保護法に基づき、さけ（シロザケ）の河川での採捕は原則として禁止されています。ふ化放流事業の保護が目的であり、北海道など一部地域では知事の許可を得た区域でのみ釣りが認められています。",
                "さけの海での釣りは一切禁止されているわけではありません。規制の対象は主に河川での採捕であり、海域ではサケ釣りが可能な地域もあります。",
                "さけに対しては体長制限だけでなく、河川での採捕そのものが原則禁止という厳しい規制がかけられています。体長制限のみという記述は不正確です。",
              ],
            },
          ]}
          showNumbers={false}
        />

        {/* ===== 1.5 罰則 ===== */}
        <h2
          id="sec1-5"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          1.5 罰則
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          2020年の漁業法改正で密漁への罰則が大幅に厳罰化されました。特に、組織的な密漁に対する罰則は非常に重くなっています。
        </p>

        <div className="mb-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">違反の種類</th>
                <th className="px-4 py-2.5 text-left">罰則</th>
                <th className="px-4 py-2.5 text-left">根拠法</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">
                  漁業権侵害（アワビ・ナマコ等の特定水産動植物の密漁）
                </td>
                <td className="px-4 py-2.5">
                  <strong>3年以下の懲役又は3,000万円以下の罰金</strong>
                </td>
                <td className="px-4 py-2.5">漁業法第132条</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">
                  漁業権侵害（上記以外）
                </td>
                <td className="px-4 py-2.5">100万円以下の罰金</td>
                <td className="px-4 py-2.5">漁業法第143条</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">
                  都道府県漁業調整規則違反
                </td>
                <td className="px-4 py-2.5">
                  各規則に定める罰則（多くは6月以下の懲役又は10万〜30万円以下の罰金）
                </td>
                <td className="px-4 py-2.5">各都道府県の規則</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">
                  無登録の遊漁船業営業
                </td>
                <td className="px-4 py-2.5">3年以下の懲役又は300万円以下の罰金</td>
                <td className="px-4 py-2.5">遊漁船業法第30条</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">
                  特定外来生物の放出・運搬
                </td>
                <td className="px-4 py-2.5">
                  個人: 3年以下の懲役又は300万円以下の罰金
                  <br />
                  法人: 1億円以下の罰金
                </td>
                <td className="px-4 py-2.5">外来生物法</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Warn>
          <p>
            2020年の改正で追加された<strong>「特定水産動植物」</strong>の密漁（アワビ・ナマコ・シラスウナギ等）の罰則は、<strong>3年以下の懲役又は3,000万円以下の罰金</strong>と非常に重いです。「ちょっとだけなら」という安易な考えは通用しません。
          </p>
        </Warn>

        <ExamQuiz
          questions={[
            {
              id: "law-inline-5",
              question: "2020年改正漁業法で新設された、アワビ・ナマコ等の特定水産動植物の密漁に対する罰則として正しいものはどれか？",
              choices: [
                "10万円以下の罰金",
                "100万円以下の罰金",
                "1年以下の懲役又は100万円以下の罰金",
                "3年以下の懲役又は3,000万円以下の罰金",
              ],
              correctIndex: 3,
              explanation: "2020年改正漁業法第132条により、特定水産動植物（アワビ・ナマコ・シラスウナギ等）の無権限採捕は3年以下の懲役又は3,000万円以下の罰金という非常に重い罰則が設けられました。密漁の厳罰化は改正の最大の柱の一つです。",
              choiceExplanations: [
                "10万円以下の罰金は特定水産動植物の密漁に対する罰則としては軽すぎます。これは一般的な軽微な違反に対する過料レベルの金額です。",
                "100万円以下の罰金は特定水産動植物「以外」の漁業権侵害（漁業法第143条）に対する罰則です。特定水産動植物の密漁にはこれよりはるかに重い罰則が科されます。",
                "1年以下の懲役又は100万円以下の罰金は、特定水産動植物の密漁に対する罰則としては不十分です。2020年改正ではより厳しい罰則が新設されました。",
                "2020年改正漁業法第132条で新設された罰則です。アワビ・ナマコ・シラスウナギなどの特定水産動植物の密漁に対し、3年以下の懲役又は3,000万円以下の罰金が科されます。組織的密漁の抑止が目的です。",
              ],
            },
          ]}
          showNumbers={false}
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
            第1章のポイント
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong>漁業法の目的</strong>: 水産資源の持続的な利用の確保（2020年改正で明記）
            </li>
            <li>
              <strong>漁業権は3種類</strong>: 共同漁業権・区画漁業権・定置漁業権
            </li>
            <li>
              <strong>遊漁者の注意点</strong>: アワビ・サザエ・ウニなどは採捕禁止（漁業権侵害）
            </li>
            <li>
              <strong>都道府県漁業調整規則</strong>: 体長制限・禁止漁具・禁漁期間は各都道府県で異なる
            </li>
            <li>
              <strong>遊漁船業法</strong>: 登録制（許可制ではない）、有効期間5年、業務主任者の設置義務
            </li>
            <li>
              <strong>さけの河川採捕</strong>: 水産資源保護法で原則禁止
            </li>
            <li>
              <strong>密漁の罰則強化</strong>: 特定水産動植物は3年以下の懲役又は3,000万円以下の罰金
            </li>
          </ul>
        </div>

        {/* ===== 章末確認クイズ 15問 ===== */}
        <h2 className="mb-4 text-xl font-bold text-sky-900">
          章末確認クイズ（全15問）
        </h2>

        <ExamQuiz
          questions={[
            {
              id: "law-final-1",
              question: "現行漁業法（2020年改正）の第一の目的として正しいものはどれか？",
              choices: [
                "漁業者の所得向上",
                "水産資源の持続的な利用の確保",
                "水面の私的利用の促進",
                "外国漁船の排除",
              ],
              correctIndex: 1,
              explanation: "2020年改正で漁業法の目的に「水産資源の持続的な利用を確保する」ことが明記されました。旧法の「漁業の民主化」から大きく転換し、資源管理が法の第一の柱となった点が最大の変更点です。",
              choiceExplanations: [
                "漁業者の所得向上は漁業政策の重要な課題ですが、漁業法の第一の目的として明記されているのは「水産資源の持続的な利用の確保」です。",
                "2020年改正漁業法では「水産資源の持続的な利用を確保する」ことが法の目的として第一に掲げられました。旧法では「漁業の民主化」が中心でしたが、現行法では資源管理が最優先事項に位置づけられています。",
                "水面の「私的」利用の促進は漁業法の目的ではありません。漁業法は水面の「総合的な利用」を図ることを目的の一つとしていますが、私的利用とは異なります。",
                "外国漁船の排除は排他的経済水域関連法等で扱われる問題であり、漁業法の第一の目的ではありません。",
              ],
            },
            {
              id: "law-final-2",
              question: "漁業権の種類に含まれないものはどれか？",
              choices: [
                "共同漁業権",
                "区画漁業権",
                "定置漁業権",
                "遊漁権",
              ],
              correctIndex: 3,
              explanation: "漁業法で定められている漁業権は共同漁業権・区画漁業権・定置漁業権の3種類のみです。「遊漁権」という権利は法律上存在しません。",
              choiceExplanations: [
                "共同漁業権は漁業法に定められた3種類の漁業権の一つです。一定の水域で漁協の組合員が共同で営む漁業の権利であり、アワビ・サザエ・ウニ等の定着性水産動物の採捕を対象とします。",
                "区画漁業権は漁業法に定められた3種類の漁業権の一つです。一定の区画内で養殖業を営む権利であり、のり養殖やカキ養殖などが該当します。",
                "定置漁業権は漁業法に定められた3種類の漁業権の一つです。一定の場所に定置網を設置して営む漁業の権利であり、ブリやサケの大型定置網などが該当します。",
                "「遊漁権」という権利は漁業法上存在しません。遊漁者（一般の釣り人）は漁業権を持たず、漁業権の範囲外で釣りを楽しむ立場です。試験ではこの架空の権利名を混ぜる問題が出やすいため注意が必要です。",
              ],
            },
            {
              id: "law-final-3",
              question: "共同漁業権が設定された水域で、遊漁者が行うと漁業権侵害になるのはどれか？",
              choices: [
                "堤防からのサビキ釣り",
                "ルアーでのシーバス釣り",
                "サザエの素潜り採捕",
                "投げ釣りでのシロギス釣り",
              ],
              correctIndex: 2,
              explanation: "サザエは共同漁業権の対象となる定着性の水産動物であり、遊漁者が素潜りで採捕することは漁業権侵害に該当します。竿釣りやルアーで回遊魚を釣ることは一般的に漁業権侵害にはなりません。",
              choiceExplanations: [
                "堤防からのサビキ釣りは一般的な遊漁行為であり、アジなどの回遊魚を対象とするため漁業権侵害には該当しません。",
                "ルアーでのシーバス（スズキ）釣りは竿釣りの一種であり、スズキは回遊魚なので漁業権の保護対象ではありません。漁業権侵害には該当しません。",
                "サザエは共同漁業権の対象となる代表的な定着性水産動物です。遊漁者が素潜りで採捕すると漁業法に基づく漁業権侵害となり、罰則（100万円以下の罰金）の対象になります。",
                "投げ釣りでのシロギス釣りは一般的な遊漁の方法であり、シロギスは定着性水産動物ではないため漁業権侵害には該当しません。",
              ],
            },
            {
              id: "law-final-4",
              question: "体長制限で小型魚の採捕が禁止される根拠法令は何か？",
              choices: [
                "漁業法",
                "水産資源保護法",
                "都道府県漁業調整規則",
                "外来生物法",
              ],
              correctIndex: 2,
              explanation: "体長制限（小型魚の再放流義務）は各都道府県の漁業調整規則で定められています。漁業法を根拠に各都道府県知事が制定するもので、規制内容は都道府県によって異なります。",
              choiceExplanations: [
                "漁業法は体長制限の直接的な根拠ではありません。漁業法は漁業調整規則を制定する権限の根拠法ですが、具体的な体長制限は各都道府県の規則で定められています。",
                "水産資源保護法は保護水面の指定やさけの河川採捕禁止など、広範な資源保護を定めた法律ですが、具体的な魚種ごとの体長制限は定めていません。",
                "都道府県漁業調整規則は、各都道府県知事が漁業法に基づいて制定する規則で、体長制限（小型魚の採捕禁止）を具体的に定めています。マダイ13cm以下、ヒラメ30cm以下など、規制内容は都道府県によって異なります。",
                "外来生物法は特定外来生物の飼養・運搬・放出を規制する法律であり、体長制限とは無関係です。",
              ],
            },
            {
              id: "law-final-5",
              question: "遊漁者が一般的に使用を禁止されている漁法はどれか？",
              choices: [
                "サビキ釣り",
                "投げ釣り",
                "電気を使った魚の採捕",
                "ウキ釣り",
              ],
              correctIndex: 2,
              explanation: "電気を使った水産動植物の採捕は都道府県漁業調整規則で全面的に禁止されています。魚群に無差別なダメージを与え、生態系を破壊するおそれがあるためです。",
              choiceExplanations: [
                "サビキ釣りは竿と仕掛けを使った一般的な遊漁の方法であり、禁止されていません。広く認められた釣り方です。",
                "投げ釣りも一般的な遊漁の方法として広く認められており、禁止されていません。",
                "電気を使った魚の採捕は、都道府県漁業調整規則で全面的に禁止されています。電気ショックにより魚群に無差別なダメージを与え、水産資源と生態系に甚大な被害をもたらすためです。",
                "ウキ釣りは最も基本的な遊漁の方法の一つであり、禁止されていません。",
              ],
            },
            {
              id: "law-final-6",
              question: "遊漁船業を営むための手続きとして正しいものはどれか？",
              choices: [
                "農林水産大臣の許可",
                "都道府県知事への届出",
                "都道府県知事への登録",
                "海上保安庁への申請",
              ],
              correctIndex: 2,
              explanation: "遊漁船業法第3条により、遊漁船業を営もうとする者は都道府県知事の「登録」を受けなければなりません。「届出」や「許可」とは法的に異なる手続き形態です。",
              choiceExplanations: [
                "遊漁船業の管轄は農林水産大臣ではなく都道府県知事です。また、手続きの形態も「許可」ではなく「登録」です。二重に誤っています。",
                "「届出」は行政に対して一方的に通知する手続きですが、遊漁船業は「登録」制です。登録は届出より厳格な手続きであり、行政による審査を経て登録簿に記載されます。",
                "遊漁船業法第3条により、遊漁船業を営もうとする者は都道府県知事への「登録」が必要です。登録の有効期間は5年で、更新が必要です。無登録営業には3年以下の懲役又は300万円以下の罰金が科されます。",
                "海上保安庁は海上の安全・治安を担当する機関であり、遊漁船業の登録先ではありません。遊漁船業の登録は都道府県知事が管轄しています。",
              ],
            },
            {
              id: "law-final-7",
              question: "遊漁船業の登録の有効期間は何年か？",
              choices: [
                "1年",
                "3年",
                "5年",
                "10年",
              ],
              correctIndex: 2,
              explanation: "遊漁船業法第4条により、登録の有効期間は5年です。期間満了前に更新手続きを行わなければ、登録は効力を失います。",
              choiceExplanations: [
                "1年では有効期間が短すぎ、頻繁な更新手続きが必要になります。遊漁船業の登録有効期間は1年ではなく5年です。",
                "3年は遊漁船業の登録有効期間ではありません。試験では「3年」と「5年」を混同させる問題が頻出するため、5年と正確に記憶する必要があります。",
                "遊漁船業法第4条により、登録の有効期間は5年と定められています。更新を受けなければ期間経過によりその効力を失うため、期限管理が重要です。",
                "10年は遊漁船業の登録有効期間ではありません。5年が正しい有効期間です。",
              ],
            },
            {
              id: "law-final-8",
              question: "遊漁船業者が選任しなければならない者は何か？",
              choices: [
                "安全管理者",
                "業務主任者",
                "航海士",
                "漁業監督官",
              ],
              correctIndex: 1,
              explanation: "遊漁船業法第12条により、遊漁船業者は業務主任者を選任しなければなりません。業務主任者は都道府県知事が実施する講習を修了した者から選任し、利用者の安全管理等の責務を担います。",
              choiceExplanations: [
                "「安全管理者」は労働安全衛生法で定められる職名であり、遊漁船業法で求められる選任義務とは異なります。遊漁船業法で選任が義務づけられているのは「業務主任者」です。",
                "遊漁船業法第12条により、遊漁船業者は業務主任者を選任しなければなりません。業務主任者になるには都道府県知事が実施する業務主任者講習を修了する必要があり、乗客の安全管理・気象確認・出航判断等の責任を負います。",
                "航海士は船舶の航行に関する資格ですが、遊漁船業法で選任が義務づけられているのは航海士ではなく「業務主任者」です。",
                "漁業監督官は行政側の取締官であり、遊漁船業者が選任するものではありません。遊漁船業者が選任する義務があるのは「業務主任者」です。",
              ],
            },
            {
              id: "law-final-9",
              question: "水産資源保護法に基づき、河川での採捕が原則禁止されている魚はどれか？",
              choices: [
                "ニジマス",
                "アユ",
                "シロザケ（さけ）",
                "イワナ",
              ],
              correctIndex: 2,
              explanation: "さけ（シロザケ）は水産資源保護法に基づき河川での採捕が原則禁止されています。ふ化放流事業を保護するための特別な規制であり、他の渓流魚とは規制の根拠法が異なります。",
              choiceExplanations: [
                "ニジマスは外来種ですが、水産資源保護法で河川採捕が原則禁止されている魚ではありません。ニジマスの規制は各地域の漁業調整規則等に委ねられています。",
                "アユの規制は都道府県漁業調整規則や内水面漁業協同組合の遊漁規則で定められており、水産資源保護法による河川採捕の原則禁止の対象ではありません。遊漁券購入で釣りが認められています。",
                "シロザケ（さけ）は水産資源保護法に基づき、河川での採捕が原則禁止されています。全国のふ化放流事業を保護するための措置であり、北海道の一部河川では知事許可により例外的に釣りが認められています。",
                "イワナの規制は都道府県漁業調整規則で定められており（禁漁期間・体長制限等）、水産資源保護法による河川採捕の原則禁止の対象ではありません。",
              ],
            },
            {
              id: "law-final-10",
              question: "特定外来生物に指定されている魚として正しいものはどれか？",
              choices: [
                "ニジマス",
                "ブラウントラウト",
                "オオクチバス（ブラックバス）",
                "ヘラブナ",
              ],
              correctIndex: 2,
              explanation: "オオクチバス（ブラックバス）は外来生物法の特定外来生物に指定されています。生きたままの運搬・放出・飼養が禁止されており、違反には重い罰則が科されます。",
              choiceExplanations: [
                "ニジマスは北米原産の外来種ですが、特定外来生物には指定されていません。「産業管理外来種」に分類されており、養殖・放流が広く行われています。",
                "ブラウントラウトはヨーロッパ原産の外来種ですが、特定外来生物には指定されていません。ニジマスと同様に産業管理外来種として扱われています。",
                "オオクチバス（ブラックバス）は外来生物法により特定外来生物に指定されています。コクチバスやブルーギルも同様に指定されており、生きたままの飼養・運搬・放出が禁止されています。違反には3年以下の懲役又は300万円以下の罰金が科されます。",
                "ヘラブナはゲンゴロウブナの改良品種で日本の在来種であり、外来生物法の対象ではありません。",
              ],
            },
            {
              id: "law-final-11",
              question: "外来生物法で禁止されている行為はどれか？",
              choices: [
                "特定外来生物を釣った場所でリリースすること",
                "特定外来生物を生きたまま別の水域に運搬すること",
                "特定外来生物をその場で締めて持ち帰ること",
                "特定外来生物を釣りの対象とすること",
              ],
              correctIndex: 1,
              explanation: "外来生物法では特定外来生物の飼養・運搬・放出が禁止されています。生きたまま別の水域に運搬することは明確に違法であり、生態系への被害拡大を防ぐための規制です。",
              choiceExplanations: [
                "釣った場所でのリリース（キャッチ&リリース）は外来生物法上は禁止されていません。ただし、滋賀県など一部自治体の条例で禁止している場合があるため、地域のルールの確認が必要です。",
                "特定外来生物を生きたまま別の水域に運搬することは、外来生物法で明確に禁止されています。生態系への被害拡大を防止するための規制であり、違反した場合は個人で3年以下の懲役又は300万円以下の罰金、法人で1億円以下の罰金が科されます。",
                "特定外来生物をその場で締めて（殺して）持ち帰ることは外来生物法上禁止されていません。生きたままの運搬が禁止されているため、その場で締めれば食用として持ち帰ることは可能です。",
                "特定外来生物を釣りの対象とすること自体は外来生物法で禁止されていません。禁止されているのは飼養・運搬・放出であり、釣りという行為そのものは規制対象外です。",
              ],
            },
            {
              id: "law-final-12",
              question: "2020年改正漁業法で「特定水産動植物」として指定されたものに含まれないものはどれか？",
              choices: [
                "アワビ",
                "ナマコ",
                "シラスウナギ",
                "マアジ",
              ],
              correctIndex: 3,
              explanation: "特定水産動植物にはアワビ・ナマコ・シラスウナギが指定されています。これらは密漁の対象になりやすく、高額で取引されるため特別に厳しい規制が設けられました。マアジは一般的な釣りの対象魚であり、指定されていません。",
              choiceExplanations: [
                "アワビは2020年改正漁業法で特定水産動植物に指定されました。高値で取引され密漁の標的になりやすいことから、厳罰化の対象となっています。",
                "ナマコは2020年改正漁業法で特定水産動植物に指定されました。特に中国向けの輸出需要が高く、密漁が社会問題化していたことが指定の背景にあります。",
                "シラスウナギはニホンウナギの稚魚であり、2020年改正漁業法で特定水産動植物に指定されました。資源量の急減と高額取引が問題となっています。",
                "マアジは一般的な釣りの対象魚であり、特定水産動植物には指定されていません。特定水産動植物は密漁が深刻で高額取引される種に限定されています。",
              ],
            },
            {
              id: "law-final-13",
              question: "特定水産動植物の密漁に対する罰則として正しいものはどれか？",
              choices: [
                "10万円以下の過料",
                "50万円以下の罰金",
                "1年以下の懲役又は100万円以下の罰金",
                "3年以下の懲役又は3,000万円以下の罰金",
              ],
              correctIndex: 3,
              explanation: "2020年改正漁業法第132条により、特定水産動植物（アワビ・ナマコ・シラスウナギ等）の密漁には最高で3年以下の懲役又は3,000万円以下の罰金が科されます。従来の罰則と比較して大幅に厳罰化されました。",
              choiceExplanations: [
                "10万円以下の過料は行政上の秩序罰であり、特定水産動植物の密漁に対する罰則としては著しく軽すぎます。密漁は刑事罰の対象です。",
                "50万円以下の罰金は特定水産動植物の密漁に対する罰則ではありません。2020年改正で新設された罰則はこれよりはるかに重いものです。",
                "1年以下の懲役又は100万円以下の罰金は、特定水産動植物の密漁に対する罰則としては不十分です。2020年改正ではより厳しい3年・3,000万円の罰則が設けられました。",
                "2020年改正漁業法第132条で新設された罰則です。特定水産動植物の密漁に対し、3年以下の懲役又は3,000万円以下の罰金という非常に重い刑罰が科されます。組織的密漁への抑止力を強化する目的で設けられました。",
              ],
            },
            {
              id: "law-final-14",
              question: "保護水面を指定する権限を持つのは誰か？",
              choices: [
                "市区町村長",
                "都道府県知事のみ",
                "農林水産大臣又は都道府県知事",
                "漁業協同組合の組合長",
              ],
              correctIndex: 2,
              explanation: "水産資源保護法に基づき、保護水面は農林水産大臣又は都道府県知事が指定する権限を持っています。水産動植物の繁殖保護に重要な水面を対象として指定が行われます。",
              choiceExplanations: [
                "市区町村長には保護水面を指定する権限はありません。保護水面の指定は国または都道府県レベルの権限です。",
                "都道府県知事は保護水面を指定する権限を持っていますが、「都道府県知事のみ」は不正確です。農林水産大臣も同様に保護水面を指定する権限を持っています。",
                "水産資源保護法に基づき、保護水面は農林水産大臣又は都道府県知事の両者が指定権限を持っています。広域的に重要な水面は大臣が、地域的な水面は知事が指定することが一般的です。",
                "漁業協同組合の組合長は漁業者の団体の長であり、行政権限を持つ立場ではないため、保護水面を指定する権限はありません。",
              ],
            },
            {
              id: "law-final-15",
              question: "漁業権について正しい記述はどれか？",
              choices: [
                "漁業権は農林水産大臣が免許する",
                "遊漁者も申請すれば漁業権を取得できる",
                "漁業権は都道府県知事が漁協等に免許する",
                "漁業権は一度取得すれば永久に有効である",
              ],
              correctIndex: 2,
              explanation: "漁業権は都道府県知事が漁業協同組合等に免許するものです。免許権者は都道府県知事であり、被免許者は主に漁業協同組合です。有効期間が定められており、永久権ではありません。",
              choiceExplanations: [
                "漁業権の免許者は農林水産大臣ではなく都道府県知事です。漁業法に基づき、知事が漁業権を漁協等に免許します。",
                "遊漁者（一般の釣り人）個人が漁業権を取得することはできません。漁業権は漁業協同組合等の団体に免許されるものであり、個人の申請による取得は制度上認められていません。",
                "漁業法に基づき、漁業権は都道府県知事が漁業協同組合等に免許します。共同漁業権・区画漁業権・定置漁業権の3種類があり、それぞれ免許の要件と手続きが定められています。",
                "漁業権には有効期間（免許の存続期間）が定められており、永久に有効ではありません。期間満了時には改めて免許の手続きが必要です。",
              ],
            },
          ]}
          showNumbers
          startNumber={1}
        />

        {/* ナビ */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Link
            href="/instructor-exam"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            目次に戻る
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
            本ページの法令情報は2025年時点の内容に基づいています。最新の改正については各法令の原文または
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
