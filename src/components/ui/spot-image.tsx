"use client";
import Image from "next/image";
import { useState } from "react";
import { Fish } from "lucide-react";

// 魚カテゴリ別のグラデーション
const FISH_GRADIENTS = {
  sea: "from-cyan-50 to-sky-100",
  freshwater: "from-emerald-50 to-green-100",
  brackish: "from-teal-50 to-cyan-100",
} as const;

interface SpotImageProps {
  src?: string;
  alt: string;
  spotType?: string;
  className?: string;
  height?: string;
  latitude?: number;
  longitude?: number;
}

export function SpotImage({ src, alt, spotType = "port", className = "", height = "h-32", latitude, longitude }: SpotImageProps) {
  const [error, setError] = useState(false);

  // 実際の写真がある場合はそれを表示
  if (src && !error) {
    return (
      <div className={`relative ${height} overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // 写真がない場合は Google Maps の埋め込み地図を表示
  if (latitude && longitude) {
    return (
      <div className={`relative ${height} overflow-hidden ${className}`}>
        <iframe
          src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed&t=k`}
          width="100%"
          height="100%"
          style={{ border: 0, position: "absolute", top: 0, left: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${alt}の地図`}
        />
      </div>
    );
  }

  // 座標もない場合のフォールバック
  return (
    <div className={`flex ${height} items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200 ${className}`}>
      <div className="text-center text-primary/40">
        <Fish className="mx-auto size-10" />
        <span className="mt-1 block text-xs">写真準備中</span>
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
}

export function FishImage({ src, alt, category = "sea", className = "", height = "h-24 sm:h-28" }: FishImageProps) {
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
      <Image src={src} alt={alt} fill className="object-cover" onError={() => setError(true)} />
    </div>
  );
}
