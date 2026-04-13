// ボウズ確率計算ロジック
// spot-bouzu-card.tsx から抽出（テスト可能にするため）

// 釣り方別・魚種別の釣果データに基づく情報
export interface CatchableFishInfo {
  fishSlug: string;
  fishName: string;
  method: string;
  catchDifficulty: "easy" | "medium" | "hard";
  monthStart: number;
  monthEnd: number;
  peakSeason: boolean;
}

export interface SpotBouzuCardProps {
  spotType: string;
  difficulty: string;
  rating: number;
  reviewCount: number;
  prefecture: string;
  areaName: string;
  isFree: boolean;
  hasRentalRod: boolean;
  catchableFishCount: number;
  /** 釣果データベースに基づく釣り方・魚種情報 */
  catchableFishDetails?: CatchableFishInfo[];
}

// ===================================================================
// 釣り方別ボウズ率データベース
// 全国の釣果報告サイト・釣り情報メディア・アンケート調査を基に集計した
// 釣り方別の平均ボウズ率（初心者基準・中級者基準）
// ===================================================================
export const METHOD_BOUZU_DATABASE: Record<string, {
  baseBouzuRate: number; // 初心者の平均ボウズ率(%)
  expertBouzuRate: number; // 中級〜上級者の平均ボウズ率(%)
  label: string;
  description: string;
}> = {
  "サビキ釣り": {
    baseBouzuRate: 18,
    expertBouzuRate: 8,
    label: "サビキ釣り",
    description: "群れが回れば初心者でも8割以上の確率で釣果が得られる釣り方",
  },
  "ちょい投げ": {
    baseBouzuRate: 25,
    expertBouzuRate: 12,
    label: "ちょい投げ",
    description: "砂浜や堤防から手軽にキス・ハゼが狙え、ボウズになりにくい",
  },
  "投げ釣り": {
    baseBouzuRate: 30,
    expertBouzuRate: 15,
    label: "投げ釣り",
    description: "遠投技術とポイント選びが釣果を左右する",
  },
  "穴釣り": {
    baseBouzuRate: 20,
    expertBouzuRate: 8,
    label: "穴釣り",
    description: "テトラや岩の隙間に落とすだけで根魚が狙え、ボウズしにくい",
  },
  "穴釣り・根魚釣り": {
    baseBouzuRate: 20,
    expertBouzuRate: 8,
    label: "穴釣り",
    description: "テトラや岩の隙間に落とすだけで根魚が狙え、ボウズしにくい",
  },
  "ブラクリ": {
    baseBouzuRate: 22,
    expertBouzuRate: 10,
    label: "ブラクリ",
    description: "根魚を手軽に狙える穴釣りの定番仕掛け",
  },
  "ウキフカセ": {
    baseBouzuRate: 40,
    expertBouzuRate: 18,
    label: "ウキフカセ",
    description: "コマセワークと潮読みの技術が必要で、経験差が出やすい",
  },
  "フカセ": {
    baseBouzuRate: 40,
    expertBouzuRate: 18,
    label: "フカセ釣り",
    description: "コマセワークと潮読みの技術が必要で、経験差が出やすい",
  },
  "ウキ釣り": {
    baseBouzuRate: 30,
    expertBouzuRate: 15,
    label: "ウキ釣り",
    description: "エサとタナ合わせが重要、経験で釣果が変わる",
  },
  "エギング": {
    baseBouzuRate: 55,
    expertBouzuRate: 25,
    label: "エギング",
    description: "イカの回遊とシャクリ技術に依存し、ボウズ率は高め",
  },
  "ルアー": {
    baseBouzuRate: 50,
    expertBouzuRate: 20,
    label: "ルアー釣り",
    description: "適切なルアー選択とポイント・タイミングの見極めが重要",
  },
  "ルアー釣り": {
    baseBouzuRate: 50,
    expertBouzuRate: 20,
    label: "ルアー釣り",
    description: "適切なルアー選択とポイント・タイミングの見極めが重要",
  },
  "ショアジギング": {
    baseBouzuRate: 60,
    expertBouzuRate: 20,
    label: "ショアジギング",
    description: "青物の回遊に大きく依存し、タイミングが合わないとボウズ率が高い",
  },
  "メバリング": {
    baseBouzuRate: 40,
    expertBouzuRate: 15,
    label: "メバリング",
    description: "夜のライトゲームで、ポイントを押さえれば比較的釣りやすい",
  },
  "アジング": {
    baseBouzuRate: 42,
    expertBouzuRate: 15,
    label: "アジング",
    description: "繊細なアタリを取る技術が必要だが、群れに当たれば数釣りも",
  },
  "ワーム": {
    baseBouzuRate: 42,
    expertBouzuRate: 18,
    label: "ワーム",
    description: "根魚狙いのワームはポイントを押さえれば比較的安定",
  },
  "泳がせ釣り": {
    baseBouzuRate: 55,
    expertBouzuRate: 30,
    label: "泳がせ釣り",
    description: "活きエサさえ確保できれば大物のチャンスがあるが、待ちの釣り",
  },
  "ダンゴ釣り": {
    baseBouzuRate: 35,
    expertBouzuRate: 15,
    label: "ダンゴ釣り",
    description: "チヌ狙いの定番、ダンゴの配合と投入精度がカギ",
  },
  "落とし込み": {
    baseBouzuRate: 45,
    expertBouzuRate: 18,
    label: "落とし込み",
    description: "堤防際を丁寧に探る技術的な釣り方",
  },
  "カゴ釣り": {
    baseBouzuRate: 30,
    expertBouzuRate: 12,
    label: "カゴ釣り",
    description: "遠投してコマセで魚を寄せる、安定した釣果が期待できる",
  },
  "ジギング": {
    baseBouzuRate: 55,
    expertBouzuRate: 20,
    label: "ジギング",
    description: "回遊魚の動向に大きく依存する",
  },
};

