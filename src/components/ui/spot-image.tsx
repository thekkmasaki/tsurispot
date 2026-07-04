"use client";
import Image from "next/image";
import { useState } from "react";
import {
  Fish,
  Anchor,
  Waves,
  TreePine,
  Mountain,
  Droplets,
  Building2,
  Ship,
  Route,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 魚カテゴリ別のグラデーション
const FISH_GRADIENTS = {
  sea: "from-cyan-50 to-sky-100",
  freshwater: "from-emerald-50 to-green-100",
  brackish: "from-teal-50 to-cyan-100",
} as const;

// プレースホルダー用グラデーション: ブランドパレット3系統に集約
// （明度は 淡→中→深 のスイープで統一し、多色グラデによる配色のばらつきを排除）
const PLACEHOLDER_GRADIENTS = {
  // 海系（漁港・堤防・桟橋・運河）
  ocean: "from-ocean-mid to-ocean-deep",
  // 淡水・緑系（河川・湖・管理釣り場・河口）
  foam: "from-sea-foam via-ocean-mid to-ocean-deep",
  // 砂浜・磯系
  sand: "from-sand-light via-driftwood to-ocean-deep",
} as const;

// スポットタイプ別のデザイン設定
const SPOT_TYPE_STYLES: Record<
  string,
  {
    gradient: string;
    icon: LucideIcon;
    iconColor: string;
    pattern: string;
    accentColor: string;
  }
> = {
  port: {
    gradient: PLACEHOLDER_GRADIENTS.ocean,
    icon: Anchor,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sea-foam/20",
  },
  breakwater: {
    gradient: PLACEHOLDER_GRADIENTS.ocean,
    icon: Building2,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sea-foam/20",
  },
  beach: {
    gradient: PLACEHOLDER_GRADIENTS.sand,
    icon: Waves,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sunset-gold/20",
  },
  rocky: {
    gradient: PLACEHOLDER_GRADIENTS.sand,
    icon: Mountain,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sunset-gold/20",
  },
  river: {
    gradient: PLACEHOLDER_GRADIENTS.foam,
    icon: Droplets,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sea-foam/25",
  },
  lake: {
    gradient: PLACEHOLDER_GRADIENTS.foam,
    icon: Waves,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sea-foam/25",
  },
  managed: {
    gradient: PLACEHOLDER_GRADIENTS.foam,
    icon: TreePine,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sea-foam/25",
  },
  pier: {
    gradient: PLACEHOLDER_GRADIENTS.ocean,
    icon: Ship,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sea-foam/20",
  },
  canal: {
    gradient: PLACEHOLDER_GRADIENTS.ocean,
    icon: Route,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sea-foam/20",
  },
  estuary: {
    gradient: PLACEHOLDER_GRADIENTS.foam,
    icon: Droplets,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sea-foam/25",
  },
};

const DEFAULT_STYLE = SPOT_TYPE_STYLES.port;

interface SpotImageProps {
  src?: string;
  alt: string;
  spotType?: string;
  className?: string;
  height?: string;
  priority?: boolean;
  sizes?: string;
}

export function SpotImage({ src, alt, spotType = "port", className = "", height = "h-32", priority = false, sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" }: SpotImageProps) {
  const [error, setError] = useState(false);

  // alt属性を説明的に（SEO向上）
  const descriptiveAlt = (alt.includes("釣り場") || alt.includes("釣りスポット")) ? alt : `${alt}の釣り場`;

  // height propがデフォルト値の場合のみaspect-ratioを付与（明示的にheightが渡されていれば従来通り）
  const aspectStyle = height === "h-32" ? { aspectRatio: "16/10" } : undefined;

  // 実際の写真がある場合はそれを表示
  if (src && !error) {
    return (
      <div className={`relative ${height} overflow-hidden ${className}`} style={aspectStyle}>
        <Image
          src={src}
          alt={descriptiveAlt}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // 写真がない場合はスポットタイプに応じた美しいプレースホルダーを表示
  const style = SPOT_TYPE_STYLES[spotType] || DEFAULT_STYLE;
  const IconComponent = style.icon;

  return (
    <div
      className={`relative ${height} overflow-hidden bg-gradient-to-br ${style.gradient} ${className}`}
      style={aspectStyle}
    >
      {/* 装飾パターン - 背景に散らばるアイコン */}
      <div className="absolute inset-0 overflow-hidden">
        <IconComponent
          className={`absolute -top-4 -right-4 size-24 rotate-12 ${style.pattern}`}
        />
        <IconComponent
          className={`absolute -bottom-3 -left-3 size-20 -rotate-12 ${style.pattern}`}
        />
        <IconComponent
          className={`absolute top-1/3 left-1/5 size-12 rotate-45 ${style.pattern}`}
        />
        <IconComponent
          className={`absolute bottom-1/4 right-1/4 size-8 -rotate-6 ${style.pattern}`}
        />
      </div>

      {/* 光のアクセント */}
      <div
        className={`absolute -top-8 -right-8 size-28 rounded-full ${style.accentColor} blur-2xl`}
      />
      <div
        className={`absolute -bottom-6 -left-6 size-24 rounded-full ${style.accentColor} blur-xl`}
      />

      {/* メインコンテンツ（スポット名はカードタイトルと重複するため表示しない） */}
      <div className="relative flex h-full flex-col items-center justify-center gap-2">
        <div className="rounded-full bg-white/20 p-3 shadow-lg backdrop-blur-sm">
          <IconComponent className="size-8 text-white/90" />
        </div>
      </div>
    </div>
  );
}

interface FishImageProps {
  src?: string;
  alt: string;
  category?: keyof typeof FISH_GRADIENTS;
  className?: string;
  height?: string;
  priority?: boolean;
  sizes?: string;
}

export function FishImage({ src, alt, category = "sea", className = "", height = "h-24 sm:h-28", priority = false, sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" }: FishImageProps) {
  const [error, setError] = useState(false);
  const gradient = FISH_GRADIENTS[category] || FISH_GRADIENTS.sea;

  // height propがデフォルト値の場合のみaspect-ratioを付与
  const aspectStyle = height === "h-24 sm:h-28" ? { aspectRatio: "16/10" } : undefined;

  if (!src || error) {
    return (
      <div className={`flex ${height} items-center justify-center bg-gradient-to-br ${gradient} ${className}`} style={aspectStyle}>
        <Fish className="size-10 text-sky-300" />
      </div>
    );
  }

  return (
    <div className={`relative ${height} overflow-hidden ${className}`} style={aspectStyle}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        onError={() => setError(true)}
      />
    </div>
  );
}
