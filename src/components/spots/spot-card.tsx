import Link from "next/link";
import { Star, Car, Toilet, Navigation, Gem, Crown, Fish, ShoppingBag } from "lucide-react";
import { ListSpot, SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import { SpotImage } from "@/components/ui/spot-image";
import { resolveSpotImageSrc } from "@/lib/data/spot-image-resolver";
import { FavoriteButton } from "@/components/spots/favorite-button";
import { CompareToggleButton } from "@/components/spots/compare-bar";
import { cn } from "@/lib/utils";

/**
 * 正規スポットカード（UI/UX刷新Phase2: サウナイキタイ式の固定構成）
 *
 * 並び順は全件共通で固定する:
 *   写真（状態タグ: 穴場/高級魚）→ 名称 → 種別・エリア・距離 → スペック行（駐車場/トイレ/料金/難易度）
 *   → 釣れる魚チップ → 指標（評価・魚種数）
 * 影・浮き上がり・写真上のグラデは使わず、枠線と面で区切る。
 */
export function formatDistance(distance: number): string {
  return distance < 1
    ? `${Math.round(distance * 1000)}m`
    : distance < 10
      ? `${distance.toFixed(1)}km`
      : `${Math.round(distance)}km`;
}

function Spec({ ok, icon, label }: { ok: boolean; icon: React.ReactNode; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        ok ? "text-foreground" : "text-muted-foreground/60",
      )}
    >
      {icon}
      {label}
      <span className={ok ? "text-primary" : ""}>{ok ? "○" : "−"}</span>
    </span>
  );
}

export function SpotCard({
  spot,
  distance,
  priority = false,
  rank,
  children,
}: {
  spot: ListSpot;
  distance?: number | null;
  priority?: boolean;
  /** ランキング等の順位（写真左上に表示） */
  rank?: number;
  /** カード下部に足す固有情報（スコア・おすすめ理由など）。カードの骨格は変えずにここへ入れる */
  children?: React.ReactNode;
}) {
  const displayFish = spot.fishNames.slice(0, 3);
  const remainingCount = spot.fishNames.length - 3;

  // stretched-link 方式: カード全体は Link の ::after で覆ってクリック可能にし、
  // お気に入り/比較ボタンは Link の外（z-10）に出す（<a> 内 <button> の不正ネストを解消）。
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40">
      {/* 写真 + 状態タグ */}
      <div className="relative">
        <SpotImage
          src={resolveSpotImageSrc(spot.mainImageUrl)}
          alt={spot.name}
          spotType={spot.spotType}
          height="h-40"
          priority={priority}
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {rank != null && (
            <span className="inline-flex min-w-6 items-center justify-center rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold tabular-nums text-primary-foreground">
              {rank}位
            </span>
          )}
          {spot.isHiddenGem && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-xs font-bold text-foreground">
              <Gem className="size-3 text-primary" aria-hidden="true" />
              穴場
            </span>
          )}
          {spot.hasPremiumFish && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-xs font-bold text-foreground">
              <Crown className="size-3 text-amber-600" aria-hidden="true" />
              高級魚
            </span>
          )}
        </div>
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
          <CompareToggleButton slug={spot.slug} name={spot.name} />
          <FavoriteButton spotSlug={spot.slug} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {/* 名称 */}
        <h3 className="font-display text-base font-bold leading-snug group-hover:text-primary">
          <Link href={`/spots/${spot.slug}`} prefetch={false} className="after:absolute after:inset-0">
            {spot.name}
          </Link>
        </h3>

        {/* 種別 − エリア ・ 距離 */}
        <p className="-mt-1 text-xs text-muted-foreground">
          {SPOT_TYPE_LABELS[spot.spotType]} − {spot.region.prefecture} {spot.region.areaName}
          {distance != null && (
            <span className="ml-1.5 inline-flex items-center gap-0.5 font-bold text-primary">
              <Navigation className="size-3" aria-hidden="true" />約{formatDistance(distance)}
            </span>
          )}
        </p>

        {/* スペック行（アイコン＋○/−） */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs">
          <Spec ok={spot.hasParking} icon={<Car className="size-3.5" aria-hidden="true" />} label="駐車場" />
          <Spec ok={spot.hasToilet} icon={<Toilet className="size-3.5" aria-hidden="true" />} label="トイレ" />
          <span className="font-bold">{spot.isFree ? "無料" : "有料"}</span>
          <span className={spot.difficulty === "beginner" ? "font-bold text-primary" : "text-muted-foreground"}>
            {spot.difficulty === "beginner" ? "初心者OK" : DIFFICULTY_LABELS[spot.difficulty]}
          </span>
          {spot.hasRentalRod && (
            <span className="inline-flex items-center gap-1">
              <Fish className="size-3.5" aria-hidden="true" />
              レンタル竿
            </span>
          )}
          {spot.hasConvenienceStore && (
            <span className="inline-flex items-center gap-1">
              <ShoppingBag className="size-3.5" aria-hidden="true" />
              コンビニ近く
            </span>
          )}
        </div>

        {/* 釣れる魚 */}
        {displayFish.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayFish.map((name) => (
              <span key={name} className="rounded-md border px-1.5 py-0.5 text-xs">
                {name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-1 py-0.5 text-xs text-muted-foreground">+{remainingCount}</span>
            )}
          </div>
        )}

        {/* 指標 */}
        <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="tabular-nums text-sm font-bold text-foreground">{spot.rating.toFixed(1)}</span>
          </span>
          <span>
            釣れる魚 <span className="tabular-nums text-sm font-bold text-foreground">{spot.fishNames.length}</span>種
          </span>
        </div>
        {children && <div className="relative z-10 border-t pt-2 text-xs">{children}</div>}
      </div>
    </article>
  );
}
