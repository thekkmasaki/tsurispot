# TsuriSpot プロジェクト指示書

## 必須ルール: こまめなコミット（レート切れ対策）

エージェント（サブエージェント含む）は、作業中にこまめに git commit すること。
レート制限で途中停止しても、それまでの作業が失われないようにする。

### ルール
- **5ファイル修正ごと、または大きな修正1件ごとに git commit する**
- コミットメッセージは `WIP: [作業内容の簡潔な説明]` とする
- 最終コミット時に `WIP:` プレフィックスなしの正式なメッセージにする
- push は最後にまとめて行う（途中 push は不要）
- git config の user.email は `dev@tsurispot.jp` を使う
- **Co-Authored-By は絶対に付けない**（Netlify無料プランでビルド失敗する）

### コミットの例
```bash
git add src/lib/data/spots-tohoku.ts src/lib/data/spots-extra.ts
git commit -m "WIP: 東北・追加スポットの住所修正15件"
```

## Git ルール
- ブランチ: master（メインブランチ）
- Co-Authored-By: **絶対に付けない**
- email: dev@tsurispot.jp

## ビルド
- OneDrive上のプロジェクトのため `.next` ディレクトリの EPERM エラーが頻発
- ビルド前に `rm -rf .next` してから `npx next build`
- ポート3000が占有されやすい

## デプロイ
- Netlify（GitHub master連携で自動デプロイ）
- `git push origin master` でデプロイ開始
- ビルドフック: `https://api.netlify.com/build_hooks/69a1b8126ecd03b29f81299b`

## アフィリエイト
- ユーザーが送ったリンクのみ使用。勝手にリンクを生成しない
- リンク一覧: `C:\Users\kk471\OneDrive\デスクトップ\saas\アフィリエイト\リンク一覧.txt`

## 日本語
- 全てのコミュニケーションは日本語で行う
