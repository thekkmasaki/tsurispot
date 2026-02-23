import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "釣り場FAQ - 堤防・漁港・管理釣り場のコツとマナー",
  description:
    "堤防釣りのコツ、漁港での釣りマナー、管理釣り場の選び方、海釣りと川釣りの違いなど釣り場に関する疑問をわかりやすく回答します。",
  openGraph: {
    title: "釣り場FAQ - 堤防・漁港・管理釣り場のコツとマナー",
    description:
      "堤防・漁港・管理釣り場の釣りに関するFAQをまとめて解説。マナーやコツも紹介。",
    type: "website",
    url: "https://tsurispot.com/faq/spot",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/faq/spot",
  },
};

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  answerText: string;
}

const faqItems: FAQItem[] = [
  {
    question: "堤防釣りで釣果を上げるコツは？",
    answerText:
      "堤防釣りで釣果を上げるコツは複数あります。まず朝マヅメ・夕マヅメの時間帯を狙うこと。次に堤防の先端や角、テトラポッドの際など魚が集まりやすいポイントを選ぶこと。潮通しの良い場所、常夜灯の下（夜釣り）も好ポイントです。コマセをこまめに撒いて魚を寄せること、タナ（水深）を変えて魚のいる層を探ること、仕掛けを細くして食い渋り対策をすること、風や潮の向きに合わせて仕掛けを流すことも重要です。",
    answer: (
      <>
        <p>
          堤防釣りで釣果を上げるにはいくつかのコツがあります。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">ポイント選び：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>堤防の先端</strong>：潮通しが良く、魚が集まりやすい一番の好ポイント</li>
            <li>・<strong>堤防の角（曲がり角）</strong>：潮がぶつかるので小魚が溜まる</li>
            <li>・<strong>テトラポッドの際</strong>：根魚（カサゴ・メバル）の住処</li>
            <li>・<strong>常夜灯の下</strong>：夜釣りではプランクトンが集まり、それを追う魚も集まる</li>
            <li>・<strong>船道（スロープ付近）</strong>：水深があり大型魚も回遊する</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">テクニック：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>時間帯</strong>：朝マヅメ・夕マヅメが最も釣れる</li>
            <li>・<strong>コマセ</strong>：こまめに撒いて魚を寄せ続ける</li>
            <li>・<strong>タナ調整</strong>：釣れない時は水深を変えて探る</li>
            <li>・<strong>仕掛けを細く</strong>：食い渋り時はハリスを細くすると食いが良くなる</li>
          </ul>
        </div>
        <p className="mt-2">
          堤防釣りの全国スポットは
          <Link href="/spots" className="font-medium text-primary hover:underline">スポット検索</Link>
          で探せます。釣り方の詳細は
          <Link href="/methods" className="font-medium text-primary hover:underline">釣り方ガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "漁港での釣りで気をつけるマナーは？",
    answerText:
      "漁港は漁業者の仕事場であることを常に意識しましょう。漁船の係留ロープに仕掛けを引っ掛けない、荷揚げ作業の邪魔にならない場所で釣りをする、漁船が出入りする際は仕掛けを上げる、指定の場所に駐車する、コマセの汚れは必ず海水で洗い流す、ゴミは持ち帰る、早朝・夜間は大声で騒がない。近年マナー違反が原因で釣り禁止になる漁港が急増しています。ルールを守って釣り場を残しましょう。",
    answer: (
      <>
        <p>
          漁港は<strong>漁業者の仕事場</strong>であることを常に意識しましょう。
        </p>
        <ul className="mt-2 space-y-1">
          <li>・<strong>漁船優先</strong>：漁船が出入りする際は必ず仕掛けを上げる</li>
          <li>・<strong>係留ロープ注意</strong>：ロープに仕掛けを引っ掛けない。切断すると損害賠償も</li>
          <li>・<strong>荷揚げ場所を避ける</strong>：作業の邪魔にならない場所で釣りをする</li>
          <li>・<strong>駐車マナー</strong>：漁港関係者の邪魔にならない場所に駐車。路上駐車は厳禁</li>
          <li>・<strong>コマセの洗浄</strong>：釣り終わりにバケツで海水をくんで釣り座を洗い流す</li>
          <li>・<strong>ゴミ持ち帰り</strong>：糸クズ、仕掛けの袋、空き缶すべて持ち帰り</li>
          <li>・<strong>騒音</strong>：早朝・夜間は大声で騒がない。周辺住民への配慮</li>
          <li>・<strong>立入禁止区域</strong>：「関係者以外立入禁止」の看板がある場所には入らない</li>
        </ul>
        <p className="mt-2">
          近年、マナー違反が原因で<strong>釣り禁止になる漁港が急増</strong>
          しています。一人ひとりのマナーが釣り場の未来を守ります。
        </p>
        <p className="mt-2">
          釣りのルールについて詳しくは
          <Link href="/fishing-rules" className="font-medium text-primary hover:underline">ルール・マナーガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "管理釣り場とは？初心者でも楽しめる？",
    answerText:
      "管理釣り場とは、魚が放流された有料の釣り施設です。池や川に定期的に魚を放流するため、初心者でも高確率で魚が釣れます。種類は大きく分けてトラウト（ニジマス・ヤマメ等）の管理釣り場と、海上釣り堀の2種類があります。レンタルタックルやエサが用意されている場所がほとんどで、手ぶらで行けます。料金は半日2,000〜5,000円程度。家族連れやデートにもおすすめです。釣った魚を持ち帰れる施設も多いです。",
    answer: (
      <>
        <p>
          管理釣り場は<strong>魚が放流された有料の釣り施設</strong>で、初心者に最適な釣り場です。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">管理釣り場の種類：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>トラウトの管理釣り場（エリアフィッシング）</strong>：池や川にニジマス・ヤマメ等を放流。ルアーやフライで釣る</li>
            <li>・<strong>海上釣り堀</strong>：海に設置されたイケスで真鯛・青物等を釣る。大物が狙える</li>
            <li>・<strong>釣り堀（室内含む）</strong>：金魚やコイの釣り堀。子供連れに人気</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">初心者へのメリット：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・魚が確実にいるので<strong>ボウズ（坊主＝釣果ゼロ）になりにくい</strong></li>
            <li>・レンタルタックル・エサが用意されている</li>
            <li>・スタッフが釣り方を教えてくれる場合も</li>
            <li>・トイレ・売店など設備が整っている</li>
            <li>・釣った魚を持ち帰れる施設が多い</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">料金の目安：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・トラウト管理釣り場：半日2,000〜4,000円</li>
            <li>・海上釣り堀：半日5,000〜12,000円</li>
            <li>・室内釣り堀：1時間500〜1,000円程度</li>
          </ul>
        </div>
        <p className="mt-2">
          全国の釣り場情報は
          <Link href="/spots" className="font-medium text-primary hover:underline">スポット検索</Link>
          で探せます。
        </p>
      </>
    ),
  },
  {
    question: "海釣りと川釣りの違いは？",
    answerText:
      "海釣りと川釣りにはいくつかの大きな違いがあります。対象魚種が異なり、海ではアジ・サバ・タイなど、川ではアユ・ヤマメ・バスなどを狙います。海釣りは基本的に無料ですが、川釣りは遊漁券が必要な場合が多いです。道具も海は塩水対応のものが必要で、川はより繊細な仕掛けが多いです。海は潮の干満が釣果に影響しますが、川は水量や流れの速さがポイントになります。初心者は海釣り（堤防のサビキ釣り）から始めるのがおすすめです。",
    answer: (
      <>
        <p>海釣りと川釣りには以下のような違いがあります。</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 text-left font-semibold text-foreground">項目</th>
                <th className="py-2 pr-4 text-left font-semibold text-foreground">海釣り</th>
                <th className="py-2 text-left font-semibold text-foreground">川釣り</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2 pr-4 font-medium">対象魚</td>
                <td className="py-2 pr-4">アジ・サバ・タイ・イカなど</td>
                <td className="py-2">アユ・ヤマメ・バス・トラウトなど</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">費用</td>
                <td className="py-2 pr-4">基本無料（海釣り公園は有料）</td>
                <td className="py-2">遊漁券が必要な場合が多い</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">道具</td>
                <td className="py-2 pr-4">塩水対応。メンテ必須</td>
                <td className="py-2">繊細な仕掛けが多い</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">影響要因</td>
                <td className="py-2 pr-4">潮の干満・潮回り</td>
                <td className="py-2">水量・流れ・水温</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">釣り方</td>
                <td className="py-2 pr-4">サビキ・投げ・ルアーなど多彩</td>
                <td className="py-2">渓流釣り・フライ・バス釣りなど</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          初心者は<strong>海釣り（堤防のサビキ釣り）</strong>
          から始めるのがおすすめです。道具がシンプルで、費用も抑えられ、比較的簡単に釣果を出せます。
        </p>
        <p className="mt-2">
          海釣りスポットは
          <Link href="/spots" className="font-medium text-primary hover:underline">スポット検索</Link>
          で、釣り方は
          <Link href="/methods" className="font-medium text-primary hover:underline">釣り方ガイド</Link>
          で確認できます。
        </p>
      </>
    ),
  },
  {
    question: "サーフ（砂浜）での釣りのコツは？",
    answerText:
      "サーフフィッシングのコツは、離岸流（海に向かって流れる潮の流れ）を見つけることが最重要です。離岸流の周辺にはエサとなる小魚が集まり、ヒラメやシーバスなどの大型魚もやってきます。波打ち際の地形変化（カケアガリ）も好ポイント。遠投が必要なので、投げ釣り用のタックルを使います。足元は波に注意し、ウェーダー（胴長靴）の着用を推奨。ターゲットはキス（夏）、ヒラメ・マゴチ（通年）、シーバス（秋〜冬）など。",
    answer: (
      <>
        <p>
          サーフ（砂浜）での釣りは広大なフィールドで大物が狙える魅力的な釣りです。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">ポイントの見つけ方：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>離岸流</strong>：海に向かって流れる潮の流れ。最重要ポイント。波が他より穏やかな場所を探す</li>
            <li>・<strong>カケアガリ</strong>：波打ち際の地形変化（浅い→深い部分）。魚が待ち構える場所</li>
            <li>・<strong>流れ込み</strong>：河川の流れ込みやワンドはエサが集まる</li>
            <li>・<strong>ブレイクライン</strong>：急に深くなるライン。沖の白波が立つ手前が目安</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">主なターゲットと時期：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>キス</strong>：夏がベスト。投げ釣りの定番</li>
            <li>・<strong>ヒラメ</strong>：通年。ルアー（ミノー・ジグ）で狙う</li>
            <li>・<strong>マゴチ</strong>：夏。ヒラメと同じポイントで狙える</li>
            <li>・<strong>シーバス</strong>：秋〜冬。大型が回遊する</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">安全上の注意：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・波には常に注意。波打ち際に背を向けない</li>
            <li>・ウェーダー着用推奨（ただし深入りは厳禁）</li>
            <li>・ライフジャケットの着用が望ましい</li>
          </ul>
        </div>
        <p className="mt-2">
          安全情報は
          <Link href="/safety" className="font-medium text-primary hover:underline">安全ガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "磯釣りは初心者でもできる？",
    answerText:
      "磯釣りは足場が悪く危険を伴うため、ある程度の経験を積んでから挑戦することをおすすめします。初心者がいきなり地磯（陸から歩いて行ける磯）や沖磯（渡船で渡る磯）に行くのはリスクが高いです。まずは堤防釣りで基本を身につけ、経験者と一緒に地磯から始めましょう。磯釣りに必要な装備はスパイクシューズ、ライフジャケット、磯バッグ、ピトン（竿立て）など専用の道具が多く、初期費用も高めです。",
    answer: (
      <>
        <p>
          磯釣りは<strong>ある程度の経験を積んでから</strong>挑戦することをおすすめします。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">磯釣りが初心者に難しい理由：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・足場が滑りやすく、転倒・落水のリスクが高い</li>
            <li>・高波をかぶる危険がある</li>
            <li>・専用装備（スパイクシューズ、磯バッグ等）が必要で費用がかかる</li>
            <li>・キャスティング技術や仕掛けの操作に慣れが必要</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">磯釣りへのステップアップ方法：</p>
          <ol className="mt-1 space-y-0.5 list-decimal list-inside">
            <li>まず堤防釣りで基本を身につける</li>
            <li>経験者と一緒に足場の良い地磯に行ってみる</li>
            <li>磯釣り用の装備を少しずつ揃える</li>
            <li>渡船で沖磯に挑戦</li>
          </ol>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">磯釣りの魅力：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・グレ（メジナ）やクロダイなど大型の引きが楽しめる</li>
            <li>・手付かずの自然の中で釣りができる</li>
            <li>・堤防では釣れない魚種が狙える</li>
          </ul>
        </div>
        <p className="mt-2">
          まずは堤防釣りから始めましょう。
          <Link href="/spots" className="font-medium text-primary hover:underline">スポット検索</Link>
          で初心者向けの釣り場を探せます。
        </p>
      </>
    ),
  },
  {
    question: "釣り場で場所取りは必要？",
    answerText:
      "基本的に釣り場に予約制度はなく早い者勝ちです。人気の釣り場では朝マヅメ狙いの場合、日の出前（暗いうち）に到着する釣り人も多いです。ただし、無人の荷物だけで場所取りをするのはマナー違反です。先に釣りをしている人の隣に入る時は必ず一声かけましょう。人気スポットが混雑している場合は、少し離れた場所を探すか、時間をずらして平日に釣りをするのも有効です。",
    answer: (
      <>
        <p>
          釣り場には基本的に予約制度はなく、<strong>早い者勝ち</strong>です。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">場所取りのルール・マナー：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・人気の釣り場では朝マヅメ狙いで日の出前に到着する人も多い</li>
            <li>・<strong>荷物だけでの場所取りはマナー違反</strong>（本人がいない場所取りはNG）</li>
            <li>・先に釣りをしている人の隣に入る時は<strong>「ここ入ってもいいですか？」</strong>と一声かける</li>
            <li>・最低でも3m以上の間隔を空ける（投げ釣りはさらに距離が必要）</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">混雑を避けるコツ：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・平日に釣りをする（週末は混雑しやすい）</li>
            <li>・マイナーな釣り場を開拓する</li>
            <li>・日中の時間帯を狙う（早朝は混む）</li>
            <li>・複数候補のスポットを用意しておく</li>
          </ul>
        </div>
        <p className="mt-2">
          穴場スポットは
          <Link href="/spots" className="font-medium text-primary hover:underline">スポット検索</Link>
          で探せます。釣り場のマナーは
          <Link href="/fishing-rules" className="font-medium text-primary hover:underline">ルール・マナーガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answerText,
    },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://tsurispot.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "よくある質問",
      item: "https://tsurispot.com/faq",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "釣り場FAQ",
      item: "https://tsurispot.com/faq/spot",
    },
  ],
};

export default function FAQSpotPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "よくある質問", href: "/faq" },
            { label: "釣り場FAQ" },
          ]}
        />
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
              <MapPin className="size-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              釣り場FAQ
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            堤防・漁港・管理釣り場のコツとマナーに関する疑問を解決
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="group rounded-lg border bg-white transition-shadow hover:shadow-sm dark:bg-card [&[open]]:shadow-sm"
            >
              <summary className="flex cursor-pointer items-start gap-3 p-4 text-sm font-semibold leading-relaxed sm:text-base [&::-webkit-details-marker]:hidden">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  Q
                </span>
                <span className="flex-1">{item.question}</span>
                <span className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </summary>
              <div className="border-t px-4 pb-4 pt-3">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    A
                  </span>
                  <div className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">関連するFAQ・ガイド</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/faq" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">よくある質問（総合）</p>
              <p className="mt-1 text-xs text-muted-foreground">全カテゴリのFAQを見る</p>
            </Link>
            <Link href="/faq/technique" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">テクニックFAQ</p>
              <p className="mt-1 text-xs text-muted-foreground">釣れない時の対処法・潮回り</p>
            </Link>
            <Link href="/spots" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">釣りスポット検索</p>
              <p className="mt-1 text-xs text-muted-foreground">全国の釣り場を探す</p>
            </Link>
            <Link href="/fishing-rules" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">ルール・マナーガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">釣り場で守るべきルール</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
