import { RekognitionClient, DetectModerationLabelsCommand } from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
});

const BUCKET = process.env.AWS_S3_BUCKET || "tsurispot-uploads";

const BLOCKED_CATEGORIES = [
  "Explicit Nudity",
  "Violence",
  "Visually Disturbing",
  "Drugs",
  "Hate Symbols",
];

export interface ModerationResult {
  safe: boolean;
  labels: { name: string; confidence: number }[];
  reason?: string;
}

/**
 * S3上の画像をRekognitionでモデレーションチェック
 */
export async function moderateImage(s3Key: string): Promise<ModerationResult> {
  const command = new DetectModerationLabelsCommand({
    Image: {
      S3Object: {
        Bucket: BUCKET,
        Name: s3Key,
      },
    },
    MinConfidence: 70,
  });

  const response = await rekognition.send(command);
  const labels = (response.ModerationLabels || []).map((l) => ({
    name: l.Name || "",
    confidence: l.Confidence || 0,
  }));

  const blocked = labels.filter((l) =>
    BLOCKED_CATEGORIES.some(
      (cat) => l.name === cat || l.name.startsWith(cat)
    )
  );

  if (blocked.length > 0) {
    return {
      safe: false,
      labels,
      reason: `不適切な画像: ${blocked.map((l) => l.name).join(", ")}`,
    };
  }

  return { safe: true, labels };
}
