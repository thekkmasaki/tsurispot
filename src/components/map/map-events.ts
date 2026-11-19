/**
 * /map の「注目エリア」チップ（サーバーで描画するリンク）と地図本体（遅延ロードの Client Component）を
 * つなぐイベント。チップは地図が受け取ったときだけリンク遷移を止め、地図が未ロードなら従来どおり県ページへ進む。
 */
export const MAP_SELECT_PREFECTURE_EVENT = "tsurispot:map-select-prefecture";
export const MAP_PREFECTURE_CHANGED_EVENT = "tsurispot:map-prefecture-changed";

export interface MapSelectPrefectureDetail {
  /** 都道府県の正式名（例: 兵庫県） */
  prefecture: string;
}

export interface MapPrefectureChangedDetail {
  /** 地図で選択中の都道府県の正式名 */
  prefectures: string[];
}
