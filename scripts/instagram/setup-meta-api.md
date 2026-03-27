# Meta Graph API セットアップ手順

Instagram自動投稿に必要な一回限りの設定。所要時間: 約15分。

---

## Step 1: Facebookページ作成

1. https://www.facebook.com/pages/create にアクセス
2. ページ名: 「ツリスポ」
3. カテゴリ: 「ウェブサイト」または「レジャー」
4. 作成完了

## Step 2: InstagramビジネスアカウントをFacebookページにリンク

1. Instagramアプリ → 設定 → アカウント → リンク済みアカウント → Facebook
2. 「ツリスポ」ページを選択してリンク
3. **または** Facebookページ設定 → Instagram → アカウントをリンク

## Step 3: Meta Developer App 作成

1. https://developers.facebook.com/ にアクセス（Facebookでログイン）
2. 「マイアプリ」→「アプリを作成」
3. ユースケース: 「その他」→「ビジネス」
4. アプリ名: 「ツリスポ Instagram」
5. 作成完了

## Step 4: 必要な権限を追加

アプリダッシュボードで:
1. 左メニュー「プロダクトを追加」→ **Instagram Graph API** を追加
2. 左メニュー「アプリレビュー」→「権限とプロダクト」
   - `instagram_basic` — 有効化
   - `instagram_content_publish` — 有効化
   - `pages_read_engagement` — 有効化

> **注意**: Dev Modeなら審査なしで自分のアカウントのみ使用OK

## Step 5: アクセストークン取得

### 短期トークン取得
1. https://developers.facebook.com/tools/explorer/ にアクセス
2. 右上のアプリで「ツリスポ Instagram」を選択
3. 「ユーザーアクセストークンを取得」をクリック
4. 権限を選択:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_show_list`
5. 「Generate Access Token」→ ログイン → 許可
6. 表示されたトークンをコピー（これは短期トークン、1時間で失効）

### 長期トークンに変換
ブラウザで以下のURLにアクセス（値を置き換え）:

```
https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={短期トークン}
```

- `{APP_ID}`: アプリダッシュボード → 設定 → ベーシック → アプリID
- `{APP_SECRET}`: 同じページの「アプリシークレット」（表示をクリック）
- `{短期トークン}`: Step 5で取得したトークン

レスポンスの `access_token` が長期トークン（60日有効）。

## Step 6: Instagram User ID 取得

長期トークンを使って、ブラウザで:

```
https://graph.facebook.com/v21.0/me/accounts?access_token={長期トークン}
```

返ってきたページIDを使って:

```
https://graph.facebook.com/v21.0/{ページID}?fields=instagram_business_account&access_token={長期トークン}
```

`instagram_business_account.id` がInstagram User ID。

## Step 7: .env に設定

`scripts/instagram/.env` に以下を追加:

```
INSTAGRAM_USER_ID=ここにStep6のID
INSTAGRAM_ACCESS_TOKEN=ここにStep5の長期トークン
META_APP_ID=アプリID
META_APP_SECRET=アプリシークレット
AWS_ACCESS_KEY_ID=AWSアクセスキー
AWS_SECRET_ACCESS_KEY=AWSシークレットキー
S3_BUCKET=tsurispot-instagram
S3_REGION=ap-northeast-1
```

## Step 8: S3バケット作成

1. AWS Console → S3 → バケット作成
2. バケット名: `tsurispot-instagram`
3. リージョン: `ap-northeast-1`（東京）
4. **「パブリックアクセスをすべてブロック」のチェックを外す**
5. バケットポリシーに以下を追加:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tsurispot-instagram/reels/*"
    }
  ]
}
```

## Step 9: テスト

```bash
cd scripts/instagram
node post-reel.mjs --dry-run
```

---

## トラブルシューティング

### 「OAuthException: Invalid OAuth access token」
→ トークンが失効。`node refresh-token.mjs` を実行

### 「An unknown error has occurred」
→ 動画フォーマットの問題。MP4 / H.264 / AAC が推奨

### 「The video is not eligible to be served」
→ 動画が短すぎ（3秒未満）or 長すぎ（90秒超）。リールは3〜90秒。

### Instagram投稿の動画要件
- フォーマット: MP4（H.264 + AAC推奨）
- アスペクト比: 9:16（縦型）
- 解像度: 1080x1920 推奨
- 長さ: 3〜90秒
- ファイルサイズ: 1GB以下
