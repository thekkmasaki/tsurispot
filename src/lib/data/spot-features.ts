// 「特徴から探す」: スポットの設備・ルール属性で切った一覧ページ（/spot-feature/[feature]/[prefecture]）の定義。
// サウナイキタイの「特徴から探す（ロウリュ・銭湯サウナ等）」を参考に、星評価ではなく条件で探す導線を作る。
// 件数が少ない県ページは薄いコンテンツになるため MIN_SPOTS_PER_PREF 未満は生成せず親へ 301。
import type { FishingSpot } from "@/types";
import { fishingSpots } from "@/lib/data/spots";
import { prefectures, type Prefecture } from "@/lib/data/prefectures";

export const MIN_SPOTS_PER_PREF = 3;

export type SpotFeatureIcon =
  | "toilet"
  | "family"
  | "beginner"
  | "free"
  | "parking"
  | "night"
  | "casting"
  | "lure"
  | "chum"
  | "rental"
  | "shop"
  | "store";

export interface SpotFeature {
  slug: string;
  /** 一覧見出し用（例: トイレあり） */
  label: string;
  /** タイトル用の言い回し（例: トイレがある釣り場） */
  heading: string;
  icon: SpotFeatureIcon;
  /** 一覧冒頭の説明（オリジナル文。どういう基準で抽出したかを明記） */
  intro: string;
  /** その条件で釣りに行くときのワンポイント */
  tips: string[];
  match: (spot: FishingSpot) => boolean;
}

export const SPOT_FEATURES: SpotFeature[] = [
  {
    slug: "toilet",
    label: "トイレあり",
    heading: "トイレがある釣り場",
    icon: "toilet",
    intro:
      "釣り場から歩ける範囲にトイレがあるスポットだけを集めました。半日以上の釣行や、女性・子ども連れの釣りではトイレの有無が釣り場選びの一番の決め手になります。",
    tips: [
      "公園や漁港のトイレは夜間に施錠される場合があります。夜釣りの前に利用時間を確認しておきましょう。",
      "トイレを汚す・まき餌の手を洗う行為は釣り禁止の原因になります。マナーを守って使いましょう。",
    ],
    match: (s) => s.hasToilet,
  },
  {
    slug: "family",
    label: "ファミリー向け",
    heading: "子連れ・ファミリーで行ける釣り場",
    icon: "family",
    intro:
      "トイレと駐車場があり、安全面で大きな注意点がないスポットを「ファミリー向け」として抽出しています。車で行けて、トイレの心配がなく、足元が比較的安全な場所です。",
    tips: [
      "子どもには必ずライフジャケットを着せましょう。足場が良い場所でも転落事故は起きています。",
      "最初はサビキ釣りなど、仕掛けを落とすだけで釣れる釣り方がおすすめです。",
    ],
    match: (s) => s.hasToilet && s.hasParking && s.safetyLevel === "safe",
  },
  {
    slug: "beginner",
    label: "初心者向け",
    heading: "初心者におすすめの釣り場",
    icon: "beginner",
    intro:
      "ツリスポで難易度を「初心者向け」としているスポットの一覧です。足場や釣りやすさ、釣れる魚の種類から、初めての人でも釣果を出しやすい場所を選んでいます。",
    tips: [
      "釣具店で「今どこで何が釣れているか」を聞くのが一番の近道です。",
      "朝夕のマズメ時は魚の活性が上がりやすく、初心者でも釣りやすい時間帯です。",
    ],
    match: (s) => s.difficulty === "beginner",
  },
  {
    slug: "free",
    label: "無料で釣れる",
    heading: "無料で釣りができる釣り場",
    icon: "free",
    intro:
      "入場料や釣り料金がかからないスポットの一覧です。駐車場代や遊漁券（川・湖）は別途必要な場合があるため、詳細は各スポットページで確認してください。",
    tips: [
      "無料の釣り場は管理者がいないぶん、ゴミの持ち帰りなどマナー違反が続くと釣り禁止になりやすい場所です。",
      "川や湖では無料に見えても遊漁券が必要なことがあります。",
    ],
    match: (s) => s.isFree,
  },
  {
    slug: "parking",
    label: "駐車場あり",
    heading: "駐車場がある釣り場",
    icon: "parking",
    intro:
      "近くに駐車場があり、車で行きやすいスポットの一覧です。荷物の多い投げ釣りやクーラーボックスを持っていく釣行に向いています。",
    tips: [
      "人気の釣り場は休日の朝に駐車場が満車になりがちです。早めの到着を心がけましょう。",
      "漁港内の路上駐車や作業スペースへの駐車は厳禁です。",
    ],
    match: (s) => s.hasParking,
  },
  {
    slug: "night",
    label: "夜釣りOK",
    heading: "夜釣りができる釣り場",
    icon: "night",
    intro:
      "ルール上、夜間の釣りが認められているスポットの一覧です。アジ・メバル・タチウオ・アオリイカなど、夜に活性が上がる魚を狙うときに使ってください。",
    tips: [
      "ヘッドライトとライフジャケットは必須です。足元が見えにくく、昼より転落の危険が高まります。",
      "住宅地に近い釣り場では、話し声や車のドアの音にも気を配りましょう。",
    ],
    match: (s) => s.rules?.nightFishing === true,
  },
  {
    slug: "casting",
    label: "投げ釣りOK",
    heading: "投げ釣りができる釣り場",
    icon: "casting",
    intro:
      "投げ釣り（キャスト）が禁止されていないことを確認できたスポットの一覧です。キス・カレイなどをちょい投げや本格的な投げ釣りで狙えます。",
    tips: [
      "投げる前は必ず後ろと左右を確認しましょう。混雑時はちょい投げに切り替えるのが安全です。",
    ],
    match: (s) => s.rules?.castingAllowed === true,
  },
  {
    slug: "lure",
    label: "ルアーOK",
    heading: "ルアー釣りができる釣り場",
    icon: "lure",
    intro:
      "ルアー釣りが禁止されていないことを確認できたスポットの一覧です。シーバス・青物・アオリイカ（エギング）・根魚などをルアーで狙えます。",
    tips: [
      "海釣り公園などでは、ルアーの種類や投げ方に制限があることがあります。現地の掲示を確認しましょう。",
    ],
    match: (s) => s.rules?.lureAllowed === true,
  },
  {
    slug: "chum",
    label: "コマセOK",
    heading: "コマセ（まき餌）が使える釣り場",
    icon: "chum",
    intro:
      "サビキ釣りやフカセ釣りで使うコマセ（まき餌）が禁止されていないことを確認できたスポットの一覧です。アジ・サバ・イワシ・グレ・チヌ狙いの釣り場選びに。",
    tips: [
      "使ったあとは足元を海水で洗い流しましょう。コマセの汚れは釣り禁止の大きな原因です。",
    ],
    match: (s) => s.rules?.chumAllowed === true,
  },
  {
    slug: "rental",
    label: "レンタル竿あり",
    heading: "レンタル竿がある釣り場",
    icon: "rental",
    intro:
      "現地で釣り竿を借りられるスポットの一覧です。道具を持っていなくても手ぶらで釣りを始められるので、初めての釣りや旅行先での釣りに向いています。",
    tips: [
      "レンタルは数に限りがあります。休日は早めに行くか、事前に電話で確認しましょう。",
    ],
    match: (s) => s.hasRentalRod,
  },
  {
    slug: "fishing-shop",
    label: "釣具店が近い",
    heading: "近くに釣具店がある釣り場",
    icon: "shop",
    intro:
      "近くに釣具店やエサ屋があるスポットの一覧です。エサの買い足しや、忘れ物・仕掛けのトラブルにもすぐ対応できます。",
    tips: [
      "釣具店では最新の釣果情報も聞けます。釣り場に行く前に立ち寄るのがおすすめです。",
    ],
    match: (s) => s.hasFishingShop,
  },
  {
    slug: "convenience-store",
    label: "コンビニが近い",
    heading: "近くにコンビニがある釣り場",
    icon: "store",
    intro:
      "近くにコンビニがあるスポットの一覧です。食事や飲み物、氷の買い足しができるので、長時間の釣りでも身軽に出かけられます。",
    tips: [
      "夏場はクーラーボックスの氷をこまめに足しましょう。釣った魚の鮮度が大きく変わります。",
    ],
    match: (s) => s.hasConvenienceStore,
  },
];

