import { describe, it, expect } from "vitest";
import { safeJsonLd } from "@/lib/safe-json-ld";

describe("safeJsonLd", () => {
  const sample = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "</script><script>alert(1)</script> & <!-- 釣り -->",
    description: "行区切り\u2028段落区切り\u2029終わり",
    url: "https://tsurispot.com/spots/a?x=1&y=2",
    nested: [{ name: "a>b", n: 1, ok: true, nil: null }],
  };

  it("JSON.parse すると元のオブジェクトと完全に一致する（構造化データの内容は不変）", () => {
    expect(JSON.parse(safeJsonLd(sample))).toEqual(sample);
    expect(JSON.parse(safeJsonLd(sample))).toEqual(JSON.parse(JSON.stringify(sample)));
  });

  it("< > & U+2028 U+2029 を生で含まない", () => {
    const out = safeJsonLd(sample);
    expect(out).not.toMatch(/[<>&\u2028\u2029]/);
    expect(out).toContain("\\u003c/script\\u003e");
    expect(out).toContain("\\u0026");
    expect(out).toContain("\\u2028");
    expect(out).toContain("\\u2029");
  });

  it("エスケープ対象が無ければ JSON.stringify と同一文字列", () => {
    const plain = { "@type": "BreadcrumbList", itemListElement: [{ position: 1, name: "トップ" }] };
    expect(safeJsonLd(plain)).toBe(JSON.stringify(plain));
  });

  it("配列や undefined も扱える", () => {
    const arr = [{ a: "<b>" }, { c: 1 }];
    expect(JSON.parse(safeJsonLd(arr))).toEqual(arr);
    expect(safeJsonLd(undefined)).toBe("");
  });
});
