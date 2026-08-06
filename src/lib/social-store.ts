// SNS系データ（投稿正本・いいね・コメント等）の DynamoDB ストア。
// user-store の Redis/Dynamo 二重化(w())には乗せない: SNSデータは Redis 側に正が存在しないため、
// USER_STORE_MODE に関係なく常に DynamoDB へ直書きする。
import {
  dbGet,
  dbPut,
  dbDelete,
  dbExists,
  dbIncr,
  dbDecr,
  dbBatchGet,
  dbConditionalPut,
  dbQuery,
} from "@/lib/dynamodb";

export const POST_TTL_SECONDS = 365 * 24 * 60 * 60;

// 釣果投稿の正本。SPOT#{slug}/UGC_REPORTS の配列と Redis LIST は
// 従来どおり残る非正規化ビューで、ID単体参照(パーマリンク/いいね/コメント)はこちらを引く。
export interface PostMeta {
  id: string;
  spotSlug: string;
  spotName: string;
  fishName: string;
  userName: string;
  tsuriId?: string;
  comment: string;
  date: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  weather?: string;
  submittedAt?: string;
  tags?: string[];
}

const postPk = (reportId: string) => `POST#${reportId}`;

export async function savePostMeta(post: PostMeta): Promise<void> {
  await dbPut(postPk(post.id), "META", post, POST_TTL_SECONDS);
}

export async function getPostMeta(reportId: string): Promise<PostMeta | null> {
  return dbGet<PostMeta>(postPk(reportId), "META");
}

export async function deletePostMeta(reportId: string): Promise<void> {
  await dbDelete(postPk(reportId), "META");
}

// 通報3回で /api/report-flag が立てる REPORT#{id}/FLAGGED を共用
export async function isPostFlagged(reportId: string): Promise<boolean> {
  return dbExists(`REPORT#${reportId}`, "FLAGGED");
}

// ─── いいね ───
// LIKES#{reportId}/USER#{tsuriId} を条件付きPutで冪等化し、
// 実際に書けた時だけ REPORT#{reportId}/LIKE_COUNT を増減する（follow と同パターン）。

const likesPk = (reportId: string) => `LIKES#${reportId}`;
const reportPk = (reportId: string) => `REPORT#${reportId}`;

export async function likePost(
  reportId: string,
  tsuriId: string,
): Promise<{ count: number; created: boolean }> {
  const created = await dbConditionalPut(likesPk(reportId), `USER#${tsuriId}`, {
    ts: new Date().toISOString(),
  });
  if (created) {
    return { count: await dbIncr(reportPk(reportId), "LIKE_COUNT"), created: true };
  }
  return { count: await getLikeCount(reportId), created: false };
}

export async function unlikePost(reportId: string, tsuriId: string): Promise<number> {
  const existed = await dbExists(likesPk(reportId), `USER#${tsuriId}`);
  if (!existed) return getLikeCount(reportId);
  await dbDelete(likesPk(reportId), `USER#${tsuriId}`);
  return dbDecr(reportPk(reportId), "LIKE_COUNT");
}

export async function hasLiked(reportId: string, tsuriId: string): Promise<boolean> {
  return dbExists(likesPk(reportId), `USER#${tsuriId}`);
}

export async function getLikeCount(reportId: string): Promise<number> {
  const n = await dbGet<number>(reportPk(reportId), "LIKE_COUNT");
  return typeof n === "number" && n > 0 ? n : 0;
}

// ─── コメント ───
// COMMENTS#{reportId}/C#{createdAtISO}#{commentId}。通報は既存 /api/report-flag を
// commentId で共用（REPORT#{commentId}/FLAGGED が立つ → 取得時に除外）。

export interface PostComment {
  id: string;
  reportId: string;
  authorTsuriId: string;
  authorNickname: string;
  text: string;
  createdAt: string;
}

const commentsPk = (reportId: string) => `COMMENTS#${reportId}`;

export async function addComment(
  reportId: string,
  authorTsuriId: string,
  authorNickname: string,
  text: string,
): Promise<PostComment> {
  const createdAt = new Date().toISOString();
  const comment: PostComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reportId,
    authorTsuriId,
    authorNickname,
    text,
    createdAt,
  };
  await dbPut(commentsPk(reportId), `C#${createdAt}#${comment.id}`, comment, POST_TTL_SECONDS);
  await dbIncr(`REPORT#${reportId}`, "COMMENT_COUNT");
  return comment;
}

