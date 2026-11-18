#!/usr/bin/env node
/**
 * 重複候補（同一市区町村モード）の座標検証（2026-11 第2弾）
 *
 * spot-dedup-candidates.mjs --same-city の出力で 500m 超離れているグループについて、
 *   1. 各メンバー座標を地理院の逆ジオコーダで市区町村に変換し、住所の市区町村と一致するか
 *   2. メンバー名（地域接頭辞を除いた名称）＋市区町村で OSM Nominatim を検索した参照座標
 *   3. 参照座標との距離
 * を求めて JSON に書き出す。外部APIの結果は scripts/output/geo-cache.json にキャッシュ（再開可能）。
 * Nominatim の利用規約に従い 1.1 秒間隔で問い合わせる。
 *
 * 使い方:
 *   node scripts/spot-dedup-geo.mjs --muni <地理院 muni.js のパス> [--pref 静岡県] [--limit 200]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const argVal = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const MUNI = argVal("--muni");
const PREF = argVal("--pref");
const LIMIT = Number(argVal("--limit", "100000"));
// OSM 参照は日本の漁港名のヒット率が低く遅い（1.1秒/件）ため、省略可能にする
const NO_OSM = args.includes("--no-osm");
const CAND = path.join(ROOT, "scripts/output/spot-dedup-candidates-same-city.json");
const CACHE = path.join(ROOT, "scripts/output/geo-cache.json");
const OUT = path.join(ROOT, "scripts/output/spot-dedup-geo.json");
const UA = "Mozilla/5.0 (tsurispot.com spot coordinate QA; dev@tsurispot.jp)";

// muni.js: GSI.MUNI_ARRAY["22208"] = '22,静岡県,22208,伊東市';
const muniName = new Map();
for (const m of fs.readFileSync(MUNI, "utf8").matchAll(/MUNI_ARRAY\["(\d+)"\]\s*=\s*'(\d+),([^,]+),(\d+),([^']+)'/g)) {
  muniName.set(String(Number(m[1])), { pref: m[3], name: m[5].replace(/\s/g, "") });
}

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
let dirty = 0;
const save = () => fs.writeFileSync(CACHE, JSON.stringify(cache));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ja" } });
      if (res.ok) return await res.json();
    } catch {}
    await sleep(3000);
  }
  return null;
}

async function reverse(lat, lng) {
  const k = `rev:${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (!(k in cache)) {
    const j = await getJson(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`);
    const cd = j?.results?.muniCd;
    const mu = cd ? muniName.get(String(Number(cd))) : null;
    cache[k] = mu ? { pref: mu.pref, muni: mu.name, lv01: j.results.lv01Nm } : null; // null=海上など
    dirty++;
    await sleep(200);
  }
  return cache[k];
}

async function search(q) {
  const k = `nom:${q}`;
  if (!(k in cache)) {
    const j = await getJson(
      `https://nominatim.openstreetmap.org/search?format=json&limit=3&countrycodes=jp&q=${encodeURIComponent(q)}`,
    );
    cache[k] = (j || []).map((r) => ({ lat: +r.lat, lng: +r.lon, cls: r.class, type: r.type, name: r.name, disp: r.display_name }));
    dirty++;
    await sleep(1100);
  }
  return cache[k];
}

// 港・海岸の位置の参照にならない地物（学校・バス停・駅・役所など）
const REJECT_CLASS = new Set(["amenity", "highway", "railway", "building", "shop", "office", "boundary", "craft", "healthcare", "emergency"]);

async function elevation(lat, lng) {
  const k = `elev:${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (!(k in cache)) {
    const j = await getJson(
      `https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon=${lng}&lat=${lat}&outtype=JSON`,
    );
    cache[k] = j && typeof j.elevation === "number" ? j.elevation : null; // null=海上など
    dirty++;
    await sleep(150);
  }
  return cache[k];
}

function km(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function addrMuni(address) {
  const a = (address || "").normalize("NFKC").replace(/〒?\d{3}-?\d{4}/, "").replace(/\s/g, "");
  const m = a.match(/(?:都|道|府|県)(?:[^0-9市郡]+郡)?([^0-9市区町村郡]+?(?:市|区|町|村))/);
  return m ? m[1] : "";
}

function bareName(name) {
  // 「伊方町・三崎漁港」→「三崎漁港」、括弧書き除去
  let n = name.normalize("NFKC").replace(/[（(][^）)]*[）)]/g, "");
  if (n.includes("・")) n = n.split("・").pop();
  return n.replace(/\s+/g, "");
}

const cand = JSON.parse(fs.readFileSync(CAND, "utf8"));
let groups = cand.groups.filter((g) => g.maxKm > 0.5);
if (PREF) groups = groups.filter((g) => g.prefecture === PREF);
groups = groups.slice(0, LIMIT);

const out = [];
let n = 0;
for (const g of groups) {
  const members = [];
  for (const m of g.members) {
    const rev = await reverse(m.lat, m.lng);
    const am = addrMuni(m.address);
    const muniOk = !!rev && !!am && (rev.muni.includes(am) || am.includes(rev.muni.replace(/^.+?[市郡]/, "")));
    members.push({ ...m, addrMuni: am, rev, muniOk });
  }
  // 参照座標: 名称バリエーション＋市区町村で検索し、住所市区町村と一致する最初の結果
  const am = members.find((m) => m.addrMuni)?.addrMuni || "";
  const refs = [];
  const qs = new Set();
  for (const m of members) {
    const b = bareName(m.name);
    qs.add(b);
    // 港⇔漁港 の両表記で引く
    if (/漁港$/.test(b)) qs.add(b.replace(/漁港$/, "港"));
    else if (/港$/.test(b)) qs.add(b.replace(/港$/, "漁港"));
  }
  for (const q of NO_OSM ? [] : qs) {
    for (const r of await search(q)) {
      if (!r.disp.includes(am)) continue;
      if (REJECT_CLASS.has(r.cls)) continue;
      refs.push({ q, ...r, rank: (r.name || "").includes(g.core) ? 0 : 1 });
    }
  }
  refs.sort((a, b) => a.rank - b.rank);
  const ref = refs[0] || null;
  for (const m of members) m.elev = await elevation(m.lat, m.lng);
  for (const m of members) m.refKm = ref ? Number(km({ lat: m.lat, lng: m.lng }, ref).toFixed(2)) : null;
  out.push({ ...g, refs: refs.slice(0, 3), members });
  if (dirty > 20) { save(); dirty = 0; }
  if (++n % 20 === 0) console.log(`${n}/${groups.length}`);
}
save();
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`groups=${out.length} written ${path.relative(ROOT, OUT)}`);
