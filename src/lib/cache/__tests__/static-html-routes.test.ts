import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { STATIC_HTML_EXCLUDED, STATIC_HTML_ROUTES } from "../static-html-routes";

const APP_DIR = path.join(process.cwd(), "src/app");

/** src/app 配下の page.tsx をルート表記（/a/[b]）で列挙する。route group と private フォルダは除く。 */
function listPages(dir: string, segs: string[] = []): { route: string; file: string }[] {
  const out: { route: string; file: string }[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name.startsWith("_") || name.startsWith("@")) continue;
      const next = name.startsWith("(") ? segs : [...segs, name];
      out.push(...listPages(full, next));
    } else if (name === "page.tsx") {
      out.push({ route: "/" + segs.join("/"), file: full });
    }
  }
  return out;
}

/** next.config の source（:param は1セグメント）がページのルートを覆うか。 */
function covers(pattern: string, route: string): boolean {
  const p = pattern.split("/").filter(Boolean);
  const r = route.split("/").filter(Boolean);
  if (p.length !== r.length) return false;
  return p.every((seg, i) => {
    const isDyn = /^\[.+\]$/.test(r[i]);
    if (seg.startsWith(":")) return true;
    return !isDyn && seg === r[i];
  });
}

describe("STATIC_HTML_ROUTES", () => {
  const pages = listPages(APP_DIR);
  const noCacheConfig = pages.filter(
    ({ file }) => !/export const (revalidate|dynamic)\b/.test(readFileSync(file, "utf8")),
  );

  it("revalidate/dynamic の無いページは、一覧か除外リストのどちらかに入っている", () => {
    const missing = noCacheConfig
      .map((p) => p.route)
      .filter((route) => route !== "/")
      .filter((route) => !(route in STATIC_HTML_EXCLUDED))
      .filter((route) => !STATIC_HTML_ROUTES.some((pat) => covers(pat, route)));
    expect(missing).toEqual([]);
  });

  it("動的ページ（マイページ・お気に入り・ユーザー）を共有キャッシュの対象にしない", () => {
    for (const route of ["/mypage", "/mypage/records", "/favorites", "/users/[tsuriId]"]) {
      expect(STATIC_HTML_ROUTES.some((pat) => covers(pat, route))).toBe(false);
    }
  });

  it("revalidate/dynamic を持つページを1日キャッシュで上書きしない", () => {
    const withConfig = pages
      .filter(({ file }) => /export const (revalidate|dynamic)\b/.test(readFileSync(file, "utf8")))
      .map((p) => p.route);
    const overridden = withConfig.filter((route) =>
      STATIC_HTML_ROUTES.some((pat) => covers(pat, route)),
    );
    expect(overridden).toEqual([]);
  });
});