// 古い順（会話の自然順）で返す。通報FLAGGED済みは除外
export async function getComments(reportId: string, limit = 100): Promise<PostComment[]> {
  const items = await dbQuery<PostComment>(commentsPk(reportId), {
    skPrefix: "C#",
    forward: true,
    limit,
  });
  const comments = items.map((it) => it.data).filter(Boolean);
  if (comments.length === 0) return [];
  const flags = await dbBatchGet(
    comments.map((c) => ({ pk: `REPORT#${c.id}`, sk: "FLAGGED" })),
  );
  return comments.filter((_, i) => flags[i] === null);
}

// コメント主 or 投稿主のみ削除可。削除できたら true
export async function deleteComment(
  reportId: string,
  commentId: string,
  requesterTsuriId: string,
): Promise<{ ok: boolean; status: number; error?: string }> {
  const items = await dbQuery<PostComment>(commentsPk(reportId), { skPrefix: "C#", all: true });
  const target = items.find((it) => it.data?.id === commentId);
  if (!target) return { ok: false, status: 404, error: "コメントが見つかりません" };

  if (target.data.authorTsuriId !== requesterTsuriId) {
    const post = await getPostMeta(reportId);
    if (!post?.tsuriId || post.tsuriId !== requesterTsuriId) {
      return { ok: false, status: 403, error: "このコメントを削除する権限がありません" };
    }
  }
  await dbDelete(target.pk, target.sk);
  await dbDecr(`REPORT#${reportId}`, "COMMENT_COUNT");
  return { ok: true, status: 200 };
}

export async function getCommentCount(reportId: string): Promise<number> {
  const n = await dbGet<number>(`REPORT#${reportId}`, "COMMENT_COUNT");
  return typeof n === "number" && n > 0 ? n : 0;
}

export async function getCommentCountsBulk(
  reportIds: string[],
): Promise<Record<string, number>> {
  const ids = reportIds.slice(0, 100);
  const vals = await dbBatchGet<number>(
    ids.map((id) => ({ pk: `REPORT#${id}`, sk: "COMMENT_COUNT" })),
  );
  const counts: Record<string, number> = {};
  ids.forEach((id, i) => {
    const v = vals[i];
    if (typeof v === "number" && v > 0) counts[id] = v;
  });
  return counts;
}

// ─── ユーザー検索索引 ───
// USERSEARCH/N#{normNickname}#{tsuriId} の単一パーティション索引（会員数規模なら十分）。
// 改名時は旧skを削除するため、現在のskを USER#{id}/SEARCH_SK に控える。

const USERSEARCH_PK = "USERSEARCH";

export interface UserSearchEntry {
  tsuriId: string;
  nickname: string;
  avatarUrl?: string;
  reportCount?: number;
}

export function normalizeNickname(raw: string): string {
  return raw.normalize("NFKC").trim().toLowerCase();
}

export async function updateUserSearchIndex(user: {
  tsuriId: string;
  nickname: string;
  avatarUrl?: string;
  reportCount?: number;
  isPublic?: boolean;
}): Promise<void> {
  const pointerPk = `USER#${user.tsuriId}`;
  const oldSk = await dbGet<string>(pointerPk, "SEARCH_SK");

  // 非公開プロフィールは索引から外す
  if (user.isPublic === false) {
    if (oldSk) {
      await dbDelete(USERSEARCH_PK, oldSk);
      await dbDelete(pointerPk, "SEARCH_SK");
    }
    return;
  }

  const norm = normalizeNickname(user.nickname);
  if (!norm) return;
  const newSk = `N#${norm}#${user.tsuriId}`;
  if (oldSk && oldSk !== newSk) {
    await dbDelete(USERSEARCH_PK, oldSk);
  }
  await dbPut(USERSEARCH_PK, newSk, {
    tsuriId: user.tsuriId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    reportCount: user.reportCount,
  } satisfies UserSearchEntry);
  if (oldSk !== newSk) {
    await dbPut(pointerPk, "SEARCH_SK", newSk);
  }
}

// 前方一致検索（正規化済みニックネーム）
export async function searchUsers(query: string, limit = 20): Promise<UserSearchEntry[]> {
  const norm = normalizeNickname(query);
  if (!norm) return [];
  const items = await dbQuery<UserSearchEntry>(USERSEARCH_PK, {
    skPrefix: `N#${norm}`,
    forward: true,
    limit,
  });
  return items.map((it) => it.data).filter((u): u is UserSearchEntry => Boolean(u?.tsuriId));
}

