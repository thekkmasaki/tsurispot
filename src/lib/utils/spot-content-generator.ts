/**
 * スポット固有コンテンツ生成ユーティリティ
 *
 * スポットデータ（spotType, region, catchableFish, difficulty, facilities等）を
 * 組み合わせて、スポットごとに異なる自然文を動的生成する。
 * AdSense審査で「有用性の低いコンテンツ」と判定されないよう、テンプレート感を排除。
 */

import type { FishingSpot, CatchableFish } from "@/types";
import { SPOT_TYPE_LABELS } from "@/types";

// ── 型定義 ────────────────────────────────────
type SpotType = FishingSpot["spotType"];
type Difficulty = FishingSpot["difficulty"];

const monthNames: Record<number, string> = {
  1: "1月", 2: "2月", 3: "3月", 4: "4月", 5: "5月", 6: "6月",
  7: "7月", 8: "8月", 9: "9月", 10: "10月", 11: "11月", 12: "12月",
};

// ── 地域グルーピング（気候・文化差を反映） ────────────
type RegionGroup = "hokkaido" | "tohoku" | "kanto" | "chubu" | "kinki" | "chugoku" | "shikoku" | "kyushu";

const PREFECTURE_TO_REGION: Record<string, RegionGroup> = {
  "北海道": "hokkaido",
  "青森県": "tohoku", "岩手県": "tohoku", "宮城県": "tohoku",
  "秋田県": "tohoku", "山形県": "tohoku", "福島県": "tohoku",
  "茨城県": "kanto", "栃木県": "kanto", "群馬県": "kanto",
  "埼玉県": "kanto", "千葉県": "kanto", "東京都": "kanto", "神奈川県": "kanto",
  "新潟県": "chubu", "富山県": "chubu", "石川県": "chubu", "福井県": "chubu",
  "山梨県": "chubu", "長野県": "chubu", "岐阜県": "chubu",
  "静岡県": "chubu", "愛知県": "chubu", "三重県": "chubu",
  "滋賀県": "kinki", "京都府": "kinki", "大阪府": "kinki",
  "兵庫県": "kinki", "奈良県": "kinki", "和歌山県": "kinki",
  "鳥取県": "chugoku", "島根県": "chugoku", "岡山県": "chugoku",
  "広島県": "chugoku", "山口県": "chugoku",
  "徳島県": "shikoku", "香川県": "shikoku", "愛媛県": "shikoku", "高知県": "shikoku",
  "福岡県": "kyushu", "佐賀県": "kyushu", "長崎県": "kyushu",
  "熊本県": "kyushu", "大分県": "kyushu", "宮崎県": "kyushu",
  "鹿児島県": "kyushu", "沖縄県": "kyushu",
};

function getRegionGroup(prefecture: string): RegionGroup {
  return PREFECTURE_TO_REGION[prefecture] || "kanto";
}

// ── 地域の気候特性 ──────────────────────────
const REGION_CLIMATE: Record<RegionGroup, string> = {
  hokkaido: "冬は厳しい寒さになるため防寒対策が必須。夏場は涼しく快適に釣りが楽しめる地域",
  tohoku: "冬場は日本海側を中心に荒天が多い。春〜秋がメインシーズン",
  kanto: "年間を通じて比較的温暖で、四季折々の釣りが楽しめる地域",
  chubu: "太平洋側と日本海側で気候差が大きい。太平洋側は温暖、日本海側は冬に荒れやすい",
  kinki: "瀬戸内海側は穏やかな気候で年中釣りやすい。紀伊半島の外洋側は黒潮の恩恵で魚種豊富",
  chugoku: "瀬戸内海側は穏やかで年間を通じて釣りやすい。日本海側は冬場に時化やすい",
  shikoku: "太平洋側は黒潮の影響で大型の回遊魚も期待できる。瀬戸内海側は穏やかで初心者にも適した環境",
  kyushu: "温暖な気候で年間を通じて釣りが楽しめる。特に対馬暖流の影響で魚種が非常に豊富",
};

// ── spotType別の特性文言 ──────────────────────
const SPOT_TYPE_FEATURES: Record<SpotType, {
  atmosphere: string;
  merit: string;
  caution: string;
  familyTip: string;
}> = {
  port: {
    atmosphere: "波穏やかな港内は足場が安定しており、車を横付けできるポイントもある",
    merit: "堤防の内側・外側で狙える魚種が変わるため、状況に応じてポイントを移動できる",
    caution: "漁船の出入りがあるため、係留ロープや船の航路には十分注意が必要",
    familyTip: "足場が安定した港内側がファミリーにおすすめ。車横付けできるポイントなら荷物の運搬も楽",
  },
  breakwater: {
    atmosphere: "沖に張り出した堤防は潮通しがよく、回遊魚の接岸が期待できる",
    merit: "足場が平坦で広く、竿出しポイントが多い。先端部は特に魚影が濃い",
    caution: "先端部は波をかぶることがあるため、天候と波の状況を確認してから入釣すること",
    familyTip: "付け根付近は波の影響が少なく安全。ライフジャケットは必ず着用を",
  },
  rocky: {
    atmosphere: "荒々しい自然の磯場は、大物が潜むダイナミックな釣り場",
    merit: "潮通し抜群で大型の魚が期待できる。フカセ釣りやルアー釣りの好ポイント",
    caution: "足場が不安定なため磯靴・ライフジャケットは必須。波の状況を常に確認すること",
    familyTip: "磯場は足場が悪く危険なため、小さなお子様連れにはおすすめしません",
  },
  river: {
    atmosphere: "自然豊かな河川は、清流のせせらぎを聞きながらの癒しの釣りが楽しめる",
    merit: "淡水魚から汽水域の魚まで多彩なターゲットが狙える。河口部は特に魚種豊富",
    caution: "増水時は非常に危険。雨天時や上流のダム放流情報を必ず確認すること",
    familyTip: "浅瀬のポイントなら子どもでも安全に楽しめる。ライフジャケットは必須",
  },
  beach: {
    atmosphere: "開放的な砂浜は、のんびりとした雰囲気の中で投げ釣りが楽しめる",
    merit: "広大なフィールドで場所取りの心配が少ない。遠投すれば沖のポイントも攻略可能",
    caution: "離岸流に注意。ウェーディングする場合はライフジャケットを着用すること",
    familyTip: "波打ち際での釣りは子どもも楽しめる。砂遊びもできるのでファミリーレジャーにも最適",
  },
  pier: {
    atmosphere: "桟橋からの釣りは足場が良く、海面との距離が近いため魚のアタリがダイレクトに伝わる",
    merit: "足場が安定しており、初心者でも安心して釣りを楽しめる。海面に近いため取り込みも容易",
    caution: "桟橋の利用ルール（営業時間・竿数制限等）を事前に確認すること",
    familyTip: "安全柵のある桟橋なら子ども連れでも安心。管理された施設は設備も充実している",
  },
};

