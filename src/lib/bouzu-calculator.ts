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

// 月別の釣れやすさ補正
// 実測データ: 冬（12-2月）は海水温低下で魚の活性が大幅ダウン。
// 特に1-2月は堤防からの釣果がほぼゼロになることも珍しくない。
// 2026-03-01修正: 冬の補正を大幅強化。
// 実測データ(2026-02-28 二見人工島): 2月土曜、胴突きメバル狙い→全員ボウズ。
// 水位低下で穴釣り不可。半日でヒトデのみ。同日の釣り人3組全員ボウズ。
export function getMonthCorrection(month: number, spotType?: string): number {
  // 河川は海水温ではなく河川水温・渓流解禁期に基づく補正
  if (spotType === "river") {
    const riverCorrections: Record<number, number> = {
      1: 25,   // 冬: 多くの渓流が禁漁、水温も低い
      2: 20,   // 厳冬: 一部2月解禁あるが基本的に厳しい
      3: 5,    // 早春: 渓流解禁、水温は低いが魚は動き出す
      4: -8,   // 春: 水温上昇し活性UP
      5: -12,  // 初夏: ベストシーズン
      6: -8,   // 梅雨: 増水リスクあるが活性高い
      7: -5,   // 盛夏: 朝夕が勝負
      8: 0,    // 晩夏: 水温高め
      9: -8,   // 初秋: 再び好シーズン
      10: 5,   // 秋: 禁漁に入る河川あり
      11: 20,  // 晩秋: ほぼ禁漁
      12: 25,  // 冬: 禁漁
    };
    return riverCorrections[month] ?? 0;
  }
  const corrections: Record<number, number> = {
    1: 50,  // 真冬: 海水温8-10℃、魚活性最低、堤防はほぼ釣果ゼロ
    2: 48,  // 厳冬期: 海水温9-11℃、実測で全員ボウズ
    3: 30,  // 早春: 海水温11-13℃、回復し始めるがまだ厳しい
    4: 5,   // 春本番: 海水温13-16℃、活性上昇中だがまだ本調子ではない
    5: -8,  // 初夏: 海水温16-19℃、活性が高くなる
    6: -12, // 梅雨: 海水温19-22℃、多くの魚種が活発
    7: -15, // 盛夏: 海水温22-25℃、活性ピーク
    8: -12, // 晩夏: 海水温24-26℃、活性維持
    9: -8,  // 初秋: 海水温22-24℃、まだ好調
    10: 0,  // 秋: 海水温18-22℃、徐々に活性低下
    11: 15, // 晩秋: 海水温14-17℃、冬に向かって厳しくなる
    12: 38, // 冬入口: 海水温11-14℃、急激に厳しくなる
  };
  return corrections[month] ?? 0;
}

// 季節による釣り方別ボウズ率の補正係数
// 冬は全ての釣り方で難易度が上がる（海水温低下で魚の活性が落ちるため）
// 実測(2026-02-28): 胴突きメバル狙い・穴釣り→全員ボウズ。冬は全釣法で大幅に難易度UP。
export function getSeasonalMethodMultiplier(month: number, spotType?: string): number {
  // 河川は海とは異なる季節パターン
  if (spotType === "river") {
    const riverMultipliers: Record<number, number> = {
      1: 1.4, 2: 1.3, 3: 1.1, 4: 1.0, 5: 0.9, 6: 0.95,
      7: 1.0, 8: 1.1, 9: 0.95, 10: 1.1, 11: 1.3, 12: 1.4,
    };
    return riverMultipliers[month] ?? 1.0;
  }
  const multipliers: Record<number, number> = {
    1: 2.0,  // 真冬: ボウズ率2.0倍（穴釣り20%→40%、メバリング40%→80%）
    2: 1.9,  // 厳冬期: 1.9倍（実測で全釣法ボウズ）
    3: 1.5,  // 早春: 1.5倍（まだ水温低い）
    4: 1.1,  // 春: ほぼ通常
    5: 1.0,  // 初夏: 通常
    6: 0.9,  // 梅雨: やや釣れやすい
    7: 0.85, // 盛夏: 活性ピーク
    8: 0.9,  // 晩夏: 好調
    9: 0.95, // 初秋: ほぼ通常
    10: 1.0, // 秋: 通常
    11: 1.2, // 晩秋: やや厳しくなる
    12: 1.6, // 冬入口: 1.6倍
  };
  return multipliers[month] ?? 1.0;
}

// 釣り方別のボウズ率補正を計算
export function getMethodCorrection(details: CatchableFishInfo[], currentMonth: number, spotType?: string): {
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

  // 季節補正係数を取得
  const seasonalMultiplier = getSeasonalMethodMultiplier(currentMonth, spotType);

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
  // 冬は初心者でも上級者でも難しい（海水温低下で魚の活性が落ちる）
  // 実測: 2月は全員ボウズ。冬の堤防は技術関係なく厳しい。
  if (props.spotType === "river") {
    // 河川は海ほど冬の影響を受けない（渓流は3月解禁で釣れる）
    if ([1, 2].includes(currentMonth)) score += 5;
    else if (currentMonth === 12) score += 5;
    else if ([3, 11].includes(currentMonth)) score += 2;
  } else {
    if ([1, 2].includes(currentMonth)) {
      score += 15; // 真冬はどの難易度でも+15
    } else if (currentMonth === 12) {
      score += 10;
    } else if ([3, 11].includes(currentMonth)) {
      score += 5;
    }
  }

  // 3. 地域差（エリア単位で判定）
  score += getAreaPressure(props.prefecture, props.areaName);

  // 4. 月別補正
  score += getMonthCorrection(currentMonth, props.spotType);

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
    // 9. 釣り方別ボウズ率データによる補正
    const methodResult = getMethodCorrection(props.catchableFishDetails, currentMonth, props.spotType);
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
