# 画像のない商品カード 全件洗い出し（調査レポート）

- 調査日: 2026-11-23
- 調査対象ブランチ: `master` 相当（調査のみ。データ・コード変更なし）
- 指示書: 指示書14「画像のない商品カードの全件洗い出し（調査のみ）」

## 1. 結論（サマリ）

| 指標 | 件数 |
|---|---|
| **商品総件数** | **80件**（データ定義2系統の合計。重複統合はしていない） |
| **画像あり** | **0件** |
| **画像なし** | **80件**（全件） |

| データ定義 | 件数 | 画像あり | 画像なし | 描画コンポーネント |
|---|---|---|---|---|
| A. `src/lib/data/affiliate-products.ts`（`affiliateProducts`） | 37 | 0 | 37 | `RecommendProductCard` ほか（後述） |
| B. `src/lib/data/products.ts`（`products`） | 43 | 0 | 43 | `ProductCard` / `ProductList` |

- **判定基準**（2026-11-23 確定）: 次のいずれかに該当するものを「画像あり」とする。
  1. 画像ファイルへの参照があり、そのファイルがリポジトリ内に実在する。
  2. 外部URL（Amazon SiteStripe 等の画像URL）が設定されており、カードに写真として表示される。
  - 当初の指示書は 1 のみを基準としていたが、Amazonアソシエイト規約上リポジトリ内に商品画像を置けないため、2 も「画像あり」とみなすことでユーザー合意済み。
  - A系統は型に `image?: string` フィールドがあるが、**37件すべてで未設定**。
  - B系統は型に画像フィールド自体が存在しない（`imageDescription` という文字列はあるが、どのコンポーネントからも参照されておらず画面に出ない）。
  - リポジトリ内にも商品画像用ディレクトリ（`public/images/products` 等）は存在しない。
  - 外部URLの画像を設定している商品も1件もないため、上記基準でも画像ありは **0件**。

## 2. 「商品カード」の範囲

コードを確認した結果、商品カードは次の2系統で、スポット詳細ページ以外（特集ページ・ガイド・魚種図鑑・ブログ・地図など）にも広く表示されている。本レポートでは両系統とも対象に含めた。

### A系統: `affiliate-products.ts` → 「編集部おすすめ」バッジのあるカード

「編集部おすすめ」バッジ（`isRecommended: true`、7件）を表示するのはこの系統の `RecommendProductCard`。

| 描画コンポーネント | 画像枠の扱い | 表示ページ |
|---|---|---|
| `src/components/affiliate/recommend-product-card.tsx` (`RecommendProductCard`) | `product.image` があれば `<img>`、なければ**カテゴリ色のグラデーション帯＋lucideアイコン**（Fish / Shrimp / Shirt / Package / BookOpen）で代替 | スポット詳細 `/spots/[slug]`（`SpotAffiliateRecommend`）、ブログ `/blog/[slug]`（`BlogAffiliateRecommend`）、都道府県 `/prefecture/[slug]`、都道府県×月 `/prefecture/[slug]/[month]` |
| `src/components/seasonal-affiliate-section.tsx` (`SeasonalAffiliateSection`) | 画像枠なし（テキストカード） | `/spots`、`/area/[slug]`、`/area-guide/[slug]`、`/seasonal/[month]/[regionGroup]`、`/spot-type/[type]/[prefecture]`、`/spot-feature/[feature]/[prefecture]`、`/fishing/[method]/area/[region]`、`/prefecture/[slug]/fish/[fishSlug]` |
| `src/components/affiliate/seasonal-recommend.tsx` (`SeasonalRecommend`) | 画像枠なし（季節アイコンのみ） | トップページ `/` |
| `src/components/map/map-affiliate-recommend.tsx` (`MapAffiliateRecommend`) | 画像枠なし | 地図（`spot-map.tsx`） |
| ページ内インライン描画 | 画像枠なし | `/fishing/[method]/[month]`、`/fish/[slug]/method/[method]`、`/prefecture/[slug]/[month]/[fishSlug]` |

- どの商品がどのページに出るかは `getRelevantAffiliateProducts()` のスコアリング（釣法キーワード一致・魚種一致・季節・都道府県限定・高単価ボーナス・編集部おすすめボーナス）で**ページごと・月ごとに動的に決まる**ため、商品単位での表示ページは確定できない。下表では代わりに表示条件（季節／地域限定）を記載した。
- 補足: LINE Bot の返信（`src/lib/line/gear-reply.ts`）でも同データを使うが、カード表示ではないため範囲外。