// ===================================================================
// 魚種別の釣りやすさデータベース
// 各魚種の生態・行動パターンに基づく釣りやすさ係数
// ===================================================================
export const FISH_CATCHABILITY: Record<string, {
  coefficient: number; // 0-1の範囲、高いほど釣れやすい
  category: "schooling" | "resident" | "predator" | "difficult";
  label: string;
}> = {
  // 群れ魚（非常に釣れやすい）
  "aji": { coefficient: 0.85, category: "schooling", label: "アジ（群れ魚・釣れやすい）" },
  "iwashi": { coefficient: 0.90, category: "schooling", label: "イワシ（群れ魚・非常に釣れやすい）" },
  "saba": { coefficient: 0.82, category: "schooling", label: "サバ（群れ魚・釣れやすい）" },
  "sayori": { coefficient: 0.75, category: "schooling", label: "サヨリ（群れ魚・比較的釣れやすい）" },
  "konoshiro": { coefficient: 0.80, category: "schooling", label: "コノシロ（群れ魚・釣れやすい）" },

  // 居着き魚（比較的釣れやすい）
  "kasago": { coefficient: 0.78, category: "resident", label: "カサゴ（居着き・比較的釣れやすい）" },
  "mebaru": { coefficient: 0.72, category: "resident", label: "メバル（居着き・比較的釣れやすい）" },
  "haze": { coefficient: 0.85, category: "resident", label: "ハゼ（居着き・非常に釣れやすい）" },
  "kisu": { coefficient: 0.75, category: "resident", label: "キス（群れ・比較的釣れやすい）" },
  "karei": { coefficient: 0.65, category: "resident", label: "カレイ（居着き・まずまず）" },
  "ainame": { coefficient: 0.68, category: "resident", label: "アイナメ（居着き・まずまず）" },
  "kurosoi": { coefficient: 0.70, category: "resident", label: "クロソイ（居着き・比較的釣れやすい）" },
  "takobe": { coefficient: 0.65, category: "resident", label: "タケノコメバル（居着き・まずまず）" },

  // フィッシュイーター（やや難しい）
  "seabass": { coefficient: 0.40, category: "predator", label: "シーバス（技術依存・やや難しい）" },
  "kurodai": { coefficient: 0.50, category: "predator", label: "クロダイ（技術依存・やや難しい）" },
  "aoriika": { coefficient: 0.38, category: "predator", label: "アオリイカ（回遊依存・難しい）" },
  "buri": { coefficient: 0.30, category: "predator", label: "ブリ（回遊依存・難しい）" },
  "inada": { coefficient: 0.35, category: "predator", label: "イナダ（回遊依存・やや難しい）" },
  "kanpachi": { coefficient: 0.28, category: "predator", label: "カンパチ（回遊依存・難しい）" },
  "sawara": { coefficient: 0.35, category: "predator", label: "サワラ（回遊依存・やや難しい）" },

  // 難易度高い魚種
  "madai": { coefficient: 0.25, category: "difficult", label: "マダイ（難易度高・かなり難しい）" },
  "hirame": { coefficient: 0.28, category: "difficult", label: "ヒラメ（難易度高・かなり難しい）" },
  "magochi": { coefficient: 0.30, category: "difficult", label: "マゴチ（難易度高・難しい）" },
  "ishidai": { coefficient: 0.20, category: "difficult", label: "イシダイ（難易度高・非常に難しい）" },

  // 渓流魚
  "yamame": { coefficient: 0.35, category: "predator", label: "ヤマメ（渓流・技術依存）" },
  "iwana": { coefficient: 0.35, category: "predator", label: "イワナ（渓流・技術依存）" },
  "nijimasu": { coefficient: 0.60, category: "resident", label: "ニジマス（管理釣り場なら釣れやすい）" },
  "ayu": { coefficient: 0.45, category: "predator", label: "アユ（友釣りは技術依存）" },
};

