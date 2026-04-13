/**
 * 混雑予測モデル
 * 天気・潮汐・曜日・時間帯・シーズンから釣り場の混みやすさを推定する。
 * キャリアデータは高額（月15万円〜）＆田舎の精度が低いため、
 * 相関因子を使った予測モデルを採用。
 */

export type CrowdLevel = "empty" | "low" | "moderate" | "busy" | "very_busy";

export interface CrowdPrediction {
  level: CrowdLevel;
  score: number; // 0-100
  label: string;
  color: string;
  factors: string[];
}

const CROWD_LABELS: Record<CrowdLevel, { label: string; color: string }> = {
  empty: { label: "ガラガラ", color: "text-green-600" },
  low: { label: "空いている", color: "text-emerald-600" },
  moderate: { label: "普通", color: "text-yellow-600" },
  busy: { label: "やや混雑", color: "text-orange-600" },
  very_busy: { label: "混雑", color: "text-red-600" },
};

interface PredictionInput {
  dayOfWeek: number; // 0=Sun, 6=Sat
  hour: number; // 0-23
  month: number; // 1-12
  isHoliday?: boolean;
  weatherCode?: string; // "clear" | "clouds" | "rain" | "storm"
  windSpeed?: number; // m/s
  temperature?: number; // Celsius
  spotPopularity?: number; // 1-5 rating as popularity proxy
  isFree?: boolean;
  difficulty?: "beginner" | "intermediate" | "advanced";
  prefecture?: string; // 都道府県（都市度推定に使用）
  hasParking?: boolean; // 駐車場の有無（アクセス性）
  reviewCount?: number; // レビュー数（人気の直接指標）
}

/**
 * 混雑スコアを計算する (0-100)
 */
