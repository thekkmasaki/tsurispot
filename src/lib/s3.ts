import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-northeast-1" });
const BUCKET = process.env.AWS_S3_BUCKET || "tsurispot-uploads";

export async function uploadToS3(key: string, body: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return `https://${BUCKET}.s3.ap-northeast-1.amazonaws.com/${key}`;
}

export async function deleteFromS3(url: string) {
  const key = new URL(url).pathname.slice(1);
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
