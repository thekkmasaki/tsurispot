---
name: spot-generator
description: TsuriSpot のスポットを LLM/外部API/CSV から大量生成する。resumable checkpoint と容量チェック付き。
---

# /spot-generator — スポット大量生成 skill

ツリスポの `FishingSpot` を数千件単位で追加する。データソースは 3 種類選べる。レート切れ中断・再開対応。Docker 2.65GB 制約に届きそうなら自動停止。

## 使い方

```
/spot-generator                                    # ヘルプ
/spot-generator <region>                           # 既定 mode=api, count=200
/spot-generator <region> --count=N --mode=llm|api|csv
/spot-generator --csv=path/to/list.md              # mode=csv 自動
/spot-generator --resume                           # checkpoint から再開
/spot-generator --dry-run                          # 5件試行、ファイル書込なし
/spot-generator --rollback=<run-id>                # 直近 run を取り消し
/spot-generator --status                           # 現行 checkpoint 表示
```

オプション: `--batch-size=50`（既定50）/ `--parallel=3`（既定3、上限固定）

## ルールと制約

- 並列エージェント上限: **3**（ネットワーク負荷軽減）
- WIP コミット粒度: **5ファイル または 1バッチ完了ごと**
- email: `dev@tsurispot.jp`、`Co-Authored-By` は **付けない**
- `master` 直 push 禁止 — 必ず `feature/spot-gen-<region>-<date>` ブランチで PR 経由
- 紹介文の他サイト丸パクリは絶対 NG（既存ルール `.claude/agents/spot-adder.md` 参照）
- description は **オリジナル 200〜400 字**（80字未満は format-spot.mjs が自動拒否）

## 実行フロー

### STEP 1: 引数解釈 + checkpoint確認

```bash
# --resume の場合
node scripts/spot-generator/checkpoint.mjs read
# → 既存 progress.json があれば region/mode/target/branch を引き継ぐ。なければエラー

# 新規実行
RUN_ID="$(date +%Y%m%d-%H%M)-${region-slug}"
BRANCH="feature/spot-gen-${region-slug}-$(date +%Y%m%d)"
git checkout -b "$BRANCH"
node scripts/spot-generator/checkpoint.mjs init \
  --run-id="$RUN_ID" --region="<region>" --mode="<mode>" --target="<N>"
```

### STEP 2: 既存slug集合スナップショット

```bash
mkdir -p "/tmp/spotgen/$RUN_ID"
node scripts/spot-generator/dump-existing-spots.mjs --out="/tmp/spotgen/$RUN_ID/existing.json"
# → 既存全スポットの {slug, name, lat, lng} を JSON 化
# → 同時に /tmp/existing-{slugs,names,coords}.json も書く（validate-new-spots.js 互換）
```

### STEP 3: 地域分解 & データソース取得

#### mode=llm
本セッションの Claude が並列3で WebSearch を回す。クエリ例:
- `{地域}{市町村} 漁港 釣り場`
- `{地域} 海釣り公園`
- `{地域} 防波堤 釣り`

候補から既存 slug を除外し、`/tmp/spotgen/$RUN_ID/candidates-raw.json` に保存。
各候補の description は **本セッションの Claude が `.claude/agents/spot-adder.md` のルール（オリジナル200-400字・丸パクリ禁止・他サイト引用は要約形式）に従って生成**。

#### mode=api
```bash
node scripts/spot-generator/fetch-osm.mjs --prefecture="<県>" --out="/tmp/spotgen/$RUN_ID/osm.json" --limit=500
node scripts/spot-generator/fetch-gsi.mjs --in="/tmp/spotgen/$RUN_ID/osm.json" --out="/tmp/spotgen/$RUN_ID/with-address.json"
```
住所までは API で取れるが、description だけは本セッションの Claude が補完する。

#### mode=csv
```bash
node scripts/spot-generator/parse-csv.mjs --in=path/to/list.csv --out="/tmp/spotgen/$RUN_ID/candidates-raw.json"
# ヘッダ: name,lat,lng,prefecture,city,spotType,fishCandidates,description
```

### STEP 4: バッチ整形 (並列3、1バッチ50件)

候補リストを batch_size ずつに分割。各バッチを並列3で format-spot.mjs に通す:

```bash
node scripts/spot-generator/format-spot.mjs \
  --candidates="/tmp/spotgen/$RUN_ID/candidates-batch-01.json" \
  --existing="/tmp/spotgen/$RUN_ID/existing.json" \
  --run-id="$RUN_ID" \
  --batch-n=1 \
  --out="src/lib/data/spots-gen-${RUN_ID}-01.ts"
```

出力 JSON: `{ok, added_slugs, skipped, near_misses, errors, file}` を checkpoint に追記する。

