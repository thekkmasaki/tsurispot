/* eslint-disable */
// さかなっち: ツリスポ公式マスコット（サイトの src/components/fun/sakanacchi.tsx と同じデザイン）。
// 特定の魚種ではない丸い小魚。色は海の青1色に固定。2026-11 にウキまるから差し替え。
// expr: smile | wow | wink | think ／ opts: point（ヒレを上げる）, cap（釣り帽）, cls（class名）
function sakanacchi(expr = "smile", opts = {}) {
  const N = "#1f2a33";
  const BODY = "#5aa6dc";
  const BELLY = "#e6f4fc";
  const eye = {
    smile: `<ellipse cx="48" cy="54" rx="6" ry="7.5" fill="${N}"/><circle cx="50" cy="51" r="2.2" fill="#fff"/>`,
    wow: `<ellipse cx="48" cy="54" rx="7" ry="9" fill="${N}"/><circle cx="50.5" cy="50.5" r="2.6" fill="#fff"/>`,
    wink: `<path d="M41 55 Q48 49 55 55" fill="none" stroke="${N}" stroke-width="3.5" stroke-linecap="round"/>`,
    think: `<ellipse cx="48" cy="55" rx="6" ry="5" fill="${N}"/>`,
  }[expr] || "";
  const mouth = {
    smile: `<path d="M24 62 Q28 66 24 70" fill="none" stroke="${N}" stroke-width="2.5" stroke-linecap="round"/>`,
    wow: `<ellipse cx="25" cy="66" rx="3.5" ry="4.5" fill="${N}"/>`,
    wink: `<path d="M24 62 Q29 66 24 70" fill="none" stroke="${N}" stroke-width="2.5" stroke-linecap="round"/>`,
    think: `<path d="M23 66 L28 65" fill="none" stroke="${N}" stroke-width="2.5" stroke-linecap="round"/>`,
  }[expr] || "";
  const fin = opts.point
    ? `<path d="M70 74 Q86 64 92 46" fill="none" stroke="${BODY}" stroke-width="9" stroke-linecap="round"/>`
    : `<path d="M70 78 Q82 84 90 80" fill="none" stroke="#3f8fc8" stroke-width="4" stroke-linecap="round"/>`;
  const cap = opts.cap
    ? `<path d="M40 30 Q66 4 92 26 Z" fill="#10324F"/><path d="M34 30 L98 26 Q104 26 104 31 L36 35Z" fill="#FFC53D" stroke="${N}" stroke-width="2"/>`
    : `<path d="M60 24 Q72 8 86 26" fill="${BODY}"/>`;
  return `<svg viewBox="0 -6 140 126" xmlns="http://www.w3.org/2000/svg" class="${opts.cls || ""}">
  <path d="M100 60 L132 36 Q126 60 132 84 Z" fill="${BODY}"/>
  <ellipse cx="66" cy="60" rx="46" ry="38" fill="${BODY}"/>
  <path d="M30 70 Q66 102 104 68 Q66 84 30 70Z" fill="${BELLY}"/>
  ${cap}
  ${eye}
  <ellipse cx="40" cy="70" rx="6" ry="3.5" fill="#f6a6a0" opacity=".85"/>
  ${mouth}
  <path d="M76 50 Q84 58 76 66" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
  ${fin}
  <path d="M0 112 Q17 104 34 112 T68 112 T102 112 T140 112" fill="none" stroke="#2BA6DE" stroke-width="4" stroke-linecap="round"/>
</svg>`;
}
// 旧名（ウキまる時代の呼び出し）互換
const uki = sakanacchi;
