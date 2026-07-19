import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

/**
 * robots.txt のグループ設計リグレッション防止
 *
 * 背景(RFC 9309): クローラーは「最も具体的にマッチする User-Agent グループ**だけ**」に従う。
 * 過去に { userAgent: "Googlebot", allow: "/" } という独立グループが存在したため、
 * Googlebot には * グループの disallow(/api/ 等)が一切適用されず、GSC
 * 「クロール済み-インデックス未登録」に /api/og 等のアセットURLが数千件積まれた。
 * このテストは「検索botの独立 allow グループで * の disallow が無効化される」構造を CI で禁止する。
 */

const result = robots();
const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

function groupsFor(agent: string) {
  return rules.filter((r) => {
    const agents = Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent];
    return agents.includes(agent);
  });
}

describe("robots.ts: グループ選択(RFC 9309)の整合", () => {
  it("* グループがアセット系を disallow している", () => {
    const star = groupsFor("*");
    expect(star).toHaveLength(1);
    const disallow = star[0].disallow;
    expect(disallow).toContain("/api/");
    expect(disallow).toContain("/_next/image");
    expect(disallow).toContain("/*/opengraph-image");
  });

  it("* グループは /_next/ を一括 disallow しない（JS/CSS=/_next/static を塞ぐとレンダリング評価が壊れる）", () => {
    const star = groupsFor("*")[0];
    const disallow = Array.isArray(star.disallow) ? star.disallow : [star.disallow];
    expect(disallow).not.toContain("/_next/");
    expect(disallow).not.toContain("/_next");
  });

  it("検索エンジンbotの独立グループが存在しない（* の disallow を無効化するため禁止）", () => {
    const searchBots = [
      "Googlebot",
      "Googlebot-Image",
      "Bingbot",
      "Yandex",
      "Baiduspider",
      "Applebot",
      "DuckDuckBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "PerplexityBot",
    ];
    for (const bot of searchBots) {
      expect(groupsFor(bot), `${bot} の独立グループは * の disallow を丸ごと打ち消すため作らないこと`).toHaveLength(0);
    }
  });

  it("全面許可の独立グループは意図されたbot（広告・SNSカード）だけに限られる", () => {
    const fullAllow = rules
      .filter((r) => {
        const allow = r.allow ? (Array.isArray(r.allow) ? r.allow : [r.allow]) : [];
        const disallow = r.disallow
          ? (Array.isArray(r.disallow) ? r.disallow : [r.disallow])
          : [];
        return allow.includes("/") && disallow.length === 0;
      })
      .flatMap((r) => (Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent]))
      .filter((ua) => ua !== "*");
    expect(fullAllow.sort()).toEqual(
      ["AdsBot-Google", "Mediapartners-Google", "Twitterbot"].sort(),
    );
  });

  it("学習系botは引き続き全面 disallow", () => {
    for (const bot of ["GPTBot", "ClaudeBot", "CCBot", "Google-Extended"]) {
      const groups = groupsFor(bot);
      expect(groups).toHaveLength(1);
      const disallow = Array.isArray(groups[0].disallow)
        ? groups[0].disallow
        : [groups[0].disallow];
      expect(disallow).toContain("/");
    }
  });
});
