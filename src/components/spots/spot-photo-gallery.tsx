"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SpotPhoto } from "@/types";

// Inline SVG icons to avoid Turbopack module resolution issues with lucide-react
const svgProps = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ImagePlusIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M16 5h6" />
      <path d="M19 2v6" />
      <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      <circle cx="9" cy="9" r="2" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FishIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
      <path d="M18 12v.5" />
      <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
      <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" />
      <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" />
    </svg>
  );
}

const SPOT_TYPE_DEFAULT_IMAGES: Record<string, { src: string; label: string }> = {
  breakwater: { src: "/images/spot-types/breakwater.svg", label: "堤防" },
  port: { src: "/images/spot-types/port.svg", label: "漁港" },
  beach: { src: "/images/spot-types/surf.svg", label: "サーフ" },
  rocky: { src: "/images/spot-types/rock.svg", label: "磯" },
  river: { src: "/images/spot-types/river.svg", label: "河口・川" },
  pier: { src: "/images/spot-types/pier.svg", label: "桟橋" },
};

const SPOT_TYPE_FEATURES: Record<string, { emoji: string; features: string[]; scenery: string }> = {
  breakwater: {
    emoji: "🏗️",
    features: ["足場が安定", "柵があり安全", "ファミリー向け"],
    scenery: "コンクリートの堤防から広がる海の景色が楽しめます",
  },
  port: {
    emoji: "⚓",
    features: ["常夜灯あり", "足場が良い", "車横付け可能な場所も"],
    scenery: "漁船が停泊する港の風景の中で釣りが楽しめます",
  },
  beach: {
    emoji: "🏖️",
    features: ["広大な砂浜", "遠投が可能", "サーフキャスティング向き"],
    scenery: "開放的な砂浜と波打ち際の美しい景観が広がります",
  },
  rocky: {
    emoji: "🪨",
    features: ["大物が期待", "潮通し良好", "上級者向け"],
    scenery: "ダイナミックな岩場と磯の自然が広がっています",
  },
  river: {
    emoji: "🌊",
    features: ["汽水域の豊富な魚種", "潮の影響あり", "シーバス好ポイント"],
    scenery: "川と海が交わる独特の水辺環境が見られます",
  },
  pier: {
    emoji: "🌉",
    features: ["水深がある", "足場が安定", "初心者も安心"],
    scenery: "桟橋から見下ろす澄んだ水面が魅力です",
  },
};

const DEFAULT_IMAGE = { src: "/images/spot-types/other.svg", label: "釣りスポット" };

const DEFAULT_FEATURES = {
  emoji: "🎣",
  features: ["多彩な魚種", "自然豊かな環境", "四季の変化を楽しめる"],
  scenery: "自然に囲まれた釣りスポットの景色が楽しめます",
};

interface SpotPhotoGalleryProps {
  photos?: SpotPhoto[];
  spotType: string;
  spotName: string;
}

export function SpotPhotoGallery({ photos, spotType, spotName }: SpotPhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const hasPhotos = photos && photos.length > 0;

  if (!hasPhotos) {
    const defaultImg = SPOT_TYPE_DEFAULT_IMAGES[spotType] || DEFAULT_IMAGE;
    const typeFeatures = SPOT_TYPE_FEATURES[spotType] || DEFAULT_FEATURES;
    return (
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold sm:mb-4">
          <CameraIcon className="size-5" />
          釣り場の様子
        </h2>

        <div className="overflow-hidden rounded-xl border bg-card">
          {/* Type illustration with overlay */}
          <div className="relative aspect-[2/1] sm:aspect-[5/2] overflow-hidden bg-muted">
            <Image
              src={defaultImg.src}
              alt={`${spotName}（${defaultImg.label}）のイメージイラスト`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 backdrop-blur-sm">
                <MapPinIcon className="size-3" />
                {defaultImg.label}タイプ
              </span>
            </div>
          </div>

          {/* Content area */}
          <div className="p-4 sm:p-5">
            {/* Spot type features */}
            <p className="mb-3 text-sm text-muted-foreground">
              {typeFeatures.scenery}
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              {typeFeatures.features.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                >
                  <FishIcon className="size-3 shrink-0" />
                  {feature}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="mb-4 border-t" />

            {/* Photo submission CTA */}
            <div className="flex flex-col items-center gap-3 rounded-lg bg-gradient-to-br from-blue-50 to-sky-50 p-4 text-center dark:from-blue-950/30 dark:to-sky-950/30 sm:flex-row sm:text-left">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <ImagePlusIcon className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {spotName}の写真を募集中！
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  釣り場の雰囲気が伝わる写真をお持ちの方はぜひお寄せください。あなたの写真が釣り仲間の参考になります。
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
              >
                <CameraIcon className="size-4" />
                写真を投稿する
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () => {
    if (lightboxIndex !== null && photos) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };
  const goPrev = () => {
    if (lightboxIndex !== null && photos) {
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold sm:mb-4">
        <CameraIcon className="size-5" />
        釣り場の様子
      </h2>

      {/* Main photo */}
      <button
        type="button"
        className="relative mb-3 aspect-video w-full cursor-pointer overflow-hidden rounded-lg"
        onClick={() => openLightbox(0)}
        aria-label={`${photos[0].alt || spotName}を拡大表示`}
      >
        <Image
          src={photos[0].url}
          alt={photos[0].alt || `${spotName}の写真`}
          fill
          className="object-cover transition-transform hover:scale-105"
          sizes="(max-width: 768px) 100vw, 640px"
          priority
        />
        {photos.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
            1 / {photos.length}
          </span>
        )}
      </button>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              type="button"
              className={`relative shrink-0 h-16 w-24 overflow-hidden rounded-md border-2 transition-all ${
                index === 0 ? "border-primary" : "border-transparent hover:border-primary/50"
              }`}
              onClick={() => openLightbox(index)}
              aria-label={`写真${index + 1}を表示`}
            >
              <Image
                src={photo.url}
                alt={photo.alt || `${spotName}の写真 ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Credits */}
      {photos[0].credit && (
        <p className="mt-1 text-xs text-muted-foreground">
          Photo: {photos[0].credit}
        </p>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
          role="dialog"
          aria-label="写真拡大表示"
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={closeLightbox}
            aria-label="閉じる"
          >
            <XIcon className="size-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="前の写真"
              >
                <ChevronLeftIcon className="size-6" />
              </button>
              <button
                type="button"
                className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="次の写真"
              >
                <ChevronRightIcon className="size-6" />
              </button>
            </>
          )}

          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].alt || `${spotName}の写真`}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
              sizes="90vw"
              priority
            />
            <div className="mt-2 text-center">
              {photos[lightboxIndex].alt && (
                <p className="text-sm text-white/90">{photos[lightboxIndex].alt}</p>
              )}
              {photos[lightboxIndex].credit && (
                <p className="text-xs text-white/60">Photo: {photos[lightboxIndex].credit}</p>
              )}
              <p className="mt-1 text-xs text-white/40">
                {lightboxIndex + 1} / {photos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
