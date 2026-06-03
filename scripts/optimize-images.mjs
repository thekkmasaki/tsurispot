#!/usr/bin/env node
/**
 * 画像一括圧縮スクリプト（CWV / LCP 改善・OneDrive対応）
 *
 * 背景: next.config.ts が images.unoptimized:true（App Runner の画像最適化バグ
 * 回避で S3/CloudFront 直配信）のため、ブラウザは public/images の生ファイルを
 * そのまま DL する。よって「ファイル自体を小さくする」ことが LCP/ペイロード改善の
 * 唯一かつ最も確実な手段。
 *
 * 方針:
 *  - 拡張子は変えない in-place 再圧縮（参照を一切書き換えない）
 *  - 表示サイズに対し過大な横幅をディレクトリ別にリサイズ
 *      fish/  → 800px（表示は h-32/h-40 バナー or 33vw カード）
 *      blog/  → 1280px（本文/OGP兼用）
 *      spots/ → 1080px（既に WebP 平均 64KB でほぼ no-op＝安全）
 *      その他 → 1600px（monthly/og 等は控えめに）
 *  - 縮小後が元より小さい時だけ上書き＝何度実行しても劣化しないべき等性
 *  - バッファ経由でファイルロック回避（OneDrive対策の名残・無害）
 */

import sharp from 'sharp';
import { readdir, stat, readFile, writeFile } from 'fs/promises';
import path from 'path';

const PUBLIC_IMAGES = 'public/images';
const JPEG_QUALITY = 78;
const WEBP_QUALITY = 80;
const PNG_QUALITY = 78;
// 40KB 未満は対象外（アイコン/ロゴ/装飾の小さな素材を触らない）
const MIN_SIZE = 40 * 1024;

let totalBefore = 0;
let totalAfter = 0;
let processedCount = 0;
let skippedSmall = 0;
let alreadyOptimal = 0;
let errorCount = 0;

/** ディレクトリ別の最大横幅 */
function maxWidthFor(filePath) {
  const p = filePath.replace(/\\/g, '/');
  if (p.includes('/fish/')) return 800;
  if (p.includes('/blog/')) return 1280;
  if (p.includes('/spots/')) return 1080;
  return 1600;
}

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    const sizeBefore = (await stat(filePath)).size;
    if (sizeBefore < MIN_SIZE) { skippedSmall++; return; }

    const inputBuffer = await readFile(filePath);
    const metadata = await sharp(inputBuffer).metadata();

    const maxWidth = maxWidthFor(filePath);
    let pipeline = sharp(inputBuffer);
    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, { withoutEnlargement: true });
    }

    let outputBuffer;
    if (ext === '.png') {
      // 写真系PNGも拡張子維持の原則でPNGのまま再圧縮（参照不変）
      outputBuffer = await pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9, palette: true }).toBuffer();
    } else if (ext === '.webp') {
      outputBuffer = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
    } else {
      outputBuffer = await pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true }).toBuffer();
    }

    totalBefore += sizeBefore;
    // 縮小できた時だけ上書き（べき等性）
    if (outputBuffer.length < sizeBefore) {
      await writeFile(filePath, outputBuffer);
      totalAfter += outputBuffer.length;
      processedCount++;
      const savings = ((1 - outputBuffer.length / sizeBefore) * 100).toFixed(1);
      console.log(`✓ ${path.relative(PUBLIC_IMAGES, filePath)}: ${(sizeBefore / 1024).toFixed(0)}KB → ${(outputBuffer.length / 1024).toFixed(0)}KB (-${savings}%)`);
    } else {
      totalAfter += sizeBefore;
      alreadyOptimal++;
    }
  } catch (err) {
    errorCount++;
    console.error(`✗ ${path.relative(PUBLIC_IMAGES, filePath)}: ${err.message}`);
  }
}

async function main() {
  console.log('画像圧縮開始 (CWV/LCP)...\n');
  const files = await getAllFiles(PUBLIC_IMAGES);
  console.log(`走査: ${files.length} 個（40KB未満は自動スキップ）\n`);

  for (const file of files) {
    await optimizeImage(file);
  }

  console.log(`\n=== 結果 ===`);
  console.log(`圧縮: ${processedCount} 個 / 既に最適: ${alreadyOptimal} 個 / 小さくスキップ: ${skippedSmall} 個 / エラー: ${errorCount} 個`);
  if (totalBefore > 0) {
    console.log(`対象合計: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
    console.log(`削減: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)}MB (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`);
  }
}

main().catch(console.error);