export function getSpotFeature(slug: string): SpotFeature | undefined {
  return SPOT_FEATURES.find((f) => f.slug === slug);
}

/** 釣り禁止中のスポットは一覧に出さない */
function listableSpots(): FishingSpot[] {
  return fishingSpots.filter((s) => !s.fishingBan);
}

export function getFeatureSpots(feature: SpotFeature, prefName?: string): FishingSpot[] {
  return listableSpots()
    .filter((s) => feature.match(s) && (!prefName || s.region.prefecture === prefName))
    .sort((a, b) => b.rating - a.rating);
}

/** feature の県別件数（件数降順ではなく prefectures の並び順＝北から南） */
export function getFeaturePrefCounts(
  feature: SpotFeature,
): { pref: Prefecture; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of listableSpots()) {
    if (!feature.match(s)) continue;
    counts.set(s.region.prefecture, (counts.get(s.region.prefecture) ?? 0) + 1);
  }
  return prefectures
    .map((pref) => ({ pref, count: counts.get(pref.name) ?? 0 }))
    .filter((x) => x.count > 0);
}

/** 県ページを生成する（= 件数が MIN_SPOTS_PER_PREF 以上の）feature×県の組み合わせ */
export function getFeaturePrefCombos(): { feature: string; prefecture: string }[] {
  const combos: { feature: string; prefecture: string }[] = [];
  for (const f of SPOT_FEATURES) {
    for (const { pref, count } of getFeaturePrefCounts(f)) {
      if (count >= MIN_SPOTS_PER_PREF) combos.push({ feature: f.slug, prefecture: pref.slug });
    }
  }
  return combos;
}

/** 指定県で県ページが存在する feature と件数（県ページ・トップの「特徴から探す」用） */
export function getFeaturesForPref(prefName: string): { feature: SpotFeature; count: number }[] {
  const spots = listableSpots().filter((s) => s.region.prefecture === prefName);
  return SPOT_FEATURES.map((feature) => ({
    feature,
    count: spots.filter(feature.match).length,
  })).filter((x) => x.count >= MIN_SPOTS_PER_PREF);
}
