/**
 * サーバー専用: ISR/静的ページ（/spots/[slug] 等）から投稿者の公開/非公開を引くためのルックアップ。
 *
 * 背景（2026-11 障害）: maskPrivateAuthors に getUserById（Upstash REST = cache:"no-store" の fetch）を
 * 直接渡すと、ISR 再生成中に no-store fetch が走り Next が
 * 「Page changed from static to dynamic at runtime」で 500 を返していた（ログインユーザーの
 * 釣果投稿があるスポットだけが落ちる）。しかも getUserById は例外を握りつぶして null を返すため、
 * 判定不能＝「ユーザー不在」扱いで伏せずに表示する fail-open にもなっていた。
 *
 * 対策:
 *  - unstable_cache で包む（キャッシュ境界の内側の no-store fetch は ISR を dynamic にしない）。
 *  - 取得失敗は throw のまま → unstable_cache は失敗を保存せず、maskPrivateAuthors が伏せる側に倒す（fail-closed）。
 *  - 公開/非公開の切替はプロフィール更新 API で revalidateTag(USER_VISIBILITY_TAG) して即時反映。
 *    タグ失効が届かない経路の保険として revalidate は 10 分。
 */
import { unstable_cache } from "next/cache";

export const USER_VISIBILITY_TAG = "user-visibility";

export const getUserVisibilityCached = unstable_cache(
  async (userId: string): Promise<{ nickname: string; isPublic?: boolean } | null> => {
    const { getUserVisibilityStrict } = await import("@/lib/user-store");
    return getUserVisibilityStrict(userId);
  },
  ["user-visibility-v1"],
  { revalidate: 600, tags: [USER_VISIBILITY_TAG] },
);
