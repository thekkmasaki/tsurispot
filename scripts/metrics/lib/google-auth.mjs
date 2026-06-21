// Googleサービスアカウント認証。新規npm依存を入れず node:crypto だけで
// サービスアカウントJSON鍵から RS256 署名JWTを作り、アクセストークンに交換する。
//
// 必要env: GOOGLE_APPLICATION_CREDENTIALS = SA鍵JSONの絶対パス
//          (既定で tsurispot/secrets/sa-metrics.json を探索)
//
// 使い方:
//   import { getAccessToken } from "./lib/google-auth.mjs";
//   const token = await getAccessToken(["https://www.googleapis.com/auth/analytics.readonly"]);

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function loadServiceAccount() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const candidates = [
    envPath,
    path.join(REPO_ROOT, "secrets", "sa-metrics.json"),
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const sa = JSON.parse(fs.readFileSync(p, "utf8"));
      if (!sa.client_email || !sa.private_key) {
        throw new Error(`SA鍵に client_email / private_key がありません: ${p}`);
      }
      return sa;
    }
  }
  throw new Error(
    "サービスアカウント鍵が見つかりません。GOOGLE_APPLICATION_CREDENTIALS を設定するか tsurispot/secrets/sa-metrics.json を配置してください。"
  );
}

// epoch秒。テスト容易性のため Date.now() をここに閉じ込める。
function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export async function getAccessToken(scopes, sa = loadServiceAccount()) {
  const iat = nowSec();
  const exp = iat + 3600;
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: Array.isArray(scopes) ? scopes.join(" ") : scopes,
    aud: sa.token_uri || "https://oauth2.googleapis.com/token",
    iat,
    exp,
  };

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer
    .sign(sa.private_key)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const assertion = `${signingInput}.${signature}`;

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const res = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`トークン交換失敗 (${res.status}): ${text}`);
  }
  const json = await res.json();
  return json.access_token;
}

// 認証済み JSON POST/GET の薄いヘルパ
export async function googleApiFetch(url, token, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google API ${method} ${url} 失敗 (${res.status}): ${text}`);
  }
  return res.json();
}