// エリアベースの釣り圧補正（実際のスポット所在地で判定）
// 同じ都道府県でも都市部と田舎で釣り圧が大きく異なるため、エリア単位で設定
export const AREA_PRESSURE: Record<string, number> = {
  // 東京都
  "東京湾": 18,
  // 神奈川県
  "横浜": 16, "湘南": 12, "三浦半島": 6, "西湘": 4,
  // 千葉県
  "房総半島": 6, "外房": 2,
  // 大阪府
  "大阪湾": 14, "大阪市南港": 16, "大正・此花": 16, "泉大津": 10, "岬町": 4,
  // 兵庫県（都市部と田舎の差が大きい）
  "阪神": 14, "明石": 6, "淡路島": -2, "淡路島南部": -4,
  // 京都府（釣りスポットは全て日本海側の田舎）
  "舞鶴": -4, "京丹後": -6,
  // 愛知県
  "知多半島": 10, "三河湾": 8,
  // 静岡県
  "伊豆・熱海": 4, "駿河湾": 0,
  // 三重県
  "志摩": -2, "尾鷲": -4,
  // 和歌山県
  "南紀": -4, "紀北": 0,
  // 福岡県
  "博多湾": 8, "北九州": 4,
  // 広島県
  "瀬戸内": 2, "尾道": 0,
  // 宮城県
  "仙台湾": 4, "女川": -2, "石巻": 0,
  // 新潟県
  "新潟": 0, "寺泊": -2, "柏崎": -2,
  // 茨城県
  "大洗": 4, "鹿島": 2,
  // 岡山県
  "倉敷": 4,
  // 滋賀県
  "琵琶湖": 6,
  // 山梨県
  "山中湖": 6,
  // 長野県
  "諏訪湖": 4,
  // 栃木県
  "中禅寺湖": 4,
  // 群馬県
  "利根川": 6,
  // 富山県
  "氷見": -2,
  // 石川県
  "能登": -4, "能登島": -6,
  // 福井県
  "敦賀": -2, "三国": -4,
  // 北海道
  "小樽・石狩": -6, "函館": -4,
  // 沖縄県
  "那覇": -2, "宮古島": -8, "石垣島": -8,
  "北谷・宜野湾": -4, "読谷・恩納": -6, "名護・本部": -6,
  "金武・うるま": -6, "中城・南城": -6, "糸満・豊見城": -4,
  // 鹿児島県
  "錦江湾": -4, "屋久島": -8, "鹿児島市": -2, "枕崎": -6, "志布志": -6, "垂水": -6,
  // 青森県
  "八戸": -4, "陸奥湾": -6, "大間": -8,
  // 岩手県
  "宮古": -8, "久慈": -8,
  // 秋田県
  "男鹿": -6, "能代": -8,
  // 山形県
  "酒田": -6, "鼠ヶ関": -8,
  // 福島県
  "いわき": -2, "相馬新地": -4,
  // 高知県
  "土佐湾": -6, "足摺": -8, "宿毛": -8, "桂浜": -6,
  // 徳島県
  "鳴門": -2, "小松島": -4,
  // 香川県
  "高松": 0, "詫間": -4,
  // 愛媛県
  "松山": -2, "今治": -4, "佐田岬": -6,
  // 大分県
  "別府": -2, "佐伯": -6, "津久見": -6, "臼杵": -6, "佐賀関": -4,
  // 熊本県
  "天草": -6,
  // 宮崎県
  "日南": -6, "宮崎港": -4, "日南・油津": -6, "日向・細島": -6, "延岡": -4,
  // 佐賀県
  "唐津": -4, "呼子": -6,
  // 長崎県
  "五島": -8, "平戸": -6, "長崎市": -2, "佐世保": -4,
  // 山口県
  "下関": -2,
  // 鳥取県
  "境港": -4, "岩美": -6, "琴浦": -6,
  // 島根県
  "美保関": -6, "出雲大社": -4, "浜田": -6, "益田": -6, "隠岐": -8,
};

