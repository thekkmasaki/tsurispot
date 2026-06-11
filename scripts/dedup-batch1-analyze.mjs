// 一時分析スクリプト: coord-sweep-report.json の duplicateSuspects 252ペアを
// 保守的な基準で「自動統合可」と「manual-review」に分類する。
// 使い方: node scripts/dedup-batch1-analyze.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "lib", "data");

const report = JSON.parse(
  fs.readFileSync(path.join(__dirname, "output/coord-sweep-report.json"), "utf8")
);
console.log("report keys:", Object.keys(report));
const dups = report.duplicateSuspects ?? [];
console.log("total duplicateSuspects:", dups.length);

// inland判定セット（waterfront優先の判定材料）
const inlandSet = new Set();
for (const key of ["inlandSuspects", "inlandWeak"]) {
  for (const e of report[key] ?? []) {
    if (e.slug) inlandSet.add(e.slug);
  }
}
console.log("inland-flagged slugs:", inlandSet.size);

// ---- spots-*.ts から spot block を抽出 ----
const files = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.startsWith("spots-") && f.endsWith(".ts"));

/** slug -> { file, name, descLen, fishCount, spotType, blockStart, blockEnd } */
const spotIndex = new Map();

function findEnclosingBlock(content, idx) {
  // idx から後方に走査して、囲んでいる { を見つける（深さ追跡）
  let depth = 0;
  let start = -1;
  for (let i = idx; i >= 0; i--) {
    const c = content[i];
    if (c === "}") depth++;
    else if (c === "{") {
      if (depth === 0) {
        start = i;
        break;
      }
      depth--;
    }
  }
  if (start === -1) return null;
  // start から前方にブレースマッチで終端を探す
  depth = 0;
  for (let i = start; i < content.length; i++) {
    const c = content[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return { start, end: i + 1 };
    }
  }
  return null;
}