### STEP 5: 検証パイプライン (バッチごと)

```bash
node scripts/validate-new-spots.js               # slug/name/300m近接/魚種参照/座標範囲
node node_modules/typescript/bin/tsc --noEmit    # 型チェック (next/npx 経由不可な環境向け)
node node_modules/vitest/vitest.mjs run src/lib/data/__tests__/spots.test.ts
```

失敗バッチは `.skip.ts` にリネームし registry から外す。続行可能ならエラーを checkpoint に記録して次バッチへ。

### STEP 6: 容量チェック

```bash
node scripts/spot-generator/capacity-check.mjs --existing="/tmp/spotgen/$RUN_ID/existing.json"
# exit 0=ok, 1=warn, 2=hard
```
- **exit 2** (hard): バッチ追加後の総スポット数 ≥ 8,500 または TS ファイル合計 ≥ 18MB
  → 直前のバッチを `git revert` で巻き戻し、checkpoint 保存して停止
- **exit 1** (warn): 8,200/16MB 超え。続行するが checkpoint.errors に記録

### STEP 7: spots-registry.ts への登録

新規 `spots-gen-${RUN_ID}-XX.ts` の export 名（例: `spotsGen20260527103001B1`）を `spots-registry.ts` に追記:

```ts
// 上部の import 群の末尾に追加
import { spotsGen20260527103001B1 } from "./spots-gen-20260527-1030-fukui-01";

// 配列展開部に追加
...spotsGen20260527103001B1,
```

### STEP 8: WIP コミット

```bash
git add src/lib/data/spots-gen-${RUN_ID}-*.ts src/lib/data/spots-registry.ts
git -c user.email=dev@tsurispot.jp commit -m "WIP: spot-generator ${region} batch ${n} (+${added}件)"
```

### STEP 9: checkpoint 更新

```bash
node scripts/spot-generator/checkpoint.mjs update --json="$(jq -nc '{
  completed_batches: [{n:1, file:"...", added_slugs:[...], skipped:0, committed_sha:"..."}],
  last_added_slug: "...",
  capacity: {total_spots: 8014, ts_bytes: 17234567}
}')"
```

### STEP 10: 完了処理（全バッチ終了後）

```bash
# WIP コミット群を整える（任意）
git log --oneline ${BRANCH}...origin/master | head -10

# push & PR
git push -u origin "$BRANCH"
gh pr create --title "feat: spot-generator ${region} +N件追加" --body "$(cat <<EOF
## Summary
- 追加件数: N件 / 目標 M件
- スキップ: K件
- 近接警告: L件
- 容量推移: A → B 件 / X → Y MB

## Test plan
- [x] validate-new-spots.js pass
- [x] tsc --noEmit pass
- [x] vitest src/lib/data/__tests__/spots.test.ts pass
- [x] capacity-check level=ok or warn

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

最後に `checkpoint.mjs update --json='{"pr_url":"..."}'` で PR URL を記録する。

## エラー時の振る舞い

| 症状 | 対処 |
|------|------|
| slug 重複 | `-2`,`-3` ... 最大5回リネーム。それ以上は skip |
| WebSearch 失敗 | 指数バックオフ 2s/8s/30s リトライ |
| 300m 近接 | 警告のみ。`near-miss.json` に記録 |
| tsc エラー | 該当バッチを `.skip.ts` にリネーム、registry から除外、次バッチ続行 |
| vitest 失敗 | 全停止 + checkpoint 保存 + 「`/spot-generator --resume` で再開可能」と通知 |
| capacity hard | 直前バッチを git revert、checkpoint 保存して停止 |
| レート切れ | checkpoint が常に最新。次セッションで `/spot-generator --resume` |

## ロールバック

```
/spot-generator --rollback=<run-id>
```

1. checkpoint の `completed_batches[].committed_sha` を順に `git revert --no-edit`
2. `/tmp/spotgen/<run-id>/` を `rm -rf`
3. feature ブランチを削除（ユーザー確認後）

## 関連ファイル

- 補助スクリプト: `scripts/spot-generator/*.mjs`
- smoke test: `scripts/spot-generator/__tests__/dry-run.test.mjs`
- vitest config (skill 専用): `scripts/spot-generator/__tests__/vitest.config.mjs`
- 既存個別追加 agent: `.claude/agents/spot-adder.md`（description ルールの DRY 元）
- 既存検証スクリプト: `scripts/validate-new-spots.js`
- データテスト: `src/lib/data/__tests__/spots.test.ts`
- checkpoint: `.claude/state/spot-generation-progress.json`（`.gitignore`）

## smoke test 実行コマンド

```bash
node node_modules/vitest/vitest.mjs run --config scripts/spot-generator/__tests__/vitest.config.mjs
```

6 テスト全 pass で OK。
