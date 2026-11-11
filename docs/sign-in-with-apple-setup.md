# Sign in with Apple 設定手順書（Cognito federated IdP "SignInWithApple"）

## 目的
iPhone アプリ「ツリスポ釣果記録」の App Store 審査（ガイドライン 4.8: 他社ログインを使うなら Sign in with Apple も用意する）のため、
サイトの `/login` に「Appleでサインイン」を追加する。アプリのログインは Safari の小窓でサイトの `/login` → `/app-link` を通るので、
サイト側に Apple ログインがあればアプリでも使える。

## 仕組み（コード側はマージ済みの前提）
- `/login` の「Appleでサインイン」は Cognito の `/oauth2/authorize?identity_provider=SignInWithApple` へ飛ぶ。Apple との OIDC は Cognito が処理する。
- サイトが受け取るのは Cognito の ID トークン（`sub` は Cognito ユーザーごと）。Apple のユーザーは Cognito 上で `signinwithapple_…` という別ユーザーになるので、
  **同じメールアドレスの Google ユーザーとも混ざらない**（ツリスポのアカウントも別になる）。
- 機能スイッチ: App Runner の環境変数 **`APPLE_LOGIN_ENABLED=true`** の時だけボタンを表示し、サーバー側も受け付ける。未設定なら今と全く同じ（Google だけ）。
- スイッチを入れると Google ボタンにも `identity_provider=Google` が付く（アプリクライアントに IdP が 2 つ並ぶと、付けない場合は Cognito の選択画面が挟まるため）。

> ⚠️ Cognito/ログインは過去に全停止障害（Cognito 設定全消し）を起こした要注意領域。**全ステップ「追加」で進め、既存の Google 設定には触らない。**

## 前提情報
| 項目 | 値 |
|---|---|
| User Pool ID | `ap-northeast-1_GIsboKwGK` |
| リージョン | `ap-northeast-1`（東京） |
| App Client ID | `5gn3kiofd5bliv33v3h115iieo`（`docs/cognito-custom-domain-setup.md` 記載。**要確認**: 本番の `COGNITO_CLIENT_ID` と一致するか） |
| Cognito ドメイン（prefix） | `tsurispot-auth.auth.ap-northeast-1.amazoncognito.com` |
| 独自ドメイン | `auth.tsurispot.com`（**要確認**: ACTIVE で、本番の `COGNITO_DOMAIN` に設定済みか） |
| アプリの URL スキーム | `com.tsurispot.catchlog`（Bundle ID も同じ想定。**要確認**） |

以下 `<…>` はプレースホルダ。秘密鍵（.p8）の中身はこの文書・チャット・コミットに書かないこと。

---

## STEP 1 — Apple Developer（ユーザー作業）
https://developer.apple.com/account/resources で行う。Team ID は右上（Membership）で確認して控える。

1. **App ID で Sign in with Apple を有効化**
   - Identifiers → アプリの App ID（例: `com.tsurispot.catchlog`）→ Capabilities の **Sign in with Apple** にチェック →「Enable as a primary App ID」→ Save。
2. **Services ID を作る**（Web 用の client_id になる）
   - Identifiers → ＋ → **Services IDs** → Description: `TsuriSpot Web Login`、Identifier: 例 `com.tsurispot.web.signin`（これが `<SERVICES_ID>`）→ Register。
   - 作った Services ID を開き **Sign in with Apple** にチェック → Configure:
     - Primary App ID: 上の App ID
     - **Domains and Subdomains**（https なし）:
       - `tsurispot-auth.auth.ap-northeast-1.amazoncognito.com`
       - `auth.tsurispot.com`（独自ドメインを使っている場合）
     - **Return URLs**（https あり・末尾まで完全一致）:
       - `https://tsurispot-auth.auth.ap-northeast-1.amazoncognito.com/oauth2/idpresponse`
       - `https://auth.tsurispot.com/oauth2/idpresponse`（独自ドメインを使っている場合）
   - Save → Continue → Save。
3. **Key（.p8）を作る**
   - Keys → ＋ → Key Name: `TsuriSpot SIWA` → **Sign in with Apple** にチェック → Configure で Primary App ID を選ぶ → Register。
   - **.p8 は 1 回しかダウンロードできない。** 安全な場所に保存し、Key ID（`<KEY_ID>`）を控える。

控えるもの: `<TEAM_ID>` / `<SERVICES_ID>` / `<KEY_ID>` / `AuthKey_<KEY_ID>.p8`（ファイル）

---

## STEP 2 — Cognito に Apple の IdP を作る（追加のみ・既存に影響なし）
AWS 管理者クレデンシャルで実行（`tsurispot-deploy` IAM は Cognito 管理権限が不足）。

### 2-0. 事前確認（読むだけ）
```bash
# 必須属性（Required=true）に email があるか。あれば下の attribute-mapping で email を必ず渡す
aws cognito-idp describe-user-pool --user-pool-id ap-northeast-1_GIsboKwGK --region ap-northeast-1 \
  --query 'UserPool.{Required:SchemaAttributes[?Required==`true`].Name,UsernameAttributes:UsernameAttributes,Alias:AliasAttributes}'

# 既存 IdP 一覧（Google がある、SignInWithApple はまだ無い、を確認）
aws cognito-idp list-identity-providers --user-pool-id ap-northeast-1_GIsboKwGK --region ap-northeast-1
```

