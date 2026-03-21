import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam, TsuriSpotBox, Warn } from "@/components/instructor-exam/callouts";
import { ArrowRight } from "lucide-react";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第1章 漁業関連法規 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第1章。漁業法、漁業権の3種類、都道府県漁業調整規則、遊漁船業法、水産資源保護法、罰則を体系的に解説。章末確認クイズ50問付き。",
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

        {/* ===== 章末確認クイズ CTA ===== */}
        <div className="mt-8 rounded-xl border-2 border-purple-200 bg-purple-50 p-6 text-center">
          <h2 className="text-xl font-bold text-purple-800">確認クイズに挑戦</h2>
          <p className="mt-2 text-sm text-purple-600">全50問の4択クイズで理解度をチェック</p>
          <Link
            href="/instructor-exam/law/quiz"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700"
          >
            クイズを始める
            <ArrowRight className="size-4" />
          </Link>
        </div>

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