// ── difficulty別の総評テンプレート ──────────────────
const DIFFICULTY_SUMMARIES: Record<Difficulty, (name: string, topFish: string) => string> = {
  beginner: (name, topFish) =>
    `${name}は初心者にもやさしい釣り場です。${topFish}など比較的釣りやすい魚種が豊富で、はじめての釣りにもおすすめできます`,
  intermediate: (name, topFish) =>
    `${name}は基本的な釣りの経験がある方に適した釣り場です。${topFish}など釣りごたえのあるターゲットが揃っています`,
  advanced: (name, topFish) =>
    `${name}は経験豊富な釣り人向けの釣り場です。${topFish}など大物や難易度の高いターゲットに挑戦できます`,
};

// ── 魚種別の狙い方ヒント ──────────────────────
const FISH_TIPS: Record<string, string> = {
  "アジ": "サビキ仕掛けのハリスは1〜1.5号が食い込みがよい。コマセは少量ずつ撒いて群れを留める",
  "サバ": "回遊が始まると入れ食いになることも。サビキの針は小さめ5〜6号で手返しよく",
  "イワシ": "群れが入れば数釣りが楽しめる。仕掛けは4〜5号の小さめの針で対応",
  "メバル": "夜釣りが効果的。常夜灯の明暗の境目をジグヘッドで探るのが基本",
  "カサゴ": "テトラや岩の隙間に潜む。ブラクリ仕掛けで穴の奥まで丁寧に探る",
  "チヌ": "フカセ釣りでコマセワークが重要。ウキ下をこまめに調整して底付近を攻める",
  "グレ": "潮が動くタイミングが勝負。コマセと付けエサの同調が釣果の鍵",
  "アオリイカ": "エギは3.5号を基準に、秋は2.5号、春は3.5〜4号で狙い分ける",
  "キス": "仕掛けをゆっくり引きずるサビキ釣りが基本。底をコツコツと感じるテンションで",
  "カレイ": "投げ釣りの定番。仕掛けを投げたら竿掛けに置いて待つ「置き竿」スタイルが基本",
  "ハマチ": "ナブラ（水面のボイル）を見つけたらメタルジグを素早くキャスト。朝マヅメが狙い目",
  "タチウオ": "夕マヅメから夜にかけてが本番。ケミホタルを付けたウキ釣りやワインドが効果的",
  "クロダイ": "落とし込み釣りが堤防の定番。壁際をカニやイガイで丁寧に探る",
  "スズキ": "シーバスとも呼ばれる。河口部のナイトゲームが人気。ミノーのただ巻きから始めてみよう",
  "マダイ": "カゴ釣りで沖のポイントを狙う。タナ（深さ）の設定が釣果を左右する",
  "ヒラメ": "泳がせ釣りで小魚をエサに底付近を攻める。アタリがあってもすぐに合わせず「ヒラメ40」と言われるように待つ",
  "コノシロ": "サビキ釣りで簡単に数釣りできる。泳がせのエサとしても重宝する",
  "サヨリ": "表層を群れで泳ぐ。専用のサヨリ仕掛けでコマセを効かせながら狙う",
  "ハゼ": "ちょい投げの入門に最適。アオイソメのちょん掛けでOK。アタリが明確で楽しい",
  "アイナメ": "岩礁帯やテトラ周りに潜む。ブラクリ仕掛けやワームで丁寧に探る",
};

