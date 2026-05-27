#!/usr/bin/env node
/**
 * checkpoint.mjs — spot-generator の進捗 JSON を read/write する。
 *
 * 中断・再開のキー。rate limit で落ちても progress.json が残れば次セッションで完全再開できる。
 *
 * 配置:
 *   - レポジトリルートからの相対パスで `.claude/state/spot-generation-progress.json`
 *   - `.gitignore` で除外する想定
 *
 * 使い方:
 *   node scripts/spot-generator/checkpoint.mjs init  --run-id=... --region=... --mode=... --target=... [--batch-size=50]
 *   node scripts/spot-generator/checkpoint.mjs read
 *   node scripts/spot-generator/checkpoint.mjs update --json='{"completed_batches":[...]}'  # 部分マージ
 *   node scripts/spot-generator/checkpoint.mjs clear
 *   node scripts/spot-generator/checkpoint.mjs status                                       # 人間向け要約
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const STATE_DIR = path.join(REPO_ROOT, ".claude", "state");
const STATE_FILE = path.join(STATE_DIR, "spot-generation-progress.json");

function ensureDir() {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
}

function parseArgs(argv) {
  const args = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

function read() {
  if (!fs.existsSync(STATE_FILE)) return null;
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
}

function write(data) {
  ensureDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function cmdInit(args) {
  const required = ["run-id", "region", "mode", "target"];
  for (const k of required) {
    if (!args[k]) {
      console.error(`init: missing --${k}`);
      process.exit(1);
    }
  }
  const data = {
    run_id: args["run-id"],
    started_at: new Date().toISOString(),
    region: args.region,
    mode: args.mode,
    target_count: Number(args.target),
    batch_size: Number(args["batch-size"] ?? 50),
    branch: args.branch ?? `feature/spot-gen-${args["run-id"]}`,
    completed_batches: [],
    pending_candidates: [],
    last_added_slug: null,
    existing_slugs_snapshot_path: null,
    errors: [],
    capacity: { total_spots: 0, ts_bytes: 0 },
    pr_url: null,
  };
  write(data);
  console.log(JSON.stringify({ ok: true, run_id: data.run_id, file: STATE_FILE }));
}

function cmdRead() {
  const d = read();
  if (!d) {
    console.error("no checkpoint");
    process.exit(1);
  }
  console.log(JSON.stringify(d, null, 2));
}

function cmdUpdate(args) {
  const cur = read();
  if (!cur) {
    console.error("no checkpoint to update");
    process.exit(1);
  }
  if (!args.json) {
    console.error("update: missing --json='{...}'");
    process.exit(1);
  }
  let patch;
  try {
    patch = JSON.parse(args.json);
  } catch (e) {
    console.error("update: invalid JSON:", e.message);
    process.exit(1);
  }
  // 配列フィールドは concat、他はマージ
  const concatFields = ["completed_batches", "errors"];
  const next = { ...cur };
  for (const [k, v] of Object.entries(patch)) {
    if (concatFields.includes(k) && Array.isArray(v)) {
      next[k] = [...(cur[k] ?? []), ...v];
    } else {
      next[k] = v;
    }
  }
  write(next);
  console.log(JSON.stringify({ ok: true, run_id: next.run_id }));
}

function cmdClear() {
  if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
  console.log(JSON.stringify({ ok: true, cleared: true }));
}

function cmdStatus() {
  const d = read();
  if (!d) {
    console.log("(no active checkpoint)");
    return;
  }
  const done = d.completed_batches.length;
  const totalBatches = Math.ceil(d.target_count / d.batch_size);
  const addedCount = d.completed_batches.reduce(
    (s, b) => s + (b.added_slugs?.length ?? 0),
    0,
  );
  console.log(`run_id        : ${d.run_id}`);
  console.log(`region        : ${d.region}`);
  console.log(`mode          : ${d.mode}`);
  console.log(`branch        : ${d.branch}`);
  console.log(`started_at    : ${d.started_at}`);
  console.log(`progress      : ${done}/${totalBatches} batches  (added ${addedCount}/${d.target_count})`);
  console.log(`capacity      : ${d.capacity.total_spots} spots / ${d.capacity.ts_bytes} bytes`);
  console.log(`errors        : ${d.errors.length}`);
  console.log(`pr_url        : ${d.pr_url ?? "(not created yet)"}`);
}

const [, , cmd, ...rest] = process.argv;
const args = parseArgs(rest);
switch (cmd) {
  case "init":
    cmdInit(args);
    break;
  case "read":
    cmdRead();
    break;
  case "update":
    cmdUpdate(args);
    break;
  case "clear":
    cmdClear();
    break;
  case "status":
    cmdStatus();
    break;
  default:
    console.error("usage: checkpoint.mjs init|read|update|clear|status [...args]");
    process.exit(1);
}
