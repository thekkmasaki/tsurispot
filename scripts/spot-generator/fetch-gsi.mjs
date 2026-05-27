#!/usr/bin/env node
/**
 * fetch-gsi.mjs — 国土地理院の reverse-geocoding API で住所を補完する。
 *
 * 入力 JSON 配列（各要素は lat/lng 必須）に address フィールドを足して返す。
 * 国土地理院 API は無料・キー不要だが、1秒1リクエスト相当のペースに抑える。
 *
 * Usage:
 *   node scripts/spot-generator/fetch-gsi.mjs \
 *     --in=/tmp/spotgen/{run-id}/osm-fukui.json \
 *     --out=/tmp/spotgen/{run-id}/osm-fukui-with-address.json
 */

import fs from "node:fs";

function parseArgs(argv) {
  const args = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

async function reverseGeocode(lat, lng) {
  // 国土地理院: https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress
  const url = `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "tsurispot-spot-generator/0.1" },
  });
  if (!res.ok) throw new Error(`gsi ${res.status}`);
  const data = await res.json();
  // 期待形式: { results: { muniCd, lv01Nm } }
  const muni = data?.results?.muniCd;
  const localName = data?.results?.lv01Nm;
  if (!localName) return null;
  return localName; // 都道府県 + 市町村 + 字。住所粒度は荒い
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.in || !args.out) {
    console.error("usage: fetch-gsi.mjs --in=<json> --out=<json>");
    process.exit(1);
  }
  const arr = JSON.parse(fs.readFileSync(args.in, "utf8"));
  const enriched = [];
  let okCount = 0;
  for (let i = 0; i < arr.length; i++) {
    const cand = arr[i];
    try {
      const addr = await reverseGeocode(cand.lat, cand.lng);
      if (addr) {
        cand.address = addr.startsWith(cand.prefecture)
          ? addr
          : `${cand.prefecture}${addr}`;
        okCount++;
      }
    } catch (e) {
      console.error(`[gsi] failed for ${cand.name}: ${e.message}`);
    }
    enriched.push(cand);
    // 1秒スリープでレートに優しく
    if (i < arr.length - 1) await new Promise((r) => setTimeout(r, 1000));
    // 進捗
    if ((i + 1) % 20 === 0) console.error(`[gsi] ${i + 1}/${arr.length}`);
  }
  fs.writeFileSync(args.out, JSON.stringify(enriched, null, 2) + "\n", "utf8");
  console.log(
    JSON.stringify({ ok: true, total: enriched.length, with_address: okCount, out: args.out }),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
