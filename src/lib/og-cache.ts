// 動的 OGP 画像（opengraph-image ルート）の長期キャッシュヘッダ。
// SNS クローラ／CDN が再生成せず再利用できるようにし、App Runner の
// 画像生成コスト（CPU・egress）を削減する。デプロイ時は Cloudflare の
// キャッシュ purge（deploy.yml）で更新されるため immutable で問題ない。
// 既存の /api/og（public, max-age=31536000, immutable）と同一方針。
export const OG_IMAGE_CACHE_HEADERS = {
  "cache-control": "public, max-age=31536000, immutable",
} as const;
