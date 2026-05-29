import { NextResponse, type NextRequest } from "next/server";

const BLOCKED_UA_PATTERNS = [
  /GPTBot/i,
  /OAI-SearchBot/i,
  /ChatGPT-User/i,
  /Google-Extended/i,
  /PerplexityBot/i,
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

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  if (ua && BLOCKED_UA_PATTERNS.some((p) => p.test(ua))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const lockdown = checkOriginLockdown(req);
  if (lockdown) return lockdown;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/health|api/og).*)",
  ],
};
