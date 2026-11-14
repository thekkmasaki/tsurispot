import { describe, it, expect, vi } from "vitest";
import sharp from "sharp";

vi.mock("@/lib/s3", () => ({ uploadToS3: vi.fn(), deleteFromS3: vi.fn() }));
vi.mock("@/lib/rekognition", () => ({ moderateImage: vi.fn() }));

import { normalizeImage } from "@/lib/image-upload";

// 位置情報入りの写真がそのまま公開されないこと（iOS アプリは撮って出しの JPEG を送ってくる）
async function makeImageWithExif(format: "jpeg" | "png"): Promise<Buffer> {
  const base = sharp({
    create: { width: 16, height: 16, channels: 3, background: { r: 30, g: 120, b: 200 } },
  }).withMetadata({
    exif: {
      IFD0: { Make: "TestPhone", Model: "GPS-Leak", Copyright: "secret-location" },
      // IFD3 = GPS IFD
      IFD3: { GPSLatitudeRef: "N", GPSLongitudeRef: "E" },
    },
  });
  return format === "png" ? base.png().toBuffer() : base.jpeg().toBuffer();
}

describe("normalizeImage（EXIF/GPS 除去）", () => {
  it("JPEG の EXIF を落とし、JPEG のまま返す", async () => {
    const input = await makeImageWithExif("jpeg");
    const inMeta = await sharp(input).metadata();
    expect(inMeta.exif).toBeDefined();
    expect(input.includes(Buffer.from("GPS-Leak"))).toBe(true);

    const out = await normalizeImage(input, "jpeg");
    expect(out).not.toBeNull();
    expect(out!.contentType).toBe("image/jpeg");
    expect(out!.ext).toBe("jpg");
    const outMeta = await sharp(out!.buffer).metadata();
    expect(outMeta.format).toBe("jpeg");
    expect(outMeta.exif).toBeUndefined();
    expect(out!.buffer.includes(Buffer.from("GPS-Leak"))).toBe(false);
  });

  it("PNG は PNG のまま、EXIF を落とす", async () => {
    const input = await makeImageWithExif("png");
    const out = await normalizeImage(input, "png");
    expect(out!.contentType).toBe("image/png");
    const outMeta = await sharp(out!.buffer).metadata();
    expect(outMeta.format).toBe("png");
    expect(outMeta.exif).toBeUndefined();
    expect(out!.buffer.includes(Buffer.from("GPS-Leak"))).toBe(false);
  });

  it("壊れた画像は null", async () => {
    const out = await normalizeImage(Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x01]), "jpeg");
    expect(out).toBeNull();
  });
});
