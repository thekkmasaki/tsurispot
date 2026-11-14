#!/usr/bin/env node
/**
 * LINE リッチメニュー画像（2500x1686）を HTML から描く。
 *   node scripts/line/render-richmenu.mjs            → public/images/line/richmenu.jpg
 * 押せる範囲（areas）は scripts/setup-line-richmenu.mjs と同じ座標。変えるときは両方そろえる。
 *
 * 配置: 左に大きく「今週の釣果」（週報＝いちばん新しい情報）、右に 2x2、右下に細い「使い方」。
 * 絵文字はやめて線のアイコンとマスコット（さかなっち）で統一。色はサイト・SNS と同じ紺/海/黄/赤。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const mascot = path.join(root, "scripts/sns/ranking-reel/mascot.js");
const out = process.argv[2] ?? path.join(root, "public/images/line/richmenu.jpg");

const icon = {
  pin: `<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>`,
  fish: `<path d="M2.5 12c3.2-5 9.5-6.2 13.5-2.6L21 6v12l-5-3.4C12 18.2 5.7 17 2.5 12z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/>`,
  book: `<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>`,
  hook: `<path d="M14 3v11a5 5 0 0 1-10 0v-1.5l2.5 2"/><circle cx="14" cy="3" r=".6" fill="currentColor"/><path d="M18 8h3M19.5 6.5v3"/>`,
  send: `<path d="M4 12 20 4l-4 16-4-6.5z"/><path d="M12 13.5 20 4"/>`,
  help: `<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.4a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4"/><circle cx="12" cy="17.6" r=".6" fill="currentColor"/>`,
};
const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon[k]}</svg>`;
const tile = (k, color, title, sub) => `<div class="tile"><div class="ic" style="background:${color}">${svg(k)}</div><b>${title}</b><span>${sub}</span><i>›</i></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<style>@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800;900&display=swap');
:root{--navy:#10324F;--sea:#2BA6DE;--sky:#E8F6FD;--red:#FF5A4E;--sun:#FFC53D;--green:#16a37b}
*{box-sizing:border-box;margin:0;padding:0}
body{width:2500px;height:1686px;font-family:'M PLUS Rounded 1c',sans-serif;background:var(--sky);color:var(--navy);position:relative;overflow:hidden}
.hero{position:absolute;left:40px;top:40px;width:920px;height:1606px;border-radius:72px;overflow:hidden;color:#fff;
  background:radial-gradient(circle at 85% 8%,rgba(43,166,222,.75),transparent 46%),radial-gradient(circle at 0% 100%,rgba(255,197,61,.28),transparent 45%),var(--navy)}
.hero .chip{position:absolute;left:80px;top:96px;background:var(--sun);color:var(--navy);font-size:58px;font-weight:900;padding:10px 40px;border-radius:60px}
.hero h1{position:absolute;left:76px;top:230px;font-size:168px;font-weight:900;line-height:1.12;letter-spacing:-.02em}
.hero h1 span{color:var(--sun)}
.hero p{position:absolute;left:82px;top:640px;font-size:62px;font-weight:800;line-height:1.45;opacity:.95}
.hero .mas{position:absolute;right:40px;bottom:250px;width:470px}
.hero .cta{position:absolute;left:80px;right:80px;bottom:80px;background:var(--red);border-radius:40px;text-align:center;font-size:70px;font-weight:900;padding:30px 0;box-shadow:0 12px 0 rgba(0,0,0,.25)}
.grid{position:absolute;left:1000px;top:40px;width:1460px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px}
.tile{position:relative;height:613px;background:#fff;border-radius:64px;padding:70px 64px;box-shadow:0 12px 0 rgba(16,50,79,.10)}
.tile .ic{width:210px;height:210px;border-radius:56px;color:#fff;display:flex;align-items:center;justify-content:center}
.tile .ic svg{width:130px;height:130px}
.tile b{display:block;font-size:96px;font-weight:900;margin-top:52px;letter-spacing:-.01em;white-space:nowrap}
.tile span{display:block;font-size:52px;font-weight:700;color:#5b7489;margin-top:12px;white-space:nowrap}
.tile i{position:absolute;right:56px;top:60px;font-style:normal;font-size:120px;font-weight:900;color:#c7d6e2;line-height:1}
.try{position:absolute;left:1000px;top:1346px;width:1040px;height:300px;border-radius:64px;background:var(--navy);color:#fff;padding:36px 56px}
.try p{font-size:54px;font-weight:900;white-space:nowrap}
.try p em{font-style:normal;color:var(--sun)}
.try .inp{margin-top:26px;height:130px;background:#fff;border-radius:66px;display:flex;align-items:center;padding:0 22px 0 56px;color:var(--navy)}
.try .inp b{font-size:72px;font-weight:900}
.try .inp small{font-size:44px;font-weight:700;color:#8aa0b2;margin-left:22px}
.try .inp i{margin-left:auto;width:100px;height:100px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center}
.try .inp i svg{width:58px;height:58px}
.help{position:absolute;left:2080px;top:1346px;width:380px;height:300px;border-radius:64px;border:8px solid var(--navy);background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}
.help .ic{width:120px;height:120px;color:var(--navy)}
.help b{font-size:64px;font-weight:900}
</style><script src="file://${mascot}"></script></head><body>
<div class="hero"><div class="chip">毎週更新</div>
  <h1>今週の<br><span>釣果</span></h1>
  <p>全国10エリアで<br>いま釣れてる魚</p>
  <div class="mas" data-m="wow"></div>
  <div class="cta">タップしてチェック</div></div>
<div class="grid">
  ${tile("pin", "var(--sea)", "スポット検索", "近くの釣り場を探す")}
  ${tile("fish", "var(--green)", "今釣れる魚", "今月の旬がわかる")}
  ${tile("book", "var(--sun)", "初心者ガイド", "道具・釣り方の基本")}
  ${tile("hook", "var(--red)", "おすすめ道具", "失敗しないタックル")}
</div>
<!-- 魚名を送れることは言われないと分からない（ユーザー指摘 2026-11）→ 入力欄そっくりの見本。押すと「アジ」が送られる -->
<div class="try"><p>魚の名前を送ると<em>釣れてる場所</em>がわかる</p>
  <div class="inp"><b>アジ</b><small>← タップで試す</small><i>${svg("send")}</i></div></div>
<div class="help"><div class="ic">${svg("help")}</div><b>使い方</b></div>
<script>document.querySelectorAll('[data-m]').forEach(el=>{el.innerHTML=sakanacchi(el.dataset.m,{point:true})})</script>
</body></html>`;

const tmp = path.join(path.dirname(out), ".richmenu.html");
fs.writeFileSync(tmp, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2500, height: 1686 } });
await page.goto("file://" + path.resolve(tmp), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: out, type: "jpeg", quality: 88 });
await browser.close();
fs.rmSync(tmp);
console.log(`OK ${out} ${(fs.statSync(out).size / 1024).toFixed(0)}KB（上限1MB）`);
