#!/usr/bin/env node
/**
 * 週報データJSON → カルーセル画像(JPEG 1080x1350, 最大10枚) + Instagramキャプション
 *   node scripts/sns/weekly-carousel/render.mjs <week.json> <outDir>
 *
 * week.json: { week:{label,range,tag}, areas:[{area,catchCopy,url,rows:[{spot,fish,size,method,heat}]}] }
 * 構成: 表紙(今週の注目3件) → エリア(1枚に2〜3エリア) → 締め
 * 写真は週報に載っている魚種の実写だけ（rows[].photo）。週報と関係のない写真は使わない
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
const mascot = path.resolve(here, "../ranking-reel/mascot.js");
const [dataPath, outDir] = process.argv.slice(2);
if (!dataPath || !outDir) { console.error("usage: render.mjs <week.json> <outDir>"); process.exit(1); }
const d = JSON.parse(fs.readFileSync(dataPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

const MAX_SLIDES = 10; // Instagram カルーセルの上限
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
// 表示用の整形（中身は変えない。補足注記と長すぎる列挙だけ短くする）
const fishLabel = (f) => {
  const base = f.replace(/[（(][^）)]*[）)]/g, "").trim();
  const parts = base.split(/[・／/、]/).map((x) => x.trim()).filter(Boolean);
  return parts.length > 3 ? `${parts.slice(0, 3).join("・")}ほか` : parts.join("・");
};
const sizeLabel = (s) => (/^情報なし/.test(s) ? s.replace(/^情報なし/, "サイズ情報なし") : s);
const HEAT = ["情報少なめ", "低調", "ポツポツ", "まずまず", "好調", "爆釣"];

const areas = d.areas.filter((a) => a.rows.length);
const perSlide = areas.length <= 10 ? 2 : 3;
const areaChunks = [];
for (let i = 0; i < areas.length; i += perSlide) areaChunks.push(areas.slice(i, i + perSlide));
if (!areaChunks.length) throw new Error("釣果表のあるエリアが0件");
if (1 + areaChunks.length + 1 > MAX_SLIDES) throw new Error(`エリアが多すぎてカルーセルに収まりません（${areas.length}エリア）`);
const total = 1 + areaChunks.length + 1;

// 魚の写真（週報に載っている魚種の実写。photo.name = 写っている魚種）
const thumb = (p, cls = "ph") => (p ? `<div class="${cls}" style="background-image:url('file://${p.file}')"><i>${esc(p.name)}</i></div>` : "");

// 表紙の注目釣果: 各エリアから1件（写真のある魚を優先）→ 写真あり・好調度順に3件（別魚種）
const seenFish = new Set();
const highlights = areas
  .map((a) => ({ area: a.area, r: a.rows.find((r) => r.photo) ?? a.rows[0] }))
  .sort((x, y) => (y.r.photo ? 1 : 0) - (x.r.photo ? 1 : 0) || y.r.heat - x.r.heat)
  .filter((h) => !/^情報なし/.test(h.r.size) && (seenFish.has(fishLabel(h.r.fish)) ? false : seenFish.add(fishLabel(h.r.fish))))
  .slice(0, 3);

const slides = [
  `<section class="slide cover"><div class="mas" data-m="wow"></div>
  <div class="top"><span class="chip">釣果週報</span><span class="chip ghost">全国${areas.length}エリア</span></div>
  <div class="head"><h1>${esc(d.week.label)}</h1><div class="range">${esc(d.week.range)}の釣果まとめ</div></div>
  <div class="hl"><h2>今週の注目</h2><ul>
  ${highlights.map((h) => `<li class="${h.r.photo ? "" : "np"}">${thumb(h.r.photo, "ph big")}<div><span>${esc(h.area)}</span><b>${esc(fishLabel(h.r.fish))}</b><em>${esc(cut(sizeLabel(h.r.size), 20))}</em></div></li>`).join("")}
  </ul></div>
  <div class="brand"><span class="logo" data-m="smile"></span>ツリスポ</div><div class="swipe">エリア別はスワイプ ▶</div><p class="cnote">※魚の写真は魚種のイメージです</p></section>`,
  ...areaChunks.map((chunk, ci) => `<section class="slide areas"><header><b>${esc(d.week.label)}の釣果</b><span>${ci + 2} / ${total}</span></header><main>
  ${chunk.map((a) => {
    const top = Math.max(0, ...a.rows.map((r) => r.heat));
    return `<div class="area"><h2>${esc(a.area)}<i>${HEAT[Math.min(top, 5)]}</i></h2><p class="copy">${esc(a.catchCopy)}</p><ul>
    ${a.rows.map((r) => `<li class="${r.photo ? "" : "np"}">${thumb(r.photo)}<div class="tx"><b>${esc(fishLabel(r.fish))}</b><em>${esc(cut(sizeLabel(r.size), 26))}</em><small>📍${esc(r.spot)}${r.method && !/^(情報なし|記載なし|不明)/.test(r.method) ? `｜${esc(r.method)}` : ""}　${"🔥".repeat(r.heat)}</small></div></li>`).join("")}
    </ul></div>`;
  }).join("")}</main>
  <footer><span>釣果の出典：各施設・釣具店の公開情報</span><span>魚の写真は魚種のイメージです</span></footer></section>`),
  `<section class="slide cta"><div class="mas" data-m="wink"></div>
  <h2>釣れたスポットと<br><span>詳しい釣果表</span>は<br>プロフのリンクから</h2>
  <p>ツリスポ › 釣果週報で<br>エリアごとの全釣果を公開中</p>
  <div class="save">🔖 保存して週末の釣行に</div>
  <p class="note">※釣果は各施設・釣具店の公開情報をもとにまとめています。立入禁止・釣り禁止の場所では釣りをしないでください。</p></section>`,
];

const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${here}/slides.css">
<script src="file://${mascot}"></script></head><body>${slides.join("\n")}
<script>document.querySelectorAll('[data-m]').forEach(el=>{el.innerHTML=sakanacchi(el.dataset.m,{point:el.dataset.m==='wow',cap:el.dataset.m==='wink'})})</script>
</body></html>`;
const htmlPath = path.join(outDir, "slides.html");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto("file://" + path.resolve(htmlPath), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
// レイアウト検査: エリアカードがフッターに食い込んでいないか
const overflow = await page.evaluate(() => [...document.querySelectorAll(".slide.areas")].map((s, i) => {
  const main = s.querySelector("main").getBoundingClientRect(), foot = s.querySelector("footer").getBoundingClientRect();
  return main.bottom > foot.top ? i + 2 : 0;
}).filter(Boolean));
const els = await page.$$(".slide");
const files = [];
for (const [i, el] of els.entries()) {
  const f = path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.jpg`);
  await el.screenshot({ path: f, type: "jpeg", quality: 90 });
  files.push(f);
}
await browser.close();
if (overflow.length) { console.error("レイアウト崩れ（エリアスライド）:", overflow); process.exit(3); }

// ── キャプション ──
const lines = areas.map((a) => `📍${a.area}｜${a.catchCopy}`).join("\n");
const fishCount = new Map();
for (const a of areas) for (const r of a.rows) for (const f of fishLabel(r.fish).replace(/ほか$/, "").split("・")) fishCount.set(f, (fishCount.get(f) ?? 0) + 1);
// 「豆アジ」「良型アジ」などはアジにまとめる（検索語は魚種名）
const baseFish = (f) => { const s = f.replace(/[\s（）()]/g, ""), b = s.replace(/^(豆|小型|小|中型|大型|良型|特大|新子|ジャンボ|デカ|尺)/, ""); return b.length >= 2 ? b : s; };
const fishScore = new Map();
for (const [f, n] of fishCount) { const b = baseFish(f); if (b) fishScore.set(b, (fishScore.get(b) ?? 0) + n); }
const fishRank = [...fishScore].sort((a, b) => b[1] - a[1]).map(([f]) => f);
// ハッシュタグは5個まで（Instagram が 2025-12 に1投稿5個へ制限）。検索は本文のキーワードで拾わせる
const HASHTAG_MAX = 5;
const hashtags = [...new Set(["#釣果情報", "#堤防釣り", ...fishRank.slice(0, 3).map((f) => `#${f}釣り`), "#海釣り", "#ツリスポ"])]
  .slice(0, HASHTAG_MAX).join(" ");
const caption = `【釣果週報】${d.week.label}（${d.week.range}）全国${areas.length}エリアの釣果情報・釣れてる魚まとめ🎣

🐟 今週釣れてる魚：${fishRank.slice(0, 12).join("・")}

${lines}

🗒 各エリアの釣果一覧・釣れたスポットの駐車場や詳しい情報は、プロフィールのリンク →「釣果週報」から見られます。
🔖 保存して週末の釣行計画に！

※釣果は各施設・釣具店の公開情報をもとにまとめています。立入禁止・釣り禁止の場所では釣りをしないでください。
📷 魚の写真は魚種のイメージです（ツリスポ編集部の実釣写真${(d.credits ?? []).length ? "ほか" : ""}）${(d.credits ?? []).length ? "\n" + d.credits.map((c) => `・${c}`).join("\n") : ""}

${hashtags}`;
fs.writeFileSync(path.join(outDir, "caption-instagram.txt"), caption.slice(0, 2200));
console.log(`OK ${files.length}枚 caption=${caption.length}字`);
console.log(JSON.stringify(files));
