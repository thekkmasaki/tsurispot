/**
 * スポットのアクセス情報（accessInfo）から「〇〇駅から徒歩N分」を読み取る。
 *
 * 「電車で行ける釣り場」「駅から歩ける釣り場」の一覧に使う。新しいデータ項目は足さず、
 * 掲載済みの accessInfo の記載だけを根拠にする（記載が無いスポットは対象外＝推測しない）。
 */

export interface StationWalk {
  /** 「JR小樽駅」「ゆりかもめ市場前駅」のような駅名（路線名の前置きはそのまま） */
  station: string;
  /** 徒歩の分数 */
  minutes: number;
}

/** 「電車で行ける」と呼ぶ徒歩分数の上限 */
export const TRAIN_WALK_MAX_MINUTES = 20;

// 駅名: 句読点・括弧・空白を含まない 1〜24 文字＋「駅」
// 例: 「JR小樽駅から徒歩約15分」「京急県立大学駅より徒歩 10 分」「〇〇駅徒歩5分」「〇〇駅から歩いて約8分」
const STATION_WALK_RE =
  /([^\s、。,，・:：;；（）()「」『』【】/／駅]{1,24}駅)(?:から|より|下車)?\s*(?:徒歩|歩いて)\s*(?:約|およそ)?\s*(\d{1,3})\s*分/;

/** accessInfo から最初に出てくる「〇〇駅から徒歩N分」を取り出す。無ければ null */
export function parseStationWalk(accessInfo: string | undefined | null): StationWalk | null {
  if (!accessInfo) return null;
  const m = accessInfo.match(STATION_WALK_RE);
  if (!m) return null;
  const minutes = Number(m[2]);
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 120) return null;
  // 「最寄り駅」「各駅」等の一般名詞だけのものは駅名として扱わない
  // 「長門市駅から仙崎線に乗り換え仙崎駅」→「仙崎駅」（乗り換えの前段は落とす）
  const station = m[1].replace(/^.*(?:乗り換え|乗換え?|から|より)/, "");
  if (station.length < 2) return null;
  if (/^(最寄り?|各|最寄|近くの|近隣の?)駅$/.test(station)) return null;
  return { station, minutes };
}

/** 駅から徒歩 TRAIN_WALK_MAX_MINUTES 分以内か */
export function isTrainAccessible(accessInfo: string | undefined | null): boolean {
  const w = parseStationWalk(accessInfo);
  return w !== null && w.minutes <= TRAIN_WALK_MAX_MINUTES;
}
