import type { Metadata } from "next";
import Link from "next/link";
import { Point, Exam, TsuriSpotBox } from "@/components/instructor-exam/callouts";
import { ArrowRight } from "lucide-react";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第7章 水域の自然環境知識 | 公認釣りインストラクター試験対策",
  description:
    "公認釣りインストラクター試験対策 第7章。魚類の生態と分類、水温と魚の行動、プランクトンと食物連鎖、潮流・水流、水質環境と人間活動の影響を体系的に解説。章末確認クイズ40問付き。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/environment`,
  },
  openGraph: {
    title: "第7章 水域の自然環境知識 | 公認釣りインストラクター試験対策 | ツリスポ",
    description: "魚類の生態・水温・食物連鎖・潮流・水質環境の知識を体系的に解説。章末確認クイズ40問付き。",
    url: `${baseUrl}/instructor-exam/environment`,
    type: "article",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=水域の自然環境知識&emoji=🌿", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "第7章 水域の自然環境知識 | 釣りインストラクター試験対策",
    description: "魚類の生態・水温・食物連鎖・潮流・水質環境を体系的に解説。確認クイズ40問付き。",
    images: ["https://tsurispot.com/api/og?title=水域の自然環境知識&emoji=🌿"],
  },
  keywords: ["水域環境", "魚類生態", "水温と釣果", "食物連鎖", "潮流", "釣りインストラクター"],
};

/* ============================================================
   ページ本体
   ============================================================ */

