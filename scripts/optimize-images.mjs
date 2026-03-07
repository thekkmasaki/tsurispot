#!/usr/bin/env node
/**
 * 画像一括圧縮スクリプト（OneDrive対応）
 * - バッファ経由でファイルロック回避
 * - 500KB以上のJPG/JPEG/PNGを圧縮
 */

import sharp from 'sharp';
import { readdir, stat, readFile, writeFile } from 'fs/promises';
import path from 'path';

const PUBLIC_IMAGES = 'public/images';
const MAX_WIDTH = 1200;
const QUALITY = 80;
const MIN_SIZE = 500 * 1024;

let totalBefore = 0;
let totalAfter = 0;
let processedCount = 0;
let errorCount = 0;

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    // Read entire file into buffer to avoid OneDrive lock issues
    const inputBuffer = await readFile(filePath);
    const sizeBefore = inputBuffer.length;

    if (sizeBefore < MIN_SIZE) return;

    totalBefore += sizeBefore;

    const metadata = await sharp(inputBuffer).metadata();
    let pipeline = sharp(inputBuffer);

    if (metadata.width && metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
    }

    let outputBuffer;
    if (ext === '.png') {
      outputBuffer = await pipeline.png({ quality: QUALITY, compressionLevel: 9 }).toBuffer();
    } else {
      outputBuffer = await pipeline.jpeg({ quality: QUALITY, progressive: true, mozjpeg: true }).toBuffer();
    }

    if (outputBuffer.length < sizeBefore) {
      await writeFile(filePath, outputBuffer);
      totalAfter += outputBuffer.length;
      processedCount++;
      const savings = ((1 - outputBuffer.length / sizeBefore) * 100).toFixed(1);
      console.log(`✓ ${path.basename(filePath)}: ${(sizeBefore / 1024 / 1024).toFixed(1)}MB → ${(outputBuffer.length / 1024).toFixed(0)}KB (-${savings}%)`);
    } else {
      totalAfter += sizeBefore;
      console.log(`- ${path.basename(filePath)}: 既に最適`);
    }
  } catch (err) {
    errorCount++;
    console.error(`✗ ${path.basename(filePath)}: ${err.message}`);
  }
}

async function main() {
  console.log('画像圧縮開始...\n');
  const files = await getAllFiles(PUBLIC_IMAGES);

  const largeFiles = [];
  for (const f of files) {
    const buf = await readFile(f);
    if (buf.length >= MIN_SIZE) largeFiles.push(f);
  }
  console.log(`${largeFiles.length} 個の大きな画像を圧縮します\n`);

  for (const file of largeFiles) {
    await optimizeImage(file);
  }

  console.log(`\n=== 結果 ===`);
  console.log(`圧縮: ${processedCount} 個`);
  console.log(`エラー: ${errorCount} 個`);
  if (totalBefore > 0) {
    console.log(`前: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → 後: ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
    console.log(`削減: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)}MB (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`);
  }
}

main().catch(console.error);
