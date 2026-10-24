import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/data/spots", () => ({
  getSpotBySlug: vi.fn((slug: string) => (slug === "real-spot" ? { slug, name: "実在スポット" } : undefined)),
}));
vi.mock("@/lib/s3", () => ({
  ownS3KeyFromUrl: (url: string) => {
    const m = /^https:\/\/tsurispot-uploads\.s3\.ap-northeast-1\.amazonaws\.com\/(.+)$/.exec(url);
    return m ? m[1] : null;
  },
  uploadToS3: vi.fn(),
  deleteFromS3: vi.fn(),
}));
vi.mock("@/lib/rekognition", () => ({ moderateImage: vi.fn() }));

import { isReservedName } from "@/lib/reserved-names";
import { isRealDate, isOwnImageUrl, resolveSpot, readJsonBody } from "@/lib/ugc-validation";
import { sniffImageKind } from "@/lib/image-upload";

describe("reserved-names", () => {
  it.each(["運営", "公式アカウント", "ＴｓｕｒｉＳｐｏｔ", "Admin", "ツリスポ 運営", "s t a f f", "管理人"])(
    "予約語 %s を弾く",
    (name) => expect(isReservedName(name)).toBe(true),
  );
  it.each(["釣り太郎", "アジ大好き", "taro"])("通常名 %s は許可", (name) =>
    expect(isReservedName(name)).toBe(false),
  );
});

describe("ugc-validation", () => {
  it("存在しない暦日を弾く", () => {
    expect(isRealDate("2026-02-30")).toBe(false);
    expect(isRealDate("2026-99-99")).toBe(false);
    expect(isRealDate("2026-07-29")).toBe(true);
    expect(isRealDate(undefined)).toBe(false);
  });

  it("resolveSpot は形式と実在の両方を要求する", () => {
    expect(resolveSpot("real-spot")?.name).toBe("実在スポット");
    expect(resolveSpot("unknown-spot")).toBeNull();
    expect(resolveSpot("Bad Slug!")).toBeNull();
    expect(resolveSpot("a".repeat(101))).toBeNull();
    expect(resolveSpot(123)).toBeNull();
  });

  it("isOwnImageUrl は自社S3かつ接頭辞一致のみ許可", () => {
    const own = "https://tsurispot-uploads.s3.ap-northeast-1.amazonaws.com/catch-reports/1-abc.jpg";
    expect(isOwnImageUrl(own, "catch-reports/")).toBe(true);
    expect(isOwnImageUrl(own, "covers/u1/")).toBe(false);
    expect(isOwnImageUrl("https://evil.example.com/pixel.gif", "catch-reports/")).toBe(false);
    expect(isOwnImageUrl("javascript:alert(1)", "catch-reports/")).toBe(false);
  });

  it("readJsonBody は不正JSON・巨大ボディ・配列でない非オブジェクトを null にする", async () => {
    const mk = (body: string, headers: Record<string, string> = {}) =>
      new Request("http://localhost/x", { method: "POST", body, headers });
    expect(await readJsonBody(mk("not json"))).toBeNull();
    expect(await readJsonBody(mk('{"a":1}'))).toEqual({ a: 1 });
    expect(await readJsonBody(mk("x".repeat(100)), 10)).toBeNull();
    expect(await readJsonBody(mk("{}", { "content-length": "999999" }), 100)).toBeNull();
  });
});

describe("image-upload sniffImageKind", () => {
  it("マジックバイトで判定する（拡張子・MIME非依存）", () => {
    expect(sniffImageKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe("jpeg");
    expect(sniffImageKind(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("png");
    expect(sniffImageKind(Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 ")]))).toBe("webp");
    expect(sniffImageKind(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
    expect(sniffImageKind(Buffer.from("GIF89a......"))).toBeNull();
  });
});