export default function EnvironmentPage() {
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
                name: "水域の自然環境知識",
                item: `${baseUrl}/instructor-exam/environment`,
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
            headline: "第7章 水域の自然環境知識 | 公認釣りインストラクター試験対策",
            description: "魚類の生態・水温・食物連鎖・潮流・水質環境の知識を体系的に解説。章末確認クイズ40問付き。",
            url: `${baseUrl}/instructor-exam/environment`,
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
            <li className="font-medium text-foreground">水域の自然環境知識</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">第7章</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">水域の自然環境知識</h1>
          <p className="mt-2 text-sky-200">
            魚類の生態や水温・潮流・水質といった水域環境の基礎知識を体系的に学びます。自然を理解することが釣果向上と環境保全の第一歩です。
          </p>
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-base font-bold">目次</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec7-1" className="text-sky-700 hover:underline">
                7.1 魚類の生態と分類
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec7-2" className="text-sky-700 hover:underline">
                7.2 水温と魚の行動
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec7-3" className="text-sky-700 hover:underline">
                7.3 プランクトンと食物連鎖
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec7-4" className="text-sky-700 hover:underline">
                7.4 潮流・水流と釣果の関係
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#sec7-5" className="text-sky-700 hover:underline">
                7.5 水質環境と人間活動の影響
              </a>
            </li>
            <li className="border-l-2 border-gray-200 pl-3">
              <a href="#summary" className="text-sky-700 hover:underline">
                章末まとめ &amp; 確認クイズ
              </a>
            </li>
          </ul>
        </div>

        {/* ===== 7.1 魚類の生態と分類 ===== */}
        <h2
          id="sec7-1"
          className="mb-4 mt-10 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          7.1 魚類の生態と分類
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          魚類の大分類
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          魚類は骨格の構造によって大きく<strong>硬骨魚類</strong>と<strong>軟骨魚類</strong>に分けられます。硬骨魚類は骨格が硬い骨でできており、一般に釣りの対象となる魚の大半がこれに該当します（アジ、タイ、スズキ、メバルなど）。一方、軟骨魚類は骨格が軟骨で構成されており、サメやエイの仲間がこれに該当します。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          生息環境による区分
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          魚類は生息する水域の塩分濃度によって次の3つに大別されます。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">区分</th>
                <th className="px-4 py-2.5 text-left">生息水域</th>
                <th className="px-4 py-2.5 text-left">代表的な魚種</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">海水魚</td>
                <td className="px-4 py-2.5">海（塩分濃度約3.5%）</td>
                <td className="px-4 py-2.5">マダイ、アジ、カツオ、ヒラメ</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">淡水魚</td>
                <td className="px-4 py-2.5">河川・湖沼（塩分濃度ほぼ0%）</td>
                <td className="px-4 py-2.5">アユ、ヤマメ、コイ、フナ</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">汽水魚</td>
                <td className="px-4 py-2.5">河口・汽水湖（塩分濃度が変動）</td>
                <td className="px-4 py-2.5">スズキ、ハゼ、ボラ、クロダイ</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          魚の体の構造
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          魚の体にはさまざまな器官があり、それぞれが水中生活に適応した機能を持っています。<strong>鰭（ひれ）</strong>は推進力や姿勢制御に不可欠で、体の部位によって名称と役割が異なります。<strong>鰾（うきぶくろ）</strong>は体内にあるガスの入った袋で、浮力を調整して水中での深度を保つ役割を担います。軟骨魚類（サメ・エイ）は鰾を持たないため、常に泳いでいないと沈んでしまいます。
        </p>

        <Point>
          <p>
            魚類の鰭は5種類: <strong>背鰭（せびれ）</strong>は体のバランスを保つ、<strong>胸鰭（むなびれ）</strong>は方向転換やブレーキ、<strong>腹鰭（はらびれ）</strong>は姿勢の安定、<strong>臀鰭（しりびれ）</strong>は直進安定性、<strong>尾鰭（おびれ）</strong>は推進力の主力。これらの形状は魚の生態（高速遊泳型・底生型など）を反映しています。
          </p>
        </Point>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          回遊魚と根付き魚
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>回遊魚</strong>は季節や成長段階に応じて広範囲を移動する魚で、アジ、サバ、カツオ、ブリなどが該当します。産卵回遊・索餌回遊・越冬回遊など目的に応じた回遊パターンを持ちます。一方、<strong>根付き魚（根魚）</strong>はメバル、カサゴ、アイナメなどのように、岩礁帯やテトラポッドの隙間など特定の場所に定着して生活する魚です。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          魚の感覚器官
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          魚は人間とは異なる感覚器官を発達させています。特に重要なのが<strong>側線器官</strong>で、体の両側面に走る感覚細胞の列です。水圧の変化や水流の振動を感知し、周囲の状況を把握します。暗い水中や濁った水でも障害物や他の魚の存在を察知できるのはこの器官のおかげです。
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          また、魚の<strong>嗅覚</strong>は非常に鋭敏で、水中に溶け込んだ微量の化学物質を検出できます。サケが生まれた川に戻れるのは嗅覚によるものと考えられています。<strong>視覚</strong>については、多くの魚は色を識別でき、紫外線も感知できる種がいます。ただし、水深が深くなるほど光が届きにくくなるため、深海魚では視覚より側線器官や嗅覚が重要になります。
        </p>

        <Point>
          <p>
            <strong>側線器官</strong>は魚特有のセンサーで、水圧や振動を感知します。釣りにおいて仕掛けが着水する音やルアーの振動が魚を引き寄せる（または警戒させる）のは、側線器官が水中の振動を敏感に捉えるためです。
          </p>
        </Point>

        {/* ===== 7.2 水温と魚の行動 ===== */}
        <h2
          id="sec7-2"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          7.2 水温と魚の行動
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          変温動物としての魚類
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          魚類は<strong>変温動物</strong>（外温動物）であり、体温が周囲の水温にほぼ等しくなります。哺乳類のように自ら体温を維持する仕組みを持たないため、水温の変化が代謝速度・消化速度・活動量に直接影響します。水温が低いと代謝が落ちて動きが鈍くなり、適水温帯では活発にエサを捕食します。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          適水温と活性の関係
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          魚種ごとに最も活性が高くなる水温帯（<strong>適水温</strong>）があります。適水温から大きく外れると摂餌行動が低下し、極端に高温・低温になると致死的な影響が出ることもあります。釣りインストラクターにとって、対象魚の適水温を知ることは釣果の予測と指導に不可欠です。
        </p>

        <Exam>
          <p><strong>主要魚種の適水温帯:</strong></p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-amber-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-100">
                  <th className="px-4 py-2 text-left font-semibold">魚種</th>
                  <th className="px-4 py-2 text-left font-semibold">適水温</th>
                  <th className="px-4 py-2 text-left font-semibold">備考</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                <tr>
                  <td className="px-4 py-2">クロダイ</td>
                  <td className="px-4 py-2 font-semibold">15〜25℃</td>
                  <td className="px-4 py-2">冬季も活動するが低水温期は活性低下</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">メジナ</td>
                  <td className="px-4 py-2 font-semibold">13〜20℃</td>
                  <td className="px-4 py-2">冬が旬で低水温に比較的強い</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">スズキ</td>
                  <td className="px-4 py-2 font-semibold">15〜25℃</td>
                  <td className="px-4 py-2">汽水域にも適応</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">アジ</td>
                  <td className="px-4 py-2 font-semibold">18〜25℃</td>
                  <td className="px-4 py-2">夏〜秋が最盛期</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">マダイ</td>
                  <td className="px-4 py-2 font-semibold">13〜23℃</td>
                  <td className="px-4 py-2">春の乗っ込みシーズンが有名</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Exam>

        <Point>
          <p>
            水温が対象魚の<strong>適水温帯</strong>にあるかどうかが釣果を大きく左右します。釣行前に海水温や河川水温のデータを確認し、狙う魚種の適水温と照らし合わせることが効率的な釣りの第一歩です。
          </p>
        </Point>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          サーモクライン（水温躍層）
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          水深のある湖沼や海域では、表層の温かい水と深層の冷たい水の間に水温が急激に変化する層が形成されることがあります。これを<strong>サーモクライン（水温躍層）</strong>と呼びます。夏季に発達しやすく、魚はサーモクラインの上下で適水温の層に集まる傾向があります。ボート釣りや船釣りでは、魚群探知機でサーモクラインの深度を確認し、仕掛けを投入する深さを調整することが釣果向上につながります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          季節による水温変化と回遊パターン
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          日本近海の水温は季節によって大きく変動し、それに伴って回遊魚の接岸パターンも変化します。春は水温の上昇とともに暖流系の回遊魚（アジ、サバなど）が北上し、秋には水温の低下とともに南下します。この季節的な回遊パターンを理解することで、「いつ・どこで・何が釣れるか」を予測できます。
        </p>

        {/* ===== 7.3 プランクトンと食物連鎖 ===== */}
        <h2
          id="sec7-3"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          7.3 プランクトンと食物連鎖
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          植物プランクトンと動物プランクトン
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>植物プランクトン</strong>は光合成を行う微小な藻類で、水中の食物連鎖の土台となる<strong>一次生産者</strong>です。太陽光が届く水深（有光層）で光合成を行い、水中に<strong>溶存酸素（DO: Dissolved Oxygen）</strong>を供給します。<strong>動物プランクトン</strong>はミジンコやカイアシ類などの微小動物で、植物プランクトンを捕食します。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          光合成と溶存酸素
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          水中の溶存酸素（DO）は、魚をはじめとする水生生物の生存に不可欠です。DOは主に植物プランクトンの光合成と、水面からの大気の溶け込みによって供給されます。日中は光合成が活発なためDOが上昇しますが、夜間は光合成が止まり呼吸によるDO消費のみとなるため、明け方にDOが最低になります。この昼夜変動は、魚の活性にも影響を与えます。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          水域の食物連鎖
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          水域の食物連鎖は、<strong>植物プランクトン → 動物プランクトン → 小型魚（イワシ、シラスなど） → 中型魚（アジ、サバなど） → 大型魚（ブリ、マグロなど）</strong>という流れが基本です。プランクトンが豊富な水域には小魚が集まり、それを追って大型魚も接近するため、プランクトンの多い場所は好ポイントになりやすいです。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          赤潮・青潮の発生メカニズム
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          <strong>赤潮</strong>は、富栄養化した水域で植物プランクトン（渦鞭毛藻類など）が大量発生し、海面が赤褐色に変色する現象です。赤潮が発生すると、プランクトンの大量死による酸素消費やプランクトンが生成する有毒物質によって魚が大量死することがあります。
        </p>
        <p className="mb-3 text-sm leading-relaxed">
          <strong>青潮</strong>は、海底に堆積した有機物が分解される際に酸素が消費されて無酸素水塊が形成され、それが風や潮の変動で水面に上昇する現象です。水面が乳白色や青白色に変色し、硫化水素を含むため生物に致命的な影響を与えます。
        </p>

        <Exam>
          <p><strong>赤潮と青潮の比較:</strong></p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-amber-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-100">
                  <th className="px-4 py-2 text-left font-semibold">項目</th>
                  <th className="px-4 py-2 text-left font-semibold">赤潮</th>
                  <th className="px-4 py-2 text-left font-semibold">青潮</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                <tr>
                  <td className="px-4 py-2 font-semibold">原因</td>
                  <td className="px-4 py-2">植物プランクトンの異常増殖</td>
                  <td className="px-4 py-2">海底の無酸素水塊が湧昇</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">水の色</td>
                  <td className="px-4 py-2">赤褐色〜茶褐色</td>
                  <td className="px-4 py-2">乳白色〜青白色</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">影響</td>
                  <td className="px-4 py-2">酸欠・毒素による魚の大量死</td>
                  <td className="px-4 py-2">硫化水素・極度の酸欠で生物が死滅</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">発生しやすい時期</td>
                  <td className="px-4 py-2">春〜夏（水温上昇期）</td>
                  <td className="px-4 py-2">夏〜秋（北風が吹き始める頃）</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">釣りへの影響</td>
                  <td className="px-4 py-2">魚の活性が著しく低下</td>
                  <td className="px-4 py-2">魚が逃避し、釣りにならない</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Exam>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          潮目とプランクトン
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>潮目</strong>は、異なる性質の水塊がぶつかる境界線です。潮目ではプランクトンや浮遊物が集積されやすく、それを求めて小魚が集まり、さらにそれを捕食する大型魚も寄ってきます。海面にゴミや泡の帯が見えるところが潮目の目印となることが多く、釣りの好ポイントとして知られています。
        </p>

        {/* ===== 7.4 潮流・水流と釣果の関係 ===== */}
        <h2
          id="sec7-4"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          7.4 潮流・水流と釣果の関係
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          潮流の基本
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          海の潮流は主に月と太陽の引力（潮汐力）によって生じます。潮の干満に伴って海水が移動し、これが<strong>潮流</strong>となります。一般に、潮が動いている時間帯（上げ潮・下げ潮）は魚の活性が高まり、潮止まり（満潮・干潮の前後）は活性が下がる傾向があります。<strong>大潮</strong>（新月・満月）は潮の動きが最も大きく、回遊魚が接岸しやすいとされています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          潮目が好ポイントになる理由
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          潮目は異なる水温・塩分濃度・流速の水塊が接する境界面です。この境界面ではプランクトンや小魚、浮遊物が集まるため、それを狙う大型の魚も集結します。潮目は海面の色の変化やゴミ・泡の帯として視認できることがあり、船釣りでは潮目を探して移動することが釣果を上げる鍵になります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          河口域の潮流パターン（塩水くさび）
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          河口部では、密度の高い海水が川底に沿って上流方向に侵入し、軽い淡水がその上を流れるという二層構造が生まれます。これを<strong>塩水くさび</strong>と呼びます。塩水くさびの先端付近はプランクトンや有機物が集まりやすく、スズキやクロダイなど汽水域を好む魚の好ポイントになります。潮の干満によってくさびの位置が変動するため、上げ潮時と下げ潮時で魚のつき場が変わります。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          河川の流れと魚のつき場
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          河川には流れの速さや水深の変化によってさまざまな地形が形成され、それぞれに特徴的な魚のつき場があります。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>
            <strong>瀬（せ）</strong>: 水深が浅く流れが速い場所。酸素が豊富で、アユやヤマメなどが好む
          </li>
          <li>
            <strong>淵（ふち）</strong>: 水深が深く流れが緩い場所。大型の渓流魚やコイ・フナなどが潜む
          </li>
          <li>
            <strong>トロ</strong>: 瀬と淵の中間で、流れが緩やかな区間。さまざまな魚種が集まる
          </li>
          <li>
            <strong>堰堤下（えんていした）</strong>: ダムや堰の直下。水が落ち込む場所は酸素が豊富で、エサも溜まりやすい好ポイント
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          離岸流の危険性と見分け方
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>離岸流</strong>（リップカレント）は、岸に打ち寄せた波が沖に向かって強く流れ出す現象です。幅は10〜30m程度ですが流速が毎秒1〜2mに達することもあり、泳いでも岸に戻れなくなる危険があります。離岸流の見分け方として、<strong>周囲と波の立ち方が違う場所</strong>、<strong>海面がザワザワしている場所</strong>、<strong>ゴミや泡が沖に向かって流れている場所</strong>があります。サーフ（砂浜）からの釣りでは離岸流の位置を把握しておくことが安全面で重要です。
        </p>

        <TsuriSpotBox>
          <p>
            ツリスポの各スポットページでは{" "}
            <Link href="/spots" className="font-medium underline">
              潮汐情報
            </Link>{" "}
            を掲載しています。満潮・干潮の時刻や潮位を確認して、潮が動く時間帯に釣行を計画しましょう。
          </p>
        </TsuriSpotBox>

        {/* ===== 7.5 水質環境と人間活動の影響 ===== */}
        <h2
          id="sec7-5"
          className="mb-4 mt-12 border-l-4 border-sky-500 pl-3 text-xl font-bold text-sky-900"
        >
          7.5 水質環境と人間活動の影響
        </h2>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          水質の指標
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          水環境の健全性はさまざまな指標で測定されます。釣りインストラクターが知っておくべき主な指標は以下の通りです。
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900 text-white">
                <th className="px-4 py-2.5 text-left">指標</th>
                <th className="px-4 py-2.5 text-left">正式名称</th>
                <th className="px-4 py-2.5 text-left">意味</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 font-semibold">DO</td>
                <td className="px-4 py-2.5">溶存酸素量</td>
                <td className="px-4 py-2.5">水中に溶けている酸素の量。高いほど魚にとって良好</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">BOD</td>
                <td className="px-4 py-2.5">生物化学的酸素要求量</td>
                <td className="px-4 py-2.5">有機物を分解するために微生物が消費する酸素量。河川の汚濁指標</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold">COD</td>
                <td className="px-4 py-2.5">化学的酸素要求量</td>
                <td className="px-4 py-2.5">有機物を化学的に酸化するために必要な酸素量。湖沼・海域の汚濁指標</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">pH</td>
                <td className="px-4 py-2.5">水素イオン濃度</td>
                <td className="px-4 py-2.5">水の酸性・アルカリ性の度合い。魚類はpH 6.5〜8.5程度が生息に適する</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          富栄養化のメカニズム
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          生活排水や農業排水に含まれる窒素・リンなどの栄養塩が水域に過剰に流入すると、<strong>富栄養化</strong>が進行します。富栄養化した水域では植物プランクトンが異常増殖し、赤潮の発生原因となります。プランクトンが大量に死ぬと分解過程で酸素が大量に消費され、底層の貧酸素化が進み、底生生物や魚の生息環境が悪化します。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          工場排水・生活排水と水質汚濁
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          かつての日本では工場排水による水質汚濁が深刻でしたが、水質汚濁防止法（1970年）の施行により工場排水の規制が進み、水質は大幅に改善されました。一方、現在では都市部の<strong>生活排水</strong>が水質汚濁の主な原因となっています。台所から流れる油や食べ残し、洗剤などが河川や海に流入し、水質悪化を招いています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          護岸工事・ダム建設が魚類に与える影響
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          河川のコンクリート護岸は洪水防止に有効ですが、魚の産卵場所や稚魚の成育場所となる水際の自然環境（ヨシ原・砂礫底など）を消失させます。<strong>ダム建設</strong>は回遊魚の遡上を妨げる大きな要因で、アユやサケなど河川を遡上する魚の繁殖に影響を与えます。近年は魚道の設置や多自然川づくりなど、生態系に配慮した河川整備が進められています。
        </p>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          釣り人ができる環境保全
        </h3>
        <p className="mb-3 text-sm leading-relaxed">
          釣り人は水辺の自然環境を享受する立場であると同時に、その環境を守る責任も担っています。具体的な取り組みとして以下が挙げられます。
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li><strong>ゴミの持ち帰り・清掃活動への参加</strong>: 釣り場のゴミは釣り禁止の原因になる</li>
          <li><strong>外来種の拡散防止</strong>: 生きたまま別の水域に放流しない（外来生物法違反にもなる）</li>
          <li><strong>撒き餌（コマセ）の適量使用</strong>: 過剰な撒き餌は水質汚濁の原因になる</li>
          <li><strong>鉛製オモリの使用削減</strong>: 鉛は水底に蓄積すると水質汚染の原因となる</li>
          <li><strong>釣り糸の回収</strong>: 放置された釣り糸は野鳥や水生生物を絡め取る危険がある</li>
        </ul>

        <h3 className="mb-2 mt-6 text-lg font-bold text-gray-800">
          キャッチ&リリースと資源保護
        </h3>
        <p className="mb-4 text-sm leading-relaxed">
          <strong>キャッチ&リリース</strong>は釣った魚を放流する行為で、水産資源の保護に貢献する取り組みです。ただし、魚に過度のダメージを与えると放流後に死亡してしまうため、リリースする場合は素早く針を外し、濡れた手で扱い、水中で体力が回復するまで支えてから放すなど、魚へのダメージを最小限に抑える配慮が必要です。なお、外来種のキャッチ&リリースについては自治体の条例を確認する必要があります。
        </p>

        <Point>
          <p>
            釣り人も<strong>水辺環境の保全者</strong>であるべきです。ゴミの持ち帰り、外来種の不拡散、撒き餌の適量使用、釣り糸の回収など、一人ひとりの行動が美しい釣り場環境を次世代に引き継ぐことにつながります。
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
            第7章のポイント
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong>魚類の分類</strong>: 硬骨魚類と軟骨魚類、海水魚・淡水魚・汽水魚の3区分
            </li>
            <li>
              <strong>側線器官</strong>: 水圧・振動を感知する魚特有のセンサーで、釣りの仕掛けへの反応に直結
            </li>
            <li>
              <strong>適水温</strong>: 魚種ごとに活性が高まる水温帯があり、釣果予測の基本情報
            </li>
            <li>
              <strong>食物連鎖</strong>: 植物プランクトン → 動物プランクトン → 小魚 → 大型魚の流れが釣り場のポテンシャルを決める
            </li>
            <li>
              <strong>赤潮と青潮</strong>: 発生メカニズム・色・影響が異なる。いずれも釣果に深刻な悪影響
            </li>
            <li>
              <strong>潮流と潮目</strong>: 潮が動く時間帯は活性が上がり、潮目はプランクトンと魚が集まる好ポイント
            </li>
            <li>
              <strong>環境保全</strong>: 釣り人は水辺環境の保全者。ゴミ持ち帰り・外来種不拡散・撒き餌適量使用を実践する
            </li>
          </ul>
        </div>

        {/* ===== 章末確認クイズ CTA ===== */}
        <div className="mt-8 rounded-xl border-2 border-purple-200 bg-purple-50 p-6 text-center">
          <h2 className="text-xl font-bold text-purple-800">確認クイズに挑戦</h2>
          <p className="mt-2 text-sm text-purple-600">全40問の4択クイズで理解度をチェック</p>
          <Link
            href="/instructor-exam/environment/quiz"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700"
          >
            クイズを始める
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* ナビ */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Link
            href="/instructor-exam/technique"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            &larr; 第6章 釣り技術と知識
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
            本ページの内容は一般的な水産学・生態学の知識に基づいています。最新の試験範囲については
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
