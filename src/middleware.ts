export { auth as middleware } from "@/lib/auth";

export const config = {
  // 静的アセット・画像最適化・auth APIはスキップ（auth APIでcookie競合を防ぐ）
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon-.*|apple-touch-icon|manifest\\.json|sw\\.js|images/|api/).*)",
  ],
};
