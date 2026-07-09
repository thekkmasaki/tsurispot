# App Runner → Lightsail Containers 移行 runbook

App Runner（実測 $127/月）から Lightsail Containers **large（2vCPU/8GB）$80固定**へ移行する手順。
App Runner を生かしたまま並行構築し、Cloudflare origin 切替で瞬時ロールバック可能な**段階移行**。

> ティアは large×1 で確定。medium×2 は ISR の L1 インメモリキャッシュがノード別に分裂して
> `set()`/`revalidateTag()` が他ノードに届かず整合が崩れるため不可。

各ステップの ✋ = 人手（CloudShell/ダッシュボード）、🤖 = GitHub Actions。

---

## Phase 0: 前提準備（App Runner 無傷・本番影響なし）

### 0-1. ランタイム用 IAM ユーザー作成 ✋
Lightsail はインスタンスロール非対応 → S3/DynamoDB/Rekognition 用のキーが要る。
**IAM 管理権限を持つアカウントの CloudShell** で:
```bash
bash scripts/lightsail/create-iam-user.sh
```
- `tsurispot-lightsail-runtime` を作成し `iam-runtime-policy.json` を付与、アクセスキーを `~/lightsail-runtime-key.env`(0600) に保存。
- **Rekognition:DetectModerationLabels を含む**（現インスタンスロールに欠落していた＝既存バグ是正）。
- 出力の指示に従い `RUNTIME_AWS_ACCESS_KEY_ID` / `RUNTIME_AWS_SECRET_ACCESS_KEY` を GitHub Secrets に登録し、鍵ファイルを消す。

### 0-2. ランタイム env を GitHub Secrets へ移設 ✋
現在 App Runner コンソール直設定の 26 個を GitHub Secrets 化（値は画面に出ない）:
```bash
bash scripts/lightsail/migrate-env-to-gh-secrets.sh
```
`aws`(App Runner describe) と `gh`(repo secret 書込) がログイン済みの環境で。

### 0-3. リスク緩和① Cloudflare クローラ遮断 ✋
Lightsail はオートスケールが無い（App Runner は MaxSize 2 で自動2台目）。スパイク源のクローラを
エッジで削る。Cloudflare ダッシュボード → Security → WAF → Custom rules:
- **Block** 対象 UA: `AhrefsBot`, `SemrushBot`, `PetalBot`, `DotBot`, `MJ12bot`, `DataForSeoBot`, `BLEXBot` 等
- **除外（絶対に遮断しない）**: `Googlebot`, `Bingbot`, および AI 検索 bot（`OAI-SearchBot`/`ChatGPT-User`/`PerplexityBot`。PR #158 で流入再開済み）
- ルール例: `(http.user_agent contains "AhrefsBot") or (http.user_agent contains "SemrushBot") or ...` → Action: Block

### 0-4. リスク緩和② 外形監視 ✋
Lightsail は CloudWatch 相当が無い（ログ3日・CPU/メモリのみ）。ダウン/504 検知を代替:
- UptimeRobot（無料）等で `https://tsurispot.com/api/health` を 1–5 分間隔監視、Discord/メール通知
- Cloudflare Analytics で 5xx 率・トラフィックを日次確認

### 0-5. Rekognition モデレーションの現状検証 ✋
移行前に「今 App Runner で画像モデレーションが動いているか」を確認（ロールに権限が無く
サイレント失敗の疑い）。UGC 画像投稿 → CloudWatch ログで `DetectModerationLabels` の成否を確認。
0-1 のユーザーには権限を付与済みなので、移行後はここが正常化する。

---

## Phase 1: Lightsail 並行構築（App Runner 生存のまま）

### 1-1. Lightsail サービス作成 ✋
Lightsail 作成権限を持つ CloudShell で:
```bash
bash scripts/lightsail/create-lightsail-service.sh
```
`tsurispot`（large×1）を作成し、ECR プル権限を設定。直 URL を控える。

