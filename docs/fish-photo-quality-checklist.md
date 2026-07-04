# 魚種ヒーロー写真 品質チェックリスト

魚種詳細ページ（`/fish/[slug]`）のヒーロー画像の品質基準と差し替え作業リスト。

- 対象コード: `src/app/fish/[slug]/page.tsx`（`FishImage src={fish.imageUrl}`）
- 画像パス規則: `/images/fish/{slug}.jpg`（実体は `public/images/fish/`）
- imageUrl 定義場所: `src/lib/data/fish-sea*.ts` / `fish-freshwater.ts` / `fish-brackish.ts`
- ライセンス台帳: `public/images/fish/LICENSES.md`（**画像を差し替えたら必ず更新**）

## 背景（発生した問題）

`/fish/aji` のヒーロー画像に**値札付きのスーパー鮮魚コーナー写真**が使われていた。
釣り情報サイトとして「釣り場・釣魚」の文脈から外れた小売写真は、ユーザー体験・E-E-A-T・
サムネイル品質（SNSシェア/OGP経由の第一印象）を毀損するため、以下の基準で排除する。

## NG基準（1つでも該当したら使用禁止）

- [ ] **値札・POP・価格ラベルが写っている**（スーパー・鮮魚店の売り場写真）
- [ ] **発泡スチロールトレー・ラップ・パック詰めされた状態**の魚
- [ ] 小売・市場の陳列什器（氷ケース・買い物かご・レジ等）が主体の構図
- [ ] 調理済み・切り身・刺身など「食材」としての写真（図鑑ページのヒーローには不適）
- [ ] **AI生成画像**（プロジェクト全体で禁止。実写 or SVGイラストのみ許可）
- [ ] 他サイトからの無断転載・ライセンス不明画像
- [ ] 魚種の同定が困難なほどピンボケ・低解像度（目安: 横幅800px未満）
- [ ] 別の魚種が写っている（同定ミス）

## OK基準（優先度順）

1. 釣り上げ直後の実写（釣り場・手持ち・ストリンガー等、釣りの文脈がある写真）
2. 生体・水中の実写（水族館写真も可、ライセンス要確認）
3. 白背景・標本調の実写（Wikimedia Commons の図鑑的写真）
4. SVGイラスト（DBCLS 等 CC BY のサイエンスイラスト。実写が無い場合の代替）

## 画像調達ルール

- 第一候補: **photo-ac.com**（ユーザーの契約範囲で利用。ダウンロードはユーザー作業）
- 第二候補: Wikimedia Commons（CC BY / CC BY-SA / PD / CC0 のみ。出典を LICENSES.md に記録）
- クレジット必須ライセンスは LICENSES.md への追記を忘れない

## 差し替え優先リスト（アクセス上位から）

アクセス数・内部リンク量（フッター「人気の釣りターゲット」掲載）に基づく優先順。
判定列はユーザーの photo-ac 作業時に埋める。

| 優先 | slug | 魚種 | 現画像 | 判定（要目視） | メモ |
|------|------|------|--------|----------------|------|
| 1 | aji | アジ | /images/fish/aji.jpg | **NG確定（値札付きスーパー写真）** | 最優先。人気No.1ターゲット |
| 2 | saba | サバ | /images/fish/saba.jpg | 要確認 | |
| 3 | kasago | カサゴ | /images/fish/kasago.jpg | 要確認 | |
| 4 | iwashi | イワシ | /images/fish/iwashi.jpg | 要確認 | LICENSES.md では古い博物画（Kawahara Keiga）|
| 5 | kisu | キス | /images/fish/kisu.jpg | 要確認 | |
| 6 | suzuki | スズキ（シーバス） | /images/fish/suzuki.jpg | 要確認 | 定義は fish-sea-tai-suzuki.ts |
| 7 | kurodai | クロダイ | /images/fish/kurodai.jpg | 要確認 | |
| 8 | aori-ika | アオリイカ | /images/fish/aoriika.jpg | 要確認 | |
| 9 | mebaru | メバル | /images/fish/mebaru.jpg | 要確認 | LICENSES.md では Public domain の古い図版 |
| 10 | karei | カレイ | /images/fish/karei.jpg | 要確認 | |

上記10種の完了後、GA4 のページビュー実測で次の10種を選定して第2弾を実施する。

## 差し替え手順（ユーザー作業＋Claude作業）

1. **ユーザー**: photo-ac.com で対象魚種の実写を検索・ダウンロード（NG基準を確認）
2. **ユーザー**: `public/images/fish/{slug}.jpg` に配置（既存ファイルを上書き。ファイル名を変えれば imageUrl 修正が必要）
3. **Claude**: 画像の軽量化確認（目安: 200KB以下、横幅1200px程度にリサイズ）
4. **Claude**: `LICENSES.md` の該当行を更新（photo-ac の場合は「photo-ac / 規約に基づく利用」と記載）
5. **Claude**: feature ブランチでコミット → PR（master 直 push 禁止）
6. デプロイ後、`/fish/{slug}` と OGP 画像の表示を目視確認

## 定期チェック

- 新規魚種追加時は本チェックリストの NG 基準を必ず通す
- 四半期に1回、アクセス上位20魚種のヒーロー画像を目視監査する