// ── 釣り方×スポットタイプの文脈別説明 ──────────────────
const METHOD_CONTEXT: Record<string, Record<string, string>> = {
  "サビキ釣り": {
    port: "港内の常夜灯付近や足場のよい岸壁がベストポイント。コマセカゴにアミエビを詰めて上下に振れば、群れが寄ってきます",
    breakwater: "堤防の内側がおすすめ。外洋向きは潮が速すぎるため、内側の穏やかなポイントで",
    pier: "桟橋の先端部は水深があるため、サビキ仕掛けが効きやすい。足元の回遊を狙おう",
    beach: "砂浜からのサビキは難しい。近くに堤防や波止があればそちらがおすすめ",
    rocky: "磯からのサビキはあまり一般的ではないが、足場の安定した場所なら可能",
    river: "河口域ではサビキ釣りでボラやコノシロが狙える。汽水域ならではの釣果が期待できる",
  },
  "ちょい投げ": {
    port: "港内の砂地ポイントを狙う。船の係留場所を避け、砂底の岸壁際がポイント",
    breakwater: "堤防の足元から20〜30m先の砂底がポイント。底をゆっくりサビいて魚を探す",
    pier: "桟橋からの足元投げでも十分。キスやハゼが狙える砂底のポイントを選ぼう",
    beach: "砂浜からのちょい投げはキスの王道。50〜80m投げれば沖のカケアガリを攻略できる",
    rocky: "磯場は根掛かりが多いためちょい投げには不向き。砂地がある入り江なら可能",
    river: "河口の砂泥底がポイント。ハゼ釣りの基本スタイル。オモリは3〜5号で軽めに",
  },
  "エギング": {
    port: "漁港内の常夜灯周りが秋イカの好ポイント。墨跡を目印にポイントを探すのがコツ",
    breakwater: "堤防先端部の潮通しのよいポイントが狙い目。ボトムステイを長めにとると効果的",
    pier: "桟橋からのエギングも有効。足元の藻場周りにイカが潜んでいることが多い",
    beach: "砂浜からのエギングは藻場が隣接するポイントが狙い目。秋は浅場に小型が多い",
    rocky: "磯からのエギングは大型が期待できる。根掛かり対策にシャロータイプのエギも用意",
    river: "河口域でのエギングは秋のアオリイカシーズンに有効。汽水域の藻場がポイント",
  },
  "ショアジギング": {
    port: "漁港の外向き堤防がメインポイント。朝マヅメのナブラ打ちが最も釣果を得やすい",
    breakwater: "堤防先端から沖にフルキャスト。メタルジグ30〜40gをハイピッチジャークで巻き上げる",
    pier: "桟橋からの場合はライトショアジギで対応。15〜20gの軽めのジグが使いやすい",
    beach: "遠浅の砂浜では飛距離が出るメタルジグ40g以上を使って沖の回遊ルートを直撃",
    rocky: "磯からのショアジギは大型青物のチャンス。足場確保とランディング方法を事前に確認",
    river: "河口部では回遊するシーバスやブリの若魚を狙える。ジグのウエイトは20〜30gが目安",
  },
  "ウキ釣り": {
    port: "港内の足元からウキを流す。チヌやメジナが堤防際に付いていることが多い",
    breakwater: "堤防の外向きにウキを流して潮の効くポイントを攻める。ウキ下の調整が鍵",
    pier: "桟橋の足元にウキを流す。海面に近いのでウキの動きが見やすく初心者にもおすすめ",
    beach: "砂浜からの遠投ウキ釣りでキスやカレイを狙う。オモリ内蔵のウキで飛距離を稼ぐ",
    rocky: "磯のフカセ釣りの基本。潮目やサラシの際にコマセとウキ仕掛けを同調させる",
    river: "河川でのウキ釣りは万能。セイゴやチヌ、ハゼなど様々な魚種に対応できる",
  },
  "穴釣り": {
    port: "漁港のテトラポッド周りが定番。ブラクリ仕掛けを隙間に落としてカサゴを狙う",
    breakwater: "堤防のテトラ帯は穴釣りの宝庫。根掛かりを恐れず、テンポよく穴を探り歩こう",
    pier: "桟橋の橋脚周りにもカサゴが潜む。足元に仕掛けを落とすだけで釣れることも",
    beach: "砂浜には穴釣りポイントは少ないが、消波ブロック帯があれば狙える",
    rocky: "岩の隙間に仕掛けを差し込む。磯の穴釣りは意外な大物が潜んでいることも",
    river: "河川では穴釣りの対象ポイントは少ないが、河口の消波ブロック帯なら可能",
  },
  "ルアー釣り": {
    port: "漁港内の常夜灯周りでメバリングやアジングが楽しめる。ナイトゲームが特に有効",
    breakwater: "堤防先端から沖に向かってキャスト。回遊魚やシーバスを幅広いルアーで狙える",
    pier: "桟橋の橋脚周りはシーバスの好ポイント。ミノーやバイブレーションのただ巻きが基本",
    beach: "サーフゲームでヒラメやマゴチを狙う。ミノーのただ巻きやジグのリフト&フォールが効果的",
    rocky: "磯のルアーゲームは大型青物やヒラスズキが期待できる。根掛かり対策にフローティングミノーを",
    river: "河口のシーバスゲームが人気。ミノーやバイブレーションで流れのヨレを攻める",
  },
  "泳がせ釣り": {
    port: "サビキで釣った小魚をそのままエサに使う。港内の沖向きに仕掛けを入れて大物を待つ",
    breakwater: "堤防先端がベスト。サビキで確保したアジやイワシをエサに青物やヒラメを狙う",
    pier: "桟橋の深場で泳がせ釣りが効果的。足元にエサを泳がせて大型魚のアタリを待つ",
    beach: "砂浜からの遠投泳がせでヒラメを狙う。キスをエサにするのが定番",
    rocky: "磯からの泳がせはスリル満点。大型青物やクエなどの超大物が狙える",
    river: "河口部でハゼをエサにマゴチやヒラメを狙える。底付近を泳がせるのがコツ",
  },
  "遠投カゴ釣り": {
    port: "漁港の外向き堤防から沖のポイントを狙う。マダイやイサキが主なターゲット",
    breakwater: "堤防からカゴを遠投して沖の魚を攻略。タナの設定がポイント。3〜5ヒロが基本",
    pier: "桟橋からのカゴ釣りも可能だが、周囲の釣り人との距離に注意",
    beach: "砂浜からの遠投カゴは飛距離が出しやすい。シロギスやカレイの実績も",
    rocky: "磯からのカゴ釣りは大型マダイやイサキの実績多数。足場確保が重要",
    river: "河口域でのカゴ釣りは一般的ではないが、開けた河口部なら回遊魚を狙える",
  },
  "投げ釣り": {
    port: "港内の砂地を狙って投げ入れる。カレイやキスがメインターゲット",
    breakwater: "堤防からの投げ釣りは定番。ジェット天秤で遠投し、底物を狙う",
    pier: "桟橋からの投げ釣りは足場がよく初心者にも安心。キスやカレイが狙える",
    beach: "砂浜からの本格的な投げ釣り。遠投すればするほど大型のキスが期待できる",
    rocky: "磯場は根掛かりが多いため投げ釣りには不向き。砂地の入り江なら可能",
    river: "河口の砂泥底で投げ釣り。ハゼやカレイが主なターゲット",
  },
  "フカセ釣り": {
    port: "漁港の堤防際にコマセを効かせてチヌやメジナを狙う。足元がポイント",
    breakwater: "堤防の外向きで潮目を狙う。コマセワークとウキの操作が釣果を分ける",
    pier: "桟橋の足元でのフカセ釣りも有効。海面に近いのでアタリが取りやすい",
    beach: "砂浜からのフカセ釣りは一般的ではない。近くの磯や堤防がおすすめ",
    rocky: "磯のフカセ釣りは王道。グレやチヌをコマセで寄せてウキ仕掛けで釣る",
    river: "河口でのフカセ釣りはチヌが主なターゲット。汽水域独特のパターンを攻略",
  },
};

