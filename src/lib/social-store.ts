// SNS系データ（投稿正本・いいね・コメント等）の DynamoDB ストア。
// user-store の Redis/Dynamo 二重化(w())には乗せない: SNSデータは Redis 側に正が存在しないため、
// USER_STORE_MODE に関係なく常に DynamoDB へ直書きする。
import { dbGet, dbPut, dbDelete, dbExists } from "@/lib/dynamodb";

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
