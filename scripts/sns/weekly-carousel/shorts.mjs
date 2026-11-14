#!/usr/bin/env node
/**
 * 週報データJSON → エリア別の YouTube ショート「{エリア}で今週釣れてる釣り場 TOP5」（1080x1920, 約20秒）
 *   node scripts/sns/weekly-carousel/shorts.mjs <week.json> <outDir> [エリアのキー ...]
 *   エリアのキー（osaka-sennan 等）を渡すとそのエリアだけ作る。省略時は全エリア。
 *   出力: <outDir>/short-<キー>.mp4, <outDir>/youtube-<キー>.json（タイトル・説明・タグ）
 *   最後の行に [{ key, area, video, meta }] の JSON（作れたものだけ）
 *
 * 全国ランキングは「範囲が広すぎて見る人が戸惑う」（2026-11 ユーザー指摘）→ エリアごとに1本。
 * 構成: つかみ(2.2秒) → 5位 → … → 2位 → 「そして1位は…」 → 1位 → 締め。
 *   伸びているショートは最初の1〜2秒で「続きが気になる」を作る（2026-11 調査）。
 *   つかみは1位の写真をぼかして「1位は…？」。タイトルでも1位を明かさない。
 * 釣り場はエリアの週報の釣果表から、好調度順に最大5か所（areas[].spots。同じ釣り場は1回）。
 * 3か所に満たないエリアは作らない（数合わせをしない）。
 * 写真は週報に載っている魚種の実写だけ（photo）。無い魚は写真なしのカード。
 * 画像は静止（ズームしない＝ユーザー指示 2026-11）。切り替えだけスライド。
 * アプリの案内（2026-11 合意・内容に合うときだけ）:
 *   ランキングにイカが入った回だけ、締めに「エギングなら シャクリズム」。説明欄は全エリアに「ツリスポ釣果記録」、イカの回はシャクリズムも。
 *   リンクの ct= で App Store Connect に流入元が出る。ショートの説明欄のリンクは押せないので、画面では「App Storeで検索」と出す。
 * BGM は SNS_BGM_DIR（非公開バケットから取得。Meta サウンドコレクション）。無ければ無音。
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { areaKey } from "./data.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const mascot = path.resolve(here, "../ranking-reel/mascot.js");
const [dataPath, outDir, ...only] = process.argv.slice(2);
if (!dataPath || !outDir) { console.error("usage: shorts.mjs <week.json> <outDir> [エリアのキー ...]"); process.exit(1); }
const d = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const MAX_RANK = 5;
const MIN_RANK = 3; // これ未満のエリアはショートを作らない
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
// 大きく見せるので魚は1種だけ（複数なら「など」）。サイズ・釣り方は最初の区切りまで
const fishLabel = (f) => {
  const parts = f.replace(/[（(][^）)]*[）)]/g, "").trim().split(/[・／/、]/).map((x) => x.trim()).filter(Boolean);
  return parts.length > 1 ? `${parts[0]}など` : parts[0] ?? f;
};
const first = (s) => String(s ?? "").split(/[／/（(、,]/)[0].trim();
const noInfo = (s) => !s || /^(情報なし|記載なし|不明|—|-)/.test(s);
// 魚名の文字数で文字サイズを変える（1行に収める）
const fishSize = (name) => (name.length <= 5 ? 132 : name.length <= 7 ? 108 : 86);
const areaSize = (name) => (name.length <= 6 ? 120 : name.length <= 8 ? 100 : 80);
const HEAT = ["情報少なめ", "低調", "ポツポツ", "まずまず", "好調", "爆釣"];
const period = d.week.period ?? d.week.label;
const CATCHLOG_URL = "https://apps.apple.com/jp/app/id6833248739?ct=tsurispot_youtube"; // ツリスポ釣果記録（iPhone）
const SHAKURHYTHM_URL = "https://apps.apple.com/jp/app/id6825799808?ct=tsurispot_youtube"; // シャクリズム（エギング・iPhone/Apple Watch）
const SQUID = /イカ/; // アオリイカ・コウイカ・ヤリイカ・ケンサキイカ等
const CSS = `@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800;900&display=swap');
:root{--navy:#10324F;--sea:#2BA6DE;--sky:#E8F6FD;--red:#FF5A4E;--sun:#FFC53D}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'M PLUS Rounded 1c',sans-serif;background:#000;color:var(--navy)}
.f{width:1080px;height:1920px;position:relative;overflow:hidden}
footer{position:absolute;left:0;right:0;bottom:70px;display:flex;justify-content:center;align-items:center;gap:12px;font-weight:900;font-size:46px;color:#fff}
footer small{font-size:36px;font-weight:800;opacity:.75;margin-left:8px}
footer .logo{width:74px;display:inline-block}
.intro{background:var(--navy);color:#fff}
.intro .bg{position:absolute;inset:-80px;background:var(--navy) center/cover;filter:blur(36px) brightness(.5) saturate(1.3)}
.intro>*:not(.bg){z-index:1}
.intro .chip{position:absolute;left:80px;top:230px;background:var(--sun);color:var(--navy);font-weight:900;font-size:50px;padding:10px 36px;border-radius:50px}
.intro .aname{position:absolute;left:70px;top:340px;font-weight:900;line-height:1.1;color:#fff;-webkit-text-stroke:6px var(--navy);paint-order:stroke fill}
.intro h1{position:absolute;left:70px;top:530px;font-size:130px;font-weight:900;line-height:1.15;text-shadow:7px 7px 0 var(--red)}
.intro h1 span{color:var(--sun)}
.intro .top{position:absolute;left:70px;top:900px;font-size:200px;font-weight:900;color:var(--sun);-webkit-text-stroke:8px #fff;paint-order:stroke fill;filter:drop-shadow(0 10px 0 rgba(0,0,0,.35))}
.intro .mas{position:absolute;right:60px;top:1220px;width:360px}
.tease{background:var(--red);color:#fff;text-align:center}
.tease p{position:absolute;left:0;right:0;top:560px;font-size:110px;font-weight:900}
.tease h2{position:absolute;left:0;right:0;top:700px;font-size:260px;font-weight:900;text-shadow:10px 10px 0 var(--navy)}
.tease .mas{position:absolute;left:50%;transform:translateX(-50%);top:1180px;width:380px}
.rank{background:var(--sky)}
.rank header{background:var(--navy);color:#fff;padding:120px 60px 36px;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:12px solid var(--sun)}
.rank header b{font-size:56px;font-weight:900}.rank header span{font-size:40px;font-weight:800;opacity:.85}
.rank .no{position:absolute;left:50px;top:300px;z-index:2;font-size:230px;font-weight:900;line-height:1;color:var(--red);-webkit-text-stroke:10px #fff;paint-order:stroke fill;filter:drop-shadow(0 8px 0 rgba(16,50,79,.25))}
.rank .no em{font-style:normal;font-size:110px}
.rank.r1 .no{color:#e0a100;font-size:260px}
.rank.r1 .ph{border-color:var(--sun);box-shadow:0 0 0 10px #e0a100}
.rank .ph{position:absolute;left:50px;right:50px;top:420px;height:700px;border-radius:44px;background:#cfe3f0 center/cover;border:8px solid #fff;box-shadow:0 10px 0 rgba(16,50,79,.15)}
.rank .ph i{position:absolute;right:20px;bottom:16px;font-style:normal;font-size:26px;font-weight:700;color:#fff;background:rgba(0,0,0,.45);padding:4px 14px;border-radius:10px}
.rank .ph.none{display:flex;align-items:center;justify-content:center;font-size:300px;background:linear-gradient(160deg,#bfe6f8,#7cc8ea)}
.rank .card{position:absolute;left:50px;right:50px;top:1150px;background:#fff;border:7px solid var(--navy);border-radius:44px;padding:36px 50px 30px}
.rank .area{display:inline-block;background:var(--navy);color:#fff;font-size:44px;font-weight:900;padding:6px 28px;border-radius:16px}
.rank h2{font-size:132px;font-weight:900;line-height:1.1;margin-top:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rank .det{font-size:50px;font-weight:900;color:var(--sea);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rank .spot{font-size:46px;font-weight:800;color:#3d5a73;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rank .heat{font-size:64px;margin-top:12px;display:flex;align-items:center;gap:16px}
.rank .heat span{font-size:44px;font-weight:900;background:var(--red);color:#fff;border-radius:14px;padding:2px 20px}
.rank footer{color:var(--navy)}
.outro{background:var(--navy);color:#fff;text-align:center}
.outro .mas{position:absolute;left:50%;transform:translateX(-50%);top:230px;width:400px}
.outro h2{position:absolute;left:0;right:0;top:720px;font-size:96px;font-weight:900;line-height:1.3}
.outro h2 span{color:var(--sun)}
.outro .search{position:absolute;left:120px;right:120px;top:1040px;background:#fff;color:var(--navy);font-size:110px;font-weight:900;border-radius:90px;padding:26px 0;border:8px solid var(--sun)}
.outro>p{position:absolute;left:0;right:0;top:1280px;font-size:64px;font-weight:900}
.outro>p small{display:block;margin-top:6px;font-size:54px;font-weight:800;color:var(--sun);letter-spacing:.02em}
.outro .follow{position:absolute;left:90px;right:90px;top:1500px;background:var(--red);font-size:52px;font-weight:900;border-radius:24px;padding:22px 0;white-space:nowrap}
.outro .note{top:1660px;font-size:30px;font-weight:600;opacity:.75;line-height:1.6}
.outro.app .follow{top:1460px}
.outro .app{position:absolute;left:90px;right:90px;top:1600px;font-size:40px;font-weight:800;line-height:1.4}
.outro .app b{color:var(--sun);font-weight:900}
.outro.app .note{top:1740px}`;

const targets = d.areas
  .map((a) => ({ ...a, key: areaKey(a.slug ?? a.area) }))
  .filter((a) => !only.length || only.includes(a.key));

const browser = await chromium.launch();
const made = [];
try {
  for (const a of targets) {
    // 好調度が同じなら、写真のある釣り場→サイズの分かる釣り場を上に
    const picked = [...(a.spots ?? a.rows)]
      .sort((x, y) => y.heat - x.heat || Number(!!y.photo) - Number(!!x.photo) || Number(noInfo(x.size)) - Number(noInfo(y.size)))
      .slice(0, MAX_RANK);
    if (picked.length < MIN_RANK) { console.warn(`${a.area}: 釣り場が${picked.length}か所のためショートは作らない`); continue; }
    made.push(await makeShort(a, picked));
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify(made));

async function makeShort(a, picked) {
  const N = picked.length;
  const squid = picked.some((r) => SQUID.test(r.fish));
  const frameDir = path.join(outDir, `short-frames-${a.key}`);
  fs.mkdirSync(frameDir, { recursive: true });

  const photo = (p) => (p ? `<div class="ph" style="background-image:url('file://${p.file}')"><i>写真は${esc(p.name)}のイメージ</i></div>` : `<div class="ph none">🐟</div>`);
  const rankFrame = (r, rank) => {
    const detail = [noInfo(r.size) ? "" : cut(first(r.size), 16), noInfo(r.method) ? "" : cut(first(r.method), 10)].filter(Boolean).join("｜");
    const name = fishLabel(r.fish);
    return `<section class="f rank r${rank}"><header><b>${esc(a.area)}の釣果</b><span>${esc(period)}</span></header>
    <div class="no"><em>第</em>${rank}<em>位</em></div>
    ${photo(r.photo)}
    <div class="card"><span class="area">📍${esc(cut(r.spot, 16))}</span><h2 style="font-size:${fishSize(name)}px">${esc(name)}</h2>
    ${detail ? `<p class="det">${esc(detail)}</p>` : ""}
    <p class="heat">${"🔥".repeat(Math.max(1, Math.min(r.heat, 3)))}<span>${HEAT[Math.min(r.heat, 5)]}</span></p></div>
    <footer><span class="logo" data-m="smile"></span>ツリスポ<small>tsurispot.com</small></footer></section>`;
  };
  const frames = [
    // つかみ: 1位の写真をぼかして見せ、答えは最後まで引っ張る
    `<section class="f intro"><div class="bg"${picked[0].photo ? ` style="background-image:url('file://${picked[0].photo.file}')"` : ""}></div>
    <div class="chip">${esc(period)}の釣果</div>
    <div class="aname" style="font-size:${areaSize(a.area)}px">${esc(a.area)}で</div>
    <h1>今週いちばん<br><span>釣れてる釣り場</span></h1><div class="top">1位は…？</div>
    <div class="mas" data-m="wow"></div>
    <footer><span class="logo" data-m="smile"></span>ツリスポ TOP${N}</footer></section>`,
    `<section class="f tease"><p>そして</p><h2>1位は…</h2><div class="mas" data-m="wow"></div></section>`,
    `<section class="f outro${squid ? " app" : ""}"><div class="mas" data-m="wink"></div>
    <h2>${esc(a.area)}の<br><span>釣果の詳細</span>は</h2>
    <div class="search">🔍 ツリスポ</div><p>で検索<small>tsurispot.com</small></p>
    <div class="follow">チャンネル登録で毎週チェック</div>
    ${squid ? `<div class="app">🦑 エギングなら iPhoneアプリ <b>シャクリズム</b><br>App Storeで検索</div>` : ""}
    <p class="note">※釣果は各施設・釣具店の公開情報をもとにまとめています。<br>立入禁止・釣り禁止の場所では釣りをしないでください。</p></section>`,
  ];
  // picked は 1位→N位の順。表示は つかみ → N位 → … → 2位 → 溜め → 1位 → 締め
  const ranks = picked.map((r, i) => rankFrame(r, i + 1)).reverse();
  const ordered = [frames[0], ...ranks.slice(0, -1), frames[1], ranks.at(-1), frames[2]];

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style><script src="file://${mascot}"></script></head>
<body>${ordered.join("\n")}<script>document.querySelectorAll('[data-m]').forEach(el=>{el.innerHTML=sakanacchi(el.dataset.m,{point:el.dataset.m==='wow',cap:el.dataset.m==='wink'})})</script></body></html>`;
  const htmlPath = path.join(frameDir, "frames.html");
  fs.writeFileSync(htmlPath, html);

  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + path.resolve(htmlPath), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const pngs = [];
  for (const [i, el] of (await page.$$(".f")).entries()) {
    const f = path.join(frameDir, `frame-${String(i).padStart(2, "0")}.png`);
    await el.screenshot({ path: f });
    pngs.push(f);
  }
  await page.close();

  // ── 動画（静止画をスライドでつなぐ）──
  // つかみ・N位…2位・溜め・1位・締め（秒）
  const DUR = [2.2, ...Array(N - 1).fill(3.0), 1.4, 3.8, 3.2]; // 2026-11 ユーザー指摘「遷移が早すぎる」で 14秒→約20秒
  const T = 0.5; // 切り替え（ゆっくりめ）
  const total = DUR.reduce((x, y) => x + y, 0) - T * (pngs.length - 1);
  const inputs = pngs.flatMap((p, i) => ["-loop", "1", "-t", String(DUR[i]), "-i", p]);
  let chain = "";
  let prev = "[0:v]";
  let offset = 0;
  for (let i = 1; i < pngs.length; i++) {
    offset += DUR[i - 1] - T;
    const out = i === pngs.length - 1 ? "[vx]" : `[x${i}]`;
    chain += `${prev}[${i}:v]xfade=transition=slideleft:duration=${T}:offset=${offset.toFixed(2)}${out};`;
    prev = out;
  }
  chain += `[vx]fps=30,format=yuv420p[v]`;

  const bgm = pickBgm(process.env.SNS_BGM_DIR, `${d.week.tag ?? period}:${a.key}`);
  const audioIn = bgm ? ["-stream_loop", "-1", "-ss", String(bgm.offset), "-i", bgm.file] : ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"];
  const ai = pngs.length;
  const af = bgm
    ? `[${ai}:a]atrim=0:${total.toFixed(2)},afade=t=in:d=0.4,afade=t=out:st=${(total - 1.2).toFixed(2)}:d=1.2,volume=0.6[a]`
    : `[${ai}:a]atrim=0:${total.toFixed(2)}[a]`;
  const mp4 = path.join(outDir, `short-${a.key}.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", ...inputs, ...audioIn,
    "-filter_complex", `${chain};${af}`,
    "-map", "[v]", "-map", "[a]", "-t", total.toFixed(2),
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-profile:v", "high",
    "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-movflags", "+faststart", mp4,
  ], { stdio: "inherit" });

  // ── YouTube のタイトル・説明 ──
  const fishes = [...new Set(picked.map((r) => fishLabel(r.fish).replace(/など$/, "")))];
  const title = cut(`【${a.area}】今週釣れてる釣り場TOP${N}、1位は…？【${period}】 #Shorts`, 100);
  const lines = picked.map((r, i) => `${i + 1}位 ${r.spot}｜${fishLabel(r.fish)}${noInfo(r.size) ? "" : ` ${cut(first(r.size), 20)}`}`);
  const description = `${period}の${a.area}エリアの釣果週報から、今週釣れていた釣り場をランキングにしました。

${lines.join("\n")}

${a.area}エリアの釣果の詳細・出典は「ツリスポ」で検索。
${a.url ?? "https://tsurispot.com/chouka"}
${squid ? `
▼エギングのお供に：iPhone / Apple Watch アプリ「シャクリズム」
${SHAKURHYTHM_URL}
` : ""}
▼釣果の記録は iPhone アプリ「ツリスポ釣果記録」
${CATCHLOG_URL}

※釣果は各施設・釣具店の公開情報をもとにまとめています。立入禁止・釣り禁止の場所では釣りをしないでください。
※魚の写真は魚種のイメージです。

#釣り #釣果情報 #${a.area.split("・")[0]} #Shorts`;
  const tags = ["釣り", "釣果", "釣果情報", "海釣り", "堤防釣り", "ツリスポ", ...a.area.split("・"), ...fishes.map((f) => `${f}釣り`)];
  const meta = path.join(outDir, `youtube-${a.key}.json`);
  fs.writeFileSync(meta, JSON.stringify({ title, description: description.slice(0, 5000), tags: [...new Set(tags)].slice(0, 15) }, null, 2));
  console.error(`OK ${a.area} ${mp4} ${total.toFixed(1)}秒 TOP${N} BGM=${bgm ? path.basename(bgm.file) : "なし"}`);
  return { key: a.key, area: a.area, video: mp4, meta };
}

function pickBgm(dir, seed) {
  if (!dir || !fs.existsSync(dir)) return null;
  // SNS_BGM_PICK（カンマ区切りのファイル名の一部）で候補を絞る。例: ready-for-action,shake-the-floor
  const pick = (process.env.SNS_BGM_PICK ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  let files = fs.readdirSync(dir).filter((f) => /\.(mp3|m4a|wav)$/i.test(f)).sort();
  if (pick.length && files.some((f) => pick.some((p) => f.includes(p)))) files = files.filter((f) => pick.some((p) => f.includes(p)));
  if (!files.length) return null;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const f = files[h % files.length];
  const m = f.match(/@(\d+(?:\.\d+)?)\.[a-z0-9]+$/i);
  return { file: path.join(dir, f), offset: m ? Number(m[1]) : 0 };
}
