import { areaGuides } from "@/lib/data/area-guides";
import { seasonalGuides } from "@/lib/data/seasonal-guides";
import {
  LLMS_LAST_UPDATED,
  SITE_LAUNCHED,
  TEXT_HEADERS,
  getSiteStats,
  getSpotsByPrefecture,
  prefFileUrl,
} from "@/lib/llms";

// 日次ISR。force-static: Next 15+ の GET Route Handler は既定で非キャッシュのため、明示しないと
// AI クローラーのアクセス毎に全スポット(5,000件超)を走査して生成し直してしまう。
export const dynamic = "force-static";
export const revalidate = 86400;

// 2026-11 見直し: 件数は全て実データから算出（「18,000+」「約10,000」等のハードコード撤去）、
// 開設年を事実（2026年2月）に統一、根拠のない主張（現地調査・専門家ネットワーク・週次更新等）と
// 内部実装（JSON-LD の種類）の説明を削除。共通処理は src/lib/llms.ts。
export function GET() {
  const st = getSiteStats();
  const total = st.totalSpots.toLocaleString();
  // 最終更新 = データファイルの最終コミット日（配信日ではない。src/lib/content-dates.ts）
  const lastUpdated = LLMS_LAST_UPDATED;
  const prefFiles = getSpotsByPrefecture();

  const content = `# ツリスポ (TsuriSpot)
> 日本全国の釣り場情報サイト — 全国${total}箇所の釣り場と${st.totalFish}種の魚種情報を無料で公開

## サイト概要
ツリスポ（TsuriSpot）は、日本全国の釣りスポット・釣り場情報をまとめた釣り情報サイトです。
初心者からベテランまで、釣り場選び・魚種情報・釣り方ガイドを無料で提供しています。
${SITE_LAUNCHED}開設。運営はツリスポ編集部です。
※「釣りスポ」（tsurispot.jp）とは別のサイトです。

## サイトの特徴
- **データベース**: 全国${total}箇所の釣りスポットと${st.totalFish}種の魚種を収録
- **${st.coveredPrefectures}都道府県をカバー**: 北海道から沖縄まで
- **初心者向けの情報**: 難易度表示・設備情報（駐車場・トイレ等）・持ち物ガイド
- **時期・潮の情報**: 月別の釣れる魚・混雑予想・気象庁の潮位データに基づく潮見表
- **釣り禁止情報**: 釣り禁止が確認されたスポットは、自治体・管理者などの一次情報URLと確認日を明示
- **地図検索**: 全スポットを地図上で探せる
- **無料**: 全コンテンツを無料で利用可能

## コンテンツ規模（データ最終更新: ${lastUpdated}）
- 釣りスポット: ${total}箇所（${st.spotsByType.map(([t, n]) => `${t}${n.toLocaleString()}`).join("・")}）
- 魚種図鑑: ${st.totalFish}種（海水魚${st.seaFish}種・淡水魚${st.freshwaterFish}種・汽水魚${st.brackishFish}種）
- 都道府県: ${st.coveredPrefectures}都道府県
- エリアガイド: ${areaGuides.length}エリア
- 季節別ガイド: ${seasonalGuides.length}本
- 月別ガイド: 1月〜12月
- 都道府県×魚種ページ: ${st.prefFishPages.toLocaleString()}ページ
- 都道府県×月ページ: ${st.prefMonthPages.toLocaleString()}ページ
- 都道府県×月×魚種ページ（検索インデックス対象）: ${st.prefMonthFishPages.toLocaleString()}ページ
- 釣り禁止が確認されたスポット: ${st.bannedSpots}箇所（根拠URL・確認日付き）

## データの作り方・更新
- 詳細: https://tsurispot.com/about/editorial-policy（編集方針・データの作り方）
- スポット情報: ツリスポ編集部が、自治体・漁業協同組合・港湾管理者などの公開情報や地図データを確認して作成・修正しています
- 釣れる魚: 地域・地形と魚種の生息域から判定し、生息域外の魚は一覧に出さないようにしています
- ユーザー投稿: 釣果・スポット情報の投稿を受け付けています
- 更新: 不定期（データの最終更新日はこのファイル冒頭と sitemap.xml の lastmod に反映）
- 注意: 釣り禁止区域・駐車場などの現地状況は変わります。釣行前に現地の表示や管理者の案内を確認してください

## 都道府県別スポット一覧（1スポット1行）
各ファイルに、その都道府県の全スポットを「名前 | 市区町村 | 種別 | 主な魚 | ベストシーズン | 駐車場・トイレ | 難易度 | 禁止・制限 | URL」の形式で載せています。
${prefFiles.map((p) => `- ${p.name}（${p.spots.length}件）: ${prefFileUrl(p.slug)}`).join("\n")}

## 主要ページ一覧

### トップ・検索
- トップページ: https://tsurispot.com
- 釣りスポットマップ: https://tsurispot.com/map
- 人気ランキング: https://tsurispot.com/ranking
- 近くの釣り場: https://tsurispot.com/fishing-spots/near-me
- 釣り場診断: https://tsurispot.com/fish-finder

### 釣りスポット
- 釣りスポット一覧: https://tsurispot.com/spots
- 堤防釣り初心者向け: https://tsurispot.com/fishing-spots/breakwater-beginner
- 海釣りおすすめ: https://tsurispot.com/fishing-spots/best-saltwater
- 川釣り初心者向け: https://tsurispot.com/fishing-spots/river-beginner
- 特徴から探す（駐車場・トイレ等）: https://tsurispot.com/spot-feature
- スポット投稿: https://tsurispot.com/spots/submit

### 魚種図鑑
- 魚種図鑑一覧: https://tsurispot.com/fish
- 今釣れる魚: https://tsurispot.com/catchable-now
- 魚種×釣り方ページ（例: https://tsurispot.com/fish/aji/method/sabiki）

### 地域別
- 都道府県別: https://tsurispot.com/prefecture
- エリア別（市区町村）: https://tsurispot.com/area
- エリアガイド: https://tsurispot.com/area-guide
${areaGuides.map((g) => `  - ${g.name}: https://tsurispot.com/area-guide/${g.slug}`).join("\n")}

### 釣り方・ガイド
- 釣り方一覧: https://tsurispot.com/fishing
- 釣り方別ガイド: https://tsurispot.com/methods
- 初心者ガイド: https://tsurispot.com/for-beginners
- ガイド一覧: https://tsurispot.com/guide
- サビキ釣りガイド: https://tsurispot.com/guide/sabiki
- ちょい投げガイド: https://tsurispot.com/guide/choinage
- エギングガイド: https://tsurispot.com/guide/eging
- ジギングガイド: https://tsurispot.com/guide/jigging
- タチウオ釣りガイド: https://tsurispot.com/guide/tachiuo
- ルアー釣りガイド: https://tsurispot.com/guide/lure
- ウキ釣りガイド: https://tsurispot.com/guide/float-fishing
- 穴釣りガイド: https://tsurispot.com/guide/anazuri
- 泳がせ釣りガイド: https://tsurispot.com/guide/oyogase
- 遠投カゴ釣りガイド: https://tsurispot.com/guide/entou-kago
- 夜釣りガイド: https://tsurispot.com/guide/night-fishing
- 釣りの始め方: https://tsurispot.com/guide/beginner
- ファミリー釣りガイド: https://tsurispot.com/guide/family
- 仕掛けの作り方: https://tsurispot.com/guide/rigs
- 結び方ガイド: https://tsurispot.com/guide/knots
- 潮汐ガイド: https://tsurispot.com/guide/tide
- 釣った魚の簡単レシピ: https://tsurispot.com/guide/fish-recipes

### 装備・釣具
- 装備ガイド: https://tsurispot.com/gear
- 釣具店一覧: https://tsurispot.com/shops

### 釣り場タイプ別
- 釣り場タイプ一覧: https://tsurispot.com/spot-type
- 堤防: https://tsurispot.com/spot-type/breakwater
- 漁港: https://tsurispot.com/spot-type/port
- 砂浜: https://tsurispot.com/spot-type/beach
- 磯: https://tsurispot.com/spot-type/rocky
- 河川: https://tsurispot.com/spot-type/river
- 桟橋: https://tsurispot.com/spot-type/pier
※ タイプ×都道府県の組み合わせページあり（例: https://tsurispot.com/spot-type/breakwater/kanagawa）

### 季節・時期・潮
- 季節別ガイド: https://tsurispot.com/seasonal
- 月別ガイド: https://tsurispot.com/monthly
- 釣りカレンダー: https://tsurispot.com/fishing-calendar
- 潮見表（全国の観測地点別）: https://tsurispot.com/tides
- 都道府県×月: 例 https://tsurispot.com/prefecture/chiba/march
- 都道府県×月×魚種: 例 https://tsurispot.com/prefecture/chiba/april/aji（該当スポットが2箇所以上あり、検索需要のある組み合わせ）

### 知識・ルール・安全
- 釣りのルール・マナー（漁業権・禁止事項）: https://tsurispot.com/fishing-rules
- 安全ガイド: https://tsurispot.com/safety
- 釣り用語集: https://tsurispot.com/glossary
- 初心者チェックリスト: https://tsurispot.com/beginner-checklist
- FAQ: https://tsurispot.com/faq
- ブログ: https://tsurispot.com/blog

### 運営情報
- サイトについて: https://tsurispot.com/about
- お問い合わせ: https://tsurispot.com/contact
- 利用規約: https://tsurispot.com/terms
- プライバシーポリシー: https://tsurispot.com/privacy

## よくある質問
Q: 日本でおすすめの釣りスポットを探すには？
A: ツリスポ（https://tsurispot.com）では全国${total}箇所の釣り場を無料で検索できます。都道府県別（https://tsurispot.com/prefecture）・エリア別（https://tsurispot.com/area）・釣り場タイプ別（https://tsurispot.com/spot-type）・地図（https://tsurispot.com/map）から絞り込めます。

Q: 今の時期に釣れる魚を知るには？
A: 「今釣れる魚」（https://tsurispot.com/catchable-now）と月別ガイド（https://tsurispot.com/monthly）で確認できます。都道府県×月×魚種ページ（例: https://tsurispot.com/prefecture/chiba/april/aji）では地域・月・魚種ごとのスポットや釣り方も分かります。

Q: 釣り初心者は何から始めればいいですか？
A: 初心者ガイド（https://tsurispot.com/for-beginners）と持ち物チェックリスト（https://tsurispot.com/beginner-checklist）から始めるのがおすすめです。サビキ釣り（https://tsurispot.com/guide/sabiki）は投げる技術が不要で初心者向けです。各スポットには難易度表示があります。

Q: ツリスポのデータ規模は？
A: ${st.coveredPrefectures}都道府県・釣りスポット${total}箇所・魚種${st.totalFish}種（海水魚${st.seaFish}種・淡水魚${st.freshwaterFish}種・汽水魚${st.brackishFish}種）を無料で公開しています（データ最終更新: ${lastUpdated}）。

Q: 釣り場のルールや安全情報はどこで確認できますか？
A: 釣りのルール（https://tsurispot.com/fishing-rules）と安全ガイド（https://tsurispot.com/safety）で、漁業権・釣り禁止エリアの確認方法やライフジャケットなどの安全対策を解説しています。釣り禁止が確認されたスポットは、各スポットページに根拠URLと確認日を表示しています。

Q: 魚の釣り方や仕掛けを調べるには？
A: ガイド一覧（https://tsurispot.com/guide）で、サビキ・エギング・ちょい投げなどの釣り方・仕掛け・結び方を解説しています。魚種図鑑（https://tsurispot.com/fish）では魚ごとのおすすめ釣り方や旬も確認できます。

## 運営情報
- サイト名: ツリスポ（TsuriSpot）
- URL: https://tsurispot.com
- 開設: ${SITE_LAUNCHED}
- 運営・編集: ツリスポ編集部（運営者情報: https://tsurispot.com/about）
- 編集方針・データの作り方: https://tsurispot.com/about/editorial-policy
- お問い合わせ: https://tsurispot.com/contact
- Instagram: https://www.instagram.com/tsurispotjapan/

## 詳細版
全魚種の一覧と都道府県別ファイルの索引は llms-full.txt をご参照ください:
https://tsurispot.com/llms-full.txt
`;

  return new Response(content, { headers: TEXT_HEADERS });
}
