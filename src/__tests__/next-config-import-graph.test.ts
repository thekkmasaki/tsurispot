import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * next.config.ts が読み込むファイル（spots.ts 以下）では @/ エイリアスの実行時 import が使えない。
 * Next の設定ローダーはエイリアスを解決しないため、本番ビルドが
 * 「Cannot find module './src/lib/utils/spot-rule-consistency'」で失敗し、
 * 2026-11-20 に #650〜#655 のデプロイが止まった。型だけの import（import type）は消えるので可。
 */

const ROOT = process.cwd();
const IMPORT_RE = /^\s*(import|export)\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["'];?/gm;

function resolveLocal(from: string, spec: string): string | null {
  const base = spec.startsWith("@/")
    ? path.join(ROOT, "src", spec.slice(2))
    : path.resolve(path.dirname(from), spec);
  for (const cand of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (existsSync(cand) && !cand.endsWith("/")) {
      try {
        readFileSync(cand);
        return cand;
      } catch {
        // ディレクトリなど
      }
    }
  }
  return null;
}

function isTypeOnly(kind: string | undefined, clause: string): boolean {
  if (kind) return true;
  // import { type A, type B } のように全部 type 指定
  const m = clause.match(/^\{([\s\S]*)\}$/);
  if (!m) return false;
  const names = m[1].split(",").map((s) => s.trim()).filter(Boolean);
  return names.length > 0 && names.every((n) => n.startsWith("type "));
}

describe("next.config.ts の import 連鎖", () => {
  it("@/ エイリアスの実行時 import を含まない", () => {
    const start = path.join(ROOT, "next.config.ts");
    const seen = new Set<string>();
    const stack = [start];
    const violations: string[] = [];
    while (stack.length) {
      const file = stack.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(IMPORT_RE)) {
        const [, , typeKw, clause, spec] = m;
        if (isTypeOnly(typeKw, clause.trim())) continue;
        if (!spec.startsWith(".") && !spec.startsWith("@/")) continue; // パッケージ
        if (spec.startsWith("@/")) {
          // @/types から PascalCase の型だけを読む import は SWC が消すので通る（既存の多数のデータファイル）。
          // 定数（SPOT_TYPE_LABELS）や関数など値を読む場合と、@/types 以外は失敗する。
          const names = (clause.match(/^\{([\s\S]*)\}$/)?.[1] ?? clause)
            .split(",")
            .map((s) => s.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0])
            .filter(Boolean);
          const onlyPascalTypes = names.every((n) => /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)*$/.test(n));
          if (spec === "@/types" && onlyPascalTypes) continue;
          violations.push(`${path.relative(ROOT, file)}: ${spec} { ${names.join(", ")} }`);
          continue;
        }
        if (spec.endsWith(".json")) continue;
        const next = resolveLocal(file, spec);
        if (next) stack.push(next);
      }
    }
    expect(seen.size).toBeGreaterThan(5);
    expect(violations).toEqual([]);
  });
});
