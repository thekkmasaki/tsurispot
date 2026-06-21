#!/usr/bin/env node
// ヘッドレス self-improve サイクルの起動ラッパ。
// Windowsタスクスケジューラから 1日数回 呼ばれる想定。
//   - 起動前セルフチェック(settings deny / ポリシー改ざん検知 / git健全性)
//   - 二重起動防止(ロックファイル, stale自動解放)
//   - ログ(logs/agent/cycle-*.log)
//   - claude -p を spawn してタイムアウト管理
//   - 失敗/成功を Discord通知
//
// 実行: node scripts/agent/run-cycle.mjs [--force-metrics] [--accept-policy]
//   --accept-policy: SKILL.md/config を意図的に変更した後、現在のハッシュを正として再登録する
//
// 前提: settings.json の allow リスト適用済み + claude CLI がPATHにあること。
// ※無人運用は『専用クローン』推奨(ops/setup-task.md)。対話用作業ツリーと共有すると
//   ユーザーの未コミット作業がある間はサイクルがスキップされる(作業保護のため)。

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { notifyDiscord } from "./notify-discord.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const LOCK_PATH = path.join(REPO_ROOT, ".claude", "state", "agent-cycle.lock");
const LOG_DIR = path.join(REPO_ROOT, "logs", "agent");
const POLICY_HASH_PATH = path.join(REPO_ROOT, "memory", "agent", "policy-hashes.json");

