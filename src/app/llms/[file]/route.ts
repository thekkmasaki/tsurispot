import { prefectures } from "@/lib/data/prefectures";
import {
  LLMS_LAST_UPDATED,
  TEXT_HEADERS,
  getSpotsByPrefecture,
  spotLine,
  spotTypeLabel,
} from "@/lib/llms";

// /llms/{都道府県slug}.txt — 都道府県ごとの全スポット（1スポット1行）。
// llms-full.txt（旧944KB）を分割したもの。索引は /llms.txt・/llms-full.txt に掲載。
export const dynamic = "force-static";
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return getSpotsByPrefecture().map((p) => ({ file: `${p.slug}.txt` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = file.replace(/\.txt$/, "");
  const pref = prefectures.find((p) => p.slug === slug);
  const entry = pref ? getSpotsByPrefecture().find((p) => p.slug === pref.slug) : undefined;
  if (!file.endsWith(".txt") || !pref || !entry) {
    return new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const typeCounts = new Map<string, number>();
  for (const s of entry.spots) {
    const t = spotTypeLabel(s.spotType);
    typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
  }

  const content = `# ${pref.name}の釣りスポット一覧 — ツリスポ（TsuriSpot）
> ${entry.spots.length}件（${[...typeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}${n}`).join("・")}）／データ最終更新: ${LLMS_LAST_UPDATED}
> 都道府県ページ: https://tsurispot.com/prefecture/${pref.slug}
> 索引: https://tsurispot.com/llms-full.txt

形式: 名前 | 市区町村 | 種別 | 主な魚 | ベストシーズン | 駐車場・トイレ | 難易度 | 禁止・制限 | URL
- 「主な魚」はそのスポットで釣れる魚の代表（最大5種）
- 「ベストシーズン」は旬の魚が最も多く重なる月
- 「禁止・制限: 登録なし」はツリスポのデータに記録が無いという意味で、規制が無いことの保証ではありません。釣行前に現地の表示を確認してください

${entry.spots.map(spotLine).join("\n")}
`;

  return new Response(content, { headers: TEXT_HEADERS });
}
