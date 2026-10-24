import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "ap-northeast-1";
const s3 = new S3Client({ region: REGION });
const BUCKET = process.env.AWS_S3_BUCKET || "tsurispot-uploads";
const OWN_HOSTS = new Set([
  `${BUCKET}.s3.ap-northeast-1.amazonaws.com`,
  `${BUCKET}.s3.${REGION}.amazonaws.com`,
]);

export async function uploadToS3(key: string, body: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return `https://${BUCKET}.s3.ap-northeast-1.amazonaws.com/${key}`;
}

/** 自社バケットのオブジェクトURLならキーを返す。他ホスト・不正形式は null。 */
export function ownS3KeyFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || !OWN_HOSTS.has(u.hostname) || u.username || u.password) return null;
    const key = decodeURIComponent(u.pathname.slice(1));
    if (!key || key.includes("..") || key.startsWith("/")) return null;
    return key;
  } catch {
    return null;
  }
}

export async function deleteFromS3(url: string) {
  const key = ownS3KeyFromUrl(url);
  if (!key) throw new Error("deleteFromS3: not an own-bucket URL");
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
