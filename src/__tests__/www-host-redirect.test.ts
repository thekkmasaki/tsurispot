import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

/**
 * www → apex ホスト正規化
 *
 * 背景: www.tsurispot.com が同一オリジンに到達して全ページを 200 でミラー配信しており、
 * GSC「代替ページ（適切な canonical タグあり）」に積まれ続けていた。middleware で
 * 301 に集約する。クエリ・パスを維持することも保証する。
 */
describe("middleware: www → apex 301", () => {
  it("www ホストは apex へ 301（パス・クエリ維持）", () => {
    const req = new NextRequest("https://www.tsurispot.com/spots/nishizu-kou?utm=x", {
      headers: { host: "www.tsurispot.com" },
    });
    const res = middleware(req);
    expect(res.status).toBe(301);
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

  it("www リダイレクトは UA ブロックより先に効く（クローラーにも一貫した 301 を返す）", () => {
    const req = new NextRequest("https://www.tsurispot.com/", {
      headers: { host: "www.tsurispot.com", "user-agent": "GPTBot/1.1" },
    });
    const res = middleware(req);
    expect(res.status).toBe(301);
  });
});
