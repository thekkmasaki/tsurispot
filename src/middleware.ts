import { NextResponse, type NextRequest } from "next/server";

// robots.ts と意図を一致させること。
// AI検索bot（OAI-SearchBot / ChatGPT-User / PerplexityBot）は robots.ts で allow 済みで、
// 被引用→送客を狙うため middleware でも通す（＝ここに含めない）。
// 純粋な学習系・SEO/広告系クローラーのみ 403 でブロックし、App Runner コスト再燃を防ぐ。
export const BLOCKED_UA_PATTERNS = [
  /GPTBot/i,
  /Google-Extended/i,
  /ClaudeBot/i,
  /anthropic-ai/i,
  /Claude-Web/i,
  /CCBot/i,
  /Applebot-Extended/i,
  /Bytespider/i,
  /cohere-ai/i,
  /Meta-ExternalAgent/i,
  /FacebookBot/i,
  /Amazonbot/i,
  /YouBot/i,
  /AI2Bot/i,
  /Timpibot/i,
  /ImagesiftBot/i,
  /Diffbot/i,
  /MicroAdBot/i,
  /SemrushBot/i,
  /AhrefsBot/i,
  /DotBot/i,
  /MJ12bot/i,
  /CriteoBot/i,
  /PetalBot/i,
  /DataForSeoBot/i,
  /BLEXBot/i,
  /SeznamBot/i,
];

// オリジン直アクセス遮断（コスト＆セキュリティ）。
// App Runner の URL は直接到達可能なため、Cloudflare をバイパスした bot/スクレイパが
// キャッシュを無視して origin を叩き、課金（vCPU/egress）を発生させ得る。
// Cloudflare 側で全 origin リクエストに秘密ヘッダ `x-origin-verify` を付与し、
// ここで検証することで「Cloudflare 経由のみ許可」にする。
//
// fail-safe 段階導入（全 403 事故を防ぐ）:
//   - ORIGIN_VERIFY_SECRET 未設定     → 無効（素通り）
//   - ORIGIN_LOCKDOWN_MODE="log"      → 不一致を warn ログのみ・ブロックしない（計測フェーズ）
//   - ORIGIN_LOCKDOWN_MODE="enforce"  → 不一致を 403（本番遮断）
//   - それ以外/未設定                  → 無効（素通り）
// ※ Cloudflare 側のヘッダ付与を確認後に "enforce" へ切り替える運用。
const ORIGIN_VERIFY_SECRET = process.env.ORIGIN_VERIFY_SECRET;
const ORIGIN_LOCKDOWN_MODE = process.env.ORIGIN_LOCKDOWN_MODE;

function checkOriginLockdown(req: NextRequest): NextResponse | null {
  if (!ORIGIN_VERIFY_SECRET) return null;
  if (ORIGIN_LOCKDOWN_MODE !== "log" && ORIGIN_LOCKDOWN_MODE !== "enforce") return null;

  const provided = req.headers.get("x-origin-verify");
  if (provided === ORIGIN_VERIFY_SECRET) return null; // Cloudflare 経由 = 許可

  if (ORIGIN_LOCKDOWN_MODE === "log") {
    console.warn(
      `[origin-lockdown] direct-origin access (mode=log): ${req.method} ${req.nextUrl.pathname}`,
    );
    return null;
  }
  // enforce
  return new NextResponse("Forbidden", { status: 403 });
}

// RSC / プリフェッチ要求かどうか（App Router がクライアントナビ用に付与）。
function isRscRequest(req: NextRequest): boolean {
  return req.headers.has("rsc") || req.headers.has("next-router-prefetch");
}

export function middleware(req: NextRequest) {
  // ホスト正規化: www は apex へ 301。
  // www.tsurispot.com は DNS/Cloudflare 経由で同一オリジンに到達し全ページを 200 で
  // ミラー配信していた（canonical で救済されるが、GSC「代替ページ（適切な canonical タグあり）」
  // に積まれ続け、クロールとリンク評価も分散する）。ここで恒久的に apex へ集約する。
  const host = req.headers.get("host") || "";
  if (host === "www.tsurispot.com" || host.startsWith("www.tsurispot.com:")) {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.host = "tsurispot.com";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  const ua = req.headers.get("user-agent") || "";
  if (ua && BLOCKED_UA_PATTERNS.some((p) => p.test(ua))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const lockdown = checkOriginLockdown(req);
  if (lockdown) return lockdown;

  const res = NextResponse.next();

  // CDN(Cloudflare)が HTML をエッジキャッシュできるよう Vary を正規化する。
  // App Router は全ページ応答に `Vary: RSC, Next-Router-State-Tree, ...` を付与するが、
  // Cloudflare は Accept-Encoding 以外の Vary を持つ応答をキャッシュしない（cf-cache-status: DYNAMIC）。
  // ドキュメント要求(=RSCヘッダ無しのGET)は常に同一HTMLを返すため、Vary を Accept-Encoding に
  // 揃えても安全。RSC/プリフェッチ要求は CDN 側で明示バイパス済みなので、そちらは元の挙動のまま残す。
  // ただし /api 配下(特に /api/auth/* の csrf/session/callback)は user 固有の動的応答であり、
  // Vary を潰して CDN にキャッシュ可能化させるのは不適切。HTML 文書のみ対象にする。
  if (
    req.method === "GET" &&
    !isRscRequest(req) &&
    !req.nextUrl.pathname.startsWith("/api/")
  ) {
    res.headers.set("vary", "Accept-Encoding");
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/health|api/og).*)",
  ],
};