export function calculateCrowdScore(input: PredictionInput): CrowdPrediction {
  let score = 30; // baseline
  const factors: string[] = [];

  // --- 曜日の影響 (最大+30) ---
  if (input.dayOfWeek === 0 || input.dayOfWeek === 6 || input.isHoliday) {
    score += 25;
    factors.push(input.isHoliday ? "祝日" : "週末");
  } else {
    score -= 15;
    factors.push("平日");
  }

  // --- 時間帯の影響 (最大+20) ---
  if (input.hour >= 5 && input.hour <= 7) {
    // 朝マヅメ
    score += 20;
    factors.push("朝マヅメ（早朝）");
  } else if (input.hour >= 8 && input.hour <= 10) {
    score += 12;
  } else if (input.hour >= 15 && input.hour <= 17) {
    // 夕マヅメ
    score += 15;
    factors.push("夕マヅメ");
  } else if (input.hour >= 11 && input.hour <= 14) {
    score += 5;
  } else {
    // 夜間
    score -= 10;
  }

  // --- 天気の影響 (最大+15) ---
  if (input.weatherCode) {
    switch (input.weatherCode) {
      case "clear":
        score += 15;
        factors.push("晴れ");
        break;
      case "clouds":
        score += 5;
        break;
      case "rain":
        score -= 20;
        factors.push("雨で空きやすい");
        break;
      case "storm":
        score -= 35;
        factors.push("荒天で人が少ない");
        break;
    }
  }

  // --- 風速の影響 ---
  if (input.windSpeed !== undefined) {
    if (input.windSpeed > 10) {
      score -= 20;
      factors.push("強風");
    } else if (input.windSpeed > 7) {
      score -= 10;
      factors.push("やや風が強い");
    } else if (input.windSpeed < 3) {
      score += 5;
    }
  }

  // --- 気温の影響（混雑の主要因子）---
  // 釣り人の行動は気温に最も強く相関する。シーズンより気温が直接的。
  if (input.temperature !== undefined) {
    if (input.temperature < 0) {
      score -= 45;
      factors.push("氷点下（ほぼ人がいない）");
    } else if (input.temperature < 5) {
      score -= 35;
      factors.push("寒さで人が少ない");
    } else if (input.temperature < 10) {
      score -= 20;
      factors.push("肌寒い");
    } else if (input.temperature < 15) {
      score -= 8;
    } else if (input.temperature >= 15 && input.temperature <= 28) {
      score += 12;
      factors.push("快適な気温");
    } else if (input.temperature > 35) {
      score -= 15;
      factors.push("猛暑");
    } else if (input.temperature > 30) {
      score -= 5;
      factors.push("暑い");
    }
  } else {
    // 気温データがない場合のみ月別フォールバック（控えめ）
    if (input.month === 1 || input.month === 2) {
      score -= 25;
      factors.push("冬（空きやすい）");
    } else if (input.month === 12) {
      score -= 18;
      factors.push("冬（空きやすい）");
    } else if (input.month === 3) {
      score -= 10;
      factors.push("早春");
    } else if (input.month === 11) {
      score -= 8;
    }
  }

  // --- 長期休暇の影響（シーズンではなく休暇で補正）---
  if (input.month >= 7 && input.month <= 8) {
    score += 12;
    factors.push("夏休みシーズン");
  } else if (input.month === 5 && (input.dayOfWeek === 0 || input.dayOfWeek === 6 || input.isHoliday)) {
    score += 5;
    factors.push("GW期間");
  }

  // --- スポット人気度の影響 ---
  if (input.spotPopularity) {
    score += (input.spotPopularity - 3) * 5; // 3が基準、5なら+10、1なら-10
  }

  // --- 無料スポットは混みやすい ---
  if (input.isFree) {
    score += 8;
    factors.push("無料スポット");
  }

  // --- 初心者スポットは混みやすい ---
  if (input.difficulty === "beginner") {
    score += 5;
  }

  // --- 都市度の影響（田舎は混まない）---
  if (input.prefecture) {
    const urbanPrefectures = ["東京都", "神奈川県", "大阪府", "愛知県", "千葉県", "埼玉県", "兵庫県", "福岡県"];
    const suburbanPrefectures = ["静岡県", "京都府", "広島県", "宮城県", "新潟県", "北海道", "三重県", "和歌山県"];
    const ruralPrefectures = [
      "青森県", "岩手県", "秋田県", "山形県", "福島県",
      "鳥取県", "島根県", "山口県", "徳島県", "高知県",
      "佐賀県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
      "富山県", "石川県", "福井県", "山梨県", "長野県",
      "岐阜県", "奈良県", "滋賀県",
    ];
    if (urbanPrefectures.includes(input.prefecture)) {
      score += 12;
      factors.push("都市部で人が多い");
    } else if (suburbanPrefectures.includes(input.prefecture)) {
      score -= 5;
    } else if (ruralPrefectures.includes(input.prefecture)) {
      score -= 30;
      factors.push("地方のため人が少ない");
    } else {
      score -= 20;
      factors.push("地方で空きやすい");
    }
  }

  // 気温が低い時は週末ボーナスを減らす（寒いと週末でも来ない）
  if (input.temperature !== undefined && input.temperature < 8 && (input.dayOfWeek === 0 || input.dayOfWeek === 6 || input.isHoliday)) {
    score -= 10;
    factors.push("寒い日は週末でも人が少ない");
  }

  // --- アクセス性の影響 ---
  if (input.hasParking === false) {
    score -= 8;
    factors.push("駐車場なし");
  }

  // --- レビュー数による人気度補正 ---
  if (input.reviewCount !== undefined) {
    if (input.reviewCount > 100) {
      score += 10;
      factors.push("人気スポット");
    } else if (input.reviewCount > 50) {
      score += 5;
    } else if (input.reviewCount < 10) {
      score -= 8;
      factors.push("穴場スポット");
    }
  }

  // clamp
  score = Math.max(0, Math.min(100, score));

  // level判定
  let level: CrowdLevel;
  if (score < 15) level = "empty";
  else if (score < 35) level = "low";
  else if (score < 55) level = "moderate";
  else if (score < 75) level = "busy";
  else level = "very_busy";

  const { label, color } = CROWD_LABELS[level];

  return { level, score, label, color, factors };
}

/**
 * 1日の時間帯別混雑予測を生成する
 */
export function getDailyPredictions(
  baseInput: Omit<PredictionInput, "hour">
): { hour: number; prediction: CrowdPrediction }[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    prediction: calculateCrowdScore({ ...baseInput, hour }),
  }));
}

/**
 * 今週の曜日別混雑予測（ピーク時間帯で計算）
 */
export function getWeeklyPredictions(
  baseInput: Omit<PredictionInput, "dayOfWeek" | "hour">
): { dayOfWeek: number; dayLabel: string; prediction: CrowdPrediction }[] {
  const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];
  return Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    dayLabel: dayLabels[i],
    prediction: calculateCrowdScore({ ...baseInput, dayOfWeek: i, hour: 7 }), // 朝マヅメ基準
  }));
}
