// タイムラインに混ぜる「編集部」カード（コールドスタート対策のミックスフィード）。
// 全て実在コンテンツ（週報・ブログ記事・月別ガイド）で、架空の釣果は作らない。
// UGCが増えるほど挿入比率は自然に下がる（挿入ルールは timeline-feed 側: UGC4件ごとに1枚）。
import { redis } from "@/lib/redis";
import { monthlyGuides } from "@/lib/data/monthly-guides";

export interface EditorialCard {
  kind: "weekly" | "blog" | "guide";
  title: string;
  description: string;
  href: string;
  date?: string;
}

const CACHE_KEY = "timeline:editorial";
const CACHE_TTL = 3600;

// 週報はタイトルに「週報」を含む microCMS 記事（/weekly-report スキルの出力）
function isWeeklyReport(title: string): boolean {
  return title.includes("週報") || title.includes("釣果速報");
}

export async function getEditorialCards(): Promise<EditorialCard[]> {
  try {
    const cached = await redis.get<EditorialCard[]>(CACHE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  } catch {
    // キャッシュ不調時は都度計算
  }

  const cards: EditorialCard[] = [];

  // 1) 最新ブログ記事（週報含む・上位8件）。microCMSリークを避けるため dynamic import
  try {
    const { getAllBlogPosts } = await import("@/lib/data/blog");
    const posts = await getAllBlogPosts();
    const latest = [...posts]
      .sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1))
      .slice(0, 8);
    for (const p of latest) {
      cards.push({
        kind: isWeeklyReport(p.title) ? "weekly" : "blog",
        title: p.title,
        description: p.description.slice(0, 80),
        href: `/blog/${p.slug}`,
        date: p.publishedAt,
      });
    }
  } catch (err) {
    console.error("[編集部フィード] ブログ取得エラー:", err);
  }

  // 2) 今月の釣りガイド（JST）
  try {
    const month = Number(
      new Intl.DateTimeFormat("en", { timeZone: "Asia/Tokyo", month: "numeric" }).format(
        new Date(),
      ),
    );
    const guide = monthlyGuides.find((g) => g.month === month);
    if (guide) {
      cards.push({
        kind: "guide",
        title: `${month}月の釣りガイド｜${guide.title}`,
        description: guide.description.slice(0, 80),
        href: `/monthly/${guide.slug}`,
      });
    }
  } catch (err) {
    console.error("[編集部フィード] 月別ガイド取得エラー:", err);
  }

  // 週報を先頭に（タイムラインの文脈に最も近い）
  cards.sort((a, b) => {
    if (a.kind === "weekly" && b.kind !== "weekly") return -1;
    if (b.kind === "weekly" && a.kind !== "weekly") return 1;
    return 0;
  });

  try {
    await redis.set(CACHE_KEY, JSON.stringify(cards), { ex: CACHE_TTL });
  } catch {
    // キャッシュ保存失敗は無視
  }

  return cards;
}
