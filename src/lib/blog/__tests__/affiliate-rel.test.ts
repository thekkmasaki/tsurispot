import { describe, expect, it } from "vitest";
import { addSponsoredRel, isAffiliateUrl } from "../affiliate-rel";

describe("isAffiliateUrl", () => {
  it("アフィリエイトのホストを判定する", () => {
    expect(isAffiliateUrl("https://amzn.to/4s1SPaX")).toBe(true);
    expect(isAffiliateUrl("https://www.amazon.co.jp/dp/B000?tag=x-22")).toBe(true);
    expect(isAffiliateUrl("https://a.r10.to/abc")).toBe(true);
    expect(isAffiliateUrl("https://tsuttarou.net/archives/1")).toBe(false);
    expect(isAffiliateUrl("/spots/honmoku-fishing")).toBe(false);
    expect(isAffiliateUrl("https://notamzn.to/x")).toBe(false);
  });
});

describe("addSponsoredRel", () => {
  it("microCMSに剥がされた rel に sponsored を足す（既存値は保持）", () => {
    const html = '<a href="https://amzn.to/4s1SPaX" target="_blank" rel="noopener noreferrer">竿 →</a>';
    expect(addSponsoredRel(html)).toBe(
      '<a href="https://amzn.to/4s1SPaX" target="_blank" rel="noopener noreferrer sponsored">竿 →</a>',
    );
  });

  it("rel が無ければ追加する", () => {
    expect(addSponsoredRel('<a href="https://a.r10.to/x">楽天</a>')).toBe(
      '<a rel="sponsored noopener noreferrer" href="https://a.r10.to/x">楽天</a>',
    );
  });

  it("既に sponsored があれば重複させない", () => {
    const html = '<a href="https://amzn.to/x" rel="noopener noreferrer sponsored">x</a>';
    expect(addSponsoredRel(html)).toBe(html);
  });

  it("アフィリエイト以外のリンクと内部リンクは変更しない", () => {
    const html =
      '<a href="https://tsuttarou.net/archives/1" target="_blank" rel="noopener noreferrer">出典</a><a href="/spots/x">本牧</a>';
    expect(addSponsoredRel(html)).toBe(html);
  });

  it("シングルクォートの属性にも対応する", () => {
    expect(addSponsoredRel("<a href='https://amzn.to/x' rel='noopener'>x</a>")).toBe(
      "<a href='https://amzn.to/x' rel=\"noopener sponsored noreferrer\">x</a>",
    );
  });
});
