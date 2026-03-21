import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam, Warn, Analogy, TsuriSpotBox } from "@/components/instructor-exam/callouts";
import { ArrowRight } from "lucide-react";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第6章 釣り技術と知識 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第6章。キャスティング、アタリとアワセ、ランディング、魚の締め方、釣行計画を体系的に解説。章末確認クイズ40問付き。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/technique`,
  },
  openGraph: {
    title: "第6章 釣り技術と知識 | 公認釣りインストラクター試験対策 | ツリスポ",
    description: "キャスティング・アタリとアワセ・ランディング・締め方・釣行計画を体系的に解説。章末確認クイズ40問付き。",
    url: `${baseUrl}/instructor-exam/technique`,
    type: "article",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=釣り技術と知識&emoji=🎣", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "第6章 釣り技術と知識 | 釣りインストラクター試験対策",
    description: "キャスティング・アタリとアワセ・ランディング・締め方・釣行計画を解説。確認クイズ40問付き。",
    images: ["https://tsurispot.com/api/og?title=釣り技術と知識&emoji=🎣"],
  },
  keywords: ["キャスティング", "アタリ", "アワセ", "ランディング", "魚の締め方", "釣りインストラクター"],
};

export default function TechniquePage() {
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
                name: "釣り技術と知識",
                item: `${baseUrl}/instructor-exam/technique`,
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
            headline: "第6章 釣り技術と知識 | 公認釣りインストラクター試験対策",
            description: "キャスティング・アタリとアワセ・ランディング・締め方・釣行計画を体系的に解説。章末確認クイズ40問付き。",
            url: `${baseUrl}/instructor-exam/technique`,
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
            <li className="font-medium text-foreground">釣り技術と知識</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">第6章</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">釣り技術と知識</h1>
          <p className="mt-2 text-sky-200">
            キャスティング・アタリの取り方・ランディング・魚の締め方・釣行計画など、実践的な釣り技術を体系的に学びます。
          </p>
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-base font-bold">目次</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec6-1" className="text-sky-700 hover:underline">
                6.1 キャスティングの基本
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec6-2" className="text-sky-700 hover:underline">
                6.2 アタリの取り方とアワセ
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec6-3" className="text-sky-700 hover:underline">
                6.3 魚の取り込み（ランディング）
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec6-4" className="text-sky-700 hover:underline">
                6.4 魚の締め方と持ち帰り
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec6-5" className="text-sky-700 hover:underline">
                6.5 釣行計画と準備
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#summary" className="text-sky-700 hover:underline">
                章末まとめ &amp; 確認クイズ
              </a>
            </li>
          </ul>
        </div>

        {/* ===== 6.1 キャスティングの基本 ===== */}
        <h2
          id="sec6-1"
          className="mb-4 mt-10 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          6.1 キャスティングの基本
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          キャスティング（投げる動作）は釣りの最も基本的な技術です。狙ったポイントに正確に仕掛けを届けるためには、投げ方の種類と状況に応じた使い分けを理解する必要があります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          オーバーヘッドキャスト
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          竿を頭上から前方へ振り下ろして仕掛けを飛ばす、最も基本的なキャスティング方法です。上方に障害物がない場所で使用し、コントロールしやすいため初心者にも適しています。竿の反発力（しなり）を最大限に活かせるため、飛距離も出しやすい投法です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          サイドキャスト
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          竿を水平方向に振って投げる方法です。頭上に橋や木の枝などの障害物がある場合や、強い向かい風の時に有効です。仕掛けの弾道が低くなるため風の影響を受けにくい一方、左右の安全確認がより重要になります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          アンダーハンドキャスト
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          竿を下から上へ振り上げるようにして投げる方法です。近距離のポイントを狙う場合や、足場が低い場所（テトラポッドの間など）で使います。飛距離は出にくいですが、周囲に人がいる混雑した釣り場でも安全にキャストできます。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ペンデュラムキャスト
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          投げ釣り（サーフキャスティング）で遠投するための技術です。仕掛けを振り子のように後方に振り、その反動と竿のしなりを利用して力強く投げます。100メートル以上の遠投が可能ですが、習得には練習が必要です。投げ釣り大会などでも使われる高度な技術です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          キャスティング時の安全確認
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          キャスティングは釣り場での事故の原因になりやすい動作です。以下の安全確認を必ず行いましょう。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>後方確認</strong>: 振りかぶる前に後ろに人がいないか必ず確認する
          </li>
          <li>
            <strong>左右確認</strong>: 隣の釣り人との距離が十分にあるか確認する
          </li>
          <li>
            <strong>仕掛けの点検</strong>: 針が絡まっていないか、オモリが外れかけていないかチェックする
          </li>
          <li>
            <strong>声かけ</strong>: 混雑した場所では「投げます」と周囲に声をかけてから投げる
          </li>
        </ul>

        <Point>
          <p>
            キャスティング前の<strong>後方確認</strong>は安全の基本です。竿を振りかぶった際に針が人に引っかかると大きな事故につながります。釣りインストラクターとして、この安全確認を最優先で指導する必要があります。
          </p>
        </Point>

        {/* ===== 6.2 アタリの取り方とアワセ ===== */}
        <h2
          id="sec6-2"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          6.2 アタリの取り方とアワセ
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          アタリとは、魚が仕掛けの餌や疑似餌に食いついた時に伝わるシグナルのことです。アタリを正確に判別し、適切なタイミングで合わせ（アワセ）を入れることが、釣果を大きく左右します。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          アタリの種類
        </h3>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">アタリの種類</th>
                <th className="px-4 py-2.5 text-left">感知方法</th>
                <th className="px-4 py-2.5 text-left">該当する釣り方</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">穂先のアタリ</td>
                <td className="px-4 py-2.5">
                  竿先の動き（曲がり・震え）で判別
                </td>
                <td className="px-4 py-2.5">
                  投げ釣り、船釣り、ちょい投げ
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">手感のアタリ</td>
                <td className="px-4 py-2.5">
                  竿やラインを通じて手に伝わる振動
                </td>
                <td className="px-4 py-2.5">
                  ルアー釣り、穴釣り、ヘチ釣り
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">ウキのアタリ</td>
                <td className="px-4 py-2.5">
                  ウキの動き（沈む・走る・立つ）で判別
                </td>
                <td className="px-4 py-2.5">
                  ウキ釣り、フカセ釣り
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">ラインのアタリ</td>
                <td className="px-4 py-2.5">
                  糸の張り・たるみ・走りで判別
                </td>
                <td className="px-4 py-2.5">
                  ルアー釣り、ミャク釣り
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ウキ釣りでのアタリの見分け方
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          ウキ釣りではウキの動きからアタリを判別します。ウキのアタリにはいくつかのパターンがあり、魚種や食い方によって異なります。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>消し込み</strong>: ウキが水中に沈み込む。最も分かりやすいアタリで、魚がしっかり餌をくわえて下に引いている状態
          </li>
          <li>
            <strong>もたれ</strong>: ウキがゆっくりと沈むか、やや沈んで止まる。慎重に餌を食べている時のアタリ
          </li>
          <li>
            <strong>横走り</strong>: ウキが横方向に移動する。魚が餌をくわえて横に泳いでいる状態
          </li>
          <li>
            <strong>立ちアタリ（食い上げ）</strong>: 沈めていたウキが浮き上がってくる。魚が餌をくわえて上方に泳いだ場合に起こり、グレ（メジナ）などでよく見られる
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          合わせのタイミング
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          合わせ（アワセ）とは、アタリを感じた時に竿を立てて針を魚の口に掛ける動作です。タイミングが早すぎると餌だけ取られ、遅すぎると針を飲まれたり餌を吐き出されたりします。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>即合わせ</strong>: アタリを感じたらすぐに合わせる方法。口が小さい魚やルアー釣りで多用する
          </li>
          <li>
            <strong>送り込み合わせ（遅合わせ）</strong>: アタリが出ても少し待ち、魚がしっかり餌をくわえてから合わせる方法。カレイやカワハギなど餌を吸い込むように食べる魚に有効
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          魚種による合わせ方の違い
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          魚種によって餌の食べ方が異なるため、合わせ方も変わります。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">魚種</th>
                <th className="px-4 py-2.5 text-left">食い方の特徴</th>
                <th className="px-4 py-2.5 text-left">合わせ方</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5">アジ</td>
                <td className="px-4 py-2.5">口が弱いため、強い合わせでは口切れする</td>
                <td className="px-4 py-2.5">軽く竿を立てる程度の合わせ</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5">チヌ（クロダイ）</td>
                <td className="px-4 py-2.5">警戒心が強く、餌を何度もつつく</td>
                <td className="px-4 py-2.5">しっかりくわえてから大きく合わせる</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5">カレイ</td>
                <td className="px-4 py-2.5">餌をゆっくり吸い込む</td>
                <td className="px-4 py-2.5">十分に送り込んでから合わせる</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5">スズキ（シーバス）</td>
                <td className="px-4 py-2.5">一気に餌を飲み込む</td>
                <td className="px-4 py-2.5">即合わせが基本</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          空合わせとバラシの防止
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>空合わせ（からあわせ）</strong>とは、明確なアタリがなくても定期的に竿を立てて合わせる動作のことです。カワハギ釣りなど、アタリが極めて小さい魚種で効果的です。<strong>バラシ</strong>とは、掛かった魚が途中で外れてしまうことを指します。バラシを防ぐには、合わせをしっかり入れてフッキング（針掛かり）を確実にすることと、やり取り中にラインのテンション（張り）を保つことが重要です。
        </p>

        <Exam>
          <p>
            <strong>ウキのアタリパターンと対応する合わせ方</strong>は試験の頻出テーマです。特に「消し込み」「もたれ」「横走り」「食い上げ（立ちアタリ）」の4パターンと、即合わせ・送り込み合わせの使い分けを正確に理解しましょう。
          </p>
        </Exam>

        {/* ===== 6.3 魚の取り込み（ランディング） ===== */}
        <h2
          id="sec6-3"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          6.3 魚の取り込み（ランディング）
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          魚が針に掛かってから手元に取り込むまでの一連の動作をランディングといいます。せっかく掛けた魚を確実に取り込むためには、やり取り（ファイト）の技術と取り込み道具の正しい使い方が必要です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          やり取り（ファイト）の基本
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          魚が掛かったらすぐに引き抜くのではなく、竿のしなりとリールのドラグ機能を使って魚の引きに対応します。やり取りの基本は以下の通りです。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>竿の角度</strong>: 竿を45度〜60度程度に立て、竿の弾力で魚の引きを吸収する。竿を寝かせすぎると衝撃がラインに直接かかり、糸切れやバラシの原因になる
          </li>
          <li>
            <strong>ドラグ設定</strong>: ラインの強度の3分の1〜4分の1程度にドラグを設定するのが目安。魚が強く走った時にドラグが滑って糸切れを防ぐ
          </li>
          <li>
            <strong>ラインテンションの維持</strong>: 糸がたるむと針が外れやすくなるため、常にラインに適度なテンションを保つ
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ポンピング
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          ポンピングとは、大型魚を寄せるための基本テクニックです。竿を起こして魚を浮かせ、竿を倒しながら糸を巻き取り、再び竿を起こす動作を繰り返します。この「竿を起こす→巻く→起こす」のリズムにより、大きな魚でも徐々に手前に寄せることができます。竿を起こす時には巻かない、巻く時には竿を倒すという点がポイントです。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          タモ網（玉網）の使い方
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          タモ網は一定以上の大きさの魚を取り込む際に使用する網です。正しい使い方を覚えることで、取り込み時のバラシを防げます。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>魚を水面まで寄せてから網を水中に入れる（網を振り回して魚を追わない）</li>
          <li>網は魚の頭側から入れる（尾から入れると魚が驚いて暴れる）</li>
          <li>網に魚が入ったら、すくい上げるように持ち上げる</li>
          <li>二人で釣りをしている場合は、一人が竿を操作し、もう一人がタモ入れを担当するとスムーズ</li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          ギャフの使い方と注意点
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          ギャフは大型魚に針状の金具を引っ掛けて取り込む道具です。タモ網に入らないような大型魚（ブリ、ヒラマサなど）に使用します。魚のエラ付近や下アゴに掛けるのが一般的です。ただし、魚体を傷つけるためリリースする魚には使用せず、持ち帰る魚にのみ使います。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          磯での取り込み
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          磯場では足場が高く不安定なため、取り込みには特別な注意が必要です。<strong>波のタイミング</strong>を利用して魚を寄せ波に乗せてタモ入れしたり、小型の魚であれば<strong>ずり上げ</strong>（竿の力で魚を岩場に引き上げる）で取り込む場合もあります。波が引くタイミングで無理に取り込もうとすると、根（海底の岩）に仕掛けを引っ掛けたりバラシの原因になるため、寄せ波のタイミングを待つことが大切です。
        </p>

        <Analogy>
          <p>
            やり取りは「魚との駆け引き」です。力と力で引っ張り合うのではなく、<strong>竿のしなり（弾力）</strong>を活かして魚の力を受け流し、魚が疲れたところで寄せるのがコツです。釣り糸は細いため、直接引っ張れば簡単に切れますが、竿のクッション性能を使えば大きな魚にも対応できます。
          </p>
        </Analogy>

        {/* ===== 6.4 魚の締め方と持ち帰り ===== */}
        <h2
          id="sec6-4"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          6.4 魚の締め方と持ち帰り
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          釣った魚を美味しく食べるためには、適切な締め処理と鮮度管理が不可欠です。締め処理をしないまま放置すると、魚が暴れてストレスを受け、身にATP（エネルギー物質）の消耗が起き、鮮度が急速に低下します。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          活け締め（脳締め + 神経締め + 血抜き）
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          中型以上の魚に対して行う最も丁寧な締め方です。手順は以下の通りです。
        </p>
        <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>
            <strong>脳締め</strong>: 魚の眉間（目と目の間のやや上）にナイフやピックを刺し、脳を破壊して即死させる。魚が一瞬ビクッと硬直すれば成功
          </li>
          <li>
            <strong>血抜き</strong>: エラの付け根の血管（動脈）をナイフで切り、海水を入れたバケツに頭を下にして入れ、血を抜く。血が残ると生臭さの原因になる
          </li>
          <li>
            <strong>神経締め</strong>: 専用のワイヤーを脊髄（背骨の中の神経管）に通し、神経を破壊する。死後硬直を大幅に遅らせ、鮮度を長時間保てる
          </li>
        </ol>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          氷締め
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          アジ、サバ、イワシなどの小型魚に適した締め方です。クーラーボックスに海水と氷を入れた<strong>潮氷（しおごおり）</strong>を作り、釣れた魚をすぐに入れて急冷します。魚が短時間で仮死状態になり、暴れることなく鮮度が保たれます。真水の氷だけだと魚に浸透圧の差で水が入り、身が水っぽくなるため、必ず海水を混ぜた潮氷にするのがポイントです。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          神経締めの手順
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          神経締めは脳締めの後に行います。脳締めで開けた穴、または尾の付け根を切って露出した脊髄の穴から、専用の細いワイヤー（神経締めワイヤー）を背骨に沿って通します。ワイヤーが神経管に入ると魚の体がビクビクと震えるのが目印です。ワイヤーを何度か出し入れして神経を完全に破壊します。これにより死後硬直の開始が数時間〜半日以上遅れ、身の鮮度と食感が格段に向上します。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          保冷の基本
        </h3>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>クーラーボックス</strong>: 魚の量に対して十分な容量を用意する。保冷力は断熱材の種類で決まり、真空パネル &gt; ウレタン &gt; 発泡スチロールの順に性能が高い
          </li>
          <li>
            <strong>氷の量</strong>: 魚の重量と同程度以上の氷を用意するのが理想。長時間の釣行ではペットボトルを凍らせたものを追加すると溶けにくい
          </li>
          <li>
            <strong>直置きしない</strong>: 魚を氷に直接触れさせると凍傷を起こすことがある。新聞紙やビニール袋で包んでから入れるとよい
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          鮮度保持のポイント
        </h3>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>海水氷</strong>を作って急速冷却する（氷だけより冷却効率が高い）
          </li>
          <li>
            長時間の釣行では、現地で<strong>内臓処理</strong>（ワタを取る）をすると鮮度が長持ちする
          </li>
          <li>
            クーラーボックスの蓋は必要最低限しか開けない（開閉するたびに外気温が入り保冷力が落ちる）
          </li>
          <li>
            帰宅後はできるだけ早く魚を捌くか冷蔵保存する
          </li>
        </ul>

        <Warn>
          <p>
            締め処理をしないと魚の鮮度が急速に落ちます。魚が暴れてストレスを受けると身のATP（旨味の元になる成分）が消耗し、死後硬直も早まるため、味が大幅に悪化します。釣った魚を美味しく食べるためにも、適切な締め処理の知識と実践は釣りインストラクターの必須スキルです。
          </p>
        </Warn>

        {/* ===== 6.5 釣行計画と準備 ===== */}
        <h2
          id="sec6-5"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          6.5 釣行計画と準備
        </h2>

        <p className="mb-4 text-sm leading-relaxed">
          安全で楽しい釣行のためには、事前の計画と準備が欠かせません。釣りインストラクターは参加者を安全に案内し、充実した釣り体験を提供する責任があります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          釣行計画の立て方
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          釣行計画は以下の要素を事前に決めておくことが重要です。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>対象魚の決定</strong>: 何を釣りたいかを決め、その魚の生態や釣期を調べる
          </li>
          <li>
            <strong>釣り場の選定</strong>: 対象魚が釣れるポイントを選ぶ。アクセス、駐車場、トイレの有無なども確認する
          </li>
          <li>
            <strong>時間帯の設定</strong>: 朝マズメ（日の出前後）や夕マズメ（日没前後）は多くの魚の活性が上がる時間帯。潮の動く時間帯も重要
          </li>
          <li>
            <strong>潮回りの確認</strong>: 大潮・中潮・小潮・長潮・若潮の潮汐を確認し、潮が動く時間帯に合わせて釣行する
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          装備のチェックリスト
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          忘れ物をすると釣りが台無しになることがあります。出発前に以下をチェックしましょう。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">カテゴリ</th>
                <th className="px-4 py-2.5 text-left">主な持ち物</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">釣り具</td>
                <td className="px-4 py-2.5">竿、リール、仕掛け、餌、ルアー、ハサミ、プライヤー</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">安全装備</td>
                <td className="px-4 py-2.5">ライフジャケット、滑りにくい靴、帽子、偏光サングラス</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">保冷・持ち帰り</td>
                <td className="px-4 py-2.5">クーラーボックス、氷、ナイフ、締め具、ビニール袋</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">その他</td>
                <td className="px-4 py-2.5">日焼け止め、飲料水、軽食、タオル、ゴミ袋、携帯電話</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          天候・潮汐の事前確認
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          釣行前日と当日の朝に<strong>天気予報</strong>（風速・降水確率・雷注意報）と<strong>潮汐表</strong>（満潮・干潮の時間）を必ず確認します。風速が8m/s以上の場合や落雷の危険がある場合は、釣行の中止や延期を検討すべきです。波の高さにも注意し、磯釣りでは波高1.5m以上で危険と判断するのが一般的です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          緊急時の連絡先の確認
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          海での緊急通報は<strong>118番（海上保安庁）</strong>です。警察は110番、救急は119番ですが、海上での事故・遭難は118番に通報します。事前に最寄りの海上保安署の連絡先、釣り場近くの病院の場所を確認しておくことが重要です。また、家族や知人に釣行先と帰還予定時間を伝えておきましょう。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          帰還時間の設定
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          あらかじめ帰還時間を決めておくことで、無理な釣行による事故を防げます。日没後は視界が悪くなり転倒や落水のリスクが高まるため、日没の1時間前には片付けを始めるのが理想です。夜釣りの場合はヘッドライトの準備と、足元の安全確保を徹底します。
        </p>

        <TsuriSpotBox>
          <p>
            ツリスポの{" "}
            <Link
              href="/spots"
              className="font-medium underline"
            >
              スポット検索機能
            </Link>{" "}
            では、全国2,000ヶ所以上の釣り場情報を掲載しています。対象魚・アクセス・設備情報を確認して釣行計画に役立ててください。
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
            第6章のポイント
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong>キャスティングは4種類</strong>: オーバーヘッド・サイド・アンダーハンド・ペンデュラム。後方確認が安全の基本
            </li>
            <li>
              <strong>アタリの種類</strong>: 穂先・手感・ウキ・ラインの4系統。ウキのアタリは消し込み・もたれ・横走り・食い上げの4パターン
            </li>
            <li>
              <strong>合わせの使い分け</strong>: 即合わせと送り込み合わせ。魚種の食い方に応じて選択する
            </li>
            <li>
              <strong>やり取りの基本</strong>: 竿の角度を保ち、ドラグを活用し、ラインテンションを維持する
            </li>
            <li>
              <strong>取り込み</strong>: タモ網は魚の頭側から。ポンピングで大型魚を寄せる
            </li>
            <li>
              <strong>締め処理</strong>: 活け締め（脳締め→血抜き→神経締め）で鮮度を保つ。小型魚は氷締め
            </li>
            <li>
              <strong>釣行計画</strong>: 対象魚・場所・潮回り・天候を事前に確認。海の緊急通報は118番
            </li>
          </ul>
        </div>

        {/* ===== 章末確認クイズ CTA ===== */}
        <div className="mt-8 rounded-xl border-2 border-purple-200 bg-purple-50 p-6 text-center">
          <h2 className="text-xl font-bold text-purple-800">確認クイズに挑戦</h2>
          <p className="mt-2 text-sm text-purple-600">全40問の4択クイズで理解度をチェック</p>
          <Link
            href="/instructor-exam/technique/quiz"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700"
          >
            クイズを始める
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* ナビ */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Link
            href="/instructor-exam/tackle"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            &larr; 第5章 釣り具の知識
          </Link>
          <Link
            href="/instructor-exam/environment"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            第7章 水域の自然環境知識 &rarr;
          </Link>
        </div>

        {/* 免責 */}
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <p>
            本ページの内容は公認釣りインストラクター試験の学習を目的とした参考資料です。最新の試験内容については{" "}
            <a
              href="https://www.zenturi-jofi.or.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              全釣り協公式サイト
            </a>{" "}
            をご確認ください。当サイトは全日本釣り団体協議会とは無関係の非公式学習サイトです。
          </p>
        </div>
      </div>
    </>
  );
}
