import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { prefectures } from "@/lib/data/prefectures";
import { areaGuides } from "@/lib/data/area-guides";
import { seasonalGuides } from "@/lib/data/seasonal-guides";

export function GET() {
  const totalSpots = fishingSpots.length;
  const totalFish = fishSpecies.length;
  const coveredPrefectures = new Set(fishingSpots.map((s) => s.region.prefecture)).size;
  // 固定日付の陳腐化を防ぐため、生成（デプロイ／配信）時点の現在日付を動的に反映する。
  const lastUpdated = new Date().toISOString().split("T")[0];

  // 都道府県別スポット集計
  const spotsByPrefecture = new Map<string, typeof fishingSpots>();
  for (const spot of fishingSpots) {
    const pref = spot.region.prefecture;
    if (!spotsByPrefecture.has(pref)) spotsByPrefecture.set(pref, []);
    spotsByPrefecture.get(pref)!.push(spot);
  }

  // スポットタイプ別集計
  const spotTypeLabels: Record<string, string> = {
    port: "漁港",
    breakwater: "堤防",
    rocky: "磯",
    beach: "砂浜",
    river: "河川",
    lake: "湖沼",
    pier: "桟橋",
    managed: "管理釣り場",
  };
  const spotsByType = new Map<string, number>();
  for (const spot of fishingSpots) {
    const t = spot.spotType;
    spotsByType.set(t, (spotsByType.get(t) || 0) + 1);
  }

  // --- ヘッダー ---
  let content = `# ツリスポ (TsuriSpot) — 詳細データ
> llms-full.txt: 全釣りスポット・全魚種のデータリスト
> 簡易版: https://tsurispot.com/llms.txt

## サイト概要
ツリスポ（https://tsurispot.com）は日本最大級の釣りスポット情報サイトです。
全国${totalSpots.toLocaleString()}箇所以上の釣り場と${totalFish}種以上の魚種情報を無料で提供しています。

## データ統計（最終更新: ${lastUpdated}）
- 総スポット数: ${totalSpots.toLocaleString()}
- 総魚種数: ${totalFish}
- カバー都道府県: ${coveredPrefectures}
- エリアガイド: ${areaGuides.length}エリア
- 季節別ガイド: ${seasonalGuides.length}本
- 都道府県×月×魚種ページ: 約2,000〜4,000ページ（pSEO自動生成）
- 総ページ数: 8,000+

## スポットタイプ別件数
${Array.from(spotsByType.entries())
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- ${spotTypeLabels[type] || type}: ${count}件`)
  .join("\n")}