// ── ヘルパー関数 ─────────────────────────────

function getTopFishNames(spot: FishingSpot, count: number = 3): string {
  return spot.catchableFish.slice(0, count).map(cf => cf.fish.name).join("・");
}

function getEasyFish(spot: FishingSpot): CatchableFish[] {
  return spot.catchableFish.filter(cf => cf.catchDifficulty === "easy");
}

function getUniqueMethods(spot: FishingSpot): string[] {
  const seen = new Set<string>();
  return spot.catchableFish.filter(cf => {
    if (seen.has(cf.method)) return false;
    seen.add(cf.method);
    return true;
  }).map(cf => cf.method);
}

function getBestMonths(spot: FishingSpot): string[] {
  const monthCounts = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return {
      month: m,
      count: spot.catchableFish.filter(cf => {
        if (cf.monthStart <= cf.monthEnd) return m >= cf.monthStart && m <= cf.monthEnd;
        return m >= cf.monthStart || m <= cf.monthEnd;
      }).length,
    };
  });
  const maxCount = Math.max(...monthCounts.map(mc => mc.count));
  return monthCounts.filter(mc => mc.count === maxCount).map(mc => monthNames[mc.month]);
}

function getSeasonFish(spot: FishingSpot): { spring: string[]; summer: string[]; autumn: string[]; winter: string[] } {
  const result = { spring: [] as string[], summer: [] as string[], autumn: [] as string[], winter: [] as string[] };
  const seen = { spring: new Set<string>(), summer: new Set<string>(), autumn: new Set<string>(), winter: new Set<string>() };

  for (const cf of spot.catchableFish) {
    for (let m = cf.monthStart; ; m = m % 12 + 1) {
      const name = cf.fish.name;
      if (m >= 3 && m <= 5 && !seen.spring.has(name)) { seen.spring.add(name); result.spring.push(name); }
      if (m >= 6 && m <= 8 && !seen.summer.has(name)) { seen.summer.add(name); result.summer.push(name); }
      if (m >= 9 && m <= 11 && !seen.autumn.has(name)) { seen.autumn.add(name); result.autumn.push(name); }
      if ((m === 12 || m <= 2) && !seen.winter.has(name)) { seen.winter.add(name); result.winter.push(name); }
      if (m === cf.monthEnd) break;
    }
  }
  return result;
}

function getFacilityText(spot: FishingSpot): string {
  const parts: string[] = [];
  if (spot.hasParking) {
    parts.push(spot.parkingDetail ? `駐車場あり（${spot.parkingDetail}）` : "駐車場あり");
  } else {
    parts.push("駐車場なし（近隣のコインパーキング等をご利用ください）");
  }
  if (spot.hasToilet) parts.push("トイレあり");
  else parts.push("トイレなし（近隣施設をご利用ください）");
  if (spot.hasConvenienceStore) parts.push("コンビニ近く");
  if (spot.hasFishingShop) parts.push("近くに釣具店あり");
  if (spot.hasRentalRod) parts.push(spot.rentalDetail ? `レンタル竿あり（${spot.rentalDetail}）` : "レンタル竿あり");
  return parts.join("。");
}

// ── 公開API ──────────────────────────────

/**
 * スポット導入文（200-300文字）
 * spotType × difficulty × region × fish で固有の文章を生成
 */
export function generateSpotIntro(spot: FishingSpot): string {
  const typeLabel = SPOT_TYPE_LABELS[spot.spotType];
  const typeFeatures = SPOT_TYPE_FEATURES[spot.spotType];
  const regionGroup = getRegionGroup(spot.region.prefecture);
  const topFish = getTopFishNames(spot);
  const easyFish = getEasyFish(spot);
  const methods = getUniqueMethods(spot);
  const bestMonths = getBestMonths(spot);

  let intro = `${spot.name}は${spot.region.prefecture}${spot.region.areaName}に位置する${typeLabel}の釣り場です。`;
  intro += `${typeFeatures.atmosphere}${spot.difficulty === "beginner" ? "ため、釣り初心者にもおすすめです" : spot.difficulty === "intermediate" ? "ため、ある程度の経験がある方に適しています" : "ため、腕に覚えのある方におすすめです"}。`;

  if (spot.catchableFish.length > 0) {
    intro += `${topFish}をはじめ${spot.catchableFish.length}種類の魚が狙えます。`;
    if (methods.length > 0) {
      intro += `${methods.slice(0, 2).join("や")}が人気の釣り方です。`;
    }
  }

  if (bestMonths.length > 0) {
    intro += `ベストシーズンは${bestMonths.slice(0, 3).join("・")}頃。`;
  }

  if (easyFish.length > 0 && spot.difficulty === "beginner") {
    intro += `特に${easyFish.slice(0, 2).map(cf => cf.fish.name).join("や")}は初心者でも比較的釣りやすい魚種です。`;
  }

  intro += `${REGION_CLIMATE[regionGroup]}です。`;

  return intro;
}

