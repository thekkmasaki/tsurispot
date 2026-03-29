import { test, expect } from "@playwright/test";

test.describe("未認証時の動作", () => {
  test.describe("マイページ", () => {
    test("ログイン促進画面が表示される", async ({ page }) => {
      await page.goto("/mypage");
      await expect(
        page.getByRole("heading", { name: "ログインが必要です" })
      ).toBeVisible();
      await expect(
        page.getByText("マイページを利用するにはログインしてください")
      ).toBeVisible();
    });

    test("ログインボタンが表示されクリックでログインページへ遷移する", async ({
      page,
    }) => {
      await page.goto("/mypage");
      const loginButton = page.getByRole("link", { name: "ログインする" });
      await expect(loginButton).toBeVisible();
      await loginButton.click();
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("認証必須API", () => {
    test("GET /api/user/profile → 認証エラーではない（GETは未定義）", async ({
      request,
    }) => {
      // profile APIにはGETがないので405が期待される
      const res = await request.get("/api/user/profile");
      expect(res.status()).toBe(405);
    });

    test("PATCH /api/user/profile → 401", async ({ request }) => {
      const res = await request.patch("/api/user/profile", {
        data: { nickname: "テスト" },
      });
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("認証が必要です");
    });

    test("DELETE /api/user/profile → 401", async ({ request }) => {
      const res = await request.delete("/api/user/profile");
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("認証が必要です");
    });

    test("GET /api/user/favorites → 401", async ({ request }) => {
      const res = await request.get("/api/user/favorites");
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("認証が必要です");
    });

    test("PUT /api/user/favorites → 401", async ({ request }) => {
      const res = await request.put("/api/user/favorites", {
        data: { favorites: ["otaru-port"] },
      });
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("認証が必要です");
    });

    test("GET /api/user/catch-reports → 401", async ({ request }) => {
      const res = await request.get("/api/user/catch-reports");
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.error).toContain("未認証");
    });
  });

  test.describe("ユーザーメニュー（ヘッダー）", () => {
    test("未ログイン時はログインリンクが表示される", async ({ page }) => {
      await page.goto("/");
      const loginLink = page.getByRole("link", { name: "ログイン" });
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute("href", "/login");
    });

    test("ユーザーメニューのドロップダウンは表示されない", async ({
      page,
    }) => {
      await page.goto("/");
      // ユーザーメニューボタン（aria-label="ユーザーメニュー"）は存在しないこと
      await expect(
        page.getByRole("button", { name: "ユーザーメニュー" })
      ).not.toBeVisible();
    });
  });
});
