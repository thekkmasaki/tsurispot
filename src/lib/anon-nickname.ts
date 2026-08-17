/**
 * 匿名投稿用のニックネーム自動候補（「釣り人4128」形式）
 *
 * 匿名でも空欄の必須inputに名前を考えさせると、その時点で離脱が起きるため
 * 初期値を自動生成して「そのままでも投稿できる」状態にする。
 * 端末ごとに localStorage へ保存し、再訪時も同じ名前で投稿が続くようにする
 * （毎回別名だと本人にも他人にも同一人物と分からなくなる）。
 */

const STORAGE_KEY = "tsurispot_anon_nickname";

/** 「釣り人1000」〜「釣り人9999」をランダム生成 */
export function generateAnonNickname(): string {
  return `釣り人${1000 + Math.floor(Math.random() * 9000)}`;
}

/** 保存済みの匿名ニックネームを返す（未保存・SSR・storage不可時は null） */
export function loadAnonNickname(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** 匿名ニックネームを端末に保存（storage不可時は黙って無視） */
export function saveAnonNickname(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // private mode 等で失敗しても投稿自体は続行できる
  }
}
