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

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  if (!ua) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (BLOCKED_UA_PATTERNS.some((p) => p.test(ua))) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/health).*)",
  ],
};
