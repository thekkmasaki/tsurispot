// TsuriSpot ヒーロー画像監査: インベントリ抽出
// 全 src/lib/data/spots-*.ts から (slug,name,address,prefecture,areaName,spotType,mainImageUrl,imageAttribution,file,line) を抽出
// 出力: .audit-cache/inventory.json / unique-images.json / slug-to-location.json
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DATA_DIR = path.join(ROOT, "src/lib/data");
const WIKIMEDIA_DIR = path.join(ROOT, "public/images/spots/wikimedia");
const OUT_DIR = path.join(ROOT, ".audit-cache");
fs.mkdirSync(OUT_DIR, { recursive: true });

// --- regions: rXX -> {prefecture, areaName} ---
const regionsSrc = fs.readFileSync(path.join(DATA_DIR, "regions.ts"), "utf8");
const regionMap = {};
for (const m of regionsSrc.matchAll(/\{\s*id:\s*"(r\d+)",\s*prefecture:\s*"([^"]*)",\s*areaName:\s*"([^"]*)"/g)) {
  regionMap[m[1]] = { prefecture: m[2], areaName: m[3] };
}

// --- disk上のwebp実体セット ---
const diskWebp = new Set(
  fs.readdirSync(WIKIMEDIA_DIR).filter((f) => f.endsWith(".webp")),
);

const field = (chunk, re) => {
  const m = chunk.match(re);
  return m ? m[1] : "";
};

const NAME_FLAG_RE = /駅|トイレ|案内図|案内板|郵便局|警察署|消防署|発電所|変電所|ラジオ|放送局|美術館|博物館|看板|標識|モニュメント|記念碑|station|toilet|restroom|signboard|parking|Earth|museum|post.?office|police/i;

const spotFiles = fs
  .readdirSync(DATA_DIR)
  .filter((f) => /^spots.*\.ts$/.test(f) && f !== "spots.ts" && f !== "spots-registry.ts" && f !== "spots-additional.ts" && f !== "spot-count.ts" && f !== "list-spot.ts");

const inventory = [];
const slugToLoc = {};
let dup = 0;

for (const file of spotFiles) {
  const full = path.join(DATA_DIR, file);
  const src = fs.readFileSync(full, "utf8");
  // id: "..." を境界にスポットブロックへ分割（idはスポットの先頭フィールド）
  const idRe = /\bid:\s*"/g;
  const starts = [];
  let mm;
  while ((mm = idRe.exec(src)) !== null) starts.push(mm.index);
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1] : src.length;
    const chunk = src.slice(start, end);
    const mainImageUrl = field(chunk, /mainImageUrl:\s*"([^"]*)"/);
    const slug = field(chunk, /slug:\s*"([^"]+)"/);
    if (!slug) continue; // スポットでないブロックは除外
    if (!mainImageUrl) continue; // ヒーロー画像なし(プレースホルダー)は監査対象外
    const name = field(chunk, /name:\s*"([^"]+)"/);
    const address = field(chunk, /address:\s*"([^"]*)"/);
    const spotType = field(chunk, /spotType:\s*"([^"]+)"/);
    const regionId = field(chunk, /region:\s*region\("(r\d+)"\)/);
    const imageAttribution = field(chunk, /imageAttribution:\s*"([^"]*)"/);
    const region = regionMap[regionId] || { prefecture: "", areaName: "" };
    // mainImageUrl の行番号
    const miIdx = src.indexOf("mainImageUrl", start);
    const line = src.slice(0, miIdx).split("\n").length;

    // group 判定
    let group;
    if (/^https:\/\/upload\.wikimedia\.org\//.test(mainImageUrl)) group = "A";
    else if (/^\/images\/spots\/wikimedia\/.+\.webp$/.test(mainImageUrl)) {
      const fn = mainImageUrl.split("/").pop();
      group = diskWebp.has(fn) ? "B" : "C2";
    } else if (/^\/images\/spots\/wikimedia\/.+\.jpg$/.test(mainImageUrl)) {
      group = "C1";
    } else if (/^https?:\/\//.test(mainImageUrl)) {
      group = "EXT"; // 外部(unsplash/s3/cloudfront等)
    } else {
      group = "SKIP"; // placeholder/default/その他
    }

    const nameFlag = group === "A" ? NAME_FLAG_RE.test(decodeURIComponent(mainImageUrl)) : false;

    if (slugToLoc[slug]) dup++;
    slugToLoc[slug] = { file, line, id: field(chunk, /id:\s*"([^"]+)"/) };

    inventory.push({ slug, name, address, prefecture: region.prefecture, areaName: region.areaName, spotType, file, line, mainImageUrl, imageAttribution, group, nameFlag });
  }
}

// --- unique images ---
const byKey = new Map();
for (const e of inventory) {
  if (e.group !== "A" && e.group !== "B") continue;
  const key = e.group === "A" ? `A:${e.mainImageUrl}` : `B:${e.mainImageUrl}`;
  if (!byKey.has(key)) {
    const localPath = e.group === "A"
      ? path.join(OUT_DIR, "a-group", crypto.createHash("sha1").update(e.mainImageUrl).digest("hex") + ".jpg")
      : path.join(WIKIMEDIA_DIR, e.mainImageUrl.split("/").pop());
    byKey.set(key, { imageKey: key, group: e.group, url: e.mainImageUrl, localPath: path.relative(ROOT, localPath), nameFlag: e.nameFlag, spots: [] });
  }
  byKey.get(key).spots.push({ slug: e.slug, name: e.name, address: e.address, prefecture: e.prefecture, areaName: e.areaName, spotType: e.spotType });
}
const uniqueImages = [...byKey.values()];

// --- 集計 ---
const counts = inventory.reduce((a, e) => ((a[e.group] = (a[e.group] || 0) + 1), a), {});
const uA = uniqueImages.filter((u) => u.group === "A").length;
const uB = uniqueImages.filter((u) => u.group === "B").length;
const flaggedA = uniqueImages.filter((u) => u.group === "A" && u.nameFlag).length;

fs.writeFileSync(path.join(OUT_DIR, "inventory.json"), JSON.stringify(inventory, null, 2));
fs.writeFileSync(path.join(OUT_DIR, "unique-images.json"), JSON.stringify(uniqueImages, null, 2));
fs.writeFileSync(path.join(OUT_DIR, "slug-to-location.json"), JSON.stringify(slugToLoc, null, 2));

console.log("=== インベントリ抽出完了 ===");
console.log("スポットファイル数:", spotFiles.length);
console.log("mainImageUrl 保持スポット数(参照):", inventory.length);
console.log("group別参照数:", counts);
console.log("ユニーク画像: A =", uA, " B =", uB, " 合計 =", uA + uB);
console.log("A群 nameFlag 一次ヒット:", flaggedA);
console.log("slug重複:", dup);
console.log("出力先:", path.relative(ROOT, OUT_DIR));
