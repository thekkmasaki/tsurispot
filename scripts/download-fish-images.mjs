#!/usr/bin/env node
/**
 * Wikimedia Commons 魚種写真一括ダウンロードスクリプト
 *
 * 学名で検索 → 釣果写真を優先スコアリング → 料理・市場写真を除外
 * → Sharp で最適化 → public/images/fish/{slug}.jpg に保存
 * → CREDITS.md にライセンス出典を自動記録
 *
 * Usage:
 *   node scripts/download-fish-images.mjs                    # 全種（未存在のみ）
 *   node scripts/download-fish-images.mjs --force             # 全種（上書き）
 *   node scripts/download-fish-images.mjs --slug aji,ayu      # 特定slugのみ
 *   node scripts/download-fish-images.mjs --dry-run           # 候補表示のみ
 *   node scripts/download-fish-images.mjs --replace-low-quality  # 100KB以下を差し替え
 */

import sharp from "sharp";
import { readFile, writeFile, mkdir, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const FISH_IMAGE_DIR = path.join(PROJECT_ROOT, "public", "images", "fish");
const CREDITS_PATH = path.join(FISH_IMAGE_DIR, "CREDITS.md");

const MAX_WIDTH = 1200;
const QUALITY = 82;
const RATE_LIMIT_MS = 1200; // 1.2秒間隔（余裕持たせる）
const LOW_QUALITY_THRESHOLD = 100 * 1024; // 100KB

const USER_AGENT = "TsuriSpotBot/1.0 (https://tsurispot.jp; dev@tsurispot.jp)";

// --- 除外・優先フィルタ ---

const EXCLUDE_KEYWORDS = [
  // 英語
  "sashimi", "sushi", "market", "supermarket", "fish market", "fillet",
  "cooking", "dish", "food", "cuisine", "restaurant", "seafood product",
  "dried fish", "package", "prepared", "grilled", "raw fish", "fried",
  "smoked", "canned", "pickled", "fermented", "frozen", "processed",
  "plate", "bowl", "chopstick", "recipe", "meal", "dinner", "lunch",
  "specimen", "museum", "taxidermy", "preserved", "formaldehyde",
  "illustration", "drawing", "painting", "sketch", "diagram", "stamp",
  // 日本語
  "刺身", "寿司", "スーパー", "市場", "料理", "食品", "魚市場",
  "干物", "焼き魚", "煮魚", "フライ", "天ぷら", "標本",
];

const PRIORITY_KEYWORDS = [
  // 英語
  "fishing", "angling", "caught", "catch", "rod", "reel", "lure",
  "recreational fishing", "sport fishing", "fly fishing",
  "hook", "tackle", "angler", "fisherman", "trophy fish",
  "landed", "release", "catch and release",
  // 日本語
  "釣り", "釣果", "アングラー", "ルアー",
];

// --- 魚種データ読み込み ---

async function loadFishData() {
  // TypeScriptファイルからslug, name, scientificNameを正規表現で抽出
  const files = [
    path.join(PROJECT_ROOT, "src/lib/data/fish-sea.ts"),
    path.join(PROJECT_ROOT, "src/lib/data/fish-freshwater.ts"),
    path.join(PROJECT_ROOT, "src/lib/data/fish-brackish.ts"),
  ];

  const fishList = [];
  const seenSlugs = new Set();

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");

    // 各オブジェクトからslug, name, scientificNameを抽出
    const objectBlocks = content.split(/\n  \{/);

    for (const block of objectBlocks) {
      const slugMatch = block.match(/slug:\s*"([^"]+)"/);
      const nameMatch = block.match(/\bname:\s*"([^"]+)"/);
      const sciMatch = block.match(/scientificName:\s*"([^"]+)"/);

      if (slugMatch && nameMatch && sciMatch) {
        const slug = slugMatch[1];
        if (!seenSlugs.has(slug)) {
          seenSlugs.add(slug);
          fishList.push({
            slug,
            name: nameMatch[1],
            scientificName: sciMatch[1],
          });
        }
      }
    }
  }

  return fishList;
}

// --- Wikimedia Commons API ---

