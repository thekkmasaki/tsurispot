/**
 * 月別おすすめ針サイズデータ
 * キー: {fishSlug}_{methodIndex}
 */

export interface HookSizeMonth {
  size: string;  // "4〜6号" or "-" (オフシーズン)
  note: string;  // 補足コメント
}

export interface HookSizeData {
  hookType: string;       // "サビキ針（袖針）" etc.
  months: HookSizeMonth[];  // index 0=1月, 11=12月
  tip: string;            // 全体のアドバイス
}

const hookSizeMap: Record<string, HookSizeData> = {
  // ── アジ（サビキ釣り） ──
  aji_0: {
    hookType: "サビキ針（袖針）",
    months: [
      { size: "4〜6号", note: "冬は深場で中型が多い" },
      { size: "4〜6号", note: "" },
      { size: "3〜5号", note: "水温上昇で活性回復" },
      { size: "1〜3号", note: "豆アジシーズン開始" },
      { size: "2〜4号", note: "豆アジ全盛期" },
      { size: "2〜4号", note: "小アジが増える" },
      { size: "3〜4号", note: "夏の最盛期" },
      { size: "3〜5号", note: "15cmサイズが混じる" },
      { size: "4〜6号", note: "中アジが増える" },
      { size: "5〜7号", note: "秋の荒食い" },
      { size: "5〜7号", note: "良型狙い" },
      { size: "4〜6号", note: "大型が深場へ" },
    ],
    tip: "迷ったら小さめを選ぶのが基本。大きすぎると食いが極端に悪くなる",
  },

  // ── サバ（サビキ釣り） ──
  saba_0: {
    hookType: "サビキ針（ハゲ皮）",
    months: [
      { size: "-", note: "冬はほぼ沖" },
      { size: "-", note: "冬はほぼ沖" },
      { size: "4〜6号", note: "春サバ接岸" },
      { size: "4〜6号", note: "中型が回遊" },
      { size: "5〜7号", note: "20-25cm" },
      { size: "5〜7号", note: "小〜中型混合" },
      { size: "5〜7号", note: "夏サバ" },
      { size: "6〜8号", note: "25-30cm" },
      { size: "6〜8号", note: "最盛期" },
      { size: "6〜8号", note: "ハイシーズン" },
      { size: "6〜7号", note: "秋終わり" },
      { size: "5〜7号", note: "沖落ち" },
    ],
    tip: "アジより口が大きいので、同時に狙う場合は5〜6号をベースに",
  },

  // ── イワシ（サビキ釣り） ──
  iwashi_0: {
    hookType: "サビキ針（小型）",
    months: [
      { size: "2〜3号", note: "冬は少ない" },
      { size: "2〜3号", note: "" },
      { size: "2〜4号", note: "接岸スタート" },
      { size: "2〜4号", note: "群れが入れば数釣り" },
      { size: "2〜4号", note: "カタクチは2-3号" },
      { size: "2〜4号", note: "小型多め" },
      { size: "3〜5号", note: "マイワシ15-20cm" },
      { size: "3〜5号", note: "型に合わせて" },
      { size: "3〜5号", note: "秋も群れ" },
      { size: "3〜5号", note: "良型マイワシ" },
      { size: "3〜4号", note: "数が減る" },
      { size: "2〜3号", note: "冬は小型中心" },
    ],
    tip: "カタクチイワシ（小型）は2〜3号、マイワシ（15cm以上）は4〜5号が目安",
  },

  // ── メバル ──
  mebaru_0: {
    hookType: "メバル針・袖針",
    months: [
      { size: "5〜7号", note: "冬がシーズン本番" },
      { size: "5〜7号", note: "産卵期前後" },
      { size: "6〜8号", note: "春の荒食い" },
      { size: "6〜8号", note: "最盛期" },
      { size: "5〜7号", note: "食いが落ち着く" },
      { size: "5〜6号", note: "夏は活性低下" },
      { size: "5〜6号", note: "低活性期" },
      { size: "5〜6号", note: "" },
      { size: "6〜7号", note: "活性戻る" },
      { size: "6〜7号", note: "秋メバル" },
      { size: "6〜8号", note: "シーズン本格化" },
      { size: "5〜7号", note: "冬シーズン" },
    ],
    tip: "イソメ使用時は少し大きめ、エビ使用時は5〜6号の小さめ",
  },

  // ── カサゴ ──
  kasago_0: {
    hookType: "カサゴ針・ネムリ針",
    months: [
      { size: "10〜13号", note: "ハイシーズン" },
      { size: "10〜13号", note: "最盛期" },
      { size: "10〜12号", note: "春も活性高い" },
      { size: "10〜12号", note: "大型狙える" },
      { size: "8〜12号", note: "小型も混じる" },
      { size: "8〜10号", note: "活性やや低下" },
      { size: "8〜10号", note: "高水温期" },
      { size: "8〜10号", note: "数が減る" },
      { size: "10〜12号", note: "活性復活" },
      { size: "10〜13号", note: "荒食い期" },
      { size: "10〜13号", note: "ベストシーズン" },
      { size: "10〜13号", note: "ハイシーズン" },
    ],
    tip: "口が大きいので針は大きめでOK。10〜12号をメインに揃えておけば間違いなし",
  },

  // ── クロダイ ──
  kurodai_0: {
    hookType: "チヌ針",
    months: [
      { size: "1〜2号", note: "冬は小針で繊細に" },
      { size: "1〜2号", note: "ハリス0.8-1号と細く" },
      { size: "1〜3号", note: "乗っ込み前" },
      { size: "2〜4号", note: "乗っ込みシーズン" },
      { size: "2〜4号", note: "春最盛期" },
      { size: "1〜3号", note: "エサ取り増加" },
      { size: "1〜2号", note: "夏は小針で丁寧に" },
      { size: "1〜2号", note: "エサ取り対策必要" },
      { size: "1〜3号", note: "活性回復" },
      { size: "2〜4号", note: "秋チヌ本番" },
      { size: "2〜3号", note: "良型狙える" },
      { size: "1〜2号", note: "小針で繊細に" },
    ],
    tip: "チヌ針1〜3号がメイン。食いが渋い時は1号以下のグレ針に変えると有効",
  },

  // ── マダイ ──
  madai_0: {
    hookType: "マダイ針・伊勢尼",
    months: [
      { size: "8〜10号", note: "冬は深場" },
      { size: "8〜10号", note: "乗っ込み前" },
      { size: "9〜11号", note: "乗っ込み開始" },
      { size: "9〜11号", note: "春乗っ込み" },
      { size: "9〜11号", note: "ピーク〜終盤" },
      { size: "8〜10号", note: "乗っ込み終了" },
      { size: "8〜10号", note: "夏マダイ中型" },
      { size: "8〜10号", note: "" },
      { size: "9〜11号", note: "秋の荒食い" },
      { size: "9〜11号", note: "最盛期" },
      { size: "8〜10号", note: "秋終わり" },
      { size: "8〜10号", note: "深場へ" },
    ],
    tip: "食いが渋い時は1サイズ小さく、大型が多い乗っ込み期は大きめを選ぶ",
  },

  // ── シロギス ──
  kisu_0: {
    hookType: "キス針（秋田狐）",
    months: [
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "まだ沖にいる" },
      { size: "5〜6号", note: "接岸が始まる" },
      { size: "5〜7号", note: "シーズン本格化" },
      { size: "5〜7号", note: "産卵で浅場に集合" },
      { size: "5〜7号", note: "夏の最盛期" },
      { size: "4〜6号", note: "ピンギスは小針" },
      { size: "4〜6号", note: "小針が有利" },
      { size: "5〜7号", note: "落ちギス良型" },
      { size: "5〜7号", note: "晩秋良型シーズン" },
      { size: "5〜6号", note: "シーズン終盤" },
    ],
    tip: "ピンギス（小型）が多い時は4〜5号、良型が揃う春・晩秋は6〜7号",
  },

  // ── カレイ ──
  karei_0: {
    hookType: "カレイ針・流線針",
    months: [
      { size: "12〜14号", note: "冬シーズン大型" },
      { size: "12〜15号", note: "戻りガレイ大型" },
      { size: "12〜15号", note: "花見ガレイ" },
      { size: "12〜14号", note: "春シーズン" },
      { size: "12〜13号", note: "シーズン落ち着く" },
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "11〜13号", note: "秋の接岸" },
      { size: "12〜14号", note: "秋シーズン" },
      { size: "12〜14号", note: "最盛期" },
      { size: "12〜14号", note: "冬シーズン" },
    ],
    tip: "基本はエサを大きく付けて待つ釣りなので大きめの針が合う",
  },

  // ── ハゼ ──
  haze_0: {
    hookType: "袖針・ハゼ針",
    months: [
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "3〜4号", note: "浅場に戻り始め" },
      { size: "3〜4号", note: "シーズン開始" },
      { size: "3〜5号", note: "梅雨頃から増える" },
      { size: "4〜5号", note: "夏の最盛期" },
      { size: "4〜5号", note: "盛夏数釣り" },
      { size: "4〜6号", note: "秋サイズアップ" },
      { size: "5〜7号", note: "落ちハゼ大型" },
      { size: "5〜7号", note: "大型ラストチャンス" },
      { size: "-", note: "シーズン終了" },
    ],
    tip: "夏は小型で3〜4号、秋の大型（落ちハゼ）は5〜7号",
  },

  // ── アオリイカ（エギング） ──
  aoriika_0: {
    hookType: "エギ（餌木）サイズ",
    months: [
      { size: "3.5〜4号", note: "春イカ大型" },
      { size: "3.5〜4号", note: "1-3kg大型" },
      { size: "3.5〜4号", note: "最盛期" },
      { size: "3.5〜4号", note: "最大チャンス" },
      { size: "3〜3.5号", note: "端境期" },
      { size: "2〜2.5号", note: "子イカ釣れ始め" },
      { size: "-", note: "新子発生期" },
      { size: "-", note: "地域により新子狙い" },
      { size: "2.5〜3号", note: "秋イカ本格化" },
      { size: "3〜3.5号", note: "秋最盛期" },
      { size: "3〜3.5号", note: "型が良くなる" },
      { size: "3.5〜4号", note: "冬イカ大型" },
    ],
    tip: "春（親）は3.5〜4号、秋（新子）は2.5〜3号でスタートし成長に合わせて大きく",
  },

  // ── シーバス ──
  seabass_0: {
    hookType: "トレブルフック",
    months: [
      { size: "#6〜#8", note: "冬は小ルアー+小フック" },
      { size: "#6〜#8", note: "活性低め" },
      { size: "#6〜#8", note: "小ベイト対応" },
      { size: "#4〜#6", note: "稚アユに付く" },
      { size: "#4〜#6", note: "活性上昇" },
      { size: "#4〜#6", note: "梅雨シーバス" },
      { size: "#4〜#6", note: "表層系有効" },
      { size: "#4〜#6", note: "夏の最盛期" },
      { size: "#2〜#4", note: "秋の爆食い" },
      { size: "#2〜#4", note: "ハイシーズン" },
      { size: "#2〜#4", note: "落ちシーバス" },
      { size: "#2〜#4", note: "産卵前荒食い" },
    ],
    tip: "フックサイズはルアー付属を基本に。大型狙いの秋〜冬は#2〜#4に交換",
  },

  // ── ヒラメ ──
  hirame_0: {
    hookType: "伊勢尼（親針）+トレブル（孫針）",
    months: [
      { size: "親8〜10号", note: "冬シーズン" },
      { size: "親8〜10号", note: "最盛期" },
      { size: "親8〜10号", note: "春シーズン" },
      { size: "親8〜10号", note: "接岸期" },
      { size: "親7〜9号", note: "春後半" },
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "親8〜10号", note: "秋の接岸" },
      { size: "親8〜10号", note: "荒食い" },
      { size: "親8〜10号", note: "最盛期" },
      { size: "親8〜10号", note: "冬シーズン" },
    ],
    tip: "親針（口用）と孫針（背中用）の2本仕掛けが基本",
  },

  // ── タチウオ ──
  tachiuo_0: {
    hookType: "タチウオ専用フック",
    months: [
      { size: "-", note: "オフシーズン（一部地域）" },
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "関西では春タチも" },
      { size: "#1/0〜#2/0", note: "関西春タチウオ" },
      { size: "#1/0〜#2/0", note: "良型だが数少なめ" },
      { size: "#1/0〜#2/0", note: "徐々に数が増える" },
      { size: "#1/0〜#2/0", note: "東京湾シーズン" },
      { size: "#1/0〜#2/0", note: "本格化" },
      { size: "#2/0", note: "秋の最盛期" },
      { size: "#2/0〜#3/0", note: "ドラゴン狙い" },
      { size: "#2/0〜#3/0", note: "大型狙い" },
      { size: "#1/0〜#2/0", note: "シーズン終盤" },
    ],
    tip: "標準#2/0、小型数狙いは#1/0、大型ドラゴン狙いは#3/0",
  },

  // ── サヨリ ──
  sayori_0: {
    hookType: "袖針・サヨリ針",
    months: [
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "4〜5号", note: "春サヨリ大型" },
      { size: "4〜5号", note: "春最盛期" },
      { size: "4〜5号", note: "良型多い" },
      { size: "-", note: "端境期" },
      { size: "-", note: "端境期" },
      { size: "-", note: "端境期" },
      { size: "3〜4号", note: "秋サヨリ小〜中型" },
      { size: "3〜4号", note: "秋最盛期" },
      { size: "3〜5号", note: "サイズアップ" },
      { size: "4〜5号", note: "大型シーズン" },
    ],
    tip: "秋の小型は3号、春の大型は5号。ハリスは0.6〜1号と細く",
  },

  // ── アイナメ ──
  ainame_0: {
    hookType: "アイナメ針・ネムリ針",
    months: [
      { size: "10〜12号", note: "冬ベストシーズン" },
      { size: "10〜12号", note: "荒食い継続" },
      { size: "10〜12号", note: "春の荒食い" },
      { size: "10〜12号", note: "活性高め" },
      { size: "8〜10号", note: "活性低下" },
      { size: "8〜10号", note: "夏に向け低下" },
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "8〜10号", note: "活性戻る" },
      { size: "10〜12号", note: "秋ハイシーズン" },
      { size: "10〜12号", note: "荒食い最盛期" },
      { size: "10〜12号", note: "冬シーズン" },
    ],
    tip: "ネムリ針仕様のブラクリが根掛かり回避に有効",
  },

  // ── カワハギ ──
  kawahagi_0: {
    hookType: "カワハギ専用針（ハゲ針）",
    months: [
      { size: "4〜5号", note: "冬は吸わせ針有効" },
      { size: "4〜5号", note: "食い渋り" },
      { size: "4〜5号", note: "春に活性アップ" },
      { size: "4〜5号", note: "堤防で釣れ始め" },
      { size: "4〜5号", note: "産卵期前後" },
      { size: "4〜5号", note: "難しくなる地域も" },
      { size: "4〜5号", note: "夏カワハギ" },
      { size: "4〜5号", note: "堤防から楽しめる" },
      { size: "4〜5号", note: "本格シーズン" },
      { size: "4〜5号", note: "最盛期" },
      { size: "4〜5号", note: "ハイシーズン" },
      { size: "4〜5号", note: "大型シーズン" },
    ],
    tip: "号数よりも種類が重要。ハゲ針系は掛かりよく、吸わせ系はエサを吸い込ませる釣りに向く",
  },

  // ── メジナ（グレ） ──
  mejina_0: {
    hookType: "グレ針",
    months: [
      { size: "3〜5号", note: "冬グレ大型・渋め" },
      { size: "3〜5号", note: "厳寒期2-3号も" },
      { size: "4〜6号", note: "活性上昇" },
      { size: "4〜6号", note: "春シーズン" },
      { size: "4〜6号", note: "荒食い期" },
      { size: "3〜5号", note: "エサ取り増加" },
      { size: "3〜5号", note: "夏は小型中心" },
      { size: "3〜5号", note: "" },
      { size: "4〜6号", note: "活性上がる" },
      { size: "4〜7号", note: "秋の荒食い" },
      { size: "4〜7号", note: "型が揃う" },
      { size: "3〜6号", note: "冬グレ本番" },
    ],
    tip: "食いが渋い時は1〜2サイズ小さくする。刺し方（エサを自然に漂わせる）の方が重要",
  },

  // ── イサキ ──
  isaki_0: {
    hookType: "チヌ針・グレ針",
    months: [
      { size: "-", note: "オフシーズン" },
      { size: "-", note: "オフシーズン" },
      { size: "3〜4号", note: "活性上昇" },
      { size: "3〜4号", note: "シーズン開始" },
      { size: "3〜5号", note: "荒食い準備" },
      { size: "3〜5号", note: "最盛期" },
      { size: "3〜5号", note: "ピーク大型" },
      { size: "3〜4号", note: "食い落ちる" },
      { size: "3〜4号", note: "秋も釣れる" },
      { size: "3〜4号", note: "コマセ安定" },
      { size: "3〜4号", note: "数減る" },
      { size: "-", note: "オフシーズン" },
    ],
    tip: "喰いが渋い時はグレ針4号など細軸に変更",
  },

};

/**
 * 魚種slug と methodIndex から針サイズデータを取得
 */
export function getHookSizeData(
  fishSlug: string,
  methodIndex: number
): HookSizeData | null {
  const key = `${fishSlug}_${methodIndex}`;
  return hookSizeMap[key] ?? null;
}
