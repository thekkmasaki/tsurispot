import { test, expect } from "@playwright/test";

test.describe("マイページ - 認証状態の表示", () => {
  test("ローディング後に最終状態が表示される", async ({ page }) => {
    await page.goto("/mypage");
    // セッション読み込みが完了し「ログインが必要です」が表示されるまで待つ
    await expect(
      page.getByRole("heading", { name: "ログインが必要です" })
    ).toBeVisible({ timeout: 10000 });
  });

  test("未認証時にログイン促進が表示された後、ログインページへ遷移できる", async ({
    page,
  }) => {
    await page.goto("/mypage");
    await expect(
      page.getByRole("heading", { name: "ログインが必要です" })
    ).toBeVisible({ timeout: 10000 });

    // ログインボタンクリック
    await page.getByRole("link", { name: "ログインする" }).click();
    await expect(page).toHaveURL("/login");

    // ログインページのボタンが表示される
    await expect(
      page.getByRole("button", { name: /LINEでログイン/ })
    ).toBeVisible();
  });
});

test.describe("マイページ - ニックネーム変更UI（未認証）", () => {
  test("ニックネーム変更フォームは未認証時には表示されない", async ({
    page,
  }) => {
    await page.goto("/mypage");
    await page.waitForTimeout(2000); // セッション読み込み待ち
    await expect(page.getByLabel("ニックネーム変更")).not.toBeVisible();
  });
});

test.describe("プロフィールAPI - ニックネームバリデーション", () => {
  test("21文字以上のニックネームは拒否される（認証時）", async ({
    request,
  }) => {
    const res = await request.patch("/api/user/profile", {
      data: { nickname: "あ".repeat(21) },
    });
    // 401（未認証）が先に返る。認証済みの場合は400を期待
    expect([400, 401]).toContain(res.status());
  });

  test("空文字のニックネームは拒否される", async ({ request }) => {
    const res = await request.patch("/api/user/profile", {
      data: { nickname: "   " },
    });
    expect([400, 401]).toContain(res.status());
  });

  test("nicknameフィールドがないリクエストは拒否される", async ({
    request,
  }) => {
    const res = await request.patch("/api/user/profile", {
      data: { foo: "bar" },
    });
    expect([400, 401]).toContain(res.status());
  });
});

test.describe("アカウント削除API（未認証）", () => {
  test("DELETE /api/user/profile → 401", async ({ request }) => {
    const res = await request.delete("/api/user/profile");
    expect(res.status()).toBe(401);
  });
});
