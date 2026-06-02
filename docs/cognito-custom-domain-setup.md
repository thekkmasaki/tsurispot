# Cognito 独自ドメイン化 手順書（auth.tsurispot.com）

## 目的
Googleログイン画面の「`tsurispot-auth.auth.ap-northeast-1.amazoncognito.com` に移動」という生のCognitoドメイン表示を、
ブランドドメイン **`auth.tsurispot.com`** に置き換える。

## 方針：全ステップ「追加」で進め、無停止で切替
既存の prefix ドメイン（`tsurispot-auth`）も、既存のGoogleリダイレクトURIも**消さずに残す**。
新ドメインを併存させて検証 → アプリのenvで切替 → 問題なければ完了。**env を外せば即ロールバック**できる。
> ⚠️ Cognito/ログインは過去に全停止障害を起こした要注意領域。必ず本手順の「追加→検証→切替」を守る。

## 前提情報
| 項目 | 値 |
|---|---|
| User Pool ID | `ap-northeast-1_GIsboKwGK` |
| リージョン | `ap-northeast-1`（東京） |
| 既存 prefix ドメイン | `tsurispot-auth` |
| App Client ID | `5gn3kiofd5bliv33v3h115iieo` |
| 新独自ドメイン | `auth.tsurispot.com` |
| 親ドメイン | `tsurispot.com`（DNS は Cloudflare） |

## 必要な権限・アクセス
- AWS 管理者クレデンシャル（現 `tsurispot-deploy` IAM は Cognito 管理権限が不足）
- Cloudflare ダッシュボード（DNS 編集）
- Google Cloud Console（OAuth クライアント編集）

---

## STEP 1 — ACM 証明書を **us-east-1** で発行
> Cognito の独自ドメインは、リージョンに関わらず **証明書が us-east-1 必須**。

```bash
aws acm request-certificate \
  --domain-name auth.tsurispot.com \
  --validation-method DNS \
  --region us-east-1
# => CertificateArn を控える
```

検証用 CNAME を取得：
```bash
aws acm describe-certificate \
  --certificate-arn <CertificateArn> \
  --region us-east-1 \
  --query "Certificate.DomainValidationOptions[0].ResourceRecord"
```
→ 出てきた `Name` / `Value` を **Cloudflare に CNAME（DNS only / グレー雲）** で追加。
数分〜数十分で `Status` が `ISSUED` になる：
```bash
aws acm describe-certificate --certificate-arn <CertificateArn> --region us-east-1 \
  --query "Certificate.Status"
```

---

## STEP 2 — Cognito に独自ドメインを追加
> 親ドメイン `tsurispot.com` に A レコードが必要（本番稼働中なので既に存在＝OK）。

```bash
aws cognito-idp create-user-pool-domain \
  --domain auth.tsurispot.com \
  --user-pool-id ap-northeast-1_GIsboKwGK \
  --custom-domain-config CertificateArn=<us-east-1のCertificateArn> \
  --region ap-northeast-1
# => CloudFrontDomain（xxxx.cloudfront.net）が返る。これを控える。
```
※ prefix ドメイン `tsurispot-auth` は消えない（User Pool は `Domain` と `CustomDomain` を別々に保持）。

CloudFront ターゲットの確認（管理者権限なら）：
```bash
aws cognito-idp describe-user-pool-domain --domain auth.tsurispot.com --region ap-northeast-1 \
  --query "DomainDescription.{Status:Status,CloudFront:CloudFrontDistribution}"
```

---

## STEP 3 — Cloudflare に CNAME を追加（**DNS only 必須**）
Cloudflare DNS で：

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `auth` | `<STEP2のCloudFrontDomain>` | **DNS only（グレー雲）** |

> 🚨 オレンジ雲（プロキシ）にすると Cognito の TLS が壊れてログイン不能になる。**必ずグレー雲**。

Cognito ドメインの `Status` が `ACTIVE` になるまで最大 ~40分。確認：
```bash
curl -sI https://auth.tsurispot.com/.well-known/jwks.json | head -1   # 200 が返ればOK
```

---

## STEP 4 — Google OAuth クライアントにリダイレクトURIを追加
Google Cloud Console → 該当プロジェクト → 「APIとサービス」→「認証情報」→ 対象の OAuth 2.0 クライアントID。

「承認済みのリダイレクト URI」に**追加**（既存は残す）：
```
https://auth.tsurispot.com/oauth2/idpresponse
```
（既存の `https://tsurispot-auth.auth.ap-northeast-1.amazoncognito.com/oauth2/idpresponse` はそのまま）

---

## STEP 5 — アプリを独自ドメインに切替（コード反映済み）
`src/lib/auth.ts` は **`COGNITO_DOMAIN` env があるときだけ** OAuth エンドポイントを独自ドメインに向けるよう実装済み
（未設定なら従来どおり＝安全）。STEP 1〜4 が完了して `auth.tsurispot.com` が ACTIVE になったら、
App Runner（本番 `tsurispot`）の環境変数に追加：

```
COGNITO_DOMAIN = https://auth.tsurispot.com
```

App Runner はenv変更で自動再デプロイ。完了後にログインを実機確認。

---

## 検証
1. シークレットウィンドウで `https://tsurispot.com/login` → Googleログイン
2. Google画面の「〜に移動」が **`auth.tsurispot.com`** になっていること
3. ログイン成功・マイページ到達を確認

## ロールバック（問題が出たら）
- App Runner の `COGNITO_DOMAIN` env を**削除**するだけ → 旧 prefix ドメイン経由に即復帰。
- prefix ドメインも Google の旧URIも残してあるので、切替前の状態に無停止で戻せる。

## 後片付け（任意・安定後）
- Google の旧リダイレクトURI削除
- prefix ドメイン `tsurispot-auth` の削除（※完全に新ドメイン安定を確認してから）
