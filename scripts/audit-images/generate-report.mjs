import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, ".audit-cache");
const all = JSON.parse(fs.readFileSync(path.join(OUT, "all-verdicts.json"), "utf8"));
const inv = JSON.parse(fs.readFileSync(path.join(OUT, "inventory.json"), "utf8"));
const badSpots = JSON.parse(fs.readFileSync(path.join(OUT, "bad-spots.json"), "utf8"));

const n = (v) => all.filter((x) => x.verdict === v).length;
const badCat = {};
for (const v of all.filter((x) => x.verdict === "bad")) badCat[v.category] = (badCat[v.category] || 0) + 1;
const catRows = Object.entries(badCat).sort((a, b) => b[1] - a[1]);

// 影響スポットの都道府県別
const byPref = {};
for (const s of badSpots) byPref[s.prefecture || "?"] = (byPref[s.prefecture || "?"] || 0) + 1;
const prefRows = Object.entries(byPref).sort((a, b) => b[1] - a[1]).slice(0, 15);

const gray = all.filter((x) => x.verdict === "gray");
const aBad = all.filter((x) => x.verdict === "bad" && x.imageKey.startsWith("A:")).length;
const bBad = all.filter((x) => x.verdict === "bad" && x.imageKey.startsWith("B:")).length;

const catLabel = { unrelated_building: "無関係な建物・施設", station: "駅・駅舎・線路", shrine_temple: "寺社・鳥居", signboard: "看板・標識", monument: "記念碑・像", space: "宇宙・衛星写真", vehicle: "車・乗り物", parking: "駐車場", mismatch: "種別不一致", indoor: "屋内", food: "料理", animal: "動物", logo_map: "ロゴ・地図・図表", portrait: "人物", toilet_sign: "トイレ・案内サイン", aerial: "空撮" };

let md = `# 🎣 TsuriSpot ヒーロー画像 視覚監査レポート

## 概要
スポット詳細ページのヒーロー画像(\`mainImageUrl\`)に、釣り場と無関係な画像（公衆トイレ案内図・駅・宇宙写真・ショッピングモール等）が大量に混入していた問題を、全画像の視覚監査(Claude Vision)で検出し、**確定badを全てプレースホルダー化**した。

発端: スポット「平磯海づり公園」のヒーロー画像が「山陽東垂水駅トイレ案内図」(Wikimedia Commons) になっていた。

## 監査結果
- **監査対象**: ${all.length} 枚（直Commons URL ${all.filter(x=>x.imageKey.startsWith("A:")).length} ＋ ローカルwebp ${all.filter(x=>x.imageKey.startsWith("B:")).length}）
- **ok（釣り場として妥当）**: ${n("ok")} 枚
- **bad（不適切）**: ${n("bad")} 枚（A群 ${aBad} ＋ B群 ${bBad}）
- **gray（境界・要レビュー）**: ${n("gray")} 枚 ← 今回は現状維持
- **bad率**: ${(n("bad") / all.length * 100).toFixed(1)}%

## 対応
- 確定bad画像 **${[...new Set(badSpots.map(s=>s.imageKey))].length}** 枚 → 影響スポット **${badSpots.length}** 件の \`mainImageUrl\` を \`""\` に、\`imageAttribution\` を除去。
- → \`SpotImage\` コンポーネントが spotType別の美しいグラデーション・プレースホルダーを自動表示。
- 変更ファイル: ${new Set(badSpots.map(s=>s.file)).size} 個の \`src/lib/data/spots-*.ts\`。
- 紹介文・座標・釣果データ等は一切変更なし（画像フィールドのみ）。

## bad カテゴリ内訳
| カテゴリ | 件数 |
|---|---:|
${catRows.map(([c, v]) => `| ${catLabel[c] || c} | ${v} |`).join("\n")}

## 影響スポット 都道府県別 TOP15
| 都道府県 | 件数 |
|---|---:|
${prefRows.map(([p, v]) => `| ${p} | ${v} |`).join("\n")}

## gray（${gray.length}枚・現状維持・後日レビュー候補）
海辺の駅で海が写る等の境界例。誤って良画像を消さないよう今回は据え置き。
${gray.slice(0, 30).map((g) => `- ${g.spotLabel}: ${g.reason}`).join("\n")}
${gray.length > 30 ? `\n…他 ${gray.length - 30} 件（\`.audit-cache/flagged.json\` 参照）` : ""}

## 手法
1. 全 \`mainImageUrl\` を抽出（A群=直Commons URL、B群=ローカルwebp）
2. A群画像をDL、全画像を480pxに縮小
3. Claude Vision エージェントを並列起動し、スポット名・所在地を文脈として各画像を ok/bad/gray 判定（8枚/バッチ × 237バッチ）
4. 確定badを \`mainImageUrl: ""\` へ置換しプレースホルダー化
5. \`tsc --noEmit\` / \`vitest\` / \`eslint\` で検証

---
*この監査は Claude Code により自動実行。判定ログは \`.audit-cache/\`（gitignore）に保存。*
`;

fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs/image-audit-report.md"), md);
console.log("レポート生成: docs/image-audit-report.md");
console.log(`bad=${n("bad")} ok=${n("ok")} gray=${n("gray")} 影響スポット=${badSpots.length} ファイル=${new Set(badSpots.map(s=>s.file)).size}`);
