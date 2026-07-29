# PR Template

## 変更内容
- **何を**:
- **なぜ**:
- **どう変えたか**:

## 受け入れ条件（AC）と結果
<!-- 実装前に合意した受け入れ条件を貼り、それぞれ PASS/FAIL を記入 -->
- [ ] AC1:
- [ ] AC2:

## 手元検証
- [ ] `npm run verify` PASS（typecheck + eslint src/ + vitest）
- [ ] CI green（feature push で自動実行される `CI / verify`）
- [ ] 必要なら追加の curl / Playwright スクショ添付

## 影響範囲
- 変更で影響する URL / 機能:
- 直近のリクエスト数 (CloudFront メトリクス等):

## ロールバック手順
- 失敗時に戻す方法（git revert / config rollback / DB 操作 等）

## デプロイ後確認（merge → 本番反映後に Claude が実施）
- [ ] `npm run test:smoke` PASS（本番 tsurispot.com 対象の Playwright smoke。ブランチの変更は検証しないため必ずデプロイ後に実行）
- [ ] 変更対象 URL の本番 curl 再検証

## 確認お願い項目（ユーザ向け）
- [ ] 強制リロード（Cmd+Shift+R）してから以下を確認:
  1. ...
  2. ...
  3. ...

## メモ
- 関連 Issue / Slack / 議論リンク:
