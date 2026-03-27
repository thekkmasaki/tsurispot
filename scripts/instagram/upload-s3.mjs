/**
 * S3アップロード / 削除ユーティリティ
 * Instagram APIが公開URLを必要とするため、一時的にS3にホスト
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * AWS Signature V4 で署名してS3にPUT
 * AWS SDKなし・依存ゼロで動作
 */
export async function uploadToS3(filePath, bucket, key, region) {
  const body = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    {
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".webm": "video/webm",
    }[ext] || "application/octet-stream";

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const url = `https://${host}/${key}`;

  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKey || !secretKey) {
    throw new Error(
      ".env に AWS_ACCESS_KEY_ID と AWS_SECRET_ACCESS_KEY を設定してください"
    );
  }

  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, "").slice(0, 8);
  const amzDate = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const payloadHash = crypto.createHash("sha256").update(body).digest("hex");

  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n");

  const signedHeaders =
    "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "PUT",
    `/${key}`,
    "",
    canonicalHeaders + "\n",
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const signingKey = getSignatureKey(secretKey, dateStamp, region, "s3");
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization,
    },
    body: body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3アップロード失敗 (${res.status}): ${text}`);
  }

  return url;
}

/**
 * S3からオブジェクト削除
 */
export async function deleteFromS3(bucket, key, region) {
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const url = `https://${host}/${key}`;

  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKey || !secretKey) return;

  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, "").slice(0, 8);
  const amzDate = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const payloadHash = crypto
    .createHash("sha256")
    .update("")
    .digest("hex");

  const canonicalHeaders = [
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n");

  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "DELETE",
    `/${key}`,
    "",
    canonicalHeaders + "\n",
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const signingKey = getSignatureKey(secretKey, dateStamp, region, "s3");
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  await fetch(url, {
    method: "DELETE",
    headers: {
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization,
    },
  });
}

function getSignatureKey(key, dateStamp, region, service) {
  const kDate = crypto
    .createHmac("sha256", `AWS4${key}`)
    .update(dateStamp)
    .digest();
  const kRegion = crypto
    .createHmac("sha256", kDate)
    .update(region)
    .digest();
  const kService = crypto
    .createHmac("sha256", kRegion)
    .update(service)
    .digest();
  return crypto
    .createHmac("sha256", kService)
    .update("aws4_request")
    .digest();
}
