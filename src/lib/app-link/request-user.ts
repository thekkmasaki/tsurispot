import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/user-store";
import { getUserStatus } from "@/lib/user-status";
import { isAppLinkEnabled, TOKEN_PREFIX } from "./config";
import { verifyAppToken } from "./store";

export interface RequestUser {
  tsuriId: string;
  nickname: string;
  avatarUrl: string | null;
  via: "cookie" | "app";
}

export type RequestUserResult =
  | { kind: "user"; user: RequestUser }
  | { kind: "anonymous" }
  /** Bearer tsa_… が付いているのに無効。匿名に落とさず 401 を返すこと。 */
  | { kind: "unauthorized" };

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

/** `Authorization: Bearer tsa_…` を取り出す。無ければ null。 */
export function extractAppBearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const m = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (!m || !m[1].startsWith(TOKEN_PREFIX)) return null;
  return m[1];
}

/**
 * 本人確認の共通関数。Cookie セッション（auth()）か、有効なアプリ用トークンのどちらかで利用者を返す。
 * 機能スイッチが切れている時は Authorization ヘッダーを無視し、従来どおり auth() だけを見る。
 * Bearer を使うのは仕様で許可した API だけ（他の API は従来どおり auth() を直接呼ぶ）。
 */
export async function getRequestUser(
  request: Request,
  opts?: { tolerateAuthError?: boolean },
): Promise<RequestUserResult> {
  if (isAppLinkEnabled()) {
    const bearer = extractAppBearer(request);
    if (bearer) {
      const verified = await verifyAppToken(bearer);
      if (!verified) return { kind: "unauthorized" };
      // 毎回、利用者の状態を確かめる（banned / deleted のトークンは通さない）
      if ((await getUserStatus(verified.tsuriId)) !== "active") return { kind: "unauthorized" };
      const user = await getUserById(verified.tsuriId);
      if (!user) return { kind: "unauthorized" };
      return {
        kind: "user",
        user: {
          tsuriId: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl ?? null,
          via: "app",
        },
      };
    }
  }

  const session = opts?.tolerateAuthError ? await auth().catch(() => null) : await auth();
  const u = session?.user;
  if (!u?.tsuriId) return { kind: "anonymous" };
  return {
    kind: "user",
    user: { tsuriId: u.tsuriId, nickname: u.nickname, avatarUrl: u.avatarUrl ?? null, via: "cookie" },
  };
}
