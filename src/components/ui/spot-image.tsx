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
    gradient: "from-sky-400 via-blue-500 to-indigo-600",
    icon: Anchor,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-sky-300/20",
  },
  breakwater: {
    gradient: "from-slate-400 via-blue-500 to-sky-600",
    icon: Building2,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-blue-300/20",
  },
  beach: {
    gradient: "from-amber-300 via-orange-400 to-sky-500",
    icon: Waves,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-amber-200/20",
  },
  rocky: {
    gradient: "from-stone-500 via-slate-600 to-blue-700",
    icon: Mountain,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-stone-300/20",
  },
  river: {
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    icon: Droplets,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-emerald-300/20",
  },
  lake: {
    gradient: "from-teal-400 via-cyan-500 to-blue-600",
    icon: Waves,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-teal-300/20",
  },
  managed: {
    gradient: "from-green-400 via-emerald-500 to-teal-600",
    icon: TreePine,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-green-300/20",
  },
  pier: {
    gradient: "from-blue-400 via-indigo-500 to-violet-600",
    icon: Ship,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-indigo-300/20",
  },
  canal: {
    gradient: "from-cyan-400 via-sky-500 to-blue-600",
    icon: Route,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-cyan-300/20",
  },
  estuary: {
    gradient: "from-teal-400 via-emerald-500 to-sky-600",
    icon: Droplets,
    iconColor: "text-white/30",
    pattern: "text-white/[0.06]",
    accentColor: "bg-teal-300/20",
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
}

export function SpotImage({ src, alt, spotType = "port", className = "", height = "h-32", priority = false }: SpotImageProps) {
  const [error, setError] = useState(false);

  // alt属性を説明的に（SEO向上）
  const descriptiveAlt = (alt.includes("釣り場") || alt.includes("釣りスポット")) ? alt : `${alt}の釣り場`;

  // 実際の写真がある場合はそれを表示
  if (src && !error) {
    return (
      <div className={`relative ${height} overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={descriptiveAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
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

      {/* メインコンテンツ */}
      <div className="relative flex h-full flex-col items-center justify-center gap-2">
        <div className="rounded-full bg-white/20 p-3 shadow-lg backdrop-blur-sm">
          <IconComponent className="size-8 text-white/90" />
        </div>
        <span className="max-w-[85%] truncate text-center text-sm font-semibold tracking-wide text-white/90 drop-shadow-sm">
          {descriptiveAlt}
        </span>
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
}

export function FishImage({ src, alt, category = "sea", className = "", height = "h-24 sm:h-28", priority = false }: FishImageProps) {
  const [error, setError] = useState(false);
  const gradient = FISH_GRADIENTS[category] || FISH_GRADIENTS.sea;

  if (!src || error) {
    return (
      <div className={`flex ${height} items-center justify-center bg-gradient-to-br ${gradient} ${className}`}>
        <Fish className="size-10 text-sky-300" />
      </div>
    );
  }

  return (
    <div className={`relative ${height} overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
        loading={priority ? undefined : "lazy"}
        onError={() => setError(true)}
      />
    </div>
  );
}
