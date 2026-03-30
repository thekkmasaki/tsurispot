import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'out');
mkdirSync(outDir, { recursive: true });

const W = 1080;
const H = 1920;

const commonStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Zen+Maru+Gothic:wght@500;700;900&display=swap');
  body {
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    font-family: 'Noto Sans JP', sans-serif;
    color: white;
    -webkit-font-smoothing: antialiased;
  }
`;

const slides = [
  // Slide 1: Title
  {
    name: 'slide1-title',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      ${commonStyles}
      body {
        background: linear-gradient(160deg, #0a2a4a 0%, #0c4a7a 35%, #0078a8 60%, #0a3d5c 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .wave-top, .wave-bottom {
        position: absolute;
        width: 100%;
        left: 0;
      }
      .wave-top { top: 0; }
      .wave-bottom { bottom: 0; transform: rotate(180deg); }
      .wave-top svg, .wave-bottom svg { width: 100%; display: block; }

      .particles {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        overflow: hidden;
      }
      .particle {
        position: absolute;
        background: rgba(255,255,255,0.08);
        border-radius: 50%;
      }

      .logo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        z-index: 10;
      }
      .logo-icon {
        width: 160px;
        height: 160px;
        background: linear-gradient(135deg, #0090c8, #0a3d5c);
        border-radius: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      }
      .logo-icon svg { width: 100px; height: 100px; }
      .logo-text {
        font-family: 'Zen Maru Gothic', sans-serif;
        font-weight: 900;
        font-size: 96px;
        letter-spacing: 0.05em;
        text-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }
      .tagline {
        font-size: 36px;
        font-weight: 500;
        opacity: 0.9;
        text-align: center;
        line-height: 1.6;
        margin-top: 20px;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
      }
      .badge {
        margin-top: 60px;
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 50px;
        padding: 16px 40px;
        font-size: 28px;
        font-weight: 700;
      }
    </style></head><body>
      <div class="particles">
        <div class="particle" style="width:200px;height:200px;top:10%;left:-5%;"></div>
        <div class="particle" style="width:150px;height:150px;top:60%;right:-3%;"></div>
        <div class="particle" style="width:100px;height:100px;top:30%;right:20%;"></div>
        <div class="particle" style="width:80px;height:80px;top:75%;left:10%;"></div>
      </div>
      <div class="wave-top">
        <svg viewBox="0 0 1080 120" fill="none"><path d="M0 60C180 20 360 100 540 60C720 20 900 100 1080 60V0H0V60Z" fill="rgba(255,255,255,0.05)"/></svg>
      </div>
      <div class="logo-container">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/>
            <path d="M2.5 15.5C4 17 6 17.5 8 17"/>
            <path d="M18 8c2.5-.5 3.5-2 4.5-3.5"/>
            <circle cx="15" cy="12" r="1"/>
          </svg>
        </div>
        <div class="logo-text">ツリスポ</div>
        <div class="tagline">全国の釣りスポット情報が<br>全部ここに</div>
        <div class="badge">🎣 完全無料で使える！</div>
      </div>
      <div class="wave-bottom">
        <svg viewBox="0 0 1080 120" fill="none"><path d="M0 60C180 20 360 100 540 60C720 20 900 100 1080 60V0H0V60Z" fill="rgba(255,255,255,0.05)"/></svg>
      </div>
    </body></html>`
  },

  // Slide 2: Numbers
  {
    name: 'slide2-numbers',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      ${commonStyles}
      body {
        background: linear-gradient(170deg, #0c4a7a 0%, #0a3d5c 50%, #082a3e 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 50px;
        padding: 80px 60px;
      }
      .section-title {
        font-family: 'Zen Maru Gothic', sans-serif;
        font-size: 48px;
        font-weight: 900;
        text-align: center;
        margin-bottom: 20px;
      }
      .stats-grid {
        display: flex;
        flex-direction: column;
        gap: 40px;
        width: 100%;
      }
      .stat-card {
        background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04));
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 32px;
        padding: 50px 40px;
        text-align: center;
        backdrop-filter: blur(10px);
      }
      .stat-emoji {
        font-size: 64px;
        margin-bottom: 16px;
        display: block;
      }
      .stat-number {
        font-family: 'Zen Maru Gothic', sans-serif;
        font-size: 96px;
        font-weight: 900;
        background: linear-gradient(135deg, #fff, #a8d8ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1.1;
      }
      .stat-label {
        font-size: 32px;
        font-weight: 500;
        opacity: 0.8;
        margin-top: 8px;
      }
      .stat-card:nth-child(1) { background: linear-gradient(135deg, rgba(0,150,220,0.25), rgba(0,80,130,0.15)); }
      .stat-card:nth-child(2) { background: linear-gradient(135deg, rgba(0,180,120,0.25), rgba(0,100,80,0.15)); }
      .stat-card:nth-child(3) { background: linear-gradient(135deg, rgba(220,120,0,0.25), rgba(150,60,0,0.15)); }
    </style></head><body>
      <div class="section-title">ツリスポの規模</div>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-emoji">📍</span>
          <div class="stat-number">2,781+</div>
          <div class="stat-label">釣りスポット掲載</div>
        </div>
        <div class="stat-card">
          <span class="stat-emoji">🐟</span>
          <div class="stat-number">115</div>
          <div class="stat-label">魚種図鑑</div>
        </div>
        <div class="stat-card">
          <span class="stat-emoji">🗾</span>
          <div class="stat-number">47</div>
          <div class="stat-label">都道府県カバー</div>
        </div>
      </div>
    </body></html>`
  },

  // Slide 3: Features
  {
    name: 'slide3-features',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      ${commonStyles}
      body {
        background: linear-gradient(170deg, #082a3e 0%, #0a3d5c 40%, #0c4a7a 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 50px;
        gap: 40px;
      }
      .section-title {
        font-family: 'Zen Maru Gothic', sans-serif;
        font-size: 44px;
        font-weight: 900;
        text-align: center;
        margin-bottom: 10px;
      }
      .subtitle {
        font-size: 28px;
        opacity: 0.7;
        text-align: center;
        margin-top: -20px;
      }
      .features-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        width: 100%;
      }
      .feature-card {
        background: linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03));
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 24px;
        padding: 32px 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .feature-icon {
        font-size: 48px;
        display: block;
      }
      .feature-name {
        font-size: 26px;
        font-weight: 700;
        line-height: 1.3;
      }
      .feature-desc {
        font-size: 20px;
        opacity: 0.6;
        line-height: 1.4;
      }
    </style></head><body>
      <div class="section-title">各スポットで<br>こんな情報が見れる！</div>
      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-icon">🌤</span>
          <div class="feature-name">天気予報</div>
          <div class="feature-desc">気温もわかる</div>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌊</span>
          <div class="feature-name">水温</div>
          <div class="feature-desc">リアルタイム</div>
        </div>
        <div class="feature-card">
          <span class="feature-icon">💨</span>
          <div class="feature-name">風速・風向</div>
          <div class="feature-desc">時間別予報</div>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌅</span>
          <div class="feature-name">日出・日入</div>
          <div class="feature-desc">朝マヅメ確認</div>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌙</span>
          <div class="feature-name">潮汐・月齢</div>
          <div class="feature-desc">潮回り確認</div>
        </div>
        <div class="feature-card">
          <span class="feature-icon">📊</span>
          <div class="feature-name">混雑予想</div>
          <div class="feature-desc">空いてる時間帯</div>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🛰</span>
          <div class="feature-name">航空写真</div>
          <div class="feature-desc">上空から確認</div>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🐟</span>
          <div class="feature-name">釣れる魚</div>
          <div class="feature-desc">月別・難易度</div>
        </div>
      </div>
    </body></html>`
  },

  // Slide 4: Satellite/Aerial Photo Feature
  {
    name: 'slide4-satellite',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      ${commonStyles}
      body {
        background: linear-gradient(170deg, #0a3d5c 0%, #0c4a7a 50%, #0078a8 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 50px;
        gap: 40px;
        position: relative;
      }
      .section-title {
        font-family: 'Zen Maru Gothic', sans-serif;
        font-size: 44px;
        font-weight: 900;
        text-align: center;
        z-index: 10;
      }
      .mockup-container {
        width: 100%;
        max-width: 900px;
        z-index: 10;
      }
      .phone-frame {
        background: #1a1a2e;
        border-radius: 40px;
        padding: 16px;
        box-shadow: 0 30px 80px rgba(0,0,0,0.5);
        border: 2px solid rgba(255,255,255,0.1);
      }
      .phone-screen {
        border-radius: 28px;
        overflow: hidden;
        background: #0d1117;
        position: relative;
      }
      .map-view {
        width: 100%;
        height: 700px;
        background:
          linear-gradient(45deg, #1a3a5c 25%, transparent 25%),
          linear-gradient(-45deg, #1a4a6c 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #1a3a5c 75%),
          linear-gradient(-45deg, transparent 75%, #1a4a6c 75%);
        background-size: 40px 40px;
        background-color: #0d2840;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .map-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background:
          radial-gradient(ellipse at 30% 40%, rgba(0,100,150,0.4) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 60%, rgba(0,80,120,0.3) 0%, transparent 50%);
      }
      /* Simplified coastline */
      .coastline {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
      }
      .land {
        position: absolute;
        background: linear-gradient(135deg, #2d5a3d, #3a6b4a);
        border-radius: 20px;
      }
      .land-1 { width: 60%; height: 45%; top: 0; left: 0; border-radius: 0 0 80px 0; }
      .land-2 { width: 35%; height: 30%; bottom: 0; right: 0; border-radius: 60px 0 0 0; }
      .sea {
        position: absolute;
        background: linear-gradient(135deg, #0a4a7a, #0c5a8a);
      }
      /* Fishing spot markers */
      .marker {
        position: absolute;
        width: 40px;
        height: 40px;
        background: #ff6b35;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(255,107,53,0.5);
        z-index: 5;
      }
      .marker::after {
        content: '🐟';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
        font-size: 18px;
      }
      .marker-1 { top: 35%; left: 55%; }
      .marker-2 { top: 50%; left: 40%; }
      .marker-3 { top: 25%; left: 70%; }
      .marker-pulse {
        position: absolute;
        width: 60px;
        height: 60px;
        background: rgba(255,107,53,0.2);
        border-radius: 50%;
        top: 30%;
        left: 52%;
        z-index: 4;
      }
      .status-bar {
        background: rgba(0,0,0,0.6);
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 22px;
        font-weight: 500;
      }
      .status-bar .icon { font-size: 28px; }
      .zoom-label {
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.6);
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 18px;
        z-index: 5;
      }

      .caption {
        font-size: 30px;
        font-weight: 500;
        text-align: center;
        opacity: 0.85;
        line-height: 1.6;
        z-index: 10;
      }
      .highlight {
        color: #ffcc00;
        font-weight: 700;
      }
    </style></head><body>
      <div class="section-title">🛰 航空写真で<br>釣り場を確認！</div>
      <div class="mockup-container">
        <div class="phone-frame">
          <div class="phone-screen">
            <div class="status-bar">
              <span class="icon">🛰</span>
              <span>航空写真モード</span>
            </div>
            <div class="map-view">
              <div class="coastline">
                <div class="land land-1"></div>
                <div class="land land-2"></div>
              </div>
              <div class="map-overlay"></div>
              <div class="marker marker-1"></div>
              <div class="marker marker-2"></div>
              <div class="marker marker-3"></div>
              <div class="marker-pulse"></div>
              <div class="zoom-label">Zoom: 16x</div>
            </div>
          </div>
        </div>
      </div>
      <div class="caption">
        堤防の形や足場の位置が<br>
        <span class="highlight">上空から丸わかり！</span>
      </div>
    </body></html>`
  },

  // Slide 5: CTA
  {
    name: 'slide5-cta',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      ${commonStyles}
      body {
        background: linear-gradient(160deg, #0a2a4a 0%, #0078a8 50%, #0c4a7a 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 50px;
        position: relative;
      }
      .particles {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        overflow: hidden;
      }
      .particle {
        position: absolute;
        background: rgba(255,255,255,0.06);
        border-radius: 50%;
      }
      .logo-icon {
        width: 120px;
        height: 120px;
        background: linear-gradient(135deg, #0090c8, #0a3d5c);
        border-radius: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        z-index: 10;
      }
      .logo-icon svg { width: 72px; height: 72px; }
      .logo-text {
        font-family: 'Zen Maru Gothic', sans-serif;
        font-weight: 900;
        font-size: 80px;
        text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10;
      }
      .url {
        font-size: 44px;
        font-weight: 700;
        background: linear-gradient(135deg, #ffcc00, #ff9500);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        z-index: 10;
      }
      .cta-badge {
        background: linear-gradient(135deg, #ff6b35, #ff9500);
        border-radius: 60px;
        padding: 24px 60px;
        font-size: 36px;
        font-weight: 900;
        box-shadow: 0 10px 40px rgba(255,107,53,0.4);
        z-index: 10;
      }
      .sub-text {
        font-size: 28px;
        opacity: 0.7;
        text-align: center;
        line-height: 1.6;
        z-index: 10;
      }
      .features-mini {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
        z-index: 10;
      }
      .feature-pill {
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 30px;
        padding: 12px 24px;
        font-size: 22px;
        font-weight: 500;
      }
    </style></head><body>
      <div class="particles">
        <div class="particle" style="width:250px;height:250px;top:5%;left:-10%;"></div>
        <div class="particle" style="width:180px;height:180px;bottom:10%;right:-5%;"></div>
        <div class="particle" style="width:120px;height:120px;top:40%;right:15%;"></div>
      </div>
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/>
          <path d="M2.5 15.5C4 17 6 17.5 8 17"/>
          <path d="M18 8c2.5-.5 3.5-2 4.5-3.5"/>
          <circle cx="15" cy="12" r="1"/>
        </svg>
      </div>
      <div class="logo-text">ツリスポ</div>
      <div class="url">tsurispot.com</div>
      <div class="cta-badge">🎣 今すぐチェック！</div>
      <div class="sub-text">登録不要・完全無料</div>
      <div class="features-mini">
        <span class="feature-pill">📍 2,781スポット</span>
        <span class="feature-pill">🐟 115魚種</span>
        <span class="feature-pill">🛰 航空写真</span>
        <span class="feature-pill">🌊 水温・潮汐</span>
        <span class="feature-pill">📊 混雑予想</span>
      </div>
    </body></html>`
  }
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  });

  for (const slide of slides) {
    const page = await context.newPage();
    await page.setContent(slide.html, { waitUntil: 'networkidle' });
    // Wait for fonts to load
    await page.waitForTimeout(2000);
    const outPath = join(outDir, `${slide.name}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`✓ ${slide.name}.png saved`);
    await page.close();
  }

  await browser.close();
  console.log(`\nAll ${slides.length} slides saved to ${outDir}`);
}

main().catch(console.error);