const TIMEOUT_MS = 45 * 60 * 1000;
const STALE_MS = 2 * 60 * 60 * 1000;

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function tsStamp() { return new Date().toISOString().replace(/[:.]/g, "-"); }
function loadConfig() { return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8")); }
function git(cmd) { return execSync(`git ${cmd}`, { cwd: REPO_ROOT, encoding: "utf8", stdio: "pipe" }).trim(); }
function gitTry(cmd) { try { return git(cmd); } catch { return null; } }
function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

// ===== 起動前セルフチェック =====

// 1) settings.json に master-push の deny が物理的に存在するか
function checkSettingsDeny() {
  const p = path.join(REPO_ROOT, ".claude", "settings.json");
  let s;
  try { s = JSON.parse(fs.readFileSync(p, "utf8")); } catch { return "settings.json が読めない"; }
  const deny = (s.permissions?.deny || []).join("\n");
  const required = ["git push origin master", "npm run deploy"];
  const missing = required.filter((r) => !deny.includes(r));
  if (missing.length) return `settings.json の deny に必須項目が無い: ${missing.join(", ")}（ops/setup-task.md参照）`;
  return null;
}

// 2) SKILL.md と config のハッシュ改ざん検知(自己改変の歯止め)
//    .claude/ は gitignore で guardrail(git-diff)に映らないため、ハッシュで監視する。
function checkPolicyIntegrity(acceptPolicy) {
  const targets = {
    skill: path.join(REPO_ROOT, ".claude", "skills", "self-improve", "SKILL.md"),
    config: path.join(REPO_ROOT, "config", "agent.config.json"),
  };
  const current = {};
  for (const [k, f] of Object.entries(targets)) {
    if (!fs.existsSync(f)) return { abort: `ポリシーファイル不在: ${f}` };
    current[k] = sha(f);
  }
  let stored = null;
  try { stored = JSON.parse(fs.readFileSync(POLICY_HASH_PATH, "utf8")); } catch { /* 初回 */ }

  if (!stored || acceptPolicy) {
    ensureDir(path.dirname(POLICY_HASH_PATH));
    fs.writeFileSync(POLICY_HASH_PATH, JSON.stringify({ ...current, updatedAt: new Date().toISOString() }, null, 2) + "\n");
    return { abort: null, note: stored ? "ポリシーハッシュを再登録(--accept-policy)" : "ポリシーハッシュを初回登録(TOFU)" };
  }
  const changed = Object.keys(current).filter((k) => current[k] !== stored[k]);
  if (changed.length) {
    return { abort: `ポリシー(${changed.join(",")})が無断変更されています。人間が内容確認後 'node scripts/agent/run-cycle.mjs --accept-policy' で承認してください。` };
  }
  return { abort: null };
}

// 3) git 健全性: ユーザー作業を絶対に破壊しない。エージェント自身の残骸だけ掃除。
function sanitizeGit(cfg) {
  const base = cfg.git?.baseBranch || "master";
  const remote = cfg.git?.remote || "origin";
  const prefix = cfg.git?.branchPrefix || "feature/auto-";

  // stale index.lock 除去(gitプロセスが動いていない前提のタスク起動時のみ)
  const lock = path.join(REPO_ROOT, ".git", "index.lock");
  if (fs.existsSync(lock)) { try { fs.unlinkSync(lock); } catch { /* */ } }

  gitTry(`fetch ${remote} ${base} --quiet`);
  const branch = gitTry("rev-parse --abbrev-ref HEAD") || "";
  const dirty = (gitTry("status --porcelain") || "").length > 0;

  if (branch.startsWith(prefix)) {
    // エージェント自身の残骸ブランチ → 追跡ファイルの編集だけ捨てて base へ。
    // 重要: `git clean -fd` は使わない。未追跡の agent 資産(config/scripts 等を
    // リポジトリにコミットせず置く運用)を巻き込んで削除してしまうため。
    // 追跡ファイルの未コミット編集は reset --hard で十分に破棄できる。
    gitTry("reset --hard --quiet");
    if (!gitTry(`checkout ${base} --quiet`)) return { abort: `base(${base})へのcheckout失敗` };
  } else if (dirty) {
    // ユーザーの未コミット作業がある → 破壊せずスキップ(作業保護)
    return { abort: `作業ツリーがdirty(ブランチ:${branch})。ユーザー作業保護のためスキップ。無人運用は専用クローン推奨。` };
  } else {
    if (!gitTry(`checkout ${base} --quiet`)) return { abort: `base(${base})へのcheckout失敗` };
  }
  // base を origin に同期(fast-forwardのみ。発散していたら止める)
  if (gitTry(`rev-parse --verify ${remote}/${base}`)) {
    if (gitTry(`merge --ff-only ${remote}/${base} --quiet`) === null) {
      return { abort: `ローカル${base}が${remote}/${base}と発散。手動解決が必要。` };
    }
  }
  return { abort: null };
}

// ===== ロック =====
function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch { return false; } }
function acquireLock() {
  ensureDir(path.dirname(LOCK_PATH));
  if (fs.existsSync(LOCK_PATH)) {
    let info = {};
    try { info = JSON.parse(fs.readFileSync(LOCK_PATH, "utf8")); } catch { /* corrupt */ }
    const age = Date.now() - (info.startedAtMs || 0);
    const sameHost = info.host === os.hostname();
    const alive = info.pid && sameHost && pidAlive(info.pid);
    // 別ホストのロックはPID生存を判定できないので時間でのみ stale 判定する
    if ((alive || !sameHost) && age < STALE_MS) return false;
    try { fs.unlinkSync(LOCK_PATH); } catch { /* */ }
  }
  try {
    const fd = fs.openSync(LOCK_PATH, "wx");
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString(), startedAtMs: Date.now(), host: os.hostname() }));
    fs.closeSync(fd);
    return true;
  } catch { return false; }
}
function releaseLock() {
  try {
    const info = JSON.parse(fs.readFileSync(LOCK_PATH, "utf8"));
    if (info.pid === process.pid && info.host === os.hostname()) fs.unlinkSync(LOCK_PATH);
  } catch { /* */ }
}

function killTree(pid) {
  try {
    if (process.platform === "win32") execSync(`taskkill /pid ${pid} /T /F`, { stdio: "ignore" });
    else process.kill(-pid, "SIGKILL");
  } catch { /* */ }
}

