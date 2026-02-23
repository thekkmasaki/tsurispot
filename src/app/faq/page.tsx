import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  Anchor,
  MapPin,
  Wrench,
  Fish,
  ShieldCheck,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "よくある質問（FAQ） - 釣り初心者のギモンを解決",
  description:
    "釣り初心者が抱えるよくある質問をカテゴリ別にわかりやすく回答。必要な道具、釣り場選び、服装、マナー、釣った魚の扱い方まで、釣りデビュー前に知っておきたいことをすべて解説します。",
  openGraph: {
    title: "よくある質問（FAQ） - 釣り初心者のギモンを解決",
    description:
      "釣り初心者が抱えるよくある質問をカテゴリ別にわかりやすく回答。釣りデビュー前に知っておきたいことをすべて解説。",
    type: "website",
    url: "https://tsurispot.com/faq",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/faq",
  },
};

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    id: "beginner",
    title: "初めての釣り",
    icon: <Anchor className="size-5 text-primary" />,
    items: [
      {
        question: "釣りを始めるのに最低限必要なものは？",
        answer: (
          <>
            <p>
              最低限必要なのは、<strong>竿・リール・仕掛け・エサ・バケツ</strong>の5つです。初心者の場合、釣具店で販売している「サビキ釣りセット」（3,000〜5,000円程度）を購入するのが最もコスパが良くおすすめです。
            </p>
            <p className="mt-2">
              これに加えて、<strong>ハサミ・タオル・ゴミ袋・クーラーボックス</strong>があると便利です。安全面では<strong>ライフジャケット</strong>も必ず準備しましょう。
            </p>
            <p className="mt-2">
              詳しい持ち物は
              <Link href="/beginner-checklist" className="font-medium text-primary hover:underline">持ち物チェックリスト</Link>
              で確認できます。
            </p>
          </>
        ),
      },
      {
        question: "初心者におすすめの釣り方は？",
        answer: (
          <>
            <p>
              初心者には<strong>サビキ釣り</strong>が最もおすすめです。投げる技術が不要で、堤防の足元に仕掛けを落とすだけ。アジ・サバ・イワシなどが狙え、群れが来れば入れ食いも期待できます。
            </p>
            <p className="mt-2">
              サビキ釣りに慣れてきたら、<strong>ちょい投げ</strong>（キスやハゼ狙い）や<strong>穴釣り</strong>（カサゴ狙い）にも挑戦してみましょう。どちらも初心者でも比較的簡単に釣果を出せます。
            </p>
            <p className="mt-2">
              各釣法の詳細は
              <Link href="/methods" className="font-medium text-primary hover:underline">釣り方・釣法ガイド</Link>
              をご覧ください。
            </p>
          </>
        ),
      },
      {
        question: "1人でも釣りに行ける？",
        answer: (
          <>
            <p>
              もちろん1人でも釣りに行けます。実際、ソロで釣りを楽しむ方はとても多いです。ただし、初めての場合は以下の点に注意してください。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・安全な釣り場（海釣り公園や整備された堤防）を選ぶ</li>
              <li>・家族や友人に行き先と帰宅予定時間を伝えておく</li>
              <li>・ライフジャケットを着用する</li>
              <li>・天候の変化に注意し、無理をしない</li>
              <li>・スマートフォンの充電を十分にしておく</li>
            </ul>
            <p className="mt-2">
              不安な方は、
              <Link href="/guide" className="font-medium text-primary hover:underline">釣りの始め方ガイド</Link>
              で事前に流れを確認しておくと安心です。
            </p>
          </>
        ),
      },
      {
        question: "釣りに適した服装は？",
        answer: (
          <>
            <p>
              季節を問わず共通するポイントは以下の通りです。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>動きやすい服装</strong>：汚れてもいい服が基本。ジーンズやカーゴパンツなど</li>
              <li>・<strong>滑りにくい靴</strong>：スニーカーか長靴。サンダルは危険なのでNG</li>
              <li>・<strong>帽子</strong>：日差し除けと、他の人の仕掛けから頭を守るため</li>
              <li>・<strong>レインウェア</strong>：突然の雨や波しぶき対策に1枚あると安心</li>
            </ul>
            <p className="mt-2">
              夏は日焼け止め・サングラス・水分補給が必須。冬は防寒着を重ね着し、手袋・ネックウォーマー・カイロを用意しましょう。
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "spot",
    title: "釣り場について",
    icon: <MapPin className="size-5 text-primary" />,
    items: [
      {
        question: "釣り禁止の場所はどうやって確認する？",
        answer: (
          <>
            <p>
              釣り禁止の場所を確認するには、以下の方法があります。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>現地の看板・標識</strong>：「釣り禁止」「立入禁止」の看板がないか確認</li>
              <li>・<strong>地元の釣具店</strong>：その地域の最新の情報を教えてもらえる</li>
              <li>・<strong>漁港の管理事務所</strong>：漁港での釣り可否を直接問い合わせ</li>
              <li>・<strong>自治体のホームページ</strong>：条例で禁止区域が公開されていることも</li>
            </ul>
            <p className="mt-2">
              また、
              <Link href="/fishing-rules" className="font-medium text-primary hover:underline">釣りのルール・マナーガイド</Link>
              もあわせてご確認ください。禁止場所で釣りをすると条例違反になる場合があります。
            </p>
          </>
        ),
      },
      {
        question: "漁港で釣りしてもいい？",
        answer: (
          <>
            <p>
              漁港での釣りは<strong>場所によって異なります</strong>。完全に釣り禁止の漁港もあれば、一部エリアのみ開放されている漁港もあります。
            </p>
            <p className="mt-2">
              漁港は漁業者の仕事場です。以下のマナーを守りましょう。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・漁船の作業を邪魔しない（係留ロープに仕掛けを引っ掛けないなど）</li>
              <li>・荷揚げ作業の邪魔にならない場所で釣りをする</li>
              <li>・ゴミは必ず持ち帰る。コマセの汚れも洗い流す</li>
              <li>・車は指定の場所に駐車する</li>
            </ul>
            <p className="mt-2">
              近年、マナー違反が原因で釣り禁止になる漁港が増えています。ルールを守って釣り場を守りましょう。
            </p>
          </>
        ),
      },
      {
        question: "海釣り公園と堤防の違いは？",
        answer: (
          <>
            <p>
              <strong>海釣り公園</strong>は、釣り専用に整備された有料施設です。柵やトイレ、売店が完備されており、初心者やファミリーに最適です。レンタルタックルが利用できる場所も多いです。
            </p>
            <p className="mt-2">
              <strong>堤防</strong>は、無料で自由に釣りができる場所が多いですが、トイレや柵がないことが多く、安全管理は自己責任です。釣り場としてのポテンシャルは堤防の方が高い場合もありますが、初心者は海釣り公園から始めるのがおすすめです。
            </p>
            <p className="mt-2">
              <Link href="/spots" className="font-medium text-primary hover:underline">釣りスポット検索</Link>
              で、お近くの釣り場を探してみてください。
            </p>
          </>
        ),
      },
      {
        question: "夜釣りは初心者でもできる？",
        answer: (
          <>
            <p>
              夜釣りは初心者でも楽しめますが、<strong>安全面での注意</strong>が必要です。以下の準備を整えてから挑戦しましょう。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>ヘッドライト</strong>：両手が空くタイプが必須。予備電池も持参</li>
              <li>・<strong>ライフジャケット</strong>：暗闘での転落は非常に危険</li>
              <li>・<strong>足場の良い釣り場</strong>：明るいうちに下見をしておくと安心</li>
              <li>・<strong>複数人で行く</strong>：初めての夜釣りは経験者と一緒に</li>
            </ul>
            <p className="mt-2">
              夜釣りのターゲットとしては、アジング、メバリング、タチウオの電気ウキ釣りなどが人気です。常夜灯のある漁港なら初心者でも比較的安全に楽しめます。
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "tackle",
    title: "道具・仕掛け",
    icon: <Wrench className="size-5 text-primary" />,
    items: [
      {
        question: "竿とリールの選び方は？",
        answer: (
          <>
            <p>
              初心者が最初に買うなら、<strong>万能竿（2.5〜3.6m）＋スピニングリール（2500〜3000番）</strong>の組み合わせがおすすめです。サビキ釣り、ちょい投げ、ウキ釣りなど幅広い釣法に対応できます。
            </p>
            <p className="mt-2">
              予算は竿とリールのセットで5,000〜10,000円程度が目安。有名メーカー（ダイワ・シマノ）のエントリーモデルは品質が安定しており、長く使えます。
            </p>
            <p className="mt-2">
              特定の釣法にハマったら、その釣法の専用タックルにステップアップするのが一般的です。詳しくは
              <Link href="/guide/setup" className="font-medium text-primary hover:underline">タックル準備ガイド</Link>
              をご覧ください。
            </p>
          </>
        ),
      },
      {
        question: "エサはどこで買う？",
        answer: (
          <>
            <p>
              釣りエサの入手方法は主に以下の3つです。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>釣具店</strong>：最も確実。アミエビ、オキアミ、アオイソメなど種類が豊富。アドバイスももらえる</li>
              <li>・<strong>釣り場近くの自動販売機</strong>：24時間利用可能な場所も。冷凍アミエビやイソメが多い</li>
              <li>・<strong>通販</strong>：冷凍エサはネットでまとめ買いも可能。コマセ用のアミエビブロックなど</li>
            </ul>
            <p className="mt-2">
              初心者には<strong>アオイソメ</strong>（万能エサ）と<strong>冷凍アミエビ</strong>（サビキ用コマセ）をおすすめします。
            </p>
          </>
        ),
      },
      {
        question: "ルアーとエサ釣りどっちがいい？",
        answer: (
          <>
            <p>
              それぞれにメリットがあり、一概にどちらが良いとは言えません。
            </p>
            <div className="mt-2">
              <p className="font-medium text-foreground">エサ釣りのメリット：</p>
              <ul className="mt-1 space-y-0.5">
                <li>・初心者でも釣りやすい（魚がエサに食いつきやすい）</li>
                <li>・待つ釣りが中心でのんびり楽しめる</li>
                <li>・道具がシンプルで始めやすい</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="font-medium text-foreground">ルアー釣りのメリット：</p>
              <ul className="mt-1 space-y-0.5">
                <li>・エサを買う手間がなく、手が汚れにくい</li>
                <li>・ゲーム性が高く、テクニックで差が出る</li>
                <li>・荷物が少なく、機動力が高い</li>
              </ul>
            </div>
            <p className="mt-2">
              初心者はまずエサ釣り（サビキ釣りやちょい投げ）で魚の引きを体験し、慣れてきたらルアー釣り（アジングやメバリング）に挑戦するのがおすすめです。
            </p>
          </>
        ),
      },
      {
        question: "釣り道具のメンテナンス方法は？",
        answer: (
          <>
            <p>
              釣り道具の寿命を延ばすために、<strong>毎回の釣行後に必ずメンテナンス</strong>しましょう。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>竿</strong>：真水で塩分を洗い流し、柔らかい布で拭いて乾燥。ガイド（糸を通すリング）のサビに注意</li>
              <li>・<strong>リール</strong>：真水でさっと洗い（水没させない）、陰干し。ハンドル部分にオイルを少量注す</li>
              <li>・<strong>仕掛け・ルアー</strong>：真水で洗い、針先の鈍りやサビをチェック。使えないものは早めに交換</li>
              <li>・<strong>クーラーボックス</strong>：中性洗剤で洗い、蓋を開けて乾燥</li>
            </ul>
            <p className="mt-2">
              特に海釣りの場合、塩分がサビの原因になります。帰宅後すぐに水洗いする習慣をつけましょう。
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "fish-handling",
    title: "釣った魚について",
    icon: <Fish className="size-5 text-primary" />,
    items: [
      {
        question: "釣った魚はそのまま食べられる？",
        answer: (
          <>
            <p>
              釣った魚は<strong>適切に処理すれば美味しく食べられます</strong>。ただし、以下の注意点があります。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>鮮度管理</strong>：釣ったらすぐにクーラーボックス（氷入り）に入れる。海水氷が最適</li>
              <li>・<strong>締め処理</strong>：脳締めや血抜きをすると鮮度が保たれ、味も格段に良くなる</li>
              <li>・<strong>寄生虫</strong>：アニサキスなどの寄生虫リスクがある。刺身にする場合は十分注意（-20度で24時間冷凍、または目視で確認して除去）</li>
              <li>・<strong>毒魚</strong>：フグなど素人が調理してはいけない魚もある</li>
            </ul>
            <p className="mt-2">
              魚の食べ方については
              <Link href="/fish" className="font-medium text-primary hover:underline">魚種図鑑</Link>
              で魚種ごとに紹介しています。
            </p>
          </>
        ),
      },
      {
        question: "毒魚が釣れたらどうする？",
        answer: (
          <>
            <p>
              毒魚が釣れた場合は、<strong>絶対に素手で触らない</strong>ことが最重要です。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>プライヤー（ペンチ）</strong>で針を外す。魚をフィッシュグリップで掴むと安全</li>
              <li>・<strong>触れてしまった場合</strong>：ゴンズイやオコゼの棘に刺されたら、患部を熱いお湯（45度程度）に浸けると痛みが和らぐ。毒は熱で分解される</li>
              <li>・<strong>フグ</strong>：テトロドトキシンは致死性の猛毒。絶対に食べない。リリースするか、他の人が触らないよう処分</li>
            </ul>
            <p className="mt-2">
              代表的な毒魚（ゴンズイ、ハオコゼ、アカエイ、フグ類）は見た目を覚えておくと安心です。
              <Link href="/fish" className="font-medium text-primary hover:underline">魚種図鑑</Link>
              で確認できます。
            </p>
          </>
        ),
      },
      {
        question: "リリースするときの注意点は？",
        answer: (
          <>
            <p>
              魚をリリース（放流）する際は、<strong>魚へのダメージを最小限</strong>にすることが大切です。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>素早く針を外す</strong>：プライヤーを使って手際よく。飲まれた針は無理に外さずハリスを切る</li>
              <li>・<strong>乾いた手で触らない</strong>：魚の体表の粘膜が剥がれるため、手を濡らしてから扱う</li>
              <li>・<strong>陸上に長時間放置しない</strong>：写真撮影もスピーディに</li>
              <li>・<strong>そっと海に戻す</strong>：投げ込まず、水面に優しくリリース。魚が自力で泳ぎ出すまで支える</li>
            </ul>
            <p className="mt-2">
              バーブレスフック（カエシのない針）を使うと、魚へのダメージが少なくリリースもスムーズです。
            </p>
          </>
        ),
      },
      {
        question: "小さい魚はリリースすべき？",
        answer: (
          <>
            <p>
              基本的に<strong>小さい魚はリリースするのがマナー</strong>です。水産資源の保護のため、以下を目安にしましょう。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>アジ</strong>：15cm以下はリリース推奨</li>
              <li>・<strong>メバル・カサゴ</strong>：15cm以下はリリース推奨</li>
              <li>・<strong>クロダイ</strong>：25cm以下はリリース推奨</li>
              <li>・<strong>キス</strong>：12cm以下はリリース推奨</li>
            </ul>
            <p className="mt-2">
              地域によっては条例で最低キープサイズが定められている場合もあります。釣り場のルールを確認しましょう。食べきれる分だけキープし、それ以上はリリースするのが釣り人のマナーです。
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "manner",
    title: "マナー・ルール",
    icon: <ShieldCheck className="size-5 text-primary" />,
    items: [
      {
        question: "釣り場での最低限のマナーは？",
        answer: (
          <>
            <p>
              釣り場で守るべき最低限のマナーは以下の通りです。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>挨拶をする</strong>：隣に入る時は「ここ、入ってもいいですか？」と一声かける</li>
              <li>・<strong>適切な間隔を保つ</strong>：最低でも3m以上の距離を空ける。混雑時は周囲に配慮</li>
              <li>・<strong>ゴミは持ち帰る</strong>：自分のゴミはもちろん、落ちているゴミも拾えるとベスト</li>
              <li>・<strong>釣り場を汚さない</strong>：コマセの汚れは海水で洗い流して帰る</li>
              <li>・<strong>駐車マナーを守る</strong>：指定外の場所に駐車しない。地元住民の迷惑にならないように</li>
              <li>・<strong>騒がない</strong>：特に早朝・夜間は周辺住民への配慮を</li>
            </ul>
            <p className="mt-2">
              マナーの悪さが釣り禁止の最大の原因です。詳しくは
              <Link href="/fishing-rules" className="font-medium text-primary hover:underline">釣りのルール・マナーガイド</Link>
              をご覧ください。
            </p>
          </>
        ),
      },
      {
        question: "ゴミはどうすればいい？",
        answer: (
          <>
            <p>
              <strong>すべてのゴミは持ち帰り</strong>が基本です。以下を実践しましょう。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>ゴミ袋を必ず持参</strong>：最低2枚（燃えるゴミ用・仕掛け等用）</li>
              <li>・<strong>糸クズ・仕掛け</strong>：鳥や海洋生物の被害につながるので、小さな糸クズも回収する</li>
              <li>・<strong>コマセの汚れ</strong>：バケツで海水をくんで釣り場を洗い流す</li>
              <li>・<strong>タバコの吸い殻</strong>：携帯灰皿を使用</li>
              <li>・<strong>余ったエサ</strong>：海に捨てず持ち帰る（環境汚染の原因になる）</li>
            </ul>
            <p className="mt-2">
              「来た時よりもきれいに」を合言葉に、釣り場を大切にしましょう。
            </p>
          </>
        ),
      },
      {
        question: "遊漁券って何？必要な場合は？",
        answer: (
          <>
            <p>
              <strong>遊漁券</strong>（遊漁承認証）は、河川や湖で釣りをする際に必要な許可証です。漁業協同組合が管理する水域では、遊漁料を支払って遊漁券を購入する必要があります。
            </p>
            <ul className="mt-2 space-y-1">
              <li>・<strong>必要な場合</strong>：川・湖・ダム湖など淡水域での釣り（アユ・ヤマメ・イワナ・バスなど）</li>
              <li>・<strong>不要な場合</strong>：一般的な海釣り（堤防・サーフ・磯など）</li>
              <li>・<strong>購入場所</strong>：地元の釣具店、コンビニ、漁協事務所、またはオンラインで購入可能</li>
              <li>・<strong>料金</strong>：日券500〜2,000円、年券3,000〜10,000円程度（地域・対象魚種により異なる）</li>
            </ul>
            <p className="mt-2">
              遊漁券なしで釣りをすると<strong>密漁扱い</strong>になる場合があります。川釣りに行く際は事前に確認しましょう。海釣りでも、一部の管理釣り場や海釣り公園では入場料が必要です。
            </p>
          </>
        ),
      },
    ],
  },
];

// Plain text answers for JSON-LD (structured data needs plain text, not JSX)
const faqAnswersPlainText: Record<string, string> = {
  "釣りを始めるのに最低限必要なものは？":
    "最低限必要なのは、竿・リール・仕掛け・エサ・バケツの5つです。初心者の場合、釣具店で販売している「サビキ釣りセット」（3,000〜5,000円程度）を購入するのが最もコスパが良くおすすめです。これに加えて、ハサミ・タオル・ゴミ袋・クーラーボックスがあると便利です。安全面ではライフジャケットも必ず準備しましょう。",
  "初心者におすすめの釣り方は？":
    "初心者にはサビキ釣りが最もおすすめです。投げる技術が不要で、堤防の足元に仕掛けを落とすだけ。アジ・サバ・イワシなどが狙え、群れが来れば入れ食いも期待できます。慣れてきたら、ちょい投げやや穴釣りにも挑戦してみましょう。",
  "1人でも釣りに行ける？":
    "もちろん1人でも釣りに行けます。実際、ソロで釣りを楽しむ方はとても多いです。安全な釣り場を選び、行き先を誰かに伝え、ライフジャケットを着用し、天候の変化に注意しましょう。",
  "釣りに適した服装は？":
    "動きやすく汚れてもいい服装が基本。滑りにくい靴（スニーカーか長靴）、帽子、レインウェアが必要です。夏は日焼け止めと水分補給、冬は防寒着の重ね着がポイントです。",
  "釣り禁止の場所はどうやって確認する？":
    "現地の看板・標識の確認、地元の釣具店への問い合わせ、漁港の管理事務所への確認、自治体のホームページの確認などの方法があります。禁止場所で釣りをすると条例違反になる場合があります。",
  "漁港で釣りしてもいい？":
    "漁港での釣りは場所によって異なります。完全に釣り禁止の漁港もあれば、一部エリアのみ開放されている漁港もあります。漁港は漁業者の仕事場なので、漁船の作業を邪魔しない、ゴミは持ち帰る等のマナーを守りましょう。",
  "海釣り公園と堤防の違いは？":
    "海釣り公園は釣り専用に整備された有料施設で、柵やトイレ、売店が完備されており初心者に最適です。堤防は無料で自由に釣りができますが、トイレや柵がないことが多く安全管理は自己責任です。初心者は海釣り公園から始めるのがおすすめです。",
  "夜釣りは初心者でもできる？":
    "夜釣りは初心者でも楽しめますが、安全面での注意が必要です。ヘッドライト、ライフジャケットは必須。足場の良い釣り場を選び、初めては経験者と一緒に行きましょう。アジング、メバリング、タチウオの電気ウキ釣りが人気です。",
  "竿とリールの選び方は？":
    "初心者が最初に買うなら、万能竿（2.5〜3.6m）＋スピニングリール（2500〜3000番）の組み合わせがおすすめです。予算はセットで5,000〜10,000円程度が目安。有名メーカーのエントリーモデルが品質が安定しています。",
  "エサはどこで買う？":
    "釣具店が最も確実で種類が豊富。釣り場近くの自動販売機は24時間利用可能。通販でまとめ買いも可能です。初心者にはアオイソメ（万能エサ）と冷凍アミエビ（サビキ用コマセ）がおすすめです。",
  "ルアーとエサ釣りどっちがいい？":
    "エサ釣りは初心者でも釣りやすく、道具がシンプルで始めやすいメリットがあります。ルアー釣りはエサを買う手間がなく手が汚れにくく、ゲーム性が高いのが特徴です。初心者はまずエサ釣りで魚の引きを体験し、慣れてきたらルアー釣りに挑戦するのがおすすめです。",
  "釣り道具のメンテナンス方法は？":
    "毎回の釣行後に必ずメンテナンスしましょう。竿は真水で洗って乾燥、リールは真水でさっと洗い陰干し、仕掛けやルアーは真水で洗い針先をチェック。特に海釣りの場合、帰宅後すぐに水洗いする習慣をつけましょう。",
  "釣った魚はそのまま食べられる？":
    "適切に処理すれば美味しく食べられます。クーラーボックスでの鮮度管理、脳締めや血抜きなどの締め処理が重要です。刺身にする場合はアニサキスなどの寄生虫に注意。フグなど素人が調理してはいけない魚もあります。",
  "毒魚が釣れたらどうする？":
    "絶対に素手で触らないことが最重要です。プライヤーで針を外し、ゴンズイやオコゼの棘に刺されたら患部を熱いお湯（45度程度）に浸けます。フグのテトロドトキシンは致死性の猛毒なので絶対に食べないでください。",
  "リリースするときの注意点は？":
    "魚へのダメージを最小限にすることが大切です。プライヤーで素早く針を外し、手を濡らしてから魚を扱い、陸上に長時間放置せず、水面に優しくリリースしましょう。バーブレスフックを使うとリリースがスムーズです。",
  "小さい魚はリリースすべき？":
    "基本的に小さい魚はリリースするのがマナーです。アジ15cm以下、メバル・カサゴ15cm以下、クロダイ25cm以下、キス12cm以下がリリース推奨の目安です。食べきれる分だけキープしましょう。",
  "釣り場での最低限のマナーは？":
    "隣に入る時は一声かける、適切な間隔を保つ、ゴミは持ち帰る、コマセの汚れは洗い流す、駐車マナーを守る、騒がないことが基本です。マナーの悪さが釣り禁止の最大の原因です。",
  "ゴミはどうすればいい？":
    "すべてのゴミは持ち帰りが基本です。ゴミ袋を必ず持参し、糸クズや仕掛けも回収、コマセの汚れは洗い流し、余ったエサも持ち帰りましょう。来た時よりもきれいにが合言葉です。",
  "遊漁券って何？必要な場合は？":
    "遊漁券は河川や湖で釣りをする際に必要な許可証です。川・湖・ダム湖など淡水域での釣りに必要で、一般的な海釣りでは不要です。地元の釣具店、コンビニ、漁協事務所、オンラインで購入可能。遊漁券なしで釣りをすると密漁扱いになる場合があります。",
};

// FAQPage JSON-LD
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.flatMap((category) =>
    category.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faqAnswersPlainText[item.question] || item.question,
      },
    }))
  ),
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
      name: "よくある質問（FAQ）",
      item: "https://tsurispot.com/faq",
    },
  ],
};

export default function FAQPage() {
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
        <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "よくある質問" }]} />
        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100">
              <HelpCircle className="size-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              よくある質問（FAQ）
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            釣り初心者が抱えるギモンをカテゴリ別にわかりやすく解説します
          </p>
        </div>

        {/* カテゴリナビゲーション */}
        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          {faqData.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
            >
              {category.icon}
              {category.title}
            </a>
          ))}
        </nav>

        {/* FAQ セクション */}
        <div className="space-y-10">
          {faqData.map((category) => (
            <section key={category.id} id={category.id}>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                {category.icon}
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item, index) => (
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
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="border-t px-4 pb-4 pt-3">
                      <div className="flex gap-3">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">
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
            </section>
          ))}
        </div>

        {/* カテゴリ別FAQ */}
        <div className="mt-12 rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">カテゴリ別FAQ</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            もっと詳しいFAQをカテゴリごとにまとめています。
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/faq/season"
              className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">季節・時期別FAQ</p>
              <p className="mt-1 text-xs text-muted-foreground">
                サビキ釣りの時期・朝マヅメ・冬の釣り（9問）
              </p>
            </Link>
            <Link
              href="/faq/beginner"
              className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">初心者向けFAQ</p>
              <p className="mt-1 text-xs text-muted-foreground">
                必要な道具・予算・場所選び・始め方（9問）
              </p>
            </Link>
            <Link
              href="/faq/spot"
              className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">釣り場FAQ</p>
              <p className="mt-1 text-xs text-muted-foreground">
                堤防・漁港・管理釣り場のコツとマナー（7問）
              </p>
            </Link>
            <Link
              href="/faq/technique"
              className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">テクニックFAQ</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣れない時の対処法・タナ合わせ・コマセ（8問）
              </p>
            </Link>
          </div>
        </div>

        {/* 関連ページ */}
        <div className="mt-8 rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">もっと詳しく知りたい方へ</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/guide"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">釣りの始め方ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                初心者向けステップバイステップ解説
              </p>
            </Link>
            <Link
              href="/methods"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">釣り方・釣法ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                8つの釣法を徹底解説
              </p>
            </Link>
            <Link
              href="/fishing-rules"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">ルール・マナーガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣り場で守るべきルール
              </p>
            </Link>
            <Link
              href="/safety"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">釣りの安全ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                安全に釣りを楽しむための知識
              </p>
            </Link>
            <Link
              href="/beginner-checklist"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">持ち物チェックリスト</p>
              <p className="mt-1 text-xs text-muted-foreground">
                忘れ物を防止するリスト
              </p>
            </Link>
            <Link
              href="/spots"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">スポット一覧</p>
              <p className="mt-1 text-xs text-muted-foreground">
                全国の釣り場を検索
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
