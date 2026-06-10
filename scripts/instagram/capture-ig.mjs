import puppeteer from 'puppeteer';
import { dirname, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// このスクリプトと同じディレクトリ（scripts/instagram/）を基準にパスを解決する
const scriptDir = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(scriptDir, 'instagram-post.html');
const pngPath = resolve(scriptDir, 'instagram-post.png');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1080 });

const fileUrl = pathToFileURL(htmlPath).href;
await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
await page.screenshot({ path: pngPath, type: 'png' });
await browser.close();
console.log(`Done: ${pngPath}`);
