import type { Metadata } from "next";
import Link from "next/link";
import { Target } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "釣りテクニックFAQ - 釣れない時の対処法・潮回り・タナ合わせ",
  description:
    "釣れない時の対処法、潮回りと釣果の関係、タナの合わせ方、コマセの撒き方など釣りテクニックに関する疑問をわかりやすく解説します。",
  openGraph: {
    title: "釣りテクニックFAQ - 釣れない時の対処法・潮回り・タナ合わせ",
    description:
      "釣りテクニックに関するFAQをまとめて解説。釣れない時の対処法から潮回りまで。",
    type: "website",
    url: "https://tsurispot.com/faq/technique",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/faq/technique",
  },
};

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  answerText: string;
}

const faqItems: FAQItem[] = [
  {
    question: "全然釣れない時はどうすればいい？",
    answerText:
      "釣れない時の対処法はいくつかあります。まずタナ（仕掛けの深さ）を変えてみましょう。魚は日によって浮いていたり底にいたりします。次にエサを変える（アオイソメからオキアミ、生エサから人工エサなど）、仕掛けを細くする（ハリスを1号から0.8号にするなど）、場所を移動する（5〜10m移動するだけで状況が変わることも）、時間帯を変える（潮が動くタイミングまで待つ）ことを試しましょう。それでも釣れない場合は、そもそも魚がいない可能性もあるので、場所替えを検討しましょう。",
    answer: (
      <>
        <p>
          釣れない時こそ対処法を試す楽しさがあります。以下を順番に試してみましょう。
        </p>
        <ol className="mt-2 space-y-2">
          <li>
            <strong>1. タナ（水深）を変える</strong>
            <p className="mt-0.5">魚は日によって浮いていたり底にいたりします。表層→中層→底層と探っていきましょう。サビキなら仕掛けを下ろす深さを1mずつ変えてみます。</p>
          </li>
          <li>
            <strong>2. エサを変える</strong>
            <p className="mt-0.5">アオイソメがダメならオキアミ、生エサがダメなら人工エサ（パワーイソメなど）に変更。エサのサイズを小さくするのも効果的です。</p>
          </li>
          <li>
            <strong>3. 仕掛けを細くする</strong>
            <p className="mt-0.5">ハリスを1号→0.8号に落とす、針のサイズを小さくするなど。魚が警戒している時に有効です。</p>
          </li>
          <li>
            <strong>4. 場所を移動する</strong>
            <p className="mt-0.5">5〜10m移動するだけで状況が変わることも。堤防の内側と外側で試したり、先端に移動してみましょう。</p>
          </li>
          <li>
            <strong>5. 時間帯を待つ</strong>
            <p className="mt-0.5">潮が動くタイミング（満潮・干潮の前後2時間）やマヅメ時を待つのも手です。</p>
          </li>
        </ol>
        <p className="mt-2">
          それでも釣れない場合は、そもそも魚がいない可能性があります。周りの釣り人に状況を聞いてみるのも良いでしょう。
        </p>
        <p className="mt-2">
          釣り方の詳細は
          <Link href="/methods" className="font-medium text-primary hover:underline">釣り方ガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "タナ（棚）の合わせ方がわからない",
    answerText:
      "タナとは仕掛けを入れる水深のことです。タナの合わせ方は魚種によって異なります。アジ・サバ（サビキ）は中層〜底付近を探ります。まず底まで落として少しずつ上げていくのが基本。グレ・メジナ（ウキ釣り）は表層〜中層。ウキ下を調整して探ります。カサゴ・メバル（穴釣り・根魚釣り）は底がメイン。キス（投げ釣り）は海底ベタ底。タナが合っていないと魚の目の前にエサが届かないので、釣れない時は真っ先にタナを疑いましょう。",
    answer: (
      <>
        <p>
          <strong>タナ（棚）とは仕掛けを入れる水深</strong>のことです。タナが合っていないと魚の目の前にエサが届きません。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">魚種別のタナの目安：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>アジ・サバ（サビキ）</strong>：中層〜底付近。まず底まで落として少し巻き上げる</li>
            <li>・<strong>グレ・メジナ（ウキ釣り）</strong>：表層〜中層。ウキ下を調整して探る</li>
            <li>・<strong>カサゴ・メバル</strong>：底がメイン。底にしっかり仕掛けを付ける</li>
            <li>・<strong>キス（投げ釣り）</strong>：海底ベタ底。底をズルズル引く</li>
            <li>・<strong>タチウオ</strong>：中層〜表層。時間帯によって変動大</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">タナの合わせ方のコツ：</p>
          <ol className="mt-1 space-y-0.5 list-decimal list-inside">
            <li>まず底を取る（仕掛けが底に着いたら糸が弛む）</li>
            <li>底から少しずつ巻き上げながら各層を探る</li>
            <li>アタリがあった層を覚えて、その深さに仕掛けを固定</li>
            <li>釣れなくなったらまた探り直す</li>
          </ol>
        </div>
        <p className="mt-2">
          <strong>サビキ釣りのコツ</strong>
          ：コマセカゴの位置とサビキ針が同じ層にくるように調整しましょう。コマセの煙幕の中にサビキ針があるのがベストです。
        </p>
        <p className="mt-2">
          釣り方ごとの詳しい解説は
          <Link href="/methods" className="font-medium text-primary hover:underline">釣り方ガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "コマセ（撒き餌）の効果的な撒き方は？",
    answerText:
      "コマセの効果的な撒き方にはいくつかのポイントがあります。少量をこまめに撒くのが基本で、一度に大量に撒くとすぐにエサが沈んで効果が薄れます。サビキ釣りではカゴに7〜8分目に詰め、竿を2〜3回シャクって撒きます。ウキ釣りでは柄杓（ひしゃく）を使い、仕掛けの少し上流に投入。コマセの煙幕の中に付けエサが入るよう狙います。潮の流れを計算して、仕掛けの位置にコマセが流れ着くように撒くのがポイントです。最初は多めに撒いて魚を寄せ、釣れ始めたら少量で維持しましょう。",
    answer: (
      <>
        <p>
          コマセ（撒き餌）は魚を寄せるための重要なテクニックです。効果的な撒き方をマスターしましょう。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">サビキ釣りのコマセ：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・カゴにアミエビを<strong>7〜8分目</strong>に詰める（詰めすぎると出にくい）</li>
            <li>・竿を2〜3回シャクって（上下に振って）コマセを出す</li>
            <li>・コマセが出たら竿を動かさずアタリを待つ</li>
            <li>・コマセが切れたらすぐに詰め直す（途切れさせない）</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">ウキ釣り・フカセ釣りのコマセ：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・柄杓（ひしゃく）を使って投入</li>
            <li>・仕掛けの<strong>少し上流（潮上）</strong>に撒く</li>
            <li>・コマセの煙幕の中に付けエサが入るように潮を読む</li>
            <li>・少量をテンポよく撒き続ける（1〜2分に1回程度）</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">コマセの基本テクニック：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>最初は多めに撒いて魚を寄せる</strong>（開始15分は通常の倍量）</li>
            <li>・釣れ始めたら少量で維持</li>
            <li>・潮の流れを計算して投入点を決める</li>
            <li>・コマセと仕掛けの<strong>同調</strong>が最重要</li>
          </ul>
        </div>
        <p className="mt-2">
          コマセを使う釣り方の詳細は
          <Link href="/guide/sabiki" className="font-medium text-primary hover:underline">サビキ釣りガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "アタリがわからない。どうやって判断する？",
    answerText:
      "アタリ（魚が食いついた時の信号）は釣り方によって異なります。サビキ釣りでは竿先がブルブルと震えます。小さい魚は「ピクピク」、大きい魚は「ガツン」と引き込まれます。ウキ釣りではウキが沈む・横に走る・ピクピク動くのがアタリ。投げ釣りでは竿先がグーッと引き込まれます。ルアー釣りでは「コツッ」「グンッ」という手元に伝わる感触。初心者は最初アタリがわかりにくいですが、経験を積むとすぐにわかるようになります。迷ったら竿を上げてみましょう。",
    answer: (
      <>
        <p>
          アタリ（魚が食いついた時の信号）は釣り方によって感じ方が異なります。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">釣り方別のアタリの出方：</p>
          <ul className="mt-1 space-y-1">
            <li>
              <strong>サビキ釣り</strong>
              <ul className="ml-4 mt-0.5 space-y-0.5">
                <li>・竿先がブルブルと震える</li>
                <li>・小さい魚：「ピクピク」と細かい振動</li>
                <li>・大きい魚：「ガツン」と引き込まれる</li>
              </ul>
            </li>
            <li>
              <strong>ウキ釣り</strong>
              <ul className="ml-4 mt-0.5 space-y-0.5">
                <li>・ウキが「スッ」と沈む（本アタリ）</li>
                <li>・ウキが横に走る</li>
                <li>・ウキがピクピクと小さく動く（前アタリ）</li>
              </ul>
            </li>
            <li>
              <strong>投げ釣り</strong>
              <ul className="ml-4 mt-0.5 space-y-0.5">
                <li>・竿先がグーッと引き込まれる</li>
                <li>・竿先がチョンチョンと動く（小さい魚の場合）</li>
              </ul>
            </li>
            <li>
              <strong>ルアー釣り</strong>
              <ul className="ml-4 mt-0.5 space-y-0.5">
                <li>・「コツッ」「ゴンッ」と手元に伝わる感触</li>
                <li>・リールを巻く重さが急に変わる</li>
                <li>・ラインが急に弛む（食い上げ）</li>
              </ul>
            </li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">アワセ（合わせ）のコツ：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・サビキ釣り：アワセ不要。そのままリールを巻く</li>
            <li>・ウキ釣り：ウキが沈んだら竿を立てて合わせる</li>
            <li>・投げ釣り：竿先が引き込まれたらゆっくり竿を立てる</li>
            <li>・ルアー：即座にロッドを立ててフッキング</li>
          </ul>
        </div>
        <p className="mt-2">
          迷ったらとりあえず竿を上げてみましょう。経験を積めばすぐにわかるようになります。
        </p>
      </>
    ),
  },
  {
    question: "根掛かりした時の対処法は？",
    answerText:
      "根掛かり（仕掛けが海底の岩やゴミに引っかかること）した時は、まず焦らないでください。まっすぐ引っ張ると余計に食い込みます。対処法は、(1)糸を少し緩めて待つ（波や潮で自然に外れることがある）、(2)竿を左右に動かして角度を変えて引く、(3)糸をピンと張ってから弾くようにはじく、(4)立ち位置を変えて別の角度から引く。それでも外れない場合は、糸を手にタオルを巻いてまっすぐ引いて切ります。竿やリールに無理な力をかけると破損するので注意。",
    answer: (
      <>
        <p>
          根掛かり（仕掛けが海底の岩やゴミに引っかかること）は釣りにつきものです。焦らず対処しましょう。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">外し方（順番に試す）：</p>
          <ol className="mt-1 space-y-1 list-decimal list-inside">
            <li><strong>糸を緩めて待つ</strong>：波や潮の力で自然に外れることがある。30秒〜1分ほど待ってみる</li>
            <li><strong>角度を変えて引く</strong>：竿を左右に動かして、引っかかった角度とは違う方向から引く</li>
            <li><strong>糸を弾く</strong>：糸をピンと張った状態から「パチン」と弾くように放す。振動で外れることがある</li>
            <li><strong>立ち位置を変える</strong>：横に5〜10m移動して別角度から引く</li>
          </ol>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">外れない場合：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>手にタオルを巻いて糸をまっすぐ引いて切る</strong>（素手だと手が切れる）</li>
            <li>・竿やリールに無理な力をかけない（破損の原因）</li>
            <li>・竿を持ったまま引っ張らず、糸を直接持って引く</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">根掛かりを防ぐには：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・底の地形を事前に確認（砂地は根掛かりしにくい）</li>
            <li>・中通しオモリや根掛かりしにくい仕掛けを使う</li>
            <li>・底を引きずらず、仕掛けを浮かせ気味にする</li>
          </ul>
        </div>
        <p className="mt-2">
          仕掛けの選び方は
          <Link href="/guide/rigs" className="font-medium text-primary hover:underline">仕掛けガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "釣り糸の結び方が覚えられない",
    answerText:
      "釣りの結び方は最初は難しく感じますが、まず3つだけ覚えれば十分です。(1)ユニノット：最も汎用性が高い基本の結び。針やサルカンに糸を結ぶ時に使う。(2)電車結び：2本の糸を繋ぐ結び方。道糸とハリスを結ぶ時に使用。(3)クリンチノット：サルカンやスナップに結ぶ簡単な結び方。まずはユニノットを完璧にすれば、ほとんどの場面で対応できます。YouTube動画で見ながら練習するのがおすすめです。",
    answer: (
      <>
        <p>
          結び方は最初は難しく感じますが、<strong>まず3つだけ覚えれば十分</strong>です。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">まず覚えるべき3つの結び方：</p>
          <ol className="mt-1 space-y-2 list-decimal list-inside">
            <li>
              <strong>ユニノット</strong>（最重要）
              <p className="ml-5 mt-0.5">最も汎用性が高い基本の結び。針・サルカン・スナップなど何にでも使える。これさえ覚えればほとんどの場面で対応可能。</p>
            </li>
            <li>
              <strong>電車結び</strong>
              <p className="ml-5 mt-0.5">2本の糸を繋ぐ結び方。道糸とハリスを結ぶ時に使用。ユニノットの応用なので覚えやすい。</p>
            </li>
            <li>
              <strong>クリンチノット</strong>
              <p className="ml-5 mt-0.5">サルカンやスナップに結ぶ簡単な結び方。ユニノットが難しい場合はこちらから始めてもOK。</p>
            </li>
          </ol>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">上達のコツ：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・太めの紐で練習すると構造がわかりやすい</li>
            <li>・結ぶ前に必ず糸を濡らす（摩擦熱で糸が弱るのを防ぐ）</li>
            <li>・締め込みはゆっくり確実に</li>
            <li>・釣り場に行く前に自宅で10回練習</li>
          </ul>
        </div>
        <p className="mt-2">
          結び方の詳しい図解は
          <Link href="/guide/knots" className="font-medium text-primary hover:underline">結び方ガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "ボウズ（釣果ゼロ）を回避するコツは？",
    answerText:
      "ボウズ（坊主＝釣果ゼロ）を回避するにはいくつかの方法があります。まず魚がいる場所・時間に行くこと。朝マヅメ・夕マヅメの時間帯、潮が動くタイミングを狙いましょう。次に情報収集。地元の釣具店や釣り情報サイトで最近の釣果を確認してから行きましょう。釣り方はサビキ釣りが最もボウズになりにくいです。複数の仕掛けを持っていき、ダメなら釣法を変えるのも有効。最後の手段として、管理釣り場に行けば確実に魚が釣れます。",
    answer: (
      <>
        <p>
          ボウズ（坊主＝釣果ゼロ）は誰でも経験しますが、以下の対策で確率を下げられます。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">事前準備：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>情報収集</strong>：地元の釣具店や釣果情報サイトで最近の状況を確認</li>
            <li>・<strong>時間帯</strong>：朝マヅメ・夕マヅメを狙う</li>
            <li>・<strong>潮回り</strong>：大潮〜中潮の潮が動く時間帯がベスト</li>
            <li>・<strong>複数の仕掛け</strong>：サビキ、ちょい投げ、穴釣りなど複数用意</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">釣り場で実践すること：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>サビキ釣り</strong>から始める（最もボウズになりにくい）</li>
            <li>・釣れなかったら<strong>釣法を変える</strong>（サビキ→穴釣りなど）</li>
            <li>・<strong>場所を移動する</strong>（粘りすぎない）</li>
            <li>・周りの釣り人の状況を観察して真似る</li>
            <li>・<strong>タナを頻繁に変えて探る</strong></li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">確実に釣りたい場合：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>管理釣り場・海上釣り堀</strong>に行く（放流魚が確実にいる）</li>
            <li>・穴釣り（テトラの隙間にブラクリを落とす）も高確率</li>
          </ul>
        </div>
        <p className="mt-2">
          ボウズ回避に役立つ情報は
          <Link href="/bouzu-checker" className="font-medium text-primary hover:underline">ボウズ回避チェッカー</Link>
          もお試しください。
        </p>
      </>
    ),
  },
  {
    question: "投げ釣りで飛距離を出すコツは？",
    answerText:
      "投げ釣りで飛距離を出すコツは、正しいフォームの習得が最も重要です。竿を頭の後ろに構え、オモリの重さで竿を曲げ、その反発力で投げます。ポイントは、(1)竿の長さ分のたらし（仕掛けを垂らす長さ）を取る、(2)利き手と反対の手で竿尻を引く、(3)リリースポイント（指を離すタイミング）は45度より少し手前、(4)投げた後は竿先を海面に向けて糸の放出を助ける。道具面では、PEラインは細くて飛距離が出やすいです。",
    answer: (
      <>
        <p>
          投げ釣りの飛距離アップには<strong>正しいフォーム</strong>が最も重要です。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">基本フォーム（オーバースロー）：</p>
          <ol className="mt-1 space-y-0.5 list-decimal list-inside">
            <li><strong>たらし</strong>を竿の長さの半分〜同じくらい取る</li>
            <li>竿を頭の後ろに構え、オモリの重さで竿をしならせる</li>
            <li>利き手で竿を押し出し、反対の手で竿尻を<strong>引く</strong>（てこの原理）</li>
            <li>リリースポイントは<strong>45度より少し手前</strong>で指を離す</li>
            <li>投げた後は竿先を海面に向けて糸の放出を助ける</li>
          </ol>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">飛距離アップのポイント：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>力まない</strong>：力任せに投げるとフォームが崩れる。7割の力でスムーズに</li>
            <li>・<strong>タイミング</strong>：リリースが早すぎると上に飛び、遅すぎると手前に落ちる</li>
            <li>・<strong>PEライン</strong>：ナイロンより細いため飛距離が出やすい</li>
            <li>・<strong>オモリの重さ</strong>：竿の適合重量範囲で重めを使う</li>
            <li>・<strong>向かい風を避ける</strong>：追い風のポイントを選ぶ</li>
          </ul>
        </div>
        <p className="mt-2">
          最初は50m飛べば十分です。練習を重ねれば100m以上も可能になります。投げ釣りの詳細は
          <Link href="/guide/casting" className="font-medium text-primary hover:underline">キャスティングガイド</Link>
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
      name: "テクニックFAQ",
      item: "https://tsurispot.com/faq/technique",
    },
  ],
};

export default function FAQTechniquePage() {
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
            { label: "テクニックFAQ" },
          ]}
        />
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
              <Target className="size-5 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              釣りテクニックFAQ
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            釣れない時の対処法、タナ合わせ、コマセの撒き方などの疑問を解決
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
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
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
            <Link href="/faq/spot" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">釣り場FAQ</p>
              <p className="mt-1 text-xs text-muted-foreground">堤防・漁港・管理釣り場</p>
            </Link>
            <Link href="/methods" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">釣り方・釣法ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">各釣法を詳しく解説</p>
            </Link>
            <Link href="/guide/knots" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">結び方ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">基本の結び方を図解</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
