import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "釣り初心者FAQ - 必要な道具・予算・場所選び・始め方",
  description:
    "釣り初心者が知りたい道具の揃え方、予算の目安、おすすめの釣り場、サビキ釣りのやり方、エサの種類など基本的な疑問にわかりやすく回答します。",
  openGraph: {
    title: "釣り初心者FAQ - 必要な道具・予算・場所選び・始め方",
    description:
      "釣り初心者が知りたい基本的な疑問にわかりやすく回答。道具、予算、場所選びまで。",
    type: "website",
    url: "https://tsurispot.com/faq/beginner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/faq/beginner",
  },
};

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  answerText: string;
}

const faqItems: FAQItem[] = [
  {
    question: "釣りを始めるのに必要な予算は？",
    answerText:
      "最低限の道具を揃えるなら5,000〜10,000円程度で始められます。サビキ釣りセット（竿・リール・仕掛け付き）が3,000〜5,000円、エサ（アミコマセ）が300〜500円、クーラーボックスが1,000〜2,000円程度です。レンタルタックルを利用できる海釣り公園なら、手ぶらで2,000〜3,000円程度から体験可能です。最初から高い道具を買う必要はなく、まずはエントリーモデルで十分です。",
    answer: (
      <>
        <p>
          最低限の道具を揃えるなら<strong>5,000〜10,000円</strong>程度で始められます。
        </p>
        <ul className="mt-2 space-y-1">
          <li>・<strong>サビキ釣りセット</strong>（竿・リール・仕掛け付き）：3,000〜5,000円</li>
          <li>・<strong>エサ</strong>（アミコマセ）：300〜500円</li>
          <li>・<strong>クーラーボックス</strong>：1,000〜2,000円（発泡スチロールでもOK）</li>
          <li>・<strong>バケツ</strong>：100〜500円</li>
          <li>・<strong>タオル・ゴミ袋</strong>：家にあるものでOK</li>
        </ul>
        <p className="mt-2">
          <strong>レンタルタックルを利用できる海釣り公園</strong>
          なら、手ぶらで2,000〜3,000円程度から体験できます。まず体験して、続けたいと思ってから道具を購入するのも賢い方法です。
        </p>
        <p className="mt-2">
          最初から高い道具を買う必要はありません。エントリーモデルで十分釣りを楽しめます。
        </p>
        <p className="mt-2">
          持ち物の詳細は
          <Link href="/beginner-checklist" className="font-medium text-primary hover:underline">持ち物チェックリスト</Link>
          を参考にしてください。
        </p>
      </>
    ),
  },
  {
    question: "初心者におすすめの釣り場はどこ？",
    answerText:
      "初心者には海釣り公園がベストです。柵・トイレ・売店が完備され、レンタルタックルもあるため手ぶらで行けます。次におすすめなのは整備された漁港の堤防。足場が良く、駐車場やトイレが近くにある場所を選びましょう。管理釣り場も初心者向きで、放流された魚が確実に釣れます。共通して重要なのは、足場が良い・トイレがある・駐車場が近い・釣り禁止でないことです。",
    answer: (
      <>
        <p>
          初心者には以下のような釣り場がおすすめです。安全性と利便性を重視して選びましょう。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">1. 海釣り公園（最もおすすめ）：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・柵・トイレ・売店が完備で安全</li>
            <li>・レンタルタックルがあるため手ぶらでOK</li>
            <li>・スタッフに釣り方を教えてもらえることも</li>
            <li>・入場料1,000〜2,000円程度</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">2. 整備された漁港・堤防：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・足場が良く、比較的安全</li>
            <li>・無料で利用できる場所が多い</li>
            <li>・駐車場やトイレが近くにある場所を選ぶ</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">3. 管理釣り場：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・放流された魚が確実に釣れる</li>
            <li>・道具のレンタルもあることが多い</li>
            <li>・家族連れに特におすすめ</li>
          </ul>
        </div>
        <p className="mt-2">
          お近くの釣り場は
          <Link href="/spots" className="font-medium text-primary hover:underline">スポット検索</Link>
          で探せます。
        </p>
      </>
    ),
  },
  {
    question: "サビキ釣りのやり方を教えて",
    answerText:
      "サビキ釣りの手順は、(1)竿にリール・仕掛けをセットする、(2)コマセカゴにアミエビを詰める、(3)足元の海面に仕掛けを下ろす、(4)竿を2〜3回上下させてコマセを撒く、(5)アタリ（ブルブルという振動）を待つ、(6)アタリがあったら竿を上げて魚を取り込む、です。コマセを撒いて魚を寄せ、サビキ針（疑似餌）にエサと間違えて食いつかせる釣法です。群れが来れば一度に何匹も釣れることもあります。",
    answer: (
      <>
        <p>
          サビキ釣りは初心者が最も始めやすい釣り方です。手順を紹介します。
        </p>
        <ol className="mt-2 space-y-2">
          <li><strong>1. 準備</strong>：竿にリールをセット。糸をガイドに通し、サビキ仕掛けを結ぶ。一番下にコマセカゴ（またはオモリ付きカゴ）を付ける</li>
          <li><strong>2. コマセを詰める</strong>：カゴにアミエビ（コマセ）を7〜8分目まで詰める。ぎゅうぎゅうに詰めすぎると出にくいので注意</li>
          <li><strong>3. 仕掛けを下ろす</strong>：堤防の足元にまっすぐ仕掛けを下ろす。水深の半分くらいが目安</li>
          <li><strong>4. コマセを撒く</strong>：竿を2〜3回上下に振り、コマセを海中に撒く。サビキ針の周囲にコマセの煙幕を作るイメージ</li>
          <li><strong>5. アタリを待つ</strong>：竿先に「ブルブル」という振動（アタリ）が来るのを待つ。数秒〜数分で来ることが多い</li>
          <li><strong>6. 取り込み</strong>：アタリが来たら竿を立ててリールを巻く。追い食い（複数匹掛かる）を待ってもOK</li>
        </ol>
        <p className="mt-2">
          コツは、コマセが切れたらすぐに補充すること、魚がいるタナ（水深）を探って合わせることです。
        </p>
        <p className="mt-2">
          より詳しい解説は
          <Link href="/guide/sabiki" className="font-medium text-primary hover:underline">サビキ釣りガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "釣り竿の選び方がわからない",
    answerText:
      "初心者は万能竿（磯竿2〜3号、長さ2.5〜3.6m）がおすすめです。サビキ・ちょい投げ・ウキ釣りなど複数の釣法に対応できます。リールはスピニングリール2500〜3000番を合わせましょう。予算は竿とリールのセットで5,000〜10,000円。シマノやダイワのエントリーモデルが品質と価格のバランスが良いです。最初から専用竿を買うのは避け、やりたい釣法が決まってから専用タックルに移行しましょう。",
    answer: (
      <>
        <p>
          初心者は<strong>万能竿</strong>を1本持っておけば、ほとんどの釣りに対応できます。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">初心者向けの竿の選び方：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>種類</strong>：磯竿2〜3号（万能竿）が最適</li>
            <li>・<strong>長さ</strong>：2.5〜3.6m（堤防釣りに最適な長さ）</li>
            <li>・<strong>素材</strong>：カーボン製が軽くて扱いやすい</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">リールの選び方：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>種類</strong>：スピニングリール（初心者は必ずスピニング）</li>
            <li>・<strong>番手</strong>：2500〜3000番（万能サイズ）</li>
            <li>・<strong>糸付きリール</strong>：最初から糸が巻いてあるモデルが楽</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">予算の目安：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・竿+リールセット：5,000〜10,000円</li>
            <li>・シマノ、ダイワのエントリーモデルが品質と価格のバランスが良い</li>
          </ul>
        </div>
        <p className="mt-2">
          やりたい釣法が決まってから専用タックルに移行するのが賢い買い方です。詳しくは
          <Link href="/guide/setup" className="font-medium text-primary hover:underline">タックル準備ガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "釣りのエサにはどんな種類がある？",
    answerText:
      "釣りエサは大きく分けて生きエサ、死にエサ、人工エサの3種類があります。生きエサはアオイソメ（万能エサ、ほぼ全ての魚に有効）、モエビ（メバルやカサゴに）、活きアジ（泳がせ釣りに）など。死にエサはオキアミ（フカセ釣りの定番）、アミエビ（サビキのコマセ）、切り身（サンマやサバを切ったもの）など。人工エサはパワーイソメ（イソメの形をした人工エサ）やコーン、練りエサなど。初心者にはアオイソメとアミエビがあれば十分です。",
    answer: (
      <>
        <p>
          釣りエサは大きく分けて<strong>3種類</strong>あります。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">1. 生きエサ（活きエサ）：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>アオイソメ</strong>：万能エサ。ほぼ全ての魚に有効。初心者の第一選択</li>
            <li>・<strong>ゴカイ</strong>：キスやハゼに特に有効。イソメより細くて小さい</li>
            <li>・<strong>モエビ</strong>：メバルやカサゴなど根魚に効果的</li>
            <li>・<strong>活きアジ</strong>：泳がせ釣りでヒラメやブリを狙うとき</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">2. 死にエサ・冷凍エサ：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>オキアミ</strong>：フカセ釣りの定番。付けエサ・コマセ両方に使える</li>
            <li>・<strong>アミエビ</strong>：サビキ釣りのコマセとして必須</li>
            <li>・<strong>切り身</strong>：サンマやサバを切ったもの。穴釣りや投げ釣りに</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">3. 人工エサ・ルアー：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>パワーイソメ</strong>：イソメ型の人工エサ。虫が苦手な方に</li>
            <li>・<strong>ワーム</strong>：ルアー釣り用の柔らかいプラスチック製</li>
            <li>・<strong>練りエサ</strong>：コイやヘラブナ釣りに使用</li>
          </ul>
        </div>
        <p className="mt-2">
          初心者は<strong>アオイソメ + アミエビ（コマセ用）</strong>があれば、サビキ釣りもちょい投げも楽しめます。
        </p>
        <p className="mt-2">
          釣り方ごとのエサ情報は
          <Link href="/methods" className="font-medium text-primary hover:underline">釣り方ガイド</Link>
          で確認できます。
        </p>
      </>
    ),
  },
  {
    question: "子供と一緒に釣りに行くときの注意点は？",
    answerText:
      "子供との釣りではまず安全が最優先です。ライフジャケット（子供用サイズ）を必ず着用させ、柵のある海釣り公園や管理釣り場を選びましょう。針に注意し、返しのない針やサビキ仕掛けを使うと安全です。日焼け止め・帽子・飲み物を十分に用意し、長時間は避けて2〜3時間で切り上げましょう。サビキ釣りは子供でも簡単に釣れるのでおすすめです。退屈しないよう、おやつや遊び道具も用意しておくと安心です。",
    answer: (
      <>
        <p>
          子供との釣りでは<strong>安全が最優先</strong>です。以下の点に注意しましょう。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">安全対策：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>ライフジャケット必須</strong>：子供用サイズを着用。大人用はNG</li>
            <li>・<strong>柵のある釣り場</strong>：海釣り公園や管理釣り場がベスト</li>
            <li>・<strong>針に注意</strong>：返しのない針（バーブレス）やサビキ仕掛けが安全</li>
            <li>・常に目を離さない。特に水辺では手をつないでおく</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">快適に楽しむコツ：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>短時間</strong>：2〜3時間で切り上げる。飽きる前に終了が鉄則</li>
            <li>・<strong>日焼け対策</strong>：帽子・日焼け止め・長袖</li>
            <li>・<strong>飲み物・おやつ</strong>：十分に用意</li>
            <li>・<strong>釣り方</strong>：サビキ釣りが最適。簡単に釣れるので飽きにくい</li>
            <li>・<strong>遊び道具</strong>：釣れない時間用にバケツで水遊び、カニ探しなど</li>
          </ul>
        </div>
        <p className="mt-2">
          ファミリー向けの釣り場は
          <Link href="/spots" className="font-medium text-primary hover:underline">スポット検索</Link>
          でトイレ・駐車場ありの条件で探せます。安全情報は
          <Link href="/safety" className="font-medium text-primary hover:underline">安全ガイド</Link>
          もご確認ください。
        </p>
      </>
    ),
  },
  {
    question: "釣りに免許や資格は必要？",
    answerText:
      "一般的な海釣り（堤防・サーフ・磯など）では免許や資格は不要で、誰でも自由に釣りができます。ただし、川や湖で釣りをする場合は遊漁券が必要な場合があります。また、船釣りでは遊漁船の船長が資格を持っているため、乗客は不要です。自分のボートで釣りをする場合は小型船舶操縦士の免許が必要になります。一部の魚種には漁業権が設定されており、アワビ・サザエ・伊勢海老などを採捕すると密漁になるので注意してください。",
    answer: (
      <>
        <p>
          一般的な海釣り（堤防・サーフ・磯など）では<strong>免許や資格は不要</strong>で、誰でも自由に楽しめます。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">免許・許可が不要な場合：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・堤防、漁港、海釣り公園での釣り</li>
            <li>・サーフ（砂浜）からの投げ釣り</li>
            <li>・遊漁船での船釣り（船長が資格を持っている）</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">許可・券が必要な場合：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>川・湖での釣り</strong>：遊漁券が必要（漁協が管理する水域）</li>
            <li>・<strong>自分のボートで釣り</strong>：小型船舶操縦士免許が必要</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">注意すべき禁止事項：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>漁業権対象の水産物</strong>：アワビ・サザエ・伊勢海老・ナマコなどは採捕禁止（密漁扱い）</li>
            <li>・<strong>禁漁期間・禁漁区域</strong>：地域によって特定の魚種に設定あり</li>
            <li>・<strong>釣り禁止区域</strong>：看板で確認</li>
          </ul>
        </div>
        <p className="mt-2">
          詳しいルールは
          <Link href="/fishing-rules" className="font-medium text-primary hover:underline">釣りのルール・マナーガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "釣り糸（ライン）の選び方は？",
    answerText:
      "釣り糸には主にナイロンライン、フロロカーボンライン、PEラインの3種類があります。初心者にはナイロンライン3号が最もおすすめです。しなやかでトラブルが少なく、万能に使えます。フロロカーボンは水中で目立ちにくく根ズレに強いのでハリス（針に結ぶ糸）に最適。PEラインは細くて強度が高いですがしなやかでライントラブルが起きやすく、初心者には扱いが難しいです。まずはナイロンラインで始めて、慣れてきたらPEに移行しましょう。",
    answer: (
      <>
        <p>
          釣り糸（ライン）は<strong>3種類</strong>あり、それぞれ特徴が異なります。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">1. ナイロンライン（初心者はまずこれ）：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・しなやかでトラブルが少ない</li>
            <li>・伸びがあるのでアタリを弾きにくい</li>
            <li>・価格が安い</li>
            <li>・<strong>おすすめ号数：3号</strong>（万能サイズ）</li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">2. フロロカーボンライン：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・水中で目立ちにくい（屈折率が水に近い）</li>
            <li>・根ズレ（岩などとの擦れ）に強い</li>
            <li>・<strong>ハリス（針に結ぶ糸）に最適</strong></li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">3. PEライン：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・細くて強度が高い</li>
            <li>・感度が良くアタリがわかりやすい</li>
            <li>・伸びが少ない</li>
            <li>・ライントラブルが起きやすく初心者には注意</li>
          </ul>
        </div>
        <p className="mt-2">
          初心者は<strong>ナイロンライン3号</strong>
          から始めて、慣れてきたらPEラインに移行するのがおすすめです。ラインの結び方は
          <Link href="/guide/knots" className="font-medium text-primary hover:underline">結び方ガイド</Link>
          をご覧ください。
        </p>
      </>
    ),
  },
  {
    question: "釣った魚の持ち帰り方は？",
    answerText:
      "釣った魚を美味しく持ち帰るには鮮度管理が重要です。まずクーラーボックスに氷を入れておき、釣れたらすぐに入れます。理想は海水氷（海水に氷を入れたもの）に漬ける方法で、魚体が均一に冷えます。大きい魚は脳締め（目の後ろを刺す）と血抜き（エラの付け根を切る）をすると格段に美味しくなります。氷が直接魚に触れると身が白くなる（氷焼け）ので、ビニール袋に入れてから氷に当てるのもコツです。",
    answer: (
      <>
        <p>
          釣った魚を美味しく持ち帰るには<strong>鮮度管理</strong>が最も重要です。
        </p>
        <div className="mt-2">
          <p className="font-medium text-foreground">基本の持ち帰り手順：</p>
          <ol className="mt-1 space-y-0.5 list-decimal list-inside">
            <li><strong>クーラーボックス</strong>に氷を十分に入れておく</li>
            <li>釣れたらすぐにクーラーボックスへ入れる</li>
            <li>海水氷（海水+氷）に漬けるのが最も効果的</li>
            <li>直射日光を避け、蓋をしっかり閉める</li>
          </ol>
        </div>
        <div className="mt-2">
          <p className="font-medium text-foreground">より美味しく持ち帰るコツ：</p>
          <ul className="mt-1 space-y-0.5">
            <li>・<strong>脳締め</strong>：目の後ろ（こめかみ辺り）をナイフで刺す。魚が暴れなくなる</li>
            <li>・<strong>血抜き</strong>：エラの付け根を切って海水バケツに入れる。身が白く締まる</li>
            <li>・<strong>氷焼け防止</strong>：魚をビニール袋に入れてから氷に当てる</li>
          </ul>
        </div>
        <p className="mt-2">
          帰宅したらなるべく早く下処理（ウロコ取り・内臓除去）をしましょう。魚の処理方法は
          <Link href="/guide/fish-handling" className="font-medium text-primary hover:underline">魚の処理ガイド</Link>
          で詳しく解説しています。
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
      name: "初心者向けFAQ",
      item: "https://tsurispot.com/faq/beginner",
    },
  ],
};

export default function FAQBeginnerPage() {
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
            { label: "初心者向けFAQ" },
          ]}
        />
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100">
              <GraduationCap className="size-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              釣り初心者FAQ
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            道具・予算・場所選び・始め方など初心者の疑問をすべて解決
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
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
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
            <Link href="/faq/season" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">季節・時期別FAQ</p>
              <p className="mt-1 text-xs text-muted-foreground">ベストシーズン・朝マヅメ</p>
            </Link>
            <Link href="/guide" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">釣りの始め方ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">ステップバイステップ解説</p>
            </Link>
            <Link href="/beginner-checklist" className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
              <p className="font-semibold">持ち物チェックリスト</p>
              <p className="mt-1 text-xs text-muted-foreground">忘れ物を防ぐリスト</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