/**
 * 釣り場のポイント（箇条書き用、3-5個）
 */
export function generateSpotTips(spot: FishingSpot): string[] {
  const tips: string[] = [];
  const typeFeatures = SPOT_TYPE_FEATURES[spot.spotType];
  const typeLabel = SPOT_TYPE_LABELS[spot.spotType];
  const easyFish = getEasyFish(spot);
  const methods = getUniqueMethods(spot);

  // 1. spotType別のメリット
  tips.push(typeFeatures.merit);

  // 2. topFish + methodの組み合わせ
  if (spot.catchableFish.length > 0 && methods.length > 0) {
    const topCf = spot.catchableFish[0];
    tips.push(`${topCf.method}で${topCf.fish.name}${easyFish.length > 0 ? "の数釣りが楽しめる" : "を狙える"}`);
  }

  // 3. facility系
  const facilityParts: string[] = [];
  if (spot.isFree) facilityParts.push("無料");
  if (spot.hasParking) facilityParts.push("駐車場");
  if (spot.hasToilet) facilityParts.push("トイレ");
  if (spot.hasRentalRod) facilityParts.push("レンタル竿");
  if (facilityParts.length >= 2) {
    tips.push(`${facilityParts.join("・")}完備${spot.difficulty === "beginner" ? "でファミリーにも安心" : ""}`);
  } else if (spot.isFree) {
    tips.push("無料で釣りが楽しめるスポット");
  }

  // 4. region系
  const regionGroup = getRegionGroup(spot.region.prefecture);
  if (regionGroup === "kyushu" || regionGroup === "shikoku") {
    tips.push(`温暖な${spot.region.prefecture}で年間を通じて釣りが楽しめる`);
  } else if (regionGroup === "hokkaido") {
    tips.push(`${spot.region.prefecture}ならではの魚種が揃う。夏場は涼しく快適`);
  } else {
    tips.push(`${spot.region.areaName}エリアの${typeLabel === "漁港" || typeLabel === "堤防" ? "好" : "人気"}ポイント`);
  }

  // 5. 季節系
  const bestMonths = getBestMonths(spot);
  const peakFish = spot.catchableFish.filter(cf => cf.peakSeason).slice(0, 2);
  if (peakFish.length > 0) {
    tips.push(`${peakFish.map(cf => cf.fish.name).join("・")}のハイシーズンには好釣果が期待できる`);
  } else if (bestMonths.length > 0) {
    tips.push(`${bestMonths.slice(0, 2).join("・")}頃が最も魚種が豊富な時期`);
  }

  return tips.slice(0, 5);
}

/**
 * 時間帯アドバイス（spotType × 主要魚種で分岐）
 */
export function generateTimeAdvice(spot: FishingSpot): string {
  const topFish = spot.catchableFish.length > 0 ? spot.catchableFish[0] : null;
  const topFishName = topFish?.fish.name || "";
  const hasNight = spot.catchableFish.some(cf =>
    typeof cf.recommendedTime === "string" ? cf.recommendedTime.includes("夜") : false
  );
  const hasMorning = spot.catchableFish.some(cf =>
    typeof cf.recommendedTime === "string" ? cf.recommendedTime.includes("朝") : false
  );
  const hasEvening = spot.catchableFish.some(cf =>
    typeof cf.recommendedTime === "string" ? cf.recommendedTime.includes("夕") : false
  );

  // 魚種別の特化アドバイス
  const fishTimeAdvice: Record<string, string> = {
    "アジ": `${spot.name}でのアジ狙いは夕方〜夜がゴールデンタイム。常夜灯下にアジが集まるため、日没1時間前から準備しておくのがベスト。朝マヅメも回遊のチャンスあり。`,
    "グレ": `${spot.name}でのグレ狙いは潮が動く時間帯が勝負。満潮前後の2時間が最もアタリが集中する傾向にあります。コマセで寄せてから手返しよく攻めましょう。`,
    "キス": `${spot.name}でのキス狙いは干潮から上げ潮にかけてが本命。波打ち際から2〜3色先のカケアガリがポイント。朝の早い時間帯は特にアタリが出やすい。`,
    "チヌ": `${spot.name}でのチヌ狙いは朝マヅメと夕マヅメが基本ですが、日中でも潮が効いている時間帯は十分チャンスあり。満潮前後がアタリの集中する時合いです。`,
    "アオリイカ": `${spot.name}でのエギング（アオリイカ）は朝マヅメと夕マヅメが鉄板。夜間も常夜灯周りで釣果が出ます。潮が動き出すタイミングに合わせてエントリーしましょう。`,
    "メバル": `${spot.name}でのメバル狙いは夜釣りが圧倒的に有利。日没後1時間ほどで活性が上がります。常夜灯の明暗の境目を重点的に探りましょう。`,
    "タチウオ": `${spot.name}でのタチウオ狙いは夕マヅメから夜にかけてが本番。日没30分前から準備し、暗くなってからが最も釣れる時間帯です。`,
    "カサゴ": `${spot.name}でのカサゴ狙いは時間帯を選ばず日中でも釣れますが、夕方〜夜にかけてがより活性が高まります。穴釣りならテンポよく探り歩くのがコツ。`,
    "ハゼ": `${spot.name}でのハゼ狙いは日中が基本。干潮時にカケアガリが露出する場所を確認し、上げ潮に合わせてそのポイントを攻めるのが効果的です。`,
  };

  if (topFishName && fishTimeAdvice[topFishName]) {
    return fishTimeAdvice[topFishName];
  }

  // spotType別のデフォルトアドバイス
  const spotTypeTime: Record<SpotType, string> = {
    port: `${spot.name}では朝マヅメ（日の出前後）が最も釣果が安定する時間帯です。${hasNight ? "常夜灯のある漁港内は夜釣りも有効で、アジやメバルが狙えます。" : ""}漁船の出入りが落ち着く早朝がおすすめ。`,
    breakwater: `${spot.name}では朝マヅメに回遊魚の接岸が期待できます。${hasEvening ? "夕マヅメも青物のチャンスタイム。" : ""}潮が動き始めるタイミングを潮汐表で確認してから出かけましょう。`,
    rocky: `${spot.name}では潮の動きに合わせた釣りが重要。満潮前後の潮が効くタイミングが最もアタリが出やすい時間帯です。干潮時は足場確認とポイントの下見に活用しましょう。`,
    river: `${spot.name}では日の出直後の朝マヅメが好タイム。水温が上がる午前10時頃から魚の活性も上がります。${hasEvening ? "夕マヅメも好釣果が期待できる時間帯です。" : ""}`,
    beach: `${spot.name}では潮位の変化に注目。干潮から上げ潮にかけてが最も釣果が出やすいタイミングです。${hasMorning ? "朝の早い時間帯は人も少なく広いポイントを攻められます。" : ""}`,
    pier: `${spot.name}は管理された釣り場のため営業時間内での釣りとなります。${hasMorning ? "開場直後の朝イチは先行者が少なく好ポイントを確保しやすい。" : ""}潮の動く時間帯に合わせて訪問するのがベストです。`,
  };

  return spotTypeTime[spot.spotType];
}

