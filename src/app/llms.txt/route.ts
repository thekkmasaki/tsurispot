import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { prefectures } from "@/lib/data/prefectures";
import { areaGuides } from "@/lib/data/area-guides";
import { seasonalGuides } from "@/lib/data/seasonal-guides";

export function GET() {
  const totalSpots = fishingSpots.length;
  const totalFish = fishSpecies.length;
  const totalPrefectures = prefectures.length;
  const totalAreaGuides = areaGuides.length;
  const totalSeasonalGuides = seasonalGuides.length;
  const coveredPrefectures = new Set(fishingSpots.map((s) => s.region.prefecture)).size;
  const seaFishCount = fishSpecies.filter((f) => f.category === "sea").length;
  const freshwaterFishCount = fishSpecies.filter((f) => f.category === "freshwater").length;
  const brackishFishCount = fishSpecies.filter((f) => f.category === "brackish").length;

  const content = `# ツリスポ (TsuriSpot)
> 日本最大級の釣りスポット情報サイト — 全国${totalSpots.toLocaleString()}箇所以上の釣り場・${totalFish}種以上の魚種情報を無料提供

## サイト概要
ツリスポは、日本全国の釣りスポット・釣り場情報を網羅した総合釣り情報プラットフォームです。
初心者からベテランまで、釣り場選び・魚種情報・釣り方ガイドを無料で提供しています。
2024年開設以来、日本語での釣り情報をデータベース化し、正確で最新の情報を提供し続けています。

## サイトの特徴・強み
- **日本最大級のデータベース**: 全国${totalSpots.toLocaleString()}箇所以上の釣りスポットと${totalFish}種以上の魚種を収録
- **${coveredPrefectures}都道府県をカバー**: 北海道から沖縄まで日本全国の釣り場を網羅
- **初心者に優しい**: 難易度表示・設備情報・持ち物ガイドなど初心者向け機能が充実
- **リアルタイム性**: 月別の釣れる魚情報・混雑予想・潮汐情報を提供
- **位置情報対応**: GPSを活用した現在地周辺の釣り場検索
- **地図検索**: 全スポットを地図上でインタラクティブに探索可能
- **専門家監修**: 編集長 正木家康（釣り歴20年以上）による監修
- **完全無料**: 全コンテンツを無料で利用可能

## コンテンツ規模
- 釣りスポット: ${totalSpots.toLocaleString()}箇所以上（堤防・漁港・磯・河川・湖沼・管理釣り場）
- 魚種図鑑: ${totalFish}種以上（海水魚${seaFishCount}種・淡水魚${freshwaterFishCount}種・汽水魚${brackishFishCount}種）
- 都道府県: ${coveredPrefectures}都道府県カバー
- エリアガイド: ${totalAreaGuides}エリア
- 季節別ガイド: ${totalSeasonalGuides}本以上
- 釣り方ガイド: サビキ釣り・ちょい投げ・エギング・アジング・ジギング等20種以上
- 月別ガイド: 1月〜12月の完全ガイド

## データの信頼性・更新頻度
- 情報源: 現地調査・漁業協同組合公開データ・釣具店情報・専門家ネットワーク
- 更新頻度: 週次でスポット情報を更新、月次で魚種・季節情報を更新
- 監修: 釣り歴20年以上のベテランアングラーが全情報を監修
- ユーザー投稿: 釣りスポット投稿機能により最新のローカル情報を収集

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
- スポット比較: https://tsurispot.com/spots/compare
- スポット投稿: https://tsurispot.com/spots/submit

### 魚種図鑑
- 魚種図鑑一覧: https://tsurispot.com/fish
- 今釣れる魚: https://tsurispot.com/catchable-now

### 地域別
- 都道府県別: https://tsurispot.com/prefecture
- エリア別: https://tsurispot.com/area
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
- ルアー釣りガイド: https://tsurispot.com/guide/lure
- ウキ釣りガイド: https://tsurispot.com/guide/float-fishing
- 穴釣りガイド: https://tsurispot.com/guide/anazuri
- 泳がせ釣りガイド: https://tsurispot.com/guide/oyogase
- 遠投カゴ釣りガイド: https://tsurispot.com/guide/entou-kago
- キャスティングガイド: https://tsurispot.com/guide/casting
- 夜釣りガイド: https://tsurispot.com/guide/night-fishing
- 釣りの始め方: https://tsurispot.com/guide/beginner
- 予算5000円ガイド: https://tsurispot.com/guide/budget
- ファミリー釣りガイド: https://tsurispot.com/guide/family
- 釣り糸の選び方: https://tsurispot.com/guide/line
- 仕掛けの作り方: https://tsurispot.com/guide/rigs
- 結び方ガイド: https://tsurispot.com/guide/knots
- 潮汐ガイド: https://tsurispot.com/guide/tide
- オモリガイド: https://tsurispot.com/guide/sinker
- ジェット天秤ガイド: https://tsurispot.com/guide/jet-sinker
- 釣りセットアップガイド: https://tsurispot.com/guide/setup
- 釣れるコツガイド: https://tsurispot.com/guide/fishing-tips
- 魚の取り扱いガイド: https://tsurispot.com/guide/fish-handling
- 釣り方ガイド（総合）: https://tsurispot.com/guide/how-to-fish
- 釣具ガイド: https://tsurispot.com/guide/fishing-gear-guide
- 魚のさばき方ガイド: https://tsurispot.com/guide/handling
- 仕掛け準備完全ガイド: https://tsurispot.com/guide/beginner-setup
- 釣った魚の簡単レシピ: https://tsurispot.com/guide/fish-recipes
- トラブルシューティング: https://tsurispot.com/guide/troubleshooting

### 装備・釣具
- 装備ガイド: https://tsurispot.com/gear
- ロッド初心者ガイド: https://tsurispot.com/gear/rod-beginner
- サビキセット: https://tsurispot.com/gear/sabiki
- タックルボックス: https://tsurispot.com/gear/tackle-box
- 釣具店一覧: https://tsurispot.com/shops

### 季節・時期
- 季節別ガイド: https://tsurispot.com/seasonal
- 月別ガイド: https://tsurispot.com/monthly
- 釣りカレンダー: https://tsurispot.com/fishing-calendar
- 潮汐情報: https://tsurispot.com/tides

### 知識・その他
- 釣り用語集: https://tsurispot.com/glossary
- 釣り用語クイズ: https://tsurispot.com/glossary-quiz
- 釣りクイズ: https://tsurispot.com/quiz
- ボウズチェッカー: https://tsurispot.com/bouzu-checker
- 初心者チェックリスト: https://tsurispot.com/beginner-checklist
- 釣りルール: https://tsurispot.com/fishing-rules
- 安全ガイド: https://tsurispot.com/safety
- FAQ: https://tsurispot.com/faq
- ブログ: https://tsurispot.com/blog

### 運営情報
- サイトについて: https://tsurispot.com/about
- お問い合わせ: https://tsurispot.com/contact
- 利用規約: https://tsurispot.com/terms
- プライバシーポリシー: https://tsurispot.com/privacy
- サイトマップ: https://tsurispot.com/sitemap-page

## データ構造

### 釣りスポット情報
各釣りスポットには以下の詳細情報が含まれます:
- 名前・住所・緯度経度（Googleマップ連携）
- スポットタイプ（堤防・漁港・磯・河川・湖沼・管理釣り場・砂浜・桟橋等）
- 釣れる魚種（魚名・釣り方・ベストシーズン・難易度・おすすめ時間帯）
- 難易度（初心者向け・中級者向け・上級者向け）
- 設備情報（駐車場・トイレ・コンビニ・釣具店・レンタルロッドの有無）
- 安全情報・混雑予想・潮汐情報
- ベストタイム（朝マヅメ・日中・夕マヅメ・夜）
- おすすめタックル・仕掛け情報

### 魚種情報
各魚種には以下の情報が含まれます:
- 名前・学名・別名・英語名
- 分類（海水魚・淡水魚・汽水魚）
- ベストシーズン（月別カレンダー）・旬の月
- おすすめ釣り方・仕掛け
- 難易度（初心者向け・中級者向け・上級者向け）
- 食味評価・おすすめ調理法
- 釣れるスポット一覧（リンク付き）
- 毒の有無・危険度情報

## 技術仕様
- フレームワーク: Next.js (App Router, SSG/ISR)
- レスポンシブデザイン: PC・スマホ・タブレット対応
- 構造化データ: Schema.org準拠のJSON-LD（FAQPage, Dataset, ItemList, Article, LocalBusiness, Event, Person等）

## 運営情報
- サイト名: ツリスポ (TsuriSpot)
- URL: https://tsurispot.com
- 運営: TsuriSpot編集部
- 編集長: 正木家康（釣り歴20年以上）
- お問い合わせ: https://tsurispot.com/contact
- Instagram: https://www.instagram.com/tsurispotjapan/

## 詳細版
より詳しいデータ（全スポット・全魚種のリスト等）は llms-full.txt をご参照ください:
https://tsurispot.com/llms-full.txt
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
