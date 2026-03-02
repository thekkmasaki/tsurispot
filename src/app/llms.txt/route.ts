import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { prefectures } from "@/lib/data/prefectures";

export function GET() {
  const totalSpots = fishingSpots.length;
  const totalFish = fishSpecies.length;
  const totalPrefectures = prefectures.length;

  const content = `# ツリスポ (TsuriSpot)
> 日本最大級の釣りスポット情報サイト

## サイト概要
ツリスポは、日本全国の釣りスポット・釣り場情報を網羅した総合釣り情報プラットフォームです。
初心者からベテランまで、釣り場選び・魚種情報・釣り方ガイドを無料で提供しています。

## コンテンツ規模
- 釣りスポット: ${totalSpots}箇所以上（堤防・漁港・磯・河川・湖沼）
- 魚種図鑑: ${totalFish}種以上（海水魚・淡水魚）
- 都道府県: ${totalPrefectures}都道府県カバー
- 釣り方ガイド: サビキ釣り・ちょい投げ・エギング・アジング等10種以上
- 季節別ガイド: 春夏秋冬の釣り方・旬の魚情報

## 主要ページ
- トップページ: https://tsurispot.com
- 釣りスポット一覧: https://tsurispot.com/spots
- 魚種図鑑: https://tsurispot.com/fish
- 都道府県別: https://tsurispot.com/prefecture
- エリア別: https://tsurispot.com/area
- 今釣れる魚: https://tsurispot.com/catchable-now
- 釣りスポットマップ: https://tsurispot.com/map
- 人気ランキング: https://tsurispot.com/ranking
- 潮汐情報: https://tsurispot.com/tides
- 釣りカレンダー: https://tsurispot.com/fishing-calendar
- 初心者ガイド: https://tsurispot.com/for-beginners
- 釣り方一覧: https://tsurispot.com/fishing
- 釣り方別ガイド: https://tsurispot.com/methods
- 装備ガイド: https://tsurispot.com/gear
- 釣り用語集: https://tsurispot.com/glossary
- 季節別ガイド: https://tsurispot.com/seasonal
- エリアガイド: https://tsurispot.com/area-guide
- 月別ガイド: https://tsurispot.com/monthly
- 安全ガイド: https://tsurispot.com/safety
- 釣具店一覧: https://tsurispot.com/shops
- ブログ: https://tsurispot.com/blog
- FAQ: https://tsurispot.com/faq

## データ構造
各釣りスポットには以下の情報が含まれます:
- 名前・住所・緯度経度
- スポットタイプ（堤防・漁港・磯・河川・湖沼・管理釣り場等）
- 釣れる魚種（魚名・釣り方・ベストシーズン）
- 難易度（初心者向け〜上級者向け）
- 設備情報（駐車場・トイレ・釣具店の有無）
- 安全情報・混雑予想・潮汐情報

各魚種には以下の情報が含まれます:
- 名前・学名・別名
- 分類（海水魚・淡水魚）
- ベストシーズン（月別カレンダー）
- おすすめ釣り方・仕掛け
- 食味情報・おすすめ調理法
- 釣れるスポット一覧

## 運営
- サイト名: ツリスポ (TsuriSpot)
- URL: https://tsurispot.com
- 運営: TsuriSpot編集部
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
