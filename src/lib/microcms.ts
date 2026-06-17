import { createClient } from "microcms-js-sdk";
import type { BlogPost } from "./data/blog";

type MicroCMSClient = ReturnType<typeof createClient>;

// env 欠落時にモジュール評価でthrowしないよう lazy 生成
let _client: MicroCMSClient | null = null;
function getClient(): MicroCMSClient | null {
  if (_client) return _client;
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;
  if (!serviceDomain || !apiKey) return null;
  _client = createClient({ serviceDomain, apiKey });
  return _client;
}

/** microCMS側のブログ記事レスポンス型（デフォルトテンプレート準拠） */
export interface MicroCMSBlogResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  content: string;
  // デフォルトテンプレートのフィールド
  eyecatch?: {
    url: string;
    height: number;
    width: number;
  };
  category?: {
    id: string;
    name: string;
  };
  // 追加カスタムフィールド
  slug?: string;
  description?: string;
  tags?: string; // カンマ区切りテキスト（例: "堤防釣り,初心者,サビキ"）
}

/** microCMSのリスト取得レスポンス型 */
interface MicroCMSListResponse {
  contents: MicroCMSBlogResponse[];
  totalCount: number;
  offset: number;
  limit: number;
}

/** microCMSカテゴリ名 → BlogPost.category のマッピング */
const CATEGORY_MAP: Record<string, BlogPost["category"]> = {
  "初心者向け": "beginner",
  "道具・装備": "gear",
  "季節・時期": "seasonal",
  "テクニック": "technique",
  "スポットガイド": "spot-guide",
  "マナー・ルール": "manner",
  "釣り知識": "knowledge",
  "釣行レポート": "report",
  // 英語ID直接指定にも対応
  beginner: "beginner",
  gear: "gear",
  seasonal: "seasonal",
  technique: "technique",
  "spot-guide": "spot-guide",
  manner: "manner",
  knowledge: "knowledge",
  report: "report",
};

/** microCMS記事を既存BlogPost型に変換 */
export function microCMSToBlogPost(item: MicroCMSBlogResponse): BlogPost {
  // コンテンツ参照のcategoryからマッピング
  const catName = item.category?.name || item.category?.id || "";
  const category = CATEGORY_MAP[catName] || "knowledge";

  return {
    id: `cms-${item.id}`,
    slug: item.slug || item.id, // slugがなければmicroCMSのidをフォールバック
    title: item.title,
    description: item.description || "",
    content: item.content,
    category,
    tags: item.tags ? item.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    publishedAt: item.publishedAt.split("T")[0],
    updatedAt: item.updatedAt.split("T")[0],
    image: item.eyecatch?.url,
  };
}

/** microCMSからブログ記事一覧を取得 */
export async function fetchMicroCMSBlogPosts(): Promise<BlogPost[]> {
  const client = getClient();
  if (!client) return [];

  try {
    const data = await client.get<MicroCMSListResponse>({
      endpoint: "blogs",
      queries: { limit: 100, orders: "-publishedAt" },
      // Next16のfetch既定no-storeを上書きしISRデータキャッシュに載せる（無いと動的化しトップが毎回SSRで遅い）
      customRequestInit: { next: { revalidate: 3600 } },
    });
    return data.contents.map(microCMSToBlogPost);
  } catch (e) {
    console.warn("[microCMS] ブログ記事取得失敗:", e);
    return [];
  }
}

/** microCMSからslug指定で1記事取得（slugフィールド → id フォールバック） */
export async function fetchMicroCMSBlogBySlug(
  slug: string
): Promise<BlogPost | null> {
  const client = getClient();
  if (!client) return null;

  try {
    // まずslugフィールドで検索
    const data = await client.get<MicroCMSListResponse>({
      endpoint: "blogs",
      queries: { filters: `slug[equals]${slug}`, limit: 1 },
      customRequestInit: { next: { revalidate: 3600 } },
    });
    if (data.contents.length > 0) {
      return microCMSToBlogPost(data.contents[0]);
    }

    // slugフィールドになければ、idとして直接取得を試行
    try {
      const item = await client.get<MicroCMSBlogResponse>({
        endpoint: "blogs",
        contentId: slug,
        customRequestInit: { next: { revalidate: 3600 } },
      });
      return microCMSToBlogPost(item);
    } catch {
      return null;
    }
  } catch (e) {
    console.warn("[microCMS] slug検索失敗:", slug, e);
    return null;
  }
}