/**
 * 季節別の詳細アドバイス
 */
export function generateSeasonDetail(spot: FishingSpot): { season: string; fish: string; advice: string }[] {
  const seasonFish = getSeasonFish(spot);
  const details: { season: string; fish: string; advice: string }[] = [];

  if (seasonFish.spring.length > 0) {
    const fish = seasonFish.spring.slice(0, 3).join("・");
    details.push({
      season: "春（3〜5月）",
      fish,
      advice: spot.spotType === "beach"
        ? "水温の上昇とともにキスが接岸。投げ釣りシーズンの開幕"
        : spot.spotType === "rocky"
          ? "のっこみのチヌやグレが狙える好シーズン。産卵前の荒食いを狙う"
          : "水温が上がり始め、魚の活性が徐々にアップ。新子のアオリイカも登場",
    });
  }

  if (seasonFish.summer.length > 0) {
    const fish = seasonFish.summer.slice(0, 3).join("・");
    details.push({
      season: "夏（6〜8月）",
      fish,
      advice: spot.spotType === "river"
        ? "鮎やヤマメなど渓流魚のベストシーズン。日差しが強いので熱中症対策を"
        : "青物の回遊が活発化。早朝の涼しい時間帯が特におすすめ。熱中症対策は必須",
    });
  }

  if (seasonFish.autumn.length > 0) {
    const fish = seasonFish.autumn.slice(0, 3).join("・");
    details.push({
      season: "秋（9〜11月）",
      fish,
      advice: spot.spotType === "port" || spot.spotType === "breakwater"
        ? "最も魚種が豊富な時期。サビキ釣りの数釣りから青物まで多彩な釣りが楽しめる"
        : "年間で最も釣れる時期。気候も穏やかで一日中快適に楽しめる",
    });
  }

  if (seasonFish.winter.length > 0) {
    const fish = seasonFish.winter.slice(0, 3).join("・");
    const regionGroup = getRegionGroup(spot.region.prefecture);
    details.push({
      season: "冬（12〜2月）",
      fish,
      advice: regionGroup === "hokkaido" || regionGroup === "tohoku"
        ? "厳寒期は釣り物が限られるが、ワカサギやカレイなど冬ならではのターゲットも"
        : regionGroup === "kyushu" || regionGroup === "shikoku"
          ? "温暖な気候で冬場も快適に釣りができる。カレイや根魚が好ターゲット"
          : "魚種は減るものの、カレイやメバルなど冬の定番ターゲットが楽しめる。防寒対策を万全に",
    });
  }

  return details;
}

/**
 * 設備・アクセスの実用ガイド
 */
export function generateFacilityGuide(spot: FishingSpot): string {
  let guide = "";

  // 駐車場情報
  if (spot.hasParking) {
    guide += spot.parkingDetail
      ? `駐車場は${spot.parkingDetail}。`
      : "駐車場が利用可能です。";
    if (spot.parkingPeakInfo) {
      guide += `ハイシーズンの週末は${spot.parkingPeakInfo.peakStartTime}頃から混み合うため、${spot.parkingPeakInfo.recommendedArrival}の到着がおすすめ。`;
      if (spot.parkingPeakInfo.alternateParking) {
        guide += `満車の場合は${spot.parkingPeakInfo.alternateParking}もご利用いただけます。`;
      }
    }
  } else {
    guide += "専用駐車場はありません。近隣のコインパーキングや公共駐車場をご利用ください。";
  }

  // トイレ
  guide += spot.hasToilet
    ? "トイレは現地に設置されています。"
    : "現地にトイレはないため、事前に済ませておくか近隣のコンビニ等をご利用ください。";

  // 買い物・釣具
  if (spot.hasConvenienceStore && spot.hasFishingShop) {
    guide += "近くにコンビニと釣具店があるため、急な買い足しにも対応できます。";
  } else if (spot.hasConvenienceStore) {
    guide += "近くにコンビニがあります。釣具やエサは事前に準備しておきましょう。";
  } else if (spot.hasFishingShop) {
    guide += "近くに釣具店があり、エサや仕掛けの調達が可能です。飲食物は事前に準備を。";
  } else {
    guide += "周辺にコンビニ・釣具店が少ないため、飲食物・エサ・仕掛けは事前にすべて準備しておくことをおすすめします。";
  }

  // レンタル
  if (spot.hasRentalRod) {
    guide += spot.rentalDetail
      ? `レンタル竿あり（${spot.rentalDetail}）。手ぶらでも釣りが楽しめます。`
      : "レンタル竿が利用可能なので、道具がなくても釣りが楽しめます。";
  }

  // 料金
  if (spot.isFree) {
    guide += "釣り場の利用は無料です。";
  } else if (spot.feeDetail) {
    guide += `利用料金: ${spot.feeDetail}。`;
  }

  return guide;
}

