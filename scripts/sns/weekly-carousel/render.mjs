#!/usr/bin/env node
/**
 * 週報データJSON → カルーセル画像(JPEG 1080x1350, 最大10枚) + Instagramキャプション
 *   node scripts/sns/weekly-carousel/render.mjs <week.json> <outDir>
 *
 * week.json: { week:{label,range,tag}, areas:[{area,catchCopy,url,rows:[{spot,fish,size,method,heat}]}] }
 * 構成: 表紙(今週の注目3件) → エリア(1枚に2〜3エリア) → 締め
 * 写真は使わない（週報の内容と関係のない写真を載せないため）
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

// 表紙の注目釣果: 各エリアの最上位から好調度順に3件（別エリア・別魚種）
const seenFish = new Set();
const highlights = areas
  .map((a) => ({ area: a.area, r: a.rows[0] }))
  .sort((x, y) => y.r.heat - x.r.heat)
  .filter((h) => !/^情報なし/.test(h.r.size) && (seenFish.has(fishLabel(h.r.fish)) ? false : seenFish.add(fishLabel(h.r.fish))))
  .slice(0, 3);

const slides = [
  `<section class="slide cover"><div class="mas" data-m="wow"></div>
  <div class="top"><span class="chip">釣果週報</span><span class="chip ghost">全国${areas.length}エリア</span></div>
  <div class="head"><h1>${esc(d.week.label)}</h1><div class="range">${esc(d.week.range)}の釣果まとめ</div></div>
  <div class="hl"><h2>今週の注目</h2><ul>
  ${highlights.map((h) => `<li><span>${esc(h.area)}</span><b>${esc(fishLabel(h.r.fish))}</b><em>${esc(cut(sizeLabel(h.r.size), 24))}</em></li>`).join("")}
  </ul></div>
  <div class="brand"><span class="logo" data-m="smile"></span>ツリスポ</div><div class="swipe">エリア別はスワイプ ▶</div></section>`,
  ...areaChunks.map((chunk, ci) => `<section class="slide areas"><header><b>${esc(d.week.label)}の釣果</b><span>${ci + 2} / ${total}</span></header><main>
  ${chunk.map((a) => {
    const top = Math.max(0, ...a.rows.map((r) => r.heat));
    return `<div class="area"><h2>${esc(a.area)}<i>${HEAT[Math.min(top, 5)]}</i></h2><p class="copy">${esc(a.catchCopy)}</p><ul>
    ${a.rows.map((r) => `<li><b>${esc(fishLabel(r.fish))}</b><em>${esc(cut(sizeLabel(r.size), 26))}</em><small>📍${esc(r.spot)}${r.method && !/^(情報なし|記載なし|不明)/.test(r.method) ? `｜${esc(r.method)}` : ""}　${"🔥".repeat(r.heat)}</small></li>`).join("")}
    </ul></div>`;
  }).join("")}</main>
  <footer><span>出典：各施設・釣具店の公開釣果をツリスポがまとめ</span><span>ツリスポ</span></footer></section>`),
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
const topFish = [...fishCount].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => `#${f.replace(/[\s（）()]/g, "")}釣り`);
const hashtags = ["#釣果情報", "#釣果", ...topFish, "#釣り", "#海釣り", "#堤防釣り", "#ツリスポ"].join(" ");
const caption = `【釣果週報】${d.week.label}（${d.week.range}）全国${areas.length}エリアの釣果まとめ🎣

${lines}

🗒 各エリアの釣果一覧・釣れたスポットの駐車場や詳しい情報は、プロフィールのリンク →「釣果週報」から見られます。
🔖 保存して週末の釣行計画に！

※釣果は各施設・釣具店の公開情報をもとにまとめています。立入禁止・釣り禁止の場所では釣りをしないでください。

${hashtags}`;
fs.writeFileSync(path.join(outDir, "caption-instagram.txt"), caption.slice(0, 2200));
console.log(`OK ${files.length}枚 caption=${caption.length}字`);
console.log(JSON.stringify(files));
