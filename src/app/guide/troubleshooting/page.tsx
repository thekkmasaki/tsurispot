import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  ChevronRight,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TroubleCard } from "./trouble-card";
import type { TroubleSection } from "./trouble-card";

/* ──────────── メタデータ ──────────── */

export const metadata: Metadata = {
  title: "釣りのトラブルシューティング｜よくある問題と解決法｜ツリスポ",
  description:
    "釣りの最中に起こるトラブルの対処法を完全解説。糸絡み・根がかり・魚が釣れない・仕掛けが飛ばない・針が外れない・強風対策・エサ取り・リールトラブル・魚の締め方・天候急変など10の問題と解決策をステップバイステップで紹介。",
  openGraph: {
    title: "釣りのトラブルシューティング｜よくある問題と解決法｜ツリスポ",
    description:
      "釣り場で困ったときの対処法10選。糸絡み、根がかり、魚が釣れない等、よくあるトラブルの解決策を初心者向けにわかりやすく解説。",
    type: "article",
    url: "https://tsurispot.com/guide/troubleshooting",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/troubleshooting",
  },
};

/* ──────────── トラブルデータ（10項目） ──────────── */

const troubleSections: TroubleSection[] = [
  {
    id: "line-trouble",
    iconName: "waves",
    title: "糸が絡まった（ライントラブル）",
    subtitle:
      "バックラッシュやPEラインの絡みなど、最も頻繁に起こるトラブルです。落ち着いて対処すれば解決できます。",
    badge: {
      label: "よくある",
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    tips: [
      {
        title: "Step 1: まず引っ張らない",
        description:
          "糸が絡まったとき、焦って強く引っ張ると結び目がきつくなり、ますますほどけなくなります。まずリールのベールを起こして糸にテンションがかからない状態にしましょう。",
      },
      {
        title: "Step 2: バックラッシュをほぐす",
        description:
          "スプールから糸を少しずつ引き出し、輪になっている部分を見つけます。輪を一つずつ丁寧にほぐしていきます。ペンの先や針先で輪をつまむと作業しやすいです。全体を一気に直そうとせず、1つずつ解いていくのがコツです。",
      },
      {
        title: "Step 3: PEラインの絡み対処",
        description:
          "PEラインはコシがなく絡みやすい素材です。絡んだ場合はナイロンライン以上に慎重にほぐしましょう。PEは摩擦に弱いため、無理に引くと毛羽立ちが生じて強度が大幅に落ちます。ほぐした後は傷がないか指で確認してください。",
      },
      {
        title: "Step 4: 5分で解けなければ切る判断を",
        description:
          "5分以上ほぐしても解けない場合は、思い切ってハサミで絡んだ部分を切りましょう。切った後は電車結びやFGノットで結び直せます。現場で時間を浪費するより、切って結び直した方が効率的です。",
      },
    ],
    preventionTips: [
      "キャスト前にベールが返っているか必ず確認する",
      "糸ヨレ防止にサルカン（ヨリモドシ）を仕掛けに使う",
      "ラインを巻き替える際はテンションをかけながら均一に巻く",
      "PEラインの場合はリーダーを結んで使う（直結は絡みやすい）",
    ],
    proTip:
      "ハサミ（ラインカッター）は釣りの必需品です。100円ショップの小型ハサミでもOK。必ずポケットに入れて持参しましょう。",
  },
  {
    id: "snag",
    iconName: "anchor",
    title: "根がかり（仕掛けが引っかかった）",
    subtitle:
      "海底の岩やテトラポッドに仕掛けが引っかかる「根がかり」。正しい対処法で仕掛けのロストを最小限にできます。",
    badge: {
      label: "よくある",
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    tips: [
      {
        title: "Step 1: 絶対にいきなり引っ張らない",
        description:
          "根がかりしたと思ったら、まず糸を少しゆるめて2〜3秒待ちましょう。潮の流れで仕掛けの向きが変わり、自然に外れることがあります。強く引くと針が深く食い込んで完全に外れなくなります。",
      },
      {
        title: "Step 2: 竿先を下げて角度を変える",
        description:
          "竿先を海面近くまで下げ、引っかかった方向とは反対に竿を左右にゆっくり動かします。角度を変えることで岩の隙間から仕掛けが抜けることがあります。左右に3〜4回試してみましょう。",
      },
      {
        title: "Step 3: ラインを手で引く（手袋・タオル必須）",
        description:
          "竿で外せない場合は、リールのドラグをゆるめて竿を置き、ラインを直接手に巻きつけて引っ張ります。素手だと手を切る危険があるので、必ずタオルか手袋を使いましょう。竿に負荷をかけるより効果的です。",
      },
      {
        title: "Step 4: ロスト時は切って仕切り直す",
        description:
          "どうしても外れない場合は、ラインを切って仕掛けを諦めます。竿の破損を防ぐため、竿を引っ張って切るのは避けてください。予備の仕掛けに交換して釣りを続行しましょう。",
      },
    ],
    preventionTips: [
      "海底が砂地のポイントを選ぶと根がかりが大幅に減る",
      "仕掛けを底でズルズル引きずらない（時々リフトする）",
      "予備の仕掛けを最低3セット持参する",
      "根がかりしにくい「ジェット天秤」を使うのも有効",
    ],
    proTip:
      "根がかりは避けられないトラブルです。仕掛けは消耗品と割り切って、予備を多めに持っていきましょう。根がかりのたびに落ち込まないことが大切です。",
  },
  {
    id: "no-bite",
    iconName: "fish",
    title: "魚が釣れない",
    subtitle:
      "釣りに行ったのにアタリすらこない。一番多い悩みですが、原因を一つずつ潰していけば必ず改善できます。",
    badge: {
      label: "よくある",
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    tips: [
      {
        title: "場所を移動する（5mでも変わる）",
        description:
          "同じ堤防でも、わずか5m移動するだけで海底の地形や潮の流れが変わります。周りで釣れている人がいたら、その近くに移動するのが最も効果的です。「角」や「先端」「常夜灯の下」は魚がたまりやすいポイントです。",
      },
      {
        title: "時間帯を変える（朝マズメ・夕マズメが鉄則）",
        description:
          "魚が最も活発にエサを食べるのは日の出前後の「朝マズメ」と日没前後の「夕マズメ」です。昼間に全く反応がなくても、この時間帯には急に釣れ始めることがあります。特に朝マズメの1時間が勝負どころです。",
      },
      {
        title: "エサを変える・付け直す",
        description:
          "エサがズレていたり鮮度が落ちていると魚は食いつきません。10分に1回はエサの状態を確認し、新しいものに交換しましょう。サビキの場合はコマセカゴのアミエビを詰め直すことで反応が変わることも多いです。",
      },
      {
        title: "タナ（棚・深さ）を調整する",
        description:
          "魚は水深によって回遊する層が違います。底付近で反応がなければ、リールを2〜3回巻いて中層を探ってみましょう。表層まで含め、1mずつ上から下まで試すのが基本です。3回投入して反応がなければ次のタナに移りましょう。",
      },
    ],
    preventionTips: [
      "釣り場に着いたら周囲の釣り人に「何が釣れていますか？」と聞いてみる",
      "事前に釣果情報サイトや釣具店で最近の状況を確認する",
      "潮汐表をチェックして潮が動く時間帯を狙う",
      "ターゲットの魚がいる時期・場所を事前にリサーチする",
    ],
    proTip:
      "「ボウズ（1匹も釣れないこと）」は上級者でも経験します。大切なのは原因を分析して次回に活かすこと。釣れなかった日のことこそメモに残しておきましょう。",
  },
  {
    id: "casting",
    iconName: "target",
    title: "仕掛けが飛ばない・飛距離が出ない",
    subtitle:
      "キャスティング（投げ方）のコツを知れば、飛距離は劇的に改善します。力まかせに投げるのは逆効果です。",
    badge: {
      label: "初心者あるある",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    tips: [
      {
        title: "Step 1: 竿の「しなり」を使う",
        description:
          "飛距離を出すコツは腕力ではなく、竿のしなりを活かすことです。バックスイングで竿を後ろに引いたとき、竿先にオモリの重みを感じるまで一瞬「タメ」を作りましょう。その反発力を使って前に振り出すと、力まなくても遠くに飛びます。",
      },
      {
        title: "Step 2: リリースポイントを調整する",
        description:
          "糸を離す（リリースする）タイミングが早すぎると上に飛び、遅すぎると手前に落ちます。竿が頭の真上を通過するあたり（時計でいう1時の位置）で人差し指を離すのが目安です。何度も練習して自分のタイミングを見つけましょう。",
      },
      {
        title: "Step 3: ガイドへの糸の通し方を確認",
        description:
          "竿のガイド（糸を通す輪っか）に糸が正しく通っていないと飛距離が出ません。1つでも飛ばしているとラインの摩擦が増えて飛距離が激減します。セッティング時にすべてのガイドに糸が通っていることを確認しましょう。",
      },
      {
        title: "Step 4: オモリの重さを見直す",
        description:
          "竿に対してオモリが軽すぎると竿のしなりを活かせず飛びません。逆に重すぎると竿が折れる危険があります。竿に記載されている「適合オモリ号数」の範囲内で、やや重めを選ぶと飛距離が出やすくなります。",
      },
    ],
    preventionTips: [
      "キャスト前に後方の安全を必ず確認する",
      "風に向かって投げると飛距離は落ちるが糸ふけが出にくい",
      "サミング（着水時に糸を指で押さえる）で余分な糸ふけを防ぐ",
      "最初は10〜20mを目標にし、慣れたら徐々に距離を伸ばす",
    ],
    proTip:
      "堤防のサビキ釣りなら、実は遠くに投げる必要はありません。足元に落とすだけでOK。「飛ばさなきゃ」というプレッシャーを感じる必要はないですよ。",
  },
  {
    id: "hook-stuck",
    iconName: "alert-triangle",
    title: "針が外れない（魚から/自分の服や手から）",
    subtitle:
      "針が魚から外れない場合、あるいは誤って自分の手や服に刺さってしまった場合の対処法です。",
    badge: {
      label: "注意",
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    tips: [
      {
        title: "魚から針を外す：プライヤーを使う",
        description:
          "素手で針を外そうとすると、魚が暴れて手に針が刺さる危険があります。必ずプライヤー（ペンチ型の針外し）を使いましょう。魚をタオルで軽く押さえ、プライヤーで針の軸をつかんで、刺さった方向と逆にひねるように外します。",
      },
      {
        title: "魚から針を外す：フックリムーバーの使い方",
        description:
          "フックリムーバー（針外し棒）は、魚を触らずに針を外せる便利な道具です。糸をたどって針外し棒を魚の口の中に滑り込ませ、針の軸を棒の溝に引っかけ、押し下げるようにすると針が外れます。魚にも手にも優しい方法です。",
      },
      {
        title: "手に針が刺さった場合（浅い場合）",
        description:
          "針先が浅く刺さっただけなら、そのまま刺さった方向と逆にそっと引き抜きます。抜いた後は清潔な水で洗い、消毒液で消毒し、絆創膏で保護しましょう。",
      },
      {
        title: "手に針が深く刺さった場合（カエシまで入った）",
        description:
          "針の「カエシ」（返し）まで刺さってしまった場合は、無理に抜かないでください。逆方向に抜くとカエシが肉を引き裂きます。針をテープで固定して動かないようにし、そのまま病院を受診しましょう。救急で対応してもらえます。",
      },
    ],
    preventionTips: [
      "プライヤーまたはフックリムーバーは必ず持参する",
      "魚を触る際はタオルで包んでから扱う",
      "使わない針にはカバーをつけておく",
      "バーブレスフック（カエシなしの針）を使うと外しやすく安全",
    ],
    proTip:
      "釣り場には必ず絆創膏・消毒液を含む簡易救急セットを持参してください。100円ショップで揃えられます。",
  },
  {
    id: "windy",
    iconName: "wind",
    title: "風が強い日の対処法",
    subtitle:
      "風はライントラブルの原因になり、仕掛けの操作も難しくなります。風の日でも快適に釣るためのテクニックを紹介します。",
    badge: {
      label: "たまにある",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    tips: [
      {
        title: "糸ふけ対策：ラインを水面につける",
        description:
          "風で糸がふけると感度が落ち、アタリがわかりにくくなります。キャスト後は竿先を水面近くまで下げ、ラインを海面につけることで風の影響を大幅に減らせます。リールを巻いて余分な糸ふけを取るのも基本です。",
      },
      {
        title: "おもりを重くする",
        description:
          "通常のオモリでは風に流されて仕掛けが安定しない場合、1〜2号重いオモリに変更しましょう。オモリが重いと仕掛けが底に安定し、風の影響を受けにくくなります。ただし竿の適合オモリ範囲内で調整すること。",
      },
      {
        title: "風を背にできるポイントに移動する",
        description:
          "追い風（背中から吹く風）なら飛距離がアップし、糸ふけも出にくくなります。堤防の反対側に移動する、風裏になるポイントを探すなど、風向きに合わせた場所選びが重要です。",
      },
      {
        title: "低弾道でキャストする",
        description:
          "通常のオーバーヘッドキャストだと仕掛けが風に煽られます。サイドキャスト（横投げ）にすると弾道が低くなり、風の影響を受けにくくなります。周囲に人がいないか確認してから行いましょう。",
      },
    ],
    preventionTips: [
      "風速7m/s以上の日は初心者は釣行を控えるのが賢明",
      "PEラインは風に弱い。強風日はナイロンラインの方がトラブルが少ない",
      "帽子はあご紐付きを選ぶか、脱いでポケットにしまう",
      "小物が飛ばされないよう、タックルボックスに蓋を閉める習慣をつける",
    ],
    proTip:
      "天気予報で風速をチェックする習慣をつけましょう。風速5m/s以上で「やや強い風」、8m/s以上で「初心者には厳しい」が目安です。",
  },
  {
    id: "bait-stolen",
    iconName: "circle-dot",
    title: "エサが取られるだけで釣れない",
    subtitle:
      "アタリは感じるのにエサだけ取られて針にかからない。いわゆる「エサ取り」の対策を解説します。",
    badge: {
      label: "よくある",
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    tips: [
      {
        title: "針のサイズを小さくする",
        description:
          "エサが取られるのは、ターゲットの口に対して針が大きすぎる可能性があります。針のサイズを1〜2号小さくするだけで、フッキング率（針にかかる確率）が大幅に上がることがあります。小さな魚には小さな針が鉄則です。",
      },
      {
        title: "合わせのタイミングを変える",
        description:
          "アタリを感じてすぐに竿を上げると、まだ魚が針をしっかりくわえていないことがあります。「コツコツ」という前アタリの後、「グーッ」と竿先が持っていかれる本アタリを待ってから合わせましょう。逆に、小さな魚の場合は即合わせの方が有効な場合もあります。",
      },
      {
        title: "エサの付け方を工夫する",
        description:
          "エサが簡単に取られるなら、針にしっかり固定する付け方にしましょう。青イソメなら針を2〜3回通す「縫い刺し」にする、オキアミなら尾を取って背中から刺すなど、エサが外れにくい方法があります。",
      },
      {
        title: "エサの種類を変えてみる",
        description:
          "フグなどのエサ取り名人が多い場所では、エサの種類自体を変えるのも手です。青イソメからオキアミに、あるいはコーンやイカの短冊など硬めのエサに変更することで、本命の魚に届きやすくなります。",
      },
    ],
    preventionTips: [
      "エサ取りが多い場所ではコマセを多めに撒いて本命を寄せる",
      "エサ取りが多い昼間を避けて朝マズメ・夕マズメに集中する",
      "仕掛けを遠投してエサ取りの少ないポイントを探る",
      "ハリスを細くすると魚の警戒心が下がりフッキングしやすくなる",
    ],
    proTip:
      "エサが取られるということは、そこに魚がいる証拠です。諦めず、針やエサを工夫してみましょう。",
  },
  {
    id: "reel-trouble",
    iconName: "settings",
    title: "リールのトラブル",
    subtitle:
      "ドラグ調整がわからない、ベールが戻らないなど、リールに関するよくあるトラブルと対処法です。",
    badge: {
      label: "たまにある",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    tips: [
      {
        title: "ドラグ調整の基本",
        description:
          "ドラグとは、大きな魚がかかったときに糸が切れないよう、一定の力で糸を送り出す機構です。スピニングリール上部のつまみを回して調整します。目安は、糸を手で引っ張ったとき「ジーッ」とやや抵抗がありつつ出ていく程度。締めすぎると糸が切れ、緩すぎると針がかりが甘くなります。",
      },
      {
        title: "ベールが自動で戻らない場合",
        description:
          "ベール（糸巻き部分のアーム）がリールを巻いても自動で戻らなくなった場合は、内部のバネが弱っています。応急処置として手動でベールを戻してから巻けばOK。帰宅後に釣具店でバネの交換を依頼しましょう。",
      },
      {
        title: "リールのハンドルが重い・ゴリゴリする",
        description:
          "ハンドルを回すときにゴリゴリとした感触がある場合、内部のベアリングに砂や塩が入っている可能性があります。応急処置はありませんが、釣り続けることは可能です。帰宅後に真水で軽くすすぎ、乾燥させてからオイルを差しましょう。",
      },
      {
        title: "糸が「パラパラ」とリールから浮く",
        description:
          "ラインがスプールからふわっと浮き上がる症状は、糸ヨレ（ねじれ）が原因です。仕掛けを付けずに糸を50m出し、水中で引きずりながらゆっくり巻き直すと解消します。それでも直らない場合は新しいラインに巻き替えましょう。",
      },
    ],
    preventionTips: [
      "釣行後は必ずリールを真水で軽く流す（海水の塩を落とす）",
      "月1回はリールの可動部分にオイルを差す",
      "砂浜にリールを直接置かない（砂がみの原因）",
      "保管時はドラグを緩めておく（バネの劣化防止）",
    ],
    proTip:
      "リールは精密機械です。シーズン終了後には釣具店でオーバーホール（分解清掃）を依頼すると、長く快適に使えます。",
  },
  {
    id: "fish-handling",
    iconName: "snowflake",
    title: "魚の締め方がわからない",
    subtitle:
      "釣った魚をおいしく持ち帰るための「締め方」と「血抜き」の基本を解説します。",
    badge: {
      label: "知っておきたい",
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    tips: [
      {
        title: "氷締め（小〜中型魚向け）",
        description:
          "アジやイワシなどの小型魚は、氷水に入れる「氷締め」が最も簡単です。クーラーボックスに氷を入れ、海水を加えて0℃近い氷水を作ります。釣れた魚をすぐにこの中に入れると、急速に冷えて鮮度が保たれます。真水ではなく海水を使うのがポイントです。",
      },
      {
        title: "血抜き（中〜大型魚向け）",
        description:
          "30cm以上の魚は、エラの付け根をハサミかナイフで切って血抜きをしましょう。エラ蓋を開け、エラの根元にある太い血管を切断します。切ったら海水を入れたバケツに頭を下にして入れ、1〜2分で血が抜けます。血抜きをすると身の臭みが減り、格段に美味しくなります。",
      },
      {
        title: "脳締め（即殺）の方法",
        description:
          "魚の目と目の間の少し上あたりに、ナイフの先端やフィッシュピックを刺すと即死します。魚が暴れて身が痛むのを防ぎ、鮮度を最高の状態で保てます。専用のツールがなくても、プライヤーの先端で代用できます。",
      },
      {
        title: "持ち帰りのコツ",
        description:
          "クーラーボックスには氷を多めに入れ、魚が直接氷に触れないようビニール袋か新聞紙で包むのが理想です。氷焼け（魚の表面が白くなる）を防げます。帰宅後はなるべく早く調理するか、ラップで包んで冷蔵庫に入れましょう。",
      },
    ],
    preventionTips: [
      "クーラーボックスと氷は必ず持参する",
      "バケツを1つ血抜き用に確保しておく",
      "ハサミ・ナイフは切れ味の良いものを用意する",
      "食べない魚・小さすぎる魚は優しくリリースする",
    ],
    proTip:
      "「釣った魚を美味しく食べる」のも釣りの醍醐味です。少し手間をかけて締めるだけで、味が全く違いますよ。",
  },
  {
    id: "weather-change",
    iconName: "cloud-lightning",
    title: "天候急変時の対応",
    subtitle:
      "自然の中で行う釣りでは、天候の急変は命に関わる危険があります。安全を最優先に行動しましょう。",
    badge: {
      label: "緊急・重要",
      color: "bg-red-100 text-red-800 border-red-200",
    },
    tips: [
      {
        title: "雷：遠くで鳴ったら即避難",
        description:
          "遠くで雷が鳴り始めたら、その時点で釣りを中止して避難してください。カーボン製の釣り竿は電気を通しやすく、雷の標的になります。堤防や磯は周囲に高い建物がないため特に危険です。「ゴロゴロ」が聞こえたら30分以内に雷雲が頭上に来る可能性があります。車や頑丈な建物内に退避しましょう。",
      },
      {
        title: "高波：うねりに注意",
        description:
          "波の高さが1.5mを超えたら堤防でも危険水域です。波は不規則で、10回に1回は通常の1.5倍の高波が来ます。天気予報で「波の高さ2m以上」と出ている日は釣行を中止しましょう。海に背を向けないこと、ライフジャケットを着用することが基本です。",
      },
      {
        title: "撤退のタイミング",
        description:
          "以下の兆候が一つでもあれば即撤退です。(1)雷の音が聞こえる (2)急に風が強くなった (3)波が堤防に打ち上がり始めた (4)空が急に暗くなった (5)気温が急に下がった。「せっかく来たのにもったいない」という気持ちは捨てて、命を最優先にしてください。",
      },
      {
        title: "小雨なら逆にチャンス",
        description:
          "小雨程度なら釣り人が減り、魚の警戒心も薄れて好釣果になることがあります。レインウェアを着て釣りを続行する価値は十分あります。ただし、雷を伴う雨や本降りで足元が滑る場合は中止しましょう。レインウェアと着替えを車に常備しておくのが鉄則です。",
      },
    ],
    preventionTips: [
      "出発前に天気予報で風速・波高・雷注意報を必ずチェック",
      "スマートフォンの天気アプリで1時間ごとの予報を確認",
      "家族や友人に釣り場と帰宅予定時間を伝えておく",
      "ライフジャケットは安全の基本。必ず着用する",
    ],
    proTip:
      "「釣りに行きたい気持ち」と「安全」を天秤にかけたら、常に安全を選ぶのが熟練者です。釣りはまた行けますが、命は一つです。",
  },
];

/* ──────────── FAQ JSON-LD ──────────── */

const faqItems = [
  {
    question: "釣りで糸が絡まったときの直し方は？",
    answer:
      "まず引っ張らないことが大切です。リールのベールを起こしてテンションを解放し、スプールから糸を少しずつ引き出して絡みをほぐします。5分以上かかる場合はハサミで切って結び直す判断をしましょう。PEラインは摩擦に弱いのでより慎重に扱ってください。",
  },
  {
    question: "根がかりしたときの正しい対処法は？",
    answer:
      "まず強く引っ張らないこと。糸をゆるめて2〜3秒待ち、竿先を下げて左右に動かしてみます。それでも外れない場合はタオルを巻いた手にラインを巻きつけて直接引っ張ります。最終手段としてラインを切る判断も大切です。予備の仕掛けは最低3セット持参しましょう。",
  },
  {
    question: "釣りに行っても魚が釣れないときはどうすればいい？",
    answer:
      "場所を5m移動する、朝マズメ・夕マズメの時間帯を狙う、エサを新しいものに交換する、タナ（深さ）を1mずつ変えてみる、という4つの方法を順番に試しましょう。周りで釣れている人に使っている仕掛けやタナを聞くのも効果的です。",
  },
  {
    question: "仕掛けが遠くに飛ばないのですが、コツはありますか？",
    answer:
      "力まかせに投げるのは逆効果です。竿の「しなり」を使うのがコツで、バックスイング時に竿先にオモリの重みを感じてから前に振り出します。リリースポイント（糸を離すタイミング）は竿が1時の位置のあたり。ガイドへの糸の通し忘れがないかも確認しましょう。",
  },
  {
    question: "魚から針が外れないときはどうすればいい？",
    answer:
      "素手で外そうとせず、必ずプライヤー（ペンチ型の針外し）を使いましょう。魚をタオルで押さえ、針の軸をプライヤーでつかんで刺さった方向と逆にひねります。フックリムーバー（針外し棒）を使えば魚を触らずに外すこともできます。",
  },
  {
    question: "風が強い日の釣りで気をつけることは？",
    answer:
      "糸ふけ対策として竿先を水面近くまで下げてラインを海面につけること、オモリを1〜2号重くすること、風を背にできるポイントに移動することが効果的です。風速7m/s以上の日は初心者は控えるのが賢明です。",
  },
  {
    question: "エサが取られるだけで魚が釣れない原因は？",
    answer:
      "針のサイズが大きすぎるか、合わせのタイミングが合っていない可能性があります。針を1〜2号小さくし、前アタリ（コツコツ）の後の本アタリ（グーッ）を待ってから合わせましょう。エサの付け方を「縫い刺し」にして外れにくくするのも有効です。",
  },
  {
    question: "リールのドラグ調整はどうすればいい？",
    answer:
      "スピニングリール上部のつまみで調整します。糸を手で引っ張ったとき「ジーッ」とやや抵抗がありつつ出ていく程度が目安です。締めすぎると大物がかかったとき糸が切れ、緩すぎると針がかりが甘くなります。",
  },
  {
    question: "釣った魚の締め方を教えてください",
    answer:
      "小型魚（アジ・イワシ等）は氷と海水を入れたクーラーボックスに入れる「氷締め」が簡単です。30cm以上の中〜大型魚はエラの付け根をハサミで切って血抜きをすると鮮度が保たれ、臭みも減ります。クーラーボックスと氷は必ず持参しましょう。",
  },
  {
    question: "釣り中に天気が急変したらどうすべき？",
    answer:
      "雷が聞こえたら即座に釣りを中止し、車や建物に避難してください。カーボン竿は雷の標的になります。波が高くなったり風が急に強まった場合も撤退の判断をしましょう。「もったいない」より「安全」を常に優先することが大切です。",
  },
];

/* ──────────── JSON-LD ──────────── */

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
      name: "釣りの始め方ガイド",
      item: "https://tsurispot.com/guide",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "釣りのトラブルシューティング",
      item: "https://tsurispot.com/guide/troubleshooting",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "釣りのトラブルシューティング｜よくある問題と解決法",
  description:
    "釣りの最中によくあるトラブル10選とその対処法。糸絡み、根がかり、魚が釣れない、仕掛けが飛ばない、針が外れない、風対策、エサ取り、リールトラブル、魚の締め方、天候急変への対応をステップバイステップで解説。",
  datePublished: "2026-03-05",
  dateModified: "2026-03-05",
  author: {
    "@type": "Person",
    name: "正木 家康",
    jobTitle: "編集長",
    url: "https://tsurispot.com/about",
  },
  publisher: {
    "@type": "Organization",
    name: "ツリスポ",
    url: "https://tsurispot.com",
    logo: {
      "@type": "ImageObject",
      url: "https://tsurispot.com/logo.svg",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://tsurispot.com/guide/troubleshooting",
  },
};

/* ──────────── ページ ──────────── */

export default function TroubleshootingGuidePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />

      {/* パンくずリスト */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣りガイド", href: "/guide" },
          { label: "トラブルシューティング" },
        ]}
      />

      {/* ヘッダー */}
      <div className="mb-8 text-center sm:mb-10">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-orange-100">
          <HelpCircle className="size-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          釣りのトラブルシューティング
        </h1>
        <p className="mt-2 text-lg font-medium text-primary sm:text-xl">
          よくある問題と解決法
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          釣りの最中に起こるトラブルは、誰でも経験するものです。
          <br className="hidden sm:inline" />
          事前に対処法を知っておくだけで、当日の気持ちにぐっと余裕が生まれます。
        </p>
      </div>

      {/* 安心メッセージ */}
      <div className="mb-8 rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-950/30">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
          このガイドでは、初心者がよく遭遇する10のトラブルについて、
          <span className="font-bold">状況の説明・ステップバイステップの対処法・予防のコツ</span>
          をまとめています。
        </p>
      </div>

      {/* 目次 */}
      <div className="mb-8 rounded-xl border bg-muted/30 p-4 sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <BookOpen className="size-4" />
          目次（タップでジャンプ）
        </h2>
        <nav>
          <ol className="space-y-2">
            {troubleSections.map((section, idx) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </span>
                  <span>{section.title}</span>
                  <Badge
                    className={`ml-auto text-[10px] ${section.badge.color}`}
                  >
                    {section.badge.label}
                  </Badge>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* トラブルカード一覧 */}
      <div className="space-y-4">
        {troubleSections.map((section) => (
          <TroubleCard key={section.id} section={section} />
        ))}
      </div>

      {/* まとめセクション */}
      <div className="mt-10 rounded-xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6">
        <h2 className="mb-3 text-lg font-bold">
          トラブルを減らす3つの心得
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            <div>
              <p className="font-medium">準備は入念に</p>
              <p className="text-sm text-muted-foreground">
                予備の仕掛け、ハサミ、タオル、手袋、プライヤー、ゴミ袋、救急セット。最低限の準備が現場の安心感を生みます。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <div>
              <p className="font-medium">焦らない・無理しない</p>
              <p className="text-sm text-muted-foreground">
                トラブルが起きても、深呼吸してゆっくり対処しましょう。焦ると状況が悪化します。糸絡みも根がかりも、落ち着けば必ず対処できます。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </span>
            <div>
              <p className="font-medium">安全を最優先に</p>
              <p className="text-sm text-muted-foreground">
                天候急変やケガは命に関わります。「もったいない」より「安全」を常に選ぶのがベテランの証です。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ セクション */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold">よくある質問（FAQ）</h2>
        <div className="space-y-3">
          {faqItems.slice(0, 5).map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border transition-colors hover:border-primary"
            >
              <summary className="cursor-pointer list-none p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    Q
                  </span>
                  <p className="text-sm font-medium text-foreground">{item.question}</p>
                  <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                </div>
              </summary>
              <div className="border-t px-4 pb-4 pt-3">
                <div className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                    A
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* 関連ページリンク */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold">
          関連ガイド
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          トラブルに備えつつ、もっと釣りを楽しむための関連ガイドもぜひご覧ください。
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              href: "/guide/beginner",
              title: "釣り初心者完全ガイド",
              description:
                "これから釣りを始めたい方への総合ページ",
            },
            {
              href: "/guide/how-to-fish",
              title: "釣りのやり方完全ガイド",
              description:
                "基本の釣り方をステップバイステップで解説",
            },
            {
              href: "/guide/knots",
              title: "釣り糸の結び方",
              description:
                "トラブル時の結び直しに必須の基本テクニック",
            },
            {
              href: "/guide/sabiki",
              title: "サビキ釣り完全ガイド",
              description: "初心者が最初に挑戦したい釣り方",
            },
            {
              href: "/guide/setup",
              title: "竿とリールのセッティング",
              description: "正しいセッティングでトラブル予防",
            },
            {
              href: "/safety",
              title: "釣りの安全・マナーガイド",
              description:
                "安全に楽しむために知っておくべきこと",
            },
            {
              href: "/spots",
              title: "釣りスポット一覧",
              description:
                "全国1,300以上の釣りスポットを検索",
            },
            {
              href: "/guide",
              title: "釣りガイド一覧",
              description:
                "20本以上のガイドから自分に合ったものを見つけよう",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium group-hover:text-primary">
                  {link.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {link.description}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center sm:mt-12">
        <p className="mb-4 text-base font-medium sm:text-lg">
          トラブル対策を覚えたら、釣りに出かけよう！
        </p>
        <Button asChild size="lg" className="min-h-[48px] rounded-full px-8">
          <Link href="/spots">スポットを探す</Link>
        </Button>
      </div>

      {/* 戻るリンク */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/guide"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowRight className="size-4 rotate-180" />
          釣りガイド一覧に戻る
        </Link>
      </div>
    </main>
  );
}
