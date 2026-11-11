// ログインしないで投稿した釣果（主に iPhone アプリ）の「削除キー」。
//
// - 投稿時にランダムな削除キー（32 バイト = base64url 43 文字）を作り、キー本体は POST の応答で
//   1 度だけ返す。サーバーには SHA-256（hex）だけを残す。
// - 保存先は投稿正本と同じパーティションの別アイテム POST#{id}/DELKEY。
//   投稿データ本体（META・スポット別一覧・フィード・最近の釣果・GAS 送信）には一切載せないので、
//   GET 応答・ページ HTML・JSON-LD へ漏れる経路を構造的に持たない。
// - 削除は DELETE /api/catch-report-ugc/[id] にヘッダ X-Delete-Key で。比較は timing-safe。
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { dbDelete, dbGet, dbPut } from "@/lib/dynamodb";
import { POST_TTL_SECONDS } from "@/lib/social-store";

export const DELETE_KEY_HEADER = "x-delete-key";
export const DELETE_KEY_BYTES = 32;
/** base64url。32 バイトなら 43 文字。将来長くしても通るよう上限は広めに取る */
export const DELETE_KEY_RE = /^[A-Za-z0-9_-]{43,128}$/;
const HASH_RE = /^[0-9a-f]{64}$/;
export const DELKEY_SK = "DELKEY";

export interface DeleteKeyRecord {
  /** 削除キーの SHA-256（hex）。キー本体は保存しない */
  hash: string;
  /** 投稿したスポット（場所なし投稿は ""）。META が欠けても後片付けできるよう控える */
  spotSlug: string;
  createdAt: string;
}

export function hashDeleteKey(key: string): string {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

export function generateDeleteKey(): { key: string; hash: string } {
  const key = randomBytes(DELETE_KEY_BYTES).toString("base64url");
  return { key, hash: hashDeleteKey(key) };
}

/** 渡されたキーが保存済みハッシュと一致するか（定数時間比較・例外を投げない） */
export function verifyDeleteKey(key: unknown, storedHash: unknown): boolean {
  if (typeof key !== "string" || !DELETE_KEY_RE.test(key)) return false;
  if (typeof storedHash !== "string" || !HASH_RE.test(storedHash)) return false;
  const a = Buffer.from(hashDeleteKey(key), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

const delKeyPk = (reportId: string) => `POST#${reportId}`;

export async function saveDeleteKey(reportId: string, hash: string, spotSlug: string): Promise<void> {
  const rec: DeleteKeyRecord = { hash, spotSlug, createdAt: new Date().toISOString() };
  await dbPut(delKeyPk(reportId), DELKEY_SK, rec, POST_TTL_SECONDS);
}

export async function getDeleteKeyRecord(reportId: string): Promise<DeleteKeyRecord | null> {
  return dbGet<DeleteKeyRecord>(delKeyPk(reportId), DELKEY_SK);
}

export async function removeDeleteKey(reportId: string): Promise<void> {
  await dbDelete(delKeyPk(reportId), DELKEY_SK);
}
