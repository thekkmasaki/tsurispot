import { CHALLENGE_RE, STATE_RE } from "./config";

export interface AppLinkReq {
  challenge: string;
  state: string;
  nonce: string;
}

/** app_link_req Cookie の値を検証して取り出す。壊れていれば null。 */
export function parseAppLinkReq(value: string | undefined | null): AppLinkReq | null {
  if (!value) return null;
  try {
    const o = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      c?: unknown;
      s?: unknown;
      n?: unknown;
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
    return { challenge: o.c, state: o.s, nonce: o.n };
  } catch {
    return null;
  }
}
