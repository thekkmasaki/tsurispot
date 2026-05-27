#!/usr/bin/env node
/**
 * fetch-osm.mjs — OpenStreetMap Overpass API でスポット候補を取得する。
 *
 * 漁港・防波堤・釣り場アノテーションを Overpass QL で問い合わせ、
 * 緯度経度と name タグを抽出する。住所補完は fetch-gsi.mjs で行う。
 *
 * Overpass はパブリックエンドポイントを使用。レート制限が厳しいので
 * 1リクエスト = 1都道府県、5秒スリープを挟む。
 *
 * Usage:
 *   node scripts/spot-generator/fetch-osm.mjs \
 *     --prefecture=福井県 \
 *     --out=/tmp/spotgen/{run-id}/osm-fukui.json \
 *     [--limit=500]
 *
 * 出力: JSON 配列
 *   [{ name, lat, lng, prefecture, osm_id, raw_tags }, ...]
 */

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

// 都道府県 → 英語名 + ISO3166-2 サブコード（Overpass area で使う）
const PREF_TO_ISO = {
  北海道: "JP-01", 青森県: "JP-02", 岩手県: "JP-03", 宮城県: "JP-04",
  秋田県: "JP-05", 山形県: "JP-06", 福島県: "JP-07",
  茨城県: "JP-08", 栃木県: "JP-09", 群馬県: "JP-10", 埼玉県: "JP-11",
  千葉県: "JP-12", 東京都: "JP-13", 神奈川県: "JP-14",
  新潟県: "JP-15", 富山県: "JP-16", 石川県: "JP-17", 福井県: "JP-18",
  山梨県: "JP-19", 長野県: "JP-20",
  岐阜県: "JP-21", 静岡県: "JP-22", 愛知県: "JP-23", 三重県: "JP-24",
  滋賀県: "JP-25", 京都府: "JP-26", 大阪府: "JP-27", 兵庫県: "JP-28",
  奈良県: "JP-29", 和歌山県: "JP-30",
  鳥取県: "JP-31", 島根県: "JP-32", 岡山県: "JP-33", 広島県: "JP-34", 山口県: "JP-35",
  徳島県: "JP-36", 香川県: "JP-37", 愛媛県: "JP-38", 高知県: "JP-39",
  福岡県: "JP-40", 佐賀県: "JP-41", 長崎県: "JP-42", 熊本県: "JP-43",
  大分県: "JP-44", 宮崎県: "JP-45", 鹿児島県: "JP-46", 沖縄県: "JP-47",
};

function buildQuery(prefecture, limit) {
  const iso = PREF_TO_ISO[prefecture];
  if (!iso) throw new Error(`unknown prefecture: ${prefecture}`);
  // 漁港 (harbour=fishing)、釣り場 (leisure=fishing)、防波堤・突堤を狙う
  return `
[out:json][timeout:60];
area["ISO3166-2"="${iso}"]->.searchArea;
(
  node["harbour"="fishing"](area.searchArea);
  node["leisure"="fishing"](area.searchArea);
  way["harbour"="fishing"](area.searchArea);
  way["man_made"="breakwater"](area.searchArea);
  way["man_made"="pier"](area.searchArea);
);
out tags center ${limit};
`.trim();
}

async function tryEndpoint(endpoint, query) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "tsurispot-spot-generator/0.1 (https://tsurispot.com)",
    },
    body: new URLSearchParams({ data: query }).toString(),
  });
  if (!res.ok) {
    throw new Error(`overpass ${endpoint} returned ${res.status}`);
  }
  return res.json();
}

async function fetchWithFailover(query) {
  let lastErr;
  for (const ep of OVERPASS_ENDPOINTS) {
    try {
      return await tryEndpoint(ep, query);
    } catch (e) {
      lastErr = e;
      console.error(`endpoint failed: ${ep} -> ${e.message}, retry next`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw lastErr;
}

function normalize(elements, prefecture) {
  const out = [];
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const tags = el.tags ?? {};
    const name = tags["name:ja"] ?? tags.name ?? tags["name:en"];
    if (!lat || !lng || !name) continue;
    out.push({
      name,
      lat,
      lng,
      prefecture,
      osm_id: `${el.type}/${el.id}`,
      raw_tags: tags,
    });
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.prefecture || !args.out) {
    console.error("usage: fetch-osm.mjs --prefecture=<jp> --out=<path> [--limit=500]");
    process.exit(1);
  }
  const limit = Number(args.limit ?? 500);
  const query = buildQuery(args.prefecture, limit);

  console.error(`[osm] querying ${args.prefecture} (limit=${limit})...`);
  const data = await fetchWithFailover(query);
  const normalized = normalize(data.elements ?? [], args.prefecture);

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(normalized, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: true, count: normalized.length, out: args.out }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