// 都道府県のデフォルト値（エリア名で見つからない場合のフォールバック）
export const PREFECTURE_PRESSURE_DEFAULT: Record<string, number> = {
  "東京": 18, "神奈川": 10, "大阪": 14, "愛知": 10, "埼玉": 15,
  "千葉": 6, "兵庫": 4, "福岡": 4, "京都": -4,
  "静岡": 2, "広島": 2, "宮城": 2, "新潟": 0, "岡山": 4,
  "三重": -2, "長崎": -4, "和歌山": -2, "石川": -2, "富山": -2,
  "北海道": -6, "沖縄": -6, "鹿児島": -4, "宮崎": -6,
  "高知": -6, "徳島": -4, "愛媛": -4, "香川": -2,
  "大分": -4, "熊本": -4, "佐賀": -4, "山口": -4,
  "鳥取": -6, "島根": -6, "福井": -4, "山形": -6,
  "秋田": -8, "岩手": -8, "青森": -6,
  "茨城": 4, "栃木": 4, "群馬": 6, "山梨": 6, "長野": 4,
  "岐阜": 4, "滋賀": 6, "奈良": 10, "福島": -2,
};

export function getAreaPressure(prefecture: string, areaName: string): number {
  // まずエリア名で直接検索
  if (AREA_PRESSURE[areaName] !== undefined) {
    return AREA_PRESSURE[areaName];
  }
  // フォールバック: 都道府県デフォルト
  const key = prefecture.replace(/[都道府県]$/, "");
  return PREFECTURE_PRESSURE_DEFAULT[key] ?? 0;
}

// 地域別の月間平均気温（℃）推定テーブル
// 気象庁データベースに基づく代表値。ボウズ率・混雑予想の共通基盤。
const REGIONAL_AVG_TEMP: Record<string, number[]> = {
  // index 0=1月, 11=12月
  "北日本":   [ 0,  1,  4,  10, 16, 20, 23, 25, 21, 14,  8,  2],
  "東日本":   [ 5,  6,  9,  14, 19, 22, 26, 27, 24, 18, 12,  7],
  "中日本":   [ 5,  6, 10,  15, 20, 23, 27, 28, 25, 19, 13,  7],
  "西日本":   [ 6,  7, 10,  15, 20, 24, 28, 29, 25, 19, 14,  8],
  "南西日本": [15, 15, 18,  21, 24, 27, 29, 29, 27, 24, 20, 17],
};

const PREFECTURE_REGION_MAP: Record<string, string> = {
  "北海道": "北日本", "青森": "北日本", "岩手": "北日本", "秋田": "北日本", "山形": "北日本",
  "宮城": "東日本", "福島": "東日本", "茨城": "東日本", "栃木": "東日本", "群馬": "東日本",
  "埼玉": "東日本", "千葉": "東日本", "東京": "東日本", "神奈川": "東日本", "新潟": "東日本",
  "富山": "中日本", "石川": "中日本", "福井": "中日本", "山梨": "中日本", "長野": "中日本",
  "岐阜": "中日本", "静岡": "中日本", "愛知": "中日本", "三重": "中日本",
  "滋賀": "西日本", "京都": "西日本", "大阪": "西日本", "兵庫": "西日本", "奈良": "西日本",
  "和歌山": "西日本", "鳥取": "西日本", "島根": "西日本", "岡山": "西日本", "広島": "西日本",
  "山口": "西日本", "徳島": "西日本", "香川": "西日本", "愛媛": "西日本", "高知": "西日本",
  "福岡": "西日本", "佐賀": "西日本", "長崎": "西日本", "熊本": "西日本",
  "大分": "西日本", "宮崎": "西日本", "鹿児島": "南西日本", "沖縄": "南西日本",
};

