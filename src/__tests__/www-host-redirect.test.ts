import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

/**
 * www → apex ホスト正規化
 *
 * 背景: www.tsurispot.com が同一オリジンに到達して全ページを 200 でミラー配信しており、
 * GSC「代替ページ（適切な canonical タグあり）」に積まれ続けていた。middleware で
 * permanent リダイレクトに集約する。クエリ・パスを維持することも保証する。
 * 301 ではなく 308 を使う — 301 は POST を GET に落とし、www 経由のログイン POST
 * （/api/auth/signin）の body が消失するため。308 は method/body を保持し SEO 上は等価。
 */
describe("middleware: www → apex 308", () => {
  it("www ホストは apex へ 308（パス・クエリ維持）", () => {
    const req = new NextRequest("https://www.tsurispot.com/spots/nishizu-kou?utm=x", {
      headers: { host: "www.tsurispot.com" },
    });
    const res = middleware(req);
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe(
      "https://tsurispot.com/spots/nishizu-kou?utm=x",
    );
  });

  it("apex ホストはリダイレクトしない", () => {
    const req = new NextRequest("https://tsurispot.com/spots/nishizu-kou", {
      headers: { host: "tsurispot.com" },
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("www リダイレクトは UA ブロックより先に効く（クローラーにも一貫した 308 を返す）", () => {
    const req = new NextRequest("https://www.tsurispot.com/", {
      headers: { host: "www.tsurispot.com", "user-agent": "GPTBot/1.1" },
    });
    const res = middleware(req);
    expect(res.status).toBe(308);
  });

  it("POST も method を維持したままリダイレクトされる（308 の存在意義）", () => {
    const req = new NextRequest(
      "https://www.tsurispot.com/api/auth/signin/cognito",
      {
        method: "POST",
        headers: { host: "www.tsurispot.com" },
      },
    );
    const res = middleware(req);
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe(
      "https://tsurispot.com/api/auth/signin/cognito",
    );
  });
});