### B系統: `products.ts` → 「編集部イチオシ」バッジのあるカード

| 描画コンポーネント | 画像枠の扱い | 表示ページ |
|---|---|---|
| `src/components/affiliate/product-card.tsx` (`ProductCard`) ／ `product-list.tsx` (`ProductList`) | **画像枠そのものがない**。上部にカテゴリ色の細いストライプ（1.5px相当）のみ。`priority <= 3` で「編集部イチオシ」バッジ | `/gear`、`/for-beginners`、`/guide` 配下の各ガイド、`/guide/eging/gear`、`/beginner-checklist`、魚種図鑑 `/fish/[slug]`、月別 `/monthly/[month]`（`MonthlyProductRecommend`） |

### 範囲外としたもの（参考）

以下はアフィリエイトリンクを含むが「商品カード」ではなく、テキストリンク／チェックリスト内リンクのため対象外とした。

- `src/components/spots/gear-guide.tsx`（装備項目ごとのテキストリンク）
- `src/components/spots/packing-checklist.tsx`、`src/components/spots/spot-weather-tide.tsx`
- `src/components/monthly-rig-section.tsx`（画像は魚種写真 `/images/fish/*.jpg` で商品画像ではない）
- `src/app/gear/sabiki/page.tsx`、`src/app/gear/rod-beginner/page.tsx`、`src/app/safety/page.tsx`、各ガイド本文、ブログ本文中のリンク

## 3. 画像あり商品と既存画像の配置方式

- **画像あり: 0件**。既存の商品画像は存在しない。
- 想定されている配置方式（コード上の設計）:
  - A系統の `image` フィールドのコメントおよび `RecommendProductCard` の実装では、**Amazon SiteStripe「画像」リンクの `img src`（外部URL）をそのまま入れる**方式。Amazonアソシエイト規約上、画像をダウンロードして自サーバー（`public/`）に置くことは禁止とされているため、リポジトリ内ディレクトリへの配置は想定されていない。
  - `next/image` は通さず素の `<img>` で表示する（画像を加工・キャッシュしないため）。
  - B系統には画像フィールドがないため、画像を出すには型・コンポーネントの拡張が必要。
- 基準の扱い: 外部URL（Amazon SiteStripe）の画像も「画像あり」とみなすことで確定した（1章参照）。今後 A系統の `image` に SiteStripe の画像URLを設定すれば、その商品は「画像あり」に数える。

## 4. 画像なし商品 全件リスト

凡例
- Amazon「○ 直リンク」: データに個別アフィリエイトURL（`amzn.to` 等）がある。「△ 検索リンク自動生成」: 商品名から Amazon 検索URLを生成（`getAmazonUrl`。B系統は ASIN ではなく商品名検索になる点に注意）。
- 楽天「○ 直リンク」: データに楽天URL（`r10.to`）がある。「△ 検索リンク自動生成」: 商品名／検索クエリから楽天アフィリエイト検索URLを生成（`getRakutenUrl`）。
- A系統で楽天直リンクの商品（`af-fishing-bag-rakuten`）は `RecommendProductCard` 上で楽天ボタンのみ表示され、Amazonボタンは出ない。

### 4-A. `affiliate-products.ts`（37件・全件画像なし）

カテゴリ内訳: 仕掛け・ライン 13 ／ 便利グッズ 12 ／ ウェア 5 ／ 釣り場ガイド（書籍） 5 ／ エサ 2。編集部おすすめ 7件。価格目安は全件設定あり。

表示ページ種別: 上記「A系統」の各ページ（スポット詳細・ブログ・都道府県・エリア・季節特集・地図・トップ等）。商品ごとの表示は動的。

