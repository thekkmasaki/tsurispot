import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Target,
  Lightbulb,
  Fish,
  MapPin,
  Wrench,
  ListOrdered,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import type { YouTubeSearchLink } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface FishingMethod {
  slug: string;
  name: string;
  nameEn: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  overview: string;
  season: string;
  bestMonths: number[];
  targetFish: { name: string; slug: string }[];
  requiredGear: { name: string; detail: string; affiliateUrl?: string }[];
  steps: { title: string; description: string }[];
  tips: string[];
  relatedMethods: { slug: string; name: string }[];
  youtubeLinks: YouTubeSearchLink[];
}

const DIFFICULTY_MAP = {
  beginner: { label: "初心者", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  intermediate: { label: "中級者", className: "bg-sky-100 text-sky-700 hover:bg-sky-100" },
  advanced: { label: "上級者", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
};

const methods: FishingMethod[] = [
  {
    slug: "sabiki",
    name: "サビキ釣り",
    nameEn: "Sabiki Fishing",
    difficulty: "beginner",
    description: "コマセ（撒き餌）で魚を寄せ、疑似餌のついた複数の針で一度にたくさんの魚を狙う、初心者に最もおすすめの釣法です。",
    overview:
      "サビキ釣りは、カゴに詰めたコマセ（アミエビ）を海中で撒いて魚を集め、コマセに似せた疑似餌（スキンやサバ皮）がついた複数の針に食わせる釣法です。堤防の足元に仕掛けを落とすだけなので投げる技術が不要で、ファミリーフィッシングや釣り初体験に最適。アジ・サバ・イワシといった回遊魚がメインターゲットで、群れが回ってくれば入れ食いも夢ではありません。夏〜秋がハイシーズンですが、場所によっては通年楽しめます。",
    season: "6月〜11月（ベスト：7月〜10月）",
    bestMonths: [6, 7, 8, 9, 10, 11],
    targetFish: [
      { name: "アジ", slug: "aji" },
      { name: "サバ", slug: "saba" },
      { name: "イワシ", slug: "iwashi" },
      { name: "サッパ", slug: "sappa" },
    ],
    requiredGear: [
      { name: "竿", detail: "2〜3mの万能竿またはサビキ専用竿。初心者セットがコスパ最強。" },
      { name: "リール", detail: "小〜中型スピニングリール（2000〜3000番）。ナイロン3号程度が巻いてあるものが便利。" },
      { name: "サビキ仕掛け", detail: "針4〜6号のピンクスキンが万能。ハゲ皮タイプも人気。予備を2〜3セット用意。" },
      { name: "コマセカゴ", detail: "下カゴ式が一般的。プラスチック製で8〜10号程度のオモリ付きが使いやすい。" },
      { name: "コマセ（アミエビ）", detail: "冷凍ブロックが定番。マルキュー「アミ姫」などのチューブタイプは手が汚れにくく、においも少ないので初心者におすすめ。", affiliateUrl: "https://amzn.to/4c6gaUn" },
      { name: "バケツ", detail: "コマセ用バケツと水くみバケツの2つ。蓋つきが風対策にもなる。" },
    ],
    steps: [
      { title: "コマセをカゴに詰める", description: "コマセカゴにアミエビを7〜8分目まで詰めます。詰めすぎるとコマセが出にくくなるので、少し余裕を持たせるのがコツです。" },
      { title: "仕掛けを足元に落とす", description: "リールのベイルを起こし、仕掛けの重さで自然に沈めます。投げる必要はありません。底まで沈めたらリールを2〜3回巻いて底から少し浮かせます。" },
      { title: "竿を上下にシャクる", description: "竿を50cm〜1mほど上下に2〜3回動かしてカゴからコマセを出します。コマセの煙幕の中に疑似餌が漂うイメージです。" },
      { title: "アタリを待つ", description: "シャクった後、竿を止めて10〜20秒ほど待ちます。ブルブルと手元に振動が伝わったら魚がかかった合図です。" },
      { title: "竿を立ててリールを巻く", description: "アタリがあったらゆっくり竿を立て、一定速度でリールを巻いて魚を取り込みます。複数かかっている場合は焦らず丁寧に。" },
    ],
    tips: [
      "タナ（深さ）を変えて探る。底付近だけでなく中層も試すと釣果が変わる",
      "コマセは少量ずつ出すのがコツ。一度に出しすぎると魚がコマセだけ食べて針に食いつかない",
      "群れが来たら手返し重視。素早く仕掛けを回収・再投入を繰り返す",
      "朝マヅメ・夕マヅメの時間帯は魚の活性が高く、最も釣れやすい",
      "周りで釣れている人のタナ（深さ）を参考にする",
    ],
    relatedMethods: [
      { slug: "choi-nage", name: "ちょい投げ" },
      { slug: "uki-zuri", name: "ウキ釣り" },
      { slug: "ajing", name: "アジング" },
    ],
    youtubeLinks: [
      { label: "サビキ釣り入門", searchQuery: "サビキ釣り 初心者 やり方 堤防", description: "堤防でのサビキ釣りの基本を動画で学ぼう" },
      { label: "サビキ釣りでアジ大漁", searchQuery: "サビキ釣り アジ 大漁 堤防 釣果", description: "サビキで大量のアジを釣り上げる実釣映像" },
      { label: "サビキ仕掛けの選び方", searchQuery: "サビキ仕掛け 選び方 おすすめ 初心者", description: "仕掛け・コマセの選び方と使い方のコツ" },
    ],
  },
  {
    slug: "ajing",
    name: "アジング",
    nameEn: "Ajing",
    difficulty: "intermediate",
    description: "極小のジグヘッドとワームでアジを狙うライトゲーム。繊細なアタリを感じ取る奥深い釣法です。",
    overview:
      "アジングは、1g前後の極小ジグヘッドにワーム（ソフトルアー）をセットしてアジを狙うライトソルトルアーフィッシングです。サビキ釣りのようにコマセを使わないため、手が汚れず荷物も少なくて済みます。アジの繊細な「コン」というバイト（アタリ）を感じ取ってアワセを入れるゲーム性の高さが魅力。常夜灯周りの漁港がメインフィールドで、夕マヅメから夜がゴールデンタイムです。専用タックルを使うことで、小さなアタリもしっかり感じ取れるようになります。",
    season: "通年（ベスト：9月〜12月）",
    bestMonths: [9, 10, 11, 12, 1, 2],
    targetFish: [
      { name: "アジ", slug: "aji" },
      { name: "メバル", slug: "mebaru" },
      { name: "カマス", slug: "kamasu" },
    ],
    requiredGear: [
      { name: "ロッド", detail: "アジング専用ロッド 5〜7フィート。ソリッドティップが感度抜群で初心者にもおすすめ。" },
      { name: "リール", detail: "1000〜2000番の小型スピニングリール。軽量モデルが操作しやすい。" },
      { name: "ライン", detail: "エステルライン0.2〜0.3号またはPEライン0.1〜0.3号。フロロカーボンリーダー0.8〜1.5号を30cm程度接続。" },
      { name: "ジグヘッド", detail: "0.6〜1.5gが基本。丸型やダート型など状況に応じて使い分ける。" },
      { name: "ワーム", detail: "1.5〜2.5インチのピンテールやストレート系。クリア系・グロー系が定番カラー。" },
      { name: "ヘッドライト", detail: "夜釣りが中心なので必須。赤色LEDモードがあると魚を警戒させにくい。" },
    ],
    steps: [
      { title: "ポイントを選ぶ", description: "漁港の常夜灯周り、堤防の先端、潮通しの良い場所を選びます。光と影の境目がアジの好むスポットです。" },
      { title: "ジグヘッドをキャスト", description: "軽くキャストして着水させます。最初はカウントダウンで沈めて、アジがいるレンジ（水深）を探ります。" },
      { title: "レンジを探る", description: "着水後3秒、5秒、10秒とカウントを変えて、表層から中層、ボトム付近まで幅広く探ります。" },
      { title: "リトリーブ＆フォール", description: "ゆっくりただ巻き、またはロッドを軽くシャクってからのフォール（沈下）でアジを誘います。フォール中のバイトが多いので集中。" },
      { title: "アタリを掛ける", description: "「コン」「ツッ」という小さなアタリを感じたら、手首を返すようにアワセを入れます。巻きアワセでもOK。" },
    ],
    tips: [
      "レンジ（深さ）が最も重要。反応がなければこまめにカウントダウンの秒数を変える",
      "風が強い日はジグヘッドを重くして操作性を確保する",
      "常夜灯の明暗の境目を丁寧に通すとバイトが集中しやすい",
      "ワームのカラーチェンジで急に釣れ出すこともある。数種類は用意しよう",
      "ドラグは緩めにセット。アジは口が柔らかいので強引なやり取りは口切れの原因",
    ],
    relatedMethods: [
      { slug: "mebaring", name: "メバリング" },
      { slug: "sabiki", name: "サビキ釣り" },
      { slug: "eging", name: "エギング" },
    ],
    youtubeLinks: [
      { label: "アジング入門", searchQuery: "アジング 初心者 やり方 ワーム ジグヘッド", description: "アジングの基本テクニックを動画で解説" },
      { label: "アジング実釣", searchQuery: "アジング 実釣 常夜灯 漁港 夜釣り", description: "常夜灯周りでのアジング実釣の様子" },
      { label: "アジングのワーム選び", searchQuery: "アジング ワーム おすすめ カラー サイズ", description: "状況別のワームの選び方とカラーローテーション" },
    ],
  },
  {
    slug: "eging",
    name: "エギング",
    nameEn: "Eging",
    difficulty: "intermediate",
    description: "エギ（餌木）というルアーでアオリイカを狙う人気の釣法。シャクリとフォールの組み合わせが鍵です。",
    overview:
      "エギングは、エギ（餌木）と呼ばれるエビを模したルアーを使ってイカを狙う釣法です。日本発祥の釣り文化で、主にアオリイカがターゲット。ロッドをシャクってエギを跳ね上げ、その後のフォール（沈下）中にイカに抱かせるのが基本パターンです。エギをシャクる爽快感と、ズシッと重いイカの引きが病みつきになるアングラーが続出。春は大型の親イカ、秋は数釣りが楽しめる新子シーズンと、年2回のハイシーズンがあります。磯場や堤防の先端、藻場（もば）が好ポイントです。",
    season: "3月〜6月、9月〜12月（ベスト：4月〜5月、10月〜11月）",
    bestMonths: [3, 4, 5, 6, 9, 10, 11, 12],
    targetFish: [
      { name: "アオリイカ", slug: "aoriika" },
      { name: "コウイカ", slug: "kouika" },
      { name: "ヤリイカ", slug: "yariika" },
    ],
    requiredGear: [
      { name: "ロッド", detail: "エギング専用ロッド 8〜8.6フィートのML〜Mクラス。しなやかでシャクリやすいもの。" },
      { name: "リール", detail: "2500〜3000番のスピニングリール。ダブルハンドルモデルがシャクリ時に安定する。" },
      { name: "ライン", detail: "PEライン0.6〜0.8号。リーダーはフロロカーボン2〜2.5号を1m程度接続。" },
      { name: "エギ", detail: "3〜3.5号が基本サイズ。秋は2.5号も有効。オレンジ・ピンク・ナチュラル系を用意。" },
      { name: "スナップ", detail: "エギ用スナップ。エギのカラーチェンジを素早くできる。" },
      { name: "ギャフ（イカ締めピック）", detail: "イカを取り込むためのギャフ。締めピックで鮮度を保つ処理も。" },
    ],
    steps: [
      { title: "エギをキャスト", description: "狙いのポイントに向かってエギをフルキャストします。着水後、ラインのたるみを取りつつボトム（底）までエギを沈めます。" },
      { title: "シャクリを入れる", description: "ロッドを2〜3回リズミカルにシャクり上げてエギを跳ね上げます。力任せではなく、テンポよく軽快にシャクるのがコツ。" },
      { title: "フォールさせる", description: "シャクった後はロッドを倒してエギをフォール（沈下）させます。このフォール中にイカが抱きつきます。テンションフォール（糸を張った状態で沈下）が基本。" },
      { title: "アタリを取る", description: "フォール中にラインが走ったり、ロッドの穂先にモタッとした違和感があればイカが抱いたサイン。ラインの動きに集中しましょう。" },
      { title: "アワセて取り込む", description: "アタリを感じたらロッドを大きくアワセます。イカは後ろに逃げるので、しっかりとロッドを立てて寄せましょう。足元まで来たらギャフやタモで取り込みます。" },
    ],
    tips: [
      "ボトム（底）を取ることが超重要。アオリイカはボトム付近にいることが多い",
      "シャクリのバリエーションを増やす。ワンピッチジャーク、2段シャクリ、スラックジャークなど",
      "潮が動いている時間帯（上げ潮・下げ潮の中間）がイカの活性が高い",
      "エギのカラーローテーションは大切。澄み潮ならナチュラル系、濁り潮ならアピール系",
      "墨跡がある場所は実績ポイント。先行者の墨跡を見逃さない",
    ],
    relatedMethods: [
      { slug: "shore-jigging", name: "ショアジギング" },
      { slug: "ajing", name: "アジング" },
      { slug: "mebaring", name: "メバリング" },
    ],
    youtubeLinks: [
      { label: "エギング入門", searchQuery: "エギング 初心者 やり方 シャクリ方 アオリイカ", description: "エギングの基本シャクリとフォールを動画で学ぶ" },
      { label: "エギングでアオリイカ", searchQuery: "エギング アオリイカ 実釣 堤防 秋", description: "堤防からアオリイカを狙うエギング実釣" },
      { label: "エギの選び方", searchQuery: "エギ おすすめ カラー サイズ 選び方 初心者", description: "初心者向けエギの選び方とカラーローテーション" },
    ],
  },
  {
    slug: "mebaring",
    name: "メバリング",
    nameEn: "Mebaring",
    difficulty: "intermediate",
    description: "ジグヘッドとワームでメバルを狙うライトゲーム。夜の常夜灯周りが主戦場の繊細な釣りです。",
    overview:
      "メバリングは、小型のジグヘッドにワームをセットしてメバルを狙うライトソルトルアーフィッシングです。メバルは「春告魚」の異名を持ち、冬から春にかけてがハイシーズン。夜行性が強く、常夜灯の明暗部や波静かな港内がメインフィールドです。アジングよりもスローな展開が多く、ただ巻きやリフト＆フォールで丁寧にレンジを通していくのが基本。メバルは根魚の一種でありながら中層にも浮くことが多いため、レンジキープの技術が釣果を分けます。プラグ（ハードルアー）を使ったメバルプラッギングも人気が高まっています。",
    season: "11月〜5月（ベスト：1月〜4月）",
    bestMonths: [11, 12, 1, 2, 3, 4, 5],
    targetFish: [
      { name: "メバル", slug: "mebaru" },
      { name: "カサゴ", slug: "kasago" },
      { name: "アジ", slug: "aji" },
    ],
    requiredGear: [
      { name: "ロッド", detail: "メバリング専用ロッド 6.5〜7.5フィート。チューブラーティップは掛け調子、ソリッドティップは乗せ調子。" },
      { name: "リール", detail: "1000〜2000番の小型スピニングリール。スムーズなドラグ性能が重要。" },
      { name: "ライン", detail: "フロロカーボン2〜4lb（直結）またはPE0.2〜0.4号＋フロロリーダー3〜4lb。" },
      { name: "ジグヘッド", detail: "0.5〜1.5gの丸型ジグヘッド。表層狙いは軽め、深場狙いは重めに。" },
      { name: "ワーム", detail: "1.5〜2インチのピンテール・シャッドテール系。グロー系や白系が定番。" },
      { name: "プラグ（任意）", detail: "シンキングペンシルやフローティングミノー。ワームで反応が薄い時に有効。" },
    ],
    steps: [
      { title: "ポイントを選ぶ", description: "常夜灯のある漁港や堤防が定番。テトラ帯、海藻周り、岩礁帯もメバルの好ポイントです。光と影の境目を重点的に。" },
      { title: "表層から探る", description: "まずは着水後すぐにゆっくりただ巻き。メバルは上を意識しているため、表層から順にレンジを下げていきます。" },
      { title: "ただ巻きで通す", description: "一定速度のスローリトリーブが基本。リールのハンドルを1秒1回転以下のゆっくりペースで巻きます。" },
      { title: "レンジを変える", description: "反応がなければカウントダウンで沈めてからただ巻き。3秒、5秒、10秒と段階的にレンジを深くして探ります。" },
      { title: "アタリがあったら巻きアワセ", description: "「ゴン」「コッ」というアタリがあったら、そのまま巻き続けてフッキングさせます。メバルは根に潜る習性があるので、掛けたら根から引き離すように竿を立てましょう。" },
    ],
    tips: [
      "ただ巻きが最強。速度を変えず一定のレンジをキープすることが最重要",
      "風が弱く波が穏やかな夜がベストコンディション",
      "メバルは根に潜る習性がある。掛けたら素早く根から引き離す",
      "プラグのドリフト（潮に流す釣り）は大型メバルに効果的",
      "同じ場所に何度もキャストせず、横方向に移動しながら新しい魚を探る",
    ],
    relatedMethods: [
      { slug: "ajing", name: "アジング" },
      { slug: "ana-zuri", name: "穴釣り" },
      { slug: "uki-zuri", name: "ウキ釣り" },
    ],
    youtubeLinks: [
      { label: "メバリング入門", searchQuery: "メバリング 初心者 やり方 ワーム ジグヘッド 夜", description: "メバリングの基本テクニックを動画で解説" },
      { label: "メバリング実釣", searchQuery: "メバリング 実釣 漁港 常夜灯 メバル", description: "漁港の常夜灯周りでのメバリング実釣映像" },
      { label: "メバルプラッギング", searchQuery: "メバル プラグ プラッギング シンキングペンシル", description: "プラグで大型メバルを狙うテクニック" },
    ],
  },
  {
    slug: "shore-jigging",
    name: "ショアジギング",
    nameEn: "Shore Jigging",
    difficulty: "advanced",
    description: "岸（ショア）からメタルジグを遠投して青物などの大型回遊魚を狙う、パワフルで豪快な釣法です。",
    overview:
      "ショアジギングは、岸から金属製のルアー「メタルジグ」をフルキャストして、ブリ（イナダ・ワカシ）、カンパチ、サワラ、ソウダガツオといった青物（回遊魚）を狙う釣法です。100m以上の遠投が可能なメタルジグの飛距離を活かし、沖を回遊する魚にアプローチします。ジグをシャクって跳ね上げ、フォールで食わせるのが基本。ヒットした瞬間の強烈な引きは、他の釣りでは味わえない興奮があります。ライトショアジギング（20〜40g）なら中級者でも始めやすく、本格ショアジギング（60〜100g）は体力と経験が必要です。朝マヅメの時合いが最大のチャンス。",
    season: "5月〜12月（ベスト：9月〜11月）",
    bestMonths: [5, 6, 7, 8, 9, 10, 11, 12],
    targetFish: [
      { name: "イナダ", slug: "inada" },
      { name: "ソウダガツオ", slug: "soudagatuo" },
      { name: "サワラ", slug: "sawara" },
      { name: "カンパチ", slug: "kanpachi" },
    ],
    requiredGear: [
      { name: "ロッド", detail: "ショアジギング専用ロッド 9〜10フィート。ライト（30gまで）〜ヘビー（100g以上）と対象魚に合わせて選択。" },
      { name: "リール", detail: "4000〜6000番のスピニングリール。ハイギア（HG）モデルがジャークしやすい。" },
      { name: "ライン", detail: "PEライン1.5〜3号。リーダーはフロロカーボン25〜40lbを1〜1.5m接続。" },
      { name: "メタルジグ", detail: "20〜60g（ライト）〜60〜100g以上（ヘビー）。ブルー・ピンク・シルバー系が定番カラー。" },
      { name: "アシストフック", detail: "フロント（前）にシングルまたはダブルのアシストフック。ジグに合わせたサイズを選ぶ。" },
      { name: "タモ・ランディングネット", detail: "大型魚の取り込みに必須。5m以上の柄が堤防には必要。" },
    ],
    steps: [
      { title: "メタルジグをフルキャスト", description: "狙いの方向に向かってフルキャストします。PEラインのしなりを使って遠投するため、ペンデュラムキャスト（振り子投げ）が効果的です。" },
      { title: "ボトムを取る", description: "ジグが着水したらフリーフォール（糸を出して）でボトム（底）まで沈めます。底に着いたらすぐに巻き始めて根掛かりを防ぎます。" },
      { title: "ワンピッチジャーク", description: "リールを1回転巻くごとにロッドを1回シャクる「ワンピッチジャーク」が基本アクション。テンポよくジグを跳ね上げて魚にアピールします。" },
      { title: "中層〜表層まで探る", description: "ボトムから中層、中層から表層と、ジャークしながらジグを上げていきます。反応がなければ再度ボトムまで沈めて繰り返します。" },
      { title: "ヒットしたらファイト", description: "ガツン！とヒットしたらロッドを立ててしっかりフッキング。青物の強烈な引きに耐え、ポンピング（竿を起こして巻く）で寄せます。" },
    ],
    tips: [
      "朝マヅメ（日の出前後）が最大のチャンスタイム。暗いうちに釣り場に入ろう",
      "ナブラ（小魚が水面でバシャバシャする状態）を見つけたら即キャスト",
      "ジグのフォール中にバイトが多い。フォール姿勢の良いジグを選ぶ",
      "潮通しの良い堤防先端、磯場、沖向きのサーフが好ポイント",
      "ドラグは締めすぎず、大物とのファイトに備えて適度に調整する",
    ],
    relatedMethods: [
      { slug: "eging", name: "エギング" },
      { slug: "ajing", name: "アジング" },
      { slug: "sabiki", name: "サビキ釣り" },
    ],
    youtubeLinks: [
      { label: "ショアジギング入門", searchQuery: "ショアジギング 初心者 やり方 メタルジグ 青物", description: "ショアジギングの基本アクションを動画で学ぶ" },
      { label: "ショアジギングで青物", searchQuery: "ショアジギング 青物 ブリ イナダ ヒット 実釣", description: "岸から青物をヒットさせる迫力の実釣映像" },
      { label: "メタルジグの選び方", searchQuery: "メタルジグ おすすめ 選び方 重さ カラー ショアジギング", description: "状況に合ったメタルジグの選び方ガイド" },
    ],
  },
  {
    slug: "choi-nage",
    name: "ちょい投げ",
    nameEn: "Light Surf Fishing",
    difficulty: "beginner",
    description: "軽いオモリで近距離に投げる手軽な投げ釣り。キスやハゼを砂浜や堤防から気軽に狙えます。",
    overview:
      "ちょい投げは、5〜15号程度の軽いオモリ（天秤）に餌をつけた仕掛けを20〜50m程度投げて、砂地に棲むキスやハゼなどの底物（そこもの）を狙う釣法です。本格的な投げ釣りのように100m以上の遠投は必要なく、万能竿やコンパクトロッドでも十分楽しめます。仕掛けを投げて底に着いたらゆっくり引きずる「サビき」の動作で広範囲を探れるのが特徴。餌はアオイソメ（ゴカイ）が万能で、釣具店で手軽に入手できます。夏のキス釣り、秋のハゼ釣りが特に人気です。",
    season: "5月〜11月（ベスト：6月〜10月）",
    bestMonths: [5, 6, 7, 8, 9, 10, 11],
    targetFish: [
      { name: "キス", slug: "kisu" },
      { name: "ハゼ", slug: "haze" },
      { name: "カレイ", slug: "karei" },
      { name: "メゴチ", slug: "megochi" },
    ],
    requiredGear: [
      { name: "竿", detail: "万能竿2.5〜3.6mまたはコンパクトロッド。ちょい投げ専用ロッドなら2.4m前後が扱いやすい。" },
      { name: "リール", detail: "2000〜3000番のスピニングリール。ナイロン3号が100m以上巻けるもの。" },
      { name: "天秤（テンビン）", detail: "ジェット天秤またはL字天秤 5〜15号。8号が汎用性が高い。" },
      { name: "仕掛け", detail: "ちょい投げ用2本針仕掛け（針7〜9号）。市販のセット仕掛けが便利。" },
      { name: "餌", detail: "アオイソメ（ゴカイ）が万能。1パック（500円前後）で半日分。砂虫も有効。" },
      { name: "竿立て", detail: "砂浜に刺すタイプや堤防用の三脚。アタリを待つ間に竿を固定できる。" },
    ],
    steps: [
      { title: "餌をつける", description: "アオイソメの頭から針を通し、針先を少し出します。長すぎると食い込みが悪いので、2〜3cmにカットすると食いが良くなります。" },
      { title: "軽く投げる", description: "竿を後ろに振りかぶり、前方に軽く投げます。20〜30mで十分です。着水したらリールのベイルを戻して糸ふけを取ります。" },
      { title: "底をサビく", description: "リールをゆっくり3〜5秒に1回転のペースで巻いて、仕掛けを底に沿って引きずります。この「サビき」で広範囲を探れます。" },
      { title: "止めてアタリを待つ", description: "数回サビいたら30秒〜1分ほど仕掛けを止めて待ちます。竿先がプルプルと震えたらアタリです。" },
      { title: "アワセて巻き上げる", description: "アタリがあったら竿を軽く立ててアワセ、リールを巻いて取り込みます。キスは口が柔らかいので強くアワセすぎない。" },
    ],
    tips: [
      "イソメを小さくカットすると食い込みが良くなる。特にハゼは小さいエサが有効",
      "砂地の海底がベストポイント。藻場や岩場は根掛かりが多いので避ける",
      "サビく速度を変えてみる。速めのサビきで反応する日もある",
      "複数本の竿を出して広範囲をカバーすると効率が良い",
      "キスは群れで行動するので、1匹釣れたら同じ場所を集中的に攻める",
    ],
    relatedMethods: [
      { slug: "sabiki", name: "サビキ釣り" },
      { slug: "uki-zuri", name: "ウキ釣り" },
      { slug: "ana-zuri", name: "穴釣り" },
    ],
    youtubeLinks: [
      { label: "ちょい投げ入門", searchQuery: "ちょい投げ 初心者 やり方 キス ハゼ 堤防", description: "ちょい投げの基本的なやり方を動画で解説" },
      { label: "ちょい投げでキス釣り", searchQuery: "ちょい投げ キス 砂浜 サーフ 実釣 夏", description: "砂浜からキスを狙うちょい投げ実釣映像" },
      { label: "天秤仕掛けの作り方", searchQuery: "ちょい投げ 仕掛け 作り方 天秤 初心者", description: "ちょい投げ仕掛けの選び方と作り方" },
    ],
  },
  {
    slug: "uki-zuri",
    name: "ウキ釣り",
    nameEn: "Float Fishing",
    difficulty: "beginner",
    description: "ウキ（浮き）を使って仕掛けを一定の深さに漂わせる伝統的な釣法。アタリがウキの動きでわかりやすいのが魅力。",
    overview:
      "ウキ釣りは、ウキ（フロート）を道糸に取り付け、仕掛けを一定のタナ（深さ）に保つ釣法です。魚がエサに食いつくとウキが沈んだり動いたりするため、アタリが視覚的にわかりやすく、初心者でも魚のバイトを見逃しにくいのが大きなメリットです。玉ウキを使ったシンプルな固定ウキ仕掛けから、遊動ウキ仕掛け、さらにはフカセ釣りまで、バリエーションが豊富。堤防からクロダイ、メジナ、アジ、サヨリなど多彩な魚種を狙えます。潮の流れにエサを乗せて自然に流すことで、警戒心の強い魚にも口を使わせることができます。",
    season: "通年（ベスト：3月〜6月、9月〜11月）",
    bestMonths: [3, 4, 5, 6, 9, 10, 11],
    targetFish: [
      { name: "クロダイ", slug: "kurodai" },
      { name: "メジナ", slug: "mejina" },
      { name: "アジ", slug: "aji" },
      { name: "サヨリ", slug: "sayori" },
    ],
    requiredGear: [
      { name: "竿", detail: "磯竿1〜1.5号 4.5〜5.3mが万能。堤防用なら3.6〜4.5mでもOK。" },
      { name: "リール", detail: "2500〜3000番のスピニングリール。レバーブレーキ付きだとやり取りが有利。" },
      { name: "ウキ", detail: "固定ウキ仕掛けなら玉ウキ。遊動ウキ仕掛けなら円錐ウキ（どんぐりウキ）。" },
      { name: "仕掛け", detail: "ハリス1〜2号、チヌ針1〜3号。ウキ止め、シモリ玉、ガン玉も必要。" },
      { name: "エサ", detail: "オキアミが万能。練り餌やアオイソメも状況に応じて使い分け。" },
      { name: "コマセ（撒き餌）", detail: "オキアミ＋配合餌で集魚。ヒシャクで撒いてポイントを作る。フカセ釣りの場合は必須。" },
    ],
    steps: [
      { title: "タナ（深さ）を設定する", description: "ウキ止めの位置でタナを調整します。最初は海底から50cm〜1mほど上に設定し、そこから微調整していきます。" },
      { title: "コマセを撒く", description: "ヒシャクでコマセを3〜5杯、同じポイントに撒きます。潮の流れを考慮して、仕掛けが流れていく先に撒くのがコツ。" },
      { title: "仕掛けを投入する", description: "コマセを撒いたポイントに仕掛けを投入します。ウキが立ったら、道糸のたるみを取って張らず緩めずの状態にします。" },
      { title: "ウキの動きを見る", description: "ウキが沈む、横に走る、ピクピク動くなどの変化があればアタリです。前アタリ（小さな動き）の後に本アタリ（ウキが沈む）が来ることが多い。" },
      { title: "アワセて取り込む", description: "ウキがしっかり沈んだら竿を立ててアワセます。大物の場合はリールのドラグを活用して無理なくやり取りしましょう。" },
    ],
    tips: [
      "コマセと仕掛けを同じ潮筋に流すことが最重要。コマセの中にエサを紛れ込ませるイメージ",
      "タナが合っていないと釣れない。周りの釣り人を参考にしたり、こまめにタナを変える",
      "ウキの沈み方で魚種がわかる。ゆっくり沈むのはクロダイ、一気に消し込むのはメジナ",
      "ガン玉の打ち方で仕掛けの沈み方が変わる。潮が速い日は重めに、緩い日は軽めに",
      "エサ取り（本命以外の小魚）が多い時は、練り餌やコーンに変えると効果的",
    ],
    relatedMethods: [
      { slug: "sabiki", name: "サビキ釣り" },
      { slug: "choi-nage", name: "ちょい投げ" },
      { slug: "ana-zuri", name: "穴釣り" },
    ],
    youtubeLinks: [
      { label: "ウキ釣り入門", searchQuery: "ウキ釣り 初心者 やり方 仕掛け 堤防", description: "ウキ釣りの基本を初心者向けに動画で解説" },
      { label: "ウキフカセでクロダイ", searchQuery: "ウキフカセ クロダイ チヌ 堤防 実釣", description: "ウキフカセ釣りでクロダイを狙う実釣映像" },
      { label: "ウキ仕掛けの作り方", searchQuery: "ウキ釣り 仕掛け 作り方 固定ウキ 遊動ウキ 初心者", description: "固定ウキ・遊動ウキ仕掛けの作り方ガイド" },
    ],
  },
  {
    slug: "ana-zuri",
    name: "穴釣り",
    nameEn: "Hole Fishing",
    difficulty: "beginner",
    description: "テトラポッドや岩の隙間にブラクリ仕掛けを落として根魚を狙う、シンプルで高確率な釣法です。",
    overview:
      "穴釣りは、テトラポッド（消波ブロック）や石積みの隙間に仕掛けを落として、穴の中に潜んでいるカサゴ・メバル・ソイなどの根魚（ロックフィッシュ）を狙う釣法です。投げる必要がなく、仕掛けを穴に落とすだけなので、釣りの経験がなくても簡単に始められます。根魚は居着きの魚（同じ場所に住み着く魚）なので、穴の中に魚がいれば高確率でバイトしてくるのが特徴。ただし、テトラの上を移動するため足場が不安定で、安全面には十分注意が必要です。通年楽しめますが、特に冬場は他の釣法が厳しい中でも安定して釣果が得られるため、冬の救世主的な釣法です。",
    season: "通年（ベスト：10月〜3月）",
    bestMonths: [10, 11, 12, 1, 2, 3],
    targetFish: [
      { name: "カサゴ", slug: "kasago" },
      { name: "メバル", slug: "mebaru" },
      { name: "ソイ", slug: "soi" },
      { name: "アイナメ", slug: "ainame" },
    ],
    requiredGear: [
      { name: "竿", detail: "穴釣り専用ロッド 1〜1.5mの短竿。100均の竿でも可。先調子で感度の良いもの。" },
      { name: "リール", detail: "小型スピニングリールまたはベイトリール。ベイトリールは片手操作ができて穴釣りに最適。" },
      { name: "ブラクリ仕掛け", detail: "3〜5号のブラクリ（オモリと針が一体の仕掛け）。赤色が定番。予備を多めに用意。" },
      { name: "エサ", detail: "アオイソメが万能。サバの切り身やオキアミでもOK。エサ持ちの良さではサバ切り身が優秀。" },
      { name: "フィッシュグリップ", detail: "カサゴの背びれは鋭いトゲがあるため、魚を掴むグリップがあると安全。" },
      { name: "滑りにくい靴", detail: "テトラの上を移動するため、スパイクシューズやフェルトシューズが必須。サンダルは厳禁。" },
    ],
    steps: [
      { title: "エサをつける", description: "アオイソメの場合は頭から針を通して2〜3cm使います。サバの切り身は1cm幅にカットして針に刺します。" },
      { title: "穴を見つける", description: "テトラの隙間で、海水が見える穴を探します。深さがある穴、潮が通る穴が好ポイント。影になっている暗い穴が狙い目です。" },
      { title: "仕掛けを落とす", description: "見つけた穴にブラクリ仕掛けをゆっくり落とし込みます。糸を出してスルスルと底まで沈めましょう。" },
      { title: "アタリを待つ", description: "底に着いたら少し持ち上げて待ちます。根魚は積極的に食ってくるので、10〜20秒でアタリが出ることが多いです。反応がなければ次の穴へ移動。" },
      { title: "一気に巻き上げる", description: "アタリがあったら即アワセ！根魚は穴に潜ろうとするので、掛けたら一気にリールを巻いて穴から引きずり出します。モタモタすると根に潜られます。" },
    ],
    tips: [
      "同じ穴に粘らない。反応がなければ20秒で次の穴へ移動するのが効率的",
      "穴の奥の暗い部分に魚がいる。仕掛けが底に着いたら少し待つだけで食ってくることが多い",
      "テトラの上は滑りやすいので、安全第一。必ず滑りにくい靴を履く",
      "冬場は他の釣法が厳しい中でも安定した釣果が期待できる",
      "釣れたカサゴは煮付けや唐揚げが絶品。小さいものはリリースしよう",
    ],
    relatedMethods: [
      { slug: "mebaring", name: "メバリング" },
      { slug: "sabiki", name: "サビキ釣り" },
      { slug: "choi-nage", name: "ちょい投げ" },
    ],
    youtubeLinks: [
      { label: "穴釣り入門", searchQuery: "穴釣り 初心者 やり方 テトラ カサゴ ブラクリ", description: "テトラでの穴釣りの基本を動画で学ぼう" },
      { label: "穴釣りでカサゴ連発", searchQuery: "穴釣り カサゴ 連発 テトラポッド 実釣", description: "テトラの穴からカサゴを次々と釣り上げる実釣映像" },
      { label: "穴釣りの安全対策", searchQuery: "穴釣り 安全 テトラ 靴 装備 注意点", description: "テトラでの穴釣りの安全装備と注意点" },
    ],
  },
];

export async function generateStaticParams() {
  return methods.map((method) => ({
    slug: method.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const method = methods.find((m) => m.slug === slug);
  if (!method) return { title: "釣法が見つかりません" };

  return {
    title: `${method.name}（${method.nameEn}）完全ガイド - 必要な道具・釣り方・コツを徹底解説`,
    description: `${method.name}の始め方を初心者向けに完全解説。必要なタックル、釣り方の手順、釣果アップのコツ、おすすめの時期まで網羅。${method.description}`,
    openGraph: {
      title: `${method.name}（${method.nameEn}）完全ガイド`,
      description: `${method.name}の必要な道具・釣り方・コツを初心者向けに徹底解説。${method.description}`,
      type: "article",
      url: `https://tsurispot.com/methods/${method.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/methods/${method.slug}`,
    },
  };
}

export default async function MethodDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const method = methods.find((m) => m.slug === slug);
  if (!method) notFound();

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
        name: "釣り方・釣法ガイド",
        item: "https://tsurispot.com/methods",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: method.name,
        item: `https://tsurispot.com/methods/${method.slug}`,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${method.name}（${method.nameEn}）完全ガイド`,
    description: method.description,
    author: {
      "@type": "Organization",
      name: "ツリスポ",
      url: "https://tsurispot.com",
    },
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣り方", href: "/methods" },
          { label: method.name },
        ]}
      />
      <Link
        href="/methods"
        className="mb-5 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary min-h-[44px] sm:mb-6"
      >
        <ArrowLeft className="size-4" />
        釣り方・釣法ガイドに戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 p-5 sm:mb-8 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {method.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {method.nameEn}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge
              className={`text-sm ${DIFFICULTY_MAP[method.difficulty].className}`}
            >
              {DIFFICULTY_MAP[method.difficulty].label}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-sm"
            >
              <Calendar className="size-3" />
              {method.season}
            </Badge>
          </div>
        </div>
      </div>

      {/* この釣り方とは */}
      <section className="mb-6 sm:mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
          <Target className="size-5 text-primary" />
          この釣り方とは
        </h2>
        <Card className="gap-0 py-0">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {method.overview}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 必要なタックル */}
      <section className="mb-6 sm:mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
          <Wrench className="size-5 text-primary" />
          必要なタックル
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {method.requiredGear.map((gear) => (
            <Card key={gear.name} className="gap-0 py-0">
              <CardContent className="p-4">
                <p className="font-semibold text-sm">{gear.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {gear.detail}
                </p>
                {gear.affiliateUrl && (
                  <a
                    href={gear.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#FF9900] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#E88B00]"
                  >
                    Amazonで見る
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 釣り方の手順 */}
      <section className="mb-6 sm:mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
          <ListOrdered className="size-5 text-primary" />
          釣り方の手順
        </h2>
        <Card className="gap-0 py-0">
          <CardContent className="p-4 sm:p-6">
            <ol className="list-none space-y-4">
              {method.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* 釣果アップのコツ */}
      <section className="mb-6 sm:mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
          <Lightbulb className="size-5 text-primary" />
          釣果アップのコツ
        </h2>
        <Card className="gap-0 py-0">
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {method.tips.map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 参考動画 */}
      {method.youtubeLinks.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <YouTubeVideoList links={method.youtubeLinks} />
        </section>
      )}

      {/* 対象魚 */}
      <section className="mb-6 sm:mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
          <Fish className="size-5 text-primary" />
          対象魚
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {method.targetFish.map((fish) => (
            <Link key={fish.slug} href={`/fish/${fish.slug}`}>
              <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <Fish className="size-5 shrink-0 text-sky-300" />
                  <span className="text-sm font-semibold group-hover:text-primary">
                    {fish.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* おすすめのスポット */}
      <section className="mb-6 sm:mb-8">
        <Link href="/spots">
          <Card className="group gap-0 py-0 border-sky-200 bg-sky-50 transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100">
                <MapPin className="size-5 text-sky-600" />
              </div>
              <div>
                <p className="font-semibold group-hover:text-primary">
                  {method.name}ができるスポットを探す
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  全国の釣りスポットから{method.name}に適した場所を見つけよう
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* 関連する釣法 */}
      <section className="mb-8">
        <h2 className="mb-4 text-base font-bold sm:text-lg">
          関連する釣法
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          {method.relatedMethods.map((related) => (
            <Link key={related.slug} href={`/methods/${related.slug}`}>
              <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-semibold group-hover:text-primary">
                    {related.name}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 関連ページ */}
      <div className="rounded-xl border bg-muted/30 p-6">
        <h2 className="mb-4 text-lg font-bold">関連ページ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/guide"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">釣りの始め方ガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">
              初心者向けステップバイステップ
            </p>
          </Link>
          <Link
            href="/beginner-checklist"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">持ち物チェックリスト</p>
            <p className="mt-1 text-xs text-muted-foreground">
              忘れ物防止チェックリスト
            </p>
          </Link>
          <Link
            href="/seasonal"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">季節別釣りガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">
              春夏秋冬のおすすめ釣り
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
