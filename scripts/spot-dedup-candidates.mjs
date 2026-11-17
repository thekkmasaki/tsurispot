#!/usr/bin/env node
/**
 * 重複スポット候補の全国洗い出し（2026-11）
 *
 * deduplicateSpots()（spots.ts Pass1-4）適用後に「まだ生存している」スポット同士で、
 *   (a) 座標が近接（既定 500m 以内）かつ
 *   (b) 名称の核（漁港/港/堤防/海岸 等の接尾辞・地域接頭辞・括弧を除いた部分）が一致
 * するものをグループ化して出力する。判定（同一施設 / 別施設 / 要確認）は人手で行う前提で、
 * 機械的には「区別語（東/西/新/旧/第一/○号 等）の差」があるものを要確認として印付けする。
 *
 * 使い方:
 *   node scripts/spot-dedup-candidates.mjs [--km 0.5] [--out scripts/output/spot-dedup-candidates.json]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const ROOT = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const argVal = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const MAX_KM = Number(argVal("--km", "0.5"));
const SAME_CITY = args.includes("--same-city");
const OUT = path.resolve(
  ROOT,
  argVal("--out", SAME_CITY ? "scripts/output/spot-dedup-candidates-same-city.json" : "scripts/output/spot-dedup-candidates.json"),
);

// 住所から市区町村（郡は除き、政令市は市まで）を取り出す
function municipality(spot) {
  const addr = (spot.address || "").normalize("NFKC").replace(/〒?\d{3}-?\d{4}/, "").replace(/\s/g, "");
  const m = addr.match(/(?:都|道|府|県)(?:[^0-9市郡]+郡)?([^0-9市区町村郡]+?(?:市|区|町|村))/);
  return m ? m[1] : "";
}

async function loadRuntimeData() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tsurispot-dupcand-"));
  const outfile = path.join(tmpDir, "bundle.mjs");
  try {
    await build({
      stdin: {
        contents: `export { fishingSpots } from './src/lib/data/spots';
                   export { allRawSpots } from './src/lib/data/spots-registry';`,
        resolveDir: ROOT,
        loader: "ts",
      },
      bundle: true,
      format: "esm",
      platform: "node",
      tsconfig: path.join(ROOT, "tsconfig.json"),
      outfile,
      logLevel: "error",
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

const PREFS = [
  "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島", "茨城", "栃木", "群馬", "埼玉", "千葉", "東京",
  "神奈川", "新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜", "静岡", "愛知", "三重", "滋賀", "京都",
  "大阪", "兵庫", "奈良", "和歌山", "鳥取", "島根", "岡山", "広島", "山口", "徳島", "香川", "愛媛", "高知",
  "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄",
];

// 施設種別を表す一般接尾辞（長いものから順に除去）。
const SUFFIXES = [
  "海釣り公園", "海づり公園", "釣り公園", "海釣り施設", "海づり施設", "釣り桟橋", "海浜公園", "臨海公園",
  "海水浴場", "フィッシングパーク", "フィッシングピア", "漁港周辺", "港周辺", "周辺",
  "沖防波堤", "沖堤防", "防波堤", "堤防", "波止場", "波止", "突堤", "一文字", "テトラ帯", "テトラ",
  "埠頭", "ふ頭", "岸壁", "護岸", "緑地", "公園", "海岸", "海浜", "浜辺", "磯", "地磯", "サーフ", "ビーチ",
  "漁港", "新港", "港", "釣り場", "釣場", "エリア",
];

// これらが一方にだけ/異なって含まれる場合は「別区画」の可能性 → 要確認
const DISTINGUISHERS = /(東|西|南|北|新|旧|内|外|沖|大|小|上|下|第[一二三四五六七八九十0-9]+|[0-9０-９]+号|一号|二号|三号|赤灯|白灯|赤灯台|白灯台|先端|付け根|本港|分港|河口|左岸|右岸)/g;

function nfkc(s) {
  return s.normalize("NFKC");
}

function splitBracket(name) {
  const quals = [];
  const base = nfkc(name).replace(/[（(]([^）)]*)[）)]/g, (_, q) => {
    quals.push(q);
    return "";
  });
  return { base, quals };
}

function coreName(name, spot) {
  let { base, quals } = splitBracket(name);
  let n = base.replace(/[・、,，\s「」'’〜~-]/g, "");
  n = n.replace(/﨑/g, "崎").replace(/嶋/g, "島").replace(/濱/g, "浜").replace(/づり/g, "釣り").replace(/つり/g, "釣り");
  n = n.replace(/詳細$/, "");
  // 地域接頭辞: 県名・市区町村名（住所/地域名から）
  const prefixes = new Set(PREFS.flatMap((p) => [p + "県", p + "府", p + "都", p]));
  const addr = nfkc(spot.address || "");
  const m = addr.match(/(?:都|道|府|県)((?:[^0-9０-９市郡区町村]+(?:市|郡|区|町|村)){1,3})/);
  if (m) {
    const city = m[1];
    for (const part of city.split(/(?<=市|郡|区|町|村)/)) {
      if (part.length >= 2) {
        prefixes.add(part);
        prefixes.add(part.replace(/(市|郡|区|町|村)$/, ""));
      }
    }
  }
  if (spot.region?.areaName) prefixes.add(nfkc(spot.region.areaName));
  if (spot.region?.prefecture) prefixes.add(nfkc(spot.region.prefecture));
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of [...prefixes].sort((a, b) => b.length - a.length)) {
      if (p.length >= 2 && n.startsWith(p) && n.length - p.length >= 2) {
        n = n.slice(p.length);
        changed = true;
      }
    }
  }
  const stripped = [];
  changed = true;
  while (changed) {
    changed = false;
    for (const s of SUFFIXES) {
      if (n.endsWith(s) && n.length - s.length >= 2) {
        n = n.slice(0, -s.length);
        stripped.push(s);
        changed = true;
        break;
      }
    }
  }
  return { core: n, quals, stripped };
}

function km(a, b) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function distinguishers(name) {
  const { base, quals } = splitBracket(name);
  const all = [base, ...quals].join("|");
  return new Set(all.match(DISTINGUISHERS) || []);
}

const { fishingSpots, allRawSpots } = await loadRuntimeData();
const fileOf = new Map();
for (const s of allRawSpots) if (!fileOf.has(s.slug)) fileOf.set(s.slug, s._file || "");

const info = fishingSpots.map((s) => ({ s, ...coreName(s.name, s) }));
// 核名でバケット化
const byCore = new Map();
for (const it of info) {
  if (it.core.length < 2) continue;
  const k = it.core;
  if (!byCore.has(k)) byCore.set(k, []);
  byCore.get(k).push(it);
}

// Union-Find で近接ペアをグループ化
const parent = new Map();
const find = (x) => (parent.get(x) === x ? x : (parent.set(x, find(parent.get(x))), parent.get(x)));
const union = (a, b) => parent.set(find(a), find(b));
const pairs = [];
for (const list of byCore.values()) {
  if (list.length < 2) continue;
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (a.s.region.prefecture !== b.s.region.prefecture) continue;
      const d = km(a.s, b.s);
      if (SAME_CITY) {
        // 座標誤りの重複は近接判定で漏れるため、同一市区町村（住所）なら距離不問で候補にする
        const ca = municipality(a.s), cb = municipality(b.s);
        if (!ca || ca !== cb) continue;
      } else if (d > MAX_KM) continue;
      for (const x of [a.s.slug, b.s.slug]) if (!parent.has(x)) parent.set(x, x);
      union(a.s.slug, b.s.slug);
      pairs.push({ a: a.s.slug, b: b.s.slug, km: Number(d.toFixed(3)) });
    }
  }
}

const bySlug = new Map(info.map((it) => [it.s.slug, it]));
const groups = new Map();
for (const slug of parent.keys()) {
  const r = find(slug);
  if (!groups.has(r)) groups.set(r, []);
  groups.get(r).push(slug);
}

const out = [];
for (const slugs of groups.values()) {
  const members = slugs.map((slug) => {
    const it = bySlug.get(slug);
    const s = it.s;
    return {
      slug,
      name: s.name,
      core: it.core,
      prefecture: s.region.prefecture,
      area: s.region.areaName,
      address: s.address,
      lat: s.latitude,
      lng: s.longitude,
      spotType: s.spotType,
      fish: s.catchableFish.length,
      sourced: s.catchableFish.filter((c) => c.source).length,
      descLen: (s.description || "").length,
      hasToilet: s.hasToilet,
      hasParking: s.hasParking,
      file: fileOf.get(slug) || "",
      dist: [...distinguishers(s.name)],
    };
  });
  const distSets = members.map((m) => m.dist.sort().join(","));
  const distDiffer = new Set(distSets).size > 1;
  const typeDiffer = new Set(members.map((m) => m.spotType)).size > 1;
  const maxKm = Math.max(
    ...pairs.filter((p) => slugs.includes(p.a) && slugs.includes(p.b)).map((p) => p.km),
  );
  out.push({
    core: members[0].core,
    prefecture: members[0].prefecture,
    size: members.length,
    maxKm,
    flags: [distDiffer && "distinguisher-differs", typeDiffer && "spotType-differs"].filter(Boolean),
    members,
  });
}
out.sort((a, b) => a.prefecture.localeCompare(b.prefecture) || a.core.localeCompare(b.core));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), maxKm: MAX_KM, live: fishingSpots.length, groups: out }, null, 2));
const flagged = out.filter((g) => g.flags.length).length;
console.log(`live spots: ${fishingSpots.length}`);
console.log(`candidate groups: ${out.length} (members ${out.reduce((n, g) => n + g.size, 0)}) / flagged: ${flagged}`);
console.log(`written: ${path.relative(ROOT, OUT)}`);
