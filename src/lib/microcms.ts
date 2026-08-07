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
    // 一覧フェッチ(fetchMicroCMSBlogPosts)は fields で content を除外するため undefined になり得る。
    // 詳細フェッチ(fetchMicroCMSBlogBySlug)では全文が入る。BlogPost.content:string を満たすため既定 ""。
    content: item.content ?? "",
    category,
    tags: item.tags ? item.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    publishedAt: item.publishedAt.split("T")[0],
    updatedAt: item.updatedAt.split("T")[0],
    image: item.eyecatch?.url,
  };
}

// microCMS APIの1リクエスト上限は100件。週報が積み上がると100件を超え、
// 単発取得では101件目以降が一覧・sitemapから静かに消えるため offset ページングで全件取得する。
// 暴走防止の総量上限（超過分は古い記事から切り捨て・warnで可視化）
const MAX_LIST_POSTS = 500;

/** microCMSからブログ記事一覧を取得（offsetページングで全件） */
export async function fetchMicroCMSBlogPosts(): Promise<BlogPost[]> {
  const client = getClient();
  if (!client) return [];

  // 一覧用途では本文(content)は不要。fields で除外し、100件×全文HTMLの巨大ペイロードを回避する
  // （詳細ページは fetchMicroCMSBlogBySlug が別途 content を取得）。これがトップのコールド生成が
  // 約53秒かかっていた主因。さらに microCMS が遅延/応答停止した場合に同期描画を長時間ブロック
  // しないよう AbortController で 8 秒タイムアウト（リクエスト毎）→ 1ページ目失敗は空配列、
  // 2ページ目以降の失敗は取得済み分を返して静的記事へ fail-soft する。
  const posts: BlogPost[] = [];
  let offset = 0;
  let totalCount = Infinity;

  while (offset < Math.min(totalCount, MAX_LIST_POSTS)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const data = await client.get<MicroCMSListResponse>({
        endpoint: "blogs",
        queries: {
          limit: 100,
          offset,
          orders: "-publishedAt",
          fields: "id,slug,title,description,category,tags,publishedAt,updatedAt,eyecatch",
        },
        // Next16のfetch既定no-storeを上書きしISRデータキャッシュに載せる（無いと動的化しトップが毎回SSRで遅い）
        customRequestInit: { next: { revalidate: 3600 }, signal: controller.signal },
      });
      totalCount = data.totalCount;
      posts.push(...data.contents.map(microCMSToBlogPost));
      if (data.contents.length === 0) break; // 空ページで無限ループ防止
      offset += data.contents.length;
    } catch (e) {
      console.warn(`[microCMS] ブログ記事取得失敗 (offset=${offset}, 取得済み${posts.length}件):`, e);
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  if (totalCount > MAX_LIST_POSTS) {
    console.warn(`[microCMS] 記事総数${totalCount}件が上限${MAX_LIST_POSTS}件を超過。古い記事は一覧・sitemapから省かれます`);
  }
  return posts;
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
