import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy, forbidden } from "@/proxy";
import { getAreaRepSlug, getAllAreaGroups } from "@/lib/data/area-groups";

/**
 * 403 応答をエッジにキャッシュさせない
 *
 * 背景(2026-11-15): ブロック対象bot向けの 403 に next.config の
 * `/spots/:slug` 用 `Cache-Control: public, s-maxage=604800` が付き、Cloudflare が
 * 「Forbidden」を最大7日キャッシュ → Googlebot・一般ユーザーにも 403 が返っていた
 * （GSC「アクセス禁止(403)」129件。/spots/ashinoko-lake 等で本番実証）。
 */
describe("proxy: 403 はキャッシュ不可", () => {
  it("ブロック対象UAの 403 は no-store 系ヘッダを持つ", () => {
    const req = new NextRequest("https://tsurispot.com/spots/ashinoko-lake", {
      headers: { host: "tsurispot.com", "user-agent": "Mozilla/5.0 (compatible; SemrushBot/7~bl)" },
    });
    const res = proxy(req);
    expect(res.status).toBe(403);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(res.headers.get("cdn-cache-control")).toBe("no-store");
    expect(res.headers.get("cloudflare-cdn-cache-control")).toBe("no-store");
  });

  it("forbidden() 単体も public / s-maxage を含まない", () => {
    const res = forbidden();
    expect(res.status).toBe(403);
    const cc = res.headers.get("cache-control") ?? "";
    expect(cc).not.toMatch(/public|s-maxage/);
  });

  it("Googlebot は 403 にならない", () => {
    const req = new NextRequest("https://tsurispot.com/spots/ashinoko-lake", {
      headers: {
        host: "tsurispot.com",
        "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    });
    expect(proxy(req).status).toBe(200);
  });
});

describe("エリア代表slug: 内部リンク先は代表のみ", () => {
  it("代表slugの代表は自分自身（リンク先が更に canonical されない）", () => {
    for (const g of getAllAreaGroups()) {
      expect(getAreaRepSlug(g.slug)).toBe(g.slug);
    }
  });
});