/**
 * まとめ用のポイント箇条書き
 */
export function generateSpotSummary(spot: FishingSpot): {
  oneLineFeature: string;
  topFishAndSeason: string;
  recommendedMethod: string;
  facilityOverview: string;
  difficultyComment: string;
} {
  const typeLabel = SPOT_TYPE_LABELS[spot.spotType];
  const topFish = getTopFishNames(spot, 3);
  const bestMonths = getBestMonths(spot);
  const methods = getUniqueMethods(spot);
  const typeFeatures = SPOT_TYPE_FEATURES[spot.spotType];

  // 一言特徴
  let oneLineFeature = "";
  if (spot.difficulty === "beginner" && spot.isFree) {
    oneLineFeature = `無料で楽しめる${spot.difficulty === "beginner" ? "初心者にやさしい" : ""}${typeLabel}の釣り場`;
  } else if (spot.spotType === "rocky") {
    oneLineFeature = `${typeFeatures.atmosphere.split("、")[0]}。腕試しに最適な釣り場`;
  } else {
    oneLineFeature = `${spot.region.areaName}エリアの${typeLabel}。${typeFeatures.merit.split("。")[0]}`;
  }

  return {
    oneLineFeature,
    topFishAndSeason: `狙える魚: ${topFish}${spot.catchableFish.length > 3 ? `ほか${spot.catchableFish.length}種` : ""} / ベストシーズン: ${bestMonths.slice(0, 3).join("・")}`,
    recommendedMethod: methods.length > 0 ? `おすすめ釣法: ${methods.slice(0, 3).join("・")}` : "多彩な釣り方に対応",
    facilityOverview: [
      spot.hasParking ? "駐車場○" : "駐車場×",
      spot.hasToilet ? "トイレ○" : "トイレ×",
      spot.hasConvenienceStore ? "コンビニ近く" : null,
      spot.hasRentalRod ? "レンタル竿○" : null,
      spot.isFree ? "無料" : null,
    ].filter(Boolean).join(" / "),
    difficultyComment: DIFFICULTY_SUMMARIES[spot.difficulty](spot.name, topFish),
  };
}

/**
 * 釣り方の文脈別説明（スポットタイプに応じた説明に差し替え）
 */
export function generateContextMethodBrief(method: string, spot: FishingSpot): string {
  const methodContextMap = METHOD_CONTEXT[method];
  if (methodContextMap && methodContextMap[spot.spotType]) {
    return methodContextMap[spot.spotType];
  }
  // フォールバック: 汎用的な説明
  const targetFish = spot.catchableFish.filter(cf => cf.method === method).slice(0, 2).map(cf => cf.fish.name);
  return targetFish.length > 0
    ? `${spot.name}では${method}で${targetFish.join("・")}が狙えます`
    : `${method}は${SPOT_TYPE_LABELS[spot.spotType]}での釣りに適した釣り方です`;
}

/**
 * 改善されたFAQ生成（6問、spotType/difficulty別に実用的アドバイス付き）
 */
