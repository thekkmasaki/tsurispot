export const meta = {
  name: 'tsurispot-image-classify',
  description: 'TsuriSpot 全ヒーロー画像(1889枚)を視覚分類。冪等(済みバッチskip)・ファイル書き出し方式',
  phases: [{ title: 'Classify', detail: '未処理バッチを視覚分類' }],
}

const ROOT = '/Users/masakiieyasu/saas-backup/tsurispot-fresh'
const TOTAL_BATCHES = 237

const prompt = (id) => `釣りスポット情報サイト TsuriSpot の画像品質監査。バッチ ${id} を処理する。

手順:
1. まず Bash で \`test -f ${ROOT}/.audit-cache/results/classify-${id}.json && echo EXISTS || echo MISSING\` を実行。EXISTS なら既に処理済みなので、それ以上何もせず「skipped ${id}」とだけ答えて終了する。
2. MISSING の場合のみ続行: Read \`${ROOT}/.audit-cache/batches/batch-${id}.json\`。items[] = { imageKey, localPath, group, nameFlag, spots[{name,address,spotType}] }。
3. 各 item の画像を Read（絶対パス = \`${ROOT}/\` + localPath）。spots はその画像を使う釣りスポット。
4. 各 item を判定:
   - verdict="ok": 海/港/漁港/堤防/防波堤/磯/岩場/砂浜/サーフ/海岸線/河川/渓流/湖/ダム/池/運河/河口/水辺/船/桟橋/釣り公園/釣り人/釣り風景 など、釣り場の雰囲気が伝わる屋外の水辺風景。
   - verdict="bad": 水辺が写らず釣り場と無関係（駅舎/ホーム/線路/車両=station, トイレ/館内案内サイン=toilet_sign, 看板/標識=signboard, 駐車場=parking, 屋内=indoor, 人物顔アップ=portrait, ロゴ/図表/地図=logo_map, 宇宙=space, 無関係な建物/施設=unrelated_building, 寺社/鳥居=shrine_temple, 記念碑/像=monument, 料理=food, 動物接写=animal, 車=vehicle）。水辺が一切写らない陸上の施設・モノは原則 bad。
   - verdict="gray": 海辺の駅で海が大きく写る等の境界例。spotType と内容が食い違うなら category="mismatch", verdict="gray"。
5. 全 item の結果を JSON 配列にして Write ツールで \`${ROOT}/.audit-cache/results/classify-${id}.json\` に書き出す。形式:
[{"imageKey":"...","localPath":"...","spotLabel":"先頭スポット名(spotType)","verdict":"ok|bad|gray","category":"...","confidence":0.0,"reason":"日本語1文"}, ...]
imageKey/localPath は batch の値をそのまま。batch の全 item を漏れなく含めること。reason は簡潔に1文。
6. 書き出し後「done ${id} (N items)」とだけ答える。`

phase('Classify')
const ids = Array.from({ length: TOTAL_BATCHES }, (_, i) => String(i).padStart(3, '0'))
const results = await parallel(
  ids.map((id) => () => agent(prompt(id), { label: `classify:${id}`, phase: 'Classify' }))
)
log(`分類ラウンド完了: ${results.filter(Boolean).length}/${TOTAL_BATCHES} エージェント完了`)
return { completed: results.filter(Boolean).length }
