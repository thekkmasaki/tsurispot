#!/usr/bin/env node
/**
 * 比較ページの各機種に対応する楽天市場の商品を、楽天商品検索APIで取ってきて
 * src/lib/data/gear-compare/rakuten-items.ts を生成する（手動実行・週1程度を想定）。
 *
 *   RAKUTEN_APP_ID=xxxx [RAKUTEN_ACCESS_KEY=xxxx] node scripts/gear/fetch-rakuten-items.mjs
 *
 * - 対象機種: src/lib/data/gear-compare/models/*.json
 * - 型番を商品名に含む新品だけを候補にし、最安を採用（中古・パーツ・ガイド単体は除外）
 * - 見つからない機種はキーなし → ページ側で楽天・Amazonの検索リンクに落ちる
 * - API は 1リクエスト/秒 以下に抑える
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const MODELS_DIR = path.join(ROOT, "src/lib/data/gear-compare/models");
const OUT = path.join(ROOT, "src/lib/data/gear-compare/rakuten-items.ts");

const APP_ID = process.env.RAKUTEN_APP_ID;
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY;
// src/lib/affiliate-config.ts の楽天市場アフィリエイトIDと同じ
const AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID || "513d43ec.37411dd7.513d43ed.46a6059c";
const ENDPOINT =
  process.env.RAKUTEN_ITEM_SEARCH_ENDPOINT ||
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601";

if (!APP_ID) {
  console.error("RAKUTEN_APP_ID が未設定です（楽天ウェブサービスで発行したアプリID）");
  process.exit(1);
}

const EXCLUDE = /中古|USED|ユーズド|リペア|パーツ|ガイド単品|グリップのみ|ロッドケース|ロッドベルト/i;
const norm = (s) => s.toUpperCase().replace(/[\s\-‐ー－_./]/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(keyword) {
  const u = new URL(ENDPOINT);
  u.searchParams.set("format", "json");
  u.searchParams.set("formatVersion", "2");
  u.searchParams.set("applicationId", APP_ID);
  if (ACCESS_KEY) u.searchParams.set("accessKey", ACCESS_KEY);
  u.searchParams.set("affiliateId", AFFILIATE_ID);
  u.searchParams.set("keyword", keyword);
  u.searchParams.set("hits", "30");
  u.searchParams.set("sort", "+itemPrice");
  u.searchParams.set("availability", "1");
  const res = await fetch(u);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  return json.Items ?? json.items ?? [];
}

function pick(items, model) {
  const code = norm(model.model);
  const ok = items
    .map((it) => it.Item ?? it)
    .filter((it) => norm(it.itemName ?? "").includes(code) && !EXCLUDE.test(it.itemName ?? ""));
  ok.sort((a, b) => a.itemPrice - b.itemPrice);
  return ok[0] ?? null;
}

const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const models = fs
  .readdirSync(MODELS_DIR)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(MODELS_DIR, f), "utf8")));

const out = {};
let hit = 0;
for (const m of models) {
  try {
    const it = pick(await search(`${m.maker} ${m.model}`), m);
    if (it) {
      const img = it.mediumImageUrls?.[0];
      out[m.id] = {
        itemName: it.itemName,
        price: it.itemPrice,
        affiliateUrl: it.affiliateUrl || it.itemUrl,
        imageUrl: (typeof img === "string" ? img : img?.imageUrl) ?? null,
        shopName: it.shopName,
        reviewAverage: Number(it.reviewAverage) || 0,
        reviewCount: Number(it.reviewCount) || 0,
        fetchedAt: today,
      };
      hit++;
      console.log(`○ ${m.id}  ¥${it.itemPrice}  ${it.shopName}`);
    } else {
      console.log(`× ${m.id}  該当なし`);
    }
  } catch (e) {
    console.error(`! ${m.id}  ${e.message}`);
  }
  await sleep(1100);
}

const body = `// このファイルは scripts/gear/fetch-rakuten-items.mjs が生成する。手で編集しない。
// キー = GearModel.id。未取得の機種はキーなし（ページ側は楽天・Amazonの検索リンクで代替する）。
import type { RakutenItem } from "./types";

export const RAKUTEN_ITEMS: Record<string, RakutenItem> = ${JSON.stringify(out, null, 2)};
`;
fs.writeFileSync(OUT, body);
console.log(`\n${hit}/${models.length} 機種を取得 → ${path.relative(ROOT, OUT)}`);
