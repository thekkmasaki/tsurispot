export const meta = {
  name: 'tsurispot-image-audit',
  description: 'TsuriSpot 全ヒーロー画像(A678+B1211)を視覚監査し、釣り場として不適切な画像を検出・敵対的検証',
  phases: [
    { title: 'Classify', detail: '全バッチを視覚分類' },
    { title: 'Verify', detail: 'bad/grayを敵対的再判定' },
  ],
}

// args: { totalBatches: number }  (make-batches.mjs で 237 を確認済み。argsが無くてもフォールバック)
const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
const totalBatches = parsedArgs?.totalBatches ?? 237
if (!totalBatches) throw new Error('totalBatches unresolved')

const CLASSIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['results'],
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['imageKey', 'localPath', 'spotLabel', 'verdict', 'category', 'confidence', 'reason'],
        properties: {
          imageKey: { type: 'string' },
          localPath: { type: 'string' },
          spotLabel: { type: 'string' },
          verdict: { type: 'string', enum: ['ok', 'bad', 'gray'] },
          category: { type: 'string', enum: ['ok', 'station', 'toilet_sign', 'signboard', 'parking', 'indoor', 'portrait', 'logo_map', 'space', 'unrelated_building', 'shrine_temple', 'monument', 'food', 'animal', 'vehicle', 'mismatch', 'other'] },
          confidence: { type: 'number' },
          reason: { type: 'string' },
        },
      },
    },
  },
}

const VERIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['results'],
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['imageKey', 'finalVerdict', 'reason'],
        properties: {
          imageKey: { type: 'string' },
          finalVerdict: { type: 'string', enum: ['bad', 'ok'] },
          reason: { type: 'string' },
        },
      },
    },
  },
}

const classifyPrompt = (id) => `あなたは釣りスポット情報サイト TsuriSpot の画像品質監査官。各画像が「釣りスポット詳細ページのヒーロー画像」として妥当かを厳格に判定する。

手順:
1. ファイル \`.audit-cache/batches/batch-${id}.json\` を Read する。\`items[]\` に { imageKey, localPath, group, nameFlag, spots[{name,address,spotType}] } が入っている。
2. 各 item について localPath の画像を Read して実際に見る。spots はその画像を使っているスポット（名前・所在地・種別）。
3. 各 item を判定し、結果に必ず item と同じ imageKey、同じ localPath、spotLabel(先頭スポットの "名前(spotType)") を入れる。

判定基準:
- verdict="ok": 海/港/漁港/堤防/防波堤/磯/岩場/砂浜/サーフ/海岸線/河川/渓流/湖/ダム/池/運河/河口/水辺/船/桟橋/釣り公園/釣り人/釣り風景/灯台のある港 など、釣り場の雰囲気が伝わる屋外の水辺風景。
- verdict="bad": 水辺が写らず釣り場と無関係。例) 電車の駅舎・ホーム・線路・車両(station) / トイレや館内案内サイン(toilet_sign) / 道路標識・看板(signboard) / 駐車場(parking) / 屋内・室内(indoor) / 人物の顔アップ(portrait) / ロゴ・図表・地図・イラスト(logo_map) / 宇宙・天体(space) / 無関係な建物・施設(unrelated_building) / 寺社・鳥居(shrine_temple) / 記念碑・像(monument) / 料理・食べ物(food) / 動物・魚の接写のみ(animal) / 車・バス・自転車(vehicle)。
  ※「水辺が一切写らない陸上の施設・モノ」は原則 bad。
- verdict="gray": 判断に迷うもの。例) 海辺の駅で海が大きく写る、港に隣接する建物だが水面も主役級、水辺だが種別と食い違う(mismatch) 等。reason に両論を書き confidence を下げる。
- spotType と内容が食い違う場合(例 spotType=river なのに明らかな海港)は category="mismatch", verdict="gray"。

confidence は 0.0〜1.0。reason は日本語1〜2文で「何が写っているか＋判定理由」。
batch-${id}.json の全 item を漏れなく判定して results に入れること。`

const verifyPrompt = (chunk) => `あなたは敵対的検証(弁護人)。前段で bad/gray と疑われた釣りスポット画像を改めて見て、本当に釣り場ヒーロー画像として不適切か反証せよ。海・水辺・港・磯・砂浜・川・湖・釣り要素が少しでも主役級に写っていれば finalVerdict="ok"(救済)、駅・トイレ/案内サイン・看板・室内・無関係な建物/施設/モノが主役なら "bad"。

対象(各 localPath を Read して画像を見る):
${chunk.map((v, i) => `${i + 1}. imageKey=${v.imageKey}\n   localPath=${v.localPath}\n   spot=${v.spotLabel}\n   前段=${v.verdict}/${v.category}: ${v.reason}`).join('\n')}

各 imageKey について finalVerdict(bad|ok) と reason(日本語1文)を返す。`

// ---- Phase 1: Classify ----
phase('Classify')
const batchIds = Array.from({ length: totalBatches }, (_, i) => String(i).padStart(3, '0'))
const classifyResults = await parallel(
  batchIds.map((id) => () =>
    agent(classifyPrompt(id), { label: `classify:${id}`, phase: 'Classify', schema: CLASSIFY_SCHEMA })
  )
)
const allVerdicts = classifyResults.filter(Boolean).flatMap((r) => r.results || [])
log(`分類完了: ${allVerdicts.length}件 (ok=${allVerdicts.filter(v => v.verdict === 'ok').length} bad=${allVerdicts.filter(v => v.verdict === 'bad').length} gray=${allVerdicts.filter(v => v.verdict === 'gray').length})`)

// ---- Phase 1.5: Adversarial verify (bad/gray) ----
phase('Verify')
const flagged = allVerdicts.filter((v) => v.verdict === 'bad' || v.verdict === 'gray')
const FV = 8
const flaggedChunks = []
for (let i = 0; i < flagged.length; i += FV) flaggedChunks.push(flagged.slice(i, i + FV))

const verifyResults = await parallel(
  flaggedChunks.map((chunk, ci) => () =>
    agent(verifyPrompt(chunk), { label: `verify:${String(ci).padStart(3, '0')}`, phase: 'Verify', schema: VERIFY_SCHEMA })
  )
)
const finalVerdicts = verifyResults.filter(Boolean).flatMap((r) => r.results || [])
const confirmedBadKeys = new Set(finalVerdicts.filter((v) => v.finalVerdict === 'bad').map((v) => v.imageKey))
const confirmedBad = flagged.filter((v) => confirmedBadKeys.has(v.imageKey))
log(`敵対的検証完了: flagged=${flagged.length} → 確定bad=${confirmedBad.length} (救済=${flagged.length - confirmedBad.length})`)

return { allVerdicts, flagged, finalVerdicts, confirmedBad }