// ─── ハッシュタグ ───
// TAG#{normTag}/TS#{iso}#{reportId}（参照のみ・TTL365日）+ TAG#{normTag}/COUNT。
// 人気タグは Redis zset（tags:popular）で別管理（呼び出し側）。

export const MAX_TAGS_PER_POST = 5;
export const MAX_TAG_LENGTH = 20;

// NFKC正規化+小文字化+先頭#除去。全半角・大小文字を同一視する
export function normalizeTag(raw: string): string {
  return raw
    .normalize("NFKC")
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .slice(0, MAX_TAG_LENGTH);
}

export function sanitizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    if (typeof t !== "string") continue;
    const norm = normalizeTag(t);
    if (!norm || /[\s#/\\?&=%]/.test(norm)) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
    if (out.length >= MAX_TAGS_PER_POST) break;
  }
  return out;
}

const tagPk = (normTag: string) => `TAG#${normTag}`;

export async function addTagsForPost(post: PostMeta, tags: string[]): Promise<void> {
  const iso = post.submittedAt ?? new Date().toISOString();
  await Promise.all(
    tags.flatMap((tag) => [
      dbPut(
        tagPk(tag),
        `TS#${iso}#${post.id}`,
        { reportId: post.id, tsuriId: post.tsuriId } satisfies FeedRef,
        POST_TTL_SECONDS,
      ),
      dbIncr(tagPk(tag), "COUNT"),
    ]),
  );
}

// タグ別の投稿参照（新しい順）
export async function getTagFeedRefs(normTag: string, limit = 30): Promise<FeedRef[]> {
  const items = await dbQuery<FeedRef>(tagPk(normTag), {
    skPrefix: "TS#",
    forward: false,
    limit,
  });
  return items.map((it) => it.data).filter((r): r is FeedRef => Boolean(r?.reportId));
}

export async function getTagCount(normTag: string): Promise<number> {
  const n = await dbGet<number>(tagPk(normTag), "COUNT");
  return typeof n === "number" && n > 0 ? n : 0;
}

// ─── リポスト ───
// REPOSTS#{reportId}/USER#{tsuriId}（冪等判定用）+ REPOST_COUNT +
// USERREPOSTS#{tsuriId}/TS#{iso}#{reportId}（プロフィールのリポスト一覧用）。

const repostsPk = (reportId: string) => `REPOSTS#${reportId}`;
const userRepostsPk = (tsuriId: string) => `USERREPOSTS#${tsuriId}`;

export async function repostPost(
  reportId: string,
  tsuriId: string,
): Promise<{ count: number; created: boolean }> {
  const ts = new Date().toISOString();
  const created = await dbConditionalPut(repostsPk(reportId), `USER#${tsuriId}`, { ts });
  if (!created) {
    return { count: await getRepostCount(reportId), created: false };
  }
  await dbPut(userRepostsPk(tsuriId), `TS#${ts}#${reportId}`, { reportId, ts }, POST_TTL_SECONDS);
  return { count: await dbIncr(`REPORT#${reportId}`, "REPOST_COUNT"), created: true };
}

export async function unrepostPost(reportId: string, tsuriId: string): Promise<number> {
  const existing = await dbGet<{ ts: string }>(repostsPk(reportId), `USER#${tsuriId}`);
  if (!existing) return getRepostCount(reportId);
  await dbDelete(repostsPk(reportId), `USER#${tsuriId}`);
  if (existing.ts) {
    await dbDelete(userRepostsPk(tsuriId), `TS#${existing.ts}#${reportId}`);
  }
  return dbDecr(`REPORT#${reportId}`, "REPOST_COUNT");
}

export async function hasReposted(reportId: string, tsuriId: string): Promise<boolean> {
  return dbExists(repostsPk(reportId), `USER#${tsuriId}`);
}

export async function getRepostCount(reportId: string): Promise<number> {
  const n = await dbGet<number>(`REPORT#${reportId}`, "REPOST_COUNT");
  return typeof n === "number" && n > 0 ? n : 0;
}

// ユーザーがリポストした投稿ID（新しい順）
export async function getUserRepostIds(tsuriId: string, limit = 20): Promise<string[]> {
  const items = await dbQuery<{ reportId: string }>(userRepostsPk(tsuriId), {
    skPrefix: "TS#",
    forward: false,
    limit,
  });
  return items.map((it) => it.data?.reportId).filter((id): id is string => Boolean(id));
}

