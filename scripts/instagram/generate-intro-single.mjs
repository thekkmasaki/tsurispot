import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'out');
mkdirSync(outDir, { recursive: true });

// Instagram feed: 1080x1350 (4:5) が最大表示サイズ
const W = 1080;
const H = 1350;

const fishIconPaths = `
  <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/>
  <path d="M18 12v.5"/>
  <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/>
  <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/>
  <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/>
  <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"/>
`;

const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Zen+Maru+Gothic:wght@500;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    font-family: 'Noto Sans JP', sans-serif;
    color: white;
    background: linear-gradient(170deg, #061e33 0%, #0a3d5c 30%, #0078a8 65%, #0c4a7a 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 50px 50px;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }

  /* 背景デコレーション */
  .bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .bg-c1 { width: 300px; height: 300px; top: -80px; left: -100px; }
  .bg-c2 { width: 200px; height: 200px; bottom: 100px; right: -60px; }
  .bg-c3 { width: 150px; height: 150px; top: 400px; right: 80px; }

  /* ロゴ部分 */
  .logo-section {
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 10;
    margin-bottom: 8px;
  }
  .logo-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #0090c8, #0a3d5c);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    flex-shrink: 0;
  }
  .logo-icon svg {
    width: 50px;
    height: 50px;
  }
  .logo-text {
    font-family: 'Zen Maru Gothic', sans-serif;
    font-weight: 900;
    font-size: 56px;
    letter-spacing: 0.05em;
  }

  /* タグライン */
  .tagline {
    font-size: 26px;
    font-weight: 500;
    opacity: 0.8;
    text-align: center;
    margin-bottom: 32px;
    z-index: 10;
  }

  /* 区切り線 */
  .divider {
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
    margin-bottom: 28px;
    z-index: 10;
  }

  /* 数字セクション */
  .stats-row {
    display: flex;
    gap: 16px;
    width: 100%;
    margin-bottom: 28px;
    z-index: 10;
  }
  .stat-card {
    flex: 1;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px;
    padding: 20px 12px;
    text-align: center;
  }
  .stat-number {
    font-family: 'Zen Maru Gothic', sans-serif;
    font-size: 42px;
    font-weight: 900;
    line-height: 1.1;
  }
  .stat-label {
    font-size: 18px;
    font-weight: 500;
    opacity: 0.75;
    margin-top: 4px;
  }
  .stat-card:nth-child(1) .stat-number { color: #7dd3fc; }
  .stat-card:nth-child(2) .stat-number { color: #86efac; }
  .stat-card:nth-child(3) .stat-number { color: #fcd34d; }

  /* 機能セクション */
  .features-title {
    font-family: 'Zen Maru Gothic', sans-serif;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
    z-index: 10;
    opacity: 0.9;
  }
  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
    z-index: 10;
    margin-bottom: 28px;
  }
  .feature-item {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .feature-emoji {
    font-size: 32px;
    flex-shrink: 0;
    width: 40px;
    text-align: center;
  }
  .feature-text {
    display: flex;
    flex-direction: column;
  }
  .feature-name {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
  }
  .feature-desc {
    font-size: 15px;
    opacity: 0.55;
    margin-top: 2px;
  }

  /* CTA部分 */
  .cta-section {
    z-index: 10;
    text-align: center;
    margin-top: auto;
  }
  .cta-url {
    font-size: 36px;
    font-weight: 900;
    font-family: 'Zen Maru Gothic', sans-serif;
    background: linear-gradient(135deg, #fcd34d, #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  .cta-sub {
    font-size: 20px;
    opacity: 0.6;
  }
</style></head><body>
  <div class="bg-circle bg-c1"></div>
  <div class="bg-circle bg-c2"></div>
  <div class="bg-circle bg-c3"></div>

  <!-- ロゴ -->
  <div class="logo-section">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        ${fishIconPaths}
      </svg>
    </div>
    <span class="logo-text">ツリスポ</span>
  </div>
  <div class="tagline">全国の釣りスポット情報サイト</div>

  <div class="divider"></div>

  <!-- 数字 -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-number">2,781<span style="font-size:24px">+</span></div>
      <div class="stat-label">スポット</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">115</div>
      <div class="stat-label">魚種図鑑</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">47</div>
      <div class="stat-label">都道府県</div>
    </div>
  </div>

  <!-- 機能 -->
  <div class="features-title">各スポットで見れる情報</div>
  <div class="features-grid">
    <div class="feature-item">
      <span class="feature-emoji">&#x2600;&#xFE0F;</span>
      <div class="feature-text">
        <span class="feature-name">天気・気温</span>
        <span class="feature-desc">時間別予報</span>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-emoji">&#x1F30A;</span>
      <div class="feature-text">
        <span class="feature-name">水温</span>
        <span class="feature-desc">リアルタイム</span>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-emoji">&#x1F4A8;</span>
      <div class="feature-text">
        <span class="feature-name">風速・風向</span>
        <span class="feature-desc">安全確認</span>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-emoji">&#x1F319;</span>
      <div class="feature-text">
        <span class="feature-name">潮汐・月齢</span>
        <span class="feature-desc">潮回り確認</span>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-emoji">&#x1F4CA;</span>
      <div class="feature-text">
        <span class="feature-name">混雑予想</span>
        <span class="feature-desc">空いてる時間</span>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-emoji">&#x1F6F0;&#xFE0F;</span>
      <div class="feature-text">
        <span class="feature-name">航空写真</span>
        <span class="feature-desc">上空から確認</span>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-emoji">&#x1F305;</span>
      <div class="feature-text">
        <span class="feature-name">日出・日入</span>
        <span class="feature-desc">マヅメ確認</span>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-emoji">&#x1F41F;</span>
      <div class="feature-text">
        <span class="feature-name">釣れる魚</span>
        <span class="feature-desc">月別・難易度</span>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div class="cta-section">
    <div class="cta-url">tsurispot.com</div>
    <div class="cta-sub">登録不要・完全無料</div>
  </div>
</body></html>`;

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2, // Retina品質
  });

  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // フォント読み込み待ち

  const outPath = join(outDir, 'intro-single.png');
  await page.screenshot({ path: outPath, type: 'png' });
  console.log(`✓ intro-single.png saved (${W}x${H} @2x)`);

  await browser.close();
}

main().catch(console.error);
