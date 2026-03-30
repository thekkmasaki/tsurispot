import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'out');
mkdirSync(outDir, { recursive: true });

const W = 1080;
const H = 1350;

const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Zen+Maru+Gothic:wght@500;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${W}px; height: ${H}px; overflow: hidden;
    font-family: 'Noto Sans JP', sans-serif; color: white;
    background: #060d1a; position: relative;
    -webkit-font-smoothing: antialiased;
  }
  .bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(circle 450px at 25% 10%, rgba(249,115,22,0.1) 0%, transparent 70%),
      radial-gradient(circle 350px at 80% 85%, rgba(59,130,246,0.07) 0%, transparent 70%),
      linear-gradient(175deg, #060d1a 0%, #0c2240 45%, #0a1a35 100%);
  }
  .c { position: relative; z-index: 10; display: flex; flex-direction: column; height: 100%; padding: 32px 32px 24px; }
  .zen { font-family: 'Zen Maru Gothic', sans-serif; }
</style></head><body>
<div class="bg"></div>
<div class="c">

  <!-- ヘッダー -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:28px;height:28px;background:linear-gradient(135deg,#0ea5e9,#0369a1);border-radius:8px;display:flex;align-items:center;justify-content:center">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px">
          <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/>
          <path d="M18 12v.5"/>
        </svg>
      </div>
      <span class="zen" style="font-size:15px;font-weight:900;opacity:0.6">ツリスポ</span>
    </div>
    <span style="font-size:9px;color:rgba(148,163,184,0.35)">tsurispot.com</span>
  </div>

  <!-- タイトル -->
  <div style="margin-bottom:4px">
    <span class="zen" style="font-size:34px;font-weight:900;background:linear-gradient(135deg,#fbbf24,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent">🎣 全国釣果週報</span>
  </div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
    <span style="background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.25);border-radius:14px;padding:2px 10px;font-size:12px;font-weight:800;color:#fb923c">2026.3 第4週</span>
    <span style="font-size:11px;color:rgba(148,163,184,0.5)">3/23〜3/29｜陸っぱり限定</span>
  </div>

  <!-- 注目キャッチ TOP3 -->
  <div style="font-size:11px;font-weight:800;color:#fb923c;letter-spacing:0.1em;margin-bottom:6px">🔥 今週の注目キャッチ</div>
  <div style="display:flex;gap:8px;margin-bottom:14px">
    <div style="flex:1;background:linear-gradient(135deg,rgba(249,115,22,0.12),rgba(239,68,68,0.04));border:1px solid rgba(249,115,22,0.2);border-radius:14px;padding:12px 10px 10px;text-align:center;position:relative">
      <div style="position:absolute;top:6px;right:8px;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ef4444);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900">1</div>
      <div style="font-size:24px;margin-bottom:2px">🐟</div>
      <div class="zen" style="font-size:16px;font-weight:900">シーバス</div>
      <div class="zen" style="font-size:20px;font-weight:900;color:#fbbf24">62cm</div>
      <div style="font-size:9px;color:rgba(148,163,184,0.7)">バチ抜け・ルアー</div>
      <div style="font-size:9px;color:#7dd3fc;font-weight:700;margin-top:2px">📍 大阪・泉南</div>
    </div>
    <div style="flex:1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:12px 10px 10px;text-align:center;position:relative">
      <div style="position:absolute;top:6px;right:8px;width:20px;height:20px;border-radius:50%;background:rgba(251,191,36,0.2);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fbbf24">2</div>
      <div style="font-size:24px;margin-bottom:2px">🦑</div>
      <div class="zen" style="font-size:16px;font-weight:900">アオリイカ</div>
      <div class="zen" style="font-size:14px;font-weight:900;color:#e2e8f0">春イカ接岸</div>
      <div style="font-size:9px;color:rgba(148,163,184,0.7)">エギング 3号</div>
      <div style="font-size:9px;color:#7dd3fc;font-weight:700;margin-top:2px">📍 駿河湾・伊豆</div>
    </div>
    <div style="flex:1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:12px 10px 10px;text-align:center;position:relative">
      <div style="position:absolute;top:6px;right:8px;width:20px;height:20px;border-radius:50%;background:rgba(168,162,158,0.2);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#a8a29e">3</div>
      <div style="font-size:24px;margin-bottom:2px">🐡</div>
      <div class="zen" style="font-size:16px;font-weight:900">マダイ</div>
      <div class="zen" style="font-size:20px;font-weight:900;color:#fbbf24">48cm</div>
      <div style="font-size:9px;color:rgba(148,163,184,0.7)">フカセ釣り</div>
      <div style="font-size:9px;color:#7dd3fc;font-weight:700;margin-top:2px">📍 南紀・白浜</div>
    </div>
  </div>

  <!-- 区切り -->
  <div style="height:1px;background:linear-gradient(90deg,rgba(125,211,252,0.15),rgba(255,255,255,0.03),transparent);margin-bottom:10px"></div>

  <!-- エリア別 -->
  <div style="font-size:11px;font-weight:800;color:#7dd3fc;letter-spacing:0.1em;margin-bottom:6px">📍 エリア別レポート</div>
  <div style="display:flex;flex-direction:column;gap:6px;flex:1">

    <!-- 1位 南紀 -->
    <div style="display:flex;align-items:flex-start;gap:10px;background:linear-gradient(135deg,rgba(249,115,22,0.06),transparent);border:1px solid rgba(249,115,22,0.1);border-radius:12px;padding:10px 12px">
      <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ef4444);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0;margin-top:2px">1</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="zen" style="font-size:15px;font-weight:900">南紀・白浜</span>
          <span style="font-size:14px">🔥🔥🔥</span>
        </div>
        <div style="font-size:11px;color:rgba(148,163,184,0.8);margin-top:1px"><strong style="color:#fbbf24">マダイ48cm</strong>フカセ / <strong style="color:#fbbf24">グレ</strong>通年好調 / <strong style="color:#fbbf24">チヌ〜45cm</strong></div>
        <div style="font-size:10px;color:rgba(148,163,184,0.5);margin-top:2px">💡 朝マヅメのフカセが◎ 紀ノ川河口もチヌ狙い目</div>
      </div>
    </div>

    <!-- 2位 駿河湾 -->
    <div style="display:flex;align-items:flex-start;gap:10px;background:linear-gradient(135deg,rgba(249,115,22,0.04),transparent);border:1px solid rgba(249,115,22,0.08);border-radius:12px;padding:10px 12px">
      <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ef4444);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0;margin-top:2px">2</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="zen" style="font-size:15px;font-weight:900">駿河湾・伊豆</span>
          <span style="font-size:14px">🔥🔥🔥</span>
        </div>
        <div style="font-size:11px;color:rgba(148,163,184,0.8);margin-top:1px"><strong style="color:#fbbf24">アオリイカ</strong>エギング / <strong style="color:#fbbf24">メジナ</strong>フカセ / <strong style="color:#fbbf24">アジ</strong>カゴ釣り</div>
        <div style="font-size:10px;color:rgba(148,163,184,0.5);margin-top:2px">💡 安良里港が好調 エギは3号ピンク系がアタリ</div>
      </div>
    </div>

    <!-- 3位 大阪 -->
    <div style="display:flex;align-items:flex-start;gap:10px;background:linear-gradient(135deg,rgba(249,115,22,0.03),transparent);border:1px solid rgba(249,115,22,0.06);border-radius:12px;padding:10px 12px">
      <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ef4444);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0;margin-top:2px">3</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="zen" style="font-size:15px;font-weight:900">大阪・泉南</span>
          <span style="font-size:14px">🔥🔥🔥</span>
        </div>
        <div style="font-size:11px;color:rgba(148,163,184,0.8);margin-top:1px"><strong style="color:#fbbf24">チヌ41〜47cm</strong>フカセ好調 / <strong style="color:#fbbf24">シーバス62cm</strong>バチ抜け</div>
        <div style="font-size:10px;color:rgba(148,163,184,0.5);margin-top:2px">💡 夕マヅメ〜夜のバチ抜けが最盛期</div>
      </div>
    </div>

    <!-- 4位 東京湾 -->
    <div style="display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:10px 12px">
      <div style="width:24px;height:24px;border-radius:50%;background:rgba(251,191,36,0.2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fbbf24;flex-shrink:0;margin-top:2px">4</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="zen" style="font-size:15px;font-weight:900">東京湾・横浜</span>
          <span style="font-size:14px">🔥🔥</span>
        </div>
        <div style="font-size:11px;color:rgba(148,163,184,0.8);margin-top:1px"><strong style="color:#fbbf24">シーバス</strong>バチ抜け本番 / <strong style="color:#fbbf24">メバル15〜20cm</strong> / クロダイ40〜50cm</div>
        <div style="font-size:10px;color:rgba(148,163,184,0.5);margin-top:2px">💡 大黒・本牧の海釣り施設でクロダイも◎</div>
      </div>
    </div>

    <!-- 5位 瀬戸内 -->
    <div style="display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:10px 12px">
      <div style="width:24px;height:24px;border-radius:50%;background:rgba(251,191,36,0.2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fbbf24;flex-shrink:0;margin-top:2px">5</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="zen" style="font-size:15px;font-weight:900">瀬戸内・広島</span>
          <span style="font-size:14px">🔥🔥</span>
        </div>
        <div style="font-size:11px;color:rgba(148,163,184,0.8);margin-top:1px"><strong style="color:#fbbf24">メバル18〜20cm</strong>好調 / <strong style="color:#fbbf24">グレ26〜30cm</strong> / マダイ</div>
        <div style="font-size:10px;color:rgba(148,163,184,0.5);margin-top:2px">💡 呉・警固屋エリアのメバルが安定</div>
      </div>
    </div>

    <!-- 6位 福岡 -->
    <div style="display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:10px 12px">
      <div style="width:24px;height:24px;border-radius:50%;background:rgba(251,191,36,0.2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fbbf24;flex-shrink:0;margin-top:2px">6</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="zen" style="font-size:15px;font-weight:900">福岡・北九州</span>
          <span style="font-size:14px">🔥🔥</span>
        </div>
        <div style="font-size:11px;color:rgba(148,163,184,0.8);margin-top:1px"><strong style="color:#fbbf24">サヨリ25cm×11匹</strong> / <strong style="color:#fbbf24">アラカブ×15匹</strong> / アオリイカ接岸</div>
        <div style="font-size:10px;color:rgba(148,163,184,0.5);margin-top:2px">💡 脇田海釣り桟橋で数釣り好調</div>
      </div>
    </div>

    <!-- 7位 知多 -->
    <div style="display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:10px 12px">
      <div style="width:24px;height:24px;border-radius:50%;background:rgba(148,163,184,0.12);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#94a3b8;flex-shrink:0;margin-top:2px">7</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="zen" style="font-size:15px;font-weight:900">知多・三河</span>
          <span style="font-size:14px">🔥🔥</span>
        </div>
        <div style="font-size:11px;color:rgba(148,163,184,0.8);margin-top:1px"><strong style="color:#fbbf24">メバル</strong>シーズンイン / カサゴ テトラ周辺 / シーバス</div>
        <div style="font-size:10px;color:rgba(148,163,184,0.5);margin-top:2px">💡 テトラ際のブラクリでカサゴも狙える</div>
      </div>
    </div>

    <!-- 8位 仙台 -->
    <div style="display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:10px 12px">
      <div style="width:24px;height:24px;border-radius:50%;background:rgba(148,163,184,0.12);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#94a3b8;flex-shrink:0;margin-top:2px">8</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="zen" style="font-size:15px;font-weight:900">仙台・石巻</span>
          <span style="font-size:14px">🔥</span>
        </div>
        <div style="font-size:11px;color:rgba(148,163,184,0.8);margin-top:1px"><strong style="color:#fbbf24">マコガレイ</strong>良型 投げ釣り / <strong style="color:#fbbf24">アイナメ</strong>中型 探り釣り</div>
        <div style="font-size:10px;color:rgba(148,163,184,0.5);margin-top:2px">💡 春の乗っ込み前期 カレイ狙いがベスト</div>
      </div>
    </div>
  </div>

  <!-- 今週のワンポイント -->
  <div style="margin-top:12px;background:rgba(134,239,172,0.06);border:1px solid rgba(134,239,172,0.12);border-radius:12px;padding:10px 14px;display:flex;gap:10px;align-items:flex-start">
    <span style="font-size:20px;flex-shrink:0">📝</span>
    <div>
      <div style="font-size:12px;font-weight:800;color:#86efac;margin-bottom:2px">今週のワンポイント</div>
      <div style="font-size:11px;color:rgba(148,163,184,0.8);line-height:1.5">春の乗っ込みシーズン開幕！<strong style="color:#fbbf24">西日本はグレ・チヌ・マダイ</strong>が絶好調。東京湾は<strong style="color:#fbbf24">バチ抜けシーバス</strong>が最盛期。朝夕マヅメが勝負。</div>
    </div>
  </div>

  <!-- フッター -->
  <div style="margin-top:10px;background:linear-gradient(135deg,rgba(249,115,22,0.1),rgba(239,68,68,0.04));border:1px solid rgba(249,115,22,0.12);border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between">
    <div>
      <div style="font-size:12px;color:rgba(255,255,255,0.75);font-weight:600">各スポットの天気・潮汐・水温を無料チェック</div>
      <div style="font-size:10px;color:rgba(148,163,184,0.45);margin-top:2px">📌 フォローで毎週の釣果速報をお届け</div>
    </div>
    <div class="zen" style="font-size:16px;font-weight:900;background:linear-gradient(135deg,#fbbf24,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;flex-shrink:0">tsurispot.com</div>
  </div>

</div>
</body></html>`;

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(outDir, 'weekly-report.png'), type: 'png' });
  await page.screenshot({ path: join(outDir, 'weekly-report.jpg'), type: 'jpeg', quality: 92 });
  console.log('✓ weekly-report.png & .jpg saved');
  await browser.close();
}

main().catch(console.error);
