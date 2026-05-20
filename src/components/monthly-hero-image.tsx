"use client";

import { useState } from "react";
import Image from "next/image";

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
 * next/image で WebP 変換 + lazy load を自動化 (Phase 6 audit)。
 */
export function MonthlyHeroImage({
  src,
  alt,
  attribution,
  className = "",
  imgClassName = "object-cover",
}: MonthlyHeroImageProps) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <div className={className}>
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className={imgClassName}
          sizes="(max-width: 768px) 100vw, 768px"
          onError={() => setError(true)}
          unoptimized={src.startsWith("http")}
        />
      </div>
      {attribution && (
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          {attribution}
        </p>
      )}
    </div>
  );
}
