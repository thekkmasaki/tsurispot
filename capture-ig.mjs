import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1080 });

const fileUrl = pathToFileURL(resolve('instagram-post.html')).href;
await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
await page.screenshot({ path: 'instagram-post.png', type: 'png' });
await browser.close();
console.log('Done: instagram-post.png');
