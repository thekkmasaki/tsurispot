#!/usr/bin/env node
// latest.json から「順位5-20×表示≥閾値」の“あと一歩”ページを抽出し、
// ROIスコア降順のワークリスト memory/metrics/striking-distance.json を出力する。
//
// ROIスコア = impressions × CTRギャップ × affiliate係数 × WoWモメンタム × 学習重み
//   - CTRギャップ: 順位帯の期待CTR − 実CTR(正のときだけ伸びしろ)
//   - affiliate係数: ページタイプ別の収益寄与(classify-url.mjs)
//   - WoWモメンタム: 前週比でimpression増/順位改善なら加点(伸び始めを優先)
//   - 学習重み: priorities.json の boost/suppress/excludeUrls を反映
//
// 実行: node scripts/metrics/extract-striking-distance.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { affiliateCoeff, expectedCtr, guessSourcePaths } from "./lib/classify-url.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const METRICS_DIR = path.join(REPO_ROOT, "memory", "metrics");

function loadConfig() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8"));
}
function readJsonSafe(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}

const DEFAULT_WEIGHTS = { ctrGap: 1.0, affiliate: 1.5, momentum: 0.8 };

function loadPriorities() {
  const p = path.join(REPO_ROOT, "memory", "agent", "priorities.json");
  const pri = readJsonSafe(p, {});
  // weights を必ずサニタイズ(可変ファイル由来。NaN/負値/欠落が Math.pow を壊すのを防ぐ)
  const raw = pri.weights || {};
  const wn = (v, d) => (Number.isFinite(v) && v >= 0 ? Math.min(v, 5) : d);
  return {
    weights: {
      ctrGap: wn(raw.ctrGap, DEFAULT_WEIGHTS.ctrGap),
      affiliate: wn(raw.affiliate, DEFAULT_WEIGHTS.affiliate),
      momentum: wn(raw.momentum, DEFAULT_WEIGHTS.momentum),
    },
    boostPageTypes: Array.isArray(pri.boostPageTypes) ? pri.boostPageTypes : [],
    suppressPageTypes: Array.isArray(pri.suppressPageTypes) ? pri.suppressPageTypes : [],
    excludeUrls: Array.isArray(pri.excludeUrls) ? pri.excludeUrls : [],
  };
}

// excludeUrls は文字列(恒久)または {path/url, until:"YYYY-MM-DD"} (TTLクールダウン)を許容。
// until が過去なら自動復帰させ、優良ページが永久に放置されるのを防ぐ。
function buildExcludeSet(excludeUrls) {
  const today = new Date().toISOString().slice(0, 10);
  const set = new Set();
  for (const e of excludeUrls) {
    if (typeof e === "string") { set.add(e); continue; }
    if (e && typeof e === "object") {
      const key = e.path || e.url;
      if (!key) continue;
      if (!e.until || e.until >= today) set.add(key); // until未指定=恒久、未来=クールダウン中
    }
  }
  return set;
}

// 直近 latest 以外で最新の gsc 週次ファイルを前週比較用に拾う
function loadPrevGscPages(currentWeek) {
  const dir = path.join(METRICS_DIR, "gsc");
  if (!fs.existsSync(dir)) return {};
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.includes(currentWeek)).sort();
  if (!files.length) return {};
  const prev = readJsonSafe(path.join(dir, files[files.length - 1]));
  return prev?.pages || {};
}

function topQueryFor(pagePath, queries) {
  const cand = queries.filter((q) => q.page === pagePath);
  if (!cand.length) return null;
  // 表示回数が多く、順位5-20の「狙えるクエリ」を優先
  cand.sort((a, b) => b.impressions - a.impressions);
  return cand[0];
}

