#!/usr/bin/env node
// ツリスポ自己改善エージェントの「安全の核」。
// 現在のブランチと base(origin/master) の差分を解析し、自動merge可能な「超安全」か
// 人間承認が必要な「承認要」かを機械判定する。
//
// 設計原則（敵対的レビューで強化済み）:
//   - フェイルクローズ: 取得失敗・不整合・不明は全て needs-human に倒す。
//   - リネームは --no-renames で A+D に分解し、旧新パス両方を検査する。
//   - 検査対象の差分本文は『追加行のみ』。危険コード/スキーマ/秘密参照/クリックベイトを検出。
//   - phase ゲートをコードで強制（phase1=実装禁止）。
//   - 行数だけでなく『1行最大文字数』『追加文字数合計』も見る（minified注入対策）。
//
// 使い方:
//   node scripts/agent/guardrail-check.mjs            # HEAD vs origin/master を判定
//   node scripts/agent/guardrail-check.mjs --json     # JSON のみ出力（スキーマ安定）
//   node scripts/agent/guardrail-check.mjs --base master   # base 上書き
//
// 終了コード: 0=超安全(safe) / 10=承認要(needs-human) / 1=エラー
// 標準出力(--json): { verdict, reasons[], stats, files[] }

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const args = process.argv.slice(2);
const jsonOnly = args.includes("--json");
const baseArg = (() => {
  const i = args.indexOf("--base");
  return i >= 0 ? args[i + 1] : null;
})();