export async function getRepostsBulk(
  reportIds: string[],
  viewerTsuriId?: string,
): Promise<{ counts: Record<string, number>; repostedIds: string[] }> {
  const ids = reportIds.slice(0, 100);
  const vals = await dbBatchGet<number>(
    ids.map((id) => ({ pk: `REPORT#${id}`, sk: "REPOST_COUNT" })),
  );
  const counts: Record<string, number> = {};
  ids.forEach((id, i) => {
    const v = vals[i];
    if (typeof v === "number" && v > 0) counts[id] = v;
  });
  let repostedIds: string[] = [];
  if (viewerTsuriId) {
    const mine = await dbBatchGet(
      ids.map((id) => ({ pk: repostsPk(id), sk: `USER#${viewerTsuriId}` })),
    );
    repostedIds = ids.filter((_, i) => mine[i] !== null);
  }
  return { counts, repostedIds };
}

// ─── 全体タイムライン ───
// FEED#GLOBAL#{yyyymm}/TS#{createdAtISO}#{reportId}。月別パーティション（ホットパーティション回避+TTL180日で自然消滅）。
// data は参照のみ（reportId+tsuriId）。本文は POST# 正本を dbBatchGet で引く。

export const FEED_TTL_SECONDS = 180 * 24 * 60 * 60;

export interface FeedRef {
  reportId: string;
  tsuriId?: string;
}

const feedPk = (yyyymm: string) => `FEED#GLOBAL#${yyyymm}`;

function monthOf(iso: string): string {
  return iso.slice(0, 7).replace("-", "");
}

function prevMonth(yyyymm: string): string {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  return m === 1 ? `${y - 1}12` : `${y}${String(m - 1).padStart(2, "0")}`;
}

export async function addToGlobalFeed(post: PostMeta): Promise<void> {
  const iso = post.submittedAt ?? new Date().toISOString();
  await dbPut(
    feedPk(monthOf(iso)),
    `TS#${iso}#${post.id}`,
    { reportId: post.id, tsuriId: post.tsuriId } satisfies FeedRef,
    FEED_TTL_SECONDS,
  );
}

// カーソルは「最後に返したアイテムの月+sk」。次ページはそれより古いものから再開する。
// filter を渡すと該当参照のみ収集（フォロー中タブ用）。月をまたいで最大6ヶ月遡る。
export async function getGlobalFeedRefs(
  limit = 20,
  cursor?: { month: string; sk: string },
  filter?: (ref: FeedRef) => boolean,
): Promise<{ refs: FeedRef[]; nextCursor?: { month: string; sk: string } }> {
  const nowMonth = monthOf(new Date().toISOString());
  let month = cursor?.month ?? nowMonth;
  let boundarySk = cursor?.sk;
  const collected: { ref: FeedRef; sk: string; month: string }[] = [];

  for (let hop = 0; hop < 6 && collected.length <= limit; hop++) {
    // 月パーティションは最大でも月間投稿数。1ページ分+境界判定に十分な200件で打ち切る
    const items = await dbQuery<FeedRef>(feedPk(month), {
      skPrefix: "TS#",
      forward: false,
      limit: 200,
    });
    for (const it of items) {
      // sk降順走査: カーソル位置より新しいものは読み飛ばす
      if (boundarySk && it.sk >= boundarySk) continue;
      if (!it.data?.reportId) continue;
      if (filter && !filter(it.data)) continue;
      collected.push({ ref: it.data, sk: it.sk, month });
      if (collected.length > limit) break;
    }
    if (collected.length > limit) break;
    month = prevMonth(month);
    boundarySk = undefined;
  }

  const hasMore = collected.length > limit;
  const page = collected.slice(0, limit);
  const last = page[page.length - 1];
  return {
    refs: page.map((p) => p.ref),
    nextCursor: hasMore && last ? { month: last.month, sk: last.sk } : undefined,
  };
}

// 参照から表示用の投稿へ解決（FLAGGED・欠損は除外）
export async function resolveFeedPosts(refs: FeedRef[]): Promise<PostMeta[]> {
  if (refs.length === 0) return [];
  const ids = refs.map((r) => r.reportId);
  const [metas, flags] = await Promise.all([
    dbBatchGet<PostMeta>(ids.map((id) => ({ pk: `POST#${id}`, sk: "META" }))),
    dbBatchGet(ids.map((id) => ({ pk: `REPORT#${id}`, sk: "FLAGGED" }))),
  ]);
  const out: PostMeta[] = [];
  ids.forEach((_, i) => {
    const meta = metas[i];
    if (meta && flags[i] === null) out.push(meta);
  });
  return out;
}

