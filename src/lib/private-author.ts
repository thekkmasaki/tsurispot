/**
 * 釣果・投稿の投稿者表示を、プロフィール公開設定に合わせて読み出し時に伏せる。
 * - プロフィール非公開の人の投稿は「非公開の釣り人」と表示し、tsuriId（プロフィールへの導線）を外す
 * - 釣果の中身（魚・サイズ・写真・コメント）はそのまま出す
 * - 本人が見ているときは伏せない
 * - 匿名投稿（tsuriId なし）や、退会などでユーザーが見つからない投稿はそのまま
 * - ユーザー情報を引けなかったときは伏せる側に倒す（fail-closed）
 * スポット写真の投稿者クレジット（spot-photo-public.ts）と同じ表示ルール。
 */

export const PRIVATE_AUTHOR_NAME = "非公開の釣り人";

type UserLookup = (id: string) => Promise<{ isPublic?: boolean } | null>;

export interface AuthorFields {
  userName?: string;
  tsuriId?: string;
}

/** 非公開プロフィールの tsuriId 集合を返す（ユニークIDごとに1回だけ引く） */
export async function findPrivateAuthorIds(
  ids: (string | undefined)[],
  lookup: UserLookup,
  viewerId?: string,
): Promise<Set<string>> {
  const unique = [...new Set(ids.filter((x): x is string => !!x && x !== viewerId))];
  const hidden = new Set<string>();
  await Promise.all(
    unique.map(async (id) => {
      try {
        const u = await lookup(id);
        if (u && u.isPublic === false) hidden.add(id);
      } catch {
        hidden.add(id);
      }
    }),
  );
  return hidden;
}

/** 1件分の投稿者表示を伏せる（tsuriId を取り除き、名前を差し替えた新しいオブジェクトを返す） */
export function maskAuthor<T extends AuthorFields>(item: T): T {
  const { tsuriId: _drop, ...rest } = item;
  void _drop;
  return { ...rest, userName: PRIVATE_AUTHOR_NAME } as T;
}

/** 一覧の投稿者表示を、非公開プロフィールの人の分だけ伏せる */
export async function maskPrivateAuthors<T extends AuthorFields>(
  items: T[],
  lookup: UserLookup,
  viewerId?: string,
): Promise<T[]> {
  if (items.length === 0) return items;
  const hidden = await findPrivateAuthorIds(
    items.map((i) => i.tsuriId),
    lookup,
    viewerId,
  );
  if (hidden.size === 0) return items;
  return items.map((i) => (i.tsuriId && hidden.has(i.tsuriId) ? maskAuthor(i) : i));
}