async function runCycle() {
  ensureDir(LOG_DIR);
  const logPath = path.join(LOG_DIR, `cycle-${tsStamp()}.log`);
  const logStream = fs.createWriteStream(logPath, { flags: "a" });
  const log = (s) => { const line = `[${new Date().toISOString()}] ${s}`; logStream.write(line + "\n"); console.log(line); };
  log(`サイクル開始 host=${os.hostname()} pid=${process.pid}`);

  const forceMetrics = process.argv.includes("--force-metrics");
  const prompt = [
    "あなたはツリスポの自己改善エージェントです。",
    "`.claude/skills/self-improve/SKILL.md` の手順を最初から最後まで、ちょうど1サイクル(=1改善)実行してください。",
    forceMetrics ? "今回はメトリクスを必ず再取得してから始めてください(手順1を強制実行)。" : "",
    "master へ直接 push しないこと。テキストのみ変更すること。ガードレールを必ず守ること。",
  ].filter(Boolean).join("\n");

  const claudeArgs = ["-p", prompt, "--permission-mode", "acceptEdits", "--add-dir", REPO_ROOT];

  return new Promise((resolve) => {
    let finished = false;
    const child = spawn("claude", claudeArgs, {
      cwd: REPO_ROOT, env: process.env,
      shell: process.platform === "win32",
      detached: process.platform !== "win32",
    });
    const timer = setTimeout(() => {
      if (finished) return;
      log(`⏱ タイムアウト(${TIMEOUT_MS / 60000}分) → プロセスkill`);
      killTree(child.pid);
      finished = true;
      resolve({ ok: false, reason: "timeout", logPath });
    }, TIMEOUT_MS);
    child.stdout.on("data", (d) => logStream.write(d));
    child.stderr.on("data", (d) => logStream.write(d));
    child.on("error", (err) => {
      if (finished) return;
      clearTimeout(timer); finished = true;
      log(`❌ claude起動エラー: ${err.message}`);
      resolve({ ok: false, reason: `spawn-error: ${err.message}`, logPath });
    });
    child.on("close", (code) => {
      if (finished) return;
      clearTimeout(timer); finished = true;
      log(`サイクル終了 code=${code}`);
      resolve({ ok: code === 0, reason: code === 0 ? "ok" : `exit-${code}`, logPath });
    });
  }).finally(() => logStream.end());
}

async function main() {
  const acceptPolicy = process.argv.includes("--accept-policy");
  const cfg = loadConfig();

  // --- 起動前セルフチェック(失敗したらサイクルを起動しない) ---
  const settingsErr = checkSettingsDeny();
  if (settingsErr) {
    await notifyDiscord(`🛑 起動中止: ${settingsErr}`);
    console.error(settingsErr); process.exit(2);
  }
  const policy = checkPolicyIntegrity(acceptPolicy);
  if (policy.abort) {
    await notifyDiscord(`🛑 起動中止(ポリシー改ざん検知): ${policy.abort}`);
    console.error(policy.abort); process.exit(2);
  }
  if (acceptPolicy) { console.log(policy.note || "ポリシー承認完了"); process.exit(0); }

  if (!acquireLock()) { console.log("別のサイクルが稼働中 → 今回はスキップ"); process.exit(0); }

  let result;
  try {
    const san = sanitizeGit(cfg);
    if (san.abort) {
      releaseLock();
      await notifyDiscord(`⏭ サイクルskip: ${san.abort}`);
      console.log(san.abort); process.exit(0);
    }
    result = await runCycle();
  } catch (e) {
    result = { ok: false, reason: `exception: ${e.message}` };
  } finally {
    releaseLock();
  }

  const shortLog = result.logPath ? path.relative(REPO_ROOT, result.logPath) : "";
  if (result.ok) await notifyDiscord(`✅ 自己改善サイクル完了 (${result.reason})`);
  else await notifyDiscord(`⚠ 自己改善サイクル異常終了: ${result.reason}\nlog: ${shortLog}`);
  process.exit(result.ok ? 0 : 1);
}

main();