`;

  // --- 都道府県別スポット一覧 ---
  content += `## 都道府県別 釣りスポット一覧\n\n`;

  const prefOrder = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
    "岐阜県", "静岡県", "愛知県", "三重県",
    "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
    "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県",
    "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
  ];

  for (const pref of prefOrder) {
    const spots = spotsByPrefecture.get(pref);
    if (!spots || spots.length === 0) continue;
    content += `### ${pref}（${spots.length}件）\n`;
    for (const s of spots) {
      const fishNames = s.catchableFish.slice(0, 5).map((cf) => cf.fish.name).join("・");
      content += `- ${s.name}（${spotTypeLabels[s.spotType] || s.spotType}） [${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}] 釣れる魚: ${fishNames}\n`;
      content += `  URL: https://tsurispot.com/spots/${s.slug}\n`;
    }
    content += "\n";
  }

  // --- 全魚種一覧 ---
  content += `## 全魚種一覧（${totalFish}種）\n\n`;

  const difficultyLabels: Record<string, string> = {
    beginner: "初心者向け",
    intermediate: "中級者向け",
    advanced: "上級者向け",
  };

  const categoryLabels: Record<string, string> = {
    sea: "海水魚",
    freshwater: "淡水魚",
    brackish: "汽水魚",
  };

  for (const fish of fishSpecies) {
    const peakStr = fish.peakMonths.length > 0
      ? fish.peakMonths.map((m) => `${m}月`).join("・")
      : "通年";
    content += `- **${fish.name}**（${fish.nameEnglish}）\n`;
    content += `  分類: ${categoryLabels[fish.category] || fish.category} | 難易度: ${difficultyLabels[fish.difficulty] || fish.difficulty} | 旬: ${peakStr}\n`;
    content += `  URL: https://tsurispot.com/fish/${fish.slug}\n`;
  }

  content += "\n";

  // --- エリアガイド一覧 ---
  content += `## エリアガイド一覧（${areaGuides.length}エリア）\n\n`;
  for (const guide of areaGuides) {
    content += `- **${guide.name}**: ${guide.description.slice(0, 80)}...\n`;
    content += `  対象都道府県: ${guide.prefectures.join("・")} | ベストシーズン: ${guide.bestSeason} | 主な魚: ${guide.mainFish.join("・")}\n`;
    content += `  URL: https://tsurispot.com/area-guide/${guide.slug}\n`;
  }

  content += "\n";

  // --- 季節別ガイド一覧 ---
  content += `## 季節別ガイド一覧（${seasonalGuides.length}本）\n\n`;
  for (const guide of seasonalGuides) {
    content += `- **${guide.title}**（${guide.season}・${guide.months.map((m) => `${m}月`).join("")}）\n`;
    content += `  釣り方: ${guide.method} | 対象魚: ${guide.targetFish.join("・")}\n`;
    content += `  URL: https://tsurispot.com/seasonal/${guide.slug}\n`;
  }

  content += "\n";

  // --- サイト構造 ---
  content += `## サイト構造

### URL構造
- /spots/{slug} — 個別釣りスポット詳細ページ
- /fish/{slug} — 個別魚種詳細ページ
- /prefecture/{slug} — 都道府県別釣りスポット一覧
- /prefecture/{slug}/{month} — 都道府県×月別ガイド（47×12=564ページ）
- /prefecture/{slug}/{month}/{fishSlug} — 都道府県×月×魚種ページ（pSEO、約2,000〜4,000ページ）
- /area-guide/{slug} — エリアガイド詳細
- /seasonal/{slug} — 季節別ガイド詳細
- /fishing/{method} — 釣り方別ページ
- /monthly/{month} — 月別ガイド（1〜12）
- /guide/{topic} — 各種ガイドページ
- /blog/{slug} — ブログ記事

### 都道府県×月×魚種ページ（pSEO）— 詳細
URL: /prefecture/{都道府県slug}/{月slug}/{魚種slug}
例: /prefecture/chiba/april/aji（千葉県の4月のアジ釣り）

**生成ルール**:
- 該当する都道府県内で、その月にその魚種が釣れるスポットが2箇所以上存在する場合にのみページを生成
- 47都道府県×12ヶ月×115魚種の全組み合わせから品質フィルタで絞り込み → 約2,000〜4,000ページ
- 全ページSSG（静的生成）

**各ページのコンテンツ構成**:
1. サマリーカード: 都道府県名・月・魚種名・該当スポット数・おすすめ釣り方・水温目安
2. シーズンカレンダー: その魚種が都道府県内で釣れる月を12ヶ月カレンダーで表示、月間ナビゲーション付き
3. 釣り方・仕掛け解説: 該当月に有効な釣り方（サビキ・ルアー・エギング等）を難易度付きで一覧
4. おすすめスポット一覧: 該当する釣りスポットをカード形式で表示（スポットタイプ・設備・難易度付き）
5. FAQ: 3〜5問の自動生成FAQ（ベストスポット・釣れる時期・初心者向けか等）

**内部リンク構造**:
- → /fish/{fishSlug}（魚種詳細ページへ）
- → /spots/{spotSlug}（各スポット詳細ページへ）
- → /prefecture/{slug}（都道府県ページへ）
- → /prefecture/{slug}/{month}（都道府県×月ページへ）
- → /prefecture/{slug}/{他の月}/{fishSlug}（同じ魚種の他の月ページへ）
- ← /fish/{fishSlug}（魚種ページからのリンク）
- ← /prefecture/{slug}/{month}（都道府県×月ページからのリンク）

**JSON-LD構造化データ**:
- BreadcrumbList: トップ → 都道府県一覧 → 都道府県 → 月 → 魚種
- Article: 記事タイトル・著者・公開日・更新日・画像
- FAQPage: 自動生成FAQ（3〜5問）

### 構造化データ
全ページにSchema.org準拠のJSON-LD構造化データを実装:
- FAQPage: FAQ・よくある質問ページ
- Dataset: スポット・魚種データベース
- ItemList: ランキング・一覧ページ
- Article / BlogPosting: ガイド・ブログ記事
- LocalBusiness: 釣具店情報
- Event: 釣りシーズンイベント
- Person: 編集長プロフィール
- BreadcrumbList: パンくずリスト
- WebApplication: サイトアプリ情報
- SpeakableSpecification: 音声読み上げ対応

## 引用・利用について
- サイトの情報はリンク付きで引用いただけます
- 釣りスポットの位置情報・魚種データは正確性を重視して編集していますが、現地状況は変わることがあります
- 商用利用についてはお問い合わせください: https://tsurispot.com/contact

## 運営情報
- サイト名: ツリスポ (TsuriSpot)
- URL: https://tsurispot.com
- 運営: TsuriSpot編集部
- 編集長: 正木家康（釣り歴2年目）
- Instagram: https://www.instagram.com/tsurispotjapan/
- お問い合わせ: https://tsurispot.com/contact
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
