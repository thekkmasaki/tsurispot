import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * 内部リンク監査（404 ゲート）
 *
 * 方針:
 *   「dynamicParams 撤廃＋無効 param を親へ 301」により、ルート（page.tsx）が存在する限り
 *   無効な slug は 404 ではなく 301 になる。したがって残る 404 源は
 *   「そもそも対応するルートが存在しない形状の href」だけ。
 *   よってデータ値の照合ではなく、
 *     (A) src/app のファイルシステムから全ルート形状を収集（[slug] は "*"、[...x] は catch-all）
 *     (B) src/app・src/components の JSX から内部 href を抽出（${...} は "*" に正規化）
 *   し、(B) の各 href がセグメント単位で (A) のどれかに適合するか検証する。
 *   セグメント比較は「リテラル一致 OR ルート側が動的 OR href 側が動的(*)」を許容するため、
 *   固定セットを反復して静的ルートへ飛ぶ href（例 /instructor-exam/${slug}）を誤検知しない一方、
 *   typo（例 /guides/... ← 正しくは /guide/...）や削除済みルートへのリンクは検出できる。
 */

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "src", "app");
const SCAN_DIRS = [
  path.join(ROOT, "src", "app"),
  path.join(ROOT, "src", "components"),
];
const PAGE_FILES = new Set(["page.tsx", "page.ts", "route.ts", "route.tsx"]);

type RouteShape = { segs: string[]; catchAll: boolean };

// ----- (A) ルート形状の収集 -----
function collectRoutes(): { shapes: RouteShape[]; staticCount: number } {
  const shapes: RouteShape[] = [{ segs: [], catchAll: false }]; // "/"
  let staticCount = 1;

  function walk(dir: string, segments: string[]) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    if (entries.some((e) => e.isFile() && PAGE_FILES.has(e.name))) {
      // route group "(...)" は URL に出ないので除外
      const urlSegs = segments.filter(
        (s) => !(s.startsWith("(") && s.endsWith(")")),
      );
      let catchAll = false;
      const segs = urlSegs.map((s) => {
        if (s.startsWith("[[...") || s.startsWith("[...")) {
          catchAll = true;
          return "*";
        }
        if (s.startsWith("[")) return "*";
        return s;
      });
      shapes.push({ segs, catchAll });
      if (!segs.includes("*")) staticCount++;
    }

    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (e.name.startsWith("_")) continue; // プライベートフォルダ
      if (e.name === "api") continue; // API は別管理
      walk(path.join(dir, e.name), [...segments, e.name]);
    }
  }

  walk(APP_DIR, []);
  return { shapes, staticCount };
}

// ----- (B) JSX から内部 href を抽出 -----
function extractHrefs(): { href: string; file: string }[] {
  const files: string[] = [];
  function collect(dir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (!e.name.startsWith(".") && e.name !== "node_modules") {
          collect(path.join(dir, e.name));
        }
      } else if (e.name.endsWith(".tsx")) {
        files.push(path.join(dir, e.name));
      }
    }
  }
  for (const d of SCAN_DIRS) collect(d);

  const re = /href=(?:"([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})/g;
  const out: { href: string; file: string }[] = [];
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      out.push({ href: m[1] ?? m[2] ?? m[3] ?? "", file });
    }
  }
  return out;
}

// href を「ルート形状のセグメント列」に正規化。検査対象外なら null。
function normalizeHref(href: string): string[] | null {
  if (!href) return null;
  let h = href.trim();
  if (!h.startsWith("/")) return null; // 外部 / # / ? / mailto / tel / 相対
  if (h.startsWith("//")) return null; // protocol-relative の外部
  if (h.startsWith("/api")) return null; // API ルートは別管理
  h = h.replace(/\$\{[^}]*\}/g, "*"); // テンプレート ${...} を動的セグメントへ
  h = h.split("#")[0].split("?")[0]; // ハッシュ・クエリ除去
  h = h.replace(/\/{2,}/g, "/"); // 連続スラッシュ潰し
  if (h.length > 1) h = h.replace(/\/+$/, ""); // 末尾スラッシュ正規化
  const segs = h.split("/").filter(Boolean);
  // /public の静的アセット（拡張子付き）は実ファイル配信なので除外
  if (segs.length > 0 && /\.[a-z0-9]+$/i.test(segs[segs.length - 1])) return null;
  return segs;
}

function segCompatible(h: string, r: string): boolean {
  return h === r || r === "*" || h === "*";
}

function matchesAnyRoute(hrefSegs: string[], shapes: RouteShape[]): boolean {
  return shapes.some((shape) => {
    if (shape.catchAll) {
      // catch-all: 先頭の固定部分（最後の "*" を除く）まで一致し、以降は任意
      const fixed = shape.segs.slice(0, -1);
      if (hrefSegs.length < fixed.length) return false;
      return fixed.every((r, i) => segCompatible(hrefSegs[i], r));
    }
    if (hrefSegs.length !== shape.segs.length) return false;
    return shape.segs.every((r, i) => segCompatible(hrefSegs[i], r));
  });
}

const parentFallback = (segs: string[]): string =>
  segs.length <= 1 ? "/" : "/" + segs.slice(0, -1).join("/");

describe("内部リンク監査 — 404 になるルート形状のリンクが無いこと", () => {
  const { shapes, staticCount } = collectRoutes();
  const hrefs = extractHrefs();

  it("ルート定義と href を収集できている", () => {
    expect(staticCount).toBeGreaterThan(20);
    expect(shapes.some((s) => s.segs.includes("*"))).toBe(true);
    expect(hrefs.length).toBeGreaterThan(100);
  });

  it("全ての内部 href が存在するルート形状を指している（404 ゼロ）", () => {
    const dead = new Map<string, { suggested: string; files: Set<string> }>();

    for (const { href, file } of hrefs) {
      const segs = normalizeHref(href);
      if (segs === null) continue;
      if (matchesAnyRoute(segs, shapes)) continue;
      const key = "/" + segs.join("/");
      if (!dead.has(key)) {
        dead.set(key, { suggested: parentFallback(segs), files: new Set() });
      }
      dead.get(key)!.files.add(path.relative(ROOT, file));
    }

    if (dead.size > 0) {
      const rows = Array.from(dead.entries()).map(([shape, d]) => ({
        deadShape: shape,
        suggestedRedirect: d.suggested,
        example: Array.from(d.files)[0],
        files: d.files.size,
      }));
      // eslint-disable-next-line no-console
      console.table(rows);
    }

    expect(
      Array.from(dead.keys()),
      "存在しないルート形状を指す内部リンクが見つかりました。リンクを修正するか、該当ルートを追加してください。",
    ).toEqual([]);
  });
});
