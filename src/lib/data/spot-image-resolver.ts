// スポット画像の表示可否を一元判定するヘルパ（404 / NoFallback 抑止）
//
// 背景: spots-*.ts の mainImageUrl / images[] には、実体が public/ に無いローカル
// パス（欠損 webp/jpg・placeholder 参照）が多数含まれる。各コンポーネントは
// それぞれ独自の inline チェックで src を組み立てていたため、欠損ローカル画像が
// そのまま <img>/next-Image の src になり 404 を量産していた。
//
// このヘルパは missing-spot-images.json（scripts/validate-spot-images.mjs で生成）
// を参照し、欠損・placeholder のローカル画像を最初から除外する。結果、ブラウザは
// 404 GET を出さず、SpotImage の美しいグラデーションプレースホルダーが表示される。
//
// スポット画像を追加/差し替えたら `node scripts/validate-spot-images.mjs` を再実行し
// missing-spot-images.json を更新すること。
import missingList from "./missing-spot-images.json";

const MISSING = new Set<string>(missingList as string[]);

/** ローカル /images/spots/ パスが実体ありとして扱えるか（placeholder/欠損を除外） */
function localImageExists(url: string): boolean {
  return !url.includes("/placeholder") && !MISSING.has(url);
}

/**
 * カード/一覧向け: 従来通り「外部URL or wikimedia ローカル webp」のみ採用し、
 * 欠損ファイルは除外して undefined を返す（= プレースホルダー表示・404なし）。
 */
export function resolveSpotImageSrc(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/images/spots/wikimedia/") && localImageExists(url)) return url;
  return undefined;
}

/**
 * 詳細/月別向け: 従来通り「外部URL or 任意の /images/spots/ ローカル」を採用し、
 * 欠損・placeholder は除外する型ガード。
 */
export function isDisplayableSpotImage(url?: string): url is string {
  if (!url) return false;
  if (url.startsWith("http")) return true;
  if (url.startsWith("/images/spots/") && localImageExists(url)) return true;
  return false;
}
