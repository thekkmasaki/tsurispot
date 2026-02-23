import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "季節・時期別の釣りFAQ - サビキ釣りの時期・朝マヅメ・冬の釣り",
  description:
    "サビキ釣りは何月がベスト？朝マヅメは何時から？冬でも釣れる？など季節・時期に関する釣りの疑問をまとめて回答。月別のおすすめ釣法やターゲット魚種も解説します。",
  openGraph: {
    title: "季節・時期別の釣りFAQ - サビキ釣りの時期・朝マヅメ・冬の釣り",
    description:
      "季節・時期に関する釣りの疑問をまとめて回答。月別のおすすめ釣法やターゲット魚種を解説。",
    type: "website",
    url: "https://tsurispot.com/faq/season",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/faq/season",
  },
};

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  answerText: string;
}

const faqItems: FAQItem[] = [
  {
    question: "サビキ釣りは何月がベスト？",
    answerText:
      "サビキ釣りのベストシーズンは6月〜10月です。特に7〜9月の夏場はアジ・サバ・イワシの回遊が最も活発で、初心者でも入れ食いが期待できます。5月後半から釣れ始め、11月頃まで楽しめる地域もあります。地域差があり、九州や四国では4月後半から、東北では7月頃から本格化します。水温が18度以上になるとサビキのターゲットが集まりやすくなります。",
    answer: (
      <>
        <p>
          サビキ釣りのベストシーズンは<strong>6月〜10月</strong>です。特に
          <strong>7〜9月の夏場</strong>
          はアジ・サバ・イワシの回遊が最も活発で、初心者でも入れ食いが期待できます。
        </p>
        <p className="mt-2">
          5月後半から釣れ始め、11月頃まで楽しめる地域もあります。地域差があり、九州や四国では4月後半から、東北では7月頃から本格化します。
        </p>
        <p className="mt-2">
          水温が<strong>18度以上</strong>
          になるとサビキのターゲットが集まりやすくなります。水温の目安として、地元の釣具店や海水温情報サイトを確認しましょう。
        </p>
        <ul className="mt-2 space-y-1">
          <li>・<strong>6月</strong>：小アジが回り始める。数釣りシーズン開始</li>
          <li>・<strong>7〜8月</strong>：最盛期。朝夕は特に好調</li>
          <li>・<strong>9〜10月</strong>：アジが大きくなり食べ応えアップ</li>
          <li>・<strong>11月</strong>：徐々に釣果が落ちるが、脂の乗った良型が狙える</li>
        </ul>
        <p className="mt-2">
          サビキ釣りの詳しいやり方は
          <Link href="/guide/sabiki" className="font-medium text-primary hover:underline">サビキ釣りガイド</Link>
          をご覧ください。月別の釣り情報は
          <Link href="/monthly" className="font-medium text-primary hover:underline">月別釣りカレンダー</Link>
          で確認できます。
        </p>
      </>
    ),
  },
  {
    question: "アジ釣りのシーズンはいつ？",
    answerText:
      "アジは年間を通じて釣れますが、ベストシーズンは6月〜11月です。初夏は小アジの数釣り、秋は20cm以上の良型が狙えます。冬でもアジングなどルアー釣りで狙えますが、釣果は夏〜秋に比べると落ちます。堤防からのサビキ釣りなら7〜9月、アジングなら通年楽しめます。夕方〜夜にかけてが特に釣れやすい時間帯です。",
    answer: (
      <>
        <p>
          アジは年間を通じて釣れますが、ベストシーズンは
          <strong>6月〜11月</strong>です。
        </p>
        <ul className="mt-2 space-y-1">
          <li>・<strong>6〜7月</strong>：小アジ（10〜15cm）の数釣りが楽しめる</li>
          <li>・<strong>8〜9月</strong>：回遊が安定し、最も釣りやすい時期</li>
          <li>・<strong>10〜11月</strong>：20cm超の良型が増え、脂の乗りも最高</li>
          <li>・<strong>12〜3月</strong>：釣果は落ちるが、深場に移動した良型をアジングで狙える</li>
        </ul>
        <p className="mt-2">
          堤防からのサビキ釣りなら<strong>7〜9月</strong>、アジングなら通年楽しめます。夕方〜夜にかけてが特に釣れやすい時間帯（いわゆる「夕マヅメ」）です。
        </p>
        <p className="mt-2">
          アジの詳しい情報は
          <Link href="/fish/aji" className="font-medium text-primary hover:underline">アジの魚種図鑑</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "冬の釣りでおすすめの魚種・釣法は？",
    answerText:
      "冬（12月〜2月）でも釣りは楽しめます。おすすめはカサゴやメバルの穴釣り・メバリング、カレイの投げ釣り、ヒラメのルアー釣り、アイナメのブラクリ釣りです。冬は夏に比べて魚の活性が下がりますが、根魚（カサゴ・メバル・アイナメ）は低水温でも活発に餌を追います。防寒対策をしっかりして、日中の暖かい時間帯に集中するのがコツです。",
    answer: (
      <>
        <p>
          冬（12月〜2月）でも釣りは十分楽しめます。以下の魚種・釣法がおすすめです。
        </p>
        <ul className="mt-2 space-y-1">
          <li>・<strong>カサゴ（穴釣り・ブラクリ）</strong>：テトラの隙間に仕掛けを落とすだけ。初心者でも簡単で、冬でも高確率で釣れる</li>
          <li>・<strong>メバル（メバリング）</strong>：冬〜春がベストシーズン。軽量ジグヘッド+ワームで狙う</li>
          <li>・<strong>カレイ（投げ釣り）</strong>：11月〜2月が産卵シーズンで接岸する。砂浜や堤防からの投げ釣りで狙える</li>
          <li>・<strong>アイナメ（ブラクリ・ルアー）</strong>：冬が旬の根魚。岩礁帯やテトラ周りで釣れる</li>
          <li>・<strong>ヒラメ</strong>：サーフからのルアーフィッシングで冬も狙える</li>
        </ul>
        <p className="mt-2">
          冬は<strong>防寒対策が最重要</strong>です。防寒着の重ね着、手袋、ネックウォーマー、カイロを準備しましょう。日中の暖かい時間帯（10時〜14時）に集中して釣るのが効率的です。
        </p>
        <p className="mt-2">
          冬の釣りスポットは
          <Link href="/seasonal/winter" className="font-medium text-primary hover:underline">冬の釣り特集</Link>
          で確認できます。
        </p>
      </>
    ),
  },
  {
    question: "夏の釣りで注意すべきことは？",
    answerText:
      "夏の釣りは熱中症対策が最も重要です。こまめな水分補給（1時間にコップ1杯以上）、帽子・サングラスの着用、日焼け止め、UVカットの長袖着用が基本です。早朝（5時〜8時）や夕方（16時以降）の涼しい時間帯に釣りをするのがおすすめ。日中は無理をせず休憩を取りましょう。また、雷の発生が多い季節なので、天候の急変に注意し、雷鳴が聞こえたらすぐに避難してください。",
    answer: (
      <>
        <p>
          夏の釣りは魚の活性が高く最高のシーズンですが、以下の注意点があります。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">熱中症対策（最重要）：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・こまめな水分補給（1時間にコップ1杯以上。スポーツドリンクも有効）</li>
            <li>・帽子・サングラスの着用（つばの広い帽子が理想）</li>
            <li>・日焼け止め（SPF50推奨、2時間おきに塗り直し）</li>
            <li>・UVカットの長袖（速乾素材がベスト）</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">時間帯の工夫：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>早朝（5時〜8時）</strong>：朝マヅメで魚の活性も高く、涼しい</li>
            <li>・<strong>夕方（16時以降）</strong>：夕マヅメ。日中の暑さが和らぐ</li>
            <li>・日中は木陰やタープの下で休憩を取る</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">その他の注意点：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>雷</strong>：夏は雷が発生しやすい。雷鳴が聞こえたら即避難</li>
            <li>・<strong>虫対策</strong>：蚊やブヨ対策に虫除けスプレーを持参</li>
            <li>・<strong>食材管理</strong>：エサや釣った魚の鮮度管理に注意。氷を多めに用意</li>
          </ul>
        </div>
        <p className="mt-2">
          夏の釣りスポットは
          <Link href="/seasonal/summer" className="font-medium text-primary hover:underline">夏の釣り特集</Link>
          で確認できます。安全情報は
          <Link href="/safety" className="font-medium text-primary hover:underline">安全ガイド</Link>
          もご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "朝マヅメは何時から？なぜ釣れる？",
    answerText:
      "朝マヅメとは日の出前後の約1〜2時間を指します。季節によって時間は異なり、夏は4時〜6時頃、冬は6時〜8時頃が目安です。朝マヅメに釣れる理由は、日の出前後にプランクトンが活発化し、それを食べる小魚が動き、さらにそれを追う大型魚も活性が上がるという食物連鎖の活性化にあります。加えて、光量の変化で魚の警戒心が薄れることも要因です。",
    answer: (
      <>
        <p>
          朝マヅメとは<strong>日の出前後の約1〜2時間</strong>
          を指す、釣りのゴールデンタイムです。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">季節別の目安時間：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>春（3〜5月）</strong>：5時〜7時頃</li>
            <li>・<strong>夏（6〜8月）</strong>：4時〜6時頃</li>
            <li>・<strong>秋（9〜11月）</strong>：5時〜7時頃</li>
            <li>・<strong>冬（12〜2月）</strong>：6時〜8時頃</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">
            なぜ朝マヅメに釣れるのか：
          </p>
          <ul className="mt-1 space-y-0.5">
            <li>・日の出前後にプランクトンが活発化する</li>
            <li>・プランクトンを食べる小魚が動き出す</li>
            <li>・小魚を追って大型魚も活性が上がる（食物連鎖の活性化）</li>
            <li>・光量の変化で魚の警戒心が薄れる</li>
          </ul>
        </div>
        <p className="mt-2">
          同様に<strong>夕マヅメ</strong>
          （日没前後の1〜2時間）も好時合いです。朝マヅメと夕マヅメの両方を狙えば、釣果が大幅にアップします。
        </p>
        <p className="mt-2">
          潮と時間帯の関係については
          <Link href="/tides" className="font-medium text-primary hover:underline">潮汐情報</Link>
          も参考にしてください。
        </p>
      </>
    ),
  },
  {
    question: "春に釣れる魚は？",
    answerText:
      "春（3月〜5月）は多くの魚が産卵や回遊のために浅場に接岸する季節です。メバル（3〜4月がベスト）、チヌ（クロダイ、のっこみシーズン）、アオリイカ（産卵のため接岸）、シーバス（バチ抜けパターン）、カレイ（花見ガレイ）、マダイ（桜鯛）などが代表的なターゲットです。4月後半からはサビキでアジも狙え始めます。",
    answer: (
      <>
        <p>
          春（3月〜5月）は多くの魚が産卵や回遊のために浅場に接岸する、期待の季節です。
        </p>
        <ul className="mt-2 space-y-1">
          <li>・<strong>メバル</strong>：3〜4月がベスト。メバリングや電気ウキ釣りで狙える</li>
          <li>・<strong>チヌ（クロダイ）</strong>：「のっこみ」と呼ばれる産卵期で浅場に接岸。フカセ釣りが人気</li>
          <li>・<strong>アオリイカ</strong>：産卵のため接岸する親イカシーズン。エギングで大型が狙える</li>
          <li>・<strong>シーバス</strong>：河川でのバチ抜けパターンが有名。ルアーで狙う</li>
          <li>・<strong>カレイ</strong>：「花見ガレイ」と呼ばれる春の投げ釣りターゲット</li>
          <li>・<strong>マダイ</strong>：「桜鯛」とも呼ばれ、春に浅場に接岸。船釣りが中心</li>
        </ul>
        <p className="mt-2">
          4月後半からはサビキでアジも狙え始め、GW頃から本格的な釣りシーズンが始まります。
        </p>
        <p className="mt-2">
          月別の詳しい情報は
          <Link href="/monthly" className="font-medium text-primary hover:underline">月別釣りカレンダー</Link>
          で確認できます。春の釣りスポットは
          <Link href="/seasonal/spring" className="font-medium text-primary hover:underline">春の釣り特集</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "秋の釣りが良いと聞くけど本当？",
    answerText:
      "秋（9月〜11月）は1年で最も釣りやすい季節と言われています。理由は、魚が冬に備えてエサを活発に食べる（荒食い）ため活性が非常に高いこと、ターゲットの種類が豊富（アジ、サバ、タチウオ、青物、アオリイカ、シーバスなど）なこと、気温が快適で釣りがしやすいこと、サビキ・投げ・ルアーなど全ての釣法で好釣果が期待できることです。",
    answer: (
      <>
        <p>
          <strong>秋（9月〜11月）は1年で最も釣りやすい季節</strong>
          と言われており、それは本当です。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">秋が良い理由：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・魚が冬に備えてエサを活発に食べる（<strong>荒食い</strong>）ため活性が非常に高い</li>
            <li>・ターゲットの種類が豊富</li>
            <li>・気温が快適で長時間の釣りがしやすい</li>
            <li>・サビキ・投げ・ルアーなど全ての釣法で好釣果が期待</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">秋の代表的なターゲット：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>アジ</strong>：良型（20cm超）が増え、脂の乗りも最高</li>
            <li>・<strong>タチウオ</strong>：秋がベストシーズン。夜のウキ釣りが定番</li>
            <li>・<strong>青物（ブリ・カンパチ・ソウダガツオ）</strong>：堤防からも狙えるチャンス</li>
            <li>・<strong>アオリイカ</strong>：秋イカ（新子）シーズン。数釣りが楽しめる</li>
            <li>・<strong>シーバス</strong>：コノシロパターンなど秋の爆釣パターンあり</li>
          </ul>
        </div>
        <p className="mt-2">
          秋の釣りスポットは
          <Link href="/seasonal/autumn" className="font-medium text-primary hover:underline">秋の釣り特集</Link>
          、月別情報は
          <Link href="/monthly" className="font-medium text-primary hover:underline">月別釣りカレンダー</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "雨の日は釣りに行かない方がいい？",
    answerText:
      "小雨程度であれば、むしろ魚の活性が上がって釣れやすくなることがあります。雨で水面が叩かれると魚の警戒心が薄れる、水中の酸素量が増える、濁りが出て魚がエサを見つけやすくなるなどのメリットがあります。ただし、大雨・雷・強風の場合は危険なので絶対に中止してください。特に雷は釣竿が避雷針になるため非常に危険です。河川では急な増水にも注意が必要です。",
    answer: (
      <>
        <p>
          <strong>小雨程度であれば</strong>
          、むしろ魚の活性が上がって釣れやすくなることがあります。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">雨の日のメリット：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・雨で水面が叩かれ、魚の警戒心が薄れる</li>
            <li>・水中の酸素量が増え、魚の活性が上がる</li>
            <li>・適度な濁りで魚がエサに食いつきやすくなる</li>
            <li>・釣り人が少なく、ポイントが空いている</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">中止すべき状況：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>雷</strong>：釣竿が避雷針になるため非常に危険。絶対に中止</li>
            <li>・<strong>大雨</strong>：視界不良、足場が滑りやすくなる</li>
            <li>・<strong>強風</strong>：仕掛けが飛ばされる、波が高くなる</li>
            <li>・<strong>河川の増水</strong>：急な水位上昇は命に関わる</li>
          </ul>
        </div>
        <p className="mt-2">
          雨の日に釣りをする場合は、レインウェア上下、防水バッグ、滑りにくい靴を準備しましょう。天気予報をこまめにチェックし、天候が悪化したら即撤退が鉄則です。
        </p>
        <p className="mt-2">
          安全に関する詳細は
          <Link href="/safety" className="font-medium text-primary hover:underline">安全ガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "潮回りと釣果の関係は？大潮がいい？",
    answerText:
      "潮回りは釣果に大きく影響します。一般的に大潮や中潮の日は潮の流れが大きく、プランクトンや小魚が動くため釣果が期待できます。特に満潮・干潮の前後2時間（潮が動くタイミング）がチャンスです。ただし、必ずしも大潮が最良というわけではなく、釣り場や魚種によって異なります。小潮でも潮の変わり目を狙えば十分釣れます。重要なのは潮が止まっている時間を避けることです。",
    answer: (
      <>
        <p>
          潮回りは釣果に大きく影響します。潮が動くタイミングで魚の活性が上がります。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">潮回りの基本：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>大潮</strong>：潮の動きが最も大きい。プランクトンや小魚が動き、魚の活性が上がりやすい</li>
            <li>・<strong>中潮</strong>：大潮に次いで潮が良く動く。安定した釣果が期待できる</li>
            <li>・<strong>小潮</strong>：潮の動きが小さい。潮の変わり目を狙えば釣れる</li>
            <li>・<strong>長潮・若潮</strong>：潮の動きが最も小さい。一般的には不向き</li>
          </ul>
        </div>
        <p className="mt-2">
          <strong>最も重要なのは「潮が動いている時間」に釣ること</strong>
          です。満潮・干潮の前後2時間が狙い目（「上げ七分・下げ三分」とも言います）。潮止まり（満潮・干潮のピーク時）は魚の活性が下がりがちです。
        </p>
        <p className="mt-2">
          ただし、釣り場や魚種によって最適な潮回りは異なります。例えば、河口域では下げ潮が良かったり、磯では上げ潮が効く場合もあります。
        </p>
        <p className="mt-2">
          潮汐情報は
          <Link href="/tides" className="font-medium text-primary hover:underline">潮汐カレンダー</Link>
          で確認できます。
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
      name: "季節・時期別FAQ",
      item: "https://tsurispot.com/faq/season",
    },
  ],
};

export default function FAQSeasonPage() {
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
            { label: "季節・時期別FAQ" },
          ]}
        />
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100">
              <CalendarDays className="size-5 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              季節・時期別の釣りFAQ
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            サビキ釣りの時期、朝マヅメ、冬の釣りなど季節に関する疑問を解決
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
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
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
            <Link href="/faq/beginner" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">初心者向けFAQ</p>
              <p className="mt-1 text-xs text-muted-foreground">道具・予算・始め方の疑問</p>
            </Link>
            <Link href="/monthly" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">月別釣りカレンダー</p>
              <p className="mt-1 text-xs text-muted-foreground">月ごとの釣り情報</p>
            </Link>
            <Link href="/fishing-calendar" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">釣りカレンダー</p>
              <p className="mt-1 text-xs text-muted-foreground">年間スケジュール</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
