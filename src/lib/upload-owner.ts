/**
 * 釣果写真（catch-reports/ 配下）の「誰がアップロードしたか」の控え。
 * 投稿時に写真URLを指定できるため、接頭辞チェックだけだと他人の写真や
 * 投稿に使われず残った写真を自分の投稿に流用できてしまう。
 * アップロード時に uploadowner:<S3キー> → アップロード者 を24時間だけ記録し、
 * 投稿時に新しく付ける写真はこの記録と一致するものだけ受け付ける。
 * - ログイン中は tsuriId、匿名は IP のハッシュ（IP を生で残さない）
 * - ログイン中の投稿は、同じ IP から匿名でアップした写真も本人のものとして扱う
 */
import { createHash } from "crypto";
import { redis } from "@/lib/redis";
import { ownS3KeyFromUrl } from "@/lib/s3";

export const UPLOAD_OWNER_TTL_SECONDS = 24 * 60 * 60;

const ownerKey = (s3Key: string) => `uploadowner:${s3Key}`;

function ipOwnerId(ip: string): string {
  return `ip:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`;
}

/** アップロード者ID（記録用）。ログイン中は tsuriId を優先 */
export function uploaderIdFor(tsuriId: string | undefined, ip: string): string {
  return tsuriId ? `u:${tsuriId}` : ipOwnerId(ip);
}

export async function recordUploadOwner(s3Key: string, uploaderId: string): Promise<void> {
  await redis.set(ownerKey(s3Key), uploaderId, { ex: UPLOAD_OWNER_TTL_SECONDS });
}

/**
 * 写真URLがこの投稿者のアップロードか。記録が無い・期限切れ・別人・Redis障害はいずれも false。
 */
export async function isUploadOwnedBy(
  url: string,
  tsuriId: string | undefined,
  ip: string,
): Promise<boolean> {
  const s3Key = ownS3KeyFromUrl(url);
  if (!s3Key) return false;
  const candidates = new Set([ipOwnerId(ip)]);
  if (tsuriId) candidates.add(`u:${tsuriId}`);
  try {
    const owner = await redis.get<string>(ownerKey(s3Key));
    return typeof owner === "string" && candidates.has(owner);
  } catch (err) {
    console.error("[upload-owner] 記録の読込エラー:", err);
    return false;
  }
}

export const UPLOAD_OWNER_ERROR =
  "写真の確認ができませんでした。お手数ですが、写真をもう一度選び直してから投稿してください。";
