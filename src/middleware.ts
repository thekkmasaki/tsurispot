export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon-.*|apple-touch-icon|manifest\\.json|sw\\.js|images/|api/).*)",
  ],
};
