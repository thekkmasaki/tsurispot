/**
 * 釣果投稿リザルト（投稿促進①）の共有型
 *
 * POST /api/catch-report-ugc が投稿と同一リクエストで計算して返す
 * 「この投稿で何が起きたか」の差分。クライアントのリザルト画面が表示に使う。
 */

/** ログインユーザー向けのリザルト差分（匿名投稿では undefined） */
export interface PostCatchResult {
  /** 加算後の通算釣果数（称号・進捗バーの計算に使う） */
  reportCount: number;
  /** 投稿後の図鑑登録種数（釣果由来+「釣ったことある」1タップ分の概算） */
  dexCount: number;
  /** この投稿で図鑑に新しく加わった魚種名 */
  newDexSpecies: string[];
  /** 自己ベストの登録/更新があったときだけ入る */
  best: { fishName: string; sizeCm: number; prevBest: number | null } | null;
}
