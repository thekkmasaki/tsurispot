import { test, expect } from "@playwright/test";

const BASE = process.env.SMOKE_BASE_URL ?? "https://tsurispot.com";

test.describe("Spots smoke", () => {
  test("/spots が 200 で表示", async ({ page }) => {
    const res = await page.goto(`${BASE}/spots`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
  });

  test("/spots/fishing-park-hirano (管理釣り場) で混雑予想 / おすすめ時間帯 / ボウズ確率 が非表示", async ({
    page,
  }) => {
    await page.goto(`${BASE}/spots/fishing-park-hirano`, {
      waitUntil: "domcontentloaded",
    });
    const html = await page.content();
    expect(html, "混雑予想 h3 が残存している").not.toMatch(
      /<h3[^>]*>混雑予想<\/h3>/,
    );
    expect(html, "おすすめ時間帯 が残存").not.toContain("おすすめ時間帯");
    expect(html, "タマヅメ が残存").not.toContain("タマヅメ");
    expect(html, "ボウズ確率 h3 が残存").not.toMatch(
      /<h3[^>]*>ボウズ確率<\/h3>/,
    );
  });

  test("ひらの 画像が S3 から 200 で配信", async ({ request }) => {
    const paths = [
      "/images/spots/fishing-park-hirano/main.jpg",
      "/images/spots/fishing-park-hirano/barbless-sign.jpg",
      "/images/spots/fishing-park-hirano/logo.png",
    ];
    for (const p of paths) {
      const r = await request.get(`${BASE}${p}`);
      expect(r.status(), `${p}`).toBe(200);
      expect(r.headers()["server"], `${p} should be from S3`).toContain("AmazonS3");
    }
  });
});
