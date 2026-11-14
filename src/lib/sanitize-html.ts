import sanitizeHtml from "sanitize-html";

/**
 * microCMS から取得した記事本文 HTML を無害化する（サーバー側でのみ使用）。
 *
 * 本文は dangerouslySetInnerHTML でそのまま描画されるため、microCMS の API キー漏えいや
 * 入稿ミスで <script> / onerror= / javascript: が混入すると XSS になる。
 * 許可リストは実際の入稿元から作っている:
 *   - 週報（~/.claude/commands/weekly-report.md, scripts/weekly-reports/*.mjs, scripts/post-hachijo.mjs）:
 *     h2/h3/p/div/span/strong/ul/li/table系/hr/br/a(href,target,rel) と大量のインライン style
 *   - microCMS リッチエディタ: 見出しの id、img/figure/figcaption、blockquote、code/pre、iframe(埋め込み) 等
 * 表示・テキスト・リンクを変えないことが前提（SEO 不変）。危険なものだけを落とす。
 */

/** インライン style で許可する CSS プロパティ（週報テンプレートで実際に使っているもの＋一般的な装飾） */
const STYLE_PROPERTIES = [
  "color",
  "background",
  "background-color",
  "font-size",
  "font-weight",
  "font-style",
  "font-family",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-decoration",
  "text-indent",
  "vertical-align",
  "white-space",
  "word-break",
  "overflow-wrap",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-color",
  "border-style",
  "border-width",
  "border-radius",
  "border-collapse",
  "border-spacing",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "display",
  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "align-items",
  "align-self",
  "justify-content",
  "gap",
  "row-gap",
  "column-gap",
  "grid-template-columns",
  "grid-template-rows",
  "grid-column",
  "grid-row",
  "width",
  "min-width",
  "max-width",
  "height",
  "min-height",
  "max-height",
  "overflow",
  "overflow-x",
  "overflow-y",
  "list-style",
  "list-style-type",
  "list-style-position",
  "box-shadow",
  "opacity",
  "object-fit",
  "aspect-ratio",
  "table-layout",
];

// url( / expression( / javascript: を含む値は落とす（外部リソース読み込み・旧IEのスクリプト実行対策）
const SAFE_STYLE_VALUE = /^(?!.*(?:url\s*\(|expression\s*\(|javascript:|@import))[^<>]*$/i;

const allowedStyles: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": Object.fromEntries(STYLE_PROPERTIES.map((p) => [p, [SAFE_STYLE_VALUE]])),
};

/** 埋め込みを許可する iframe のホスト（YouTube のみ） */
const IFRAME_HOSTS = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"];

const OPTIONS: sanitizeHtml.IOptions = {
  // sanitize-html の既定（見出し・段落・リスト・表・強調・blockquote・code/pre・figure 等）に、
  // 記事で使う画像・取り消し線・折りたたみ・YouTube 埋め込みを加える
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "img",
    "del",
    "ins",
    "details",
    "summary",
    "iframe",
  ],
  allowedAttributes: {
    // id は microCMS が見出しに付ける（目次アンカー）。class/style は週報・エディタが使う
    "*": ["class", "id", "style", "title", "lang", "dir", "data-*", "aria-*"],
    a: ["href", "name", "target", "rel"],
    img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"],
    iframe: [
      "src",
      "width",
      "height",
      "allow",
      "allowfullscreen",
      "frameborder",
      "loading",
      "referrerpolicy",
    ],
    td: ["colspan", "rowspan", "align", "valign"],
    th: ["colspan", "rowspan", "scope", "align", "valign"],
    col: ["span"],
    colgroup: ["span"],
    ol: ["start", "type", "reversed"],
    li: ["value"],
    time: ["datetime"],
    blockquote: ["cite"],
  },
  // javascript: / data: / vbscript: 等は既定で拒否される（href/src/cite に適用）
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {},
  allowProtocolRelative: true,
  allowedIframeHostnames: IFRAME_HOSTS,
  allowIframeRelativeUrls: false,
  allowedStyles,
  // script/style/textarea 等は中身ごと削除（既定 nonTextTags）。それ以外の不許可タグはタグだけ外して中身は残す
  disallowedTagsMode: "discard",
};

/** microCMS 記事本文 HTML を許可リストで無害化する */
export function sanitizeArticleHtml(html: string): string {
  if (!html) return html;
  return sanitizeHtml(html, OPTIONS);
}