function loadConfig() {
  const p = path.join(REPO_ROOT, "config", "agent.config.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function git(cmd, opts = {}) {
  return execSync(`git ${cmd}`, { cwd: REPO_ROOT, encoding: "utf8", stdio: opts.allowFail ? ["pipe", "pipe", "ignore"] : "pipe" }).trim();
}
function gitTry(cmd) {
  try { return git(cmd, { allowFail: true }); } catch { return null; }
}

// base を決定する。ローカルmasterの陳腐化を避けるため origin/<base> を優先。
function resolveBase(cfg) {
  if (baseArg) return { base: baseArg, note: `--base指定: ${baseArg}` };
  const remote = cfg.git?.remote || "origin";
  const branch = cfg.git?.baseBranch || "master";
  // best-effort fetch（オフライン等で失敗してもOK、既存のremote refを使う）
  gitTry(`fetch ${remote} ${branch} --quiet`);
  const remoteRef = `${remote}/${branch}`;
  if (gitTry(`rev-parse --verify ${remoteRef}`)) {
    return { base: remoteRef, note: `base=${remoteRef}` };
  }
  // remote ref が無い → ローカルにフォールバックするが安全側に倒すための警告フラグ
  return { base: branch, note: `${remoteRef} 不在→ローカル${branch}使用(要注意)`, stale: true };
}

function main() {
  const cfg = loadConfig();
  const g = cfg.guardrail;
  const { base, note: baseNote, stale } = resolveBase(cfg);

  const reasons = [];
  const files = [];

  // フェイルクローズ: base が解決できない/diff失敗は needs-human
  let nameStatus, numstat;
  try {
    // --no-renames: リネームを A+D に分解 → 旧新パス両方が検査対象になり、numstatのキーも素のパスに揃う
    nameStatus = git(`diff --name-status --no-renames ${base}...HEAD`);
    numstat = git(`diff --numstat --no-renames ${base}...HEAD`);
  } catch (e) {
    return finish("needs-human", [`git diff 失敗(フェイルクローズ): ${e.message.split("\n")[0]}`], { base }, []);
  }
  if (stale) reasons.push(`origin基準を取得できずローカルbaseで判定(${baseNote})`);

  // --- numstat: ファイルごとの増減行 ---
  const addDel = {};
  for (const line of numstat.split("\n").filter(Boolean)) {
    const [add, del, ...rest] = line.split("\t");
    const file = rest.join("\t");
    addDel[file] = {
      added: add === "-" ? 0 : Number(add),
      deleted: del === "-" ? 0 : Number(del),
      binary: add === "-" || del === "-",
    };
  }

  const allowRe = (g.allowedPathPatterns || []).map((s) => new RegExp(s));
  const forbidRe = (g.forbiddenPathPatterns || []).map((s) => new RegExp(s));

  let totalLines = 0;
  const nameStatusFiles = new Set();

  for (const line of nameStatus.split("\n").filter(Boolean)) {
    const parts = line.split("\t");
    const status = parts[0];
    const file = parts[parts.length - 1];
    nameStatusFiles.add(file);

    const stat = addDel[file];
    const rec = { file, status, added: stat?.added ?? null, deleted: stat?.deleted ?? null, flags: [] };

    // フェイルクローズ: numstat に対応が無い = 行数不明 = 危険
    if (!stat) {
      rec.flags.push("numstat-missing(行数不明)");
    } else {
      totalLines += stat.added + stat.deleted;
      if (stat.binary) rec.flags.push("binary");
    }

    // 禁止パス
    const forbiddenHit = forbidRe.find((re) => re.test(file));
    if (forbiddenHit) rec.flags.push(`forbidden-path:${forbiddenHit.source}`);

    // 許可リスト
    if (!allowRe.some((re) => re.test(file))) rec.flags.push("not-in-allowlist");

    // 新規・削除（--no-renames によりリネームは A+D に分解済み）
    if (status.startsWith("A")) {
      rec.flags.push("new-file");
      if (/page\.tsx$/.test(file)) rec.flags.push("new-route(容量リスク)");
    }
    if (status.startsWith("D")) rec.flags.push("deleted-file");
    if (status.startsWith("R") || status.startsWith("C")) rec.flags.push("rename/copy");

    files.push(rec);
  }

  // name-status と numstat のファイル集合不一致 → フェイルクローズ
  const numstatFiles = new Set(Object.keys(addDel));
  const onlyInNumstat = [...numstatFiles].filter((f) => !nameStatusFiles.has(f));
  if (onlyInNumstat.length) reasons.push(`name-status/numstat 不整合(フェイルクローズ): ${onlyInNumstat.join(", ")}`);

  // --- 集約判定 ---
  const changedFiles = nameStatusFiles.size;

  if (files.length === 0) {
    return finish("needs-human", ["差分なし"], { totalLines, changedFiles, base }, files);
  }

  // phase ゲート（コードで強制）: phase1 は実装禁止＝差分があれば即 needs-human
  if (cfg.phase === 1) reasons.push("phase1(測定基盤のみ)では実装変更を許可しない");

  const collect = (pred, label) => {
    const hit = files.filter(pred);
    if (hit.length) reasons.push(`${label}: ${hit.map((f) => f.file).join(", ")}`);
  };
  collect((f) => f.flags.some((x) => x.startsWith("forbidden-path")), "禁止パス変更");
  collect((f) => f.flags.includes("not-in-allowlist"), "許可リスト外");
  collect((f) => f.flags.some((x) => x.startsWith("new-route")), "新規route(SSG件数増・容量リスク)");
  collect((f) => f.flags.includes("new-file"), "新規ファイル追加");
  collect((f) => f.flags.includes("deleted-file"), "ファイル削除");
  collect((f) => f.flags.includes("rename/copy"), "リネーム/コピー");
  collect((f) => f.flags.includes("binary"), "バイナリ変更");
  collect((f) => f.flags.some((x) => x.startsWith("numstat-missing")), "行数不明");

  if (totalLines > g.maxChangedLines) reasons.push(`総変更行 ${totalLines} > 上限 ${g.maxChangedLines}`);
  if (changedFiles > g.maxChangedFiles) reasons.push(`変更ファイル数 ${changedFiles} > 上限 ${g.maxChangedFiles}`);

  // --- 追加行のみを抽出して意味的検査 ---
  let diffBody = null;
  try {
    diffBody = git(`diff --unified=0 --no-renames ${base}...HEAD`);
  } catch {
    reasons.push("差分本文の取得に失敗(フェイルクローズ)");
  }
  if (diffBody !== null) {
    const addedLines = diffBody
      .split("\n")
      .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
      .map((l) => l.slice(1));
    const addedContent = addedLines.join("\n");
    const totalAddedChars = addedContent.length;
    const maxLine = addedLines.reduce((m, l) => Math.max(m, l.length), 0);

    if (maxLine > g.maxLineLength) reasons.push(`単一行が長すぎる ${maxLine}字 > ${g.maxLineLength}(minified注入対策)`);
    if (totalAddedChars > g.maxAddedChars) reasons.push(`追加文字数 ${totalAddedChars} > 上限 ${g.maxAddedChars}`);

    const scan = (patterns, label) => {
      const hits = (patterns || []).filter((s) => new RegExp(s, "m").test(addedContent)).map((s) => `/${s}/`);
      if (hits.length) reasons.push(`${label}: ${hits.join(" ")}`);
    };
    scan(g.schemaChangePatterns, "スキーマ変更の疑い");
    scan(g.dangerousCodePatterns, "危険コードの疑い");
    scan(g.secretAccessPatterns, "秘密参照の疑い");
    scan(g.clickbaitPatterns, "誇張/クリックベイト/禁止表現");
  }

  const verdict = reasons.length === 0 ? "safe" : "needs-human";
  return finish(verdict, reasons.length ? reasons : ["全ガードレール通過"], { totalLines, changedFiles, base, phase: cfg.phase }, files);
}

function finish(verdict, reasons, stats, files) {
  const out = { verdict, reasons, stats, files };
  if (jsonOnly) {
    process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  } else {
    const mark = verdict === "safe" ? "✅ 超安全(自動merge可)" : "🛑 承認要(needs-human)";
    console.log(`\n判定: ${mark}  [base=${stats.base} phase=${stats.phase ?? "?"}]`);
    console.log(`理由: ${reasons.join(" / ")}`);
    console.log(`統計: 変更ファイル ${stats.changedFiles ?? 0} / 総行 ${stats.totalLines ?? 0}`);
    if (files?.length) {
      console.log("\nファイル:");
      for (const f of files) {
        console.log(`  ${f.status}\t+${f.added ?? "?"}-${f.deleted ?? "?"}\t${f.file}${f.flags.length ? `  [${f.flags.join(",")}]` : ""}`);
      }
    }
  }
  process.exit(verdict === "safe" ? 0 : 10);
}

main();