async function searchWikimediaCommons(query, limit = 20) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6", // File namespace
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1200",
    format: "json",
    origin: "*",
  });

  const url = `https://commons.wikimedia.org/w/api.php?${params}`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Wikimedia API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.query?.pages) return [];

  return Object.values(data.query.pages)
    .filter((page) => page.imageinfo?.length > 0)
    .map((page) => {
      const info = page.imageinfo[0];
      const meta = info.extmetadata || {};
      return {
        title: page.title,
        url: info.thumburl || info.url,
        originalUrl: info.url,
        width: info.width,
        height: info.height,
        mime: info.mime,
        description: meta.ImageDescription?.value || "",
        categories: meta.Categories?.value || "",
        license: meta.LicenseShortName?.value || "",
        licenseUrl: meta.LicenseUrl?.value || "",
        artist: meta.Artist?.value || "",
        credit: meta.Credit?.value || "",
      };
    });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- スコアリング ---

function scoreImage(image) {
  let score = 0;
  const text = [
    image.title,
    image.description,
    image.categories,
  ].join(" ").toLowerCase();

  // 除外チェック
  for (const kw of EXCLUDE_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) {
      return -1; // 除外
    }
  }

  // 優先キーワード加点
  for (const kw of PRIORITY_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) {
      score += 10;
    }
  }

  // 画像サイズボーナス（大きい画像を優先、ただし上限あり）
  if (image.width >= 800 && image.height >= 600) score += 5;
  if (image.width >= 1200) score += 3;

  // JPEG優先
  if (image.mime === "image/jpeg") score += 2;

  // SVG/GIF/PDF除外
  if (image.mime === "image/svg+xml" || image.mime === "image/gif") return -1;
  if (image.mime === "application/pdf" || image.title?.endsWith(".pdf")) return -1;

  return score;
}

// --- 画像ダウンロード＆最適化 ---

async function downloadAndOptimize(imageUrl, outputPath) {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  // Sharp で最適化
  const metadata = await sharp(buffer).metadata();
  let pipeline = sharp(buffer);

  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  const outputBuffer = await pipeline
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    .toBuffer();

  await writeFile(outputPath, outputBuffer);

  return {
    originalSize: buffer.length,
    optimizedSize: outputBuffer.length,
    width: Math.min(metadata.width || MAX_WIDTH, MAX_WIDTH),
  };
}

// --- CREDITS.md 生成 ---

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "").trim();
}

function buildCreditsEntry(fish, image) {
  const artist = stripHtml(image.artist) || "Unknown";
  const license = image.license || "Unknown";
  const licenseUrl = image.licenseUrl || "";
  const source = image.originalUrl;

  let licenseText = license;
  if (licenseUrl) {
    licenseText = `[${license}](${licenseUrl})`;
  }

  return `| ${fish.name} (${fish.slug}) | ${artist} | ${licenseText} | [Source](${source}) |`;
}

