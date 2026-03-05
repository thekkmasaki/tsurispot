"use client";

import { useState } from "react";

interface MonthlyHeroImageProps {
  src: string;
  alt: string;
  attribution?: string;
  className?: string;
  imgClassName?: string;
}

/**
 * 月別ガイド用のヒーロー画像コンポーネント。
 * 画像が存在しない（読み込みエラー）場合は何も表示しない。
 */
export function MonthlyHeroImage({
  src,
  alt,
  attribution,
  className = "",
  imgClassName = "h-full w-full object-cover",
}: MonthlyHeroImageProps) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        loading="lazy"
        onError={() => setError(true)}
      />
      {attribution && (
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          {attribution}
        </p>
      )}
    </div>
  );
}
