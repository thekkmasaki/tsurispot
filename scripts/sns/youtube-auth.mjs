#!/usr/bin/env node
/**
 * YouTube のリフレッシュトークンを取得して、GitHub Secrets（YOUTUBE_REFRESH_TOKEN）に直接登録する。
 * トークンは画面に表示しない・ファイルにも残さない。
 *
 *   YOUTUBE_CLIENT_ID=... YOUTUBE_CLIENT_SECRET=... node scripts/sns/youtube-auth.mjs
 *
 * 前提（Google Cloud Console で1回だけ）:
 *   - YouTube Data API v3 を有効化
 *   - OAuth 同意画面: 外部・「本番環境」に公開（「テスト」のままだとトークンが7日で失効する）
 *   - 認証情報: OAuth クライアント ID（種類「デスクトップ アプリ」）
 * ブラウザが開いたら、ツリスポのチャンネルを持つ Google アカウントで許可する。
 */
import fs from "fs";
import http from "http";
import { execFileSync, spawnSync } from "child_process";

// クライアント情報: Google Cloud で「JSON をダウンロード」したファイルのパスを引数で渡す（中身は表示しない）か、環境変数
//   node scripts/sns/youtube-auth.mjs ~/Downloads/client_secret_xxx.json
let { YOUTUBE_CLIENT_ID: id, YOUTUBE_CLIENT_SECRET: secret } = process.env;
const jsonPath = process.argv[2];
if (jsonPath) {
  const c = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const v = c.installed ?? c.web ?? {};
  id = v.client_id;
  secret = v.client_secret;
}
if (!id || !secret) {
  console.error("ダウンロードしたクライアントの JSON のパスを引数で渡すか、YOUTUBE_CLIENT_ID と YOUTUBE_CLIENT_SECRET を環境変数で渡してください");
  process.exit(1);
}
const PORT = 53682;
const redirect = `http://127.0.0.1:${PORT}/callback`;
const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
auth.search = new URLSearchParams({
  client_id: id,
  redirect_uri: redirect,
  response_type: "code",
  scope: "https://www.googleapis.com/auth/youtube.upload",
  access_type: "offline",
  prompt: "consent",
}).toString();

const code = await new Promise((resolve, reject) => {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, redirect);
    if (u.pathname !== "/callback") { res.writeHead(404).end(); return; }
    const c = u.searchParams.get("code");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(c ? "許可できました。このタブは閉じてください。" : "許可されませんでした。");
    server.close();
    c ? resolve(c) : reject(new Error(u.searchParams.get("error") ?? "許可されませんでした"));
  }).listen(PORT, "127.0.0.1", () => {
    console.log("ブラウザで Google の許可画面を開きます。開かない場合はこの URL を開いてください:\n" + auth);
    try { execFileSync("open", [auth.toString()]); } catch { /* 手動で開く */ }
  });
});

const res = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: "authorization_code" }),
});
const j = await res.json();
if (!j.refresh_token) {
  console.error("リフレッシュトークンが返りませんでした:", j.error ?? res.status, j.error_description ?? "");
  process.exit(1);
}

// GitHub Secrets に登録（値は標準入力で渡す。`--body -` は '-' という値になるので使わない）
for (const [name, value] of [["YOUTUBE_CLIENT_ID", id], ["YOUTUBE_CLIENT_SECRET", secret], ["YOUTUBE_REFRESH_TOKEN", j.refresh_token]]) {
  const r = spawnSync("gh", ["secret", "set", name], { input: value, stdio: ["pipe", "inherit", "inherit"] });
  if (r.status !== 0) { console.error(`${name} の登録に失敗しました`); process.exit(1); }
}
console.log("✅ YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REFRESH_TOKEN を GitHub Secrets に登録しました");
if (jsonPath) console.log(`ダウンロードした ${jsonPath} は不要になりました。削除してかまいません。`);
