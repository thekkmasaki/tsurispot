#!/usr/bin/env node
/**
 * parse-csv.mjs — ユーザー入力リスト (CSV / Markdown表) を正規化 JSON に変換する。
 *
 * 想定入力フォーマット（どちらも対応）:
 *
 *   A) CSV（ヘッダ必須）:
 *      name,lat,lng,prefecture,city,spotType,fishCandidates,description
 *      "三国港",36.21,136.15,福井県,坂井市,port,"aji|kisu","オリジナル文..."
 *
 *   B) Markdown 表:
 *      | name | lat | lng | prefecture | city | spotType | fishCandidates | description |
 *      |------|-----|-----|------------|------|----------|----------------|-------------|
 *      | 三国港 | 36.21 | 136.15 | 福井県 | 坂井市 | port | aji|kisu | オリジナル文 |
 *
 * fishCandidates はパイプ `|` 区切り（CSV 内では `aji|kisu`、MD 内ではエスケープ `aji\|kisu` 推奨）。
 *
 * Usage:
 *   node scripts/spot-generator/parse-csv.mjs --in=path/to/list.csv --out=/tmp/.../candidates.json
 *   node scripts/spot-generator/parse-csv.mjs --in=path/to/list.md  --out=/tmp/.../candidates.json
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

function parseCSVRow(line) {
  const cells = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuote) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuote = false;
      } else {
        cur += c;
      }
    } else {
      if (c === ",") {
        cells.push(cur);
        cur = "";
      } else if (c === '"') {
        inQuote = true;
      } else {
        cur += c;
      }
    }
  }
  cells.push(cur);
  return cells;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = parseCSVRow(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVRow(lines[i]);
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = (cells[j] ?? "").trim();
    }
    rows.push(row);
  }
  return rows;
}

function parseMD(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().startsWith("|"));
  if (lines.length < 2) return [];
  const header = lines[0]
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    // 0,1 はヘッダと区切り行
    const cells = lines[i]
      .split("|")
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1); // 先頭末尾の空セルを除外
    if (cells.length === 0) continue;
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = (cells[j] ?? "").trim();
    }
    rows.push(row);
  }
  return rows;
}

function normalizeRow(row) {
  const required = ["name", "lat", "lng", "prefecture", "description"];
  for (const k of required) {
    if (!row[k]) throw new Error(`missing required field: ${k} (got: ${JSON.stringify(row)})`);
  }
  const fishCandidates = row.fishCandidates
    ? row.fishCandidates.split(/[|;]/).map((s) => s.trim()).filter(Boolean)
    : undefined;
  return {
    name: row.name,
    lat: Number(row.lat),
    lng: Number(row.lng),
    prefecture: row.prefecture,
    city: row.city || undefined,
    spotType: row.spotType || undefined,
    difficulty: row.difficulty || undefined,
    fishCandidates,
    description: row.description,
    address: row.address || undefined,
    accessInfo: row.accessInfo || undefined,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.in || !args.out) {
    console.error("usage: parse-csv.mjs --in=<csv|md> --out=<json>");
    process.exit(1);
  }
  const text = fs.readFileSync(args.in, "utf8");
  const ext = path.extname(args.in).toLowerCase();
  const rows = ext === ".md" || ext === ".markdown" ? parseMD(text) : parseCSV(text);

  const normalized = [];
  const errors = [];
  for (const r of rows) {
    try {
      normalized.push(normalizeRow(r));
    } catch (e) {
      errors.push({ row: r, error: e.message });
    }
  }

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(normalized, null, 2) + "\n", "utf8");

  console.log(
    JSON.stringify({ ok: errors.length === 0, count: normalized.length, errors, out: args.out }),
  );
}

main();