| # | id | 商品表示名 | カテゴリ | 価格目安 | Amazon | 楽天 | 編集部おすすめ | 表示条件（季節／地域） |
|---|---|---|---|---|---|---|---|---|
| 1 | `af-beginner-set` | 釣り入門セット（ロッド・リール・仕掛け付き） | 仕掛け・ライン (`tackle`) | ¥8,000〜12,000 | ○ 直リンク | △ 検索リンク自動生成 | ★ | 通年 |
| 2 | `af-rod-shimano` | シマノ ロッド | 仕掛け・ライン (`tackle`) | ¥5,000〜8,000 | ○ 直リンク | △ 検索リンク自動生成 | ★ | 通年 |
| 3 | `af-reel-shimano` | シマノ リール | 仕掛け・ライン (`tackle`) | ¥4,000〜7,000 | ○ 直リンク | △ 検索リンク自動生成 | ★ | 通年 |
| 4 | `af-eging-rod` | エギングロッド | 仕掛け・ライン (`tackle`) | ¥5,000〜10,000 | ○ 直リンク | △ 検索リンク自動生成 | ★ | 通年 |
| 5 | `af-lifejacket` | ライフジャケット | ウェア (`wear`) | ¥3,000〜8,000 | ○ 直リンク | △ 検索リンク自動生成 | ★ | 通年 |
| 6 | `af-shimano-polarized-wellington` | シマノ 偏光グラス ウェリントングラス01 | 便利グッズ (`accessory`) | ¥5,000〜10,000 | ○ 直リンク | △ 検索リンク自動生成 | ★ | 通年 |
| 7 | `af-tackle-box` | 釣りボックス（座れる大容量） | 便利グッズ (`accessory`) | ¥3,000〜5,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 8 | `af-fishing-bag-large` | 大容量フィッシングバッグ（40L） | 便利グッズ (`accessory`) | ¥3,000〜5,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 9 | `af-egi-set` | エギ ルアー 10本セット（ラトル内蔵・夜光） | 仕掛け・ライン (`tackle`) | ¥1,500〜2,500 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 10 | `af-rod-holder` | 第一精工 受太郎 竿受け | 便利グッズ (`accessory`) | ¥1,000〜2,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 11 | `af-harris` | ハリス（フロロカーボン） | 仕掛け・ライン (`tackle`) | ¥300〜800 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 12 | `af-fluorocarbon-line` | フロロカーボンライン | 仕掛け・ライン (`tackle`) | ¥500〜1,500 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 13 | `af-winter-gloves` | 防寒フィッシンググローブ | ウェア (`wear`) | ¥1,500〜3,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 冬 |
| 14 | `af-heated-vest` | 電熱ベスト | ウェア (`wear`) | ¥3,000〜6,000 | ○ 直リンク | △ 検索リンク自動生成 | ★ | 冬 |
| 15 | `af-mobile-battery` | モバイルバッテリー | 便利グッズ (`accessory`) | ¥2,000〜4,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 16 | `af-amihime` | マルキュー アミ姫（コマセ） | エサ (`bait`) | ¥500〜800 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 17 | `af-pe-line` | 東レ PEライン（道糸） | 仕掛け・ライン (`tackle`) | ¥1,000〜2,500 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 18 | `af-nylon-line` | 東レ ナイロンライン（道糸） | 仕掛け・ライン (`tackle`) | ¥500〜1,500 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 19 | `af-anker-charger` | Anker モバイルバッテリー | 便利グッズ (`accessory`) | ¥3,000〜5,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 20 | `af-balaclava` | バラクラバ ネックウォーマー | ウェア (`wear`) | ¥1,000〜2,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 冬 |
| 21 | `af-fishing-bag-rakuten` | 釣りバッグ | 便利グッズ (`accessory`) | ¥2,000〜4,000 | — | ○ 直リンク |  | 通年 |
| 22 | `af-polarized-glasses` | 偏光サングラス | 便利グッズ (`accessory`) | ¥2,000〜5,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 23 | `af-fishing-vest` | 釣り用ベスト | ウェア (`wear`) | ¥2,000〜5,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 24 | `af-tako-ball` | タコ釣りボール（12粒セット・貝殻容器付） | エサ (`bait`) | ¥800〜1,200 | ○ 直リンク | △ 検索リンク自動生成 |  | 夏・秋 |
| 25 | `af-sinker` | おもりセット | 仕掛け・ライン (`tackle`) | ¥300〜800 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 26 | `af-snap` | スナップ（まとめ買い） | 仕掛け・ライン (`tackle`) | ¥300〜600 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 27 | `af-rod-stand` | ロッドスタンド | 便利グッズ (`accessory`) | ¥1,500〜3,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 28 | `af-basket` | 買い物かご（釣り用） | 便利グッズ (`accessory`) | ¥500〜1,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 29 | `af-line-recycler` | 第一精工 高速リサイクラー2.0 | 便利グッズ (`accessory`) | ¥2,000〜3,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 30 | `af-water` | 飲料水（まとめ買い） | 便利グッズ (`accessory`) | ¥1,000〜2,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 31 | `af-sagoshiz` | ダイワ サゴシーZ 95HS（サワラ専用ミノー） | 仕掛け・ライン (`tackle`) | ¥1,200〜1,800 | ○ 直リンク | △ 検索リンク自動生成 |  | 春・秋 |
| 32 | `af-jet-sinker` | ジェット天秤 | 仕掛け・ライン (`tackle`) | ¥300〜600 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年 |
| 33 | `af-drivemap-osaka-harima` | 令和版 海釣りドライブマップ② 大阪湾〜播磨灘 | 釣り場ガイド (`book`) | ¥1,500〜2,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年／大阪府・兵庫県限定 |
| 34 | `af-drivemap-ise-kito` | 令和版 海釣りドライブマップ① 伊勢湾〜紀東 | 釣り場ガイド (`book`) | ¥1,500〜2,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年／三重県・和歌山県限定 |
| 35 | `af-drivemap-tokyo-boso` | 令和版 海釣りドライブマップ① 東京湾〜房総半島 | 釣り場ガイド (`book`) | ¥1,500〜2,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年／東京都・神奈川県・千葉県限定 |
| 36 | `af-drivemap-tokyo-miura` | 令和版 海釣りドライブマップ 東京湾〜三浦半島 | 釣り場ガイド (`book`) | ¥1,500〜2,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年／東京都・神奈川県限定 |
| 37 | `af-drivemap-sagami` | 令和版 相模湾海釣りドライブマップ | 釣り場ガイド (`book`) | ¥1,500〜2,000 | ○ 直リンク | △ 検索リンク自動生成 |  | 通年／神奈川県・静岡県限定 |