// ─── アプリ内通知 ───
// NOTIF#{tsuriId}/N#{createdAtISO}#{id}（TTL90日）。
// 未読は USER#{tsuriId}/NOTIF_UNREAD のカウンタ方式（per-item既読フラグは持たない=write節約）。

export const NOTIF_TTL_SECONDS = 90 * 24 * 60 * 60;

export type NotificationType = "like" | "comment" | "follow" | "repost";

export interface UserNotification {
  id: string;
  type: NotificationType;
  actorId: string;
  actorNickname: string;
  reportId?: string;
  excerpt?: string;
  createdAt: string;
}

const notifPk = (tsuriId: string) => `NOTIF#${tsuriId}`;

export async function addNotification(
  recipientTsuriId: string,
  n: Omit<UserNotification, "id" | "createdAt">,
): Promise<void> {
  const createdAt = new Date().toISOString();
  const id = `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const notif: UserNotification = { ...n, id, createdAt };
  await dbPut(notifPk(recipientTsuriId), `N#${createdAt}#${id}`, notif, NOTIF_TTL_SECONDS);
  await dbIncr(`USER#${recipientTsuriId}`, "NOTIF_UNREAD");
}

// 新しい順
export async function getNotifications(
  tsuriId: string,
  limit = 30,
): Promise<UserNotification[]> {
  const items = await dbQuery<UserNotification>(notifPk(tsuriId), {
    skPrefix: "N#",
    forward: false,
    limit,
  });
  return items.map((it) => it.data).filter(Boolean);
}

export async function getUnreadNotificationCount(tsuriId: string): Promise<number> {
  const n = await dbGet<number>(`USER#${tsuriId}`, "NOTIF_UNREAD");
  return typeof n === "number" && n > 0 ? n : 0;
}

export async function clearUnreadNotifications(tsuriId: string): Promise<void> {
  await dbPut(`USER#${tsuriId}`, "NOTIF_UNREAD", 0);
}

// ─── ブロック ───
// BLOCKS#{tsuriId}/USER#{blockedId}。通知(notify)・コメント・フォローのガードが参照する

export async function isBlockedBy(
  recipientTsuriId: string,
  actorTsuriId: string,
): Promise<boolean> {
  return dbExists(`BLOCKS#${recipientTsuriId}`, `USER#${actorTsuriId}`);
}

export async function blockUser(blockerTsuriId: string, blockedTsuriId: string): Promise<void> {
  await dbPut(`BLOCKS#${blockerTsuriId}`, `USER#${blockedTsuriId}`, {
    ts: new Date().toISOString(),
  });
}

export async function unblockUser(blockerTsuriId: string, blockedTsuriId: string): Promise<void> {
  await dbDelete(`BLOCKS#${blockerTsuriId}`, `USER#${blockedTsuriId}`);
}

export async function getBlockedList(blockerTsuriId: string, limit = 100): Promise<string[]> {
  const items = await dbQuery(`BLOCKS#${blockerTsuriId}`, { skPrefix: "USER#", limit });
  return items.map((it) => it.sk.slice("USER#".length));
}

// 一覧用の一括取得: reportIds → { counts, likedIds(閲覧者がいいね済み) }
export async function getLikesBulk(
  reportIds: string[],
  viewerTsuriId?: string,
): Promise<{ counts: Record<string, number>; likedIds: string[] }> {
  const ids = reportIds.slice(0, 100);
  // dbBatchGet は入力キー順に (T | null)[] を返す
  const countVals = await dbBatchGet<number>(
    ids.map((id) => ({ pk: reportPk(id), sk: "LIKE_COUNT" })),
  );
  const counts: Record<string, number> = {};
  ids.forEach((id, i) => {
    const v = countVals[i];
    if (typeof v === "number" && v > 0) counts[id] = v;
  });
  let likedIds: string[] = [];
  if (viewerTsuriId) {
    const likedVals = await dbBatchGet(
      ids.map((id) => ({ pk: likesPk(id), sk: `USER#${viewerTsuriId}` })),
    );
    likedIds = ids.filter((_, i) => likedVals[i] !== null);
  }
  return { counts, likedIds };
}