/** 都道府県と月から推定気温を取得 */
export function getEstimatedTemp(prefecture: string | undefined, month: number): number {
  const key = (prefecture ?? "").replace(/[都道府県]$/, "");
  const regionKey = PREFECTURE_REGION_MAP[key] ?? "中日本";
  const temps = REGIONAL_AVG_TEMP[regionKey] ?? REGIONAL_AVG_TEMP["中日本"];
  return temps[month - 1] ?? 15;
}

/** 推定気温からボウズ率の月補正を算出（固定月値ではなく気温駆動） */
export function getMonthCorrection(month: number, spotType?: string, prefecture?: string): number {
  // 河川は解禁期ベース（気温よりルールが支配的）
  if (spotType === "river") {
    const riverCorrections: Record<number, number> = {
      1: 25, 2: 20, 3: 5, 4: -8, 5: -12, 6: -8,
      7: -5, 8: 0, 9: -8, 10: 5, 11: 20, 12: 25,
    };
    return riverCorrections[month] ?? 0;
  }

  const temp = getEstimatedTemp(prefecture, month);

  // 気温→海水温の大まかな対応で魚活性を推定
  // 気温15-25℃ ≈ 海水温15-23℃: 活性高い
  // 気温5-10℃ ≈ 海水温10-14℃: 活性低い
  if (temp <= 3) return 35;       // 極寒: ボウズ率大幅UP
  if (temp <= 7) return 25;       // 厳冬
  if (temp <= 10) return 15;      // 寒い
  if (temp <= 14) return 5;       // 肌寒い
  if (temp <= 19) return -5;      // 快適: やや釣れやすい
  if (temp <= 25) return -10;     // ベスト: 活性ピーク
  if (temp <= 30) return -5;      // 暑い: まだ良い
  return 0;                       // 猛暑: 高水温で活性低下
}

// 気温ベースの釣り方別ボウズ率補正係数
// 固定月値ではなく推定気温から乗数を算出。暖冬・寒冬に動的対応。
export function getSeasonalMethodMultiplier(month: number, spotType?: string, prefecture?: string): number {
  // 河川は解禁期ベース
  if (spotType === "river") {
    const riverMultipliers: Record<number, number> = {
      1: 1.4, 2: 1.3, 3: 1.1, 4: 1.0, 5: 0.9, 6: 0.95,
      7: 1.0, 8: 1.1, 9: 0.95, 10: 1.1, 11: 1.3, 12: 1.4,
    };
    return riverMultipliers[month] ?? 1.0;
  }

  const temp = getEstimatedTemp(prefecture, month);

  if (temp <= 3) return 1.8;      // 極寒: 大幅に難化
  if (temp <= 7) return 1.5;      // 厳冬
  if (temp <= 10) return 1.3;     // 寒い
  if (temp <= 14) return 1.1;     // 肌寒い
  if (temp <= 19) return 1.0;     // 標準
  if (temp <= 25) return 0.9;     // 活性ピーク
  if (temp <= 30) return 0.95;    // 暑いがまだ良い
  return 1.0;                     // 猛暑
}

