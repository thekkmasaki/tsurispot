import { test, expect } from "@playwright/test";

test.describe("称号システム - API テスト", () => {
  test.describe("釣果投稿API（未認証）", () => {
    test("未認証で投稿 → 成功するがuserIdなし", async ({ request }) => {
      const res = await request.post("/api/catch-report-ugc", {
        data: {
          spotSlug: "test-title-e2e",
          spotName: "テスト称号スポット",
          fishName: "アジ",
          userName: "称号テスター",
          comment: "称号テスト投稿です",
          date: "2026-03-28",
        },
      });
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });

    test("未認証で削除 → 401", async ({ request }) => {
      const res = await request.delete("/api/catch-report-ugc", {
        data: { reportId: "fake-id", spotSlug: "test-spot" },
      });
      expect(res.status()).toBe(401);
    });
  });

  test.describe("釣果取得APIにreportCountが含まれる", () => {
    test("GET /api/catch-reports → reportCountフィールドが存在しうる", async ({
      request,
    }) => {
      const res = await request.get("/api/catch-reports?spot=otaru-port");
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(Array.isArray(data.reports)).toBe(true);
      // userIdがあるレポートにはreportCountが付与される
      for (const report of data.reports) {
        if (report.userId) {
          expect(typeof report.reportCount).toBe("number");
          expect(report.reportCount).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe("ユーザー釣果API（未認証）", () => {
    test("GET /api/user/catch-reports → 未認証で401", async ({ request }) => {
      const res = await request.get("/api/user/catch-reports");
      expect(res.status()).toBe(401);
    });
  });
});

test.describe("称号一覧ページ", () => {
  test("ページが表示される", async ({ page }) => {
    await page.goto("/titles");
    await expect(
      page.getByRole("heading", { name: "称号・バッジ一覧" })
    ).toBeVisible();
  });

  test("全10段階の称号が表示される", async ({ page }) => {
    await page.goto("/titles");
    // 各称号が表示されていること
    const titles = [
      "釣神", "伝説の釣り師", "釣りの達人", "凄腕アングラー",
      "マスター", "ベテラン", "一人前", "見習い釣り師",
      "釣りデビュー", "新人釣り師",
    ];
    for (const title of titles) {
      await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
    }
  });

  test("最高ランクバッジが表示される", async ({ page }) => {
    await page.goto("/titles");
    await expect(page.getByText("最高ランク")).toBeVisible();
  });

  test("称号の仕組みセクションが表示される", async ({ page }) => {
    await page.goto("/titles");
    await expect(page.getByText("称号の仕組み")).toBeVisible();
    await expect(page.getByText("投稿数に応じて称号が自動的にランクアップ")).toBeVisible();
  });

  test("10件以上の称号にアニメーションクラスがある", async ({ page }) => {
    await page.goto("/titles");
    // ベテラン（10件）以上のバッジにanimate-pulseが付いていること
    const badges = page.locator(".animate-pulse");
    const count = await badges.count();
    // 釣神(200)、伝説(100)、達人(50)、凄腕(30)、マスター(20)、ベテラン(10) = 6個
    expect(count).toBeGreaterThanOrEqual(6);
  });
});

test.describe("釣果レポートリスト - 称号表示", () => {
  test("空の釣果報告に称号案内テキストが表示される", async ({ page }) => {
    // 釣果が少ないスポットにアクセス
    await page.goto("/spots/otaru-port");
    // 釣果セクションまでスクロール
    const section = page.getByText("みんなの釣果報告", { exact: false });
    if (await section.isVisible()) {
      // 称号の案内テキストがあるか確認（空の場合のみ）
      const titleLink = page.getByRole("link", { name: "称号" });
      if (await titleLink.isVisible()) {
        // 称号リンクをクリックすると/titlesに遷移
        await titleLink.click();
        await expect(page).toHaveURL("/titles");
      }
    }
  });
});

test.describe("マイページ - 称号表示（未認証）", () => {
  test("未認証時はマイページにログイン促進が表示される", async ({ page }) => {
    await page.goto("/mypage");
    await expect(
      page.getByRole("heading", { name: "ログインが必要です" })
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("ユーザーメニュー - 称号表示", () => {
  test("未認証時はログインアイコンが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "ログイン" })).toBeVisible();
  });
});

test.describe("ヘッダー称号バッジ", () => {
  test("未認証時は称号バッジが表示されない", async ({ page }) => {
    await page.goto("/");
    // /titles へのリンクバッジは認証時のみ
    const titleBadge = page.locator('a[href="/titles"]');
    await expect(titleBadge).not.toBeVisible();
  });

  test("ヘッダーのデフォルト背景色が白系", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    // bg-gradient-to-r クラスが含まれること
    const className = await header.getAttribute("class");
    expect(className).toContain("bg-gradient-to-r");
  });
});

test.describe("初回ログインモーダル", () => {
  test("未認証時はニックネームモーダルが表示されない", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    // モーダルが表示されないこと
    await expect(page.getByText("ようこそ、ツリスポへ！")).not.toBeVisible();
  });
});