function main() {
  const cfg = loadConfig();
  const sd = cfg.strikingDistance;
  const pri = loadPriorities();
  const latest = readJsonSafe(path.join(METRICS_DIR, "latest.json"));
  if (!latest) { console.error("latest.json がありません。先に fetch-all.mjs を実行してください。"); process.exit(1); }

  const prevPages = loadPrevGscPages(latest.week);
  const queries = latest.queries || [];
  const exclude = buildExcludeSet(pri.excludeUrls || []);

  const work = [];
  for (const [p, m] of Object.entries(latest.pages)) {
    if (exclude.has(p) || exclude.has(m.url)) continue;
    const pos = m.position || 0;
    const impr = m.impressions || 0;
    if (pos < sd.posLo || pos > sd.posHi) continue;
    if (impr < sd.minImpressions) continue;

    const ctrGap = Math.max(0, expectedCtr(pos) - (m.ctr || 0)); // %ポイント
    const affCoeff = affiliateCoeff(m.type);

    // WoWモメンタム: 前週があれば impression比 + 順位改善を 0.7〜1.4 にマップ
    let momentum = 1.0;
    const prev = prevPages[p];
    if (prev) {
      const imprRatio = prev.impressions > 0 ? impr / prev.impressions : 1;
      const posDelta = (prev.position || pos) - pos; // 正=順位改善
      momentum = clamp(0.7 + 0.3 * Math.log2(Math.max(0.25, imprRatio)) + 0.05 * posDelta, 0.5, 1.6);
    }

    // 学習重み(ページタイプのboost/suppress)
    let typeWeight = 1.0;
    if ((pri.boostPageTypes || []).includes(m.type)) typeWeight *= 1.3;
    if ((pri.suppressPageTypes || []).includes(m.type)) typeWeight *= 0.6;

    const w = pri.weights || { ctrGap: 1, affiliate: 1.5, momentum: 0.8 };
    // スコア合成: 表示回数 × (CTRギャップ寄与) × affiliate寄与 × momentum寄与 × type重み
    const roi =
      impr *
      Math.pow(Math.max(ctrGap, 0.1), w.ctrGap) *
      Math.pow(affCoeff, w.affiliate) *
      Math.pow(momentum, w.momentum) *
      typeWeight;

    const tq = topQueryFor(p, queries);
    work.push({
      path: p,
      url: m.url,
      type: m.type,
      position: pos,
      impressions: impr,
      clicks: m.clicks || 0,
      ctr: m.ctr || 0,
      ctrGap: +ctrGap.toFixed(2),
      affiliateClicks: m.affiliateClicks || 0,
      momentum: +momentum.toFixed(2),
      roiScore: Math.round(roi),
      targetQuery: tq ? { q: tq.query, impressions: tq.impressions, position: tq.position } : null,
      sourcePaths: guessSourcePaths(m.url),
      recommendedAction:
        ctrGap > 1.5 ? "title/description のCTR改善(クエリを前方配置・行動喚起)"
          : "見出し/本文の網羅性・内部リンク強化で順位押し上げ",
    });
  }

  work.sort((a, b) => b.roiScore - a.roiScore);

  const out = {
    generatedAt: new Date().toISOString(),
    basedOnWeek: latest.week,
    criteria: { posLo: sd.posLo, posHi: sd.posHi, minImpressions: sd.minImpressions },
    count: work.length,
    items: work,
  };
  const outPath = path.join(METRICS_DIR, "striking-distance.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");

  console.log(`striking-distance: ${work.length}件 → ${path.relative(REPO_ROOT, outPath)}`);
  console.log("\n=== ROI上位15 ===");
  for (const [i, it] of work.slice(0, 15).entries()) {
    console.log(
      `${String(i + 1).padStart(2)}. ROI${String(it.roiScore).padStart(8)} pos${it.position} imp${it.impressions} gap${it.ctrGap}% ${it.type}`,
      `\n     ${it.path}`,
      it.targetQuery ? `\n     狙い: "${it.targetQuery.q}" (imp${it.targetQuery.impressions}/pos${it.targetQuery.position})` : "",
    );
  }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

main();
