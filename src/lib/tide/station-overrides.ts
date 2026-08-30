// 潮汐観測地点マッピングの手動上書きテーブル
//
// STATION_OVERRIDES: 直線距離の最寄りが地形上不適切なスポット（半島の反対側・湾奥など）の
//   観測地点codeを上書きする。null を指定すると潮汐表示そのものを止める。
// ESTUARY_FULL_TIDE_SLUGS: spotType="river" は既定で「潮回りのみ」表示だが、
//   河口・汽水域で満干時刻が実用になるスポットをフル表示へ昇格する。
//   候補は node scripts/audit-tide-stations.mjs の出力から選定する。
export const STATION_OVERRIDES: Record<string, string | null> = {};

export const ESTUARY_FULL_TIDE_SLUGS: string[] = [];
