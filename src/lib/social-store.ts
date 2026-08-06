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

export async function likePost(reportId: string, tsuriId: string): Promise<number> {
  const created = await dbConditionalPut(likesPk(reportId), `USER#${tsuriId}`, {
    ts: new Date().toISOString(),
  });
  if (created) {
    return dbIncr(reportPk(reportId), "LIKE_COUNT");
  }
  return getLikeCount(reportId);
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
