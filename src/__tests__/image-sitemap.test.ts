import { describe, it, expect } from "vitest";
import { GET } from "@/app/image-sitemap.xml/route";

/**
 * image-sitemap の中身ゲート
 *
 * 背景: 旧実装は全スポット・全魚種に OGP 画像(/api/og?title=...)を <image:loc> として
 * 約5,400件配信しており、GSC「クロール済み-インデックス未登録」の最大の供給源だった。
 * OGP カードはテキスト画像で画像検索価値が無く、robots.txt では /api/ を disallow して
 * いるため「sitemap で配りながら robots で塞ぐ」矛盾にもなる。実画像のみ許可する。
 */
describe("image-sitemap.xml", () => {
  it("OGP画像(/api/og)やアセットURLを1件も含まない", async () => {
    const res = await GET();
    const body = await res.text();
    expect(body).not.toContain("/api/og");
    expect(body).not.toContain("/_next/image");
    expect(body).not.toContain("/opengraph-image");
  });

  it("実画像エントリが十分な件数あり、画像なしの空<url>を出さない", async () => {
    const res = await GET();
    const body = await res.text();
    const imageCount = (body.match(/<image:loc>/g) || []).length;
    expect(imageCount).toBeGreaterThan(1000);
    // <url> ブロックは必ず <image:image> を1つ以上含む
    expect(body).not.toMatch(/<url>\s*<loc>[^<]*<\/loc>\s*<\/url>/);
  });
});
