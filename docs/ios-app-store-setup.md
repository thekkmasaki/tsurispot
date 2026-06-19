# ツリスポ iOS アプリ（App Store）セットアップ手順

Capacitor（リモートURL方式）で `https://tsurispot.com` を WebView 表示する iOS
アプリを App Store に出すための手順書。`MVP` 方針で審査ガイドライン **4.2（最小機能
性）** を、ネイティブ Push・位置情報・オフライン対応・外部リンク誘導で突破する。

> **重要**: `/ios/` は `.gitignore` 対象（Capacitor が `npx cap add ios` でローカル
> 生成する）。そのため `ios/App/App/AppDelegate.swift` と `ios/App/App/Info.plist`
> への編集は **バージョン管理されない**。本書がその「再現用の正本」。`cap add ios`
> でプロジェクトを作り直した場合は、本書の §2 を再適用すること。
> （`capacitor.config.ts` は追跡対象なので errorPath / plugins 設定は自動で効く）

---

## 1. コードに実装済み（追跡対象・このリポジトリに入っている）

| ファイル | 役割 |
|---|---|
| `src/lib/platform.ts` | `isNativeApp()` / `getNativePlatform()`。Web では常に false |
| `src/lib/apns.ts` | APNs HTTP/2 送信（node:http2 + node:crypto ES256 JWT、依存ゼロ） |
| `src/lib/push.ts` | `sendPush` が endpoint `apns://` を見て APNs 経路へ振り分け |
| `src/app/api/notification/subscribe-native/route.ts` | iOS 端末トークン保存（既存 Redis に相乗り） |
| `src/lib/native-push.ts` | ネイティブ Push 登録・通知タップ遷移 |
| `src/components/native-bootstrap.tsx` | 起動時: ステータスバー / オフライン監視 / 外部リンク誘導 / 通知タップ |
| `src/hooks/use-geolocation.ts` | ネイティブ時は Capacitor Geolocation を使用 |
| `src/components/notification-subscribe-button.tsx` | ネイティブ時は APNs 登録フロー |
| `src/components/pwa-install-hint.tsx` | ネイティブ時は「ホーム画面に追加」案内を抑制 |
| `capacitor.config.ts` | `server.errorPath: "offline.html"`（オフライン白画面対策） |
| `public/offline.html` | 圏外時のローカルフォールバック |

導入済みプラグイン（package.json）: `@capacitor/{push-notifications, geolocation,
network, browser, status-bar, haptics, share}`, `@capacitor-community/apple-sign-in`

---

## 2. iOS ネイティブ編集（ローカル ios/ に適用済み・再生成時は再適用）

### 2-1. `ios/App/App/AppDelegate.swift`
クラス `AppDelegate` の末尾（最後の `}` の直前）に APNs 登録ブリッジを追加:

```swift
    // MARK: - Push Notifications (APNs)
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
```

### 2-2. `ios/App/App/Info.plist`
`</dict>` の直前に追加:

```xml
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>近くの釣りスポットを距離が近い順に表示するために、現在地の位置情報を使用します。</string>
	<key>UIBackgroundModes</key>
	<array>
		<string>remote-notification</string>
	</array>
	<key>ITSAppUsesNonExemptEncryption</key>
	<false/>
```

---

## 3. Xcode 手作業（GUI でしかできない）

1. `npx cap open ios` で Xcode を開く
2. TARGETS > App > **Signing & Capabilities**
   - **Team** を個人 Apple Developer アカウントに設定（`DEVELOPMENT_TEAM` 反映）
   - Bundle Identifier = `com.tsurispot.app`
   - **+ Capability → Push Notifications**（`App.entitlements` が生成され `aps-environment` 付与）
   - （Phase 2）+ Sign in with Apple
3. General > Version=1.0, Build=1

---

## 4. APNs 認証キーとサーバ環境変数