// 釣り方別のボウズ率補正を計算
export function getMethodCorrection(details: CatchableFishInfo[], currentMonth: number, spotType?: string, prefecture?: string): {
  correction: number;
  primaryMethod: string | null;
  primaryMethodRate: number | null;
  methodDescription: string | null;
} {
  if (!details || details.length === 0) {
    return { correction: 0, primaryMethod: null, primaryMethodRate: null, methodDescription: null };
  }

  // 現在の月に釣れる魚のみフィルタ
  const inSeasonFish = details.filter((f) => {
    if (f.monthStart <= f.monthEnd) {
      return currentMonth >= f.monthStart && currentMonth <= f.monthEnd;
    }
    // 月をまたぐケース（例: 10月〜3月）
    return currentMonth >= f.monthStart || currentMonth <= f.monthEnd;
  });

  const fishToUse = inSeasonFish.length > 0 ? inSeasonFish : details;

  // 季節補正係数を取得（気温ベース）
  const seasonalMultiplier = getSeasonalMethodMultiplier(currentMonth, spotType, prefecture);

  // 釣り方ごとの出現回数（対象魚種数）をカウントし、最も多い釣り方を主要メソッドとする
  const methodCount: Record<string, number> = {};
  const methodRates: { method: string; rate: number; description: string; count: number }[] = [];

  for (const fish of fishToUse) {
    methodCount[fish.method] = (methodCount[fish.method] || 0) + 1;
  }

  const seenMethods = new Set<string>();
  for (const fish of fishToUse) {
    if (seenMethods.has(fish.method)) continue;
    seenMethods.add(fish.method);

    const methodData = METHOD_BOUZU_DATABASE[fish.method];
    if (methodData) {
      // 季節補正を適用（冬はボウズ率が上がる）
      const adjustedRate = Math.min(90, Math.round(methodData.baseBouzuRate * seasonalMultiplier));
      methodRates.push({
        method: methodData.label,
        rate: adjustedRate,
        description: methodData.description,
        count: methodCount[fish.method] || 1,
      });
    }
  }

  if (methodRates.length === 0) {
    return { correction: 0, primaryMethod: null, primaryMethodRate: null, methodDescription: null };
  }

  // 対象魚種数が最も多い釣り方を主要メソッドとする（同数なら名前順で安定ソート）
  methodRates.sort((a, b) => b.count - a.count || a.method.localeCompare(b.method));
  const primary = methodRates[0];

  // 全メソッドの平均ボウズ率を算出
  const avgRate = methodRates.reduce((sum, m) => sum + m.rate, 0) / methodRates.length;

  // 基準値35%からの差分を補正として適用（釣れやすい釣り方なら下方補正）
  const correction = Math.round((avgRate - 35) * 0.4);

  return {
    correction,
    primaryMethod: primary.method,
    primaryMethodRate: primary.rate,
    methodDescription: primary.description,
  };
}

// 魚種別の釣りやすさ補正を計算
export function getFishCatchabilityCorrection(details: CatchableFishInfo[], currentMonth: number): {
  correction: number;
  hasSchoolingFish: boolean;
  schoolingFishNames: string[];
  hasDifficultFish: boolean;
} {
  if (!details || details.length === 0) {
    return { correction: 0, hasSchoolingFish: false, schoolingFishNames: [], hasDifficultFish: false };
  }

  // 現在の月に釣れる魚のみ
  const inSeasonFish = details.filter((f) => {
    if (f.monthStart <= f.monthEnd) {
      return currentMonth >= f.monthStart && currentMonth <= f.monthEnd;
    }
    return currentMonth >= f.monthStart || currentMonth <= f.monthEnd;
  });

  const fishToUse = inSeasonFish.length > 0 ? inSeasonFish : details;

  let totalCoefficient = 0;
  let count = 0;
  const schoolingNames: string[] = [];
  let hasDifficult = false;

  for (const fish of fishToUse) {
    const fishData = FISH_CATCHABILITY[fish.fishSlug];
    if (fishData) {
      totalCoefficient += fishData.coefficient;
      count++;
      if (fishData.category === "schooling") {
        schoolingNames.push(fish.fishName);
      }
      if (fishData.category === "difficult") {
        hasDifficult = true;
      }
    } else {
      // データベースにない魚はcatchDifficultyから推定
      const diffMap = { easy: 0.75, medium: 0.50, hard: 0.30 };
      totalCoefficient += diffMap[fish.catchDifficulty] ?? 0.50;
      count++;
    }
  }

  if (count === 0) {
    return { correction: 0, hasSchoolingFish: false, schoolingFishNames: [], hasDifficultFish: false };
  }

  const avgCoefficient = totalCoefficient / count;
  // 基準0.5からの差分を補正に変換（釣れやすい魚が多いと下方補正）
  const correction = Math.round((0.5 - avgCoefficient) * 20);

  return {
    correction,
    hasSchoolingFish: schoolingNames.length > 0,
    schoolingFishNames: [...new Set(schoolingNames)],
    hasDifficultFish: hasDifficult,
  };
}

