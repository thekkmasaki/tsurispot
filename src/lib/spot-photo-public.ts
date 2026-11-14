/**
 * スポットのみんなの投稿写真を、画面に出してよい形にする（投稿者クレジット＋一番乗りの印）。
 * - 投稿者はニックネームを出す。プロフィール非公開の人は名前を出さない（リンクもしない）
 * - 退会などでユーザーが見つからない、または古い投稿で投稿者不明のときはクレジットなし
 * - そのスポットで最初に投稿された写真に first: true
 */

import { PRIVATE_AUTHOR_NAME } from "@/lib/private-author";

export interface SpotPhotoEntryLike {
  url: string;
  uploadedAt: number;
  uploaderId?: string;
}

export interface PhotoUploader {
  name: string;
  /** プロフィールへのリンク先（公開プロフィールのときだけ） */
  tsuriId?: string;
}

export interface PublicSpotPhoto {
  url: string;
  uploadedAt: number;
  uploader?: PhotoUploader;
  /** このスポットで最初に投稿された写真 */
  first?: boolean;
}

type UserLookup = (id: string) => Promise<{ nickname: string; isPublic?: boolean } | null>;

export function firstPhotoUrl(entries: SpotPhotoEntryLike[]): string | undefined {
  let first: SpotPhotoEntryLike | undefined;
  for (const e of entries) if (!first || e.uploadedAt < first.uploadedAt) first = e;
  return first?.url;
}

export async function toPublicSpotPhotos(
  entries: SpotPhotoEntryLike[],
  lookup: UserLookup,
): Promise<PublicSpotPhoto[]> {
  const ids = [...new Set(entries.map((e) => e.uploaderId).filter((x): x is string => !!x))];
  const users = new Map<string, PhotoUploader | undefined>();
  await Promise.all(
    ids.map(async (id) => {
      try {
        const u = await lookup(id);
        if (!u || !u.nickname) return users.set(id, undefined);
        users.set(id, u.isPublic === false ? { name: PRIVATE_AUTHOR_NAME } : { name: u.nickname, tsuriId: id });
      } catch {
        users.set(id, undefined);
      }
    }),
  );
  const firstUrl = firstPhotoUrl(entries);
  return entries.map((e) => ({
    url: e.url,
    uploadedAt: e.uploadedAt,
    ...(e.uploaderId && users.get(e.uploaderId) ? { uploader: users.get(e.uploaderId) } : {}),
    ...(e.url === firstUrl ? { first: true } : {}),
  }));
}
