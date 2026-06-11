// 一時検証スクリプト: 統合後の整合性チェック
// 1. spot-redirects.json のターゲットがすべて生存slugであること
// 2. 削除した10slugがデータファイルに残っていないこと
// 3. 正準10slugが生存していること
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "src", "lib", "data");

const redirects = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "spot-redirects.json"), "utf8")
);

const deadSlugs = [
  "nichinan-aburatsu", "ichinomiya-kaigan6", "tago-port-tottori",
  "hayakawa-ko-add2", "iwaki-onahama", "sado-ryotsu-port",
  "tappi-misaki", "tappi-zaki", "yoshinogawa-gojo-k8", "yoshinogawa-gojo-detail",
  // 同名復活防止のため追加削除した同一クラスタ
  "nichinan-aburatsu-kou", "nichinan-aburatsu-kou-s8", "sado-ryotsu-ko",
];
const canonicals = [
  "aburatsu-port", "ichinomiya-surf", "iwami-tago-port",
  "odawara-hayakawa-port", "onahama-ko", "sado-ryotsu-kou",
  "tappizaki", "yoshinogawa-gojo",
];

// 生存slug一覧をデータファイルから収集
const liveSlugs = new Set();
const files = fs.readdirSync(DATA_DIR).filter((f) => f.startsWith("spots-") && f.endsWith(".ts"));
for (const file of files) {
  const content = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
  const re = /slug:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(content)) !== null) liveSlugs.add(m[1]);
}

let ok = true;

for (const slug of deadSlugs) {
  if (liveSlugs.has(slug)) { console.error(`NG: 削除済みのはずの ${slug} がまだ存在`); ok = false; }
  if (!redirects[slug]) { console.error(`NG: ${slug} のリダイレクトがない`); ok = false; }
}
for (const slug of canonicals) {
  if (!liveSlugs.has(slug)) { console.error(`NG: 正準 ${slug} が見つからない`); ok = false; }
}
// リダイレクトのターゲットが削除済みslugを指していないか
for (const [from, to] of Object.entries(redirects)) {
  if (deadSlugs.includes(to)) { console.error(`NG: ${from} -> ${to}（削除済みターゲット）`); ok = false; }
}
console.log(`redirect entries: ${Object.keys(redirects).length}`);
console.log(`live slugs: ${liveSlugs.size}`);
console.log(ok ? "ALL OK" : "FAILED");
process.exit(ok ? 0 : 1);
