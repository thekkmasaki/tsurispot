import { describe, it, expect } from "vitest";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";

/** ブラウザの DOM 直列化で正規化して比較する（<br/> と <br /> 等の表記ゆれを吸収） */
function normalize(html: string): string {
  const t = document.createElement("template");
  t.innerHTML = html;
  t.content.querySelectorAll("[style]").forEach((el) => {
    const s = (el as HTMLElement).style;
    const parts: string[] = [];
    for (let i = 0; i < s.length; i++) parts.push(`${s[i]}:${s.getPropertyValue(s[i])}`);
    el.setAttribute("style", parts.join(";"));
  });
  return t.innerHTML;
}

function parse(html: string): DocumentFragment {
  const t = document.createElement("template");
  t.innerHTML = html;
  return t.content;
}

function links(html: string) {
  return [...parse(html).querySelectorAll("a")].map((a) => ({
    href: a.getAttribute("href"),
    target: a.getAttribute("target"),
    rel: a.getAttribute("rel"),
    text: a.textContent,
  }));
}

// 週報（scripts/weekly-reports/post-week4.mjs / /weekly-report コマンド）の実際の構造から抜粋
const WEEKLY_REPORT = `<p style="font-size:1.1em;line-height:1.8;color:#334155">明石・神戸エリアの<strong>2026年3月第4週（3/22〜3/28）</strong>の釣果情報をまとめました。<br/>須磨海づり公園で<strong>マダイ68cm×2</strong>の大物が連発！</p><h2>今週の釣果速報（一覧）</h2><div style="overflow-x:auto;margin:1.5em 0"><table style="width:100%;border-collapse:collapse;font-size:0.9em;min-width:600px"><thead><tr style="background:#0c4a6e;color:#fff"><th style="padding:0.6em 0.8em;text-align:left">スポット</th><th style="padding:0.6em 0.8em;text-align:left">魚種</th></tr></thead><tbody><tr style="border-bottom:1px solid #e2e8f0"><td style="padding:0.6em 0.8em;font-weight:600"><a href="/spots/suma-umizuri-koen-ato">須磨海づり公園</a></td><td style="padding:0.6em 0.8em">マダイ 68cm &amp; チヌ</td></tr></tbody></table></div><hr style="margin:2.5em 0;border:none;border-top:2px solid #e2e8f0"/><div style="margin:1.5em 0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden"><div style="padding:0.8em 1em;background:#fafafa;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:0.6em"><span style="font-size:1.2em">🏢</span><div><a href="https://sumasakana-park.com/fishing/" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9;text-decoration:underline">須磨海づり公園 公式釣果</a></div></div><h3>今週の実績</h3><ul><li><strong>マダイ</strong> 68cm×2</li><li>チヌ 51cm×4</li></ul></div><h2 id="h1a2b3c">今週末に狙うなら</h2><p>詳しくは<a href="https://amzn.to/abc" target="_blank" rel="noopener noreferrer sponsored">おすすめ商品</a>へ。</p>`;

describe("sanitizeArticleHtml", () => {
  it("週報HTMLは表示・テキスト・リンクが変わらない", () => {
    const out = sanitizeArticleHtml(WEEKLY_REPORT);
    expect(normalize(out)).toBe(normalize(WEEKLY_REPORT));
    expect(parse(out).textContent).toBe(parse(WEEKLY_REPORT).textContent);
    expect(links(out)).toEqual(links(WEEKLY_REPORT));
    // 本文の h2 分割（中間広告挿入・週報ダイジェスト抽出）が従来どおり効く
    expect(out.split(/(?=<h2[\s>])/).length).toBe(WEEKLY_REPORT.split(/(?=<h2[\s>])/).length);
    expect(out).toContain('<h2 id="h1a2b3c">');
  });

  it("microCMS エディタ由来の画像・figure・引用・コードを残す", () => {
    const html =
      '<figure><img src="https://images.microcms-assets.io/assets/x/y.jpg" alt="堤防" width="800" height="600" loading="lazy"><figcaption>大黒海づり施設</figcaption></figure><blockquote><p>引用</p></blockquote><pre><code>code</code></pre><ol start="2"><li>二</li></ol>';
    expect(normalize(sanitizeArticleHtml(html))).toBe(normalize(html));
  });

  it("YouTube の iframe 埋め込みは残し、それ以外の iframe は落とす", () => {
    const yt = '<iframe src="https://www.youtube.com/embed/abc" width="560" height="315" allowfullscreen=""></iframe>';
    expect(sanitizeArticleHtml(yt)).toContain('src="https://www.youtube.com/embed/abc"');
    const evil = sanitizeArticleHtml('<iframe src="https://evil.example.com/x"></iframe>');
    expect(evil).not.toContain("evil.example.com");
  });

  it("script / style / object / embed / form は除去する", () => {
    const out = sanitizeArticleHtml(
      '<p>本文</p><script>alert(1)</script><style>body{display:none}</style><object data="x.swf"></object><embed src="x.swf"><form action="https://evil.example.com"><input name="q"></form>',
    );
    expect(out).toBe("<p>本文</p>");
  });

  it("on* 属性を除去する", () => {
    const out = sanitizeArticleHtml('<img src="https://example.com/a.jpg" onerror="alert(1)" alt="a"><p onclick="alert(1)">x</p>');
    expect(out).not.toMatch(/onerror|onclick|alert/);
    expect(out).toContain('src="https://example.com/a.jpg"');
  });

  it("javascript: / data: / vbscript: URL を除去する", () => {
    const out = sanitizeArticleHtml(
      '<a href="javascript:alert(1)">a</a><a href="  JaVaScRiPt:alert(1)">b</a><a href="vbscript:x">c</a><img src="data:text/html;base64,PHNjcmlwdD4=">',
    );
    expect(out).not.toMatch(/javascript|vbscript|data:/i);
    expect(parse(out).textContent).toBe("abc");
  });

  it("style の url() / expression() は落とし、通常の装飾は残す", () => {
    const out = sanitizeArticleHtml(
      '<div style="background:url(https://evil.example.com/t.gif);color:#fff">a</div><div style="width:expression(alert(1))">b</div>',
    );
    expect(out).not.toMatch(/url\(|expression/);
    expect(out).toContain("color:#fff");
  });

  it("空文字はそのまま返す", () => {
    expect(sanitizeArticleHtml("")).toBe("");
  });
});