### 4-B. `products.ts`（43件・全件画像なし）

カテゴリ内訳: 仕掛け 20 ／ アクセサリー 9 ／ ロッド 7 ／ リール 3 ／ ウェア 2 ／ クーラー 1 ／ その他（セット） 1。Amazon直リンクあり 20件、残り 23件は検索リンク。楽天は全件検索リンク。

「主な表示ページ」は、ページ側のフィルタ条件（釣法・難易度・カテゴリ・ID指定・`maxItems`/`slice`）から静的に確定するものを機械的に算出した。`/fish/[slug]` は `relatedFish` に一致する魚種ページ（最大3件表示、一致なしの魚種では優先度上位3件を表示）、`/monthly/[month]` は月ごとの対象魚・釣法で動的に決まるため列から除外している。

| # | id | 商品表示名 | カテゴリ | 価格目安 | Amazon | 楽天 | 主な表示ページ（静的に確定する分） | 魚種ページ候補 (/fish/[slug]) |
|---|---|---|---|---|---|---|---|---|
| 1 | `p1` | プロマリン わくわくサビキ釣りセットDX | その他 (`other`) | 3,000〜4,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/sabiki, /guide, /guide/fishing-gear-guide, /guide/budget, /guide/beginner, /guide/family, /guide/setup, /beginner-checklist, /gear, /for-beginners | aji, saba, iwashi |
| 2 | `p2` | ダイワ リバティクラブ 磯風 3-45遠投 | ロッド (`rod`) | 5,000〜7,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/sabiki, /guide/float-fishing, /guide/choinage, /guide/casting, /guide, /guide/fishing-gear-guide, /guide/budget, /guide/beginner, /guide/family, /guide/setup, /beginner-checklist, /gear | aji, saba, iwashi, kurodai, sayori |
| 3 | `p3` | シマノ セドナ 2500 | リール (`reel`) | 5,000〜6,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/sabiki, /guide/float-fishing, /guide/choinage, /guide/casting, /guide, /guide/fishing-gear-guide, /guide/budget, /guide/beginner, /guide/family, /guide/setup, /beginner-checklist, /gear | aji, saba, iwashi, kurodai, kisu |
| 4 | `p4` | ハヤブサ 実戦サビキ ピンクスキン 6本鈎 | 仕掛け (`tackle`) | 200〜400円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/sabiki, /guide/fishing-gear-guide, /guide/budget, /guide/beginner, /guide/family, /guide/setup, /beginner-checklist, /gear, /for-beginners | aji, saba, iwashi |
| 5 | `p5` | マルキュー アミ姫 | 仕掛け (`tackle`) | 300〜500円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/sabiki, /guide/fishing-gear-guide, /guide/budget, /guide/family, /guide/setup, /beginner-checklist, /gear, /for-beginners | aji, saba, iwashi |
| 6 | `p6` | ささめ針 ちょい投げセット | 仕掛け (`tackle`) | 300〜500円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/choinage, /guide/casting, /guide/fishing-gear-guide, /guide/budget, /guide/family, /guide/setup, /beginner-checklist, /gear | kisu, haze, karei |
| 7 | `p7` | ブラクリ 3号 | 仕掛け (`tackle`) | 200〜400円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/anazuri, /guide/fishing-gear-guide, /guide/family, /guide/setup, /gear | kasago, mebaru, ainame, kurosoi |
| 8 | `p8` | ダイワ 月下美人 アジング 60UL-S | ロッド (`rod`) | 8,000〜10,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/fishing-gear-guide, /gear | aji, mebaru |
| 9 | `p9` | メジャークラフト ジグパラ ショート 30g | 仕掛け (`tackle`) | 500〜700円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/lure, /guide/jigging, /gear | inada, saba, kamasu, hirame, magochi, buri |
| 10 | `p10` | ダイワ エメラルダス ラトル 3.5号 | 仕掛け (`tackle`) | 700〜1,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/eging, /gear | aoriika, yariika, kouika |
| 11 | `p11` | シマノ ラフトエアジャケット（ライフジャケット） | アクセサリー (`accessory`) | 4,000〜6,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/sabiki, /guide/eging, /guide/float-fishing, /guide/choinage, /guide/casting, /guide/family, /guide/setup, /gear, /guide/eging/gear | — |
| 12 | `p12` | ダイワ クールラインα3 S1500 | クーラー (`cooler`) | 4,000〜6,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/sabiki, /guide/float-fishing, /guide/choinage, /guide/casting, /gear | — |
| 13 | `p13` | ウミボウズ フィッシュグリップ | アクセサリー (`accessory`) | 1,500〜2,500円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/sabiki, /guide/lure, /guide/float-fishing, /guide/choinage, /guide/casting, /gear | — |
| 14 | `p14` | 第一精工 高速リサイクラー 2.0 | アクセサリー (`accessory`) | 2,000〜3,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /gear | — |
| 15 | `p15` | 冒険王 偏光サングラス SC-10 | ウェア (`wear`) | 1,500〜2,500円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /gear | — |
| 16 | `p20` | シマノ ディアルーナ S96MH | ロッド (`rod`) | 20,000〜28,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/lure | akame, suzuki, hiramasa, buri |
| 17 | `p21` | シマノ ツインパワー 4000XG | リール (`reel`) | 30,000〜40,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/lure | akame, suzuki, hiramasa, buri |
| 18 | `p22` | 東レ スーパーストロング PE×8 2号 200m | 仕掛け (`tackle`) | 2,500〜3,500円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/lure, /gear | akame, suzuki, hiramasa, buri, shiira |
| 19 | `p23` | クレハ シーガー グランドマックスFX 10号（40lb） | 仕掛け (`tackle`) | 1,500〜2,500円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/lure, /gear | akame, suzuki, hiramasa, buri |
| 20 | `p24` | ボガグリップ 30lb フィッシュグリップ | アクセサリー (`accessory`) | 3,000〜5,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/lure, /gear | akame, suzuki, hiramasa, buri, shiira, magochi |
| 21 | `p25` | ダイワ サゴシーZ 95HS（サワラ専用ミノー） | 仕掛け (`tackle`) | 1,200〜1,500円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/lure, /guide/jigging, /gear | sawara |
| 22 | `p26` | タコ釣りボール（12粒セット・貝殻容器2個付） | 仕掛け (`tackle`) | 1,000〜1,500円 | ○ 直リンク | △ 検索リンク自動生成 | /gear | madako |
| 23 | `p27` | エギ 10本セット（ラトル入り・夜光） | 仕掛け (`tackle`) | 2,000〜3,000円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/eging, /gear, /guide/eging/gear | aori-ika |
| 24 | `p28` | 東レ PEライン（道糸） | 仕掛け (`tackle`) | 1,500〜2,500円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/lure, /guide/jigging, /guide/eging, /guide/line, /gear, /guide/tachiuo, /guide/eging/gear | — |
| 25 | `p29` | フロロカーボンライン（リーダー/道糸） | 仕掛け (`tackle`) | 800〜1,500円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/eging, /guide/float-fishing, /guide/line, /gear, /guide/tachiuo, /guide/eging/gear | — |
| 26 | `p30` | 東レ ナイロンライン（道糸） | 仕掛け (`tackle`) | 600〜1,200円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/sabiki, /guide/oyogase, /guide/float-fishing, /guide/line, /guide/choinage, /guide/casting, /gear | — |
| 27 | `p31` | フロロカーボン ハリス | 仕掛け (`tackle`) | 500〜900円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/float-fishing, /guide/line, /guide/choinage, /guide/casting, /guide/rigs, /gear | — |
| 28 | `p32` | オモリ（錘）セット | 仕掛け (`tackle`) | 800〜1,500円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/jet-sinker, /guide/sinker, /guide/float-fishing, /guide/choinage, /guide/casting, /gear | — |
| 29 | `p33` | ジェット天秤 | 仕掛け (`tackle`) | 400〜800円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/jet-sinker, /guide/sinker, /guide/choinage, /guide/casting, /gear | kisu, karei |
| 30 | `p34` | スナップ（ルアー交換用） | 仕掛け (`tackle`) | 300〜600円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/lure, /guide/jigging, /guide/eging, /guide/rigs, /gear, /guide/tachiuo | — |
| 31 | `p35` | シマノ ルアーロッド | ロッド (`rod`) | 8,000〜12,000円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/lure, /guide/jigging, /guide/oyogase, /guide/eging, /gear, /guide/tachiuo | — |
| 32 | `p36` | シマノ スピニングリール | リール (`reel`) | 8,000〜13,000円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/lure, /guide/jigging, /guide/oyogase, /guide/eging, /gear, /guide/tachiuo | — |
| 33 | `p37` | 電熱ベスト | ウェア (`wear`) | 4,000〜7,000円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/night-fishing, /gear | — |
| 34 | `p38` | Anker モバイルバッテリー | アクセサリー (`accessory`) | 3,000〜5,000円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/night-fishing, /gear, /guide/tachiuo | — |
| 35 | `p39` | 防寒 釣り用グローブ | アクセサリー (`accessory`) | 1,500〜3,000円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/night-fishing, /gear | — |
| 36 | `p40` | 大容量フィッシングバッグ 40L | アクセサリー (`accessory`) | 4,000〜6,000円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/jigging, /gear | — |
| 37 | `p41` | シマノ 25ソルティーアドバンス ショアモデル エギング S83ML | ロッド (`rod`) | 12,000円前後 | ○ 直リンク | △ 検索リンク自動生成 | /guide/eging, /gear, /guide/eging/gear | aoriika, kouika, yariika |
| 38 | `p42` | シマノ セフィア BB（エギングロッド） | ロッド (`rod`) | 10,000〜15,000円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/eging, /gear, /guide/eging/gear | aoriika, kouika, yariika |
| 39 | `p43` | ダイワ エメラルダス（エギングロッド） | ロッド (`rod`) | 15,000〜30,000円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/eging, /gear, /guide/eging/gear | aoriika, kouika, yariika |
| 40 | `p44` | ヤマシタ エギ王 K 3.5号 | 仕掛け (`tackle`) | 1,000〜1,500円 | ○ 直リンク | △ 検索リンク自動生成 | /guide/eging, /gear, /guide/eging/gear | aoriika, kouika, yariika |
| 41 | `p45` | ヤマシタ ナオリー RH 3.5号 | 仕掛け (`tackle`) | 900〜1,400円 | △ 検索リンク自動生成 | △ 検索リンク自動生成 | /guide/eging, /gear, /guide/eging/gear | aoriika, kouika, yariika |
| 42 | `p48` | シーボンズ 釣り用ヘッドライト（赤色LED搭載・タイプC充電） | アクセサリー (`accessory`) | 4,000円前後 | ○ 直リンク | △ 検索リンク自動生成 | /guide/eging, /gear, /guide/eging/gear | aoriika, kouika, yariika |
| 43 | `p49` | ギャフ（エギング用・取り込み） | アクセサリー (`accessory`) | 価格は商品ページで確認 | ○ 直リンク | △ 検索リンク自動生成 | /guide/eging, /gear, /guide/eging/gear | aoriika, kouika, yariika |