### 1-2. Lightsail へデプロイ 🤖
GitHub Actions → **「Deploy to Lightsail (manual)」** を手動実行（`workflow_dispatch`）。
- deploy.yml が ECR に push 済みの最新イメージ（digest 固定）を Lightsail に配る（再ビルドしない＝App Runner と同一イメージ）。
- Secrets から `containers.json` を生成（未登録 Secret があればここで fail）。
- `create-container-service-deployment` → `currentDeployment.state=ACTIVE` を待ち、直 URL の `/api/health` 200 まで確認。

### 1-3. Lightsail 直 URL で全機能 E2E ✋
`https://<service>.<id>.ap-northeast-1.cs.amazonlightsail.com` に対して:
- `/api/health` 200
- 任意スポットページが `x-nextjs-cache: HIT`（S3 ISR バックエンド経由）
- UGC 画像アップロード → S3 保存 ＋ **Rekognition モデレーション動作**（0-5 の是正確認）
- admin/push 系ルート（`maxDuration=300s`）が LB アイドルタイムアウトで **504 にならないか**
- Stripe webhook 受信（テストイベント）
- **認証（Cognito）は直 URL では不可**（`AUTH_URL`=tsurispot.com 固定・OAuth コールバック未登録）。
  Phase 2 切替後に tsurispot.com で確認するか、一時的に Lightsail URL を Cognito コールバックに追加してテスト。

---

## Phase 2: 切替（唯一の本番影響点・数秒で可逆）

### 2-1. Cloudflare origin を Lightsail へ ✋
tsurispot.com は Cloudflare プロキシ配下。オリジン（App Runner URL）を指す **proxied DNS レコードの
ターゲットを Lightsail URL に変更**（Cloudflare ダッシュボード → DNS）。
- origin lockdown（`ORIGIN_VERIFY_SECRET`）は同一 env を移設済みなので基本無変更。

### 2-2. ソーク（1–3 日）✋
監視: Cloudflare Analytics 5xx / UptimeRobot 死活 / Lightsail の CPU・メモリメトリクス。
- CPU が張り付く／504 が出る場合 → 2-3 でロールバック、または large の scale を 2 に上げて再評価。

### 2-3. ロールバック（必要時）✋
**Cloudflare origin を App Runner URL に戻すだけ（数秒）**。App Runner は生きているので即復帰。

---

## Phase 3: 撤去（ソーク成功後・別 PR）

- `deploy-lightsail.yml` を `deploy.yml` に統合（master push で Lightsail に自動デプロイ）、
  App Runner ステップ（#19/#20/#21 と `APP_RUNNER_SERVICE_ARN`）を撤去。
- App Runner サービスを削除（またはコスト停止のため pause）。
- 移行で GitHub Secrets 化した機密（Stripe/Cognito/Auth 等）を**ローテーション**（平文移送したため）。
- コスト確認: 1 週間後に Cost Explorer で App Runner $0・Lightsail $80 固定を確認。

---

## 成果物（このリポジトリ）

| ファイル | 役割 |
|---|---|
| `scripts/lightsail/iam-runtime-policy.json` | ランタイム IAM ユーザーの最小権限 |
| `scripts/lightsail/create-iam-user.sh` | IAM ユーザー作成＋キー発行（✋ CloudShell） |
| `scripts/lightsail/create-lightsail-service.sh` | Lightsail サービス作成＋ECR 連携（✋ CloudShell） |
| `scripts/lightsail/migrate-env-to-gh-secrets.sh` | App Runner env → GitHub Secrets 移設（✋） |
| `scripts/lightsail/gen-containers-json.sh` | Secrets から containers.json 生成（🤖 CI が使用） |
| `scripts/lightsail/public-endpoint.json` | ヘルスチェック定義（`/api/health`, port 3000） |
| `.github/workflows/deploy-lightsail.yml` | Lightsail 手動デプロイ（🤖 workflow_dispatch） |

## ロールバック早見

| 状況 | 操作 | 所要 |
|---|---|---|
| 切替後に不調 | Cloudflare origin を App Runner に戻す | 数秒 |
| Lightsail デプロイ失敗 | Lightsail が自動で前デプロイへロールバック（workflow が FAILED 検出） | 自動 |
| CPU 張り付き | Lightsail scale を 2 に増やす（要 L1 分裂の許容判断）or App Runner へ戻す | 分〜数秒 |