export function generateImprovedFAQs(spot: FishingSpot): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const typeLabel = SPOT_TYPE_LABELS[spot.spotType];
  const typeFeatures = SPOT_TYPE_FEATURES[spot.spotType];
  const easyFish = getEasyFish(spot);
  const methods = getUniqueMethods(spot);
  const bestMonths = getBestMonths(spot);
  const seasonFish = getSeasonFish(spot);

  // Q1: 何が釣れる？（全スポット共通だが回答を充実）
  if (spot.catchableFish.length > 0) {
    const fishByMethod: Record<string, string[]> = {};
    for (const cf of spot.catchableFish) {
      if (!fishByMethod[cf.method]) fishByMethod[cf.method] = [];
      if (fishByMethod[cf.method].length < 3) fishByMethod[cf.method].push(cf.fish.name);
    }
    const methodDetails = Object.entries(fishByMethod).slice(0, 3).map(([m, fish]) =>
      `${m}で${fish.join("・")}`
    ).join("、");

    faqs.push({
      question: `${spot.name}ではどんな魚が釣れますか？`,
      answer: `${spot.name}では${spot.catchableFish.length}種類の魚が確認されています。${methodDetails}が狙えます。${easyFish.length > 0 ? `中でも${easyFish.slice(0, 2).map(cf => cf.fish.name).join("・")}は比較的釣りやすく、初心者にもおすすめです。` : ""}`,
    });
  }

  // Q2: 初心者でも大丈夫？（difficulty + spotType で分岐）
  if (spot.difficulty === "beginner") {
    faqs.push({
      question: `${spot.name}は初心者でも釣れますか？`,
      answer: `はい、${spot.name}は${typeLabel}で足場が安定しているため初心者にもおすすめです。${easyFish.length > 0 ? `まずは${easyFish[0].method}で${easyFish[0].fish.name}を狙ってみましょう。` : `${methods.length > 0 ? methods[0] : "サビキ釣り"}から始めるのがおすすめです。`}${spot.hasRentalRod ? "レンタル竿もあるので手ぶらでも楽しめます。" : ""}${spot.hasParking ? "駐車場" : ""}${spot.hasParking && spot.hasToilet ? "・" : ""}${spot.hasToilet ? "トイレ" : ""}${spot.hasParking || spot.hasToilet ? "完備で安心です。" : ""}`,
    });
  } else if (spot.difficulty === "intermediate") {
    faqs.push({
      question: `${spot.name}は初心者でも楽しめますか？`,
      answer: `${spot.name}は中級者向けの${typeLabel}ですが、${easyFish.length > 0 ? `${easyFish.slice(0, 2).map(cf => cf.fish.name).join("・")}は初心者でも比較的狙いやすい魚です。` : "釣り方やポイントを選べば初心者でも楽しめます。"}経験者と一緒に訪れると安心です。${typeFeatures.caution}`,
    });
  } else {
    faqs.push({
      question: `${spot.name}に必要な装備・経験は？`,
      answer: `${spot.name}は上級者向けの${typeLabel}です。${typeFeatures.caution}。十分な経験と装備が必要です。${spot.spotType === "rocky" ? "磯靴・ライフジャケット・ロープなどの安全装備を必ず用意してください。" : "安全装備を万全にして挑みましょう。"}`,
    });
  }

  // Q3: ベストシーズン（季節別に詳しく）
  if (spot.catchableFish.length > 0) {
    let seasonAnswer = `${spot.name}のベストシーズンは${bestMonths.slice(0, 3).join("・")}頃です。`;
    const peakFish = spot.catchableFish.filter(cf => cf.peakSeason);
    if (peakFish.length > 0) {
      seasonAnswer += `特に${peakFish.slice(0, 2).map(cf => `${cf.fish.name}（${monthNames[cf.monthStart]}〜${monthNames[cf.monthEnd]}）`).join("、")}が旬を迎えます。`;
    }
    if (seasonFish.winter.length > 0) {
      seasonAnswer += `冬場も${seasonFish.winter.slice(0, 2).join("・")}が狙えるので年間を通じて楽しめます。`;
    }
    if (spot.difficulty === "beginner" && seasonFish.autumn.length > 0) {
      seasonAnswer += `ファミリーなら気候のよい秋（9〜11月）がおすすめです。`;
    }
    faqs.push({
      question: `${spot.name}のベストシーズンはいつですか？`,
      answer: seasonAnswer,
    });
  }

  // Q4: アクセス・駐車場（実用的情報）
  {
    let accessAnswer = `${spot.name}の所在地は${spot.address}です。`;
    if (spot.accessInfo) accessAnswer += spot.accessInfo;
    if (spot.hasParking) {
      accessAnswer += spot.parkingDetail ? `駐車場あり（${spot.parkingDetail}）。` : "駐車場が利用可能です。";
      if (spot.parkingPeakInfo) {
        accessAnswer += `週末は${spot.parkingPeakInfo.recommendedArrival}の到着がおすすめです。`;
      }
    } else {
      accessAnswer += "専用駐車場はありません。近隣のコインパーキングをご利用ください。";
    }
    faqs.push({
      question: `${spot.name}へのアクセスと駐車場は？`,
      answer: accessAnswer,
    });
  }

  // Q5: 設備情報（トイレ・コンビニ・釣具店をまとめて回答）
  {
    const parts: string[] = [];
    parts.push(spot.hasToilet ? "トイレは現地にあります" : "現地にトイレはないため事前に済ませておきましょう");
    if (spot.hasConvenienceStore) parts.push("近くにコンビニがあります");
    else parts.push("コンビニは近くにないため飲食物は事前に用意を");
    if (spot.hasFishingShop) parts.push("近くに釣具店があるためエサの調達も可能です");
    else parts.push("釣具店は近くにないためタックルとエサは事前に準備しましょう");
    if (spot.hasRentalRod) parts.push("レンタル竿も利用可能です");
    faqs.push({
      question: `${spot.name}のトイレや周辺施設は？`,
      answer: `${parts.join("。")}。`,
    });
  }

  // Q6: おすすめの釣り方（具体的なアドバイス付き）
  if (methods.length > 0) {
    const topMethod = methods[0];
    const topMethodFish = spot.catchableFish.filter(cf => cf.method === topMethod).slice(0, 3).map(cf => cf.fish.name);
    const contextBrief = generateContextMethodBrief(topMethod, spot);
    let methodAnswer = `${spot.name}で最も人気の釣り方は${topMethod}です。${topMethodFish.length > 0 ? `${topMethodFish.join("・")}が主なターゲット。` : ""}${contextBrief}。`;
    if (methods.length > 1) {
      methodAnswer += `他にも${methods.slice(1, 3).join("・")}も楽しめます。`;
    }
    // 魚種固有のヒント
    const topFishName = topMethodFish[0];
    if (topFishName && FISH_TIPS[topFishName]) {
      methodAnswer += FISH_TIPS[topFishName];
    }
    faqs.push({
      question: `${spot.name}でおすすめの釣り方は？`,
      answer: methodAnswer,
    });
  }

  return faqs.slice(0, 6);
}

/**
 * エリアの季節トレンド（釣果報告0件の場合に表示する代替コンテンツ）
 * 同エリア内の他スポットの釣れる魚データから、現在月に釣れる魚を集計
 */
export function generateAreaSeasonTrend(
  spot: FishingSpot,
  allSpots: FishingSpot[]
): { fishName: string; method: string; count: number }[] {
  const currentMonth = new Date().getMonth() + 1;
  const areaSpots = allSpots.filter(s =>
    s.region.prefecture === spot.region.prefecture &&
    s.region.areaName === spot.region.areaName &&
    s.id !== spot.id
  );

  const fishCount: Record<string, { method: string; count: number }> = {};
  for (const s of areaSpots) {
    for (const cf of s.catchableFish) {
      const inSeason = cf.monthStart <= cf.monthEnd
        ? currentMonth >= cf.monthStart && currentMonth <= cf.monthEnd
        : currentMonth >= cf.monthStart || currentMonth <= cf.monthEnd;
      if (inSeason) {
        const key = cf.fish.name;
        if (!fishCount[key]) fishCount[key] = { method: cf.method, count: 0 };
        fishCount[key].count++;
      }
    }
  }

  return Object.entries(fishCount)
    .map(([fishName, data]) => ({ fishName, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
