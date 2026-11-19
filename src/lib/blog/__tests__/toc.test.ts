import { describe, it, expect } from "vitest";
import { addHeadingIds } from "../toc";

describe("addHeadingIds", () => {
  it("h2 に連番の id を振り、タグを除いた見出しを返す", () => {
    const { html, toc } = addHeadingIds("<p>a</p><h2>道具</h2><p>b</p><h2><strong>時期</strong>と場所</h2>");
    expect(toc).toEqual([
      { id: "sec-1", text: "道具" },
      { id: "sec-2", text: "時期と場所" },
    ]);
    expect(html).toContain('<h2 id="sec-1">道具</h2>');
    expect(html).toContain('<h2 id="sec-2"><strong>時期</strong>と場所</h2>');
  });

  it("既存の id と属性は変えない", () => {
    const src = '<h2 class="x" id="faq">よくある質問</h2>';
    const { html, toc } = addHeadingIds(src);
    expect(html).toBe(src);
    expect(toc).toEqual([{ id: "faq", text: "よくある質問" }]);
  });

  it("h2 が無い・空の h2 は目次に入れない", () => {
    expect(addHeadingIds("<p>本文</p>").toc).toEqual([]);
    expect(addHeadingIds("<h2> </h2>").toc).toEqual([]);
  });

  it("h3 など他の見出しには触らない", () => {
    const src = "<h3>小見出し</h3>";
    expect(addHeadingIds(src).html).toBe(src);
  });
});
