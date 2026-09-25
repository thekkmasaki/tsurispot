/* eslint-disable */
// ウキまる: 玉ウキがモチーフのツリスポ公式マスコット
function uki(expr = "smile", opts = {}) {
  const N = "#10324F";
  const faces = {
    smile: `<ellipse cx="74" cy="170" rx="8" ry="11" fill="${N}"/><ellipse cx="126" cy="170" rx="8" ry="11" fill="${N}"/>
      <circle cx="77" cy="165" r="3" fill="#fff"/><circle cx="129" cy="165" r="3" fill="#fff"/>
      <path d="M88 190 Q100 204 112 190" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round"/>`,
    wow: `<path d="M62 172 L74 164 L86 172" fill="none" stroke="${N}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M114 172 L126 164 L138 172" fill="none" stroke="${N}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M86 186 Q100 188 114 186 Q112 208 100 208 Q88 208 86 186Z" fill="${N}"/><path d="M92 200 Q100 196 108 200 Q104 207 100 207 Q96 207 92 200Z" fill="#FF8F85"/>`,
    wink: `<path d="M64 170 Q74 162 84 170" fill="none" stroke="${N}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="126" cy="170" rx="8" ry="11" fill="${N}"/><circle cx="129" cy="165" r="3" fill="#fff"/>
      <path d="M88 190 Q100 204 112 190" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round"/>`,
    think: `<ellipse cx="74" cy="170" rx="8" ry="8" fill="${N}"/><ellipse cx="126" cy="170" rx="8" ry="8" fill="${N}"/>
      <path d="M90 194 L110 192" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round"/>`,
  };
  const armL = opts.point ? `<path d="M28 150 Q8 120 14 96" fill="none" stroke="${N}" stroke-width="7" stroke-linecap="round"/><circle cx="14" cy="92" r="8" fill="#fff" stroke="${N}" stroke-width="5"/>`
                          : `<path d="M26 160 Q10 170 12 186" fill="none" stroke="${N}" stroke-width="7" stroke-linecap="round"/>`;
  const armR = opts.rod ? `<path d="M174 160 Q188 158 194 146" fill="none" stroke="${N}" stroke-width="7" stroke-linecap="round"/><line x1="196" y1="150" x2="238" y2="30" stroke="#8A5A2B" stroke-width="6" stroke-linecap="round"/><path d="M238 30 Q250 90 246 150" fill="none" stroke="${N}" stroke-width="2" stroke-dasharray="4 4"/>`
                        : `<path d="M174 160 Q190 170 188 186" fill="none" stroke="${N}" stroke-width="7" stroke-linecap="round"/>`;
  const cap = opts.cap ? `<path d="M46 92 Q100 44 154 92 Z" fill="#10324F"/><path d="M40 92 L168 92 Q176 92 176 99 L176 100 L40 100Z" fill="#FFC53D" stroke="${N}" stroke-width="4"/><circle cx="100" cy="72" r="7" fill="#FFC53D"/>` : "";
  const id = "c" + Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="-10 0 270 245" xmlns="http://www.w3.org/2000/svg" class="${opts.cls || ""}">
  <clipPath id="${id}"><ellipse cx="100" cy="148" rx="78" ry="82"/></clipPath>
  ${armL}${armR}
  ${opts.cap ? "" : `<rect x="95" y="6" width="10" height="62" rx="5" fill="#FFC53D" stroke="${N}" stroke-width="5"/><circle cx="100" cy="12" r="10" fill="#FF5A4E" stroke="${N}" stroke-width="5"/>`}
  <g clip-path="url(#${id})"><rect x="0" y="50" width="200" height="200" fill="#fff"/><rect x="0" y="50" width="200" height="92" fill="#FF5A4E"/></g>
  <ellipse cx="100" cy="148" rx="78" ry="82" fill="none" stroke="${N}" stroke-width="6"/>
  <path d="M23 140 Q100 128 177 140" fill="none" stroke="${N}" stroke-width="5"/>
  <ellipse cx="60" cy="98" rx="11" ry="18" fill="#fff" opacity=".6" transform="rotate(-28 60 98)"/>
  ${cap}
  <ellipse cx="54" cy="192" rx="11" ry="7" fill="#FF8F85" opacity=".75"/><ellipse cx="146" cy="192" rx="11" ry="7" fill="#FF8F85" opacity=".75"/>
  ${faces[expr]}
  <path d="M4 234 Q26 224 48 234 T92 234 T136 234 T196 234" fill="none" stroke="#2BA6DE" stroke-width="6" stroke-linecap="round"/>
</svg>`;
}