for (const file of files) {
  const content = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
  const re = /slug:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const slug = m[1];
    const blk = findEnclosingBlock(content, m.index);
    if (!blk) continue;
    const block = content.slice(blk.start, blk.end);
    if (!/id:\s*["']/.test(block)) continue; // spot block でない
    const descM = block.match(/description:\s*["'`]((?:[^"'`\\]|\\.)*)["'`]/);
    const typeM = block.match(/spotType:\s*["']([^"']+)["']/);
    const nameM = block.match(/name:\s*["']([^"']+)["']/);
    const fishCount = (block.match(/\{\s*fish:/g) || []).length;
    const imgM = block.match(/mainImageUrl:\s*["']([^"']*)["']/);
    spotIndex.set(slug, {
      file,
      name: nameM ? nameM[1] : "",
      descLen: descM ? descM[1].length : 0,
      fishCount,
      spotType: typeM ? typeM[1] : "",
      mainImageUrl: imgM ? imgM[1] : "",
    });
  }
}
console.log("indexed spots:", spotIndex.size);

// ---- 名前正規化 ----
const VARIANTS = [
  [/龍/g, "竜"],
  [/條/g, "条"],
  [/﨑/g, "崎"],
  [/嶋/g, "島"],
  [/濱/g, "浜"],
  [/廣/g, "広"],
];
function normalize(name) {
  let s = name.normalize("NFKC");
  s = s.replace(/[・、,\s()（）「」'’]/g, "");
  for (const [re, to] of VARIANTS) s = s.replace(re, to);
  s = s.replace(/詳細/g, ""); // （詳細）バッチ接尾辞
  return s;
}
// 岬/崎/埼 は同一地物の表記揺れとして扱う（末尾のみ）
function normalizeCape(s) {
  return s.replace(/[岬崎埼]$/u, "崎");
}

// 釣り場の「部位」を表す語（片側にだけ付く場合は別ポイントの可能性 → manual）
// 複数文字の語は「含む」で判定、1文字の方角等は「完全一致」のみで判定
// （「日南」「東かがわ」等の地名を誤検出しないため）
const PART_WORDS_MULTI = [
  "堤防", "防波堤", "波止", "護岸", "サーフ", "河口", "渡船", "渡船場",
  "公園", "緑地", "埠頭", "ふ頭", "岸壁", "突堤", "テトラ", "周辺",
  "白灯台", "赤灯台", "灯台", "海岸", "ビーチ", "フェリー", "マリーナ",
  "漁港", "磯場",
];
const PART_WORDS_EXACT = ["北", "南", "東", "西", "新", "旧", "沖", "奥", "浜", "磯", "港"];
function containsPartWord(leftover) {
  if (PART_WORDS_EXACT.includes(leftover)) return true;
  return PART_WORDS_MULTI.some((w) => leftover.includes(w));
}

// （）内をエイリアス扱いで除去した形（例: 早川港（小田原漁港）→ 早川港）
function stripParen(name) {
  return name.normalize("NFKC").replace(/[（(][^）)]*[）)]/g, "");
}

function matchNames(nameX, nameY) {
  const nX = normalizeCape(normalize(nameX));
  const nY = normalizeCape(normalize(nameY));
  if (nX === nY) return { ok: true, reason: "正規化後 完全一致" };

  // 包含: 片方が市町村プレフィックス付き（例: 日南・油津港 ⊃ 油津港）
  if (nX.endsWith(nY) || nY.endsWith(nX)) {
    const longer = nX.length > nY.length ? nX : nY;
    const shorter = nX.length > nY.length ? nY : nX;
    const leftover = longer.slice(0, longer.length - shorter.length);
    if (leftover.length >= 2 && !containsPartWord(leftover)) {
      return { ok: true, reason: `地名プレフィックス「${leftover}」のみの差` };
    }
    return { ok: false, reason: `プレフィックス「${leftover}」が部位語/短すぎ` };
  }
  if (nX.startsWith(nY) || nY.startsWith(nX)) {
    const longer = nX.length > nY.length ? nX : nY;
    const shorter = nX.length > nY.length ? nY : nX;
    const leftover = longer.slice(shorter.length);
    return { ok: false, reason: `接尾辞「${leftover}」は部位の可能性` };
  }
  return { ok: false, reason: "包含関係なし（表記揺れ以上の差）" };
}

function classifyPair(p) {
  const a = spotIndex.get(p.slugA);
  const b = spotIndex.get(p.slugB);
  if (!a || !b) return { verdict: "manual", reason: "spot not found in data files" };
  if (p.distanceM > 100) return { verdict: "manual", reason: `distance ${p.distanceM}m > 100m` };
  if (a.spotType !== b.spotType)
    return { verdict: "manual", reason: `spotType differs: ${a.spotType} vs ${b.spotType}` };

  // 1) 素の名前同士
  const direct = matchNames(p.nameA, p.nameB);
  if (direct.ok) return { verdict: "auto", reason: direct.reason };

  // 2) （）内エイリアスを除去した形でも試す（例: 早川港（小田原漁港）↔ 小田原早川港）
  const sA = stripParen(p.nameA);
  const sB = stripParen(p.nameB);
  if (sA !== p.nameA.normalize("NFKC") || sB !== p.nameB.normalize("NFKC")) {
    const stripped = matchNames(sA, sB);
    if (stripped.ok) {
      return { verdict: "auto", reason: `（）除去後: ${stripped.reason}` };
    }
  }
  return { verdict: "manual", reason: direct.reason };
}

// ---- 正準の選び方 ----
const BATCH_SUFFIX = /-(add\d*|e\d+|k\d+|w\d+|c\d+|s\d+|n\d+|bulk\d*|detail|v\d+|extra\d*|p\d+|b\d+|x\d+)$/;
function naturalness(slug) {
  let score = 0;
  if (BATCH_SUFFIX.test(slug)) score -= 1;
  return score;
}
function pickCanonical(slugX, slugY) {
  const x = spotIndex.get(slugX);
  const y = spotIndex.get(slugY);
  // 1. description の長さ（明確な差: 30字以上）
  if (x.descLen - y.descLen > 30) return slugX;
  if (y.descLen - x.descLen > 30) return slugY;
  // 2. catchableFish 数
  if (x.fishCount !== y.fishCount) return x.fishCount > y.fishCount ? slugX : slugY;
  // 3. waterfront 判定（inland に入っていない方）
  const xInland = inlandSet.has(slugX);
  const yInland = inlandSet.has(slugY);
  if (xInland !== yInland) return xInland ? slugY : slugX;
  // 4. slug の自然さ
  const nx = naturalness(slugX);
  const ny = naturalness(slugY);
  if (nx !== ny) return nx > ny ? slugX : slugY;
  // 5. description 長で最終判定
  return x.descLen >= y.descLen ? slugX : slugY;
}

// ---- 分類実行 ----
const autoPairs = [];
const manualPairs = [];
for (const p of dups) {
  const cls = classifyPair(p);
  if (cls.verdict === "auto") autoPairs.push({ ...p, reason: cls.reason });
  else manualPairs.push({ ...p, reason: cls.reason });
}

// ---- 3スポット以上のグループを union-find で集約 ----
const parent = new Map();
function find(x) {
  if (!parent.has(x)) parent.set(x, x);
  while (parent.get(x) !== x) {
    parent.set(x, parent.get(parent.get(x)));
    x = parent.get(x);
  }
  return x;
}
function union(a, b) {
  parent.set(find(a), find(b));
}
for (const p of autoPairs) union(p.slugA, p.slugB);

const groups = new Map();
for (const p of autoPairs) {
  const root = find(p.slugA);
  if (!groups.has(root)) groups.set(root, new Set());
  groups.get(root).add(p.slugA);
  groups.get(root).add(p.slugB);
}

const mergePlan = [];
for (const members of groups.values()) {
  const slugs = Array.from(members);
  // 正準をペアワイズ比較で決定
  let canonical = slugs[0];
  for (let i = 1; i < slugs.length; i++) {
    canonical = pickCanonical(canonical, slugs[i]);
  }
  const losers = slugs.filter((s) => s !== canonical);
  mergePlan.push({
    canonical,
    canonicalName: spotIndex.get(canonical).name,
    canonicalFile: spotIndex.get(canonical).file,
    canonicalInfo: spotIndex.get(canonical),
    losers: losers.map((s) => ({
      slug: s,
      name: spotIndex.get(s).name,
      file: spotIndex.get(s).file,
      descLen: spotIndex.get(s).descLen,
      fishCount: spotIndex.get(s).fishCount,
      mainImageUrl: spotIndex.get(s).mainImageUrl,
    })),
  });
}
mergePlan.sort((a, b) => a.canonical.localeCompare(b.canonical));

console.log("\n===== AUTO MERGE PLAN =====");
console.log("auto pairs:", autoPairs.length, "/ groups:", mergePlan.length);
for (const g of mergePlan) {
  const c = g.canonicalInfo;
  console.log(
    `\n正準: ${g.canonicalName} (${g.canonical}) [${c.file}] desc=${c.descLen} fish=${c.fishCount} type=${c.spotType} inland=${inlandSet.has(g.canonical)}`
  );
  for (const l of g.losers) {
    console.log(
      `  ← ${l.name} (${l.slug}) [${l.file}] desc=${l.descLen} fish=${l.fishCount} img=${l.mainImageUrl ? "あり" : "なし"}`
    );
  }
}

console.log("\n===== MANUAL REVIEW =====");
console.log("manual pairs:", manualPairs.length);
const reasonCount = {};
for (const p of manualPairs) {
  const key = p.reason.replace(/「[^」]*」/g, "「…」").replace(/\d+m/, "Nm").replace(/: .*/, "");
  reasonCount[key] = (reasonCount[key] || 0) + 1;
}
console.log(reasonCount);
for (const p of manualPairs) {
  console.log(
    `  ${p.nameA} (${p.slugA}) vs ${p.nameB} (${p.slugB}) ${p.distanceM}m [${p.prefecture}] — ${p.reason}`
  );
}

fs.writeFileSync(
  path.join(__dirname, "output/dedup-batch1-plan.json"),
  JSON.stringify({ mergePlan, manualPairs }, null, 2)
);
console.log("\nplan written to scripts/output/dedup-batch1-plan.json");
