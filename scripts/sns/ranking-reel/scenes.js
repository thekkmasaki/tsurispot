/* eslint-disable */
// 写真が無いスポット用の種別イラスト（ブランド4色・線は紺）
const N = "#10324F", SEA = "#2BA6DE", SKY = "#CDEBFA", SUN = "#FFC53D", RED = "#FF5A4E", SAND = "#F3DDAA";
const wave = (y) => `<path d="M0 ${y} q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>`;
const base = (inner) => `<svg viewBox="0 0 160 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="140" fill="${SKY}"/><circle cx="128" cy="30" r="14" fill="${SUN}"/>${inner}</svg>`;
function scene(type) {
  switch (type) {
    case "堤防": return base(`<rect y="78" width="160" height="62" fill="${SEA}"/>${wave(100)}${wave(122)}
      <path d="M-5 92 L110 82 L110 96 L-5 106Z" fill="#B8C4CE" stroke="${N}" stroke-width="3"/>
      <rect x="112" y="46" width="14" height="44" fill="${RED}" stroke="${N}" stroke-width="3"/><rect x="109" y="40" width="20" height="8" fill="#fff" stroke="${N}" stroke-width="3"/>`);
    case "漁港": return base(`<rect y="84" width="160" height="56" fill="${SEA}"/>${wave(106)}
      <rect x="0" y="76" width="54" height="12" fill="#B8C4CE" stroke="${N}" stroke-width="3"/>
      <path d="M70 92 L130 92 L120 106 L78 106Z" fill="#fff" stroke="${N}" stroke-width="3"/><rect x="90" y="74" width="20" height="18" fill="#fff" stroke="${N}" stroke-width="3"/><line x1="100" y1="74" x2="100" y2="52" stroke="${N}" stroke-width="3"/><path d="M100 54 L114 60 L100 64Z" fill="${RED}"/>`);
    case "河川": return base(`<path d="M0 70 L160 70 L160 140 L0 140Z" fill="#9CCB7B"/><path d="M40 70 Q70 100 30 140 L110 140 Q140 100 90 70Z" fill="${SEA}" stroke="${N}" stroke-width="3"/>${""}<path d="M60 100 q8 -4 16 0" stroke="#fff" stroke-width="3" fill="none"/>`);
    case "磯": return base(`<rect y="84" width="160" height="56" fill="${SEA}"/>${wave(110)}
      <path d="M10 100 L34 66 L58 78 L80 60 L104 96 L110 108 L4 110Z" fill="#8C8076" stroke="${N}" stroke-width="3" stroke-linejoin="round"/>`);
    case "砂浜": case "サーフ": return base(`<rect y="70" width="160" height="40" fill="${SEA}"/>${wave(86)}<path d="M0 104 Q80 94 160 104 L160 140 L0 140Z" fill="${SAND}" stroke="${N}" stroke-width="3"/>`);
    case "桟橋": case "海釣り公園": case "桟橋・海釣り公園": return base(`<rect y="80" width="160" height="60" fill="${SEA}"/>${wave(110)}
      <rect x="-4" y="76" width="130" height="10" fill="#C9A36B" stroke="${N}" stroke-width="3"/>${[20,50,80,110].map(x=>`<rect x="${x}" y="86" width="6" height="30" fill="#8A6A45" stroke="${N}" stroke-width="2"/>`).join("")}
      <line x1="40" y1="60" x2="40" y2="76" stroke="${N}" stroke-width="3"/><line x1="96" y1="60" x2="96" y2="76" stroke="${N}" stroke-width="3"/><line x1="36" y1="62" x2="100" y2="62" stroke="${N}" stroke-width="3"/>`);
    default: return base(`<rect y="84" width="160" height="56" fill="${SEA}"/>${wave(104)}${wave(124)}`);
  }
}
