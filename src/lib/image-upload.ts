import { randomBytes } from "crypto";
import sharp from "sharp";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";
import { moderateImage } from "@/lib/rekognition";

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // クライアント側で圧縮済み前提
const MULTIPART_OVERHEAD = 256 * 1024;

export type ImageKind = "jpeg" | "png" | "webp";

export function sniffImageKind(buf: Buffer): ImageKind | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export type UploadFailure = { ok: false; status: number; error: string };
export type UploadSuccess = { ok: true; url: string };

/** multipart を安全に読む。Content-Length 超過・不正形式は失敗結果を返す。 */
export async function readMultipartFile(
  request: Request,
  fieldName = "file",
): Promise<{ ok: true; file: File; formData: FormData } | UploadFailure> {
  const len = Number(request.headers.get("content-length"));
  if (Number.isFinite(len) && len > MAX_IMAGE_BYTES + MULTIPART_OVERHEAD) {
    return { ok: false, status: 413, error: "ファイルサイズは20MB以下にしてください" };
  }
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return { ok: false, status: 400, error: "リクエスト形式が不正です" };
  }
  const file = formData.get(fieldName);
  if (!file || typeof file === "string") {
    return { ok: false, status: 400, error: "ファイルが必要です" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, status: 413, error: "ファイルサイズは20MB以下にしてください" };
  }
  return { ok: true, file, formData };
}

/**
 * 画像検証→S3保存→Rekognition(fail-closed)。
 * - MIME(宣言)ではなくマジックバイトで形式判定。拡張子は判定結果から決める（file.name は使わない）。
 * - Rekognition は JPEG/PNG のみ対応のため WebP は JPEG に変換して保存。
 * - モデレーション障害時もオブジェクトを削除して拒否する。
 */
export async function validateAndUploadImage(
  file: File,
  keyPrefix: string,
  logTag: string,
): Promise<UploadSuccess | UploadFailure> {
  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_IMAGE_BYTES) {
    return { ok: false, status: 413, error: "ファイルサイズは20MB以下にしてください" };
  }
  const kind = sniffImageKind(buffer);
  if (!kind) {
    return { ok: false, status: 400, error: "JPG、PNG、WebPのみアップロード可能です" };
  }

  let contentType = kind === "png" ? "image/png" : "image/jpeg";
  let ext = kind === "png" ? "png" : "jpg";
  if (kind === "webp") {
    try {
      buffer = await sharp(buffer, { limitInputPixels: 100_000_000 })
        .rotate()
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 88 })
        .toBuffer();
    } catch {
      return { ok: false, status: 400, error: "画像を読み込めませんでした。別の写真をお試しください。" };
    }
    contentType = "image/jpeg";
    ext = "jpg";
  }

  const key = `${keyPrefix}/${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  let url: string;
  try {
    url = await uploadToS3(key, buffer, contentType);
  } catch (e) {
    console.error(`[${logTag}] S3 upload error:`, e);
    return { ok: false, status: 500, error: "アップロードに失敗しました" };
  }

  try {
    const result = await moderateImage(key);
    if (!result.safe) {
      await deleteFromS3(url).catch(() => {});
      console.warn(`[${logTag}] モデレーションNG:`, result.reason, result.labels);
      return { ok: false, status: 400, error: "この画像はアップロードできません。別の写真をお試しください。" };
    }
  } catch (err) {
    // fail-closed: 検査できなかった画像は公開しない
    await deleteFromS3(url).catch(() => {});
    console.error(`[${logTag}] Rekognitionエラー（アップロード拒否）:`, err);
    return {
      ok: false,
      status: 503,
      error: "画像の安全確認に失敗しました。時間をおいて再度お試しください。",
    };
  }

  return { ok: true, url };
}
