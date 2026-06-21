// URL→ページタイプ分類。scripts/gsc-triage.mjs の classify() を抽出共通化し、
// 自己改善エージェントの metrics 解析と既存 triage の両方から使えるようにした。
// さらに「編集対象ファイルパスの推定」と「ページタイプ別 affiliate 係数」を追加。

// GSCとGA4でページキーを完全一致させるための単一正規化関数。
// 両者を同じロジックに通さないと、日本語URL(パーセントエンコード差)や末尾スラッシュで
// 同一ページが別エントリに分裂し、収益シグナルがstriking-distanceに載らなくなる(致命的バグ)。
//   - pathname を抽出
//   - decodeURIComponent でパーセントエンコードを必ず復号
//   - クエリ/ハッシュ除去
//   - 末尾スラッシュ除去(ルート '/' は維持)
export function toPathKey(urlOrPath) {
  let p;
  try {
    p = new URL(urlOrPath).pathname;
  } catch {
    p = String(urlOrPath || "/").split("?")[0].split("#")[0];
  }
  try { p = decodeURIComponent(p); } catch { /* 不正エンコードはそのまま */ }
  p = p.replace(/[?#].*$/, "");
  p = p.replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

export function classify(url) {
  let p;
  try { p = new URL(url).pathname; } catch { p = url; }
  const seg = p.split("/").filter(Boolean);
  if (seg.length === 0) return { type: "top", key: "/" };
  const s0 = seg[0];
  if (s0 === "spots") return seg.length >= 2 ? { type: "spot-detail", key: p } : { type: "spots-list", key: "/spots" };
  if (s0 === "prefecture") {
    if (seg.length === 1) return { type: "pref", key: p };
    if (seg.length === 2) return { type: "pref-hub", key: p };
    if (seg[2] === "fish") return { type: "pref-fish", key: p };
    if (seg[2] === "fishing") return { type: "pref-method", key: p };
    if (/^\d/.test(seg[2]) || /(january|february|march|april|may|june|july|august|september|october|november|december)/.test(seg[2]))
      return { type: seg.length >= 4 ? "pref-month-fish" : "pref-month", key: p };
    return { type: "pref-other", key: p };
  }
  if (s0 === "fishing") return { type: "method-area", key: p };
  if (s0 === "monthly") return { type: "monthly", key: p };
  if (s0 === "seasonal") return { type: "seasonal", key: p };
  if (s0 === "fish") return { type: "fish", key: p };
  if (s0 === "area") return { type: "area", key: p };
  if (s0 === "methods") return { type: "methods", key: p };
  if (s0 === "guide") return { type: "guide", key: p };
  if (s0 === "blog") return { type: "blog", key: p };
  if (s0 === "ranking") return { type: "ranking", key: p };
  return { type: `other:${s0}`, key: p };
}

// ページタイプ別アフィリエイト寄与係数(0..1相当の相対値)。
// spot-detail/fish/method はギア導線が強い→高。情報ハブ系は低。
// ROIスコアで「収益に効くページ」を優先するための重み。
const AFFILIATE_COEFF = {
  "spot-detail": 1.0,
  fish: 0.9,
  "pref-fish": 0.85,
  "pref-month-fish": 0.85,
  "method-area": 0.8,
  monthly: 0.6,
  seasonal: 0.6,
  blog: 0.7,
  guide: 0.5,
  "pref-month": 0.5,
  "pref-hub": 0.4,
  pref: 0.4,
  top: 0.3,
};

export function affiliateCoeff(type) {
  return AFFILIATE_COEFF[type] ?? 0.5;
}

// pathname から「編集対象になりうるファイルパス候補」を推定する。
// 自己改善サイクルが『どのファイルを触ればいいか』を素早く見つけるための補助。
export function guessSourcePaths(url) {
  let p;
  try { p = new URL(url).pathname; } catch { p = url; }
  const seg = p.split("/").filter(Boolean);
  const { type } = classify(url);
  const out = [];
  switch (type) {
    case "spot-detail": {
      const slug = seg[1];
      out.push("src/app/spots/[slug]/page.tsx");
      out.push(`src/lib/data/  (slug "${slug}" を含む spots-*.ts を grep)`);
      break;
    }
    case "fish":
      out.push("src/app/fish/[slug]/page.tsx");
      out.push("src/lib/data/fish-sea.ts | fish-freshwater.ts | fish-brackish.ts");
      break;
    case "pref":
    case "pref-hub":
    case "pref-fish":
    case "pref-month":
    case "pref-month-fish":
      out.push(`src/app/prefecture/  (該当ルートの page.tsx)`);
      out.push("src/lib/data/prefectures.ts | prefecture-info.ts");
      break;
    case "method-area":
      out.push("src/app/fishing/[method]/  (該当 page.tsx)");
      break;
    case "blog":
      out.push("src/lib/data/blog-articles-*.ts または microCMS");
      break;
    case "monthly":
    case "seasonal":
      out.push("src/lib/data/monthly-guides.ts");
      out.push(`src/app/${seg[0]}/  (該当 page.tsx)`);
      break;
    default:
      out.push(`src/app${p}/page.tsx (推定)`);
  }
  return out;
}

// 順位帯ごとの期待CTR(おおまかなSEO業界平均ベンチ)。CTRギャップ算出に使う。
const EXPECTED_CTR_BY_POS = [
  [1, 28], [2, 15], [3, 11], [4, 8], [5, 6.5],
  [6, 5], [7, 4], [8, 3.3], [9, 2.8], [10, 2.5],
  [12, 1.9], [15, 1.3], [20, 0.8],
];

export function expectedCtr(position) {
  if (position <= 1) return EXPECTED_CTR_BY_POS[0][1];
  for (let i = 0; i < EXPECTED_CTR_BY_POS.length - 1; i++) {
    const [pa, ca] = EXPECTED_CTR_BY_POS[i];
    const [pb, cb] = EXPECTED_CTR_BY_POS[i + 1];
    if (position >= pa && position <= pb) {
      // 線形補間
      const t = (position - pa) / (pb - pa);
      return ca + (cb - ca) * t;
    }
  }
  return 0.5; // 20位超
}