## 5. 調査方法（再現手順）

1. `grep` で「編集部おすすめ」「amzn.to」「getRelevantAffiliateProducts」「ProductList」等を検索し、データ定義とコンポーネントを特定。
2. 2つのデータファイルを Node.js（`--experimental-strip-types`）で読み込み、配列をJSON化して件数・`image` フィールドの有無を集計（`affiliateProducts` 37件 / `products` 43件、`image` 設定 0件）。
3. 各ページのフィルタ呼び出し（`getProductsByMethod` / `getTopProducts` / `getBeginnerEssentials` / ID指定 など）を確認し、B系統の表示ページを算出。
4. `public/images` 配下に商品画像ディレクトリが存在しないことを確認。
## 6. 追記（2026-11-23）: SiteStripe 旧形式URLは使用不可

`ws-fe.amazon-adsystem.com/widgets/q?...ID=AsinImage...`（旧 SiteStripe 画像リンク形式）を35件に設定する試みは、**ドメインが DNS で解決できない（`DNS_PROBE_FINISHED_NXDOMAIN`）ため取り消した**。この形式は廃止済みとみなし、今後使わないこと。

参考として、`amzn.to` を展開して取得した ASIN（展開先の商品名とデータの商品名の一致を確認済み）を残す。画像を設定する際の照合用。

