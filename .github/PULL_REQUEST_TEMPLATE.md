# PR Template

## 変更内容
- **何を**:
- **なぜ**:
- **どう変えたか**:

## 手元検証
- [ ] `npx tsc --noEmit` PASS
- [ ] `npx eslint src/` PASS（警告は許容）
- [ ] `npm run test:smoke` PASS（Playwright smoke）
- [ ] 必要なら追加の curl / Playwright スクショ添付

## 影響範囲
- 変更で影響する URL / 機能:
- 直近のリクエスト数 (CloudFront メトリクス等):

## ロールバック手順
- 失敗時に戻す方法（git revert / config rollback / DB 操作 等）

## 確認お願い項目（ユーザ向け）
- [ ] 強制リロード（Cmd+Shift+R）してから以下を確認:
  1. ...
  2. ...
  3. ...

## メモ
- 関連 Issue / Slack / 議論リンク:
