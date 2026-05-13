import { test, expect } from "@playwright/test";
import crypto from "node:crypto";

const BASE = process.env.SMOKE_BASE_URL ?? "https://tsurispot.com";

async function md5OfResponse(buf: Buffer): Promise<string> {
  return crypto.createHash("md5").update(buf).digest("hex");
}

test.describe("Fish images smoke", () => {
  test("/fish が 200 で表示", async ({ page }) => {
    const res = await page.goto(`${BASE}/fish`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
  });

  test("複数魚種の画像が全て異なる (同一 fallback を返していない)", async ({
    request,
  }) => {
    const fishSlugs = ["aji", "iwashi", "nijimasu", "blackbass", "kurodai"];
    const md5s = new Set<string>();
    for (const slug of fishSlugs) {
      const r = await request.get(`${BASE}/images/fish/${slug}.jpg`);
      expect(r.status(), `image fetch for ${slug}`).toBe(200);
      const buf = await r.body();
      md5s.add(await md5OfResponse(buf));
    }
    expect(
      md5s.size,
      "全画像が同じ md5 → next/image optimization が壊れている疑い",
    ).toBe(fishSlugs.length);
  });
});