| id | ASIN | 備考 |
|---|---|---|
| `af-beginner-set` | B0GMZ5P9WH |  |
| `af-rod-shimano` | B071WL1RZT |  |
| `af-reel-shimano` | B07W6YLDGH |  |
| `af-eging-rod` | B0F9Y7WBL2 |  |
| `af-lifejacket` | B07YWGH228 |  |
| `af-shimano-polarized-wellington` | B0DRJLQ9LV |  |
| `af-tackle-box` | B014P7ETAU |  |
| `af-fishing-bag-large` | B0BC1PW3WB |  |
| `af-egi-set` | B0CDBHY6CC |  |
| `af-rod-holder` | B000AR6SOA |  |
| `af-harris` | B0C7VD8VBP | ハリスとフロロラインが同一商品 |
| `af-fluorocarbon-line` | B0C7VD8VBP | ハリスとフロロラインが同一商品 |
| `af-winter-gloves` | B0CBJH3FJP |  |
| `af-heated-vest` | — | 展開先が Amazon キャンペーンページ（商品ページではない）。リンク見直し推奨 |
| `af-mobile-battery` | B0CQX67KTW | バッテリー2件が同一商品 |
| `af-amihime` | B0C8YL9TVW |  |
| `af-pe-line` | B0027VSG8I |  |
| `af-nylon-line` | B01LZ454UO |  |
| `af-anker-charger` | B0CQX67KTW | バッテリー2件が同一商品 |
| `af-balaclava` | B0FQ5QJSXJ |  |
| `af-fishing-bag-rakuten` | — | 楽天リンク |
| `af-polarized-glasses` | B007SQ7GVU |  |
| `af-fishing-vest` | B08TR3TM6D |  |
| `af-tako-ball` | B0C4TS4RDP |  |
| `af-sinker` | B000AR6WPU |  |
| `af-snap` | B07HVTQHSC |  |
| `af-rod-stand` | B01GTD4VPG |  |
| `af-basket` | B09LQ9JJY4 |  |
| `af-line-recycler` | B00BAKO8ZM |  |
| `af-water` | B07RWWZT8J |  |
| `af-sagoshiz` | B083WGX5RR |  |
| `af-jet-sinker` | B000AQR32M |  |
| `af-drivemap-osaka-harima` | B09J891N22 |  |
| `af-drivemap-ise-kito` | B099JV6L55 |  |
| `af-drivemap-tokyo-boso` | B08C5G6CFD |  |
| `af-drivemap-tokyo-miura` | B0DG4ZBT73 |  |
| `af-drivemap-sagami` | B09TDF6PKB |  |
