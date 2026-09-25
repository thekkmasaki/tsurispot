#!/usr/bin/env node
/**
 * お題JSON → ランキング画像(PNG 1080x1920) + キャプション(Instagram/Threads)
 *   node scripts/sns/ranking-reel/render.mjs <topic.json> <outDir>
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const [topicPath, outDir] = process.argv.slice(2);
if (!topicPath || !outDir) { console.error("usage: render.mjs <topic.json> <outDir>"); process.exit(1); }
const t = JSON.parse(fs.readFileSync(topicPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const LV = { beginner: ["初心者◎", ""], all: ["初心者◎", ""], intermediate: ["中級", "lv"], advanced: ["上級", "lv"] };
const n = t.spots.length;
const bigSize = t.fish.name.length <= 4 ? 150 : t.fish.name.length <= 5 ? 130 : t.fish.name.length <= 6 ? 110 : 90;

const photoHtml = (s) => {
  if (!s.photo) return `<div class="ph" data-scene="${esc(s.type)}"></div>`;
  const src = s.photo.src.startsWith("http") ? s.photo.src : "file://" + path.join(root, "public", s.photo.src);
  return `<div class="ph" style="background-image:url('${src}')"></div>`;
};
const cards = t.spots.map((s, i) => {
  const [lv, lvCls] = LV[s.difficulty] ?? ["", ""];
  const cls = s.name.length > 11 ? "xl" : s.name.length > 9 ? "long" : "";
  return `<div class="card"><div class="no n${i < 3 ? i + 1 : 0}">${i + 1}</div>${photoHtml(s)}
  <div class="tx"><b class="${cls}">${esc(s.name)}</b><em>${esc(s.city)}｜${esc(s.type)}</em>
  <p>${lv ? `<span class="${lvCls}">${lv}</span>` : ""}${s.others.length ? "一緒に: " + esc(s.others.join("・")) : ""}</p></div></div>`;
}).join("");

const shortTip = (arr) => [...arr].sort((a, b) => a.length - b.length).slice(0, 2);
const tipsHtml = t.method
  ? `<li><b>釣り方</b>${esc(t.method.name)}</li>${shortTip(t.method.tips).map((x) => `<li><b>コツ</b>${esc(x.length > 25 ? x.slice(0, 24) + "…" : x)}</li>`).join("")}`
  : "";
const bubble = t.fish.isPeakMonth ? `${t.month.name}は<br>${t.fish.name}の最盛期！` : `${t.month.name}も<br>しっかり狙えるよ！`;
const hasPhotoCredit = t.spots.some((s) => s.photo);

const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${here}/post.css">
<script src="file://${here}/mascot.js"></script><script src="file://${here}/scenes.js"></script></head>
<body style="--big:${bigSize}px">
<header><div class="chip">${t.month.name}｜${esc(t.pref.name)}</div>
<h1><span class="s">${t.fish.isPeakMonth ? "今が旬！" : "今月狙える"}</span><span class="big">${esc(t.fish.name)}</span><span class="s2">が釣れる${esc(t.pref.short)}の釣り場 <span class="top">TOP${n}</span></span></h1>
<p class="sub">ツリスポ掲載${t.totalSpots}か所から「釣れる度」順に厳選</p>
<div class="mas" id="m1"></div><div class="bub">${bubble}</div></header>
<main>${cards}</main>
${tipsHtml ? `<section class="tips"><div class="mas2" id="m2"></div><div><h2>${esc(t.fish.name)}を釣るコツ</h2><ul>${tipsHtml}</ul></div></section>` : ""}
<footer><div class="brand"><span class="logo" id="lg"></span>ツリスポ<small>全国4,000か所の釣り場ガイド</small></div>
<div class="cta">🔖 保存して釣行前にチェック<br><small>駐車場・釣果・詳しい情報はプロフのリンクから</small></div>
<p class="note">※立入禁止・釣り禁止の場所では釣りをしないでください。ライフジャケット着用を。${hasPhotoCredit ? "写真出典はキャプションに記載。" : ""}</p></footer>
<script>
m1.innerHTML=uki("wow",{point:true}); if(window.m2) m2.innerHTML=uki("wink",{cap:true}); lg.innerHTML=uki("smile");
document.querySelectorAll('.ph[data-scene]').forEach(el=>{el.innerHTML=scene(el.dataset.scene)+'<i>'+el.dataset.scene+'</i>'});
</script></body></html>`;
const htmlPath = path.join(outDir, "post.html");
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto("file://" + path.resolve(htmlPath), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
// レイアウト検査: コツ欄とフッターの重なり、見出しのはみ出し
const check = await page.evaluate(() => {
  const r = (q) => document.querySelector(q)?.getBoundingClientRect();
  const tips = r(".tips") ?? r("main"), foot = r("footer");
  return { overlap: tips.bottom > foot.top, h1Overflow: document.querySelector("h1").scrollWidth > 1080 - 56 };
});
await page.screenshot({ path: path.join(outDir, "post.png") });
await browser.close();
if (check.overlap || check.h1Overflow) { console.error("レイアウト崩れ:", check); process.exit(3); }

// ── キャプション ──
const lines = t.spots.map((s, i) => `${i + 1}. ${s.name}（${s.city}）`).join("\n");
const credits = t.spots.filter((s) => s.photo).map((s) => `・${s.name}: ${s.photo.credit}`).join("\n");
const tag = (x) => "#" + x.replace(/[\s・（）()]/g, "");
const hashtags = [tag(t.fish.name), tag(t.fish.name + "釣り"), tag(t.pref.short + "釣り"), tag(t.pref.short + "釣り場"), "#釣り", "#釣り場", "#釣り初心者", "#海釣り", "#堤防釣り", "#ツリスポ"].join(" ");
const igCaption = `【${t.month.name}】${t.pref.name}で${t.fish.name}が釣れる釣り場TOP${n}🎣

${t.fish.isPeakMonth ? `${t.month.name}は${t.fish.name}の最盛期！` : `${t.month.name}も${t.fish.name}が狙えます。`}ツリスポに掲載している${t.pref.short}の${t.totalSpots}か所から、釣れる度の高い順に選びました。

${lines}

📍 駐車場・トイレ・最新の釣果など詳しい情報は、プロフィールのリンクから「ツリスポ」で見られます。
🔖 保存して釣行前にチェック！

⚠️ 立入禁止区域・釣り禁止エリアでは釣りをしないでください。
${credits ? `\n📷 写真\n${credits}\n` : ""}
${hashtags}`;
const threadsText = `【${t.month.name}】${t.pref.name}で${t.fish.name}が釣れる釣り場TOP${n}🎣\n\n${t.spots.slice(0, 5).map((s, i) => `${i + 1}. ${s.name}`).join("\n")}\n…6位以下と駐車場・釣果情報はこちら👇\n${t.url}?utm_source=threads&utm_medium=social&utm_campaign=ranking`;
fs.writeFileSync(path.join(outDir, "caption-instagram.txt"), igCaption);
fs.writeFileSync(path.join(outDir, "caption-threads.txt"), threadsText.slice(0, 500));
console.log(`OK ${outDir}/post.png ig=${igCaption.length}字 threads=${threadsText.length}字`);
