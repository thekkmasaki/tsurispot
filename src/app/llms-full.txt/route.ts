import { fishSpecies } from "@/lib/data/fish";
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

// 日次ISR。force-static: Next 15+ の GET Route Handler は既定で非キャッシュのため明示する。
export const dynamic = "force-static";
export const revalidate = 86400;

// 2026-11: 旧版は全スポットを1ファイル（約944KB）に詰め込んでおり、AI クローラーが途中で
// 打ち切る・取得しない原因になっていた。スポット一覧は都道府県別ファイル（/llms/{pref}.txt）に
// 分割し、ここは概要＋全魚種＋ガイド＋県別ファイルの索引に縮小する。
export function GET() {
  const st = getSiteStats();
  const total = st.totalSpots.toLocaleString();
  const prefFiles = getSpotsByPrefecture();

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

  let content = `# ツリスポ (TsuriSpot) — 詳細データ
> 概要版: https://tsurispot.com/llms.txt
> 全国${total}箇所の釣り場と${st.totalFish}種の魚種情報（データ最終更新: ${LLMS_LAST_UPDATED}）

## サイト概要
ツリスポ（https://tsurispot.com）は日本全国の釣り場情報サイトです。${SITE_LAUNCHED}開設、運営はツリスポ編集部。
※「釣りスポ」（tsurispot.jp）とは別のサイトです。

## データ統計
- 総スポット数: ${total}
- 総魚種数: ${st.totalFish}（海水魚${st.seaFish}・淡水魚${st.freshwaterFish}・汽水魚${st.brackishFish}）
- カバー都道府県: ${st.coveredPrefectures}
- エリアガイド: ${areaGuides.length}エリア
- 季節別ガイド: ${seasonalGuides.length}本
- 都道府県×魚種ページ: ${st.prefFishPages.toLocaleString()}
- 都道府県×月ページ: ${st.prefMonthPages.toLocaleString()}
- 都道府県×月×魚種ページ（検索インデックス対象）: ${st.prefMonthFishPages.toLocaleString()}
- 釣り禁止が確認されたスポット: ${st.bannedSpots}（根拠URL・確認日付き）

## 釣り場タイプ別件数
${st.spotsByType.map(([t, n]) => `- ${t}: ${n.toLocaleString()}件`).join("\n")}

## 都道府県別 釣りスポット一覧（ファイル索引）
1ファイル＝1都道府県。各行は「名前 | 市区町村 | 種別 | 主な魚 | ベストシーズン | 駐車場・トイレ | 難易度 | 禁止・制限 | URL」。
「禁止・制限: 登録なし」はツリスポのデータに記録が無いという意味で、規制が無いことの保証ではありません。
${prefFiles.map((p) => `- ${p.name}（${p.spots.length}件）: ${prefFileUrl(p.slug)}`).join("\n")}

`;

  // --- 全魚種一覧 ---
  content += `## 全魚種一覧（${st.totalFish}種）\n\n`;
  for (const fish of fishSpecies) {
    const peakStr =
      fish.peakMonths.length > 0 ? fish.peakMonths.map((m) => `${m}月`).join("・") : "通年";
    content += `- ${fish.name}（${fish.nameEnglish}） | ${categoryLabels[fish.category] || fish.category} | ${difficultyLabels[fish.difficulty] || fish.difficulty} | 旬: ${peakStr} | https://tsurispot.com/fish/${fish.slug}\n`;
  }
  content += "\n";

  // --- エリアガイド一覧 ---
  content += `## エリアガイド一覧（${areaGuides.length}エリア）\n\n`;
  for (const guide of areaGuides) {
    content += `- ${guide.name} | ${guide.prefectures.join("・")} | ベストシーズン: ${guide.bestSeason} | 主な魚: ${guide.mainFish.join("・")} | https://tsurispot.com/area-guide/${guide.slug}\n`;
  }
  content += "\n";

  // --- 季節別ガイド一覧 ---
  content += `## 季節別ガイド一覧（${seasonalGuides.length}本）\n\n`;
  for (const guide of seasonalGuides) {
    content += `- ${guide.title}（${guide.season}・${guide.months.map((m) => `${m}月`).join("")}） | 釣り方: ${guide.method} | 対象魚: ${guide.targetFish.join("・")} | https://tsurispot.com/seasonal/${guide.slug}\n`;
  }
  content += "\n";

  content += `## URL構造
- /spots/{slug} — 釣りスポット詳細
- /fish/{slug} — 魚種詳細
- /prefecture/{slug} — 都道府県別の釣り場
- /prefecture/{slug}/{month} — 都道府県×月
- /prefecture/{slug}/{month}/{fishSlug} — 都道府県×月×魚種
- /area/{slug} — 市区町村別の釣り場
- /spot-type/{type}/{prefecture} — 釣り場タイプ×都道府県
- /tides/{station} — 観測地点別の潮見表
- /monthly/{month} — 月別ガイド
- /guide/{topic} — 釣り方・仕掛けガイド
- /blog/{slug} — ブログ記事

## 引用・利用について
- サイトの情報はリンク付きで引用いただけます
- 釣り禁止区域・駐車場などの現地状況は変わることがあります。釣行前に現地の表示や管理者の案内を確認してください
- 商用利用についてはお問い合わせください: https://tsurispot.com/contact

## 運営情報
- サイト名: ツリスポ（TsuriSpot）
- URL: https://tsurispot.com
- 開設: ${SITE_LAUNCHED}
- 運営・編集: ツリスポ編集部（運営者情報: https://tsurispot.com/about）
- Instagram: https://www.instagram.com/tsurispotjapan/
- お問い合わせ: https://tsurispot.com/contact
`;

  return new Response(content, { headers: TEXT_HEADERS });
}
