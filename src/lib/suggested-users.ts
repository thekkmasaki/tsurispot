// おすすめユーザーの算出（最近の投稿者から抽出・Redis 1時間キャッシュ）。
// APIとページの両方から呼ぶため関数に分離（自己HTTPフェッチはオリジン遮断と衝突するため不可）。
import { redis } from "@/lib/redis";
import { getUserById } from "@/lib/user-store";
import type { UserSearchEntry } from "@/lib/social-store";

const CACHE_KEY = "suggested_users";
const CACHE_TTL = 3600;

export async function getSuggestedUsers(): Promise<UserSearchEntry[]> {
  try {
    const cached = await redis.get<UserSearchEntry[]>(CACHE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
  } catch {
    // キャッシュ不調時は都度計算
  }

  // 最近の釣果（グローバル50件）からログイン投稿者を新しい順・重複なしで抽出
  let raw: unknown[] = [];
  try {
    raw = (await redis.lrange("recent_reports:global", 0, 49)) as unknown[];
  } catch {
    return [];
  }

  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of raw ?? []) {
    try {
      const parsed = typeof item === "string" ? JSON.parse(item) : (item as { tsuriId?: string });
      const id = parsed?.tsuriId;
      if (typeof id === "string" && id && !seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    } catch {
      // 壊れた要素はスキップ
    }
    if (ids.length >= 10) break;
  }

  const users: UserSearchEntry[] = [];
  for (const id of ids) {
    const user = await getUserById(id);
    if (!user || user.isPublic === false) continue;
    users.push({
      tsuriId: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      reportCount: user.reportCount,
    });
    if (users.length >= 5) break;
  }

  try {
    await redis.set(CACHE_KEY, JSON.stringify(users), { ex: CACHE_TTL });
  } catch {
    // キャッシュ保存失敗は無視
  }

  return users;
}
