import { test, expect } from "@playwright/test";

/**
 * /spots のページ送りが URL に反映されることを守る回帰テスト
 *
 * 以前のページ送りは setState のみで URL が変わらず、全ページ分の PV が
 * GA4 に一切計上されていなかった（AdSense 収益に直結する取りこぼし）。
 * pushState 化したため、URL 反映と戻る/進むの復元をここで固定する。
 */

/**
 * 一覧の先頭スポット名。ページが実際に切り替わったかの判定に使う。
 * カードの構造は <h3><a href="/spots/xxx">名前</a></h3>。
 * h3 配下に限ることで「釣り場を投稿」(/spots/submit) 等の導線リンクを除外している。
 */
async function firstSpotName(page: import("@playwright/test").Page) {
  return page.locator('h3 a[href^="/spots/"]').first().textContent();
}

test.describe("/spots ページ送り", () => {
  test("ページ送りで URL に ?page= が付き、表示内容も変わる", async ({ page }) => {
    await page.goto("/spots");
    await expect(page).toHaveURL(/\/spots(\?.*)?$/);

    const firstOnPage1 = await firstSpotName(page);

    // 「2」のページ番号ボタンを押す
    await page.getByRole("button", { name: "2", exact: true }).click();

    await expect(page).toHaveURL(/[?&]page=2/);
    await expect
      .poll(async () => firstSpotName(page))
      .not.toBe(firstOnPage1);
  });

  test("戻るボタンで1ページ目に復元される", async ({ page }) => {
    await page.goto("/spots");
    const firstOnPage1 = await firstSpotName(page);

    await page.getByRole("button", { name: "2", exact: true }).click();
    await expect(page).toHaveURL(/[?&]page=2/);

    await page.goBack();

    // popstate で state が復元され、URL からも page が消えること
    await expect(page).not.toHaveURL(/[?&]page=2/);
    await expect.poll(async () => firstSpotName(page)).toBe(firstOnPage1);
  });

  test("?page=N で直接開くとそのページが表示される", async ({ page }) => {
    await page.goto("/spots");
    const firstOnPage1 = await firstSpotName(page);

    await page.goto("/spots?page=3");
    await expect.poll(async () => firstSpotName(page)).not.toBe(firstOnPage1);
    await expect(page).toHaveURL(/[?&]page=3/);
  });

  test("SSR HTML が空でない（CSR バックアウトの再発防止）", async ({ page }) => {
    const res = await page.goto("/spots?page=2");
    expect(res?.status()).toBe(200);
    const html = await res!.text();
    // ハイドレーション前の生 HTML に本文と広告が含まれていること
    expect(html).toMatch(/<h1/);
    expect(html.match(/href="\/spots\//g)?.length ?? 0).toBeGreaterThan(10);
    expect(html.match(/class="adsbygoogle/g)?.length ?? 0).toBeGreaterThan(1);
  });
});
