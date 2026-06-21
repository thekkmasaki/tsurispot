# 自己改善エージェント セットアップ手順

24時間稼働PCで、ツリスポ自己改善エージェントを無人運用するための手動準備。
コードは実装済み。ここに書かれた「人間しかできない準備」を順に実施する。

---

## 0. 前提
- PCは24h起動・スリープしない（電源プラン → スリープ「なし」）
- `claude` CLI が PATH にあり、ログイン済み（`claude` 単体が動く）
- `gh` CLI がインストール・認証済み（`gh auth status` がOK）
- tsurispot が git リポジトリで origin=GitHub に push できる

### 強く推奨: 専用クローンで無人運用する
無人エージェントを**あなたが普段編集している作業ツリーと共有しない**こと。共有すると、
あなたの未コミット作業がある間はサイクルが安全のためスキップされる（作業破壊を防ぐ仕様）。
専用クローンを作り、そこでタスクスケジューラを回すと衝突がない:
```bash
git clone https://github.com/thekkmasaki/tsurispot.git C:/tsurispot-agent
# 以降 ops/*, scripts/agent/run-cycle.mjs は C:/tsurispot-agent 側で実行
```
secrets/ と .env.local（webhook等）は専用クローンにもコピーする。

---

## 1. `.claude/settings.json` に権限を追加（**手動・最重要**）

> エージェントが自分の権限を勝手に拡張するのを防ぐため、この変更は自動適用がブロックされる。
> 下記の `allow` / `deny` を手で反映すること。ヘッドレス実行では権限プロンプトに答えられないため、事前許可が必須。

`tsurispot/.claude/settings.json` を以下にする（既存 allow/deny に追記）:

```json
{
  "permissions": {
    "allow": [
      "Bash(npx tsc --noEmit)",
      "Bash(npx eslint *)",
      "Bash(npx vitest run *)",
      "Bash(git status*)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git checkout -b *)",
      "Bash(git push origin feature/*)",
      "Bash(git push origin auto/*)",
      "Bash(node scripts/metrics/*)",
      "Bash(node scripts/agent/*)",
      "Bash(gh pr create *)",
      "Bash(gh pr merge *)",
      "Bash(gh pr view *)",
      "Bash(gh pr list *)",
      "Bash(gh pr edit *)",
      "Bash(gh pr revert *)"
    ],
    "deny": [
      "Bash(npx next build*)",
      "Bash(npx next dev*)",
      "Bash(npm run build*)",
      "Bash(npm run dev*)",
      "Bash(rm -rf node_modules*)",
      "Bash(npm install *)",
      "Bash(npx vercel*)",
      "Bash(git push origin master*)",
      "Bash(git push * master*)",
      "Bash(npm run deploy*)"
    ]
  }
}
```

**ポイント**: `git push origin master` と `npm run deploy`（=master push）を deny で物理ブロック。
これでエージェントは何があっても master に直接 deploy できない。

---

## 2. Google API（測定基盤）の準備

### 2-1. GCP プロジェクトで API を有効化
1. https://console.cloud.google.com で（無ければ）プロジェクト作成
2. 「APIとサービス」→ 以下を有効化:
   - **Google Analytics Data API**
   - **Google Search Console API**

### 2-2. サービスアカウント(SA)作成 + 鍵DL
1. 「IAMと管理」→「サービスアカウント」→ 作成（例: `tsurispot-metrics`）
2. 作成したSAの「キー」→「鍵を追加」→ JSON → ダウンロード
3. ダウンロードしたJSONを **`tsurispot/secrets/sa-metrics.json`** に置く（gitignore済み・コミットされない）

### 2-3. GA4 にSAを閲覧者で追加
1. GA4管理 → プロパティ → 「プロパティのアクセス管理」
2. SAのメール（`xxx@xxx.iam.gserviceaccount.com`）を「閲覧者」で追加
3. GA4管理 → プロパティ設定 → **「プロパティID」(数値9桁)** を控える
4. `config/agent.config.json` の `site.ga4PropertyId` にその数値を記入
   - ※ 測定ID `G-FD4XGHP9FN` ではなく数値プロパティIDを使う

### 2-4. Search Console にSAを追加
1. Search Console → 設定 → 「ユーザーと権限」
2. SAのメールを「制限付き」で追加
3. プロパティ種別を確認し `config/agent.config.json` の `site.gscSiteUrl` を合わせる:
   - ドメインプロパティ → `"sc-domain:tsurispot.com"`
   - URLプレフィックス → `"https://tsurispot.com/"`

### 2-5. affiliate_click イベント確認
- GA4管理 → イベント に `affiliate_click` があるか確認（無ければROIの収益代理指標は0扱いだが本流は動く）

### 2-6. 疎通テスト
```bash
node scripts/metrics/fetch-gsc.mjs      # GSC取得サマリが出ればOK
node scripts/metrics/fetch-ga4.mjs      # GA4取得サマリが出ればOK
node scripts/metrics/fetch-all.mjs      # memory/metrics/ にJSON生成
node scripts/metrics/extract-striking-distance.mjs   # ROI上位が出ればOK
```

---

## 3. 環境変数（タスク実行ユーザーに設定）
タスクスケジューラの実行ユーザー環境に以下を設定（または `.env.local` に記載）:
- `GOOGLE_APPLICATION_CREDENTIALS` = `C:\...\tsurispot\secrets\sa-metrics.json`（省略時は既定パスを探索）
- `DISCORD_WEBHOOK_URL` = 既存のWebhook（deploy.ymlと同じ）
- `GH_TOKEN` = gh認証済みなら不要な場合あり
- `ANTHROPIC_API_KEY` = claude CLI がAPIキー方式なら設定（サブスク方式なら不要）

---

## 4. GitHub branch protection（推奨・二重ガード）
GitHub → Settings → Branches → master の保護ルール:
- 「Require status checks to pass before merging」をON、CI（tsc/eslint/vitest/容量ガード）を必須に
- これで **CIが落ちたPRは auto-merge されない**（guardrailと合わせ二重防御）

---

## 5. 動作確認（pr-only観察モードで）
`config/agent.config.json` が `autonomy.mode: "pr-only"`, `phase: 1` であることを確認し:

```bash
node scripts/agent/run-cycle.mjs --force-metrics
```
- 起動前セルフチェックが走る:
  1. **settings.json の master-push deny 検証**（手順1未実施だと起動中止）
  2. **ポリシー改ざん検知**（SKILL.md/config のハッシュ。初回はTOFUで登録）
  3. **git健全性**（作業ツリーがdirtyならスキップ＝専用クローン推奨の理由）
- メトリクスが取得され、site-health（サーキットブレーカー）が走り、striking-distance が生成され、Discordに完了通知が来ればOK
- phase=1なので改善実装はせず測定のみ。phase=2に上げると改善PRが立ち始める
- SKILL.md や config を意図的に変更した後は `node scripts/agent/run-cycle.mjs --accept-policy` でハッシュを承認・再登録する

---

## 6. タスクスケジューラ登録
管理者PowerShell または cmd で `ops/register-task.cmd` を実行（1日4回起動）。
詳細はそのファイル内コメント参照。

---

## 7. 段階的な昇格（運用）
1. **数日**: `phase:1` + `mode:"pr-only"` で測定基盤を安定運用、誤作動ゼロを確認
2. `phase:2` に上げる → 改善PRが立つ。数日は人間がPRをレビューしてmerge
3. PRの質に問題なければ `mode:"auto-merge-pr"` に昇格 → 超安全クラスが自動デプロイ
4. さらに安定したら `phase:3`（コンテンツ拡充）へ