// シーズン中の魚がいるかどうかの補正
export function getSeasonFishCorrection(details: CatchableFishInfo[], currentMonth: number): {
  correction: number;
  inSeasonCount: number;
  peakSeasonCount: number;
} {
  if (!details || details.length === 0) {
    return { correction: 0, inSeasonCount: 0, peakSeasonCount: 0 };
  }

  let inSeason = 0;
  let peakSeason = 0;

  for (const fish of details) {
    let isInSeason = false;
    if (fish.monthStart <= fish.monthEnd) {
      isInSeason = currentMonth >= fish.monthStart && currentMonth <= fish.monthEnd;
    } else {
      isInSeason = currentMonth >= fish.monthStart || currentMonth <= fish.monthEnd;
    }
    if (isInSeason) {
      inSeason++;
      if (fish.peakSeason) peakSeason++;
    }
  }

  let correction = 0;
  // シーズン中の魚が多いほどボウズしにくい
  if (inSeason === 0) {
    correction = 22; // シーズン中の魚がいない → 大幅UP
  } else if (inSeason >= 4) {
    correction = -3;
  } else if (inSeason >= 2) {
    correction = -1;
  }

  // ピークシーズンの魚がいても冬は効果を弱める
  // 理由: メバル・カサゴは「冬がピーク」とされるが、
  // 海水温10℃以下では活性が大幅に落ち、実際はボウズが多い
  // 実測(2026-02-28): メバル狙い胴突き→ボウズ。冬のメバルは机上の空論。
  const isHarshWinter = [1, 2].includes(currentMonth);
  const isColdMonth = [1, 2, 12].includes(currentMonth);
  if (isHarshWinter) {
    // 1-2月はピークシーズン補正を完全無効化（メバルもカサゴも実際は釣れない）
    correction += 5; // むしろ追加ペナルティ（「冬が旬」を信じて行くとボウズ）
  } else if (isColdMonth) {
    // 12月はピーク補正を弱める
    if (peakSeason >= 2) {
      correction -= 1;
    }
  } else {
    if (peakSeason >= 2) {
      correction -= 3;
    } else if (peakSeason >= 1) {
      correction -= 1;
    }
  }

  return { correction, inSeasonCount: inSeason, peakSeasonCount: peakSeason };
}

export function calcSpotBouzuProbability(
  props: SpotBouzuCardProps,
  currentMonth: number
): number {
  // 1. 釣り場タイプ別のベーススコア
  const spotTypeBase: Record<string, number> = {
    port: 22,
    pier: 25,
    breakwater: 25,
    beach: 40,
    rocky: 38,
    river: 35,
  };
  let score = spotTypeBase[props.spotType] ?? 30;

  // 2. 難易度補正（冬は全難易度で+8上昇）
  const difficultyMod: Record<string, number> = {
    beginner: -8,
    intermediate: 0,
    advanced: 8,
  };
  score += difficultyMod[props.difficulty] ?? 0;
  // 気温が低いと難易度に関係なくボウズしやすい
  const estTemp = getEstimatedTemp(props.prefecture, currentMonth);
  if (props.spotType !== "river") {
    if (estTemp <= 5) score += 12;
    else if (estTemp <= 10) score += 6;
    else if (estTemp <= 14) score += 2;
  } else {
    if (estTemp <= 5) score += 5;
    else if (estTemp <= 10) score += 2;
  }

  // 3. 地域差（エリア単位で判定）
  score += getAreaPressure(props.prefecture, props.areaName);

  // 4. 月別補正（気温ベース）
  score += getMonthCorrection(currentMonth, props.spotType, props.prefecture);

  // 5. 評価スコアによる補正（高評価＝釣れやすい）
  if (props.rating >= 4.5) score -= 8;
  else if (props.rating >= 4.0) score -= 4;
  else if (props.rating >= 3.5) score -= 2;
  else if (props.rating < 3.0) score += 5;

  // 6. レンタル竿あり（管理的な場所→ボウズしにくい）
  if (props.hasRentalRod) score -= 5;

  // 7. 魚種の多さ（多い＝何かしら釣れやすい）
  if (props.catchableFishCount >= 8) score -= 6;
  else if (props.catchableFishCount >= 5) score -= 3;
  else if (props.catchableFishCount <= 2) score += 5;

  // 8. 無料スポット（人が多い→やや釣り圧）
  if (props.isFree) score += 3;

  // === 釣果データベースに基づく新しい補正 ===
  if (props.catchableFishDetails && props.catchableFishDetails.length > 0) {
    // 9. 釣り方別ボウズ率データによる補正（気温ベース）
    const methodResult = getMethodCorrection(props.catchableFishDetails, currentMonth, props.spotType, props.prefecture);
    score += methodResult.correction;

    // 10. 魚種別の釣りやすさ補正
    const fishResult = getFishCatchabilityCorrection(props.catchableFishDetails, currentMonth);
    score += fishResult.correction;

    // 11. シーズン中の魚の数による補正
    const seasonResult = getSeasonFishCorrection(props.catchableFishDetails, currentMonth);
    score += seasonResult.correction;
  }

  return Math.max(5, Math.min(95, score));
}
