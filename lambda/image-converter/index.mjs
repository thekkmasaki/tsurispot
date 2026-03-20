import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-northeast-1' });

// WebP変換の品質設定
const WEBP_QUALITY = 82;

// 変換対象の拡張子
const CONVERTIBLE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing: s3://${bucket}/${key}`);

    // 拡張子チェック
    const ext = key.substring(key.lastIndexOf('.')).toLowerCase();
    if (!CONVERTIBLE_EXTENSIONS.includes(ext)) {
      console.log(`Skipping non-convertible file: ${key}`);
      continue;
    }

    // WebP変換済みファイルが既に存在する場合はスキップ（無限ループ防止）
    const webpKey = key.substring(0, key.lastIndexOf('.')) + '.webp';

    try {
      // S3から元画像を取得
      const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3.send(getCommand);
      const inputBuffer = Buffer.from(await response.Body.transformToByteArray());

      console.log(`Input size: ${inputBuffer.length} bytes`);

      // sharp でWebPに変換
      const webpBuffer = await sharp(inputBuffer)
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      console.log(`Output size: ${webpBuffer.length} bytes (${Math.round((1 - webpBuffer.length / inputBuffer.length) * 100)}% reduction)`);

      // WebPをS3にアップロード
      const putCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: webpKey,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      });
      await s3.send(putCommand);

      console.log(`Converted: ${key} → ${webpKey}`);
    } catch (error) {
      console.error(`Error processing ${key}:`, error);
      throw error;
    }
  }

  return { statusCode: 200, body: 'OK' };
};
