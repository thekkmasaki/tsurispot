// 月齢・潮回り計算（クライアント安全: fs等のサーバー依存なし）
// 月齢は朔（新月）の天文時刻テーブル（new-moons.ts、Meeus法）からの経過日数。
// 潮回りは朔望・矩からの位相距離で判定し、tide736等の一般的な潮見表の区分と一致することを
// 2026-08の実ラベル14日分で検証済み（大潮=朔望±2日未満 / 小潮=矩±1.5日 / 長潮・若潮が後続）。
import { NEW_MOONS_JST } from "./new-moons";

export const SYNODIC_MONTH = 29.530588853;

export interface TidePhase {
  moonAge: number;
  tideType: string;
  tideLabel: string;
  fishingScore: number; // 1-5
  description: string;
}

// 旧実装（calculations.ts）と同じユリウス日ベースの近似。朔テーブル範囲外のみで使用。
function legacyMoonAge(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
  const age = (JD - 2451550.1) % SYNODIC_MONTH;
  return age < 0 ? age + SYNODIC_MONTH : age;
}

/**
 * JST正午時点の月齢（直近の朔からの経過日数）を返す。
 * dateStr: "YYYY-MM-DD"（JSTの日付）
 */
export function getMoonAgeJST(dateStr: string): number {
  const t = new Date(`${dateStr}T12:00:00+09:00`).getTime();
  let prev: number | null = null;
  for (const iso of NEW_MOONS_JST) {
    const nm = new Date(iso).getTime();
    if (nm <= t) prev = nm;
    else break;
  }
  if (prev !== null) {
    const age = (t - prev) / 86400000;
    // テーブル終端を超えて大きくずれた場合のみ近似へフォールバック
    if (age <= SYNODIC_MONTH + 1) return Math.round(age * 10) / 10;
  }
  const [y, m, d] = dateStr.split("-").map(Number);
  return Math.round(legacyMoonAge(y, m, d) * 10) / 10;
}

/** 位相 target（日）との差を [-半周期, +半周期] に折り返して返す */
function phaseDist(age: number, target: number): number {
  let d = age - target;
  d -= SYNODIC_MONTH * Math.round(d / SYNODIC_MONTH);
  return d;
}

const TIDE_TYPE_META: Record<string, { fishingScore: number; description: string }> = {
  大潮: { fishingScore: 5, description: "潮の動きが最も大きく、魚の活性が上がりやすい。特に潮の変わり目が狙い目。" },
  中潮: { fishingScore: 4, description: "適度な潮の流れがあり、安定した釣果が期待できる。" },
  小潮: { fishingScore: 2, description: "潮の動きが小さめ。底物狙いやじっくり攻める釣りに向いている。" },
  長潮: { fishingScore: 1, description: "潮の干満差が最も小さい。厳しい条件だが、タイミング次第では可能性あり。" },
  若潮: { fishingScore: 2, description: "潮が徐々に大きくなる時期。朝マズメ・夕マズメを狙うと良い。" },
};

/** 月齢から潮回り（大潮/中潮/小潮/長潮/若潮）を判定する */
export function getTideTypeFromMoonAge(moonAge: number): TidePhase {
  const dNew = phaseDist(moonAge, 0);
  const dFull = phaseDist(moonAge, SYNODIC_MONTH / 2);
  const dSyzygy = Math.abs(dNew) < Math.abs(dFull) ? dNew : dFull; // 朔望（新月・満月）との差
  const dQ1 = phaseDist(moonAge, SYNODIC_MONTH / 4);
  const dQ2 = phaseDist(moonAge, (SYNODIC_MONTH * 3) / 4);
  const dQuad = Math.abs(dQ1) < Math.abs(dQ2) ? dQ1 : dQ2; // 矩（上弦・下弦）との差

  let tideType: string;
  if (Math.abs(dSyzygy) < 2.0) tideType = "大潮";
  else if (dQuad >= -1.5 && dQuad < 1.5) tideType = "小潮";
  else if (dQuad >= 1.5 && dQuad < 2.5) tideType = "長潮";
  else if (dQuad >= 2.5 && dQuad < 3.5) tideType = "若潮";
  else tideType = "中潮";

  const meta = TIDE_TYPE_META[tideType];
  return {
    moonAge,
    tideType,
    tideLabel: tideType,
    fishingScore: meta.fishingScore,
    description: meta.description,
  };
}

/** 日付（JST）から潮回りを直接求めるショートカット */
export function getTidePhaseJST(dateStr: string): TidePhase {
  return getTideTypeFromMoonAge(getMoonAgeJST(dateStr));
}
