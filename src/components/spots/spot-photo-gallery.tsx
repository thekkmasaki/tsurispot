"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, X, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import type { SpotPhoto } from "@/types";

const SPOT_TYPE_DEFAULT_IMAGES: Record<string, { src: string; label: string }> = {
  breakwater: { src: "/images/spot-types/breakwater.svg", label: "堤防" },
  port: { src: "/images/spot-types/port.svg", label: "漁港" },
  beach: { src: "/images/spot-types/surf.svg", label: "サーフ" },
  rocky: { src: "/images/spot-types/rock.svg", label: "磯" },
  river: { src: "/images/spot-types/river.svg", label: "河口・川" },
  pier: { src: "/images/spot-types/pier.svg", label: "桟橋" },
};

const DEFAULT_IMAGE = { src: "/images/spot-types/other.svg", label: "釣りスポット" };

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
    return (
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold sm:mb-4">
          <Camera className="size-5" />
          釣り場の様子
        </h2>
        <div className="relative aspect-video max-w-lg overflow-hidden rounded-lg bg-muted">
          <Image
            src={defaultImg.src}
            alt={`${spotName}（${defaultImg.label}）のイメージ`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/40 to-transparent p-4">
            <p className="text-sm text-white/90">
              {spotName}の写真はまだ登録されていません
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:bg-white"
            >
              <Mail className="size-3.5" />
              写真を投稿する
            </Link>
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
        <Camera className="size-5" />
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
            <X className="size-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="前の写真"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="次の写真"
              >
                <ChevronRight className="size-6" />
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
