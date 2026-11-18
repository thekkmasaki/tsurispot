#!/usr/bin/env node
/**
 * 重複統合 第2弾（同一市区町村・500m超）の分類と統合案の作成（2026-11）
 *
 * 入力: scripts/output/spot-dedup-geo.json（spot-dedup-geo.mjs の出力）
 * 方針（保守的）:
 *   - 統合候補にするのは「施設の種類」が同じメンバー同士だけ
 *     （港/漁港は同種、堤防・護岸・岸壁・埠頭は別種、海岸・浜・サーフは別種、磯・岬は別種）
 *   - 以下は要確認に回す: 核名が一般語だけ（漁港/港/海岸 等）・川/湖・区別語（東西/新旧/第n 等）の差・
 *     地名以外の括弧書き（例: 清水港（三保半島））・施設の種類が1件しかないメンバー
 *   - 勝者: 出典付き魚種数 → src内参照数 → 魚種数 → 名称が短い
 *   - 座標: 各メンバー座標を「逆ジオコーダの市区町村が住所と一致」「大字/地区名が核名を含む」
 *     「標高が海際（-2〜15m）」で採点し、勝者の座標が最良でなければ最良メンバーの座標へ差し替える。
 *     どのメンバーも検証を通らなければ座標は変えず「座標要確認」とする。
 * 出力: scripts/output/dedup-wave2-plan.json（merge / review / coordFix）
 *
 * 使い方: node scripts/spot-dedup-wave2.mjs [--exclude-slugs a,b]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const geo = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/output/spot-dedup-geo.json"), "utf8"));

const GENERIC_CORE = /^(漁港|港|新港|海岸|堤防|防波堤|浜|磯|岬|川|河口|湾|公園|埠頭|ふ頭|岸壁|護岸)?$/;

function kind(name) {
  const n = name.normalize("NFKC").replace(/[（(][^）)]*[）)]/g, "");
  if (/(堤防|防波堤|波止|突堤|護岸|岸壁|埠頭|ふ頭|一文字|桟橋|テトラ)/.test(n)) return "structure";
  if (/(海岸|浜|海水浴場|サーフ|ビーチ)$/.test(n)) return "beach";
  if (/(磯|岬|鼻|崎)$/.test(n)) return "rocky";
  if (/(漁港|港)(周辺)?$/.test(n)) return "port";
  return "other";
}

const PREFS = "北海道|青森|岩手|宮城|秋田|山形|福島|茨城|栃木|群馬|埼玉|千葉|東京|神奈川|新潟|富山|石川|福井|山梨|長野|岐阜|静岡|愛知|三重|滋賀|京都|大阪|兵庫|奈良|和歌山|鳥取|島根|岡山|広島|山口|徳島|香川|愛媛|高知|福岡|佐賀|長崎|熊本|大分|宮崎|鹿児島|沖縄".split("|");

// 厳密な正規化名: 接頭辞は「県・市区町村（住所の自治体名）・郡・地域名」だけを外し、
// 接尾辞は 漁港→港・ふ頭→埠頭・海岸/海水浴場/ビーチ・磯/周辺 の表記ゆれだけ吸収する。
// 町内の大字名（例: 女木町）は外さない（女木島港/男木島港の誤結合防止）。
function strictName(m) {
  let n = m.name.normalize("NFKC").replace(/[（(][^）)]*[）)]/g, "").replace(/\s+/g, "");
  if (n.includes("・")) n = n.split("・").pop();
  const addr = (m.address || "").normalize("NFKC");
  const gun = (addr.match(/(?:都|道|府|県)([^0-9市]+?)郡/) || [])[1];
  const pre = new Set();
  for (const p of PREFS) pre.add(p + "県").add(p + "府").add(p + "都").add(p);
  if (m.addrMuni) pre.add(m.addrMuni).add(m.addrMuni.replace(/(市|町|村|区)$/, ""));
  if (gun) pre.add(gun + "郡").add(gun);
  if (m.area) pre.add(m.area.normalize("NFKC"));
  for (const extra of ["天草", "佐渡", "対馬", "壱岐", "五島", "小豆島", "淡路島", "淡路", "知多半島", "知多", "牡鹿半島", "房総", "南房総", "伊豆", "西伊豆", "東伊豆", "南伊豆", "宮古島", "石垣島", "石垣"]) pre.add(extra);
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of [...pre].sort((a, b) => b.length - a.length)) {
      if (p.length >= 2 && n.startsWith(p) && n.length - p.length >= 2) {
        n = n.slice(p.length);
        changed = true;
      }
    }
  }
  n = n.replace(/漁港$/, "港").replace(/港周辺$/, "港").replace(/ふ頭/g, "埠頭");
  n = n.replace(/サーフ$/, "").replace(/(海岸|海水浴場|ビーチ)$/, "");
  n = n.replace(/(周辺)?磯$/, "").replace(/周辺$/, "");
  return n.replace(/﨑/g, "崎").replace(/嶋/g, "島").replace(/ヶ/g, "ケ");
}

function qualifierOk(m) {
  const qs = [...m.name.normalize("NFKC").matchAll(/[（(]([^）)]*)[）)]/g)].map((x) => x[1]);
  // 括弧書きが市区町村名・地域名（＝場所の補足）なら同一施設として扱える
  return qs.every((q) => (m.addrMuni && (q.includes(m.addrMuni.replace(/(市|町|村|区)$/, "")) || m.addrMuni.includes(q))) || (m.area && m.area.includes(q)));
}

// src 内の参照数（勝者選定用）
const texts = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "__tests__" && e.name !== "generated") walk(p);
    } else if (/\.(ts|tsx|json)$/.test(e.name)) texts.push(fs.readFileSync(p, "utf8"));
  }
})(path.join(ROOT, "src"));
const all = texts.join("\n");
const refs = (slug) => {
  const n = (all.match(new RegExp(`["'/]${slug}["'/?#\`]`, "g")) || []).length;
  const defs = (all.match(new RegExp(`slug:\\s*"${slug}"`, "g")) || []).length;
  return Math.max(0, n - defs);
};

function coordScore(m, core) {
  let s = 0;
  if (m.muniOk) s += 2;
  if (m.rev?.lv01 && core && (m.rev.lv01.includes(core) || core.includes(m.rev.lv01))) s += 2;
  if (typeof m.elev === "number" && m.elev >= -2 && m.elev <= 15) s += 1;
  return s;
}
const precise = (v) => (String(v).split(".")[1] || "").length;

// 目視レビューで統合対象から外したもの（slug → 理由）
const EXCLUDE = new Map([
  ["hitachi-port", "日立港と日立会瀬港は別の港"],
  ["hitachi-ko-aise", "名称が日立港と会瀬港の混同（どちらの地点か要確認）"],
  ["mitsuhama-gyokou-a9", "三津浜港（旅客港）と三津浜漁港は隣接する別区画の可能性（第1弾から継続）"],
  ["kameura-gyokou-a12", "住所が瀬戸町堂浦（鳴門町土佐泊浦の亀浦港とは別地区の可能性）"],
  ["kitadomari-gyokou-tokushima", "北泊の住所が北灘町と里浦町で食い違う"],
  ["naruto-kitatomari-c8", "北泊の住所が北灘町と里浦町で食い違う"],
  ["natori-yuriage-gyokou-e8", "UGC釣果2件あり。統合先 yuriage-port（striking-spots）へ寄せるにはDB移行が必要なため保留"],
]);

// DB（SPOT#<slug>）に UGC 釣果投稿・開拓者記録がある slug。DB を書き換えずに投稿を表示し続けるため
// 統合先として残す（scripts/output/ の DynamoDB 確認結果より）。
// ※ natori-yuriage-gyokou-e8（UGC 2件）は統合先 yuriage-port が striking-spots（検索上位候補）のため
//   統合先を変えず、UGC は DB 移行の要否として報告する。
const PREFER = new Set(["morozaki-port"]);

const plan = { merge: [], review: [], coordUnverified: [] };
for (const g of geo) {
  const reason = [];
  const facilityOnly = g.core.replace(/(漁港|新港|港|沖|堤防|防波堤|波止|海岸|浜|磯|岬|河口|川|湾|公園|埠頭|ふ頭|岸壁|護岸|内|外|東|西|南|北)/g, "") === "";
  if (GENERIC_CORE.test(g.core) || g.core.length < 2 || facilityOnly) reason.push("核名が一般語のみ（別施設の誤検出の可能性）");
  if (g.members.some((m) => m.spotType === "river" || m.spotType === "lake")) reason.push("川・湖（区間違いの可能性）");
  if (g.flags.includes("distinguisher-differs")) reason.push("区別語（東西/新旧/第n 等）の差");
  if (reason.length) {
    plan.review.push({ core: g.core, prefecture: g.prefecture, slugs: g.members.map((m) => `${m.slug}（${m.name}）`), reason: reason.join("・") });
    continue;
  }
  const byKind = new Map();
  for (const m of g.members) {
    // 統合単位は「正規化名が完全一致」するメンバー同士（施設の種類も名前に含まれる）
    const k = qualifierOk(m) ? `${kind(m.name)}:${strictName(m)}` : `q:${m.slug}`;
    if (!byKind.has(k)) byKind.set(k, []);
    byKind.get(k).push(m);
  }
  for (const [k, msAll] of byKind) {
    const ms = msAll.filter((m) => !EXCLUDE.has(m.slug));
    for (const m of msAll.filter((m) => EXCLUDE.has(m.slug))) {
      plan.review.push({ core: g.core, prefecture: g.prefecture, slugs: [`${m.slug}（${m.name}）`], reason: EXCLUDE.get(m.slug) });
    }
    if (ms.length < 2 || k.startsWith("other:") || k.startsWith("q:")) {
      plan.review.push({
        core: g.core,
        prefecture: g.prefecture,
        slugs: ms.map((m) => `${m.slug}（${m.name}）`),
        reason: k.startsWith("q:")
          ? "地名以外の括弧書き（別区画の可能性）"
          : k.startsWith("other:")
            ? "施設の種類を判別できない"
            : "正規化名が一致しない（港と堤防・海岸、別地区名など）",
      });
      continue;
    }
    const ranked = ms
      .map((m) => ({ ...m, refs: refs(m.slug), quoted: all.includes(`「${m.name}」`) ? 1 : 0, cs: coordScore(m, g.core) }))
      // 県概要などの本文が「名称」で引用しているメンバーを最優先（引用先が消えると本文が宙に浮く）
      .sort((a, b) => (PREFER.has(b.slug) ? 1 : 0) - (PREFER.has(a.slug) ? 1 : 0) || b.quoted - a.quoted || b.sourced - a.sourced || b.refs - a.refs || b.fish - a.fish || a.name.length - b.name.length);
    const [w, ...losers] = ranked;
    const bestCoord = [...ranked].sort((a, b) => b.cs - a.cs || precise(b.lat) - precise(a.lat))[0];
    let coord = null;
    if (bestCoord.cs >= 5 && bestCoord.slug !== w.slug && w.cs < bestCoord.cs) {
      coord = { lat: bestCoord.lat, lng: bestCoord.lng, from: bestCoord.slug, old: [w.lat, w.lng], why: `${bestCoord.rev.muni}${bestCoord.rev.lv01}・標高${bestCoord.elev}m` };
    }
    if (Math.max(...ranked.map((m) => m.cs)) < 4) {
      plan.coordUnverified.push({ winner: w.slug, name: w.name, members: ranked.map((m) => `${m.slug}:${m.lat},${m.lng}(score${m.cs})`) });
    }
    plan.merge.push({
      core: g.core,
      prefecture: g.prefecture,
      kind: k,
      maxKm: g.maxKm,
      winner: w.slug,
      winnerName: w.name,
      losers: losers.map((l) => ({ slug: l.slug, name: l.name })),
      coord,
      conflicts: losers.filter((l) => l.hasToilet !== w.hasToilet).map((l) => `トイレ(${w.slug}=${w.hasToilet}/${l.slug}=${l.hasToilet})`),
    });
  }
}
fs.writeFileSync(path.join(ROOT, "scripts/output/dedup-wave2-plan.json"), JSON.stringify(plan, null, 2));
const losers = plan.merge.reduce((n, g) => n + g.losers.length, 0);
console.log(`merge groups=${plan.merge.length} losers=${losers} coordFix=${plan.merge.filter((g) => g.coord).length} coordUnverified=${plan.coordUnverified.length} review=${plan.review.length}`);
