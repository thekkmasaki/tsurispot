import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// 退会済み/BANされたユーザーの書き込みを拒否するための状態管理。
// JWTセッションは退会/BAN後も有効期限まで生きるため、書き込みAPI側とauthセッションコールバック側の両方で参照する。
// Redis未設定・障害時は fail-open（active扱い）。

export type UserStatus = "active" | "banned" | "deleted";

const KEY_PREFIX = "auth:user_status:";
const STATUS_TTL_SECONDS = 60 * 60 * 24 * 365 * 2; // 2年（JWT有効期限より十分長い）

function key(tsuriId: string): string {
  return `${KEY_PREFIX}${tsuriId}`;
}

export async function getUserStatus(tsuriId: string | null | undefined): Promise<UserStatus> {
  if (!tsuriId) return "active";
  try {
    const v = await redis.get<string>(key(tsuriId));
    if (v === "banned" || v === "deleted") return v;
  } catch {
    // fail-open
  }
  return "active";
}

export async function isUserActive(tsuriId: string | null | undefined): Promise<boolean> {
  return (await getUserStatus(tsuriId)) === "active";
}

export async function isUserBanned(tsuriId: string): Promise<boolean> {
  return (await getUserStatus(tsuriId)) === "banned";
}

export async function setUserBanned(tsuriId: string): Promise<void> {
  await redis.set(key(tsuriId), "banned", { ex: STATUS_TTL_SECONDS });
}

export async function clearUserBanned(tsuriId: string): Promise<void> {
  const v = await redis.get<string>(key(tsuriId));
  if (v === "banned") await redis.del(key(tsuriId));
}

/** 状態を無条件で active に戻す（退会処理が失敗した時のロールバック用） */
export async function clearUserStatus(tsuriId: string): Promise<void> {
  await redis.del(key(tsuriId));
}

export async function markUserDeleted(tsuriId: string): Promise<void> {
  await redis.set(key(tsuriId), "deleted", { ex: STATUS_TTL_SECONDS });
}

/** 書き込みAPI用ガード。ログイン済みだが退会/BAN済みなら 403 レスポンス、問題なければ null。 */
export async function rejectInactiveUser(tsuriId: string): Promise<NextResponse | null> {
  const status = await getUserStatus(tsuriId);
  if (status === "active") return null;
  return NextResponse.json(
    { error: status === "banned" ? "このアカウントは利用が制限されています" : "このアカウントは退会済みです" },
    { status: 403 },
  );
}
