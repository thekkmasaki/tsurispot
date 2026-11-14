import { CHALLENGE_RE, STATE_RE } from "./config";

export interface AppLinkReq {
  challenge: string;
  state: string;
  nonce: string;
  /** 連携を始めた時刻（epoch ミリ秒）。同意画面に表示する。旧Cookieには無い */
  startedAt?: number;
}

/** app_link_req Cookie の値を検証して取り出す。壊れていれば null。 */
export function parseAppLinkReq(value: string | undefined | null): AppLinkReq | null {
  if (!value) return null;
  try {
    const o = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      c?: unknown;
      s?: unknown;
      n?: unknown;
      t?: unknown;
    };
    if (
      typeof o.c !== "string" ||
      typeof o.s !== "string" ||
      typeof o.n !== "string" ||
      !CHALLENGE_RE.test(o.c) ||
      !STATE_RE.test(o.s) ||
      !/^[A-Za-z0-9_-]{16,64}$/.test(o.n)
    ) {
      return null;
    }
    const startedAt = typeof o.t === "number" && Number.isFinite(o.t) && o.t > 0 ? o.t : undefined;
    return { challenge: o.c, state: o.s, nonce: o.n, ...(startedAt ? { startedAt } : {}) };
  } catch {
    return null;
  }
}
