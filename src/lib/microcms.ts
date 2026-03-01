import { createClient } from "microcms-js-sdk";
import type { BlogPost } from "./data/blog";

// microCMS クライアント
export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: process.env.MICROCMS_API_KEY || "",
});

/** microCMS側のブログ記事レスポンス型 */
export interface MicroCMSBlogResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string[];
  tags?: string[];
  image?: {
    url: string;
    height: number;
    width: number;
  };
  relatedSpots?: string[];
  relatedFish?: string[];
}

/** microCMSのリスト取得レスポンス型 */
interface MicroCMSListResponse {
  contents: MicroCMSBlogResponse[];
  totalCount: number;
  offset: number;
  limit: number;
}

/** microCMS記事を既存BlogPost型に変換 */
export function microCMSToBlogPost(item: MicroCMSBlogResponse): BlogPost {
  const validCategories = [
    "beginner", "gear", "seasonal", "technique",
    "spot-guide", "manner", "knowledge", "report",
  ] as const;

  // microCMSのセレクトフィールドは配列で返る
  const rawCategory = Array.isArray(item.category) ? item.category[0] : item.category;
  const category = validCategories.includes(rawCategory as typeof validCategories[number])
    ? (rawCategory as BlogPost["category"])
    : "knowledge";

  return {
    id: `cms-${item.id}`,
    slug: item.slug,
    title: item.title,
    description: item.description,
    content: item.content,
    category,
    tags: item.tags || [],
    publishedAt: item.publishedAt.split("T")[0],
    updatedAt: item.updatedAt.split("T")[0],
    image: item.image?.url,
    relatedSpots: item.relatedSpots || [],
    relatedFish: item.relatedFish || [],
  };
}

/** microCMSの設定が有効かチェック */
function isMicroCMSConfigured(): boolean {
  return !!(process.env.MICROCMS_SERVICE_DOMAIN && process.env.MICROCMS_API_KEY);
}

/** microCMSからブログ記事一覧を取得 */
export async function fetchMicroCMSBlogPosts(): Promise<BlogPost[]> {
  if (!isMicroCMSConfigured()) {
    return [];
  }

  try {
    const data = await client.get<MicroCMSListResponse>({
      endpoint: "blog",
      queries: { limit: 100, orders: "-publishedAt" },
    });
    return data.contents.map(microCMSToBlogPost);
  } catch (e) {
    console.warn("[microCMS] ブログ記事取得失敗:", e);
    return [];
  }
}

/** microCMSからslug指定で1記事取得 */
export async function fetchMicroCMSBlogBySlug(
  slug: string
): Promise<BlogPost | null> {
  if (!isMicroCMSConfigured()) {
    return null;
  }

  try {
    const data = await client.get<MicroCMSListResponse>({
      endpoint: "blog",
      queries: { filters: `slug[equals]${slug}`, limit: 1 },
    });
    if (data.contents.length === 0) return null;
    return microCMSToBlogPost(data.contents[0]);
  } catch (e) {
    console.warn("[microCMS] slug検索失敗:", slug, e);
    return null;
  }
}
