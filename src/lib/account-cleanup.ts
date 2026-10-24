// 退会時のユーザー生成コンテンツ連鎖削除（ベストエフォート。個々の失敗は握りつぶして続行する）。
// 呼び出し順: markUserDeleted → cleanupUserContent → user-store.deleteUser
//   （deleteUser は auth:user_reports を消すため、投稿一覧の読み出しはその前に行う必要がある）
//
// 既知の限界: 索引導入前に作られたコメント/いいね、スポット共同編集メモ(SPOT_CONTRIB)、リポスト以外の
// 旧データはユーザーIDから列挙できない（全表Scanが必要）。新規データは索引で追跡される。
import { dbDelete, dbGet, dbPut, dbQuery } from "@/lib/dynamodb";
import { redis } from "@/lib/redis";
import { deleteFromS3, ownS3KeyFromUrl } from "@/lib/s3";
import {
  deleteOwnCommentRef,
  deletePostMeta,
  getUserCommentRefs,
  getUserLikedReportIds,
  purgePostSocialData,
  purgeUserSocialData,
  removeAllUserReposts,
  unlikePost,
} from "@/lib/social-store";
import { SPOT_SLUG_RE } from "@/lib/ugc-validation";

const SPOT_UGC_TTL = 365 * 24 * 60 * 60;

interface StoredReport {
  id?: string;
  tsuriId?: string;
  spotSlug?: string;
  photoUrl?: string;
}

interface SpotPhotoEntry {
  url: string;
  token: string;
  uploadedAt: number;
  uploaderId?: string;
}

const userSpotPhotosPk = (tsuriId: string) => `USERSPOTPHOTOS#${tsuriId}`;

/** spot-photo アップロード時に呼ぶ: 退会時に消せるよう逆引き索引を残す */
export async function indexUserSpotPhoto(tsuriId: string, slug: string, url: string): Promise<void> {
  await dbPut(
    userSpotPhotosPk(tsuriId),
    `P#${slug}#${Date.now()}`,
    { slug, url },
    SPOT_UGC_TTL,
  );
}

function parseList(raw: unknown[]): StoredReport[] {
  return (raw ?? [])
    .map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item) as StoredReport;
        } catch {
          return null;
        }
      }
      return item as StoredReport;
    })
    .filter((r): r is StoredReport => Boolean(r));
}

async function safe(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(`[account-cleanup] ${label} 失敗:`, err);
  }
}

async function deleteOwnImage(url: string | undefined): Promise<void> {
  if (url && ownS3KeyFromUrl(url)) await deleteFromS3(url);
}

export async function cleanupUserContent(
  tsuriId: string,
  profile: { headerImage?: string; avatarUrl?: string } = {},
): Promise<void> {
  // 1. 投稿（釣果・つぶやき）
  let reports: StoredReport[] = [];
  await safe("投稿一覧取得", async () => {
    reports = parseList(await redis.lrange(`auth:user_reports:${tsuriId}`, 0, -1));
  });
  const ids = new Set(reports.map((r) => r.id).filter((id): id is string => Boolean(id)));

  // スポット別ビュー（SPOT#{slug}/UGC_REPORTS）から除去
  const slugs = new Set(
    reports.map((r) => r.spotSlug).filter((s): s is string => Boolean(s) && SPOT_SLUG_RE.test(s as string)),
  );
  for (const slug of slugs) {
    await safe(`スポット別ビュー(${slug})`, async () => {
      const list = (await dbGet<StoredReport[]>(`SPOT#${slug}`, "UGC_REPORTS")) ?? [];
      const filtered = list.filter((r) => !(r.id && ids.has(r.id)) && r.tsuriId !== tsuriId);
      if (filtered.length !== list.length) {
        await dbPut(`SPOT#${slug}`, "UGC_REPORTS", filtered, SPOT_UGC_TTL);
      }
    });
  }

  // トップ「みんなの最近の釣果」から除去
  await safe("recent_reports:global", async () => {
    const recent = await redis.lrange("recent_reports:global", 0, -1);
    for (const item of recent ?? []) {
      const parsed = typeof item === "string" ? (JSON.parse(item) as StoredReport) : (item as StoredReport);
      if (parsed?.tsuriId === tsuriId || (parsed?.id && ids.has(parsed.id))) {
        await redis.lrem("recent_reports:global", 1, item as string);
      }
    }
  });

  for (const r of reports) {
    if (!r.id) continue;
    await safe(`投稿正本(${r.id})`, () => deletePostMeta(r.id!));
    await safe(`投稿SNSデータ(${r.id})`, () => purgePostSocialData(r.id!));
    await safe(`投稿写真(${r.id})`, () => deleteOwnImage(r.photoUrl));
  }

  // 2. 自分がした いいね / コメント / リポスト
  await safe("いいね解除", async () => {
    for (const reportId of await getUserLikedReportIds(tsuriId)) {
      await unlikePost(reportId, tsuriId);
    }
  });
  await safe("コメント削除", async () => {
    for (const ref of await getUserCommentRefs(tsuriId)) {
      await deleteOwnCommentRef(tsuriId, ref);
    }
  });
  await safe("リポスト解除", () => removeAllUserReposts(tsuriId));

  // 3. スポット写真（索引経由）
  await safe("スポット写真", async () => {
    const items = await dbQuery<{ slug: string; url: string }>(userSpotPhotosPk(tsuriId), {
      skPrefix: "P#",
      all: true,
    });
    for (const it of items) {
      const { slug, url } = it.data ?? ({} as { slug: string; url: string });
      if (slug && SPOT_SLUG_RE.test(slug) && url) {
        const list = (await dbGet<SpotPhotoEntry[]>(`SPOT#${slug}`, "PHOTOS")) ?? [];
        const filtered = list.filter((p) => p.url !== url);
        if (filtered.length !== list.length) await dbPut(`SPOT#${slug}`, "PHOTOS", filtered);
        await safe(`スポット写真S3(${slug})`, () => deleteOwnImage(url));
      }
      await dbDelete(it.pk, it.sk);
    }
  });

  // 4. 通知・検索索引・ブロック関係・逆引き索引
  await safe("通知/検索索引/ブロック", () => purgeUserSocialData(tsuriId));

  // 5. プロフィール画像
  await safe("ヘッダー画像", () => deleteOwnImage(profile.headerImage));
  await safe("アバター画像", () => deleteOwnImage(profile.avatarUrl));
}
