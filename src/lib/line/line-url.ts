/**
 * LINE の返信に載せるサイト URL。全リンクに UTM を付けて、GA4 で LINE 経由の流入を測れるようにする
 * （以前は釣果・道具以外の返信に UTM が無く、LINE の効果が見えなかった）。
 */
export const SITE = "https://tsurispot.com";

export function lineUrl(path: string, campaign: string): string {
  const u = new URL(path, SITE);
  u.searchParams.set("utm_source", "line");
  u.searchParams.set("utm_medium", "reply");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}