1. [Apple Developer](https://developer.apple.com) → Certificates, IDs & Profiles →
   **Keys** → ＋ → **Apple Push Notifications service (.p8)** を作成
2. **Key ID** と **Team ID** を控え、`.p8` を保管
3. 本番（App Runner）に環境変数を投入:

| 変数 | 値 |
|---|---|
| `APNS_KEY_ID` | 認証キーの Key ID |
| `APNS_TEAM_ID` | Apple Developer の Team ID |
| `APNS_P8` | `.p8` の中身（PEM そのまま / `\n` エスケープ / base64 いずれも可） |
| `APNS_BUNDLE_ID` | `com.tsurispot.app`（既定値と同じなら省略可） |
| `APNS_PRODUCTION` | `true`（TestFlight/本番）。Xcode の Debug 実機検証中は `false`（sandbox） |

> 注: TestFlight・App Store 配布ビルドは **production** APNs、Xcode から実機に
> 直接 Run した Debug ビルドは **sandbox** APNs。トークンの送信先が異なるので、
> 検証フェーズに合わせて `APNS_PRODUCTION` を切り替える。

---

## 5. ビルド〜署名〜アップロード

```bash
# 本番 URL でネイティブへ同期（localhost 焼き込み回避 — 最重要）
CAP_SERVER_URL=https://tsurispot.com NODE_ENV=production npx cap sync ios
#   → ios/App/App/capacitor.config.json の server.url が https://tsurispot.com か目視確認
npx cap open ios
```

Xcode: デバイス「Any iOS Device (arm64)」→ Product → Archive → Organizer →
Distribute App → App Store Connect → Upload（自動署名）。
処理後 TestFlight に出現（10〜30分）。内部テスターに自分の Apple ID を追加すれば
審査なしで実機配布できる。

---

## 6. App Store Connect 提出物チェックリスト

- [ ] アイコン 1024×1024（透過/角丸なし）… 既存 `AppIcon-512@2x.png` 流用、透過のみ確認
- [ ] スクリーンショット 6.9"（iPhone 16 Pro Max）推奨3〜5枚: ホーム/スポット詳細/地図/近い順/釣果
- [ ] プライバシー栄養ラベル: 位置情報（アプリ機能・非トラッキング）/ 識別子（Cognito sub・アプリ機能）/ プッシュトークン
- [ ] サポートURL `https://tsurispot.com/contact`
- [ ] プライバシーポリシーURL `https://tsurispot.com/privacy`（iOS位置情報・APNsの追記推奨）
- [ ] カテゴリ: ナビゲーション（Primary）/ スポーツ（Secondary）
- [ ] 年齢レーティング 4+
- [ ] 輸出コンプライアンス: `ITSAppUsesNonExemptEncryption=NO`（Info.plist 済）
- [ ] **App Review Information の Notes** に「ネイティブPush通知/位置情報/オフライン対応を実装」と明記（4.2対策）

---

## 7. 検証（実機推奨）

- **Push**（実機必須・シミュレータ不可）: ログイン→通知許可→マイページ「テスト通知を送る」→ 届くか。Redis `notif:sub:<userId>` に `apns://...` が入るか
- **位置情報**: シミュレータ Features→Location で「近い順」が並ぶか／実機で権限ダイアログ文言を確認
- **オフライン**: 機内モードで起動 → `offline.html` が出て白画面でないこと
- **外部リンク**: アフィリエイトが SFSafariViewController で開くこと

---

## 8. 審査リジェクト回避トップ5

1. **4.2 最小機能性** → ネイティブ Push / 位置情報 / オフライン / 外部リンク誘導を実装し Review Notes に明記
2. **オフライン白画面** → `server.errorPath` + `public/offline.html`
3. **WKWebView 内 Google ログインの `disallowed_useragent`** → §9 参照（MVP では Safari 案内）
4. **localhost 焼き込み** → `cap sync` を必ず `CAP_SERVER_URL=https://tsurispot.com NODE_ENV=production` で実行・目視確認
5. **5.1.1 プライバシー不整合** → UsageDescription を具体的に・栄養ラベルと `/privacy` を一致

---

## 9. Phase 2（初回リリースには含めない）

- **ネイティブ Sign in with Apple**: Cognito の Apple IdP 構成＋token交換が必要。MVP は
  Hosted UI の Apple ボタン（WKWebView 内で動作）で 4.8 を満たす
- **ネイティブ OAuth ログイン（Google）**: WKWebView 内 Google は `disallowed_useragent`
  で拒否。現状は既存「アプリ内ブラウザ→Safariで開く」バナーが作動。完全対応には
  `ASWebAuthenticationSession` + カスタムURLスキームのコールバックが必要（コールバックが
  Safari 側に戻りアプリ側セッションにならない問題の解決）。※ログイン無しでも全機能利用可
- **ネイティブカメラ釣果投稿** `@capacitor/camera`、**ハプティクス/共有**の各画面組み込み、
  **AI 釣り場解析 UI 拡充**、**Android 対応**、**外部課金（スマホ新法・手数料15%）**