// --- メイン処理 ---

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");
  const replaceLowQuality = args.includes("--replace-low-quality");

  let slugFilter = null;
  const slugIdx = args.indexOf("--slug");
  if (slugIdx !== -1 && args[slugIdx + 1]) {
    slugFilter = args[slugIdx + 1].split(",").map((s) => s.trim());
  }

  console.log("🐟 Wikimedia Commons 魚種写真ダウンロード\n");

  // 魚種データ読み込み
  const allFish = await loadFishData();
  console.log(`  全 ${allFish.length} 魚種を読み込みました`);

  // フィルタ適用
  let targetFish = allFish;
  if (slugFilter) {
    targetFish = allFish.filter((f) => slugFilter.includes(f.slug));
    if (targetFish.length === 0) {
      console.error(`  エラー: 指定されたslugが見つかりません: ${slugFilter.join(", ")}`);
      process.exit(1);
    }
    console.log(`  対象: ${targetFish.map((f) => f.slug).join(", ")}`);
  }

  await mkdir(FISH_IMAGE_DIR, { recursive: true });

  const credits = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let excluded = 0;

  for (const fish of targetFish) {
    const outputPath = path.join(FISH_IMAGE_DIR, `${fish.slug}.jpg`);

    // 既存ファイルチェック
    if (!force && !replaceLowQuality) {
      try {
        await stat(outputPath);
        skipped++;
        continue; // 既に存在
      } catch {
        // ファイルなし → ダウンロード対象
      }
    }

    // --replace-low-quality: 100KB以下のみ差し替え
    if (replaceLowQuality && !force) {
      try {
        const fileStat = await stat(outputPath);
        if (fileStat.size > LOW_QUALITY_THRESHOLD) {
          skipped++;
          continue;
        }
        console.log(`  📏 ${fish.slug}: ${(fileStat.size / 1024).toFixed(0)}KB（低品質 → 差し替え対象）`);
      } catch {
        // ファイルなし → ダウンロード対象
      }
    }

    console.log(`\n🔍 ${fish.name}（${fish.scientificName}）...`);

    // 複数クエリで検索（優先順）
    const queries = [
      `${fish.scientificName} fishing`,
      `${fish.scientificName} caught`,
      fish.scientificName,
    ];

    let bestImage = null;
    let bestScore = -1;

    for (const query of queries) {
      try {
        await sleep(RATE_LIMIT_MS);
        const results = await searchWikimediaCommons(query);

        for (const img of results) {
          const s = scoreImage(img);
          if (s > bestScore) {
            bestScore = s;
            bestImage = img;
          }
        }

        // 釣果写真が見つかった（スコア10以上）場合は追加検索不要
        if (bestScore >= 10) break;
      } catch (err) {
        console.error(`  ⚠ 検索エラー（${query}）: ${err.message}`);
      }
    }

    if (!bestImage || bestScore < 0) {
      console.log(`  ❌ 適切な画像が見つかりません（除外フィルタ）`);
      excluded++;
      continue;
    }

    if (dryRun) {
      console.log(`  📋 候補: ${bestImage.title}`);
      console.log(`     スコア: ${bestScore}  ライセンス: ${bestImage.license}`);
      console.log(`     URL: ${bestImage.url}`);
      const text = [bestImage.title, bestImage.description, bestImage.categories].join(" ").substring(0, 200);
      console.log(`     メタ: ${text}`);
      credits.push(buildCreditsEntry(fish, bestImage));
      downloaded++;
      continue;
    }

    // ダウンロード＆最適化
    try {
      const result = await downloadAndOptimize(bestImage.url, outputPath);
      console.log(
        `  ✅ ${fish.slug}.jpg（${(result.optimizedSize / 1024).toFixed(0)}KB, ${result.width}px）`
      );
      console.log(`     ライセンス: ${bestImage.license} | スコア: ${bestScore}`);
      credits.push(buildCreditsEntry(fish, bestImage));
      downloaded++;
    } catch (err) {
      console.error(`  ❌ ダウンロード失敗: ${err.message}`);
      failed++;
    }
  }

  // CREDITS.md 出力
  if (credits.length > 0) {
    const creditsContent = [
      "# Fish Image Credits (Wikimedia Commons)",
      "",
      "このファイルは `scripts/download-fish-images.mjs` により自動生成されます。",
      "",
      "| 魚種 | 作者 | ライセンス | ソース |",
      "|------|------|-----------|--------|",
      ...credits,
      "",
    ].join("\n");

    if (dryRun) {
      console.log("\n--- CREDITS.md プレビュー ---");
      console.log(creditsContent);
    } else {
      // 既存のCREDITS.mdがあればマージ
      let existing = "";
      try {
        existing = await readFile(CREDITS_PATH, "utf-8");
      } catch {
        // 新規
      }

      if (existing) {
        // 既存のテーブル行を保持しつつ新しい行を追加
        const existingLines = existing.split("\n");
        const existingEntries = existingLines.filter((l) => l.startsWith("| ") && !l.startsWith("| 魚種") && !l.startsWith("|---"));
        const newEntries = credits.filter((c) => {
          const slug = c.match(/\(([^)]+)\)/)?.[1];
          return !existingEntries.some((e) => e.includes(`(${slug})`));
        });
        const allEntries = [...existingEntries, ...newEntries].sort();

        const mergedContent = [
          "# Fish Image Credits (Wikimedia Commons)",
          "",
          "このファイルは `scripts/download-fish-images.mjs` により自動生成されます。",
          "",
          "| 魚種 | 作者 | ライセンス | ソース |",
          "|------|------|-----------|--------|",
          ...allEntries,
          "",
        ].join("\n");

        await writeFile(CREDITS_PATH, mergedContent);
      } else {
        await writeFile(CREDITS_PATH, creditsContent);
      }
      console.log(`\n📝 CREDITS.md を更新しました`);
    }
  }

  // サマリー
  console.log("\n=== 結果 ===");
  console.log(`  ダウンロード: ${downloaded} 件`);
  console.log(`  スキップ（既存）: ${skipped} 件`);
  console.log(`  除外（料理・市場等）: ${excluded} 件`);
  console.log(`  失敗: ${failed} 件`);

  if (dryRun) {
    console.log("\n（--dry-run モード: 実際のダウンロードは行っていません）");
  }
}

main().catch((err) => {
  console.error("致命的エラー:", err);
  process.exit(1);
});
