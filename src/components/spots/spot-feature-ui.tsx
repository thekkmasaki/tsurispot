// 「特徴から探す」の共通UI（サウナイキタイの施設カード・特徴チップ・地方別都道府県グリッドを参考）
// すべて Server Component。SpotImage のみ Client（画像エラー時のフォールバック用）。
import Link from "next/link";
import {
  Toilet,
  Users,
  Sprout,
  Wallet,
  Car,
  Moon,
  MoveUpRight,
  Fish,
  Waves,
  Package,
  Store,
  ShoppingBag,
  Check,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { SpotImage } from "@/components/ui/spot-image";
import { resolveSpotImageSrc } from "@/lib/data/spot-image-resolver";
import { SPOT_TYPE_LABELS, type FishingSpot } from "@/types";
import type { Prefecture } from "@/lib/data/prefectures";
import type { SpotFeature, SpotFeatureIcon } from "@/lib/data/spot-features";
import { cn } from "@/lib/utils";

export const FEATURE_ICONS: Record<SpotFeatureIcon, LucideIcon> = {
  toilet: Toilet,
  family: Users,
  beginner: Sprout,
  free: Wallet,
  parking: Car,
  night: Moon,
  casting: MoveUpRight,
  lure: Fish,
  chum: Waves,
  rental: Package,
  shop: Store,
  store: ShoppingBag,
};

/** 特徴チップの一覧。prefSlug を渡すとその県の特徴ページへリンクする */
export function FeatureChipGrid({
  items,
  prefSlug,
  activeSlug,
  className,
}: {
  items: { feature: SpotFeature; count?: number }[];
  prefSlug?: string;
  activeSlug?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {items.map(({ feature, count }) => {
        const Icon = FEATURE_ICONS[feature.icon];
        const active = feature.slug === activeSlug;
        return (
          <Link
            key={feature.slug}
            prefetch={false}
            href={prefSlug ? `/spot-feature/${feature.slug}/${prefSlug}` : `/spot-feature/${feature.slug}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[48px] items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-sky-700 bg-sky-700 text-white"
                : "bg-card hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                active ? "bg-white/20" : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate">{feature.label}</span>
            {count != null && (
              <span className={cn("text-xs tabular-nums", active ? "text-white/80" : "text-muted-foreground")}>
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

const REGION_ORDER = ["北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州・沖縄"];

/** 地方ごとにまとめた都道府県リンク。count が MIN 未満の県はリンクなし（グレー表示） */
export function RegionPrefGrid({
  items,
  hrefFor,
  minCount = 1,
}: {
  items: { pref: Prefecture; count: number }[];
  hrefFor: (pref: Prefecture) => string;
  minCount?: number;
}) {
  return (
    <div className="divide-y rounded-2xl border bg-card">
      {REGION_ORDER.map((region) => {
        const prefs = items.filter((x) => x.pref.regionGroup === region);
        if (prefs.length === 0) return null;
        return (
          <div key={region} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start sm:gap-4 sm:p-4">
            <p className="w-24 shrink-0 text-sm font-bold text-sky-800 dark:text-sky-300">{region}</p>
            <div className="flex flex-wrap gap-x-1 gap-y-1">
              {prefs.map(({ pref, count }) =>
                count >= minCount ? (
                  <Link
                    key={pref.slug}
                    prefetch={false}
                    href={hrefFor(pref)}
                    className="rounded-full px-2.5 py-1 text-sm hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950/30"
                  >
                    {pref.nameShort}
                    <span className="ml-1 text-xs text-muted-foreground tabular-nums">{count}</span>
                  </Link>
                ) : (
                  <span key={pref.slug} className="px-2.5 py-1 text-sm text-muted-foreground/60">
                    {pref.nameShort}
                    <span className="ml-1 text-xs tabular-nums">{count}</span>
                  </span>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const DIFFICULTY_SHORT: Record<FishingSpot["difficulty"], string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
  all: "全レベル",
};

function SpecCell({ label, ok, value }: { label: string; ok?: boolean; value?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      {value ? (
        <span className="text-xs font-bold">{value}</span>
      ) : ok ? (
        <Check className="size-4 text-emerald-600" aria-label="あり" />
      ) : (
        <Minus className="size-4 text-muted-foreground/50" aria-label="なし・不明" />
      )}
    </div>
  );
}

/**
 * スペック表つきスポットカード。サウナイキタイの施設カード（温度・水風呂・外気浴を一目で比較）を参考に、
 * 釣り場選びで効く「トイレ・駐車場・料金・難易度」を同じ位置に並べて比較しやすくする。
 */
export function SpotSpecCard({ spot }: { spot: FishingSpot }) {
  const fish = Array.from(new Set(spot.catchableFish.map((c) => c.fish.name))).slice(0, 4);
  return (
    <article className="group relative flex gap-3 overflow-hidden rounded-2xl border bg-card p-3 transition-shadow hover:shadow-md sm:p-4">
      <div className="w-24 shrink-0 overflow-hidden rounded-xl sm:w-32">
        <SpotImage
          src={resolveSpotImageSrc(spot.mainImageUrl)}
          alt={spot.name}
          spotType={spot.spotType}
          height="h-24 sm:h-28"
          sizes="128px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold leading-snug group-hover:text-sky-700 sm:text-base">
            <Link prefetch={false} href={`/spots/${spot.slug}`} className="after:absolute after:inset-0">
              {spot.name}
            </Link>
          </h3>
          <span className="shrink-0 rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
            {SPOT_TYPE_LABELS[spot.spotType]}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {spot.region.prefecture} {spot.region.areaName}
        </p>
        <div className="mt-2 grid grid-cols-4 divide-x rounded-lg border bg-muted/30">
          <SpecCell label="トイレ" ok={spot.hasToilet} />
          <SpecCell label="駐車場" ok={spot.hasParking} />
          <SpecCell label="料金" value={spot.isFree ? "無料" : "有料"} />
          <SpecCell label="難易度" value={DIFFICULTY_SHORT[spot.difficulty]} />
        </div>
        {fish.length > 0 && (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground">釣れる魚</span>　{fish.join("・")}
          </p>
        )}
      </div>
    </article>
  );
}
