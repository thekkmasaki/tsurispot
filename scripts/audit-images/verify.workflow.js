export const meta = {
  name: 'tsurispot-image-verify',
  description: 'flagged(bad/gray)画像を敵対的に再判定し誤検出を救済。結果をファイルに書き出す',
  phases: [{ title: 'Verify', detail: 'flaggedバッチを敵対的検証' }],
}

const ROOT = '/Users/masakiieyasu/saas-backup/tsurispot-fresh'
const TOTAL_FBATCHES = 0 // ← aggregate後に flagged-index.json の totalFbatches で更新

const SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['fbatchId', 'written', 'count', 'bad', 'rescued'],
  properties: {
    fbatchId: { type: 'string' },
    written: { type: 'boolean' },
    count: { type: 'number' },
    bad: { type: 'number' },
    rescued: { type: 'number' },
  },
}

const prompt = (id) => `あなたは敵対的検証(弁護人)。前段で bad/gray と疑われた釣りスポット画像を改めて見て、本当に釣り場ヒーロー画像として不適切か反証する。海・水辺・港・磯・砂浜・川・湖・釣り要素が少しでも主役級に写っていれば救済(ok)、駅・トイレ/案内サイン・看板・室内・無関係な建物/施設/モノが主役なら bad。

手順:
1. Read \`${ROOT}/.audit-cache/flagged-batches/fbatch-${id}.json\`。\`items[]\` = { imageKey, localPath, spotLabel, verdict, category, reason }。
2. 各 item の画像を Read する。絶対パス = \`${ROOT}/\` + localPath。
3. 各 item を再判定する。「釣り場のヒーロー画像として使えるか」を基準に、水辺・釣り場要素が主役なら finalVerdict="ok"(救済)、そうでなければ "bad"。前段reasonは参考程度に、必ず自分の目で画像を見て判断する。
4. 全 item の結果を JSON 配列にして Write ツールで \`${ROOT}/.audit-cache/results/verify-${id}.json\` に書き出す。形式:
[{"imageKey":"...","localPath":"...","spotLabel":"...","finalVerdict":"ok|bad","reason":"日本語1文"}, ...]
imageKey/localPath/spotLabel は入力の値をそのまま。全 item を漏れなく含めること。

5. summary を返す: { fbatchId:"${id}", written:true, count:項目数, bad:bad数, rescued:ok数 }。`

phase('Verify')
if (!TOTAL_FBATCHES) throw new Error('TOTAL_FBATCHES が0。aggregate後に更新せよ')
const ids = Array.from({ length: TOTAL_FBATCHES }, (_, i) => String(i).padStart(3, '0'))
const summaries = (await parallel(
  ids.map((id) => () => agent(prompt(id), { label: `verify:${id}`, phase: 'Verify', schema: SUMMARY_SCHEMA }))
)).filter(Boolean)
const t = summaries.reduce((a, s) => ({ count: a.count + s.count, bad: a.bad + s.bad, rescued: a.rescued + s.rescued }), { count: 0, bad: 0, rescued: 0 })
log(`敵対的検証完了: ${summaries.length}/${TOTAL_FBATCHES}バッチ, 計${t.count}件 → 確定bad=${t.bad} 救済=${t.rescued}`)
return { fbatches: summaries.length, totals: t }