### 2-1. IdP を作る
秘密鍵はコマンドラインに貼らず、ファイルから読ませる（シェル履歴に残さない）。
```bash
jq -n \
  --arg client_id "<SERVICES_ID>" \
  --arg team_id "<TEAM_ID>" \
  --arg key_id "<KEY_ID>" \
  --rawfile private_key ./AuthKey_<KEY_ID>.p8 \
  '{client_id:$client_id, team_id:$team_id, key_id:$key_id, private_key:$private_key, authorize_scopes:"email"}' \
  > apple-idp-details.json

aws cognito-idp create-identity-provider \
  --user-pool-id ap-northeast-1_GIsboKwGK --region ap-northeast-1 \
  --provider-name SignInWithApple \
  --provider-type SignInWithApple \
  --provider-details file://apple-idp-details.json \
  --attribute-mapping '{"email":"email"}'

rm apple-idp-details.json   # 秘密鍵入りなので必ず消す
```
- `authorize_scopes` は `email` のみを推奨。名前（`name`）は取らない: サイトは Cognito の `name` をそのまま公開ニックネームの初期値にするため、
  取らなければ初期値は `釣り人xxxxxx` になり、本人がマイページで決める（本名が公開されない）。
- メールは「メールを非公開」を選ぶと `…@privaterelay.appleid.com` になる。サイトはメールを使っていない（ログイン・表示とも不要）ので、そのままでよい。
  将来メールを送るなら、Apple Developer の「Sign in with Apple for Email Communication」に送信元ドメインの登録が要る。

---

## STEP 3 — アプリクライアントに SignInWithApple を足す（⚠️ここが一番危ない）

**`update-user-pool-client` は「渡さなかった項目を既定値に戻す」API。SupportedIdentityProviders だけを渡すと、CallbackURLs・OAuth フロー・スコープ・Google などが消えてログインが全停止する。
必ず `describe-user-pool-client` の結果を丸ごと渡し直し、変えるのは SupportedIdentityProviders に `SignInWithApple` を足すことだけにする。**

```bash
POOL=ap-northeast-1_GIsboKwGK
CLIENT=<本番の COGNITO_CLIENT_ID>
REGION=ap-northeast-1

# 3-1. 現状を保存（ClientSecret はファイルに残さない）。これがロールバック用の控えになる
aws cognito-idp describe-user-pool-client --user-pool-id $POOL --client-id $CLIENT --region $REGION \
  | jq 'del(.UserPoolClient.ClientSecret)' > client-before.json

# 3-2. 更新用の入力を作る: 出力専用の項目だけ外し、IdP に SignInWithApple を足す
jq '.UserPoolClient
    | del(.CreationDate, .LastModifiedDate)
    | .SupportedIdentityProviders = ((.SupportedIdentityProviders // []) + ["SignInWithApple"] | unique)' \
  client-before.json > client-update.json

# 3-3. 差分を目で確認（SupportedIdentityProviders 以外が変わっていないこと）
diff <(jq -S '.UserPoolClient | del(.CreationDate, .LastModifiedDate)' client-before.json) <(jq -S . client-update.json)

# 3-4. 反映
aws cognito-idp update-user-pool-client --region $REGION --cli-input-json file://client-update.json

# 3-5. 反映後の確認: CallbackURLs / LogoutURLs / AllowedOAuthFlows / AllowedOAuthScopes / Google が残っていること
aws cognito-idp describe-user-pool-client --user-pool-id $POOL --client-id $CLIENT --region $REGION \
  | jq '.UserPoolClient | {SupportedIdentityProviders, CallbackURLs, LogoutURLs, AllowedOAuthFlows, AllowedOAuthScopes, AllowedOAuthFlowsUserPoolClient}'
```
- 3-3 の diff に SupportedIdentityProviders 以外の行が出たら **反映しない**。
- このステップから STEP 4 までの間、Google ボタンを押すと Cognito の選択画面（Google / Apple）が 1 枚挟まる（ログイン自体はできる）。間を空けずに STEP 4 を行う。

### ロールバック
```bash
jq '.UserPoolClient | del(.CreationDate, .LastModifiedDate)' client-before.json > client-rollback.json
aws cognito-idp update-user-pool-client --region $REGION --cli-input-json file://client-rollback.json
```
（IdP 自体は残しておいて害はない。消す場合は `aws cognito-idp delete-identity-provider --user-pool-id $POOL --provider-name SignInWithApple --region $REGION`）

---

## STEP 4 — サイトのスイッチを入れる
- App Runner の環境変数に **`APPLE_LOGIN_ENABLED` = `true`** を追加（コンソールの「設定 → 環境変数」で追加。既存の変数は消さない）。
- 戻すときはこの変数を消す（または `false`）だけ。Google だけの今の動きに戻る。

## STEP 5 — 動作確認
1. `https://tsurispot.com/login` に「Appleでサインイン」（黒）が Google の上に出る。
2. 押すと `appleid.apple.com` のサインイン画面 → 戻ってきて `/mypage` に入れる。マイページのログイン方法が「Apple」と表示される。
3. Google ボタンが Cognito の選択画面を挟まず Google に直行する。
4. iPhone アプリからのログイン（Safari の小窓 → `/login` → Apple → `/app-link` → アプリへ戻る）が通る。
5. 失敗する場合は App Runner ログの `[auth][error]` を見る（`invalid_client` は Services ID / Key / Team ID の不一致、`redirect_uri` 系は STEP 1-2 の Return URL の不一致）。

## 未確認・注意
- App Client ID・独自ドメインの現在値は本番設定で要確認（上表）。
- アカウント削除（ガイドライン 5.1.1(v)）: Apple でサインインしたユーザーが退会した時の Apple トークン失効（Apple の `/auth/revoke`）は、
  Cognito が Apple の refresh token をサイトへ渡さないため未対応。既存の退会機能はツリスポ側のデータを消すが、Cognito のユーザー（`signinwithapple_…`）は消していない（Google も同じ）。審査で求められた場合は別途検討。
